// FixedEventFilter.jsx - Enhanced Filter Component with Working Toggle
import React, { useState, useEffect, useRef } from 'react';
import { FaFilter, FaVenus, FaLaptopHouse, FaCalendarWeek, 
         FaNetworkWired, FaLaptop, FaBrain, FaUsers, 
         FaHeart, FaEraser, FaRocket, FaChevronDown } from 'react-icons/fa';

const FixedEventFilter = ({ onFilterChange, onApplyFilters, onClearFilters }) => {
  // State for filters
  const [filters, setFilters] = useState({
    categories: [],
    forWomen: false,
    virtual: false
  });
  
  // UI State
  const [isExpanded, setIsExpanded] = useState(false);
  const filtersRef = useRef(null);
  const categoriesRef = useRef(null);
  
  // Track applied filters count - used for badge
  const appliedFiltersCount = 
    filters.categories.length + 
    (filters.forWomen ? 1 : 0) + 
    (filters.virtual ? 1 : 0);
  
  // Available event categories with icons
  const eventCategories = [
    { id: 'conference', label: 'Conference', icon: <FaNetworkWired /> },
    { id: 'workshop', label: 'Workshop', icon: <FaUsers /> },
    { id: 'hackathon', label: 'Hackathon', icon: <FaBrain /> },
    { id: 'webinar', label: 'Webinar', icon: <FaLaptop /> },
    { id: 'meetup', label: 'Meetup', icon: <FaCalendarWeek /> },
    { id: 'community', label: 'Community Connect', icon: <FaHeart /> }
  ];
  
  // Animate categories when expanded
  useEffect(() => {
    if (categoriesRef.current && isExpanded) {
      const categories = categoriesRef.current.querySelectorAll('.cyber-category-option');
      categories.forEach((category, index) => {
        setTimeout(() => {
          category.style.opacity = '1';
          category.style.transform = 'translateY(0)';
        }, 50 * index);
      });
    }
  }, [isExpanded]);
  
  // Notify parent component of filter changes
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);
  
  // Handle category toggle with animation
  const handleCategoryToggle = (categoryId) => {
    setFilters(prevFilters => {
      const currentCategories = [...prevFilters.categories];
      const index = currentCategories.indexOf(categoryId);
      
      if (index === -1) {
        // Add category
        return {
          ...prevFilters,
          categories: [...currentCategories, categoryId]
        };
      } else {
        // Remove category
        return {
          ...prevFilters,
          categories: currentCategories.filter(id => id !== categoryId)
        };
      }
    });
  };
  
  // Handle boolean filter change
  const handleBooleanFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };
  
  // Apply current filters with animation
  const handleApplyFilters = () => {
    if (filtersRef.current) {
      filtersRef.current.classList.add('cyber-filters-pulse');
      setTimeout(() => {
        filtersRef.current.classList.remove('cyber-filters-pulse');
        onApplyFilters(filters);
      }, 300);
    } else {
      onApplyFilters(filters);
    }
  };
  
  // Clear filters with animation
  const handleClearFilters = () => {
    if (filtersRef.current) {
      filtersRef.current.classList.add('cyber-filters-clear');
      setTimeout(() => {
        filtersRef.current.classList.remove('cyber-filters-clear');
        
        // Reset filters locally
        setFilters({
          categories: [],
          forWomen: false,
          virtual: false
        });
        
        // Notify parent
        onClearFilters();
      }, 300);
    } else {
      // Reset filters locally
      setFilters({
        categories: [],
        forWomen: false,
        virtual: false
      });
      
      // Notify parent
      onClearFilters();
    }
  };
  
  return (
    <div className="cyber-filters-container" ref={filtersRef}>
      <div className="cyber-filters-header">
        <div className="cyber-filters-title">
          <FaFilter className="cyber-filter-icon" />
          <span>Advanced Filters</span>
          {appliedFiltersCount > 0 && (
            <span className="cyber-filters-badge">{appliedFiltersCount}</span>
          )}
        </div>
        
        <button 
          className="cyber-filters-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="filter-section"
        >
          <FaChevronDown className={`cyber-filters-arrow ${isExpanded ? 'expanded' : ''}`} />
        </button>
      </div>
      
      <div 
        id="filter-section"
        className={`cyber-filters-section ${isExpanded ? 'expanded' : ''}`}
        aria-hidden={!isExpanded}
      >
        <div className="cyber-filter-controls">
          <div className="cyber-filter-group">
            <label className="cyber-filter-label">
              Event Categories
            </label>
            <div className="cyber-categories-options" ref={categoriesRef}>
              {eventCategories.map(category => (
                <label key={category.id} className="cyber-category-option">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="cyber-category-checkbox"
                  />
                  <span className="cyber-category-checkbox-custom">
                    <span className="cyber-checkbox-check"></span>
                  </span>
                  <span className="cyber-category-label">
                    <span className="cyber-category-icon">{category.icon}</span>
                    <span>{category.label}</span>
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
                  checked={filters.forWomen}
                  onChange={(e) => handleBooleanFilterChange('forWomen', e.target.checked)}
                />
                <span className="cyber-toggle-slider"></span>
              </div>
            </label>
            
            <label className="cyber-toggle-option">
              <div className="cyber-toggle-text">
                <FaLaptopHouse className="cyber-toggle-icon" />
                <span>Virtual Only</span>
              </div>
              <div className="cyber-toggle-switch">
                <input
                  type="checkbox"
                  checked={filters.virtual}
                  onChange={(e) => handleBooleanFilterChange('virtual', e.target.checked)}
                />
                <span className="cyber-toggle-slider"></span>
              </div>
            </label>
          </div>
        </div>
        
        <div className="cyber-filter-actions">
          <button
            type="button"
            onClick={handleClearFilters}
            className="cyber-clear-button"
            disabled={appliedFiltersCount === 0}
          >
            <FaEraser className="cyber-button-icon" />
            <span>Clear All</span>
          </button>
          
          <button
            type="button"
            onClick={handleApplyFilters}
            className="cyber-apply-button"
          >
            <FaRocket className="cyber-button-icon" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
      
      {/* Active filters display */}
      {appliedFiltersCount > 0 && (
        <div className="cyber-active-filters">
          <span className="cyber-active-filters-label">Active filters:</span>
          <div className="cyber-active-filters-tags">
            {filters.categories.map(categoryId => {
              const category = eventCategories.find(cat => cat.id === categoryId);
              return (
                <div key={categoryId} className="cyber-active-filter-tag">
                  <span>{category?.icon}</span>
                  <span>{category?.label}</span>
                  <button 
                    className="cyber-tag-remove" 
                    onClick={() => handleCategoryToggle(categoryId)}
                    aria-label={`Remove ${category?.label} filter`}
                  >
                    &times;
                  </button>
                </div>
              );
            })}
            
            {filters.forWomen && (
              <div className="cyber-active-filter-tag women">
                <FaVenus />
                <span>For Women</span>
                <button 
                  className="cyber-tag-remove" 
                  onClick={() => handleBooleanFilterChange('forWomen', false)}
                  aria-label="Remove for women filter"
                >
                  &times;
                </button>
              </div>
            )}
            
            {filters.virtual && (
              <div className="cyber-active-filter-tag virtual">
                <FaLaptopHouse />
                <span>Virtual Only</span>
                <button 
                  className="cyber-tag-remove" 
                  onClick={() => handleBooleanFilterChange('virtual', false)}
                  aria-label="Remove virtual only filter"
                >
                  &times;
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FixedEventFilter;