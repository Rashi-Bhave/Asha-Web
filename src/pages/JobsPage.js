// Placeholder content for JobsPage.js
// pages/JobsPage.js
import React, { useState, useEffect } from 'react';
import { fetchJobs } from '../api/jobsApi';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    location: [],
    type: [],
    experience: [],
  });

  // Available filter options
  const filterOptions = {
    location: ['Remote', 'Hybrid', 'On-site'],
    type: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    experience: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, jobs]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const fetchedJobs = await fetchJobs();
      setJobs(fetchedJobs);
      setLoading(false);
    } catch (error) {
      console.error('Error loading jobs:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...jobs];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((job) => 
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)
      );
    }
    
    // Apply location filters
    if (filters.location.length > 0) {
      result = result.filter((job) => 
        filters.location.some(loc => 
          job.location.toLowerCase().includes(loc.toLowerCase())
        )
      );
    }
    
    // Apply job type filters
    if (filters.type.length > 0) {
      result = result.filter((job) => 
        filters.type.some(type => 
          job.type.toLowerCase().includes(type.toLowerCase())
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

  const clearFilters = () => {
    setFilters({
      location: [],
      type: [],
      experience: [],
    });
    setSearchQuery('');
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
        
        <div className="filter-actions">
          <button
            className="secondary-button"
            onClick={clearFilters}
          >
            Clear All
          </button>
          <button
            className="primary-button"
            onClick={() => setFilterVisible(false)}
          >
            Apply Filters
          </button>
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
          </div>
          
          {job.salary && (
            <div className="card-salary">{job.salary}</div>
          )}
          
          <div className="tags-container">
            {job.skills && job.skills.map((skill, index) => (
              <span key={index} className="tag">{skill}</span>
            ))}
          </div>
          
          <p className="card-description">
            {job.description.length > 200
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

  const renderEmptyState = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading job listings...</p>
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
            Clear Filters
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
      
      <div className="search-filter-container">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search jobs, companies, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </div>
        
        <button
          className={`filter-toggle-button ${filterVisible ? 'active' : ''}`}
          onClick={() => setFilterVisible(!filterVisible)}
        >
          <i className="fas fa-filter"></i>
          <span>Filters</span>
        </button>
      </div>
      
      {renderFilterSection()}
      
      {filteredJobs.length > 0 && (
        <div className="results-info">
          <span>{filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found</span>
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

