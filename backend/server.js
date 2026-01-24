const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Octokit } = require('@octokit/rest');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
const db = require('./database');

// Middleware
app.use(cors());
app.use(express.json());

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

// GitHub OAuth routes
app.get('/api/auth/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo`;
  res.json({ authUrl: githubAuthUrl });
});

app.post('/api/auth/github/callback', async (req, res) => {
  const { code } = req.body;
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log('Token response:', tokenData);
    
    if (tokenData.access_token) {
      // Get user info from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/json',
        },
      });
      
      const userData = await userResponse.json();
      console.log('User data from GitHub:', userData);
      
      // Validate user data
      if (!userData.login || !userData.id) {
        console.error('Invalid user data from GitHub:', userData);
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid user data from GitHub' 
        });
      }
      
      // Save or update user in database
      const user = await saveOrUpdateUser(userData, tokenData.access_token);
      
      res.json({ 
        success: true, 
        token: tokenData.access_token,
        user: {
          id: user.id,
          username: userData.login,
          avatar_url: userData.avatar_url,
          email: userData.email
        }
      });
    } else {
      console.error('No access token in response:', tokenData);
      res.status(400).json({ 
        success: false, 
        error: 'Failed to get access token: ' + (tokenData.error_description || tokenData.error || 'Unknown error')
      });
    }
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Authentication failed: ' + error.message 
    });
  }
});

// Helper function to save or update user
function saveOrUpdateUser(userData, accessToken) {
  return new Promise((resolve, reject) => {
    // Validate required fields
    if (!userData.login || !userData.id) {
      reject(new Error('Missing required user data: login or id'));
      return;
    }
    
    console.log('Saving user:', { id: userData.id, login: userData.login, email: userData.email });
    
    // Check if user exists
    db.get(
      'SELECT * FROM users WHERE github_id = ?',
      [userData.id],
      (err, existingUser) => {
        if (err) {
          console.error('Database error checking user:', err);
          reject(err);
          return;
        }
        
        if (existingUser) {
          // Update existing user
          db.run(
            `UPDATE users SET username = ?, email = ?, avatar_url = ?, access_token = ? WHERE github_id = ?`,
            [userData.login, userData.email || null, userData.avatar_url || null, accessToken, userData.id],
            function(err) {
              if (err) {
                console.error('Database error updating user:', err);
                reject(err);
              } else {
                console.log('User updated successfully');
                resolve({ id: existingUser.id, ...userData });
              }
            }
          );
        } else {
          // Create new user
          db.run(
            `INSERT INTO users (github_id, username, email, avatar_url, access_token) VALUES (?, ?, ?, ?, ?)`,
            [userData.id, userData.login, userData.email || null, userData.avatar_url || null, accessToken],
            function(err) {
              if (err) {
                console.error('Database error creating user:', err);
                reject(err);
              } else {
                console.log('User created successfully with ID:', this.lastID);
                resolve({ id: this.lastID, ...userData });
              }
            }
          );
        }
      }
    );
  });
}

// Get current user info
app.get('/api/user', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Get user from GitHub API
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    if (!userResponse.ok) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const userData = await userResponse.json();
    
    // Get user from database
    db.get(
      'SELECT * FROM users WHERE github_id = ?',
      [userData.id],
      (err, user) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (user) {
          res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            avatar_url: user.avatar_url,
            github_id: user.github_id,
            created_at: user.created_at
          });
        } else {
          res.status(404).json({ error: 'User not found' });
        }
      }
    );
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

