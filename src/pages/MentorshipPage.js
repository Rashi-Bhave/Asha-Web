// src/pages/MentorshipPage.js
import React, { useState, useEffect } from 'react';
import mentorsData from '../data/topmate.json';
import MentorCard from '../components/MentorCard';
import './MentorshipPage.css';

const MentorshipPage = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize data on component mount
  useEffect(() => {
    if (mentorsData && mentorsData.categories) {
      setCategories(mentorsData.categories);
      
      // Set default active category to first one with mentors
      const firstCategoryWithMentors = mentorsData.categories.find(category => 
        category.subcategories.some(subcategory => subcategory.mentors && subcategory.mentors.length > 0)
      );
      
      if (firstCategoryWithMentors) {
        setActiveCategory(firstCategoryWithMentors.name);
        
        // Set default active subcategory to first one with mentors
        const firstSubcategoryWithMentors = firstCategoryWithMentors.subcategories.find(
          subcategory => subcategory.mentors && subcategory.mentors.length > 0
        );
        
        if (firstSubcategoryWithMentors) {
          setActiveSubcategory(firstSubcategoryWithMentors.name);
        }
      }
      
      setLoading(false);
    }
  }, []);

  // Filter mentors when category, subcategory or search query changes
  useEffect(() => {
    if (!categories.length) return;
    
    let mentorsList = [];
    
    // Find all mentors for the active category and subcategory
    if (activeCategory) {
      const category = categories.find(c => c.name === activeCategory);
      
      if (category) {
        if (activeSubcategory) {
          // Get mentors for specific subcategory
          const subcategory = category.subcategories.find(sc => sc.name === activeSubcategory);
          if (subcategory && subcategory.mentors) {
            // Add category and subcategory information to each mentor
            mentorsList = subcategory.mentors.map(mentor => ({
              ...mentor,
              category: category.name,
              subcategories: mentor.subcategories || [subcategory.name]
            }));
          }
        } else {
          // Get all mentors from all subcategories in the category
          category.subcategories.forEach(subcategory => {
            if (subcategory.mentors) {
              // Add category and subcategory information to each mentor
              const mentorsWithCategory = subcategory.mentors.map(mentor => ({
                ...mentor,
                category: category.name,
                subcategories: mentor.subcategories || [subcategory.name]
              }));
              mentorsList = [...mentorsList, ...mentorsWithCategory];
            }
          });
        }
      }
    } else {
      // No category selected, get all mentors
      categories.forEach(category => {
        category.subcategories.forEach(subcategory => {
          if (subcategory.mentors) {
            // Add category and subcategory information to each mentor
            const mentorsWithCategory = subcategory.mentors.map(mentor => ({
              ...mentor,
              category: category.name,
              subcategories: mentor.subcategories || [subcategory.name]
            }));
            mentorsList = [...mentorsList, ...mentorsWithCategory];
          }
        });
      });
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      mentorsList = mentorsList.filter(mentor => 
        mentor.name.toLowerCase().includes(query) || 
        (mentor.title && mentor.title.toLowerCase().includes(query))
      );
    }
    
    setFilteredMentors(mentorsList);
  }, [categories, activeCategory, activeSubcategory, searchQuery]);

  const handleCategoryChange = (categoryName) => {
    if (activeCategory === categoryName) {
      // Deselect if clicking the active category
      setActiveCategory(null);
      setActiveSubcategory(null);
    } else {
      setActiveCategory(categoryName);
      setActiveSubcategory(null); // Reset subcategory when changing category
    }
  };

  const handleSubcategoryChange = (subcategoryName) => {
    setActiveSubcategory(subcategoryName);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };

  const renderCategoryTabs = () => {
    return (
      <div className="category-tabs">
        {categories.map((category) => (
          <button
            key={category.name}
            className={`category-tab ${activeCategory === category.name ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category.name)}
          >
            {category.name}
          </button>
        ))}
      </div>
    );
  };

  const renderSubcategoryTabs = () => {
    if (!activeCategory) return null;
    
    const category = categories.find(c => c.name === activeCategory);
    if (!category) return null;
    
    return (
      <div className="subcategory-tabs">
        {category.subcategories.map((subcategory) => (
          <button
            key={subcategory.name}
            className={`subcategory-tab ${activeSubcategory === subcategory.name ? 'active' : ''}`}
            onClick={() => handleSubcategoryChange(subcategory.name)}
            disabled={!subcategory.mentors || subcategory.mentors.length === 0}
          >
            {subcategory.name} 
            {subcategory.mentors && <span className="count">({subcategory.mentors.length})</span>}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="mentorship-page">
      <div className="page-header">
        <h1 className="page-title">Find Your Mentor</h1>
        <p className="page-description">
          Connect with experienced mentors who can guide your professional journey
        </p>
      </div>
      
      <div className="search-filter-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search mentors by name, expertise, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </form>
      </div>
      
      {renderCategoryTabs()}
      {renderSubcategoryTabs()}
      
      <div className="results-info">
        {filteredMentors.length > 0 && (
          <span>Found {filteredMentors.length} mentors</span>
        )}
      </div>
      
      <div className="mentors-grid">
        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading mentors...</p>
          </div>
        ) : filteredMentors.length > 0 ? (
          filteredMentors.map(mentor => (
            <MentorCard key={mentor.name} mentor={mentor} />
          ))
        ) : (
          <div className="empty-state">
            <i className="fas fa-users empty-icon"></i>
            <h2 className="empty-title">No mentors found</h2>
            <p className="empty-text">
              Try adjusting your filters or search query.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorshipPage;