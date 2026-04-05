import React, { useEffect, useState } from 'react';
import './topics.css';

const API_BASE = process.env.REACT_APP_API_BASE || '';

function TopicsModule() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('Your topic is loading. Get ready to dominate.');
  const [historyStatus, setHistoryStatus] = useState(null);
  const [allocatedTopic, setAllocatedTopic] = useState(null);
  const [showTopicScreen, setShowTopicScreen] = useState(false);
  const [isLoadingTopic, setIsLoadingTopic] = useState(false);

  const fetchFiles = async () => {
    setIsLoadingFiles(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/topics/files`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load topic sheets.');
      }

      const nextFiles = data.files || [];
      setFiles(nextFiles);

      if (nextFiles.length > 0) {
        const preferredFile = nextFiles.includes(selectedFile) ? selectedFile : nextFiles[0];
        setSelectedFile(preferredFile);
        await loadHistoryStatus(preferredFile);
      } else {
        setSelectedFile('');
        setHistoryStatus(null);
      }
    } catch (error) {
      const message = error.message === 'Failed to fetch'
        ? 'Cannot reach backend. Start Backend server on port 5000 and try again.'
        : error.message;
      setErrorMessage(message || 'Unable to load topic sheets.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const loadHistoryStatus = async (fileName) => {
    if (!fileName) {
      setHistoryStatus(null);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/topics/history/status?fileName=${encodeURIComponent(fileName)}`
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Unable to load topic allocation history status.');
      }
      setHistoryStatus(data);
    } catch (error) {
      const message = error.message === 'Failed to fetch'
        ? 'Cannot reach backend. Start Backend server on port 5000 and try again.'
        : error.message;
      setErrorMessage(message || 'Unable to load topic allocation history status.');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileChange = async (event) => {
    const fileName = event.target.value;
    setSelectedFile(fileName);
    setAllocatedTopic(null);
    setShowTopicScreen(false);
    setStatusMessage('Your topic is loading. Get ready to dominate.');
    setErrorMessage('');
    await loadHistoryStatus(fileName);
  };

  const handleCardClick = () => {
    setShowTopicScreen(true);
    setAllocatedTopic(null);
    setStatusMessage('Your topic is loading. Get ready to dominate.');
  };

  const handleAllocateTopic = async () => {
    setErrorMessage('');
    setAllocatedTopic(null);
    setIsLoadingTopic(true);
    setStatusMessage('🎲 Spinning the wheel of topics...');

    if (!selectedFile) {
      setErrorMessage('Please select a topic sheet first.');
      setIsLoadingTopic(false);
      return;
    }

    // Simulate loading animation
    setTimeout(async () => {
      setIsAllocating(true);

      try {
        const response = await fetch(`${API_BASE}/api/topics/allocate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fileName: selectedFile })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || data.error || 'Unable to allocate topic.');
        }

        setAllocatedTopic(data.topic);
        setStatusMessage('🎤 Topic allocated! Time to dominate the stage.');
        await loadHistoryStatus(selectedFile);
      } catch (error) {
        const message = error.message === 'Failed to fetch'
          ? 'Cannot reach backend. Start Backend server on port 5000 and try again.'
          : error.message;
        setErrorMessage(message || 'Unable to allocate topic.');
        setStatusMessage('❌ Your topic could not be loaded.');
      } finally {
        setIsAllocating(false);
        setIsLoadingTopic(false);
      }
    }, 1500);
  };

  const handleClearHistory = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a topic sheet first.');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ Clear allocation history for ${selectedFile}?\n\nThis will allow topics to be allocated again. All previous allocations will be reset.`
    );

    if (!confirmed) {
      return;
    }

    setIsClearing(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/topics/history/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: selectedFile,
          confirmClear: true
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Unable to clear topic history.');
      }

      setAllocatedTopic(null);
      setShowTopicScreen(false);
      setStatusMessage('✨ History cleared! Topics can now be re-allocated.');
      await loadHistoryStatus(selectedFile);
    } catch (error) {
      const message = error.message === 'Failed to fetch'
        ? 'Cannot reach backend. Start Backend server on port 5000 and try again.'
        : error.message;
      setErrorMessage(message || 'Unable to clear topic history.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleResetScreen = () => {
    setShowTopicScreen(false);
    setAllocatedTopic(null);
    setStatusMessage('Your topic is loading. Get ready to dominate.');
  };

  return (
    <section className="topics-module">
      <div className="topics-shell">
        {/* Service Card */}
        <div className="service-card" onClick={handleCardClick}>
          <div className="service-card-icon">🎯</div>
          <h3 className="service-card-title">Allocate Topics</h3>
          <p className="service-card-description">
            Get your random topic instantly and start preparing for your speech
          </p>
          <div className="service-card-arrow">→</div>
        </div>

        {/* Topic Allocation Screen - Modal Style */}
        {showTopicScreen && (
          <div className="topic-screen-overlay" onClick={handleResetScreen}>
            <div className="topic-screen-container" onClick={(e) => e.stopPropagation()}>
              <button className="topic-screen-close" onClick={handleResetScreen}>×</button>
              
              {/* Loading State */}
              {isLoadingTopic && (
                <div className="topic-loading-state">
                  <div className="loading-animation">
                    <div className="loading-circle"></div>
                    <div className="loading-circle-delayed"></div>
                    <div className="mic-icon">🎙️</div>
                  </div>
                  <h2 className="loading-title">Your topic is loading</h2>
                  <p className="loading-subtitle">Get ready to dominate the stage!</p>
                  <div className="loading-dots">
                    <span>.</span><span>.</span><span>.</span>
                  </div>
                </div>
              )}

              {/* Topic Display State */}
              {!isLoadingTopic && allocatedTopic && (
                <div className="topic-display-state">
                  <div className="topic-glow-effect"></div>
                  <div className="topic-crown">👑</div>
                  <div className="topic-badge">Your Allocated Topic</div>
                  <div className="topic-id">ID: {allocatedTopic.ID}</div>
                  <h1 className="topic-name">{allocatedTopic['Topic Name']}</h1>
                  <div className="topic-divider">
                    <span>✦</span>
                    <span>✦</span>
                    <span>✦</span>
                  </div>
                  <p className="topic-message">
                    Time to shine! Prepare well and give your best performance.
                  </p>
                  <button className="topic-new-btn" onClick={handleAllocateTopic}>
                    🎲 Get New Topic
                  </button>
                </div>
              )}

              {/* Initial State - Ready to Allocate */}
              {!isLoadingTopic && !allocatedTopic && (
                <div className="topic-ready-state">
                  <div className="ready-icon">⚡</div>
                  <h2 className="ready-title">Ready to Dominate?</h2>
                  <p className="ready-subtitle">Click the button below to get your random topic</p>
                  
                  <div className="topic-controls">
                    <select
                      className="topic-select"
                      value={selectedFile}
                      onChange={handleFileChange}
                      disabled={isLoadingFiles}
                    >
                      {files.length === 0 && (
                        <option value="">
                          {isLoadingFiles ? 'Loading topic sheets...' : 'No topic sheets found in Backend/Topics'}
                        </option>
                      )}
                      {files.map((file) => (
                        <option key={file} value={file}>
                          📚 {file}
                        </option>
                      ))}
                    </select>

                    {historyStatus && (
                      <div className="topic-stats">
                        <div className="stat-item">
                          <span className="stat-value">{historyStatus.totalTopics}</span>
                          <span className="stat-label">Total Topics</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                          <span className="stat-value">{historyStatus.allocatedCount}</span>
                          <span className="stat-label">Allocated</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                          <span className="stat-value">{historyStatus.remainingCount}</span>
                          <span className="stat-label">Remaining</span>
                        </div>
                      </div>
                    )}

                    <div className="action-buttons">
                      <button
                        className="allocate-topic-btn"
                        onClick={handleAllocateTopic}
                        disabled={isAllocating || isLoadingFiles || !selectedFile}
                      >
                        <span>🎤 Allocate Topic</span>
                        <span className="btn-arrow">→</span>
                      </button>
                      <button
                        className="clear-history-btn"
                        onClick={handleClearHistory}
                        disabled={isClearing || !selectedFile}
                      >
                        <span>🗑️ Clear History</span>
                      </button>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="topic-error">
                      <span>⚠️</span> {errorMessage}
                      <button
                        type="button"
                        className="topic-retry-btn"
                        onClick={fetchFiles}
                        disabled={isLoadingFiles}
                      >
                        {isLoadingFiles ? 'Retrying...' : 'Retry'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default TopicsModule;