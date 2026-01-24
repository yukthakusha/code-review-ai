import React, { useState, useEffect } from 'react';
import { Clock, FileText } from 'lucide-react';
import apiService from '../services/api';

interface HistoryItem {
  id: number;
  repository_name: string;
  repository_url: string;
  results: {
    summary: {
      total_files_analyzed: number;
      total_issues: number;
      severity_breakdown: Record<string, number>;
    };
  };
  created_at: string;
}

const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await apiService.getHistory();
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQualityGateStatus = (totalIssues: number) => {
    return totalIssues > 5 ? 'FAILED' : 'PASSED';
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading">Loading analysis history...</div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>Analysis History</h2>
        <p>Recent code quality analyses</p>
      </div>

      {history.length === 0 ? (
        <div className="empty-history">
          <FileText size={48} />
          <h3>No analyses yet</h3>
          <p>Start by analyzing a repository to see your history here.</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => {
            const totalIssues = item.results.summary.total_issues;
            const qualityGate = getQualityGateStatus(totalIssues);
            
            return (
              <div key={item.id} className="history-item">
                <div className="history-item-header">
                  <div className="repo-info">
                    <h3>{item.repository_name}</h3>
                    <div className="timestamp">
                      <Clock size={14} />
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                  <div className={`quality-gate-badge ${qualityGate.toLowerCase()}`}>
                    {qualityGate}
                  </div>
                </div>
                
                <div className="history-stats">
                  <div className="stat-item">
                    <span className="stat-number">{item.results.summary.total_files_analyzed}</span>
                    <span className="stat-label">Files</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{totalIssues}</span>
                    <span className="stat-label">Issues</span>
                  </div>
                  <div className="severity-breakdown">
                    {Object.entries(item.results.summary.severity_breakdown).map(([severity, count]) => (
                      count > 0 && (
                        <span key={severity} className={`severity-badge ${severity}`}>
                          {count} {severity}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;