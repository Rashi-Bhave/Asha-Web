// pages/WelcomePage.js
import React from 'react';

const WelcomePage = ({ onNavigate }) => {
  const handleLogin = () => {
    onNavigate('login');
  };
  
  const featureItems = [
    {
      icon: 'fa-briefcase',
      title: 'Job Opportunities',
      description: 'Discover personalized job listings that match your skills and career goals.'
    },
    {
      icon: 'fa-calendar',
      title: 'Community Events',
      description: 'Stay updated with events, workshops, and networking opportunities.'
    },
    {
      icon: 'fa-users',
      title: 'Mentorship Programs',
      description: 'Connect with experienced mentors who can guide your professional journey.'
    },
    {
      icon: 'fa-comment-dots',
      title: 'Smart Conversations',
      description: 'Engage with Asha AI for career advice and information tailored to your needs.'
    }
  ];
  
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        {/* Logo can be replaced with your actual logo */}
        <div className="welcome-logo">
          <i className="fas fa-robot" style={{ fontSize: '80px' }}></i>
        </div>
        
        <h1 className="welcome-title">Welcome to Asha AI</h1>
        
        <p className="welcome-subtitle">
          Your AI Companion for Career Growth
        </p>
        
        <div className="features-container">
          {featureItems.map((item, index) => (
            <div key={index} className="feature-item">
              <div className="feature-icon">
                <i className={`fas ${item.icon}`}></i>
              </div>
              <div className="feature-text">
                <h3 className="feature-title">{item.title}</h3>
                <p className="feature-description">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="button-container">
          <button className="welcome-button" onClick={handleLogin}>
            Sign In / Create Account
          </button>
        </div>
        
        <div className="welcome-footer">
          <p className="footer-text">
            Powered by JobsForHer Foundation
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;