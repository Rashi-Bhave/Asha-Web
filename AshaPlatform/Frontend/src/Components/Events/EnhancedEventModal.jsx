// EnhancedEventModal.jsx - Futuristic, animated modal for event details
import React, { useEffect, useRef, useState } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaBuilding, 
         FaShareAlt, FaBookmark, FaRegBookmark, FaCheckCircle, 
         FaTimes, FaUsers, FaChevronRight, FaCircle } from 'react-icons/fa';

const EnhancedEventModal = ({ 
  event, 
  onClose,
  onSave,
  onRegister,
  isSaved = false,
  isRegistered = false
}) => {
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const [closing, setClosing] = useState(false);
  const [animateSection, setAnimateSection] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  
  // Create random particles for visual effect
  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        size: Math.random() * 3 + 1,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 30 + 10,
        delay: Math.random() * 2
      });
    }
    setParticles(newParticles);
  }, []);
  
  // Handle entrance animation for sections
  useEffect(() => {
    const sections = ['header', 'image', 'details', 'description', 'speakers', 'actions'];
    let currentIndex = 0;
    
    const animateNextSection = () => {
      if (currentIndex < sections.length) {
        setAnimateSection(sections[currentIndex]);
        currentIndex++;
        setTimeout(animateNextSection, 100);
      }
    };
    
    setTimeout(animateNextSection, 100);
    
    return () => {
      setAnimateSection('');
    };
  }, []);
  
  // Handle escape key and click outside to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleClose();
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
    
    // Animation feedback
    if (modalRef.current) {
      modalRef.current.classList.add('cyber-modal-share-active');
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.classList.remove('cyber-modal-share-active');
        }
      }, 1000);
    }
    
    // Show toast notification
    alert('Event link copied to clipboard');
  };
  
  // Handle close with animation
  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };
  
  // Handle mouse move for 3D effects
  const handleMouseMove = (e) => {
    if (!modalRef.current || !contentRef.current) return;
    
    const rect = contentRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
  };
  
  return (
    <div className={`cyber-modal-overlay ${closing ? 'closing' : ''}`}>
      <div 
        className={`cyber-enhanced-modal ${closing ? 'exit' : ''}`} 
        ref={modalRef}
        onMouseMove={handleMouseMove}
      >
        {/* Animated background elements */}
        <div className="cyber-modal-bg-elements">
          <div className="cyber-modal-gradient"></div>
          <div className="cyber-modal-scanline"></div>
          <svg className="cyber-modal-circuit" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path className="circuit-path" d="M0,20 L15,20 L20,25 L80,25 L80,60 L40,60 L40,80 L100,80" />
            <path className="circuit-path" d="M0,40 L35,40 L35,60 L30,65 L10,65 L5,60" />
            <path className="circuit-path" d="M100,30 L80,30 L75,35 L75,50" />
            <path className="circuit-path" d="M50,0 L50,20 L55,25 L60,20 L60,0" />
            <path className="circuit-path" d="M100,70 L80,70 L75,65 L65,65 L60,70 L60,100" />
          </svg>
          
          {/* Particle effects */}
          <div className="cyber-modal-particles">
            {particles.map(particle => (
              <div 
                key={particle.id}
                className="cyber-modal-particle"
                style={{
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  animationDuration: `${particle.duration}s`,
                  animationDelay: `${particle.delay}s`
                }}
              ></div>
            ))}
          </div>
          
          {/* Glow effects */}
          <div 
            className="cyber-modal-glow"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.05) 30%, transparent 70%)`
            }}
          ></div>
        </div>
        
        {/* Modal Corner Decorations */}
        <div className="cyber-modal-corner cyber-modal-corner-tl"></div>
        <div className="cyber-modal-corner cyber-modal-corner-tr"></div>
        <div className="cyber-modal-corner cyber-modal-corner-bl"></div>
        <div className="cyber-modal-corner cyber-modal-corner-br"></div>
        
        {/* Modal Border Animations */}
        <div className="cyber-modal-borders">
          <div className="border-top"></div>
          <div className="border-right"></div>
          <div className="border-bottom"></div>
          <div className="border-left"></div>
        </div>
        
        {/* Close button */}
        <button className="cyber-modal-close" onClick={handleClose}>
          <FaTimes />
          <span className="close-effect"></span>
        </button>
        
        <div className="cyber-modal-content" ref={contentRef}>
          {/* Modal Header with title and category */}
          <div className={`cyber-modal-header ${animateSection === 'header' ? 'animate-in' : ''}`}>
            <div className="cyber-modal-categories">
              <span className={`cyber-modal-tag ${event.category?.toLowerCase().replace(/\s+/g, '-')}`}>
                {event.category}
              </span>
              {event.virtual && (
                <span className="cyber-modal-tag virtual">
                  <FaCircle className="cyber-tag-dot pulse" />
                  Virtual
                </span>
              )}
              {event.forWomen && (
                <span className="cyber-modal-tag women">For Women</span>
              )}
            </div>
            
            <h2 className="cyber-modal-title">{event.title}</h2>
            
            <div className="cyber-modal-organizer">
              <div className="organizer-icon-container">
                <FaBuilding className="cyber-modal-icon" />
              </div>
              <span>{event.organizer || 'Unknown Organizer'}</span>
            </div>
          </div>
          
          {/* Modal Content with 2-column layout on larger screens */}
          <div className="cyber-modal-content-grid">
            <div className={`cyber-modal-image-container ${animateSection === 'image' ? 'animate-in' : ''}`}>
              <img 
                src={event.image} 
                alt={event.title} 
                className="cyber-modal-image"
                onError={handleImageError}
              />
              <div className="cyber-modal-image-overlay"></div>
              <div className="cyber-modal-scanlines"></div>
            </div>
            
            <div className="cyber-modal-details-container">
              <div className={`cyber-modal-info-grid ${animateSection === 'details' ? 'animate-in' : ''}`}>
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
              <div className={`cyber-modal-description ${animateSection === 'description' ? 'animate-in' : ''}`}>
                <h3 className="cyber-modal-section-title">
                  About this event
                  <div className="section-line"></div>
                </h3>
                <p>{event.description}</p>
              </div>
              
              {/* Speakers section */}
              {event.speakers && event.speakers.length > 0 && (
                <div className={`cyber-modal-speakers ${animateSection === 'speakers' ? 'animate-in' : ''}`}>
                  <h3 className="cyber-modal-section-title">
                    Speakers
                    <div className="section-line"></div>
                  </h3>
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
                            <div className="cyber-modal-speaker-overlay"></div>
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
          <div className={`cyber-modal-actions ${animateSection === 'actions' ? 'animate-in' : ''}`}>
            <button 
              className={`cyber-modal-action cyber-save-button ${isSaved ? 'saved' : ''}`}
              onClick={handleSave}
            >
              <div className="button-icon-container">
                {isSaved ? <FaBookmark /> : <FaRegBookmark />}
              </div>
              <span>{isSaved ? 'Saved' : 'Save Event'}</span>
              <div className="button-highlight"></div>
            </button>
            
            <button 
              className="cyber-modal-action cyber-share-button"
              onClick={handleShare}
            >
              <div className="button-icon-container">
                <FaShareAlt />
              </div>
              <span>Share</span>
              <div className="button-highlight"></div>
            </button>
            
            <button 
              className={`cyber-modal-action cyber-register-button ${isRegistered ? 'registered' : ''}`}
              onClick={handleRegister}
              disabled={isRegistered}
            >
              <div className="button-icon-container primary">
                {isRegistered ? <FaCheckCircle /> : <FaTicketAlt />}
              </div>
              <span>{isRegistered ? 'Registered' : 'Register Now'}</span>
              <FaChevronRight className="register-chevron" />
              <div className="button-highlight"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedEventModal;