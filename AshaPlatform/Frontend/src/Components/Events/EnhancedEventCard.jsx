// EnhancedEventCard.jsx - A futuristic, highly animated event card component
import React, { useState, useEffect, useRef } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaInfoCircle, 
         FaBookmark, FaRegBookmark, FaChevronRight, FaCircle } from 'react-icons/fa';
import EnhancedEventModal from './EnhancedEventModal';

const EnhancedEventCard = ({ 
  event, 
  onSave,
  onRegister,
  isInChat = false 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isSaved, setIsSaved] = useState(event.saved || false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [glitchActive, setGlitchActive] = useState(false);
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const particlesRef = useRef(null);
  
  // Apply glitch effect randomly or on specific actions
  useEffect(() => {
    if (isHovered) {
      const glitchInterval = setInterval(() => {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 150);
      }, 3000);
      
      return () => clearInterval(glitchInterval);
    }
  }, [isHovered]);
  
  // Generate particles on hover
  useEffect(() => {
    if (isHovered && particlesRef.current) {
      generateParticles();
    }
  }, [isHovered]);
  
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
    
    // Trigger pulse animation
    if (cardRef.current) {
      cardRef.current.classList.add('cyber-card-pulse');
      setTimeout(() => {
        cardRef.current.classList.remove('cyber-card-pulse');
      }, 800);
    }
  };

  // Handle mouse move for 3D effects
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate tilt values
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = (y - centerY) / 10;
    const tiltY = (centerX - x) / 10;
    
    // Update card style
    cardRef.current.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    
    // Update mouse position for glow effect
    setMousePosition({ x, y });
    
    // Update image style for parallax effect
    if (imageRef.current) {
      const moveX = (x - centerX) / 20;
      const moveY = (y - centerY) / 20;
      imageRef.current.style.transform = `translateX(${moveX}px) translateY(${moveY}px) scale(1.1)`;
    }
  };

  // Reset card on mouse leave
  const handleMouseLeave = () => {
    setIsHovered(false);
    
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }
    
    if (imageRef.current) {
      imageRef.current.style.transform = 'scale(1)';
    }
  };
  
  // Generate decorative particles
  const generateParticles = () => {
    if (!particlesRef.current) return;
    
    // Clear existing particles
    particlesRef.current.innerHTML = '';
    
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.classList.add('cyber-card-particle');
      
      // Randomize particle properties
      const size = Math.random() * 3 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 2 + 1;
      const delay = Math.random() * 0.5;
      
      // Set particle style
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${x}%`;
      particle.style.top = `${y}%`;
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `${delay}s`;
      
      // Add to container
      particlesRef.current.appendChild(particle);
    }
  };

  // Get category for badge styling
  const getCategoryClass = () => {
    const category = (event.category || '').toLowerCase().replace(/\s+/g, '-');
    return `cyber-event-tag ${category}`;
  };

  return (
    <>
      <div 
        className={`cyber-enhanced-card ${isHovered ? 'hovered' : ''} ${glitchActive ? 'glitch-effect' : ''}`}
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setShowModal(true)}
      >
        {/* Animated borders */}
        <div className="cyber-card-borders">
          <div className="border-top"></div>
          <div className="border-right"></div>
          <div className="border-bottom"></div>
          <div className="border-left"></div>
        </div>
        
        {/* Corner Decorations */}
        <div className="cyber-corner cyber-corner-tl"></div>
        <div className="cyber-corner cyber-corner-tr"></div>
        <div className="cyber-corner cyber-corner-bl"></div>
        <div className="cyber-corner cyber-corner-br"></div>
        
        {/* Dynamic glow effect */}
        <div 
          className="cyber-card-glow"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(6, 182, 212, 0.4) 0%, rgba(6, 182, 212, 0.1) 40%, rgba(6, 182, 212, 0) 70%)`
          }}
        ></div>
        
        {/* Particle effects container */}
        <div className="cyber-card-particles" ref={particlesRef}></div>
        
        {/* Image and Overlay */}
        <div className="cyber-enhanced-image-container">
          <img 
            src={event.image} 
            alt={event.title} 
            className="cyber-enhanced-image"
            ref={imageRef}
            onError={handleImageError}
          />
          <div className="cyber-enhanced-image-overlay"></div>
          <div className="cyber-enhanced-scanlines"></div>
          
          {/* Category Badge - Positioned over image */}
          <div className={getCategoryClass()}>
            {event.category}
          </div>
          
          {/* Virtual tag if applicable */}
          {event.virtual && (
            <div className="cyber-event-tag virtual">
              <FaCircle className="cyber-tag-dot pulse" />
              Virtual
            </div>
          )}
          
          {/* Save Button - Quick action without opening modal */}
          <button 
            className={`cyber-enhanced-save ${isSaved ? 'saved' : ''}`}
            onClick={handleSave}
            aria-label={isSaved ? "Saved" : "Save event"}
          >
            {isSaved ? <FaBookmark /> : <FaRegBookmark />}
            <span className="save-tooltip">{isSaved ? "Saved" : "Save"}</span>
          </button>
        </div>
        
        {/* Card Content - Minimal Information */}
        <div className="cyber-enhanced-content">
          <h3 className="cyber-enhanced-title">{event.title}</h3>
          
          <div className="cyber-enhanced-details">
            <div className="cyber-enhanced-detail">
              <div className="cyber-detail-icon-container">
                <FaCalendarAlt className="cyber-enhanced-icon" />
              </div>
              <span>{formatDate(event.date)}</span>
            </div>
            
            <div className="cyber-enhanced-detail">
              <div className="cyber-detail-icon-container">
                <FaMapMarkerAlt className="cyber-enhanced-icon" />
              </div>
              <span>{event.virtual ? 'Virtual Event' : event.location?.split(',')[0]}</span>
            </div>
          </div>
          
          {/* Organization if available */}
          {event.organizer && (
            <div className="cyber-enhanced-organizer">
              <span>{event.organizer}</span>
            </div>
          )}
          
          {/* View Details Button */}
          <div className="cyber-enhanced-view">
            <div className="cyber-view-icon">
              <FaInfoCircle />
            </div>
            <span>View Details</span>
            <FaChevronRight className="cyber-chevron" />
          </div>
        </div>
        
        {/* Animated highlight effect */}
        <div className="cyber-card-highlight"></div>
        
        {/* Digital Circuit Lines */}
        <svg className="cyber-circuit" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path className="circuit-path" d="M0,20 L15,20 L20,25 L80,25 L80,60 L40,60 L40,80 L100,80" />
          <path className="circuit-path" d="M0,40 L35,40 L35,60 L30,65 L10,65 L5,60" />
          <path className="circuit-path" d="M100,30 L80,30 L75,35 L75,50" />
        </svg>
      </div>
      
      {/* Modal for Detailed Information */}
      {showModal && (
        <EnhancedEventModal 
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

export default EnhancedEventCard;