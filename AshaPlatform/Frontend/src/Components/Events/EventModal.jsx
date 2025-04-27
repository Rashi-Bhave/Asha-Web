// EventModal.jsx - Pop-up modal to display detailed event information
import React, { useEffect, useRef } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaBuilding, 
         FaShareAlt, FaBookmark, FaRegBookmark, FaCheckCircle, 
         FaTimes, FaUsers } from 'react-icons/fa';

const EventModal = ({ 
  event, 
  onClose,
  onSave,
  onRegister,
  isSaved = false,
  isRegistered = false
}) => {
  const modalRef = useRef(null);
  
  // Handle escape key and click outside to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    // Add event listeners
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);
  
  // Format date with enhanced display
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    
    try {
      const date = new Date(dateString);
      
      // Format date
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.warn('Error formatting date:', e);
      return dateString;
    }
  };

  // Handle image error
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = `https://picsum.photos/seed/${event.id || event._id}/800/400`;
  };
  
  // Handle save action
  const handleSave = () => {
    onSave(event.id || event._id);
  };
  
  // Handle register action
  const handleRegister = () => {
    onRegister(event.id || event._id, event.registrationUrl);
  };
  
  // Handle share action
  const handleShare = () => {
    // Copy event link to clipboard
    navigator.clipboard.writeText(window.location.origin + '/events/' + (event.id || event._id));
    // Show toast notification in a real implementation
    alert('Event link copied to clipboard');
  };

  return (
    <div className="cyber-modal-overlay">
      <div className="cyber-modal" ref={modalRef}>
        {/* Close button */}
        <button className="cyber-modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        
        {/* Modal Header with title and category */}
        <div className="cyber-modal-header">
          <div className="cyber-modal-categories">
            <span className={`cyber-event-tag ${event.category?.toLowerCase().replace(/\s+/g, '-')}`}>
              {event.category}
            </span>
            {event.virtual && (
              <span className="cyber-event-tag virtual">Virtual</span>
            )}
            {event.forWomen && (
              <span className="cyber-event-tag women">For Women</span>
            )}
          </div>
          
          <h2 className="cyber-modal-title">{event.title}</h2>
          
          <div className="cyber-modal-organizer">
            <FaBuilding className="cyber-modal-icon" />
            <span>{event.organizer || 'Unknown Organizer'}</span>
          </div>
        </div>
        
        {/* Modal Content with 2-column layout on larger screens */}
        <div className="cyber-modal-content">
          <div className="cyber-modal-image-container">
            <img 
              src={event.image} 
              alt={event.title} 
              className="cyber-modal-image"
              onError={handleImageError}
            />
            <div className="cyber-event-image-overlay"></div>
            <div className="cyber-event-scanlines"></div>
          </div>
          
          <div className="cyber-modal-details">
            <div className="cyber-modal-info-grid">
              <div className="cyber-modal-info-item">
                <div className="cyber-modal-info-icon">
                  <FaCalendarAlt />
                </div>
                <div className="cyber-modal-info-content">
                  <span className="cyber-modal-info-label">Date & Time</span>
                  <span className="cyber-modal-info-value">{formatDate(event.date)}</span>
                </div>
              </div>
              
              <div className="cyber-modal-info-item">
                <div className="cyber-modal-info-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="cyber-modal-info-content">
                  <span className="cyber-modal-info-label">Location</span>
                  <span className="cyber-modal-info-value">{event.virtual ? 'Online Event' : event.location}</span>
                </div>
              </div>
              
              <div className="cyber-modal-info-item">
                <div className="cyber-modal-info-icon">
                  <FaTicketAlt />
                </div>
                <div className="cyber-modal-info-content">
                  <span className="cyber-modal-info-label">Price</span>
                  <span className="cyber-modal-info-value">{event.price || 'Free'}</span>
                </div>
              </div>
              
              {event.capacity && (
                <div className="cyber-modal-info-item">
                  <div className="cyber-modal-info-icon">
                    <FaUsers />
                  </div>
                  <div className="cyber-modal-info-content">
                    <span className="cyber-modal-info-label">Capacity</span>
                    <span className="cyber-modal-info-value">{event.capacity}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Description section */}
            <div className="cyber-modal-description">
              <h3 className="cyber-modal-section-title">About this event</h3>
              <p>{event.description}</p>
            </div>
            
            {/* Speakers section */}
            {event.speakers && event.speakers.length > 0 && (
              <div className="cyber-modal-speakers">
                <h3 className="cyber-modal-section-title">Speakers</h3>
                <div className="cyber-modal-speakers-grid">
                  {event.speakers.map((speaker, index) => (
                    <div key={index} className="cyber-modal-speaker">
                      {speaker.image && (
                        <div className="cyber-modal-speaker-image-container">
                          <img 
                            src={speaker.image} 
                            alt={speaker.name} 
                            className="cyber-modal-speaker-image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(speaker.name)}&background=random`;
                            }}
                          />
                        </div>
                      )}
                      <div className="cyber-modal-speaker-info">
                        <div className="cyber-modal-speaker-name">{speaker.name}</div>
                        {speaker.role && <div className="cyber-modal-speaker-role">{speaker.role}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Modal Actions */}
        <div className="cyber-modal-actions">
          <button 
            className="cyber-modal-action cyber-save-button"
            onClick={handleSave}
          >
            {isSaved ? <FaBookmark /> : <FaRegBookmark />}
            <span>{isSaved ? 'Saved' : 'Save Event'}</span>
          </button>
          
          <button 
            className="cyber-modal-action cyber-share-button"
            onClick={handleShare}
          >
            <FaShareAlt />
            <span>Share</span>
          </button>
          
          <button 
            className={`cyber-modal-action cyber-register-button ${isRegistered ? 'registered' : ''}`}
            onClick={handleRegister}
            disabled={isRegistered}
          >
            {isRegistered ? <FaCheckCircle /> : <FaTicketAlt />}
            <span>{isRegistered ? 'Registered' : 'Register Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;