// src/pages/EventsPage.js
import React, { useState, useEffect } from 'react';
import PerplexityService from '../api/perplexityService';
import EventCard from '../components/EventCard';
import LoadingIndicator from '../components/LoadingIndicator';

const EventsPage = () => {
  // State
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [location, setLocation] = useState('Bangalore');
  const [forWomen, setForWomen] = useState(true);
  const [profile, setProfile] = useState('');
  const [selectedEventTypes, setSelectedEventTypes] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Available event types
  const eventTypeOptions = [
    { id: 'meetups', label: 'Meetups' },
    { id: 'webinar', label: 'Webinar' },
    { id: 'hackathon', label: 'Hackathon' },
    { id: 'community', label: 'Community Connects' }
  ];
  
  // Initial search on page load
  useEffect(() => {
    searchEvents();
  }, []);
  
  // Function to handle the search
  const searchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the selected event types labels for search
      const eventTypesForSearch = selectedEventTypes.length > 0
        ? selectedEventTypes.map(typeId => {
            const option = eventTypeOptions.find(opt => opt.id === typeId);
            return option ? option.label : '';
          })
        : ['Meetups', 'Webinar', 'Hackathon', 'Community Connects'];
      
      // Call the Perplexity service to search for events
      const searchResults = await PerplexityService.searchEvents({
        location,
        eventTypes: eventTypesForSearch,
        forWomen,
        profile
      });
      
      setEvents(searchResults);
      setSearchPerformed(true);
    } catch (err) {
      console.error('Error searching events:', err);
      setError('Failed to search for events. Please try again later.');
      
      // Fallback to mock data
      const mockEvents = PerplexityService.getMockEvents({
        location,
        profile
      });
      setEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle event type selection
  const handleEventTypeToggle = (typeId) => {
    setSelectedEventTypes(prev => {
      if (prev.includes(typeId)) {
        return prev.filter(id => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };
  
  // Handle search form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    searchEvents();
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      // If parsing fails, return the original string
      return dateString;
    }
  };
  
  return (
    <div className="events-page">
      <div className="page-header">
        <h1 className="page-title">Events & Workshops</h1>
        <p className="page-description">
          Discover upcoming events, workshops, and networking opportunities
        </p>
      </div>
      
      {/* Search and Filter Section */}
      <div className="search-filter-container">
        <form onSubmit={handleSubmit} className="events-search-form">
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Location:</label>
              <input
                type="text"
                className="location-input"
                placeholder="Enter location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Profile/Interest:</label>
              <input
                type="text"
                className="profile-input"
                placeholder="AI/ML, Design, Leadership, etc."
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
              />
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group event-types">
              <label className="filter-label">Event Types:</label>
              <div className="event-type-options">
                {eventTypeOptions.map(option => (
                  <div className="event-type-option" key={option.id}>
                    <input
                      type="checkbox"
                      id={option.id}
                      checked={selectedEventTypes.includes(option.id)}
                      onChange={() => handleEventTypeToggle(option.id)}
                    />
                    <label htmlFor={option.id}>{option.label}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="filter-group women-toggle">
              <label className="filter-label">
                <input
                  type="checkbox"
                  checked={forWomen}
                  onChange={() => setForWomen(!forWomen)}
                />
                For Women
              </label>
            </div>
          </div>
          
          <button type="submit" className="search-button primary-button">
            <i className="fas fa-search"></i> Search Events
          </button>
        </form>
      </div>
      
      {/* Display search results */}
      <div className="events-list">
        {loading ? (
          <LoadingIndicator message="Searching for events..." />
        ) : error ? (
          <div className="error-state">
            <i className="fas fa-exclamation-circle error-icon"></i>
            <h2 className="error-title">Error</h2>
            <p className="error-text">{error}</p>
          </div>
        ) : events.length > 0 ? (
          <>
            <div className="results-info">
              Found {events.length} events
              {location && ` in ${location}`}
              {forWomen && ' for women'}
              {profile && ` related to ${profile}`}
            </div>
            <div className="events-grid">
              {events.map(event => (
                <EventCard 
                  key={event.id} 
                  event={{
                    ...event,
                    date: formatDate(event.date)
                  }} 
                />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <i className="fas fa-calendar empty-icon"></i>
            <h2 className="empty-title">No events found</h2>
            <p className="empty-text">
              {searchPerformed
                ? "No events match your current filters. Try adjusting your search criteria."
                : "Search for events using the filters above."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;