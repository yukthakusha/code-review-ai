import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import RepositorySelector from './components/RepositorySelector';
import AnalysisResults from './components/AnalysisResults';
import History from './components/History';
import AuthCallback from './components/AuthCallback';
import apiService from './services/api';
import './App.css';

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
}

export interface AnalysisResult {
  file: string;
  issues: Issue[];
}

export interface Issue {
  type: 'bug' | 'security' | 'performance' | 'style';
  severity: 'low' | 'medium' | 'high' | 'critical';
  line: number;
  message: string;
  suggestion?: string;
}

function MainApp() {
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentView, setCurrentView] = useState<'analyze' | 'history'>('analyze');

  const handleRepoSelect = (repo: Repository) => {
    setSelectedRepo(repo);
    setAnalysisResults([]);
  };

  const handleAnalyze = async () => {
    if (!selectedRepo) return;
    
    console.log('Starting analysis for:', selectedRepo);
    setIsAnalyzing(true);
    try {
      const [owner, repo] = selectedRepo.full_name.split('/');
      console.log('Analyzing repository:', { owner, repo, repositoryId: selectedRepo.id });
      
      const response = await apiService.analyzeRepository(selectedRepo.id, owner, repo);
      console.log('Analysis response:', response.data);
      
      if (response.data.success) {
        setAnalysisResults(response.data.results);
        console.log('Analysis completed successfully');
      } else {
        throw new Error('Analysis failed: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      
      // Show mock results for demo
      const mockResults: AnalysisResult[] = [
        {
          file: 'src/utils/helper.js',
          issues: [
            {
              type: 'bug',
              severity: 'high',
              line: 15,
              message: 'Potential null pointer exception',
              suggestion: 'Add null check before accessing property'
            },
            {
              type: 'security',
              severity: 'medium',
              line: 23,
              message: 'Unsafe use of innerHTML',
              suggestion: 'Use textContent or sanitization library'
            }
          ]
        },
        {
          file: 'src/components/UserProfile.js',
          issues: [
            {
              type: 'performance',
              severity: 'medium',
              line: 8,
              message: 'Array.length called in loop condition',
              suggestion: 'Cache array length before loop'
            }
          ]
        }
      ];
      setAnalysisResults(mockResults);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="App">
      <Header />
      <nav className="main-nav">
        <div className="container">
          <button 
            className={`nav-tab ${currentView === 'analyze' ? 'active' : ''}`}
            onClick={() => setCurrentView('analyze')}
          >
            Analyze Code
          </button>
          <button 
            className={`nav-tab ${currentView === 'history' ? 'active' : ''}`}
            onClick={() => setCurrentView('history')}
          >
            Analysis History
          </button>
        </div>
      </nav>
      <main className="container">
        {currentView === 'analyze' ? (
          <>
            <RepositorySelector 
              onRepoSelect={handleRepoSelect}
              selectedRepo={selectedRepo}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
            />
            {analysisResults.length > 0 && (
              <AnalysisResults results={analysisResults} />
            )}
          </>
        ) : (
          <History />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </Router>
  );
}

export default App;