import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/reel.css';
import '../../styles/theme.css';

const Saved = () => {
  const navigate = useNavigate();

  return (
    <div className="saved-page">
      <div className="saved-content">
        <h2 className="saved-title">Saved</h2>
        <p className="saved-subtitle">Your bookmarked reels will appear here.</p>
      </div>

      <nav className="bottom-nav" aria-label="Bottom navigation">
        <button className="bottom-nav-item" type="button" onClick={() => navigate('/')}>
          <span className="bottom-nav-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="bottom-nav-label">Home</span>
        </button>
        <button className="bottom-nav-item active" type="button" onClick={() => navigate('/saved')}>
          <span className="bottom-nav-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 4h10v16l-5-3-5 3V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="bottom-nav-label">Saved</span>
        </button>
      </nav>
    </div>
  );
};

export default Saved;
