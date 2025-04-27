import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import InterviewService from '../../Services/InterviewService';
import InterviewNavigation from './InterviewNavigation';

const QuestionBank = () => {
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    difficulty: 'all',
    type: 'all',
    company: 'all'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    questionsPerPage: 10,
    totalPages: 1
  });
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Companies list for filter
  const companies = [
    'All Companies', 'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 
    'Netflix', 'Uber', 'Airbnb', 'Twitter', 'LinkedIn', 'Other'
  ];
  
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
  
  // Fetch questions and saved questions on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch questions from backend
        const response = await InterviewService.getQuestionBank({
          page: pagination.currentPage,
          limit: pagination.questionsPerPage,
          ...filters
        });
        
        if (response.success) {
          setQuestions(response.questions);
          setFilteredQuestions(response.questions);
          setPagination(prev => ({
            ...prev,
            currentPage: response.pagination.page,
            totalPages: response.pagination.pages
          }));
        }
        
        // Fetch saved questions if user is logged in
        try {
          const savedResponse = await InterviewService.getSavedQuestions();
          if (savedResponse.success) {
            const savedIds = savedResponse.savedQuestions.map(item => item.questionId._id);
            setSavedQuestions(savedIds);
          }
        } catch (error) {
          // User might not be logged in, which is fine for this page
          console.log("Could not fetch saved questions - user might not be logged in");
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast.error("Failed to load interview questions");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [pagination.currentPage, pagination.questionsPerPage]);
  
  // Fetch questions when filters change
  useEffect(() => {
    const fetchFilteredQuestions = async () => {
      if (Object.values(filters).some(value => value !== 'all' && value !== '')) {
        setIsLoading(true);
        try {
          const response = await InterviewService.getQuestionBank({
            page: 1, // Reset to first page when filtering
            limit: pagination.questionsPerPage,
            ...filters
          });
          
          if (response.success) {
            setQuestions(response.questions);
            setFilteredQuestions(response.questions);
            setPagination(prev => ({
              ...prev,
              currentPage: 1,
              totalPages: response.pagination.pages
            }));
          }
        } catch (error) {
          console.error("Error fetching filtered questions:", error);
          toast.error("Failed to apply filters");
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    // Debounce filter requests to prevent too many API calls
    const timeoutId = setTimeout(fetchFilteredQuestions, 500);
    return () => clearTimeout(timeoutId);
  }, [filters]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value
    }));
  };
  
  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
    
    // Scroll to top of questions container
    // document.getElementById('questions-container')?.scrollTop = 0;
  };
  
  // Toggle saving a question
  const toggleSaveQuestion = async (questionId) => {
    try {
      if (savedQuestions.includes(questionId)) {
        // Find the saved question ID (not the question ID)
        const savedResponse = await InterviewService.getSavedQuestions();
        const savedQuestion = savedResponse.savedQuestions.find(
          item => item.questionId._id === questionId
        );
        
        if (savedQuestion) {
          // Remove from saved
          await InterviewService.removeSavedQuestion(savedQuestion._id);
          setSavedQuestions(prev => prev.filter(id => id !== questionId));
          toast.success("Question removed from saved list");
        }
      } else {
        // Add to saved
        await InterviewService.saveQuestion({ questionId });
        setSavedQuestions(prev => [...prev, questionId]);
        toast.success("Question saved to your list");
      }
    } catch (error) {
      console.error("Error toggling saved question:", error);
      toast.error("You need to be logged in to save questions");
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 overflow-hidden relative">
      <InterviewNavigation />
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="cyber-grid"></div>
      </div>
      
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full filter blur-[150px] bg-blue-900 opacity-20 animate-pulse-slow"
        style={{transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`}}
      ></div>
      <div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full filter blur-[150px] bg-cyan-900 opacity-20 animate-pulse-slow animation-delay-1000"
        style={{transform: `translate(${-mousePosition.x * 30}px, ${-mousePosition.y * 30}px)`}}
      ></div>
      
      {/* Header */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center">
          <svg className="h-8 w-8 text-cyan-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-xl font-medium text-white">
            Interview Question Database
            <span className="cyber-blink">_</span>
          </h1>
        </div>
        <p className="mt-2 text-gray-400 max-w-3xl">
          Browse our extensive collection of technical, behavioral, and system design interview questions from top tech companies.
        </p>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
        {/* Filters Panel */}
        <div className="lg:col-span-1">
          <div className="cyber-content-panel p-6 mb-8 sticky top-24">
            <h2 className="cyber-section-title mb-6">Neural Search Matrix</h2>
            
            {/* Search Input */}
            <div className="mb-6">
              <label className="cyber-form-label mb-2">Keyword Search</label>
              <div className="cyber-input-container">
                <input
                  type="text"
                  value={filters.search}
                  onChange={handleSearchChange}
                  placeholder="Search questions..."
                  className="cyber-form-input"
                />
                <div className="cyber-input-focus-bar"></div>
              </div>
            </div>
            
            {/* Type Filter */}
            <div className="mb-6">
              <label className="cyber-form-label mb-2">Question Type</label>
              <div className="cyber-select-container">
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="cyber-select"
                >
                  <option value="all">All Types</option>
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="system-design">System Design</option>
                </select>
                <div className="cyber-select-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="cyber-input-focus-bar"></div>
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="mb-6">
              <label className="cyber-form-label mb-2">Category</label>
              <div className="cyber-select-container">
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="cyber-select"
                >
                  <option value="all">All Categories</option>
                  <option value="algorithms">Algorithms</option>
                  <option value="data-structures">Data Structures</option>
                  <option value="web">Web Development</option>
                  <option value="databases">Databases</option>
                  <option value="operating-systems">Operating Systems</option>
                  <option value="teamwork">Teamwork</option>
                  <option value="leadership">Leadership</option>
                  <option value="api-design">API Design</option>
                  <option value="web-services">Web Services</option>
                </select>
                <div className="cyber-select-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="cyber-input-focus-bar"></div>
              </div>
            </div>
            
            {/* Difficulty Filter */}
            <div className="mb-6">
              <label className="cyber-form-label mb-2">Difficulty Level</label>
              <div className="cyber-option-group grid grid-cols-3 gap-3">
                <button
                  className={`cyber-option ${filters.difficulty === 'easy' ? 'cyber-option-active' : ''}`}
                  onClick={() => handleFilterChange('difficulty', filters.difficulty === 'easy' ? 'all' : 'easy')}
                >
                  <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Easy</span>
                </button>
                
                <button
                  className={`cyber-option ${filters.difficulty === 'medium' ? 'cyber-option-active' : ''}`}
                  onClick={() => handleFilterChange('difficulty', filters.difficulty === 'medium' ? 'all' : 'medium')}
                >
                  <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Medium</span>
                </button>
                
                <button
                  className={`cyber-option ${filters.difficulty === 'hard' ? 'cyber-option-active' : ''}`}
                  onClick={() => handleFilterChange('difficulty', filters.difficulty === 'hard' ? 'all' : 'hard')}
                >
                  <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Hard</span>
                </button>
              </div>
            </div>
            
            {/* Company Filter */}
            <div className="mb-6">
              <label className="cyber-form-label mb-2">Company</label>
              <div className="cyber-select-container">
                <select
                  value={filters.company}
                  onChange={(e) => handleFilterChange('company', e.target.value)}
                  className="cyber-select"
                >
                  <option value="all">All Companies</option>
                  <option value="Google">Google</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Facebook">Meta</option>
                  <option value="Apple">Apple</option>
                  <option value="Netflix">Netflix</option>
                  <option value="Uber">Uber</option>
                  <option value="Twitter">Twitter</option>
                  <option value="LinkedIn">LinkedIn</option>
                </select>
                <div className="cyber-select-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="cyber-input-focus-bar"></div>
              </div>
            </div>
            
            {/* Reset Filters Button */}
            <button
              className="cyber-button-secondary w-full"
              onClick={() => setFilters({
                search: '',
                category: 'all',
                difficulty: 'all',
                type: 'all',
                company: 'all'
              })}
            >
              <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reset Filters</span>
            </button>
            
            {/* Search Statistics */}
            <div className="mt-6 p-3 bg-gray-800/50 rounded-md">
              <p className="text-sm text-gray-400">
                Showing <span className="text-cyan-400 font-mono">{questions.length}</span> questions (page {pagination.currentPage} of {pagination.totalPages})
              </p>
            </div>
          </div>
        </div>
        
        {/* Questions List */}
        <div className="lg:col-span-3">
          <div className="cyber-content-panel p-6">
            <h2 className="cyber-section-title mb-6 flex justify-between items-center">
              <span>Neural Question Matrix</span>
              
              {questions.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Sort by:</span>
                  <div className="cyber-select-container w-32">
                    <select 
                      className="cyber-select text-sm py-1"
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                    >
                      <option value="relevance">Relevance</option>
                      <option value="difficulty">Difficulty</option>
                      <option value="company">Company</option>
                      <option value="type">Type</option>
                    </select>
                    <div className="cyber-select-arrow">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </h2>
            
            {isLoading ? (
              // Loading state
              <div className="cyber-loading-container py-12">
                <div className="cyber-loading-spinner">
                  <div className="cyber-spinner-ring"></div>
                  <div className="cyber-spinner-ring"></div>
                  <div className="cyber-spinner-ring"></div>
                </div>
                <p className="cyber-loading-text mt-4">Loading neural question database...</p>
              </div>
            ) : questions.length > 0 ? (
              // Questions list
              <div id="questions-container" className="space-y-6 max-h-[calc(100vh-240px)] overflow-y-auto cyber-questions-container">
                {questions.map(question => (
                  <div key={question._id} className="cyber-question-card">
                    <div className="cyber-question-type">
                      <span className={`cyber-question-tag cyber-question-tag-${question.type}`}>
                        {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                      </span>
                    </div>
                    
                    <div className="cyber-question-header">
                      <div className="flex items-center">
                        <span className={`cyber-difficulty-indicator cyber-difficulty-${question.difficulty}`}></span>
                        <span className="cyber-question-company">{question.company}</span>
                      </div>
                      
                      <button
                        className={`cyber-save-button ${savedQuestions.includes(question._id) ? 'cyber-saved' : ''}`}
                        onClick={() => toggleSaveQuestion(question._id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={savedQuestions.includes(question._id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>
                    
                    <h3 className="cyber-question-text">{question.question}</h3>
                    
                    <div className="cyber-question-answer">
                      <h4 className="cyber-answer-title">Expected Answer:</h4>
                      <p className="cyber-answer-content">{question.answer}</p>
                    </div>
                    
                    <div className="cyber-question-topics">
                      {question.topics && question.topics.map(topic => (
                        <span key={topic} className="cyber-topic-tag">
                          {topic}
                        </span>
                      ))}
                    </div>
                    
                    <div className="cyber-question-actions">
                      <button className="cyber-action-button cyber-action-button-practice">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                        <span>Practice</span>
                      </button>
                      
                      <button className="cyber-action-button cyber-action-button-similar">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Similar</span>
                      </button>
                      
                      <button className="cyber-action-button cyber-action-button-add">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Add to List</span>
                      </button>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="cyber-corner cyber-corner-tl"></div>
                    <div className="cyber-corner cyber-corner-tr"></div>
                    <div className="cyber-corner cyber-corner-bl"></div>
                    <div className="cyber-corner cyber-corner-br"></div>
                    <div className="cyber-scan-line"></div>
                  </div>
                ))}
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="cyber-pagination">
                    <button
                      className={`cyber-pagination-button ${pagination.currentPage === 1 ? 'cyber-pagination-disabled' : ''}`}
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <div className="cyber-pagination-pages">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        const totalPages = pagination.totalPages;
                        const currentPage = pagination.currentPage;
                        
                        if (totalPages <= 5) {
                          // Show all pages if 5 or fewer
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          // Near the start
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          // Near the end
                          pageNum = totalPages - 4 + i;
                        } else {
                          // In the middle
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            className={`cyber-pagination-page ${pageNum === currentPage ? 'cyber-pagination-current' : ''}`}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      className={`cyber-pagination-button ${pagination.currentPage === pagination.totalPages ? 'cyber-pagination-disabled' : ''}`}
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // No questions found
              <div className="cyber-empty-state py-12 text-center">
                <div className="cyber-empty-icon mb-4">
                  <svg className="h-16 w-16 text-gray-700 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="cyber-empty-title">No Questions Found</h3>
                <p className="cyber-empty-message">
                  Try adjusting your filters or search query to find matching questions.
                </p>
                <button 
                  className="cyber-button-primary mt-6"
                  onClick={() => setFilters({
                    search: '',
                    category: 'all',
                    difficulty: 'all',
                    type: 'all',
                    company: 'all'
                  })}
                >
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Practice Interview CTA */}
          <div className="cyber-cta-panel mt-8">
            <div className="cyber-cta-content">
              <h3 className="cyber-cta-title">Ready to put your knowledge to the test?</h3>
              <p className="cyber-cta-description">
                Practice with realistic interview simulations and receive detailed feedback on your performance.
              </p>
            </div>
            
            <Link to="/interview-simulator" className="cyber-cta-button">
              <span>Start Interview Simulation</span>
              <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Cyberpunk styling */}
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
        
        /* Section Titles */
        .cyber-section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: rgb(6, 182, 212);
          letter-spacing: 0.025em;
        }
        
        /* Form Controls */
        .cyber-form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgb(6, 182, 212);
        }
        
        .cyber-input-container {
          position: relative;
          width: 100%;
        }
        
        .cyber-form-input {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          padding: 0.75rem 1rem;
          color: rgba(226, 232, 240, 0.9);
          font-size: 0.875rem;
          transition: all 0.3s;
          font-family: 'JetBrains Mono', monospace;
        }
        
        .cyber-form-input:focus {
          outline: none;
          border-color: rgba(6, 182, 212, 0.8);
          box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.3);
        }
        
        .cyber-input-focus-bar {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
          transition: transform 0.3s;
          transform-origin: center;
        }
        
        .cyber-form-input:focus + .cyber-input-focus-bar {
          transform: translateX(-50%) scaleX(1);
        }
        
        /* Select controls */
        .cyber-select-container {
          position: relative;
          width: 100%;
        }
        
        .cyber-select {
          width: 100%;
          appearance: none;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          padding: 0.75rem 1rem;
          color: rgba(226, 232, 240, 0.9);
          font-size: 0.875rem;
          transition: all 0.3s;
          cursor: pointer;
        }
        
        .cyber-select:focus {
          outline: none;
          border-color: rgba(6, 182, 212, 0.8);
          box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.3);
        }
        
        .cyber-select-arrow {
          position: absolute;
          top: 50%;
          right: 1rem;
          transform: translateY(-50%);
          color: rgb(6, 182, 212);
          pointer-events: none;
        }
        
        /* Option groups */
        .cyber-option-group {
          display: grid;
        }
        
        .cyber-option {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          color: rgba(226, 232, 240, 0.8);
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.3s;
          cursor: pointer;
        }
        
        .cyber-option:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                    0 2px 4px -1px rgba(0, 0, 0, 0.06),
                    0 0 10px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-option-active {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
          border-color: rgba(6, 182, 212, 0.6);
          color: rgb(6, 182, 212);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                    0 2px 4px -1px rgba(0, 0, 0, 0.06),
                    0 0 10px rgba(6, 182, 212, 0.3);
        }
        
        /* Questions container */
        .cyber-questions-container {
          scrollbar-width: thin;
          scrollbar-color: rgba(6, 182, 212, 0.5) rgba(15, 23, 42, 0.3);
          padding-right: 0.5rem;
        }
        
        .cyber-questions-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .cyber-questions-container::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 3px;
        }
        
        .cyber-questions-container::-webkit-scrollbar-thumb {
          background-color: rgba(6, 182, 212, 0.5);
          border-radius: 3px;
        }
        
        /* Question cards */
        .cyber-question-card {
          position: relative;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          padding: 1.5rem;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .cyber-question-card:hover {
          border-color: rgba(6, 182, 212, 0.4);
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.1);
        }
        
        .cyber-question-type {
          position: absolute;
          top: 1rem;
          right: 1rem;
        }
        
        .cyber-question-tag {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .cyber-question-tag-technical {
          background: rgba(6, 182, 212, 0.2);
          color: rgb(6, 182, 212);
          border: 1px solid rgba(6, 182, 212, 0.4);
        }
        
        .cyber-question-tag-behavioral {
          background: rgba(16, 185, 129, 0.2);
          color: rgb(16, 185, 129);
          border: 1px solid rgba(16, 185, 129, 0.4);
        }
        
        .cyber-question-tag-system-design {
          background: rgba(124, 58, 237, 0.2);
          color: rgb(124, 58, 237);
          border: 1px solid rgba(124, 58, 237, 0.4);
        }
        
        .cyber-question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .cyber-difficulty-indicator {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
          margin-right: 0.5rem;
        }
        
        .cyber-difficulty-easy {
          background: rgb(16, 185, 129);
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
        }
        
        .cyber-difficulty-medium {
          background: rgb(245, 158, 11);
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
        }
        
        .cyber-difficulty-hard {
          background: rgb(239, 68, 68);
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
        }
        
        .cyber-question-company {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
        }
        
        .cyber-save-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.25rem;
          height: 2.25rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          color: rgba(226, 232, 240, 0.7);
          transition: all 0.3s;
        }
        
        .cyber-save-button:hover {
          background: rgba(15, 23, 42, 1);
          border-color: rgba(6, 182, 212, 0.4);
          color: rgb(6, 182, 212);
        }
        
        .cyber-saved {
          color: rgb(6, 182, 212);
          border-color: rgba(6, 182, 212, 0.4);
        }
        
        .cyber-question-text {
          font-size: 1rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 1rem;
        }
        
        .cyber-question-answer {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(6, 182, 212, 0.1);
          border-radius: 0.375rem;
          padding: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .cyber-answer-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgb(6, 182, 212);
          margin-bottom: 0.5rem;
        }
        
        .cyber-answer-content {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.8);
          line-height: 1.5;
        }
        
        .cyber-question-topics {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .cyber-topic-tag {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 0.25rem;
          color: rgba(226, 232, 240, 0.7);
        }
        
        .cyber-question-actions {
          display: flex;
          gap: 0.5rem;
          border-top: 1px solid rgba(6, 182, 212, 0.1);
          padding-top: 1rem;
        }
        
        .cyber-action-button {
          display: flex;
          align-items: center;
          padding: 0.5rem 0.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .cyber-action-button:hover {
          transform: translateY(-2px);
        }
        
        .cyber-action-button-practice {
          color: rgb(6, 182, 212);
        }
        
        .cyber-action-button-practice:hover {
          background: rgba(6, 182, 212, 0.1);
          border-color: rgba(6, 182, 212, 0.3);
        }
        
        .cyber-action-button-similar {
          color: rgb(124, 58, 237);
        }
        
        .cyber-action-button-similar:hover {
          background: rgba(124, 58, 237, 0.1);
          border-color: rgba(124, 58, 237, 0.3);
        }
        
        .cyber-action-button-add {
          color: rgb(16, 185, 129);
        }
        
        .cyber-action-button-add:hover {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
        }
        
        /* Scan line animation */
        .cyber-scan-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.8), transparent);
          animation: scan-line 3s linear infinite;
          opacity: 0.5;
        }
        
        @keyframes scan-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
        
        /* Corner decorations */
        .cyber-corner {
          position: absolute;
          width: 10px;
          height: 10px;
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
        
        /* Pagination */
        .cyber-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(6, 182, 212, 0.2);
        }
        
        .cyber-pagination-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          color: rgb(6, 182, 212);
          transition: all 0.3s;
        }
        
        .cyber-pagination-button:hover:not(.cyber-pagination-disabled) {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.4);
          transform: translateY(-2px);
        }
        
        .cyber-pagination-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .cyber-pagination-pages {
          display: flex;
          align-items: center;
          margin: 0 0.5rem;
        }
        
        .cyber-pagination-page {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          color: rgba(226, 232, 240, 0.8);
          font-size: 0.875rem;
          margin: 0 0.25rem;
          transition: all 0.3s;
        }
        
        .cyber-pagination-page:hover:not(.cyber-pagination-current) {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.4);
          color: rgb(6, 182, 212);
        }
        
        .cyber-pagination-current {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(79, 70, 229, 0.3) 100%);
          border-color: rgba(6, 182, 212, 0.5);
          color: rgb(6, 182, 212);
          font-weight: 600;
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
          font-family: 'JetBrains Mono', monospace;
        }
        
        /* Empty State */
        .cyber-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
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
        
        /* Buttons */
        .cyber-button-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
          border: none;
          color: white;
          font-weight: 500;
          border-radius: 0.375rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .cyber-button-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                    0 4px 6px -2px rgba(0, 0, 0, 0.05),
                    0 0 20px rgba(6, 182, 212, 0.3);
        }
        
        .cyber-button-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          color: rgb(6, 182, 212);
          font-weight: 500;
          border-radius: 0.375rem;
          transition: all 0.3s;
        }
        
        .cyber-button-secondary:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                    0 2px 4px -1px rgba(0, 0, 0, 0.06),
                    0 0 10px rgba(6, 182, 212, 0.2);
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

export default QuestionBank;