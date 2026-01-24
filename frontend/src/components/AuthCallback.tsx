import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import apiService from '../services/api';

const AuthCallback: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          console.log('Processing OAuth callback with code:', code);
          const response = await apiService.exchangeCodeForToken(code);
          console.log('Token exchange response:', response.data);
          
          if (response.data.success && response.data.token) {
            localStorage.setItem('github_token', response.data.token);
            console.log('Token saved to localStorage');
            // Clear the URL and redirect
            window.history.replaceState({}, document.title, '/');
            window.location.reload();
          } else {
            console.error('Token exchange failed:', response.data);
            window.location.href = '/';
          }
        } catch (error) {
          console.error('Authentication failed:', error);
          window.location.href = '/';
        }
      }
    };

    handleCallback();
  }, [location]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      color: '#e6edf3'
    }}>
      <div>Authenticating with GitHub...</div>
    </div>
  );
};

export default AuthCallback;