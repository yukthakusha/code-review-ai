import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://your-backend-url.railway.app/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('github_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Health check
  healthCheck: () => api.get('/health'),

  // Authentication
  getGitHubAuthUrl: () => api.get('/auth/github'),
  exchangeCodeForToken: (code: string) => api.post('/auth/github/callback', { code }),

  // User management
  getUser: () => api.get('/user'),
  getUserStats: () => api.get('/user/stats'),

  // Repositories
  getRepositories: () => api.get('/repositories'),
  getRepositoryFiles: (owner: string, repo: string) => 
    api.get(`/repositories/${owner}/${repo}/files`),
  getFileContent: (owner: string, repo: string, path: string) => 
    api.get(`/repositories/${owner}/${repo}/content?path=${encodeURIComponent(path)}`),

  // Analysis
  analyzeRepository: (repositoryId: number, owner: string, repo: string) => 
    api.post('/analyze', { repositoryId, owner, repo }),

  // History
  getHistory: () => api.get('/history'),
};

export default apiService;