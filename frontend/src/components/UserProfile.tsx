import React, { useState, useEffect } from 'react';
import { User, BarChart3, Calendar, GitBranch } from 'lucide-react';
import apiService from '../services/api';

interface UserData {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  github_id: number;
  created_at: string;
}

interface UserStats {
  total_analyses: number;
  analyses_this_week: number;
  analyses_this_month: number;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [userResponse, statsResponse] = await Promise.all([
        apiService.getUser(),
        apiService.getUserStats()
      ]);
      
      setUser(userResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="user-profile loading">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-profile error">
        <User size={48} />
        <h3>Profile not found</h3>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="avatar">
          <img src={user.avatar_url} alt={user.username} />
        </div>
        <div className="user-info">
          <h2>{user.username}</h2>
          <p className="email">{user.email}</p>
          <p className="join-date">
            <Calendar size={16} />
            Joined {formatDate(user.created_at)}
          </p>
        </div>
      </div>

      {stats && (
        <div className="profile-stats">
          <h3>
            <BarChart3 size={20} />
            Analysis Statistics
          </h3>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.total_analyses}</div>
              <div className="stat-label">Total Analyses</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">{stats.analyses_this_month}</div>
              <div className="stat-label">This Month</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">{stats.analyses_this_week}</div>
              <div className="stat-label">This Week</div>
            </div>
          </div>
        </div>
      )}

      <div className="profile-actions">
        <a 
          href={`https://github.com/${user.username}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="github-link"
        >
          <GitBranch size={16} />
          View GitHub Profile
        </a>
      </div>
    </div>
  );
};

export default UserProfile;