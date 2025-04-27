import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaSearch, FaBriefcase, FaFilter, FaSyncAlt, FaStar, FaMapMarkerAlt, FaClock, FaBookmark, FaRegBookmark, FaPaperPlane } from 'react-icons/fa';

// API base URL
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [jobType, setJobType] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [activeJobId, setActiveJobId] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10
  });

  // Track mouse movement for background effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePosition({ x, y });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch jobs on initial load and filter changes
  useEffect(() => {
    fetchJobs();
  }, [page, sortBy]);

  const fetchJobs = async (filterParams = null) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = filterParams || {
        search: searchQuery,
        location: locationQuery,
        experienceLevel,
        jobType,
        remote: remoteOnly,
        sort: sortBy,
        page
      };
      
      // Make API request
      const response = await axios.get(`${API_URL}/jobs`, { params });
      
      setJobs(response.data.jobs);
      // setPagination(response.data.pagination);
      
      // Mock pagination for development
      setPagination({
        total: 100,
        pages: 5,
        page: page,
        limit: 10
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs. Please try again later.');
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchJobs({
      search: searchQuery,
      location: locationQuery,
      experienceLevel,
      jobType,
      remote: remoteOnly,
      sort: sortBy,
      page: 1
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    setExperienceLevel('');
    setJobType('');
    setRemoteOnly(false);
    setPage(1);
    
    // Fetch jobs with cleared filters
    fetchJobs({
      sort: sortBy,
      page: 1
    });
  };

  const handleSaveJob = async (jobId, e) => {
    e.stopPropagation();
    try {
      await axios.post(`${API_URL}/jobs/save/${jobId}`);
      toast.success('Job saved successfully');
      
      // Update local state to reflect saved status
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job._id === jobId 
            ? { ...job, saved: true } 
            : job
        )
      );
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    }
  };

  const handleApplyJob = (applyUrl, e) => {
    e.stopPropagation();
    window.open(applyUrl, '_blank');
  };
  
  const toggleJobExpand = (jobId) => {
    if (activeJobId === jobId) {
      setActiveJobId(null);
    } else {
      setActiveJobId(jobId);
    }
  };

  // Format date helper function
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

  // Render job card component
  const renderJobCard = (job) => {
    const isActive = activeJobId === job._id;
    
    return (
      <div 
        key={job._id} 
        className={`cyber-job-card ${isActive ? 'cyber-job-active' : ''}`}
        onClick={() => toggleJobExpand(job._id)}
      >
        <div className="cyber-job-header">
          <div className="cyber-job-logo">
            {job.logo ? (
              <img 
                src={job.logo} 
                alt={`${job.company} logo`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=random`;
                }}
              />
            ) : (
              <div className="cyber-job-logo-placeholder">
                {job.company.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="cyber-job-title-section">
            <h3 className="cyber-job-title">{job.title}</h3>
            <div className="cyber-job-company">{job.company}</div>
          </div>
          
          {job.salary && (
            <div className="cyber-job-salary">
              <i className="fas fa-money-bill-wave"></i>
              <span>{job.salary}</span>
            </div>
          )}
        </div>
        
        <div className="cyber-job-meta">
          <div className="cyber-job-meta-item">
            <FaMapMarkerAlt className="cyber-job-meta-icon" />
            <span>{job.location || 'Remote'}</span>
          </div>
          
          <div className="cyber-job-meta-item">
            <FaBriefcase className="cyber-job-meta-icon" />
            <span>{job.type || 'Full-time'}</span>
          </div>
          
          {job.experienceLevel && (
            <div className="cyber-job-meta-item">
              <FaStar className="cyber-job-meta-icon" />
              <span>{job.experienceLevel}</span>
            </div>
          )}
          
          <div className="cyber-job-meta-item">
            <FaClock className="cyber-job-meta-icon" />
            <span>{formatDate(job.postedDate)}</span>
          </div>
        </div>
        
        <div className="cyber-job-body">
          {/* Skills tags */}
          {job.skills && job.skills.length > 0 && (
            <div className="cyber-job-skills">
              {job.skills.map((skill, index) => (
                <span key={index} className="cyber-skill-tag">{skill}</span>
              ))}
            </div>
          )}
          
          {/* Job description */}
          <div className="cyber-job-description">
            {isActive ? (
              <p>{job.description}</p>
            ) : (
              <p>{job.description && job.description.length > 150 
                ? `${job.description.substring(0, 150)}...` 
                : job.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="cyber-job-actions">
          <button 
            className="cyber-job-action-button cyber-save-button"
            onClick={(e) => handleSaveJob(job._id, e)}
          >
            {job.saved ? <FaBookmark /> : <FaRegBookmark />}
            <span>{job.saved ? 'Saved' : 'Save'}</span>
          </button>
          
          <button 
            className="cyber-job-action-button cyber-share-button"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(window.location.origin + '/jobs/' + job._id);
              toast.success('Job link copied to clipboard');
            }}
          >
            <i className="fas fa-share-alt"></i>
            <span>Share</span>
          </button>
          
          <button 
            className="cyber-job-action-button cyber-apply-button"
            onClick={(e) => handleApplyJob(job.applyUrl || '#', e)}
          >
            <FaPaperPlane />
            <span>Apply Now</span>
          </button>
        </div>
        
        <div className="cyber-job-expand-indicator">
          <i className={`fas fa-chevron-${isActive ? 'up' : 'down'}`}></i>
        </div>
        
        {/* Corner Decorations */}
        <div className="cyber-corner cyber-corner-tl"></div>
        <div className="cyber-corner cyber-corner-tr"></div>
        <div className="cyber-corner cyber-corner-bl"></div>
        <div className="cyber-corner cyber-corner-br"></div>
      </div>
    );
  };

  // Render loading state
  const renderLoading = () => (
    <div className="cyber-loading-container">
      <div className="cyber-loading-spinner">
        <div className="cyber-spinner-ring"></div>
        <div className="cyber-spinner-ring"></div>
        <div className="cyber-spinner-ring"></div>
      </div>
      <p className="cyber-loading-text">Loading quantum job opportunities...</p>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="cyber-error-container">
      <div className="cyber-error-icon">
        <i className="fas fa-exclamation-triangle"></i>
      </div>
      <h3 className="cyber-error-title">Neural connection failed</h3>
      <p className="cyber-error-message">{error}</p>
      <button 
        onClick={() => fetchJobs()}
        className="cyber-retry-button"
      >
        <FaSyncAlt className="cyber-retry-icon" />
        <span>Reconnect</span>
      </button>
    </div>
  );

  // Render empty state
  const renderEmpty = () => (
    <div className="cyber-empty-container">
      <div className="cyber-empty-icon">
        <FaBriefcase />
      </div>
      <h3 className="cyber-empty-title">No job signals detected</h3>
      <p className="cyber-empty-message">
        We couldn't find any jobs matching your search parameters. Try adjusting your filters or search terms.
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
    <div className="cyber-jobs-page">
      {/* Animated background elements */}
      <div className="cyber-background">
        <div className="cyber-grid"></div>
        
        <div 
          className="cyber-glow-orb cyber-glow-orb-1"
          style={{transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`}}
        ></div>
        <div 
          className="cyber-glow-orb cyber-glow-orb-2"
          style={{transform: `translate(${-mousePosition.x * 30}px, ${-mousePosition.y * 30}px)`}}
        ></div>
      </div>
      
      <div className="cyber-jobs-container">
        {/* Header */}
        <div className="cyber-jobs-header">
          <div className="cyber-jobs-title-section">
            <div className="cyber-jobs-icon">
              <FaBriefcase />
            </div>
            <div>
              <h1 className="cyber-jobs-title">
                Job Opportunities
                <span className="cyber-blink">_</span>
              </h1>
              <p className="cyber-jobs-subtitle">
                Find your next career breakthrough in the neural network
              </p>
            </div>
          </div>
        </div>
        
        {/* Search and filter bar */}
        <div className="cyber-search-panel">
          <form onSubmit={handleSearch} className="cyber-search-form">
            <div className="cyber-search-input-container">
              <FaSearch className="cyber-search-icon" />
              <input
                type="text"
                className="cyber-search-input"
                placeholder="Job title, company, or keywords"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="cyber-location-input-container">
              <FaMapMarkerAlt className="cyber-location-icon" />
              <input
                type="text"
                className="cyber-location-input"
                placeholder="Location"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
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
          
          {/* Advanced filters */}
          {showFilters && (
            <div className="cyber-filters-section">
              <div className="cyber-filter-controls">
                <div className="cyber-filter-group">
                  <label className="cyber-filter-label">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="cyber-select"
                  >
                    <option value="">Any Level</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                
                <div className="cyber-filter-group">
                  <label className="cyber-filter-label">
                    Job Type
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="cyber-select"
                  >
                    <option value="">Any Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                
                <div className="cyber-filter-group">
                  <label className="cyber-toggle-option">
                    <div className="cyber-toggle-text">Remote Jobs Only</div>
                    <div className="cyber-toggle-switch">
                      <input
                        type="checkbox"
                        checked={remoteOnly}
                        onChange={(e) => setRemoteOnly(e.target.checked)}
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
        
        {/* Results info and sorting */}
        {!loading && !error && jobs.length > 0 && (
          <div className="cyber-results-header">
            <div className="cyber-results-count">
              Showing <span className="cyber-count-highlight">{jobs.length}</span> of <span className="cyber-count-highlight">{pagination.total}</span> jobs
            </div>
            
            <div className="cyber-sort-controls">
              <span className="cyber-sort-label">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cyber-sort-select"
              >
                <option value="date">Newest</option>
                <option value="relevance">Relevance</option>
                <option value="salary">Salary</option>
              </select>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <div className="cyber-jobs-content">
          {loading ? (
            renderLoading()
          ) : error ? (
            renderError()
          ) : jobs.length > 0 ? (
            <div className="cyber-jobs-list">
              {jobs.map(job => renderJobCard(job))}
            </div>
          ) : (
            renderEmpty()
          )}
        </div>
        
        {/* Pagination */}
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
      
      {/* Status Ticker */}
      <div className="cyber-status-ticker">
        <div className="cyber-ticker-content">
          <span className="cyber-ticker-text">Neural Job Network Online • Quantum Opportunity Processing • Career Path Optimization • Deep Matching Algorithm Active • Neural Career Calibration Complete • Ready For Professional Connection</span>
        </div>
      </div>

       <style jsx>{`

       /* Core cyberpunk styling */
.cyber-jobs-page {
  min-height: 100vh;
  background-color: rgba(15, 23, 42, 0.95);
  font-family: 'JetBrains Mono', monospace;
  position: relative;
  overflow: hidden;
  color: rgb(226, 232, 240);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
}

/* Animated Background Elements */
.cyber-background {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.cyber-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(to right, rgba(6, 182, 212, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(6, 182, 212, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: grid-move 30s linear infinite;
  opacity: 0.2;
}

@keyframes grid-move {
  0% { background-position: 0 0; }
  100% { background-position: 40px 40px; }
}

.cyber-glow-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  z-index: 0;
  transition: transform 0.5s ease-out;
}

.cyber-glow-orb-1 {
  top: 15%;
  left: 15%;
  width: 16rem;
  height: 16rem;
  background: rgb(6, 182, 212);
  animation: float 8s ease-in-out infinite;
}

.cyber-glow-orb-2 {
  bottom: 20%;
  right: 15%;
  width: 18rem;
  height: 18rem;
  background: rgb(79, 70, 229);
  animation: float 10s ease-in-out infinite;
  animation-delay: 1s;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

/* Blink Animation */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.cyber-blink {
  animation: blink 1s step-end infinite;
}

/* Container layout */
.cyber-jobs-container {
  width: 100%;
  max-width: 1200px;
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0 1rem;
}

/* Header */
.cyber-jobs-header {
  margin-bottom: 1rem;
}

.cyber-jobs-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cyber-jobs-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: rgba(6, 182, 212, 0.2);
  border-radius: 0.5rem;
  color: rgb(6, 182, 212);
  font-size: 1.5rem;
}

.cyber-jobs-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  line-height: 1.2;
  margin: 0;
}

.cyber-jobs-subtitle {
  font-size: 0.875rem;
  color: rgba(226, 232, 240, 0.7);
  margin: 0.25rem 0 0 0;
}

/* Search Panel */
.cyber-search-panel {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06),
              0 0 0 1px rgba(6, 182, 212, 0.1) inset,
              0 0 20px rgba(6, 182, 212, 0.1);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.cyber-search-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .cyber-search-form {
    flex-direction: row;
    align-items: center;
  }
}

.cyber-search-input-container, .cyber-location-input-container {
  position: relative;
  flex: 1;
}

.cyber-search-icon, .cyber-location-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(6, 182, 212, 0.7);
  pointer-events: none;
}

.cyber-search-input, .cyber-location-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.375rem;
  color: rgba(226, 232, 240, 0.9);
  font-size: 0.875rem;
  transition: all 0.3s;
  font-family: 'JetBrains Mono', monospace;
}

.cyber-search-input:focus, .cyber-location-input:focus {
  outline: none;
  border-color: rgba(6, 182, 212, 0.6);
  box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2);
}

.cyber-search-actions {
  display: flex;
  gap: 0.75rem;
}

.cyber-filter-button, .cyber-search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s;
  font-family: 'JetBrains Mono', monospace;
}

.cyber-filter-button {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: rgba(226, 232, 240, 0.9);
}

.cyber-filter-button:hover {
  background: rgba(15, 23, 42, 1);
  border-color: rgba(6, 182, 212, 0.5);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
}

.cyber-search-button {
  background: linear-gradient(90deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
  border: none;
  color: white;
  position: relative;
  overflow: hidden;
}

.cyber-search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06),
              0 0 15px rgba(6, 182, 212, 0.3);
}

.cyber-button-icon {
  font-size: 0.875rem;
}

/* Filters section */
.cyber-filters-section {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(6, 182, 212, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .cyber-filters-section {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
  }
}

.cyber-filter-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

@media (min-width: 768px) {
  .cyber-filter-controls {
    flex-direction: row;
  }
}

.cyber-filter-group {
  flex: 1;
}

.cyber-filter-label {
  display: block;
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.7);
  margin-bottom: 0.375rem;
}

.cyber-select {
  width: 100%;
  padding: 0.625rem 2rem 0.625rem 0.75rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.375rem;
  color: rgba(226, 232, 240, 0.9);
  font-size: 0.875rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2306b6d4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  transition: all 0.3s;
  font-family: 'JetBrains Mono', monospace;
}

.cyber-select:focus {
  outline: none;
  border-color: rgba(6, 182, 212, 0.6);
  box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2);
}

.cyber-toggle-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0;
}

.cyber-toggle-text {
  font-size: 0.875rem;
  color: rgba(226, 232, 240, 0.9);
}

.cyber-toggle-switch {
  position: relative;
  display: inline-block;
  width: 2.5rem;
  height: 1.25rem;
}

.cyber-toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.cyber-toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 1.25rem;
  transition: all 0.3s;
}

.cyber-toggle-slider:before {
  position: absolute;
  content: "";
  height: 0.875rem;
  width: 0.875rem;
  left: 0.125rem;
  bottom: 0.125rem;
  background: rgba(226, 232, 240, 0.9);
  border-radius: 50%;
  transition: all 0.3s;
}

.cyber-toggle-switch input:checked + .cyber-toggle-slider {
  background: rgba(6, 182, 212, 0.4);
  border-color: rgba(6, 182, 212, 0.8);
}

.cyber-toggle-switch input:checked + .cyber-toggle-slider:before {
  transform: translateX(1.25rem);
  background: rgb(6, 182, 212);
}

.cyber-clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.375rem;
  color: rgba(239, 68, 68, 0.9);
  font-size: 0.875rem;
  transition: all 0.3s;
  font-family: 'JetBrains Mono', monospace;
}

.cyber-clear-button:hover {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(239, 68, 68, 0.5);
  color: rgb(239, 68, 68);
}

/* Results Header */
.cyber-results-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0 0.5rem;
}

@media (min-width: 768px) {
  .cyber-results-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.cyber-results-count {
  font-size: 0.875rem;
  color: rgba(226, 232, 240, 0.7);
}

.cyber-count-highlight {
  color: rgb(6, 182, 212);
  font-weight: 600;
}

.cyber-sort-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cyber-sort-label {
  font-size: 0.875rem;
  color: rgba(226, 232, 240, 0.7);
}

.cyber-sort-select {
  padding: 0.375rem 2rem 0.375rem 0.5rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.375rem;
  color: rgba(226, 232, 240, 0.9);
  font-size: 0.75rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2306b6d4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 0.75rem;
  transition: all 0.3s;
  font-family: 'JetBrains Mono', monospace;
}

.cyber-sort-select:focus {
  outline: none;
  border-color: rgba(6, 182, 212, 0.6);
}

/* Jobs Content */
.cyber-jobs-content {
  flex: 1;
}

.cyber-jobs-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Job Card */
.cyber-job-card {
  position: relative;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.5rem;
  padding: 1.5rem;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06),
              0 0 0 1px rgba(6, 182, 212, 0.1) inset,
              0 0 20px rgba(6, 182, 212, 0.1);
  cursor: pointer;
  overflow: hidden;
}

.cyber-job-card:hover {
  transform: translateY(-4px);
  border-color: rgba(6, 182, 212, 0.5);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05),
              0 0 0 1px rgba(6, 182, 212, 0.2) inset,
              0 0 20px rgba(6, 182, 212, 0.2);
}

.cyber-job-active {
  border-color: rgba(6, 182, 212, 0.6);
  background: rgba(15, 23, 42, 0.8);
}

.cyber-job-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.cyber-job-logo {
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cyber-job-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.cyber-job-logo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(79, 70, 229, 0.3) 100%);
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
}

.cyber-job-title-section {
  flex: 1;
}

.cyber-job-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.95);
  margin: 0 0 0.25rem 0;
}

.cyber-job-company {
  font-size: 0.875rem;
  color: rgba(226, 232, 240, 0.7);
}

.cyber-job-salary {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.375rem 0.75rem;
  background: rgba(16, 185, 129, 0.1);
  color: rgb(16, 185, 129);
  border-radius: 0.375rem;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.cyber-job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.cyber-job-meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.7);
}

.cyber-job-meta-icon {
  color: rgb(6, 182, 212);
  font-size: 0.875rem;
}

.cyber-job-body {
  margin-bottom: 1.25rem;
}

.cyber-job-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.cyber-skill-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: rgba(6, 182, 212, 0.1);
  color: rgb(6, 182, 212);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.25rem;
}

.cyber-job-description {
  font-size: 0.875rem;
  color: rgba(226, 232, 240, 0.8);
  line-height: 1.6;
}

.cyber-job-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.cyber-job-action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  transition: all 0.3s;
  flex: 1;
  min-width: 5rem;
  font-family: 'JetBrains Mono', monospace;
}

.cyber-save-button {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: rgba(226, 232, 240, 0.9);
}

.cyber-save-button:hover {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(6, 182, 212, 0.5);
}

.cyber-share-button {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(79, 70, 229, 0.3);
  color: rgba(226, 232, 240, 0.9);
}

.cyber-share-button:hover {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(79, 70, 229, 0.5);
}

.cyber-apply-button {
  background: linear-gradient(90deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
  border: none;
  color: white;
  font-weight: 500;
}

.cyber-apply-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06),
              0 0 15px rgba(6, 182, 212, 0.3);
}

.cyber-job-expand-indicator {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  color: rgba(226, 232, 240, 0.5);
  font-size: 0.75rem;
}

/* Corner Decorations */
.cyber-corner {
  position: absolute;
  width: 8px;
  height: 8px;
  z-index: 1;
}

.cyber-corner-tl {
  top: 0;
  left: 0;
  border-top: 1px solid rgb(6, 182, 212);
  border-left: 1px solid rgb(6, 182, 212);
}

.cyber-corner-tr {
  top: 0;
  right: 0;
  border-top: 1px solid rgb(6, 182, 212);
  border-right: 1px solid rgb(6, 182, 212);
}

.cyber-corner-bl {
  bottom: 0;
  left: 0;
  border-bottom: 1px solid rgb(6, 182, 212);
  border-left: 1px solid rgb(6, 182, 212);
}

.cyber-corner-br {
  bottom: 0;
  right: 0;
  border-bottom: 1px solid rgb(6, 182, 212);
  border-right: 1px solid rgb(6, 182, 212);
}

/* Loading animation */
.cyber-loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.cyber-loading-spinner {
  position: relative;
  width: 3.5rem;
  height: 3.5rem;
}

.cyber-spinner-ring {
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-radius: 50%;
}

.cyber-spinner-ring:nth-child(1) {
  border-top-color: rgb(6, 182, 212);
  animation: spin 1.5s linear infinite;
}

.cyber-spinner-ring:nth-child(2) {
  border-right-color: rgb(79, 70, 229);
  animation: spin 2s linear infinite;
}

.cyber-spinner-ring:nth-child(3) {
  border-bottom-color: rgb(124, 58, 237);
  animation: spin 2.5s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.cyber-loading-text {
  font-size: 0.875rem;
  color: rgb(6, 182, 212);
  font-family: monospace;
  margin-top: 1rem;
}

/* Error state */
.cyber-error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3rem 1rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
}

.cyber-error-icon {
  font-size: 2.5rem;
  color: rgb(239, 68, 68);
  margin-bottom: 1rem;
}

.cyber-error-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(239, 68, 68);
  margin-bottom: 0.5rem;
}

.cyber-error-message {
  font-size: 0.875rem;
  color: rgba(226, 232, 240, 0.7);
  margin-bottom: 1.5rem;
  max-width: 30rem;
}

.cyber-retry-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 0.375rem;
  color: rgb(239, 68, 68);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s;
}

.cyber-retry-button:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Empty state */
.cyber-empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3rem 1rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 0.5rem;
}

.cyber-empty-icon {
  font-size: 2.5rem;
  color: rgba(226, 232, 240, 0.3);
  margin-bottom: 1rem;
}

.cyber-empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.9);
  margin-bottom: 0.5rem;
}

.cyber-empty-message {
  font-size: 0.875rem;
  color: rgba(226, 232, 240, 0.7);
  margin-bottom: 1.5rem;
  max-width: 30rem;
}

.cyber-clear-filters-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.375rem;
  color: rgb(6, 182, 212);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s;
}

.cyber-clear-filters-button:hover {
  background: rgba(6, 182, 212, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Pagination */
.cyber-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem 0;
}

.cyber-pagination-button {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.375rem;
  color: rgba(226, 232, 240, 0.9);
  font-size: 0.875rem;
  transition: all 0.3s;
}

.cyber-pagination-button:hover:not(.cyber-pagination-disabled) {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(6, 182, 212, 0.5);
  transform: translateY(-2px);
}

.cyber-pagination-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cyber-pagination-pages {
  display: flex;
  gap: 0.375rem;
}

.cyber-pagination-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.375rem;
  color: rgba(226, 232, 240, 0.9);
  font-size: 0.875rem;
  transition: all 0.3s;
}

.cyber-pagination-number:hover:not(.cyber-pagination-active) {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(6, 182, 212, 0.5);
}

.cyber-pagination-active {
  background: rgba(6, 182, 212, 0.2);
  border-color: rgba(6, 182, 212, 0.6);
  color: rgb(6, 182, 212);
}

/* Status Ticker */
.cyber-status-ticker {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%,
                                     rgba(6, 182, 212, 0.2) 50%,
                                     rgba(15, 23, 42, 0.9) 100%);
  border-top: 1px solid rgba(6, 182, 212, 0.3);
  overflow: hidden;
  display: flex;
  align-items: center;
  height: 1.75rem;
  font-size: 0.75rem;
  color: rgb(6, 182, 212);
  text-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
  letter-spacing: 0.5px;
  z-index: 30;
}

.cyber-ticker-content {
  white-space: nowrap;
  animation: ticker-scroll 30s linear infinite;
}

@keyframes ticker-scroll {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cyber-jobs-container {
    padding: 0 0.5rem;
  }
  
  .cyber-job-actions {
    flex-direction: column;
  }
  
  .cyber-pagination {
    flex-wrap: wrap;
  }
}
        

      `}</style>
    </div>
  );
};



export default JobsPage;