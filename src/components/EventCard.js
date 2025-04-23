// components/EventCard.js
import React from 'react';

const EventCard = ({ event }) => {
  const handleRegister = () => {
    if (event.registrationUrl && event.registrationUrl !== '#') {
      window.open(event.registrationUrl, '_blank');
    } else {
      alert('Registration link is not available for this event.');
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    
    try {
      // Try to parse ISO date
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      }
      
      // Handle date ranges or already formatted dates
      return dateString;
    } catch (e) {
      console.warn('Error formatting date:', e);
      return dateString;
    }
  };

  // Fallback image for broken links
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = `https://picsum.photos/seed/${event.id}/400/200`;
  };
  
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-container">
          <h3 className="card-title">{event.title}</h3>
          <div className="card-subtitle">{event.category || 'Event'}</div>
        </div>
        
        {event.image && (
          <img
            src={event.image}
            alt={event.title}
            className="card-logo"
            onError={handleImageError}
          />
        )}
      </div>
      
      <div className="card-content">
        <div className="card-details">
          <div className="card-detail-item">
            <i className="fas fa-calendar-alt"></i>
            <span className="card-detail-text">{formatDate(event.date)}</span>
          </div>
          
          <div className="card-detail-item">
            <i className="fas fa-map-marker-alt"></i>
            <span className="card-detail-text">
              {event.virtual ? 'Virtual Event' : event.location}
            </span>
          </div>
          
          <div className="card-detail-item">
            <i className="fas fa-ticket-alt"></i>
            <span className="card-detail-text">{event.price || 'Free'}</span>
          </div>
        </div>
        
        {event.speakers && event.speakers.length > 0 && (
          <div className="event-speakers">
            <div className="speakers-label">Speakers:</div>
            <div className="speakers-list">
              {event.speakers.map((speaker, index) => (
                <div key={index} className="speaker-item">
                  {speaker.image && (
                    <img 
                      src={speaker.image} 
                      alt={speaker.name} 
                      className="speaker-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="speaker-info">
                    <div className="speaker-name">{speaker.name}</div>
                    <div className="speaker-role">{speaker.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <p className="card-description">
          {event.description}
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
        
        <button className="primary-button" onClick={handleRegister}>
          {event.registrationUrl && event.registrationUrl !== '#' ? 'Register' : 'Learn More'}
        </button>
      </div>
    </div>
  );
};

export default EventCard;