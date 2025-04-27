// Frontend/src/Components/Events/EventCard.jsx
import React, { useState, useRef, useEffect } from 'react';
import './EventsStyles.css';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaBookmark, 
         FaRegBookmark, FaShareAlt, FaCheckCircle, FaBuilding } from 'react-icons/fa';

const EventCard = ({ 
  event, 
  isActive, 
  isSaved, 
  isRegistered,
  onClick,
  onSave,
  onRegister,
  isInChat = false // Flag for when card is displayed in chat
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  
  // Track mouse movement for 3D effect
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setMousePosition({ x, y });
  };
  
  // Format date with enhanced display
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      
      // Check if it's today or tomorrow
      if (date.toDateString() === now.toDateString()) {
        return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Otherwise, return formatted date
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.warn('Error formatting date:', e);
      return dateString;
    }
  };

  // Handle image error with enhanced fallback
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = `https://picsum.photos/seed/${event.id || event._id}/400/200`;
  };

  // Handle card click with animation
  const handleCardClick = () => {
    if (!isInChat && onClick) {
      // Add click animation class
      if (cardRef.current) {
        cardRef.current.classList.add('cyber-event-card-click');
        setTimeout(() => {
          cardRef.current.classList.remove('cyber-event-card-click');
        }, 300);
      }
      onClick();
    }
  };

  // Apply 3D rotation effect based on mouse position
  useEffect(() => {
    if (isHovered && cardRef.current && !isInChat) {
      const rotateY = (mousePosition.x - 0.5) * 10; // -5 to 5 degrees
      const rotateX = (0.5 - mousePosition.y) * 10; // -5 to 5 degrees
      
      cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0px)`;
    } else if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    }
  }, [mousePosition, isHovered]);
  
  // Reset transform when active changes
  useEffect(() => {
    if (cardRef.current) {
      if (isActive) {
        cardRef.current.style.transform = 'translateY(-4px) scale(1.01)';
      } else {
        cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      }
    }
  }, [isActive]);

  // Determine CSS classes based on props
  const cardClasses = `cyber-event-card ${isActive ? 'cyber-event-active' : ''} ${isInChat ? 'in-chat' : ''}`;
  
  // Determine save button text and icon
  const saveButtonText = isSaved ? 'Saved' : 'Save';
  
  // Determine register button text based on registration status
  const registerButtonText = isRegistered ? 'Registered' : 'Register';

  // Parse category for icon
  const getCategoryIcon = (category) => {
    const lowerCategory = (category || '').toLowerCase();
    switch(lowerCategory) {
      case 'conference': return <i className="fas fa-network-wired"></i>;
      case 'workshop': return <i className="fas fa-lightbulb"></i>;
      case 'hackathon': return <i className="fas fa-brain"></i>;
      case 'webinar': return <i className="fas fa-laptop"></i>;
      case 'meetup': return <i className="fas fa-users"></i>;
      case 'community': return <i className="fas fa-heart"></i>;
      default: return <i className="fas fa-calendar-alt"></i>;
    }
  };

  return (
    <div 
      className={cardClasses} 
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={cardRef}
    >
      {/* Corner Decorations */}
      <div className="cyber-corner cyber-corner-tl"></div>
      <div className="cyber-corner cyber-corner-tr"></div>
      <div className="cyber-corner cyber-corner-bl"></div>
      <div className="cyber-corner cyber-corner-br"></div>
      
      <div className="cyber-event-header">
        <div className="cyber-event-category">
          <span className={`cyber-event-tag ${event.category?.toLowerCase().replace(/\s+/g, '-')}`}>
            {getCategoryIcon(event.category)}
            <span>{event.category}</span>
          </span>
          {event.virtual && (
            <span className="cyber-event-tag virtual">
              <i className="fas fa-laptop-house"></i>
              <span>Virtual</span>
            </span>
          )}
          {event.forWomen && (
            <span className="cyber-event-tag women">
              <i className="fas fa-venus"></i>
              <span>For Women</span>
            </span>
          )}
        </div>
        
        <h3 className="cyber-event-title">{event.title}</h3>
        
        <div className="cyber-event-organization">
          <FaBuilding />
          <span>{event.organizer}</span>
        </div>
      </div>
      
      <div className="cyber-event-body">
        <div className="cyber-event-image-container">
          {event.image && (
            <>
              <img 
                src={event.image} 
                alt={event.title} 
                className="cyber-event-image"
                onError={handleImageError}
              />
              <div className="cyber-event-image-overlay"></div>
              <div className="cyber-event-scanlines"></div>
            </>
          )}
        </div>
        
        <div className="cyber-event-details">
          <div className="cyber-event-detail">
            <span className="cyber-event-icon"><FaCalendarAlt /></span>
            <span>{formatDate(event.date)}</span>
          </div>
          
          <div className="cyber-event-detail">
            <span className="cyber-event-icon"><FaMapMarkerAlt /></span>
            <span>{event.virtual ? 'Online Event' : event.location}</span>
          </div>
          
          <div className="cyber-event-detail">
            <span className="cyber-event-icon"><FaTicketAlt /></span>
            <span>{event.price || 'Free'}</span>
          </div>
        </div>
        
        {/* Event description - show more when active */}
        <div className="cyber-event-description">
          {isActive || isInChat ? (
            <p>{event.description}</p>
          ) : (
            <p>{event.description && event.description.length > 150 
              ? `${event.description.substring(0, 150)}...` 
              : event.description}
            </p>
          )}
        </div>
        
        {/* Speakers section with enhanced display */}
        {event.speakers && event.speakers.length > 0 && (
          <div className="cyber-event-speakers">
            <h4 className="cyber-speakers-title">
              <span>Speakers</span>
            </h4>
            <div className="cyber-speakers-list">
              {event.speakers.map((speaker, index) => (
                <div key={index} className="cyber-speaker">
                  {speaker.image && (
                    <div className="cyber-speaker-image-container">
                      <img 
                        src={speaker.image} 
                        alt={speaker.name} 
                        className="cyber-speaker-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(speaker.name)}&background=random`;
                        }}
                      />
                    </div>
                  )}
                  <div className="cyber-speaker-info">
                    <div className="cyber-speaker-name">{speaker.name}</div>
                    {speaker.role && <div className="cyber-speaker-role">{speaker.role}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced action buttons */}
      <div className="cyber-event-actions">
        <button 
          className="cyber-event-action-button cyber-save-button"
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
        >
          {isSaved ? <FaBookmark /> : <FaRegBookmark />}
          <span>{saveButtonText}</span>
        </button>
        
        <button 
          className="cyber-event-action-button cyber-share-button"
          onClick={(e) => {
            e.stopPropagation();
            // Copy event link to clipboard
            navigator.clipboard.writeText(window.location.origin + '/events/' + (event.id || event._id));
            // Show copy animation
            e.currentTarget.classList.add('cyber-button-animate');
            setTimeout(() => {
              e.currentTarget.classList.remove('cyber-button-animate');
            }, 700);
            
            // Toast notification
            alert('Event link copied to clipboard');
          }}
        >
          <FaShareAlt />
          <span>Share</span>
        </button>
        
        <button 
          className={`cyber-event-action-button cyber-register-button ${isRegistered ? 'registered' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onRegister();
          }}
        >
          {isRegistered ? <FaCheckCircle /> : <FaTicketAlt />}
          <span>{registerButtonText}</span>
        </button>
      </div>
      
      {/* Only show expand/collapse indicator when not in chat and not active */}
      {!isInChat && (
        <div className="cyber-event-expand-indicator">
          <i className={`fas fa-chevron-${isActive ? 'up' : 'down'}`}></i>
        </div>
      )}
    </div>
  );
};

export default EventCard;