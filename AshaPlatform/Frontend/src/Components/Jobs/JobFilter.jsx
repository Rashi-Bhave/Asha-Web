// Frontend/src/Components/Jobs/JobFilter.jsx
import React, { useState } from 'react';
import './JobStyles.css';

const JobFilter = ({ filters, onFilterChange, onApplyFilters, onClearFilters }) => {
  // Common skills for filter
  const commonSkills = [
    'JavaScript',
    'Python',
    'React',
    'Angular',
    'Node.js',
    'Java',
    'SQL',
    'AWS',
    'Docker',
    'Machine Learning',
    'Data Analysis',
    'UI/UX',
    'Product Management',
    'DevOps'
  ];
  
  // Handle checkbox change for array filters
  const handleArrayFilterChange = (filterName, value) => {
    const currentValues = [...filters[filterName]];
    const valueIndex = currentValues.indexOf(value);
    
    if (valueIndex === -1) {
      // Add value
      currentValues.push(value);
    } else {
      // Remove value
      currentValues.splice(valueIndex, 1);
    }
    
    onFilterChange({
      ...filters,
      [filterName]: currentValues
    });
  };
  
  // Handle boolean filter change
  const handleBooleanFilterChange = (filterName, value) => {
    onFilterChange({
      ...filters,
      [filterName]: value
    });
  };
  
  // Apply current filters
  const applyFilters = () => {
    onApplyFilters();
  };
  
  return (
    <div className="job-filter">
      <div className="filter-header">
        <h3>Filter Results</h3>
        <button 
          className="filter-clear-button"
          onClick={onClearFilters}
        >
          Clear All
        </button>
      </div>
      
      {/* Experience Level Filter */}
      <div className="filter-section">
        <h4 className="filter-section-title">Experience Level</h4>
        <div className="filter-options">
          {['Entry Level', 'Mid Level', 'Senior Level', 'Executive'].map(level => (
            <label key={level} className="filter-option">
              <input
                type="checkbox"
                checked={filters.experienceLevel.includes(level)}
                onChange={() => handleArrayFilterChange('experienceLevel', level)}
                className="filter-checkbox"
              />
              <span className="filter-option-text">{level}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Job Type Filter */}
      <div className="filter-section">
        <h4 className="filter-section-title">Job Type</h4>
        <div className="filter-options">
          {['Full-time', 'Part-time', 'Contract', 'Internship'].map(type => (
            <label key={type} className="filter-option">
              <input
                type="checkbox"
                checked={filters.jobType.includes(type)}
                onChange={() => handleArrayFilterChange('jobType', type)}
                className="filter-checkbox"
              />
              <span className="filter-option-text">{type}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Remote Filter */}
      <div className="filter-section">
        <h4 className="filter-section-title">Remote Options</h4>
        <label className="filter-option toggle-option">
          <div className="toggle-option-text">Remote Jobs Only</div>
          <div className="toggle-switch">
            <input
              type="checkbox"
              checked={filters.remote}
              onChange={(e) => handleBooleanFilterChange('remote', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </div>
        </label>
      </div>
      
      {/* Skills Filter */}
      <div className="filter-section">
        <h4 className="filter-section-title">Skills</h4>
        <div className="filter-options skills-grid">
          {commonSkills.map(skill => (
            <label key={skill} className="filter-option">
              <input
                type="checkbox"
                checked={filters.skills.includes(skill)}
                onChange={() => handleArrayFilterChange('skills', skill)}
                className="filter-checkbox"
              />
              <span className="filter-option-text">{skill}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Apply Button */}
      <button 
        className="filter-apply-button"
        onClick={applyFilters}
      >
        <i className="fas fa-filter"></i>
        <span>Apply Filters</span>
      </button>
    </div>
  );
};

export default JobFilter;