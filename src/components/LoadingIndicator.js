// Placeholder content for LoadingIndicator.js
// components/LoadingIndicator.js
import React from 'react';

const LoadingIndicator = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-indicator">
      <div className="loader"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default LoadingIndicator;