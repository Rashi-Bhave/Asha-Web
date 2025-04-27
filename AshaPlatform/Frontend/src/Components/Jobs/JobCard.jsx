// Frontend/src/Components/Jobs/JobCard.jsx
import React from 'react';
import './JobStyles.css';

const JobCard = ({ 
  job, 
  isActive, 
  isSaved, 
  isApplied,
  onClick,
  onSave,
  onApply,
  isInChat = false // Flag for when card is displayed in chat
}) => {
  // Format date (e.g., "2 days ago", "Today")
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format salary for display
  const formatSalary = (salary) => {
    if (!salary || salary === 'Not specified' || salary === 'Salary not specified') {
      return null;
    }
    return salary;
  };

  // Handle card click
  const handleCardClick = () => {
    if (!isInChat && onClick) {
      onClick();
    }
  };

  // Determine CSS classes based on props
  const cardClasses = `job-card ${isActive ? 'active' : ''} ${isInChat ? 'in-chat' : ''}`;
  
  // Determine save button text and icon
  const saveButtonText = isSaved ? 'Saved' : 'Save';
  const saveButtonIcon = isSaved ? 'fas fa-bookmark' : 'far fa-bookmark';
  
  // Determine apply button text based on applied status
  const applyButtonText = isApplied ? 'Applied' : 'Apply Now';

  return (
    <div className={cardClasses} onClick={handleCardClick}>
      <div className="job-card-header">
        <div className="job-logo-container">
          {job.logo ? (
            <img 
              src={job.logo} 
              alt={`${job.company} logo`} 
              className="job-logo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=random`;
              }}
            />
          ) : (
            <div className="job-logo-placeholder">
              {job.company.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="job-header-info">
          <h3 className="job-title">{job.title}</h3>
          <div className="job-company">{job.company}</div>
          
          <div className="job-meta">
            <div className="job-meta-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>{job.location}</span>
            </div>
            <div className="job-meta-item">
              <i className="fas fa-briefcase"></i>
              <span>{job.type}</span>
            </div>
            <div className="job-meta-item">
              <i className="fas fa-clock"></i>
              <span>{formatDate(job.postedDate)}</span>
            </div>
          </div>
        </div>
        
        {isApplied && (
          <div className="applied-badge">
            <i className="fas fa-check-circle"></i>
            <span>Applied</span>
          </div>
        )}
      </div>
      
      <div className="job-body">
        {/* Salary information */}
        {formatSalary(job.salary) && (
          <div className="job-salary">
            <i className="fas fa-money-bill-wave"></i>
            <span>{formatSalary(job.salary)}</span>
          </div>
        )}
        
        {/* Skills tags */}
        {job.skills && job.skills.length > 0 && (
          <div className="job-skills">
            {job.skills.map((skill, index) => (
              <span key={index} className="skill-tag">{skill}</span>
            ))}
          </div>
        )}
        
        {/* Job description - show more when active */}
        <div className="job-description">
          {isActive || isInChat ? (
            <p>{job.description}</p>
          ) : (
            <p>{job.description.length > 150 
              ? `${job.description.substring(0, 150)}...` 
              : job.description}
            </p>
          )}
        </div>
        
        {/* Experience level */}
        {job.experienceLevel && job.experienceLevel !== 'Not specified' && (
          <div className="job-experience-level">
            <i className="fas fa-user-graduate"></i>
            <span>Experience: {job.experienceLevel}</span>
          </div>
        )}
      </div>
      
      <div className="job-actions">
        <button 
          className="job-action-button save-button"
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
        >
          <i className={saveButtonIcon}></i>
          <span>{saveButtonText}</span>
        </button>
        
        <button 
          className="job-action-button share-button"
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
          className={`job-action-button apply-button ${isApplied ? 'applied' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onApply();
          }}
        >
          <i className={isApplied ? 'fas fa-check' : 'fas fa-paper-plane'}></i>
          <span>{applyButtonText}</span>
        </button>
      </div>
      
      {/* Only show expand/collapse indicator when not in chat and not active */}
      {!isInChat && (
        <div className="job-expand-indicator">
          <i className={`fas fa-chevron-${isActive ? 'up' : 'down'}`}></i>
        </div>
      )}
    </div>
  );
};

export default JobCard;