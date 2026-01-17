import React, { useState, useMemo } from 'react';
import './App.css';
import * as XLSX from 'xlsx';

function App() {
  const [srtFile, setSrtFile] = useState(null);
  const [youtubeLink, setYoutubeLink] = useState('');
  const [timestamps, setTimestamps] = useState([]);
  const [error, setError] = useState('');

  // Parse time string (HH:MM:SS,mmm) and convert to total seconds
  const parseTimeToSeconds = (timeString) => {
    const [time] = timeString.split(',');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Parse SRT content and extract timestamps
  const parseSRT = (content) => {
    const lines = content.split('\n');
    const timestamps = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if line contains timestamp (format: 00:00:00,000 --> 00:00:00,000)
      if (line.includes('-->')) {
        const [startTime] = line.split('-->').map(t => t.trim());
        
        // Convert to seconds
        let totalSeconds = parseTimeToSeconds(startTime);
        
        // Subtract 3 seconds
        totalSeconds = Math.max(0, totalSeconds - 3);
        
        // Get the subtitle text (next lines until empty line)
        let subtitleText = '';
        let j = i + 1;
        while (j < lines.length && lines[j].trim() !== '') {
          subtitleText += lines[j].trim() + ' ';
          j++;
        }
        
        // Remove HTML tags for display
        subtitleText = subtitleText.replace(/<[^>]*>/g, '').trim();
        
        if (subtitleText) {
          timestamps.push({
            seconds: totalSeconds,
            text: subtitleText.substring(0, 100) // Limit text length
          });
        }
      }
    }
    
    return timestamps;
  };

  // Extract YouTube video ID from various YouTube URL formats
  const extractYoutubeId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.endsWith('.srt')) {
        setError('Please upload a valid SRT file');
        return;
      }
      
      setSrtFile(file);
      setError('');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const parsedTimestamps = parseSRT(content);
        setTimestamps(parsedTimestamps);
      };
      reader.readAsText(file);
    }
  };

  // Generate YouTube timestamp links using useMemo to prevent infinite re-renders
  const links = useMemo(() => {
    if (!youtubeLink || timestamps.length === 0) {
      return null;
    }
    
    const videoId = extractYoutubeId(youtubeLink);
    if (!videoId) {
      return null;
    }
    
    return timestamps.map((ts, index) => ({
      ...ts,
      link: `https://youtu.be/${videoId}?t=${ts.seconds}`
    }));
  }, [youtubeLink, timestamps]);

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Generate Excel file with timestamps
  const generateExcelFile = () => {
    if (!links) return;
    
    // Prepare data for Excel
    const excelData = links.map((item, index) => ({
      'Sr. No.': index + 1,
      'Time': formatTime(item.seconds),
      'Timestamp Link': item.link,
      'Subtitle Text': item.text
    }));
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 8 },  // Sr. No.
      { wch: 12 }, // Time
      { wch: 50 }, // Timestamp Link
      { wch: 60 }  // Subtitle Text
    ];
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Timestamps');
    
    // Generate file name
    const fileName = `LiveGuru_Timestamps_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Download file
    XLSX.writeFile(workbook, fileName);
  };

  // Copy single link to clipboard
  const copyLink = (link) => {
    navigator.clipboard.writeText(link).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  return (
    <div className="App">
      <div className="container">
        <div className="logo-header">
          <div className="logo-container">
            <img src={process.env.PUBLIC_URL + '/logo.svg'} alt="LiveGuru Logo" />
          </div>
          <div>
            <h1>LIVEGURU</h1>
            <div className="brand-tagline">liveguru.app</div>
          </div>
        </div>
        <p className="subtitle">Transform your SRT files into instant YouTube timestamp links</p>
        
        <div className="upload-section">
          <div className="input-group">
            <label htmlFor="srt-upload" className="file-label">
              <span className="icon">📄</span>
              {srtFile ? srtFile.name : 'Choose SRT File'}
            </label>
            <input
              id="srt-upload"
              type="file"
              accept=".srt"
              onChange={handleFileUpload}
              className="file-input"
            />
          </div>
          
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter YouTube link (e.g., https://youtu.be/pCtU2FkLp0c)"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              className="text-input"
            />
          </div>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {timestamps.length > 0 && youtubeLink && (
          <>
            {!extractYoutubeId(youtubeLink) && (
              <div className="error-message">
                ⚠️ Invalid YouTube link
              </div>
            )}
            
            {links && (
              <div className="results-section">
                <div className="results-header">
                  <h2>Generated Timestamps ({timestamps.length})</h2>
                  <button onClick={generateExcelFile} className="copy-all-btn">
                    📊 Download Excel
                  </button>
                </div>
                
                <div className="timestamps-list">
                  {links.map((item, index) => (
                    <div key={index} className="timestamp-item">
                      <div className="timestamp-info">
                        <span className="timestamp-number">#{index + 1}</span>
                        <span className="timestamp-time">
                          {Math.floor(item.seconds / 60)}:{String(item.seconds % 60).padStart(2, '0')}
                        </span>
                        <span className="timestamp-text">{item.text}</span>
                      </div>
                      <div className="timestamp-actions">
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="open-btn"
                        >
                          ▶️ Open
                        </a>
                        <button 
                          onClick={() => copyLink(item.link)}
                          className="copy-btn"
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {timestamps.length === 0 && srtFile && (
          <div className="info-message">
            ℹ️ No timestamps found in the SRT file
          </div>
        )}
      </div>
      
      <footer className="footer">
        <p>Powered by <a href="https://liveguru.app" target="_blank" rel="noopener noreferrer">liveguru.app</a> | Automatically subtracts 3 seconds from each timestamp</p>
      </footer>
    </div>
  );
}

export default App;
