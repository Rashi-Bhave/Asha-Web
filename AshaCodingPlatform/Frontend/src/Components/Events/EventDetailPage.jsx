// Frontend/src/Components/Events/EventDetailPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DynamicBackground from './DynamicBackground';
import { getEventById, saveEvent, registerForEvent } from '../../Services/Event.service';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaClock, FaBuilding, 
         FaArrowLeft, FaShareAlt, FaBookmark, FaRegBookmark, FaCheckCircle, 
         FaUsers, FaBrain, FaNetworkWired, FaChevronDown } from 'react-icons/fa';
import './EventsStyles.css';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [registered, setRegistered] = useState(false);
  
  // Parallax scrolling effect
  const [scrollY, setScrollY] = useState(0);
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  
  // Track scroll for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Apply parallax effects based on scroll position
      if (headerRef.current) {
        headerRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
      }
      
      if (contentRef.current) {
        contentRef.current.style.transform = `translateY(${-scrollY * 0.05}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollY]);

  // Fetch event on initial load
  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getEventById(id);
      
      if (response.success) {
        setEvent(response.event);
        setSaved(response.event.saved || false);
        setRegistered(response.event.registered || false);
      } else {
        setError('Failed to load event. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Failed to load event. Please try again later.');
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvent = async () => {
    try {
      await saveEvent(id);
      toast.success('Event saved successfully');
      setSaved(true);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  const handleRegisterEvent = async () => {
    try {
      // If event has external registration URL
      if (event.registrationUrl && event.registrationUrl !== '#') {
        window.open(event.registrationUrl, '_blank');
      } else {
        // Register through our platform
        await registerForEvent(id);
        toast.success('Successfully registered for event');
        setRegistered(true);
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error('Failed to register for event');
    }
  };

  // Format date with enhanced styling
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
    e.target.src = `https://picsum.photos/seed/${id}/800/400`;
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const lowerCategory = (category || '').toLowerCase();
    switch(lowerCategory) {
      case 'conference': return <FaNetworkWired />;
      case 'workshop': return <FaUsers />;
      case 'hackathon': return <FaBrain />;
      case 'webinar': return <i className="fas fa-laptop"></i>;
      case 'meetup': return <i className="fas fa-users"></i>;
      case 'community': return <i className="fas fa-heart"></i>;
      default: return <FaCalendarAlt />;
    }
  };

  // Render enhanced loading state
  const renderLoading = () => (
    <div className="cyber-loading-container">
      <div className="cyber-loading-spinner">
        <div className="cyber-spinner-ring"></div>
        <div className="cyber-spinner-ring"></div>
        <div className="cyber-spinner-ring"></div>
      </div>
      <p className="cyber-loading-text">Synthesizing event data</p>
    </div>
  );

  // Render enhanced error state
  const renderError = () => (
    <div className="cyber-error-container">
      <div className="cyber-error-icon">
        <i className="fas fa-exclamation-triangle"></i>
      </div>
      <h3 className="cyber-error-title">Data corruption detected</h3>
      <p className="cyber-error-message">{error}</p>
      <button 
        onClick={() => navigate('/events')}
        className="cyber-back-button"
      >
        <FaArrowLeft className="cyber-button-icon" />
        <span>Return to Events</span>
      </button>
    </div>
  );

  return (
    <div className="cyber-events-page">
      {/* Using DynamicBackground component */}
      <DynamicBackground 
        particleDensity={60} 
        showScannerLine={true}
        className="intense-background" 
      />
      
      <div className="cyber-event-detail-container">
        {/* Enhanced back button with animation */}
        <button
          onClick={() => navigate('/events')}
          className="cyber-back-button"
        >
          <FaArrowLeft className="cyber-button-icon" />
          <span>Back to Events</span>
        </button>
        
        {/* Main content */}
        {loading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : event ? (
          <div className="cyber-event-detail">
            {/* Event header with parallax effect */}
            <div className="cyber-event-detail-header" ref={headerRef}>
              <div className="cyber-event-detail-categories">
                <span className={`cyber-event-tag ${event.category.toLowerCase().replace(/\s+/g, '-')}`}>
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
              
              <h1 className="cyber-event-detail-title cyber-glitch" data-text={event.title}>
                {event.title}
              </h1>
              
              <div className="cyber-event-detail-organizer">
                <FaBuilding className="cyber-event-detail-icon" />
                <span>{event.organizer || 'Unknown Organizer'}</span>
              </div>
            </div>
            
            {/* Event image with overlay effects */}
            <div className="cyber-event-detail-image-container">
              {event.image && (
                <>
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="cyber-event-detail-image"
                    onError={handleImageError}
                  />
                  <div className="cyber-event-image-overlay"></div>
                  <div className="cyber-event-scanlines"></div>
                </>
              )}
            </div>
            
            {/* Event details with enhanced layout */}
            <div className="cyber-event-detail-content" ref={contentRef}>
              <div className="cyber-event-detail-info">
                <div className="cyber-event-detail-item">
                  <span className="cyber-event-detail-icon"><FaCalendarAlt /></span>
                  <span>{formatDate(event.date)}</span>
                </div>
                
                <div className="cyber-event-detail-item">
                  <span className="cyber-event-detail-icon"><FaMapMarkerAlt /></span>
                  <span>{event.virtual ? 'Online Event' : event.location}</span>
                </div>
                
                <div className="cyber-event-detail-item">
                  <span className="cyber-event-detail-icon"><FaTicketAlt /></span>
                  <span>{event.price || 'Free'}</span>
                </div>
              </div>
              
              {/* Enhanced action buttons */}
              <div className="cyber-event-detail-actions">
                <button 
                  className={`cyber-event-action-button cyber-save-button ${saved ? 'saved' : ''}`}
                  onClick={handleSaveEvent}
                  disabled={saved}
                >
                  {saved ? <FaBookmark /> : <FaRegBookmark />}
                  <span>{saved ? 'Saved' : 'Save Event'}</span>
                </button>
                
                <button 
                  className="cyber-event-action-button cyber-share-button"
                  onClick={() => {
                    // Copy event link to clipboard
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Event link copied to clipboard');
                  }}
                >
                  <FaShareAlt />
                  <span>Share</span>
                </button>
                
                <button 
                  className={`cyber-event-action-button cyber-register-button ${registered ? 'registered' : ''}`}
                  onClick={handleRegisterEvent}
                  disabled={registered}
                >
                  {registered ? <FaCheckCircle /> : <FaTicketAlt />}
                  <span>{registered ? 'Registered' : 'Register Now'}</span>
                </button>
              </div>
              
              {/* Enhanced description section with scroll indicator */}
              <div className="cyber-event-detail-description">
                <h2 className="cyber-section-title">
                  <span>About this event</span>
                  <div className="cyber-section-line"></div>
                </h2>
                <div className="cyber-event-scroll-indicator">
                  <FaChevronDown />
                  <span>Scroll for details</span>
                </div>
                <p>{event.description}</p>
              </div>
              
              {/* Enhanced speakers section */}
              {event.speakers && event.speakers.length > 0 && (
                <div className="cyber-event-detail-speakers">
                  <h2 className="cyber-section-title">
                    <span>Speakers</span>
                    <div className="cyber-section-line"></div>
                  </h2>
                  <div className="cyber-speakers-detail-list">
                    {event.speakers.map((speaker, index) => (
                      <div key={index} className="cyber-speaker-detail">
                        {speaker.image && (
                          <div className="cyber-speaker-detail-image-container">
                            <img 
                              src={speaker.image} 
                              alt={speaker.name} 
                              className="cyber-speaker-detail-image"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(speaker.name)}&background=random`;
                              }}
                            />
                          </div>
                        )}
                        <div className="cyber-speaker-detail-info">
                          <div className="cyber-speaker-detail-name">{speaker.name}</div>
                          {speaker.role && <div className="cyber-speaker-detail-role">{speaker.role}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="cyber-error-container">
            <div className="cyber-error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3 className="cyber-error-title">Event not found</h3>
            <p className="cyber-error-message">Sorry, we couldn't find the event you're looking for.</p>
            <button 
              onClick={() => navigate('/events')}
              className="cyber-back-button"
            >
              <FaArrowLeft className="cyber-button-icon" />
              <span>Return to Events</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Enhanced Status Ticker with separator dots */}
      <div className="cyber-status-ticker">
        <div className="cyber-ticker-content">
          <span className="cyber-ticker-text">Neural Event Network Online</span>
          <span className="cyber-ticker-separator"></span>
          <span className="cyber-ticker-text">Quantum Opportunity Processing</span>
          <span className="cyber-ticker-separator"></span>
          <span className="cyber-ticker-text">Community Connection Optimization</span>
          <span className="cyber-ticker-separator"></span>
          <span className="cyber-ticker-text">Deep Matching Algorithm Active</span>
          <span className="cyber-ticker-separator"></span>
          <span className="cyber-ticker-text">Neural Event Calibration Complete</span>
          <span className="cyber-ticker-separator"></span>
          <span className="cyber-ticker-text">Ready For Event Discovery</span>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;