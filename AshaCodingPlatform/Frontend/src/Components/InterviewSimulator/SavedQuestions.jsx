import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import InterviewNavigation from './InterviewNavigation';

const SavedQuestions = () => {
  const currentUser = {
    id: '507f1f77bcf86cd799439011',
    name: 'Demo User',
    email: 'demo@example.com'
  };
  
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [saveNotes, setSaveNotes] = useState('');
  const [saveTags, setSaveTags] = useState('');
  const [newListName, setNewListName] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    tag: 'all',
    difficulty: 'all',
    search: ''
  });
  const [activeLists, setActiveLists] = useState(['Saved']); // Default list name
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // API URL
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';
  
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
  
  // Fetch saved questions on component mount
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    fetchSavedQuestions();
  }, []);
  
  // Fetch saved questions from API
  const fetchSavedQuestions = async () => {
    setLoading(true);
    
    try {
      const response = await axios.get(`${API_URL}/interview/saved-questions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        setSavedQuestions(response.data.savedQuestions);
        
        // Extract all unique lists and select the first one
        const allLists = ['Saved']; // Default list always exists
        response.data.savedQuestions.forEach(sq => {
          if (sq.lists && sq.lists.length > 0) {
            sq.lists.forEach(list => {
              if (!allLists.includes(list)) {
                allLists.push(list);
              }
            });
          }
        });
        
        setActiveLists(['Saved']); // Default to "Saved" list
      } else {
        throw new Error("Failed to fetch saved questions");
      }
    } catch (error) {
      console.error("Error fetching saved questions:", error);
      toast.error("Failed to load your saved questions");
    } finally {
      setLoading(false);
    }
  };
  
  // Filter saved questions based on current filters and active list
  const getFilteredQuestions = () => {
    return savedQuestions.filter(savedQuestion => {
      const question = savedQuestion.questionId;
      
      // First filter by active lists
      const isInActiveList = activeLists.some(list => 
        savedQuestion.lists && savedQuestion.lists.includes(list)
      );
      
      if (!isInActiveList) return false;
      
      // Then apply other filters
      const typeMatch = filters.type === 'all' || question.type === filters.type;
      const difficultyMatch = filters.difficulty === 'all' || question.difficulty === filters.difficulty;
      
      // Tag filter
      const tagMatch = filters.tag === 'all' || 
        (savedQuestion.tags && savedQuestion.tags.includes(filters.tag));
      
      // Search filter
      const searchTerm = filters.search.toLowerCase();
      const searchMatch = !searchTerm || 
        question.question.toLowerCase().includes(searchTerm) || 
        question.answer.toLowerCase().includes(searchTerm);
      
      return typeMatch && difficultyMatch && tagMatch && searchMatch;
    });
  };
  
  // Get all unique tags from saved questions
  const getAllTags = () => {
    const allTags = new Set();
    
    savedQuestions.forEach(savedQuestion => {
      if (savedQuestion.tags && savedQuestion.tags.length > 0) {
        savedQuestion.tags.forEach(tag => allTags.add(tag));
      }
    });
    
    return Array.from(allTags);
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  // Toggle a list's active state
  const toggleList = (list) => {
    if (activeLists.includes(list)) {
      // If it's the only active list, don't remove it
      if (activeLists.length === 1) return;
      
      setActiveLists(activeLists.filter(l => l !== list));
    } else {
      setActiveLists([...activeLists, list]);
    }
  };
  
  // Open question details modal
  const openQuestionDetails = (savedQuestion) => {
    setSelectedQuestion(savedQuestion);
    setSaveNotes(savedQuestion.notes || '');
    setSaveTags(savedQuestion.tags ? savedQuestion.tags.join(', ') : '');
  };
  
  // Close question details modal
  const closeQuestionDetails = () => {
    setSelectedQuestion(null);
    setSaveNotes('');
    setSaveTags('');
  };
  
  // Update a saved question
  const updateSavedQuestion = async () => {
    if (!selectedQuestion) return;
    
    try {
      const tagsArray = saveTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
      
      const data = {
        questionId: selectedQuestion.questionId._id,
        notes: saveNotes,
        tags: tagsArray
      };
      
      const response = await axios.post(`${API_URL}/interview/save-question`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        toast.success("Question updated successfully");
        fetchSavedQuestions(); // Refresh saved questions
        closeQuestionDetails();
      } else {
        throw new Error("Failed to update question");
      }
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question. Please try again.");
    }
  };
  
  // Remove a saved question
  const removeSavedQuestion = async () => {
    if (!selectedQuestion) return;
    
    try {
      const response = await axios.delete(`${API_URL}/interview/saved-questions/${selectedQuestion._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        toast.success("Question removed from saved list");
        fetchSavedQuestions(); // Refresh saved questions
        closeQuestionDetails();
      } else {
        throw new Error("Failed to remove question");
      }
    } catch (error) {
      console.error("Error removing saved question:", error);
      toast.error("Failed to remove question. Please try again.");
    }
  };
  
  // Get unique lists from all saved questions
  const getAllLists = () => {
    const allLists = new Set(['Saved']); // Default list always exists
    
    savedQuestions.forEach(sq => {
      if (sq.lists && sq.lists.length > 0) {
        sq.lists.forEach(list => allLists.add(list));
      }
    });
    
    return Array.from(allLists);
  };
  
  // Add question to a list
  const addToList = async (list) => {
    if (!selectedQuestion) return;
    
    try {
      // First, ensure the list is in the question's lists
      let newLists = [...(selectedQuestion.lists || [])];
      if (!newLists.includes(list)) {
        newLists.push(list);
      }
      
      const data = {
        questionId: selectedQuestion.questionId._id,
        notes: selectedQuestion.notes || '',
        tags: selectedQuestion.tags || [],
        lists: newLists
      };
      
      const response = await axios.post(`${API_URL}/interview/save-question`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        toast.success(`Added to ${list}`);
        fetchSavedQuestions(); // Refresh saved questions
      } else {
        throw new Error("Failed to update lists");
      }
    } catch (error) {
      console.error("Error updating lists:", error);
      toast.error("Failed to update lists. Please try again.");
    }
  };
  
  // Create a new list
  const createNewList = async () => {
    if (!newListName.trim()) {
      toast.error("Please enter a list name");
      return;
    }
    
    // No need for a separate API call, just add this to the active lists
    const listName = newListName.trim();
    setActiveLists([...activeLists, listName]);
    toast.success(`Created list "${listName}"`);
    setNewListName('');
  };
  
  const filteredQuestions = getFilteredQuestions();
  const allTags = getAllTags();
  const allLists = getAllLists();

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <h1 className="text-xl font-medium text-white">
            Your Saved Questions
            <span className="cyber-blink">_</span>
          </h1>
        </div>
        <p className="mt-2 text-gray-400 max-w-3xl">
          Manage and organize your saved interview questions. Create lists and add notes to help with your interview preparation.
        </p>
      </div>
      
      {!currentUser ? (
        <div className="cyber-content-panel p-6 text-center">
          <div className="cyber-empty-state py-8">
            <div className="cyber-empty-icon mb-4">
              <svg className="h-16 w-16 text-gray-700 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="cyber-empty-title">Authentication Required</h3>
            <p className="cyber-empty-message">
              Please log in to view and manage your saved questions.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <Link to="/login" className="cyber-button-primary">
                <span>Log In</span>
                <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </Link>
              <Link to="/question-bank" className="cyber-button-secondary">
                <span>Browse Question Bank</span>
                <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          {/* Sidebar - 1/4 width on large screens */}
          <div className="lg:col-span-3">
            <div className="cyber-content-panel p-6 sticky top-20">
              {/* Search */}
              <div className="mb-6">
                <div className="cyber-search-bar">
                  <input
                    type="text"
                    placeholder="Search questions..."
                    className="cyber-search-input"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                  <div className="cyber-search-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <h2 className="cyber-section-title mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0" />
                </svg>
                Filters
              </h2>
              
              {/* Type Filter */}
              <div className="mb-4">
                <label className="cyber-form-label" htmlFor="type">Question Type</label>
                <select
                  id="type"
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="cyber-form-select"
                >
                  <option value="all">All Types</option>
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="system-design">System Design</option>
                </select>
              </div>
              
              {/* Difficulty Filter */}
              <div className="mb-4">
                <label className="cyber-form-label" htmlFor="difficulty">Difficulty</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={filters.difficulty}
                  onChange={handleFilterChange}
                  className="cyber-form-select"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              {/* Tag Filter */}
              <div className="mb-6">
                <label className="cyber-form-label" htmlFor="tag">Tag</label>
                <select
                  id="tag"
                  name="tag"
                  value={filters.tag}
                  onChange={handleFilterChange}
                  className="cyber-form-select"
                >
                  <option value="all">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              
              {/* Reset Filters Button */}
              <button 
                onClick={() => setFilters({
                  type: 'all',
                  tag: 'all',
                  difficulty: 'all',
                  search: ''
                })}
                className="cyber-button-secondary w-full mb-8"
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reset Filters</span>
              </button>
              
              <h2 className="cyber-section-title mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Lists
              </h2>
              
              <div className="cyber-lists space-y-2 mb-6">
                {allLists.map(list => (
                  <button
                    key={list}
                    className={`cyber-list-button ${activeLists.includes(list) ? 'cyber-list-active' : ''}`}
                    onClick={() => toggleList(list)}
                  >
                    <div className="cyber-list-icon">
                      {activeLists.includes(list) ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                    </div>
                    <span className="cyber-list-name">{list}</span>
                    <span className="cyber-list-count">{savedQuestions.filter(sq => sq.lists && sq.lists.includes(list)).length}</span>
                  </button>
                ))}
                
                {/* New List Form */}
                <div className="mt-2 pt-2 border-t border-gray-800">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Create New List</h3>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="List name..."
                      className="cyber-form-input text-sm py-1 flex-1 min-w-0"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && createNewList()}
                    />
                    <button 
                      className="cyber-button-sm ml-2 whitespace-nowrap"
                      onClick={createNewList}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Link to Question Bank */}
              <Link to="/question-bank" className="cyber-feature-button w-full">
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Find More Questions</span>
              </Link>
            </div>
          </div>
          
          {/* Questions List - 3/4 width on large screens */}
          <div className="lg:col-span-9">
            <div className="cyber-content-panel p-6">
              <h2 className="cyber-section-title mb-6 flex justify-between items-center">
                <span>
                  {activeLists.length === 1 
                    ? `${activeLists[0]} (${filteredQuestions.length})` 
                    : `Multiple Lists (${filteredQuestions.length})`}
                </span>
                <div className="flex items-center">
                  <div className="cyber-view-toggle mr-4">
                    <button className="cyber-view-option cyber-view-active">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </button>
                    <button className="cyber-view-option">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                  <Link to="/question-bank" className="cyber-button-sm">
                    <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add New</span>
                  </Link>
                </div>
              </h2>
              
              {loading ? (
                <div className="cyber-loading-container py-8">
                  <div className="cyber-loading-spinner">
                    <div className="cyber-spinner-ring"></div>
                    <div className="cyber-spinner-ring"></div>
                    <div className="cyber-spinner-ring"></div>
                  </div>
                  <p className="cyber-loading-text mt-4">Loading your saved questions...</p>
                </div>
              ) : filteredQuestions.length > 0 ? (
                <div className="cyber-questions-grid">
                  {filteredQuestions.map(savedQuestion => (
                    <div 
                      key={savedQuestion._id} 
                      className="cyber-question-card"
                      onClick={() => openQuestionDetails(savedQuestion)}
                    >
                      <div className="cyber-question-header">
                        <div className="cyber-tag-container">
                          <span className={`cyber-tag cyber-tag-${savedQuestion.questionId.type}`}>
                            {savedQuestion.questionId.type.charAt(0).toUpperCase() + savedQuestion.questionId.type.slice(1)}
                          </span>
                          <span className={`cyber-tag cyber-tag-${savedQuestion.questionId.difficulty}`}>
                            {savedQuestion.questionId.difficulty.charAt(0).toUpperCase() + savedQuestion.questionId.difficulty.slice(1)}
                          </span>
                        </div>
                        
                        <div className="cyber-question-saved-indicator">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </div>
                      </div>
                      
                      <h3 className="cyber-question-title">{savedQuestion.questionId.question}</h3>
                      
                      {savedQuestion.notes && (
                        <div className="cyber-question-notes">
                          <div className="cyber-question-notes-header">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Your Notes</span>
                          </div>
                          <p className="cyber-question-notes-content">{savedQuestion.notes}</p>
                        </div>
                      )}
                      
                      <div className="cyber-question-meta">
                        {savedQuestion.lists && savedQuestion.lists.length > 0 && (
                          <div className="cyber-question-lists">
                            {savedQuestion.lists.map(list => (
                              <span key={list} className="cyber-list-badge">
                                {list}
                              </span>
                            ))}
                          </div>
                        )}
                      
                        {savedQuestion.tags && savedQuestion.tags.length > 0 && (
                          <div className="cyber-question-tags">
                            {savedQuestion.tags.map(tag => (
                              <span key={tag} className="cyber-question-tag">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Corner Decorations */}
                      <div className="cyber-corner cyber-corner-tl"></div>
                      <div className="cyber-corner cyber-corner-tr"></div>
                      <div className="cyber-corner cyber-corner-bl"></div>
                      <div className="cyber-corner cyber-corner-br"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cyber-empty-state py-12">
                  <div className="cyber-empty-icon mb-4">
                    <svg className="h-16 w-16 text-gray-700 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                  <h3 className="cyber-empty-title">No Saved Questions Found</h3>
                  <p className="cyber-empty-message">
                    {savedQuestions.length === 0 
                      ? "You haven't saved any questions yet. Browse the question bank and save questions for your interview preparation."
                      : "No questions match your current filters or selected lists."}
                  </p>
                  <Link to="/question-bank" className="cyber-button-primary mt-6">
                    <span>Browse Question Bank</span>
                    <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Question Details Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm" onClick={closeQuestionDetails}></div>
          
          <div className="cyber-modal">
            <div className="cyber-modal-header">
              <div className="cyber-tag-container">
                <span className={`cyber-tag cyber-tag-${selectedQuestion.questionId.type}`}>
                  {selectedQuestion.questionId.type.charAt(0).toUpperCase() + selectedQuestion.questionId.type.slice(1)}
                </span>
                <span className={`cyber-tag cyber-tag-${selectedQuestion.questionId.difficulty}`}>
                  {selectedQuestion.questionId.difficulty.charAt(0).toUpperCase() + selectedQuestion.questionId.difficulty.slice(1)}
                </span>
              </div>
              <button className="cyber-modal-close" onClick={closeQuestionDetails}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="cyber-modal-content">
              <h3 className="cyber-modal-title">{selectedQuestion.questionId.question}</h3>
              
              <div className="cyber-modal-section">
                <h4 className="cyber-modal-subtitle">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Answer / Expected Response
                </h4>
                <p className="cyber-modal-text">{selectedQuestion.questionId.answer}</p>
              </div>
              
              <div className="cyber-modal-meta">
                {selectedQuestion.questionId.company && (
                  <div className="cyber-modal-meta-item">
                    <span className="cyber-modal-meta-label">Company:</span>
                    <span className="cyber-modal-meta-value">{selectedQuestion.questionId.company}</span>
                  </div>
                )}
                
                <div className="cyber-modal-meta-item">
                  <span className="cyber-modal-meta-label">Category:</span>
                  <span className="cyber-modal-meta-value">{selectedQuestion.questionId.category}</span>
                </div>
                
                {selectedQuestion.questionId.topics && selectedQuestion.questionId.topics.length > 0 && (
                  <div className="cyber-modal-meta-item">
                    <span className="cyber-modal-meta-label">Topics:</span>
                    <span className="cyber-modal-meta-value">{selectedQuestion.questionId.topics.join(', ')}</span>
                  </div>
                )}
              </div>
              
              {/* Lists */}
              <div className="cyber-modal-lists-section mb-4">
                <h4 className="cyber-modal-subtitle flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Lists
                </h4>
                <div className="cyber-modal-lists">
                  {selectedQuestion.lists && selectedQuestion.lists.map(list => (
                    <span key={list} className="cyber-list-badge">
                      {list}
                    </span>
                  ))}
                </div>
                
                {/* Add to List */}
                <div className="cyber-modal-add-to-list mt-2">
                  <select
                    id="addToList"
                    className="cyber-form-select text-sm py-1"
                    defaultValue=""
                  >
                    <option value="" disabled>Add to list...</option>
                    {allLists.map(list => (
                      <option 
                        key={list} 
                        value={list}
                        disabled={selectedQuestion.lists && selectedQuestion.lists.includes(list)}
                      >
                        {list}
                      </option>
                    ))}
                    <option value="new">+ Create New List</option>
                  </select>
                  <button 
                    className="cyber-button-sm ml-2"
                    onClick={() => {
                      const select = document.getElementById('addToList');
                      if (select.value === 'new') {
                        const newListName = prompt("Enter new list name:");
                        if (newListName) {
                          setNewListName(newListName);
                          createNewList();
                          addToList(newListName);
                        }
                      } else if (select.value) {
                        addToList(select.value);
                      }
                    }}
                  >
                    <span>Add</span>
                  </button>
                </div>
              </div>
              
              {/* Notes & Tags */}
              <div className="cyber-modal-save-section">
                <div className="cyber-modal-save-header">
                  <svg className="h-5 w-5 text-cyan-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Your Notes</span>
                </div>
                
                <div className="cyber-modal-save-content">
                  <div className="mb-4">
                    <div className="cyber-input-container">
                      <textarea
                        id="saveNotes"
                        value={saveNotes}
                        onChange={(e) => setSaveNotes(e.target.value)}
                        placeholder="Add your personal notes about this question..."
                        className="cyber-form-textarea"
                        rows={3}
                      ></textarea>
                      <div className="cyber-input-focus-bar"></div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="cyber-form-label" htmlFor="saveTags">Tags (comma separated)</label>
                    <div className="cyber-input-container">
                      <input
                        type="text"
                        id="saveTags"
                        value={saveTags}
                        onChange={(e) => setSaveTags(e.target.value)}
                        placeholder="e.g., important, review, hard"
                        className="cyber-form-input"
                      />
                      <div className="cyber-input-focus-bar"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="cyber-modal-footer">
              <div className="flex w-full space-x-4">
                <button 
                  className="cyber-button-danger flex-1"
                  onClick={removeSavedQuestion}
                >
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Remove</span>
                </button>
                
                <button 
                  className="cyber-button-primary flex-1"
                  onClick={updateSavedQuestion}
                >
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span>Update</span>
                </button>
              </div>
            </div>
            
            {/* Corner Decorations */}
            <div className="cyber-corner cyber-corner-tl"></div>
            <div className="cyber-corner cyber-corner-tr"></div>
            <div className="cyber-corner cyber-corner-bl"></div>
            <div className="cyber-corner cyber-corner-br"></div>
          </div>
        </div>
      )}
      
      {/* Styling */}
      <style jsx>{`
        /* Cyberpunk styling */
        
        /* Animations */
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
        
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
        
        /* Search Bar */
        .cyber-search-bar {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .cyber-search-input {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          padding: 0.625rem 1rem 0.625rem 2.5rem;
          color: rgba(226, 232, 240, 0.9);
          font-size: 0.875rem;
          width: 100%;
          transition: all 0.3s;
        }
        
        .cyber-search-input:focus {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.5);
          outline: none;
          box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-search-icon {
          position: absolute;
          left: 0.75rem;
          color: rgba(6, 182, 212, 0.7);
          pointer-events: none;
        }
        
        /* Lists */
        .cyber-lists {
          max-height: 200px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(6, 182, 212, 0.5) rgba(15, 23, 42, 0.3);
        }
        
        .cyber-lists::-webkit-scrollbar {
          width: 4px;
        }
        
        .cyber-lists::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
        }
        
        .cyber-lists::-webkit-scrollbar-thumb {
          background-color: rgba(6, 182, 212, 0.5);
          border-radius: 2px;
        }
        
        .cyber-list-button {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 0.5rem 0.75rem;
          text-align: left;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          color: rgba(226, 232, 240, 0.8);
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .cyber-list-button:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.4);
          transform: translateY(-1px);
        }
        
        .cyber-list-active {
          background: rgba(6, 182, 212, 0.1);
          border-color: rgba(6, 182, 212, 0.5);
          color: rgb(6, 182, 212);
        }
        
        .cyber-list-icon {
          color: currentColor;
          margin-right: 0.5rem;
          flex-shrink: 0;
        }
        
        .cyber-list-name {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .cyber-list-count {
          margin-left: auto;
          font-size: 0.75rem;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 999px;
          padding: 0.125rem 0.5rem;
        }
        
        .cyber-list-active .cyber-list-count {
          background: rgba(6, 182, 212, 0.2);
        }
        
        .cyber-list-badge {
          display: inline-block;
          font-size: 0.75rem;
          padding: 0.125rem 0.5rem;
          margin-right: 0.5rem;
          margin-bottom: 0.25rem;
          background: rgba(6, 182, 212, 0.1);
          color: rgb(6, 182, 212);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.25rem;
        }
        
        /* Form Inputs */
        .cyber-form-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.7);
          margin-bottom: 0.375rem;
        }
        
        .cyber-form-select {
          width: 100%;
          padding: 0.5rem 0.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          color: rgba(226, 232, 240, 0.9);
          font-size: 0.875rem;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2306b6d4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1rem;
          padding-right: 2.5rem;
          transition: all 0.3s;
        }
        
        .cyber-form-select:focus {
          background-color: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.5);
          outline: none;
          box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-form-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          color: rgba(226, 232, 240, 0.9);
          font-size: 0.875rem;
          transition: all 0.3s;
        }
        
        .cyber-form-input:focus {
          background-color: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.5);
          outline: none;
          box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-form-textarea {
          width: 100%;
          padding: 0.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          color: rgba(226, 232, 240, 0.9);
          font-size: 0.875rem;
          resize: vertical;
          min-height: 5rem;
          transition: all 0.3s;
        }
        
        .cyber-form-textarea:focus {
          background-color: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.5);
          outline: none;
          box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-input-container {
          position: relative;
        }
        
        .cyber-input-focus-bar {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, rgb(6, 182, 212), rgb(79, 70, 229));
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        
        .cyber-form-input:focus + .cyber-input-focus-bar,
        .cyber-form-textarea:focus + .cyber-input-focus-bar {
          width: 100%;
        }
        
        /* View Toggle */
        .cyber-view-toggle {
          display: flex;
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          overflow: hidden;
        }
        
        .cyber-view-option {
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.6);
          color: rgba(226, 232, 240, 0.7);
          transition: all 0.3s;
        }
        
        .cyber-view-option:hover {
          background: rgba(15, 23, 42, 0.8);
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-view-active {
          background: rgba(6, 182, 212, 0.2);
          color: rgb(6, 182, 212);
        }
        
        /* Questions Grid */
        .cyber-questions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        /* Question Card */
        .cyber-question-card {
          position: relative;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          padding: 1.25rem;
          transition: all 0.3s;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          cursor: pointer;
        }
        
        .cyber-question-card:hover {
          border-color: rgba(6, 182, 212, 0.4);
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.15);
          transform: translateY(-4px);
        }
        
        .cyber-question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .cyber-tag-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .cyber-tag {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          font-size: 0.6875rem;
          font-weight: 500;
          border-radius: 0.25rem;
          text-transform: capitalize;
        }
        
        .cyber-tag-technical {
          background: rgba(6, 182, 212, 0.2);
          color: rgb(6, 182, 212);
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        
        .cyber-tag-behavioral {
          background: rgba(16, 185, 129, 0.2);
          color: rgb(16, 185, 129);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .cyber-tag-system-design {
          background: rgba(79, 70, 229, 0.2);
          color: rgb(79, 70, 229);
          border: 1px solid rgba(79, 70, 229, 0.3);
        }
        
        .cyber-tag-easy {
          background: rgba(16, 185, 129, 0.2);
          color: rgb(16, 185, 129);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .cyber-tag-medium {
          background: rgba(245, 158, 11, 0.2);
          color: rgb(245, 158, 11);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        
        .cyber-tag-hard {
          background: rgba(239, 68, 68, 0.2);
          color: rgb(239, 68, 68);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        .cyber-question-saved-indicator {
          color: rgb(6, 182, 212);
        }
        
        .cyber-question-title {
          font-size: 0.9375rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
          line-height: 1.5;
          margin-bottom: 0.75rem;
          flex: 1;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
        
        .cyber-question-notes {
          margin-top: auto;
          padding: 0.75rem;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.25rem;
          margin-bottom: 0.75rem;
        }
        
        .cyber-question-notes-header {
          display: flex;
          align-items: center;
          font-size: 0.75rem;
          font-weight: 500;
          color: rgb(6, 182, 212);
          margin-bottom: 0.5rem;
        }
        
        .cyber-question-notes-content {
          font-size: 0.8125rem;
          color: rgba(226, 232, 240, 0.8);
          line-height: 1.5;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
        
        .cyber-question-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: auto;
        }
        
        .cyber-question-lists {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }
        
        .cyber-question-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }
        
        .cyber-question-tag {
          font-size: 0.6875rem;
          padding: 0.125rem 0.375rem;
          background: rgba(15, 23, 42, 0.8);
          color: rgba(226, 232, 240, 0.7);
          border: 1px solid rgba(226, 232, 240, 0.2);
          border-radius: 0.25rem;
        }
        
        /* Corner decorations */
        .cyber-corner {
          position: absolute;
          width: 6px;
          height: 6px;
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
        
        /* Modal */
        .cyber-modal {
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          width: 90%;
          max-width: 700px;
          max-height: 80vh;
          overflow-y: auto;
          z-index: 10;
          backdrop-filter: blur(10px);
          position: relative;
          box-shadow: 
            0 10px 25px -5px rgba(0, 0, 0, 0.2),
            0 10px 10px -5px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(6, 182, 212, 0.2) inset,
            0 0 30px rgba(6, 182, 212, 0.2);
          scrollbar-width: thin;
          scrollbar-color: rgba(6, 182, 212, 0.5) rgba(15, 23, 42, 0.3);
        }
        
        .cyber-modal::-webkit-scrollbar {
          width: 6px;
        }
        
        .cyber-modal::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
        }
        
        .cyber-modal::-webkit-scrollbar-thumb {
          background-color: rgba(6, 182, 212, 0.5);
          border-radius: 3px;
        }
        
        .cyber-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(6, 182, 212, 0.2);
          position: sticky;
          top: 0;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          z-index: 1;
        }
        
        .cyber-modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.2);
          color: rgba(226, 232, 240, 0.7);
          transition: all 0.3s;
        }
        
        .cyber-modal-close:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.4);
          color: rgb(239, 68, 68);
          transform: rotate(90deg);
        }
        
        .cyber-modal-content {
          padding: 1.5rem;
        }
        
        .cyber-modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.95);
          line-height: 1.5;
          margin-bottom: 1.5rem;
          position: relative;
          padding-bottom: 0.75rem;
        }
        
        .cyber-modal-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 3rem;
          height: 2px;
          background: linear-gradient(90deg, rgb(6, 182, 212), rgba(6, 182, 212, 0));
        }
        
        .cyber-modal-section {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
        }
        
        .cyber-modal-subtitle {
          font-size: 1rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
        }
        
        .cyber-modal-text {
          font-size: 0.9375rem;
          color: rgba(226, 232, 240, 0.8);
          line-height: 1.6;
        }
        
        .cyber-modal-meta {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
        }
        
        .cyber-modal-meta-item {
          display: flex;
          flex-direction: column;
        }
        
        .cyber-modal-meta-label {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.6);
          margin-bottom: 0.25rem;
        }
        
        .cyber-modal-meta-value {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.9);
          font-weight: 500;
        }
        
        .cyber-modal-lists {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        
        .cyber-modal-add-to-list {
          display: flex;
        }
        
        .cyber-modal-save-section {
          margin-top: 1.5rem;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
        }
        
        .cyber-modal-save-header {
          display: flex;
          align-items: center;
          font-size: 1rem;
          font-weight: 500;
          color: rgb(6, 182, 212);
          margin-bottom: 1rem;
        }
        
        .cyber-modal-save-content {
          padding-top: 0.5rem;
        }
        
        .cyber-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(6, 182, 212, 0.2);
          position: sticky;
          bottom: 0;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          z-index: 1;
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
        
        .cyber-button-primary::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            0deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transform: rotate(45deg);
          transition: all 0.6s;
          opacity: 0;
        }
        
        .cyber-button-primary:hover::after {
          opacity: 1;
          transform: rotate(45deg) translateY(100%);
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
        
        .cyber-button-danger {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: rgb(239, 68, 68);
          font-weight: 500;
          border-radius: 0.375rem;
          transition: all 0.3s;
        }
        
        .cyber-button-danger:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(239, 68, 68, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                    0 2px 4px -1px rgba(0, 0, 0, 0.06),
                    0 0 10px rgba(239, 68, 68, 0.2);
        }
        
        .cyber-button-sm {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 0.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          color: rgb(6, 182, 212);
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: 0.375rem;
          transition: all 0.3s;
        }
        
        .cyber-button-sm:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.5);
          transform: translateY(-1px);
          box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1),
                    0 1px 2px -1px rgba(0, 0, 0, 0.06),
                    0 0 5px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-feature-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          color: rgb(6, 182, 212);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .cyber-feature-button:hover {
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                    0 2px 4px -1px rgba(0, 0, 0, 0.06),
                    0 0 10px rgba(6, 182, 212, 0.1);
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
          font-family: monospace;
          margin-top: 1rem;
        }
        
        
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
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default SavedQuestions;