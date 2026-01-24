import React, { useState, useEffect } from 'react';
import { Code, Github, User } from 'lucide-react';
import apiService from '../services/api';

interface UserData {
  username: string;
  avatar_url: string;
}

const Header: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    
    // Listen for storage changes (when token is set)
    const handleStorageChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', checkAuthStatus);
    };
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('github_token');
    console.log('Checking auth status, token:', token ? 'exists' : 'missing');
    
    if (token) {
      try {
        const response = await apiService.getUser();
        console.log('User data:', response.data);
        setUser(response.data);
        setIsConnected(true);
      } catch (error) {
        console.log('Auth check failed:', error);
        localStorage.removeItem('github_token');
        setIsConnected(false);
        setUser(null);
      }
    } else {
      setIsConnected(false);
      setUser(null);
    }
  };

  const handleGitHubConnect = async () => {
    try {
      console.log('Attempting to connect to GitHub...');
      const response = await apiService.getGitHubAuthUrl();
      console.log('GitHub auth URL response:', response.data);
      console.log('Redirecting to:', response.data.authUrl);
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Failed to get GitHub auth URL:', error);
      alert('Failed to connect to GitHub. Check console for details.');
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('github_token');
    setUser(null);
    setIsConnected(false);
    window.location.reload();
  };

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Code size={24} />
          <h1>CodeReview AI</h1>
        </div>
        <nav>
          {isConnected && user ? (
            <div className="user-nav">
              <div className="user-info">
                <img src={user.avatar_url} alt={user.username} className="user-avatar" />
                <span>{user.username}</span>
              </div>
              <button className="nav-btn disconnect" onClick={handleDisconnect}>
                Disconnect
              </button>
            </div>
          ) : (
            <button className="nav-btn" onClick={handleGitHubConnect}>
              <Github size={16} />
              Connect GitHub
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;