import React, { useState, useEffect } from 'react';
import { Search, GitBranch, Play } from 'lucide-react';
import { Repository } from '../App';
import apiService from '../services/api';

interface Props {
  onRepoSelect: (repo: Repository) => void;
  selectedRepo: Repository | null;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const RepositorySelector: React.FC<Props> = ({ 
  onRepoSelect, 
  selectedRepo, 
  onAnalyze, 
  isAnalyzing 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('github_token');
    if (token) {
      setIsAuthenticated(true);
      fetchRepositories();
    } else {
      // Use mock data if not authenticated
      const mockRepos: Repository[] = [
        { id: 1, name: 'my-react-app', full_name: 'user/my-react-app', html_url: 'https://github.com/user/my-react-app' },
        { id: 2, name: 'backend-api', full_name: 'user/backend-api', html_url: 'https://github.com/user/backend-api' },
        { id: 3, name: 'utils-library', full_name: 'user/utils-library', html_url: 'https://github.com/user/utils-library' }
      ];
      setRepositories(mockRepos);
    }
  }, []);

  const fetchRepositories = async () => {
    setLoading(true);
    try {
      const response = await apiService.getRepositories();
      setRepositories(response.data);
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      // Fallback to mock data
      const mockRepos: Repository[] = [
        { id: 1, name: 'my-react-app', full_name: 'user/my-react-app', html_url: 'https://github.com/user/my-react-app' },
        { id: 2, name: 'backend-api', full_name: 'user/backend-api', html_url: 'https://github.com/user/backend-api' },
        { id: 3, name: 'utils-library', full_name: 'user/utils-library', html_url: 'https://github.com/user/utils-library' }
      ];
      setRepositories(mockRepos);
    } finally {
      setLoading(false);
    }
  };

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="repo-selector">
      <div className="search-section">
        <h2>Select Repository</h2>
        <div className="search-input">
          <Search size={16} />
          <input
            type="text"
            placeholder="Filter repositories"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="repo-list">
        {filteredRepos.map(repo => (
          <div
            key={repo.id}
            className={`repo-item ${selectedRepo?.id === repo.id ? 'selected' : ''}`}
            onClick={() => onRepoSelect(repo)}
          >
            <GitBranch size={16} />
            <div className="repo-info">
              <h3>{repo.name}</h3>
              <p>{repo.full_name}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedRepo && (
        <div className="analyze-section">
          <div className="selected-repo">
            <h3>Selected: {selectedRepo.name}</h3>
          </div>
          <button
            className="analyze-btn"
            onClick={onAnalyze}
            disabled={isAnalyzing}
          >
            <Play size={16} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      )}
    </div>
  );
};

export default RepositorySelector;