// src/pages/JobsPage.js
import React, { useState, useEffect } from 'react';
import { fetchJobs } from '../api/jobsApi';
import "./JobsPage.css"

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('Bangalore');
  const [activeFilters, setActiveFilters] = useState([]);
  const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });

  // Keep track of the current search parameters
  const [searchParams, setSearchParams] = useState({
    search: '',
    location: 'Bangalore'
  });

  useEffect(() => {
    loadJobs();
  }, []);

  // Update active filters whenever location changes
  useEffect(() => {
    // Calculate active filters for display
    const active = [];
    
    // Add location if set
    if (locationQuery && locationQuery !== '') {
      active.push({
        category: 'location',
        value: locationQuery,
        label: `Location: ${locationQuery}`,
        id: `location-${locationQuery}`
      });
    }
    
    setActiveFilters(active);
  }, [locationQuery]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      setApiStatus({ show: false, message: '', type: '' });
      
      // Save current search parameters
      const currentParams = {
        search: searchQuery,
        location: locationQuery
      };
      setSearchParams(currentParams);
      
      console.log('Searching for jobs with params:', currentParams);
      const fetchedJobs = await fetchJobs(currentParams);
      
      setJobs(fetchedJobs);
      setLoading(false);
      
      if (fetchedJobs.length === 0) {
        // No jobs found but API call was successful
        setApiStatus({
          show: true,
          message: 'No jobs found matching your criteria. Try a different search or location.',
          type: 'info'
        });
      } else {
        // Success with jobs
        setApiStatus({
          show: true,
          message: `Found ${fetchedJobs.length} jobs matching your search.`,
          type: 'success'
        });
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setApiStatus(prev => ({ ...prev, show: false }));
        }, 3000);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError('Failed to load job listings. Please try again later.');
      setLoading(false);
      
      // Show error message
      setApiStatus({
        show: true,
        message: 'Error connecting to job search API. Showing fallback results instead.',
        type: 'error'
      });
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setLocationQuery('Bangalore');
    
    // Reset active filters
    setActiveFilters([]);
    
    // Load jobs with cleared filters
    setSearchParams({
      search: '',
      location: 'Bangalore'
    });
    
    // Reload jobs
    loadJobs();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadJobs(); // Trigger API search with current filters
  };

  const handleRemoveFilter = (category, value) => {
    if (category === 'location') {
      setLocationQuery('Bangalore');
    }
  };

  const renderJobCard = (job) => {
    const formattedDate = formatDate(job.postedDate);
    
    return (
      <div key={job.id} className="card">
        <div className="card-header">
          <div className="card-title-container">
            <h3 className="card-title">{job.title}</h3>
            <div className="card-subtitle">{job.company}</div>
          </div>
          
          {job.logo && (
            <img
              src={job.logo}
              alt={`${job.company} logo`}
              className="card-logo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/50?text=' + job.company.charAt(0);
              }}
            />
          )}
        </div>
        
        <div className="card-content">
          <div className="card-details">
            <div className="card-detail-item">
              <i className="fas fa-map-marker-alt"></i>
              <span className="card-detail-text">{job.location || 'Remote'}</span>
            </div>
            
            <div className="card-detail-item">
              <i className="fas fa-briefcase"></i>
              <span className="card-detail-text">{job.type || 'Full-time'}</span>
            </div>
            
            <div className="card-detail-item">
              <i className="fas fa-calendar"></i>
              <span className="card-detail-text">
                Posted {formattedDate}
              </span>
            </div>

            {job.experienceLevel && job.experienceLevel !== 'Not specified' && (
              <div className="card-detail-item">
                <i className="fas fa-user-graduate"></i>
                <span className="card-detail-text">{job.experienceLevel}</span>
              </div>
            )}
          </div>
          
          {job.salary && job.salary !== 'Salary not specified' && (
            <div className="card-salary">
              <i className="fas fa-money-bill-wave"></i> {job.salary}
            </div>
          )}
          
          <div className="tags-container">
            {job.skills && job.skills.map((skill, index) => (
              <span key={index} className="tag">{skill}</span>
            ))}
          </div>
          
          <p className="card-description">
            {job.description && job.description.length > 200
              ? `${job.description.substring(0, 200)}...`
              : job.description}
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
          
          <a 
            href={job.applyUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="primary-button"
          >
            Apply Now
          </a>
        </div>
      </div>
    );
  };

  const renderActiveFilters = () => {
    if (activeFilters.length === 0) return null;
    
    return (
      <div className="active-filters">
        <div className="active-filters-list">
          {activeFilters.map(filter => (
            <div key={filter.id} className="active-filter-tag">
              <span>{filter.label}</span>
              <button 
                className="remove-filter"
                onClick={() => handleRemoveFilter(filter.category, filter.value)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
          {activeFilters.length > 0 && (
            <button 
              className="clear-filters-button"
              onClick={handleClearFilters}
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderApiStatus = () => {
    if (!apiStatus.show) return null;
    
    return (
      <div className={`api-status-banner ${apiStatus.type}`}>
        <div>
          {apiStatus.type === 'success' && <i className="fas fa-check-circle"></i>}
          {apiStatus.type === 'error' && <i className="fas fa-exclamation-circle"></i>}
          {apiStatus.type === 'info' && <i className="fas fa-info-circle"></i>}
          <span>{apiStatus.message}</span>
        </div>
        <button 
          className="api-status-close"
          onClick={() => setApiStatus({ ...apiStatus, show: false })}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="loader"></div>
          <p>Searching for job listings...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-state">
          <i className="fas fa-exclamation-circle error-icon"></i>
          <h2 className="error-title">Oops! Something went wrong</h2>
          <p className="error-text">{error}</p>
          <button 
            className="primary-button"
            onClick={loadJobs}
          >
            <i className="fas fa-sync"></i> Try Again
          </button>
        </div>
      );
    }
    
    return (
      <div className="empty-state">
        <i className="fas fa-briefcase empty-icon"></i>
        <h2 className="empty-title">No jobs found</h2>
        <p className="empty-text">
          Try adjusting your filters or search query.
        </p>
        <button
          className="primary-button"
          onClick={handleClearFilters}
        >
          <i className="fas fa-filter"></i> Clear Filters
        </button>
      </div>
    );
  };

  return (
    <div className="jobs-page">
      <div className="page-header">
        <h1 className="page-title">Job Listings</h1>
        <p className="page-description">
          Discover opportunities that match your skills and career goals
        </p>
      </div>
      
      {renderApiStatus()}
      
      <div className="search-filter-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search jobs, skills, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </form>
        
        <div className="filter-buttons">
          <div className="location-filter">
            <input
              type="text"
              className="location-input"
              placeholder="Location (e.g., Bangalore)"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
          </div>
          <button
            className="refresh-button"
            onClick={loadJobs}
            disabled={loading}
          >
            <i className={`fas fa-sync ${loading ? 'fa-spin' : ''}`}></i>
            <span>Search</span>
          </button>
        </div>
      </div>
      
      {renderActiveFilters()}
      
      {jobs.length > 0 && !loading && (
        <div className="results-info">
          <span>{jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found</span>
          {jobs.length > 0 && (
            <div className="sort-options">
              <label>Sort by: </label>
              <select 
                className="sort-select"
                onChange={(e) => {
                  const sortedJobs = [...jobs];
                  if (e.target.value === 'date') {
                    sortedJobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
                  } else if (e.target.value === 'relevance') {
                    // This would be a more complex sorting algorithm in a real app
                    loadJobs(); // Just reload the original order
                    return;
                  }
                  setJobs(sortedJobs);
                }}
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date (newest first)</option>
              </select>
            </div>
          )}
        </div>
      )}
      
      <div className="jobs-list">
        {jobs.length > 0 ? (
          jobs.map(job => renderJobCard(job))
        ) : (
          renderEmptyState()
        )}
      </div>
    </div>
  );
};

// Utility function for JobsPage
const formatDate = (dateString) => {
  if (!dateString) return 'Recently';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} weeks ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
};

export default JobsPage;