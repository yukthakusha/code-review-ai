import React, { useState } from 'react';
import { AlertTriangle, Bug, Shield, Zap, FileText, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { AnalysisResult, Issue } from '../App';

interface Props {
  results: AnalysisResult[];
}

const AnalysisResults: React.FC<Props> = ({ results }) => {
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [copiedSolutions, setCopiedSolutions] = useState<Set<string>>(new Set());

  const getIssueIcon = (type: Issue['type']) => {
    switch (type) {
      case 'bug': return <Bug size={16} />;
      case 'security': return <Shield size={16} />;
      case 'performance': return <Zap size={16} />;
      case 'style': return <FileText size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const getSeverityClass = (severity: Issue['severity']) => {
    return `severity-${severity}`;
  };

  const toggleIssueExpansion = (issueId: string) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(issueId)) {
      newExpanded.delete(issueId);
    } else {
      newExpanded.add(issueId);
    }
    setExpandedIssues(newExpanded);
  };

  const copySolution = async (solution: string, issueId: string) => {
    try {
      await navigator.clipboard.writeText(solution);
      setCopiedSolutions(prev => new Set(prev).add(issueId));
      setTimeout(() => {
        setCopiedSolutions(prev => {
          const newSet = new Set(prev);
          newSet.delete(issueId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy solution:', err);
    }
  };

  const totalIssues = results.reduce((sum, result) => sum + result.issues.length, 0);

  return (
    <div className="analysis-results">
      <div className="results-header">
        <h2>Analysis Results</h2>
        <div className="stats">
          <div className="stat">
            <span className="stat-number">{results.length}</span>
            <span className="stat-label">Files</span>
          </div>
          <div className="stat">
            <span className="stat-number">{totalIssues}</span>
            <span className="stat-label">Issues</span>
          </div>
        </div>
      </div>

      {totalIssues > 0 && (
        <div className={`quality-gate ${totalIssues > 5 ? 'failed' : 'passed'}`}>
          <strong>Quality Gate: {totalIssues > 5 ? 'FAILED' : 'PASSED'}</strong>
        </div>
      )}

      <div className="results-list">
        {results.map((result, index) => (
          <div key={index} className="file-result">
            <div className="file-header">
              <FileText size={20} />
              <h3>{result.file}</h3>
              <span className="issue-count">{result.issues.length} issues</span>
            </div>

            <div className="issues-list">
              {result.issues.map((issue, issueIndex) => {
                const issueId = `${index}-${issueIndex}`;
                const isExpanded = expandedIssues.has(issueId);
                const isCopied = copiedSolutions.has(issueId);
                
                return (
                  <div key={issueIndex} className={`issue-item ${getSeverityClass(issue.severity)}`}>
                    <div className="issue-header" onClick={() => toggleIssueExpansion(issueId)} style={{ cursor: 'pointer' }}>
                      <div className="issue-type">
                        {getIssueIcon(issue.type)}
                        <span className="type-label">{issue.type}</span>
                      </div>
                      <span className="line-number">Line {issue.line}</span>
                      <span className={`severity ${getSeverityClass(issue.severity)}`}>
                        {issue.severity}
                      </span>
                      <div className="expand-icon">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                    
                    <p className="issue-message">{issue.message}</p>
                    
                    {isExpanded && (
                      <div className="issue-expanded">
                        {issue.suggestion && (
                          <div className="suggestion">
                            <h4>💡 Suggestion:</h4>
                            <p>{issue.suggestion}</p>
                          </div>
                        )}
                        
                        {(issue as any).solution && (
                          <div className="solution">
                            <div className="solution-header">
                              <h4>🔧 Solution:</h4>
                              <button 
                                className={`copy-button ${isCopied ? 'copied' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copySolution((issue as any).solution, issueId);
                                }}
                                title="Copy solution"
                              >
                                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                {isCopied ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                            <pre className="solution-code">
                              <code>{(issue as any).solution}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisResults;