// Frontend/src/Components/Events/EventsPage.jsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import EventCard from './EventCard';
import DynamicBackground from './DynamicBackground';
import { getEvents, saveEvent, unsaveEvent, registerForEvent, getMockEvents } from '../../Services/Event.service';
import { FaSearch, FaCalendarAlt, FaFilter, FaSyncAlt, FaMapMarkerAlt, FaVenus, 
         FaBrain, FaNetworkWired, FaRegLightbulb, FaSort, FaSortAmountDown } from 'react-icons/fa';
import './EventsStyles.css';
import EnhancedEventCard from './EnhancedEventCard';


const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [semanticSearchUsed, setSemanticSearchUsed] = useState(false);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [forWomen, setForWomen] = useState(false);
  const [virtualOnly, setVirtualOnly] = useState(false);
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [activeEventId, setActiveEventId] = useState(null);

  const [viewMode, setViewMode] = useState('compact'); // or 'compact'


  
  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10
  });

  // Available event categories with enhanced icons
  const eventCategories = [
    { id: 'conference', label: 'Conference', icon: <FaNetworkWired /> },
    { id: 'workshop', label: 'Workshop', icon: <FaRegLightbulb /> },
    { id: 'hackathon', label: 'Hackathon', icon: <FaBrain /> },
    { id: 'webinar', label: 'Webinar', icon: <FaCalendarAlt /> },
    { id: 'meetup', label: 'Meetup', icon: <FaMapMarkerAlt /> },
    { id: 'community', label: 'Community', icon: <FaVenus /> }
  ];

  // Fetch events on initial load and filter changes
  useEffect(() => {
    fetchEvents();
  }, [page, sortBy]);

  const fetchEvents = async (filterParams = null) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = filterParams || {
        search: searchQuery,
        location: locationQuery,
        category: selectedCategories.join(','),
        forWomen: forWomen,
        virtual: virtualOnly,
        sort: sortBy,
        page
      };
      
      // Make API request
      const response = await getEvents(params);
      
      // Set events and pagination
      setEvents(response.events);
      setSemanticSearchUsed(response.semanticSearch || false);
      
      if (response.pagination) {
        setPagination(response.pagination);
      } else {
        // Mock pagination for development
        setPagination({
          total: response.events.length,
          pages: 1,
          page: 1,
          limit: 10
        });
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again later.');
      toast.error('Failed to load events');
      
      // Fallback to mock data
      try {
        const mockResponse = await getMockEvents();
        setEvents(mockResponse.events);
        setSemanticSearchUsed(false);
        setPagination({
          total: mockResponse.events.length,
          pages: 1,
          page: 1,
          limit: 10
        });
      } catch (mockError) {
        console.error('Error fetching mock events:', mockError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchEvents({
      search: searchQuery,
      location: locationQuery,
      category: selectedCategories.join(','),
      forWomen: forWomen,
      virtual: virtualOnly,
      sort: sortBy,
      page: 1
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    setSelectedCategories([]);
    setForWomen(false);
    setVirtualOnly(false);
    setPage(1);
    
    // Fetch events with cleared filters
    fetchEvents({
      sort: sortBy,
      page: 1
    });
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleSaveEvent = async (eventId) => {
    try {
      await saveEvent(eventId);
      toast.success('Event saved successfully');
      
      // Update local state to reflect saved status
      setEvents(prevEvents => 
        prevEvents.map(event => 
          (event.id === eventId || event._id === eventId)
            ? { ...event, saved: true } 
            : event
        )
      );
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  const handleRegisterEvent = async (eventId, registrationUrl) => {
    if (registrationUrl && registrationUrl !== '#') {
      // External registration URL
      window.open(registrationUrl, '_blank');
    } else {
      // Register through our platform
      try {
        await registerForEvent(eventId);
        toast.success('Successfully registered for event');
        
        // Update local state to reflect registration status
        setEvents(prevEvents => 
          prevEvents.map(event => 
            (event.id === eventId || event._id === eventId)
              ? { ...event, registered: true } 
              : event
          )
        );
      } catch (error) {
        console.error('Error registering for event:', error);
        toast.error('Failed to register for event');
      }
    }
  };
  
  const toggleEventExpand = (eventId) => {
    if (activeEventId === eventId) {
      setActiveEventId(null);
    } else {
      setActiveEventId(eventId);
    }
  };

  // Render event card component
  const renderEventCard = (event) => {
    const eventId = event.id || event._id;
    
    if (viewMode === 'compact') {
      return (
        <EnhancedEventCard 
          key={eventId}
          event={event}
          onSave={() => handleSaveEvent(eventId)}
          onRegister={() => handleRegisterEvent(eventId, event.registrationUrl)}
        />
      );
    }
    
    // Original EventCard rendering for standard view
    return (
      <EventCard 
        key={eventId}
        event={event}
        isActive={isActive}
        isSaved={event.saved}
        isRegistered={event.registered}
        onClick={() => toggleEventExpand(eventId)}
        onSave={() => handleSaveEvent(eventId)}
        onRegister={() => handleRegisterEvent(eventId, event.registrationUrl)}
      />
    );
  };

  // Render loading state with enhanced animation
  const renderLoading = () => (
    <div className="cyber-loading-container">
      <div className="cyber-loading-spinner">
        <div className="cyber-spinner-ring"></div>
        <div className="cyber-spinner-ring"></div>
        <div className="cyber-spinner-ring"></div>
      </div>
      <p className="cyber-loading-text">Scanning neural event singularities</p>
    </div>
  );

  // Render error state with enhanced visuals
  const renderError = () => (
    <div className="cyber-error-container">
      <div className="cyber-error-icon">
        <i className="fas fa-exclamation-triangle"></i>
      </div>
      <h3 className="cyber-error-title">Quantum fluctuation detected</h3>
      <p className="cyber-error-message">{error}</p>
      <button 
        onClick={() => fetchEvents()}
        className="cyber-retry-button"
      >
        <FaSyncAlt className="cyber-retry-icon" />
        <span>Recalibrate</span>
      </button>
    </div>
  );

  // Render empty state with enhanced visuals
  const renderEmpty = () => (
    <div className="cyber-empty-container">
      <div className="cyber-empty-icon">
        <FaCalendarAlt />
      </div>
      <h3 className="cyber-empty-title">No events detected in the timestream</h3>
      <p className="cyber-empty-message">
        We couldn't find any events matching your search parameters. Try adjusting your filters or search terms.
      </p>
      <button 
        onClick={handleClearFilters}
        className="cyber-clear-filters-button"
      >
        <i className="fas fa-filter-circle-xmark"></i>
        <span>Reset Filters</span>
      </button>
    </div>
  );

  return (
    <div className="cyber-events-page">
      {/* Using the DynamicBackground component */}
      <DynamicBackground 
        particleDensity={40} 
        showScannerLine={true}
        className="intense-background" 
      />
      
      <div className="cyber-events-container">
        {/* Enhanced header with glitch effect */}
        <div className="cyber-events-header">
          <div className="cyber-events-title-section">
            <div className="cyber-events-icon">
              <FaCalendarAlt />
            </div>
            <div>
              <h1 className="cyber-events-title cyber-glitch" data-text="Events & Workshops">
                Events & Workshops
                <span className="cyber-blink">_</span>
              </h1>
              <p className="cyber-events-subtitle">
                Discover upcoming events, workshops, and networking opportunities
              </p>
            </div>
          </div>
        </div>
        
        {/* Enhanced search and filter bar */}
        <div className="cyber-search-panel">
          <form onSubmit={handleSearch} className="cyber-search-form">
            <div className="cyber-search-input-container">
              <input
                type="text"
                className="cyber-search-input"
                placeholder="Search events by title, description, or keywords"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="cyber-search-icon" />
            </div>
            
            <div className="cyber-location-input-container">
              <input
                type="text"
                className="cyber-location-input"
                placeholder="Location"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
              <FaMapMarkerAlt className="cyber-location-icon" />
            </div>
            
            <div className="cyber-search-actions">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="cyber-filter-button"
              >
                <FaFilter className="cyber-button-icon" />
                <span>Filters</span>
              </button>
              
              <button
                type="submit"
                className="cyber-search-button"
              >
                <FaSearch className="cyber-button-icon" />
                <span>Search</span>
              </button>
            </div>
          </form>
          
          {/* Enhanced advanced filters */}
          {showFilters && (
            <div className={`cyber-filters-section ${showFilters ? 'expanded' : ''}`}>
            <div className="cyber-filter-controls">
                <div className="cyber-filter-group">
                  <label className="cyber-filter-label">
                    Event Categories
                  </label>
                  <div className="cyber-categories-options">
                    {eventCategories.map(category => (
                      <label key={category.id} className="cyber-category-option">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="cyber-category-checkbox"
                        />
                        <span className="cyber-category-label">
                          {category.icon} {category.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="cyber-filter-toggles">
                  <label className="cyber-toggle-option">
                    <div className="cyber-toggle-text">
                      <FaVenus className="cyber-toggle-icon" />
                      <span>For Women</span>
                    </div>
                    <div className="cyber-toggle-switch">
                      <input
                        type="checkbox"
                        checked={forWomen}
                        onChange={(e) => setForWomen(e.target.checked)}
                      />
                      <span className="cyber-toggle-slider"></span>
                    </div>
                  </label>
                  
                  <label className="cyber-toggle-option">
                    <div className="cyber-toggle-text">
                      <i className="fas fa-laptop-house cyber-toggle-icon"></i>
                      <span>Virtual Only</span>
                    </div>
                    <div className="cyber-toggle-switch">
                      <input
                        type="checkbox"
                        checked={virtualOnly}
                        onChange={(e) => setVirtualOnly(e.target.checked)}
                      />
                      <span className="cyber-toggle-slider"></span>
                    </div>
                  </label>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleClearFilters}
                className="cyber-clear-button"
              >
                <span>Clear All Filters</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Enhanced results info and sorting */}
        {!loading && !error && events.length > 0 && (
          <div className="cyber-results-header">
            <div className="cyber-results-count">
              Showing <span className="cyber-count-highlight">{events.length}</span> of <span className="cyber-count-highlight">{pagination.total}</span> events
              {semanticSearchUsed && (
                <span className="cyber-semantic-search-badge">
                  <FaBrain />
                  <span>Semantic Search</span>
                </span>
              )}
            </div>
            
            <div className="cyber-sort-controls">
  <span className="cyber-sort-label">Sort by:</span>
  <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    className="cyber-sort-select"
  >
    <option value="date">Date (Upcoming)</option>
    <option value="popularity">Popularity</option>
  </select>
  <FaSortAmountDown className="cyber-sort-icon" />
  
  {/* View mode toggle */}
  <div className="cyber-view-toggle">
    <button 
      className={`cyber-view-button ${viewMode === 'regular' ? 'active' : ''}`}
      onClick={() => setViewMode('regular')}
    >
      <i className="fas fa-th-large"></i>
    </button>
    <button 
      className={`cyber-view-button ${viewMode === 'compact' ? 'active' : ''}`}
      onClick={() => setViewMode('compact')}
    >
      <i className="fas fa-th"></i>
    </button>
  </div>
</div>
          </div>
        )}
        
        {/* Main content with enhanced layouts */}
        <div className="cyber-events-content">
          {loading ? (
            renderLoading()
          ) : error ? (
            renderError()
          ) : events.length > 0 ? (
            <div className={`cyber-events-list ${viewMode === 'compact' ? 'compact-view' : ''}`}>
              {events.map(event => renderEventCard(event))}
            </div>
          ) : (
            renderEmpty()
          )}
        </div>
        
        {/* Enhanced pagination */}
        {!loading && !error && pagination.pages > 1 && (
          <div className="cyber-pagination">
            <button
              onClick={() => setPage(page > 1 ? page - 1 : 1)}
              disabled={page === 1}
              className={`cyber-pagination-button ${page === 1 ? 'cyber-pagination-disabled' : ''}`}
            >
              <i className="fas fa-chevron-left"></i>
              <span>Previous</span>
            </button>
            
            <div className="cyber-pagination-pages">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`cyber-pagination-number ${pageNum === page ? 'cyber-pagination-active' : ''}`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setPage(page < pagination.pages ? page + 1 : pagination.pages)}
              disabled={page === pagination.pages}
              className={`cyber-pagination-button ${page === pagination.pages ? 'cyber-pagination-disabled' : ''}`}
            >
              <span>Next</span>
              <i className="fas fa-chevron-right"></i>
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

export default EventsPage;