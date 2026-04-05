import React, { useEffect, useMemo, useState } from 'react';
import './group.css';

const API_BASE = process.env.REACT_APP_API_BASE || '';

function GroupModule() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [groupCount, setGroupCount] = useState(1);
  const [groupSizes, setGroupSizes] = useState([1]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function fetchFiles() {
      setIsLoadingFiles(true);
      setErrorMessage('');

      try {
        const response = await fetch(`${API_BASE}/api/groups/files`);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load available sheets.');
        }

        setFiles(data.files || []);
        if (data.files && data.files.length > 0) {
          setSelectedFile(data.files[0]);
        }
      } catch (error) {
        const message = error.message === 'Failed to fetch'
          ? 'Cannot reach backend. Start Backend server on port 5000 and try again.'
          : error.message;
        setErrorMessage(message || 'Unable to load available sheets.');
      } finally {
        setIsLoadingFiles(false);
      }
    }

    fetchFiles();
  }, []);

  const totalSeats = useMemo(
    () => groupSizes.reduce((sum, size) => sum + (Number(size) || 0), 0),
    [groupSizes]
  );

  const handleGroupCountChange = (value) => {
    const parsedValue = Number(value);
    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
      setGroupCount(value);
      return;
    }

    setGroupCount(parsedValue);
    setGroupSizes((current) => {
      const next = [...current];
      if (parsedValue > next.length) {
        while (next.length < parsedValue) {
          next.push(1);
        }
      } else {
        next.length = parsedValue;
      }
      return next;
    });
  };

  const handleGroupSizeChange = (index, value) => {
    setGroupSizes((current) =>
      current.map((size, idx) => {
        if (idx !== index) {
          return size;
        }

        const parsedValue = Number(value);
        if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
          return 0;
        }

        return parsedValue;
      })
    );
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setResult(null);

    const normalizedCount = Number(groupCount);
    if (!Number.isInteger(normalizedCount) || normalizedCount <= 0) {
      setErrorMessage('Total number of groups must be a positive integer.');
      return;
    }

    if (!selectedFile) {
      setErrorMessage('Please select an Excel file from the dropdown.');
      return;
    }

    if (groupSizes.length !== normalizedCount) {
      setErrorMessage('Please provide the size for each group.');
      return;
    }

    if (groupSizes.some((size) => !Number.isInteger(size) || size <= 0)) {
      setErrorMessage('Each group size must be a positive integer.');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(`${API_BASE}/api/groups/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: selectedFile,
          groupCount: normalizedCount,
          groupSizes
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Could not generate groups.');
      }

      setResult(data);
    } catch (error) {
      const message = error.message === 'Failed to fetch'
        ? 'Cannot reach backend. Start Backend server on port 5000 and try again.'
        : error.message;
      setErrorMessage(message || 'Could not generate groups.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!result || !result.downloadUrl) {
      setErrorMessage('Download link is not available. Please generate groups again.');
      return;
    }

    setErrorMessage('');
    setIsDownloading(true);

    try {
      const response = await fetch(`${API_BASE}${result.downloadUrl}`);
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Unable to download ZIP file.');
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const fileName = result.downloadUrl.split('/').pop() || 'groups.zip';

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = decodeURIComponent(fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      const message = error.message === 'Failed to fetch'
        ? 'Cannot reach backend while downloading ZIP. Ensure Backend server is running.'
        : error.message;
      setErrorMessage(message || 'Unable to download ZIP file.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section className="groups-module" id="groups">
      <div className="groups-shell">
        <div className="groups-head">
          <div className="groups-badge">
            Create Groups Module
            <span className="badge-glow"></span>
          </div>
          <h2>Random Group <span className="gold-text">Allocation</span></h2>
          <p>
            Select a participant sheet from Backend/groups, define total groups and each group size,
            then generate unbiased random groups as downloadable Excel files.
          </p>
        </div>

        <form className="groups-form" onSubmit={handleGenerate}>
          <div className="form-card">
            <label className="groups-field">
              <span className="field-label">Select Excel Sheet</span>
              <div className="select-wrapper">
                <select
                  value={selectedFile}
                  onChange={(event) => setSelectedFile(event.target.value)}
                  disabled={isLoadingFiles || files.length === 0}
                  required
                  className={isLoadingFiles ? 'loading' : ''}
                >
                  {files.length === 0 && <option value="">No Excel files found in Backend/groups</option>}
                  {files.map((file) => (
                    <option value={file} key={file}>
                      {file}
                    </option>
                  ))}
                </select>
                <span className="select-arrow">▼</span>
              </div>
            </label>

            <label className="groups-field">
              <span className="field-label">Total Number of Groups</span>
              <input
                type="number"
                min="1"
                value={groupCount}
                onChange={(event) => handleGroupCountChange(event.target.value)}
                required
                className="number-input"
              />
            </label>
          </div>

          <div className="groups-sizes">
            <div className="sizes-header">
              <p>Configure Group Sizes</p>
              <span className="sizes-hint">Enter size for each group</span>
            </div>
            <div className="sizes-grid">
              {groupSizes.map((size, index) => (
                <div className="size-item" key={`group-size-${index + 1}`}>
                  <label className="size-label">
                    <span className="group-number">Group {index + 1}</span>
                    <input
                      type="number"
                      min="1"
                      value={size}
                      onChange={(event) => handleGroupSizeChange(index, event.target.value)}
                      required
                      className="size-input"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="groups-meta">
            <span className="meta-text">Configured total participants by sizes: <strong>{totalSeats}</strong></span>
          </div>

          <button className="generate-btn" type="submit" disabled={isGenerating || isLoadingFiles}>
            {isGenerating ? (
              <>
                <span className="btn-spinner"></span>
                Generating...
              </>
            ) : (
              <>
                <span>Generate Groups</span>
                <span className="btn-arrow">→</span>
              </>
            )}
          </button>

          {errorMessage && (
            <div className="groups-error">
              {errorMessage}
            </div>
          )}

          {result && (
            <div className="groups-success">
              <div className="success-header">
                <p className="success-message">{result.message}</p>
              </div>
              <div className="success-stats">
                <div className="stat-badge">
                  <span className="stat-value">{result.participantCount}</span>
                  <span className="stat-label">Participants Processed</span>
                </div>
              </div>
              <div className="groups-list">
                <p className="list-title">Generated Groups:</p>
                <ul>
                  {result.groups.map((group, idx) => (
                    <li key={group.groupName}>
                      <span className="group-badge">{idx + 1}</span>
                      <span className="group-name">{group.groupName}</span>
                      <span className="group-size">{group.size} members</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                className="download-btn"
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Downloading...
                  </>
                ) : (
                  <>
                    <span>Download ZIP</span>
                    <span className="btn-arrow">↓</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

export default GroupModule;