import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-snake">
          <div className="loading-snake-segment"></div>
          <div className="loading-snake-segment"></div>
          <div className="loading-snake-segment"></div>
        </div>
        <div className="loading-bar-container">
          <div className="loading-bar"></div>
        </div>
        <p className="loading-text">ĐANG TẢI TRÒ CHƠI...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;