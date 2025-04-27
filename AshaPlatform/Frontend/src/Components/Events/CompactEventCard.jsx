// CompactEventCard.jsx - A streamlined card component with modal popup
import React, { useState } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaInfoCircle, 
         FaBookmark, FaRegBookmark } from 'react-icons/fa';
import EventModal from './EventModal';

const CompactEventCard = ({ 
  event, 
  onSave,
  onRegister,
  isInChat = false 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isSaved, setIsSaved] = useState(event.saved || false);
  
  // Format date with enhanced display
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      
      // Check if it's today or tomorrow
      if (date.toDateString() === now.toDateString()) {
        return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Otherwise, return formatted date
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.warn('Error formatting date:', e);
      return dateString;
    }
  };

  // Handle image error with fallback
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = `https://picsum.photos/seed/${event.id || event._id}/400/200`;
  };

  // Handle save action with event propagation control
  const handleSave = (e) => {
    e.stopPropagation();
    onSave(event.id || event._id);
    setIsSaved(true);
  };

  // Get category for badge styling
  const getCategoryClass = () => {
    const category = (event.category || '').toLowerCase().replace(/\s+/g, '-');
    return `cyber-event-tag ${category}`;
  };

  return (
    <>
      <div className="cyber-compact-card" onClick={() => setShowModal(true)}>
        {/* Corner Decorations */}
        <div className="cyber-corner cyber-corner-tl"></div>
        <div className="cyber-corner cyber-corner-tr"></div>
        <div className="cyber-corner cyber-corner-bl"></div>
        <div className="cyber-corner cyber-corner-br"></div>
        
        {/* Image and Overlay */}
        <div className="cyber-compact-image-container">
          <img 
            src={event.image} 
            alt={event.title} 
            className="cyber-compact-image"
            onError={handleImageError}
          />
          <div className="cyber-compact-image-overlay"></div>
          <div className="cyber-compact-scanlines"></div>
          
          {/* Category Badge - Positioned over image */}
          <div className={getCategoryClass()}>
            {event.category}
          </div>
          
          {/* Save Button - Quick action without opening modal */}
          <button 
            className={`cyber-compact-save ${isSaved ? 'saved' : ''}`}
            onClick={handleSave}
            aria-label={isSaved ? "Saved" : "Save event"}
          >
            {isSaved ? <FaBookmark /> : <FaRegBookmark />}
          </button>
        </div>
        
        {/* Card Content - Minimal Information */}
        <div className="cyber-compact-content">
          <h3 className="cyber-compact-title">{event.title}</h3>
          
          <div className="cyber-compact-details">
            <div className="cyber-compact-detail">
              <FaCalendarAlt className="cyber-compact-icon" />
              <span>{formatDate(event.date)}</span>
            </div>
            
            <div className="cyber-compact-detail">
              <FaMapMarkerAlt className="cyber-compact-icon" />
              <span>{event.virtual ? 'Virtual' : event.location?.split(',')[0]}</span>
            </div>
          </div>
          
          {/* View Details Button */}
          <div className="cyber-compact-view">
            <FaInfoCircle />
            <span>View Details</span>
          </div>
        </div>
      </div>
      
      {/* Modal for Detailed Information */}
      {showModal && (
        <EventModal 
          event={event} 
          onClose={() => setShowModal(false)}
          onSave={onSave}
          onRegister={onRegister}
          isSaved={isSaved}
        />
      )}
    </>
  );
};

export default CompactEventCard;