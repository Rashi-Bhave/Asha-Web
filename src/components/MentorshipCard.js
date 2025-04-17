// components/MentorshipCard.js
import React from 'react';

const MentorshipCard = ({ mentorship }) => {
  const handleApply = () => {
    if (mentorship.application) {
      window.open(mentorship.application, '_blank');
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Soon';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-container">
          <h3 className="card-title">{mentorship.title}</h3>
          <div className="card-subtitle">Led by {mentorship.mentor}</div>
        </div>
        
        {mentorship.image && (
          <img
            src={mentorship.image}
            alt={mentorship.mentor}
            className="card-logo mentor-image"
          />
        )}
      </div>
      
      <div className="card-content">
        <div className="card-details">
          <div className="card-detail-item">
            <i className="fas fa-briefcase"></i>
            <span className="card-detail-text">{mentorship.focus}</span>
          </div>
          
          <div className="card-detail-item">
            <i className="fas fa-clock"></i>
            <span className="card-detail-text">{mentorship.duration}</span>
          </div>
          
          <div className="card-detail-item">
            <i className="fas fa-industry"></i>
            <span className="card-detail-text">{mentorship.industry}</span>
          </div>
        </div>
        
        <div className="card-detail-item">
          <i className="fas fa-calendar-alt"></i>
          <span className="card-detail-text">Starts {formatDate(mentorship.startDate)}</span>
        </div>
        
        <div className="card-detail-item">
          <i className="fas fa-user-clock"></i>
          <span className="card-detail-text">Commitment: {mentorship.commitmentHours}</span>
        </div>
        
        <div className="card-detail-item">
          <i className="fas fa-users"></i>
          <span className="card-detail-text">Format: {mentorship.format}</span>
        </div>
        
        <p className="card-description">
          {mentorship.description.length > 200
            ? `${mentorship.description.substring(0, 200)}...`
            : mentorship.description}
        </p>
      </div>
      
      <div className="card-actions">
        <button className="action-button">
          <i className="far fa-bookmark"></i>
          <span>Save</span>
        </button>
        
        <button className="action-button">
          <i className="fas fa-share"></i>
          <span>Share</span>
        </button>
        
        <button className="primary-button" onClick={handleApply}>
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default MentorshipCard;