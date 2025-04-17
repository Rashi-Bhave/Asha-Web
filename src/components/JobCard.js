// Placeholder content for JobCard.js
// components/JobCard.js - A simplified version for the web
import React from 'react';

const JobCard = ({ job }) => {
  const handleApply = () => {
    if (job.applyUrl) {
      window.open(job.applyUrl, '_blank');
    }
  };
  
  return (
    <div className="card">
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
              Posted {formatDate(job.postedDate) || 'Recently'}
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
        
        <button className="primary-button" onClick={handleApply}>
          Apply Now
        </button>
      </div>
    </div>
  );
};
const formatDate = (dateString) => {
    if (!dateString) return '';
    
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