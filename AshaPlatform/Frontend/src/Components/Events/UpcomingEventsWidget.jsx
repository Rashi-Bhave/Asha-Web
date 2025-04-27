// Frontend/src/Components/Events/UpcomingEventsWidget.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../../Services/Event.service';
import DynamicBackground from './DynamicBackground';
import { FaCalendarAlt, FaMapMarkerAlt, FaExternalLinkAlt, 
         FaClock, FaArrowRight, FaSyncAlt } from 'react-icons/fa';
import './EventsStyles.css';

const UpcomingEventsWidget = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const widgetRef = useRef(null);

  useEffect(() => {
    fetchUpcomingEvents();
    
    // Auto-rotate featured events
    const interval = setInterval(() => {
      if (events.length > 1) {
        setActiveIndex(prev => (prev + 1) % events.length);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [events.length]);

  const fetchUpcomingEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch upcoming events, limiting to 3
      const response = await getEvents({ 
        sort: 'date',
        limit: 3
      });
      
      if (response.success) {
        setEvents(response.events);
      } else {
        setError('Failed to load events');
      }
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Format date in a compact way with enhanced visualization
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      
      // Check if it's today or tomorrow
      if (date.toDateString() === now.toDateString()) {
        return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Otherwise just show date
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'TBD';
    }
  };
  
  // Calculate days remaining with visual indicator
  const getDaysRemaining = (dateString) => {
    if (!dateString) return null;
    
    try {
      const eventDate = new Date(dateString);
      const now = new Date();
      
      // Reset time to compare only dates
      eventDate.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      
      // Calculate difference in days
      const diffTime = eventDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return { days: 0, label: 'Today' };
      if (diffDays === 1) return { days: 1, label: 'Tomorrow' };
      if (diffDays > 0) return { days: diffDays, label: `${diffDays} days left` };
      
      return null;
    } catch (e) {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="cyber-events-widget">
        <div className="cyber-widget-header">
          <FaCalendarAlt className="cyber-widget-icon" />
          <h3 className="cyber-widget-title">Upcoming Events</h3>
        </div>
        <div className="cyber-widget-loading">
          <div className="cyber-spinner-mini"></div>
          <span>Scanning timeline for events...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cyber-events-widget">
        <div className="cyber-widget-header">
          <FaCalendarAlt className="cyber-widget-icon" />
          <h3 className="cyber-widget-title">Upcoming Events</h3>
        </div>
        <div className="cyber-widget-error">
          <p>Couldn't load upcoming events</p>
          <button onClick={fetchUpcomingEvents} className="cyber-widget-retry-button">
            <FaSyncAlt className="cyber-retry-icon-mini" />
            <span>Recalibrate</span>
          </button>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="cyber-events-widget">
        <div className="cyber-widget-header">
          <FaCalendarAlt className="cyber-widget-icon" />
          <h3 className="cyber-widget-title">Upcoming Events</h3>
        </div>
        <div className="cyber-widget-empty">
          <p>No upcoming events detected</p>
          <Link to="/events" className="cyber-widget-link">
            <span>Browse Events</span>
            <FaExternalLinkAlt className="cyber-widget-icon-mini" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-events-widget" ref={widgetRef}>
      {/* Using DynamicBackground with reduced density */}
      <DynamicBackground 
        particleDensity={15} 
        showScannerLine={false} 
        className="cyber-widget-background"
      />
      
      <div className="cyber-widget-header">
        <FaCalendarAlt className="cyber-widget-icon pulse" />
        <h3 className="cyber-widget-title">Upcoming Events</h3>
      </div>
      
      {/* Enhanced content with featured event */}
      <div className="cyber-widget-content">
        <div className="cyber-widget-featured">
          {events.map((event, index) => (
            <Link 
              to={`/events/${event.id || event._id}`} 
              key={event.id || event._id} 
              className={`cyber-widget-featured-item ${index === activeIndex ? 'active' : ''}`}
              style={{transform: `translateX(${(index - activeIndex) * 100}%)`}}
            >
              <div className="cyber-widget-featured-image">
                <img 
                  src={event.image || `https://picsum.photos/seed/${event.id || event._id}/400/200`} 
                  alt={event.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://picsum.photos/seed/${event.id || event._id}/400/200`;
                  }}
                />
                <div className="cyber-widget-featured-overlay"></div>
                <div className="cyber-widget-featured-scanlines"></div>
              </div>
              <div className="cyber-widget-featured-content">
                <h4 className="cyber-widget-featured-title">{event.title}</h4>
                <div className="cyber-widget-featured-details">
                  <div className="cyber-widget-featured-detail">
                    <FaCalendarAlt className="cyber-widget-icon-mini" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="cyber-widget-featured-detail">
                    <FaMapMarkerAlt className="cyber-widget-icon-mini" />
                    <span>{event.virtual ? 'Virtual' : event.location?.split(',')[0]}</span>
                  </div>
                </div>
                
                {/* Countdown indicator */}
                {getDaysRemaining(event.date) && (
                  <div className="cyber-widget-countdown">
                    <FaClock className="cyber-widget-icon-mini" />
                    <span>{getDaysRemaining(event.date).label}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
        
        {/* Indicator dots for featured events */}
        {events.length > 1 && (
          <div className="cyber-widget-indicators">
            {events.map((_, index) => (
              <button 
                key={index} 
                className={`cyber-widget-indicator ${index === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="cyber-widget-footer">
        <Link to="/events" className="cyber-widget-view-all">
          <span>View All Events</span>
          <FaArrowRight className="cyber-widget-icon-mini" />
        </Link>
      </div>
    </div>
  );
};

export default UpcomingEventsWidget;