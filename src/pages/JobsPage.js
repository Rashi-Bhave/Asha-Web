// src/pages/JobsPage.js
import React, { useState, useEffect } from 'react';
import { fetchJobs } from '../api/jobsApi';
import ApiTester from '../components/ApiTester';
import "./JobsPage.css";

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [showApiTester, setShowApiTester] = useState(false); // For development/admin use
  const [filters, setFilters] = useState({
    location: [],
    type: [],
    experience: [],
    industry: []
  });

  // Available filter options
  const filterOptions = {
    location: ['Remote', 'Hybrid', 'On-site', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad'],
    type: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    experience: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
    industry: ['Technology', 'Marketing & Advertising', 'Finance', 'Healthcare', 'Education', 'Manufacturing']
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, jobs]);

  useEffect(() => {
    // Calculate active filters for display
    const active = [];
    Object.entries(filters).forEach(([category, values]) => {
      values.forEach(value => {
        active.push({
          category,
          value,
          label: `${value}`,
          id: `${category}-${value}`
        });
      });
    });
    setActiveFilters(active);
  }, [filters]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create filters object from current state
      const apiFilters = {
        search: searchQuery,
        ...Object.entries(filters).reduce((acc, [key, values]) => {
          if (values.length === 1) {
            acc[key] = values[0];
          }
          return acc;
        }, {})
      };
      
      console.log('Fetching jobs with filters:', apiFilters);
      const fetchedJobs = await fetchJobs(apiFilters);
      console.log(`Received ${fetchedJobs.length} jobs from API`);
      
      setJobs(fetchedJobs);
      setFilteredJobs(fetchedJobs);
      setLoading(false);
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError('Failed to load job listings. Please try again later.');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!jobs.length) return;
    
    let result = [...jobs];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((job) => 
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        (job.skills && job.skills.some(skill => 
          skill.toLowerCase().includes(query)
        ))
      );
    }
    
    // Apply location filters
    if (filters.location.length > 0) {
      result = result.filter((job) => 
        filters.location.some(loc => 
          job.location && job.location.toLowerCase().includes(loc.toLowerCase())
        )
      );
    }
    
    // Apply job type filters
    if (filters.type.length > 0) {
      result = result.filter((job) => 
        filters.type.some(type => 
          job.type && job.type.toLowerCase().includes(type.toLowerCase())
        )
      );
    }
    
    // Apply experience level filters
    if (filters.experience.length > 0) {
      result = result.filter((job) => 
        filters.experience.some(exp => 
          job.experienceLevel && job.experienceLevel.toLowerCase().includes(exp.toLowerCase())
        )
      );
    }

    // Apply industry filters
    if (filters.industry.length > 0) {
      result = result.filter((job) => 
        filters.industry.some(ind => 
          job.industry && job.industry.toLowerCase().includes(ind.toLowerCase())
        )
      );
    }
    
    setFilteredJobs(result);
  };

  const toggleFilter = (category, value) => {
    setFilters(prevFilters => {
      const updated = { ...prevFilters };
      
      if (updated[category].includes(value)) {
        // Remove the filter if already applied
        updated[category] = updated[category].filter(v => v !== value);
      } else {
        // Add the filter
        updated[category] = [...updated[category], value];
      }
      
      return updated;
    });
  };

  const removeFilter = (category, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [category]: prevFilters[category].filter(v => v !== value)
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: [],
      type: [],
      experience: [],
      industry: []
    });
    setSearchQuery('');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadJobs(); // Reload jobs with the new search query
  };

  const handleRefresh = () => {
    loadJobs();
  };

  const toggleApiTester = () => {
    setShowApiTester(!showApiTester);
  };

  const renderFilterCategory = (category, title) => {
    return (
      <div className="filter-category">
        <h3 className="filter-title">{title}</h3>
        <div className="filter-options">
          {filterOptions[category].map((option) => (
            <label key={option} className="filter-option">
              <input
                type="checkbox"
                checked={filters[category].includes(option)}
                onChange={() => toggleFilter(category, option)}
              />
              <span className="filter-option-text">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderFilterSection = () => {
    if (!filterVisible) return null;
    
    return (
      <div className="filter-section">
        {renderFilterCategory('location', 'Location')}
        {renderFilterCategory('type', 'Job Type')}
        {renderFilterCategory('experience', 'Experience Level')}
        {renderFilterCategory('industry', 'Industry')}
        
        <div className="filter-actions">
          <button
            className="secondary-button"
            onClick={clearFilters}
          >
            <i className="fas fa-times"></i> Clear All
          </button>
          <button
            className="primary-button"
            onClick={() => setFilterVisible(false)}
          >
            <i className="fas fa-check"></i> Apply Filters
          </button>
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
                onClick={() => removeFilter(filter.category, filter.value)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
          {activeFilters.length > 0 && (
            <button 
              className="clear-filters-button"
              onClick={clearFilters}
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    );
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
              <span className="card-detail-text">{job.location || 'Location not specified'}</span>
            </div>
            
            <div className="card-detail-item">
              <i className="fas fa-briefcase"></i>
              <span className="card-detail-text">{job.type || 'Job type not specified'}</span>
            </div>
            
            <div className="card-detail-item">
              <i className="fas fa-calendar"></i>
              <span className="card-detail-text">
                Posted {formattedDate}
              </span>
            </div>

            {job.experienceLevel && (
              <div className="card-detail-item">
                <i className="fas fa-user-graduate"></i>
                <span className="card-detail-text">{job.experienceLevel}</span>
              </div>
            )}
          </div>
          
          {job.salary && job.salary !== 'Not specified' && job.salary !== 'Salary not specified' && (
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
              : job.description || 'No description available'}
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
          <div className="error-actions">
            <button 
              className="primary-button"
              onClick={handleRefresh}
            >
              <i className="fas fa-sync"></i> Try Again
            </button>
            
            <button 
              className="secondary-button"
              onClick={toggleApiTester}
            >
              <i className="fas fa-wrench"></i> Debug API Connection
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="empty-state">
        <i className="fas fa-briefcase empty-icon"></i>
        <h2 className="empty-title">No jobs found</h2>
        <p className="empty-text">
          {searchQuery || Object.values(filters).some(f => f.length > 0)
            ? "Try adjusting your filters or search query."
            : "There are no job listings available at the moment. Please check back later."}
        </p>
        {(searchQuery || Object.values(filters).some(f => f.length > 0)) && (
          <button
            className="primary-button"
            onClick={clearFilters}
          >
            <i className="fas fa-filter"></i> Clear Filters
          </button>
        )}
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
      
      {/* API Tester (hidden by default, can be shown when debugging) */}
      {showApiTester && <ApiTester />}
      
      <div className="search-filter-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search jobs, companies, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </form>
        
        <div className="filter-buttons">
          <button
            className={`filter-toggle-button ${filterVisible ? 'active' : ''}`}
            onClick={() => setFilterVisible(!filterVisible)}
          >
            <i className="fas fa-filter"></i>
            <span>Filters</span>
          </button>
          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={loading}
          >
            <i className={`fas fa-sync ${loading ? 'fa-spin' : ''}`}></i>
            <span>Refresh</span>
          </button>
          
          {/* Hidden debug button - only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <button
              className="refresh-button"
              onClick={toggleApiTester}
              style={{ marginLeft: '8px' }}
            >
              <i className="fas fa-wrench"></i>
              <span>Debug</span>
            </button>
          )}
        </div>
      </div>
      
      {renderFilterSection()}
      {renderActiveFilters()}
      
      {filteredJobs.length > 0 && !loading && (
        <div className="results-info">
          <span>{filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found</span>
          {jobs.length > 0 && (
            <div className="sort-options">
              <label>Sort by: </label>
              <select 
                className="sort-select"
                onChange={(e) => {
                  const sortedJobs = [...filteredJobs];
                  if (e.target.value === 'date') {
                    sortedJobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
                  } else if (e.target.value === 'relevance') {
                    // This would be a more complex sorting algorithm in a real app
                    // For now, we'll just restore the original order
                    applyFilters();
                    return;
                  }
                  setFilteredJobs(sortedJobs);
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
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => renderJobCard(job))
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
  
  try {
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
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Recently';
  }
};

export default JobsPage;