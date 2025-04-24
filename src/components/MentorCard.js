// src/components/MentorCard.js
import React from 'react';

const MentorCard = ({ mentor }) => {
  // Generate deterministic avatar URL based on name
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=7B3FA9&color=fff&size=100`;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-container">
          <h3 className="card-title">{mentor.name}</h3>
          <div className="card-subtitle">{mentor.title}</div>
        </div>
        
        <img
          src={avatarUrl}
          alt={mentor.name}
          className="card-logo mentor-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://picsum.photos/seed/${mentor.name.length * 5}/100/100`;
          }}
        />
      </div>
      
      <div className="card-content">
        <div className="card-details">
          {mentor.rating !== null && (
            <div className="card-detail-item">
              <i className="fas fa-star"></i>
              <span className="card-detail-text">
                {mentor.rating ? `Rating: ${mentor.rating}` : 'New Mentor'}
              </span>
            </div>
          )}
          
          {mentor.bookings && (
            <div className="card-detail-item">
              <i className="fas fa-calendar-check"></i>
              <span className="card-detail-text">{mentor.bookings} Bookings</span>
            </div>
          )}
          
          <div className="card-detail-item">
            <i className="fas fa-phone-alt"></i>
            <span className="card-detail-text">{mentor.callInfo}</span>
          </div>
        </div>
        
        <div className="tags-container">
          {mentor.priorityDM && (
            <span className="tag">Priority DM</span>
          )}
          {mentor.isNew && (
            <span className="tag">New</span>
          )}
        </div>
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
        
        <button className="primary-button">
          Book Session
        </button>
      </div>
    </div>
  );
};

export default MentorCard;