// Get user's analysis statistics
app.get('/api/user/stats', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Get user ID from token
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    const userData = await userResponse.json();
    
    // Get user from database
    db.get(
      'SELECT id FROM users WHERE github_id = ?',
      [userData.id],
      (err, user) => {
        if (err || !user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        // Get analysis statistics
        db.all(
          `SELECT 
            COUNT(*) as total_analyses,
            COUNT(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 END) as analyses_this_week,
            COUNT(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 END) as analyses_this_month
          FROM analysis_results 
          WHERE user_id = ?`,
          [user.id],
          (err, stats) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to fetch stats' });
            }
            
            res.json(stats[0] || {
              total_analyses: 0,
              analyses_this_week: 0,
              analyses_this_month: 0
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Repository routes
app.get('/api/repositories', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const octokit = new Octokit({ auth: token });
    
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 50,
    });

    const formattedRepos = repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      html_url: repo.html_url,
      private: repo.private,
      language: repo.language,
      updated_at: repo.updated_at,
    }));

    res.json(formattedRepos);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// Analyze repository
app.post('/api/analyze', async (req, res) => {
  const { repositoryId, owner, repo } = req.body;
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  console.log('Analysis request received:', { repositoryId, owner, repo, hasToken: !!token });
  
  let userId = null;
  
  // Get user ID if token is provided
  if (token) {
    try {
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const user = await new Promise((resolve, reject) => {
          db.get('SELECT id FROM users WHERE github_id = ?', [userData.id], (err, user) => {
            if (err) reject(err);
            else resolve(user);
          });
        });
        userId = user?.id;
      }
    } catch (error) {
      console.log('Could not get user ID:', error.message);
    }
  }
  
  // Enhanced mock results for demo
  const mockResults = [
    {
      file: 'src/components/App.js',
      issues: [
        {
          type: 'bug',
          severity: 'high',
          line: 15,
          message: 'Potential null pointer exception when accessing user.profile',
          suggestion: 'Add null check before accessing nested properties',
          solution: "// Safe property access:\nif (user && user.profile) {\n  // Access user.profile safely\n} \n// Or use optional chaining:\nuser?.profile?.name"
        },
        {
          type: 'security',
          severity: 'medium',
          line: 23,
          message: 'Unsafe use of innerHTML without sanitization',
          suggestion: 'Use textContent or DOMPurify for HTML sanitization',
          solution: "// Safe alternatives:\nelement.textContent = userInput; // For text\n// Or for HTML:\nelement.innerHTML = DOMPurify.sanitize(userInput);"
        }
      ]
    },
    {
      file: 'src/utils/helper.js',
      issues: [
        {
          type: 'performance',
          severity: 'medium',
          line: 8,
          message: 'Array.length called in loop condition - performance impact',
          suggestion: 'Cache array length before loop for better performance',
          solution: "// Optimized loop:\nconst len = items.length;\nfor (let i = 0; i < len; i++) {\n  // Process items[i]\n}"
        },
        {
          type: 'bug',
          severity: 'medium',
          line: 12,
          message: 'parseInt without radix parameter',
          suggestion: 'Always specify radix to avoid unexpected results',
          solution: "// Replace: parseInt(value)\n// With: parseInt(value, 10) for decimal numbers"
        }
      ]
    }
  ];

  const analysisResult = {
    success: true,
    results: mockResults,
    summary: {
      total_files_analyzed: 2,
      total_issues: 4,
      severity_breakdown: { low: 0, medium: 3, high: 1, critical: 0 },
      type_breakdown: { bug: 2, security: 1, performance: 1, style: 0 }
    },
    analyzedAt: new Date().toISOString(),
  };

  // Save to database with user context
  try {
    db.run(
      `INSERT INTO analysis_results (user_id, repository_name, repository_url, results, created_at) VALUES (?, ?, ?, ?, ?)`,
      [userId, `${owner}/${repo}`, `https://github.com/${owner}/${repo}`, JSON.stringify(analysisResult), new Date().toISOString()],
      function(err) {
        if (err) console.error('Error saving analysis:', err);
        else console.log('Analysis saved with ID:', this.lastID);
      }
    );
  } catch (dbError) {
    console.error('Database error:', dbError);
  }

  res.json(analysisResult);
});

// Get analysis history
app.get('/api/history', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  let userId = null;
  
  // Get user ID if token is provided
  if (token) {
    try {
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const user = await new Promise((resolve, reject) => {
          db.get('SELECT id FROM users WHERE github_id = ?', [userData.id], (err, user) => {
            if (err) reject(err);
            else resolve(user);
          });
        });
        userId = user?.id;
      }
    } catch (error) {
      console.log('Could not get user ID for history:', error.message);
    }
  }
  
  try {
    let query = 'SELECT * FROM analysis_results';
    let params = [];
    
    if (userId) {
      query += ' WHERE user_id = ? OR user_id IS NULL';
      params.push(userId);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 20';
    
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Error fetching history:', err);
        res.status(500).json({ error: 'Failed to fetch analysis history' });
      } else {
        const history = rows.map(row => ({
          id: row.id,
          repository_name: row.repository_name,
          repository_url: row.repository_url,
          results: JSON.parse(row.results),
          created_at: row.created_at,
          user_id: row.user_id
        }));
        res.json(history);
      }
    });
  } catch (error) {
    console.error('Error in history endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch analysis history' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});