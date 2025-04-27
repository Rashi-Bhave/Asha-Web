import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useMentorship } from './MentorshipContextProvider';
import MentorCard from './MentorCard';

const MentorshipPage = () => {
  const navigate = useNavigate();
  const { 
    mentors, 
    loading, 
    getCategories
  } = useMentorship();
  
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [categories, setCategories] = useState([]);
  
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
  
  // Get categories from context
  useEffect(() => {
    if (mentors.length > 0) {
      const categoriesData = getCategories();
      setCategories(categoriesData);
      
      // Set default category if not set yet
      if (categoriesData.length > 0 && !activeCategory) {
        setActiveCategory(categoriesData[0].name);
        
        if (categoriesData[0].subcategories && categoriesData[0].subcategories.length > 0) {
          setSubcategories(categoriesData[0].subcategories);
          setActiveSubcategory(categoriesData[0].subcategories[0]);
        }
      }
    }
  }, [mentors, getCategories, activeCategory]);
  
  // Filter mentors when category, subcategory or search changes
  useEffect(() => {
    if (!mentors.length) return;
    
    let filtered = [...mentors];
    
    // Filter by category
    if (activeCategory) {
      const categorySlug = activeCategory.toLowerCase().replace(/\s+/g, '_');
      console.log("categorySlug")
      console.log(categorySlug)
      filtered = filtered.filter(mentor => mentor.category === categorySlug);
    }
    
    // Filter by subcategory
    if (activeSubcategory) {
      filtered = filtered.filter(mentor => {
        if (mentor.subcategories) {
          return mentor.subcategories.includes(activeSubcategory);
        }
        // If no subcategories, assume it belongs to the active subcategory
        return true;
      });
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(mentor => 
        mentor.name.toLowerCase().includes(query) || 
        (mentor.title && mentor.title.toLowerCase().includes(query))
      );
    }
    
    setFilteredMentors(filtered);
  }, [mentors, activeCategory, activeSubcategory, searchQuery]);
  
  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setActiveSubcategory(null);
    
    // Find the category object
    const categoryData = categories.find(cat => cat.name === category);
    
    if (categoryData && categoryData.subcategories) {
      setSubcategories(categoryData.subcategories);
      
      // Set first subcategory as active if available
      if (categoryData.subcategories.length > 0) {
        setActiveSubcategory(categoryData.subcategories[0]);
      }
    } else {
      setSubcategories([]);
    }
  };
  
  // Handle subcategory change
  const handleSubcategoryChange = (subcategory) => {
    setActiveSubcategory(subcategory);
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the useEffect
    if (searchQuery) {
      toast.success(`Showing results for "${searchQuery}"`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="cyber-grid"></div>
      </div>
      
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full filter blur-[150px] bg-blue-900 opacity-20 animate-pulse-slow"
        style={{transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`}}
      ></div>
      <div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full filter blur-[150px] bg-purple-900 opacity-20 animate-pulse-slow animation-delay-1000"
        style={{transform: `translate(${-mousePosition.x * 30}px, ${-mousePosition.y * 30}px)`}}
      ></div>
      
      {/* Header */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center">
          <svg className="h-8 w-8 text-cyan-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h1 className="text-xl font-medium text-white">
            Asha<span className="text-cyan-400">Mentorship</span>
            <span className="cyber-blink">_</span>
          </h1>
        </div>
        <p className="mt-2 text-gray-400 max-w-3xl">
          Connect with experienced mentors from various fields to accelerate your learning and career growth.
        </p>
      </div>
      
      {/* Main Content */}
      <div className="cyber-content-panel p-6 mb-8 relative z-10">
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          {/* Search Form */}
          <div className="w-full md:w-1/3">
            <form onSubmit={handleSearch} className="cyber-search-form">
              <div className="cyber-input-wrapper">
                <input
                  type="text"
                  className="cyber-input-field"
                  placeholder="Search mentors by name or expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="cyber-search-button">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                
                {/* Decorative corners */}
                <div className="cyber-corner cyber-corner-tl"></div>
                <div className="cyber-corner cyber-corner-tr"></div>
                <div className="cyber-corner cyber-corner-bl"></div>
                <div className="cyber-corner cyber-corner-br"></div>
              </div>
            </form>
          </div>
          
          {/* Categories */}
          <div className="cyber-categories">
            {categories.map((category) => (
              <button
                key={category.name}
                className={`cyber-category-button ${activeCategory === category.name ? 'cyber-category-active' : ''}`}
                onClick={() => handleCategoryChange(category.name)}
              >
                <span className="cyber-category-indicator"></span>
                <span className="cyber-category-text">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="cyber-subcategories mb-6">
            {subcategories.map((subcategory) => (
              <button
                key={subcategory}
                className={`cyber-subcategory-button ${activeSubcategory === subcategory ? 'cyber-subcategory-active' : ''}`}
                onClick={() => handleSubcategoryChange(subcategory)}
              >
                {subcategory}
              </button>
            ))}
          </div>
        )}
        
        {/* Results Info */}
        <div className="cyber-results-info mb-4">
          {filteredMentors.length > 0 && (
            <span>Found {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        
        {/* Mentors Grid */}
        {loading ? (
          <div className="cyber-loading-container py-12">
            <div className="cyber-loading-spinner">
              <div className="cyber-spinner-ring"></div>
              <div className="cyber-spinner-ring"></div>
              <div className="cyber-spinner-ring"></div>
            </div>
            <p className="cyber-loading-text mt-4">Connecting to mentor network...</p>
          </div>
        ) : filteredMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        ) : (
          <div className="cyber-empty-state py-12">
            <div className="cyber-empty-icon mb-4">
              <svg className="h-16 w-16 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="cyber-empty-title">No Mentors Found</h3>
            <p className="cyber-empty-message">
              Try adjusting your search criteria or explore a different category.
            </p>
          </div>
        )}
      </div>
      
      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative z-10">
        <div className="cyber-feature-card">
          <div className="cyber-feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="cyber-feature-title">1:1 Mentorship Sessions</h3>
          <p className="cyber-feature-description">
            Book personalized one-on-one sessions with industry experts to get advice on your specific career challenges.
          </p>
          <div className="cyber-feature-details">
            <div className="cyber-feature-detail">
              <span className="cyber-detail-label">Duration:</span>
              <span className="cyber-detail-value">30-60 minutes</span>
            </div>
            <div className="cyber-feature-detail">
              <span className="cyber-detail-label">Format:</span>
              <span className="cyber-detail-value">Video Call, Audio Call, or Chat</span>
            </div>
          </div>
        </div>
        
        <div className="cyber-feature-card">
          <div className="cyber-feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0h10a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="cyber-feature-title">Structured Mentorship Programs</h3>
          <p className="cyber-feature-description">
            Join multi-week mentorship programs with defined goals, milestones, and learning paths to accelerate your growth.
          </p>
          <div className="cyber-feature-details">
            <div className="cyber-feature-detail">
              <span className="cyber-detail-label">Duration:</span>
              <span className="cyber-detail-value">4-12 weeks</span>
            </div>
            <div className="cyber-feature-detail">
              <span className="cyber-detail-label">Format:</span>
              <span className="cyber-detail-value">Weekly Sessions with Assignments</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="cyber-cta-panel mt-8 relative z-10">
        <div className="cyber-cta-content">
          <h3 className="cyber-cta-title">Want to become a mentor?</h3>
          <p className="cyber-cta-description">
            Share your expertise and help others grow while building your professional network and personal brand.
          </p>
        </div>
        
        <Link to="/become-mentor" className="cyber-cta-button">
          <span>Apply Now</span>
          <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      {/* Styling */}
      <style jsx>{`
        /* Cyber Grid */
        .cyber-grid {
          position: absolute;
          inset: 0;
          background-image: 
              linear-gradient(to right, rgba(6, 182, 212, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: grid-move 50s linear infinite;
        }
        
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
        
        /* Content Panel */
        .cyber-content-panel {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          backdrop-filter: blur(10px);
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 0 0 1px rgba(6, 182, 212, 0.1) inset,
            0 0 20px rgba(6, 182, 212, 0.1);
          position: relative;
        }
        
        /* Search Form */
        .cyber-search-form {
          width: 100%;
        }
        
        .cyber-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          transition: all 0.3s;
          overflow: hidden;
        }
        
        .cyber-input-wrapper:focus-within {
          border-color: rgba(6, 182, 212, 0.8);
          box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.2) inset,
                      0 0 15px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-input-field {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: rgba(226, 232, 240, 0.9);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.875rem;
          padding: 0.75rem 1rem;
          width: 100%;
        }
        
        .cyber-input-field::placeholder {
          color: rgba(226, 232, 240, 0.5);
        }
        
        .cyber-search-button {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(6, 182, 212, 0.2);
          border: none;
          color: rgb(6, 182, 212);
          width: 3rem;
          height: 100%;
          border-left: 1px solid rgba(6, 182, 212, 0.3);
          transition: all 0.3s;
        }
        
        .cyber-search-button:hover {
          background: rgba(6, 182, 212, 0.3);
        }
        
        /* Categories */
        .cyber-categories {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .cyber-category-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          color: rgba(226, 232, 240, 0.9);
          font-size: 0.875rem;
          transition: all 0.3s;
        }
        
        .cyber-category-button:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.5);
          transform: translateY(-2px);
        }
        
        .cyber-category-active {
          background: rgba(6, 182, 212, 0.2);
          border-color: rgba(6, 182, 212, 0.6);
          color: rgb(6, 182, 212);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-category-indicator {
          width: 0.5rem;
          height: 0.5rem;
          background: rgb(6, 182, 212);
          border-radius: 50%;
          opacity: 0;
          transition: all 0.3s;
        }
        
        .cyber-category-active .cyber-category-indicator {
          opacity: 1;
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.5);
        }
        
        /* Subcategories */
        .cyber-subcategories {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .cyber-subcategory-button {
          padding: 0.375rem 0.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          color: rgba(226, 232, 240, 0.8);
          font-size: 0.75rem;
          transition: all 0.3s;
        }
        
        .cyber-subcategory-button:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.4);
        }
        
        .cyber-subcategory-active {
          background: rgba(6, 182, 212, 0.1);
          border-color: rgba(6, 182, 212, 0.5);
          color: rgb(6, 182, 212);
        }
        
        /* Results Info */
        .cyber-results-info {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.7);
        }
        
        /* Features Cards */
        .cyber-feature-card {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .cyber-feature-card:hover {
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.2);
          transform: translateY(-4px);
        }
        
        .cyber-feature-icon {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
          border-radius: 12px;
          margin-bottom: 1rem;
          color: rgb(6, 182, 212);
          position: relative;
          overflow: hidden;
        }
        
        .cyber-feature-icon::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            0deg,
            transparent,
            rgba(6, 182, 212, 0.3),
            transparent
          );
          transform: rotate(45deg);
          transition: all 0.6s;
          opacity: 0;
        }
        
        .cyber-feature-card:hover .cyber-feature-icon::after {
          opacity: 1;
          transform: rotate(45deg) translateY(100%);
        }
        
        .cyber-feature-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.5rem;
        }
        
        .cyber-feature-description {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.8);
          margin-bottom: 1rem;
          line-height: 1.5;
        }
        
        .cyber-feature-details {
          border-top: 1px solid rgba(6, 182, 212, 0.2);
          padding-top: 1rem;
        }
        
        .cyber-feature-detail {
          display: flex;
          font-size: 0.75rem;
          margin-bottom: 0.25rem;
        }
        
        .cyber-detail-label {
          color: rgba(226, 232, 240, 0.6);
          width: 5rem;
          flex-shrink: 0;
        }
        
        .cyber-detail-value {
          color: rgba(226, 232, 240, 0.9);
        }
        
        /* CTA Panel */
        .cyber-cta-panel {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(79, 70, 229, 0.3) 100%);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .cyber-cta-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%2306b6d4' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
          opacity: 0.5;
        }
        
        .cyber-cta-content {
          position: relative;
          z-index: 1;
          margin-bottom: 1.5rem;
        }
        
        .cyber-cta-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.5rem;
        }
        
        .cyber-cta-description {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-cta-button {
          display: inline-flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.375rem;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.3s;
          position: relative;
          z-index: 1;
        }
        
        .cyber-cta-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        /* Corner Decorations */
        .cyber-corner {
          position: absolute;
          width: 6px;
          height: 6px;
          border-color: rgb(6, 182, 212);
        }
        
        .cyber-corner-tl {
          top: 0;
          left: 0;
          border-top: 1px solid;
          border-left: 1px solid;
        }
        
        .cyber-corner-tr {
          top: 0;
          right: 0;
          border-top: 1px solid;
          border-right: 1px solid;
        }
        
        .cyber-corner-bl {
          bottom: 0;
          left: 0;
          border-bottom: 1px solid;
          border-left: 1px solid;
        }
        
        .cyber-corner-br {
          bottom: 0;
          right: 0;
          border-bottom: 1px solid;
          border-right: 1px solid;
        }
        
        /* Loading Animation */
        .cyber-loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .cyber-loading-spinner {
          position: relative;
          width: 3rem;
          height: 3rem;
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
          font-family: 'JetBrains Mono', monospace;
        }
        
        /* Empty State */
        .cyber-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .cyber-empty-icon {
          opacity: 0.3;
        }
        
        .cyber-empty-title {
          font-size: 1.125rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.8);
          margin-bottom: 0.5rem;
        }
        
        .cyber-empty-message {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.6);
          max-width: 24rem;
        }
        
        /* Animations */
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .cyber-blink {
          animation: blink 1s step-end infinite;
        }
        
        .animate-pulse-slow {
          animation: animate-pulse-slow 3s infinite;
        }
        
        @keyframes animate-pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default MentorshipPage;