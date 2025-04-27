import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import InterviewNavigation from './InterviewNavigation';
import InterviewService from '../../Services/InterviewService';

const CustomInterviewsPage = () => {
  const navigate = useNavigate();
  
  // Mock current user data - replace with context/authentication in production
  const currentUser = {
    id: '507f1f77bcf86cd799439011',
    name: 'Demo User',
    email: 'demo@example.com'
  };
  
  const [customInterviews, setCustomInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    interviewType: 'all',
    role: '',
    seniority: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
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
  
  // Fetch custom interviews on component mount
  useEffect(() => {
    fetchCustomInterviews();
  }, []);
  
  // Fetch custom interviews from API
  const fetchCustomInterviews = async () => {
    setLoading(true);
    
    try {
      // Attempt to use the InterviewService first
      let response;
      try {
        response = await InterviewService.getCustomInterviews();
      } catch (serviceError) {
        // Fall back to direct axios call
        response = await axios.get(`${API_URL}/interview/custom-interviews`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        response = response.data;
      }
      
      if (response && response.success) {
        setCustomInterviews(response.customInterviews);
      } else {
        throw new Error("Failed to fetch custom interviews");
      }
    } catch (error) {
      console.error("Error fetching custom interviews:", error);
      toast.error("Failed to load your custom interviews");
      // Set some sample data for development purposes
      setCustomInterviews([
        {
          _id: 'ci-001',
          title: 'Frontend Developer Technical',
          interviewType: 'technical',
          role: 'Frontend Developer',
          seniority: 'mid',
          createdAt: new Date('2023-05-10').toISOString(),
          specificTechnologies: ['React', 'JavaScript', 'CSS', 'HTML'],
          companyValues: ['Innovation', 'Collaboration'],
          questions: [
            { 
              question: "Explain how React's virtual DOM works and its advantages.",
              type: "technical",
              rationale: "Core React concept that affects performance",
              expectedAnswer: "Should explain diffing algorithm and reconciliation process"
            },
            { 
              question: "Describe a situation where you had to optimize a web application for performance. What techniques did you use?",
              type: "technical",
              rationale: "Tests practical experience with performance optimization",
              expectedAnswer: "Should mention code splitting, lazy loading, memoization, etc."
            },
            { 
              question: "Implement a debounce function in JavaScript",
              type: "technical",
              rationale: "Tests JavaScript implementation skills and understanding of timing functions",
              expectedAnswer: "Should correctly implement a debounce function with appropriate timeout handling"
            }
          ],
          isPublic: false,
          questionsNeeded: 5,
          customRequirements: "Focus on React performance and optimization"
        },
        {
          _id: 'ci-002',
          title: 'Senior Backend Engineer',
          interviewType: 'mixed',
          role: 'Backend Engineer',
          seniority: 'senior',
          createdAt: new Date('2023-06-05').toISOString(),
          specificTechnologies: ['Node.js', 'Express', 'MongoDB', 'Redis'],
          companyValues: ['Quality', 'Ownership', 'Customer Focus'],
          questions: [
            { 
              question: "Describe a complex system architecture you designed. What were the challenges and how did you address them?",
              type: "technical",
              rationale: "Tests system design experience at senior level",
              expectedAnswer: "Should demonstrate advanced system design knowledge, scalability considerations"
            },
            { 
              question: "How would you architect a distributed caching system?",
              type: "technical",
              rationale: "Tests distributed systems knowledge",
              expectedAnswer: "Should cover consistency issues, cache invalidation strategies, failure handling"
            },
            { 
              question: "Tell me about a time when you had to make a difficult technical decision with incomplete information.",
              type: "behavioral",
              rationale: "Tests decision making in ambiguous situations",
              expectedAnswer: "Should explain process, trade-offs considered, and outcome reflection"
            }
          ],
          isPublic: true,
          questionsNeeded: 6,
          customRequirements: "Include distributed systems questions and leadership scenarios"
        },
        {
          _id: 'ci-003',
          title: 'Product Manager Behavioral',
          interviewType: 'behavioral',
          role: 'Product Manager',
          seniority: 'mid',
          createdAt: new Date('2023-07-15').toISOString(),
          specificTechnologies: [],
          companyValues: ['User-Centric', 'Data-Driven', 'Collaboration'],
          questions: [
            { 
              question: "Describe a situation where you had to prioritize features for a product. What methodology did you use?",
              type: "behavioral",
              rationale: "Tests prioritization skills essential for PM role",
              expectedAnswer: "Should mention frameworks like RICE, MoSCoW, opportunity scoring, etc."
            },
            { 
              question: "Tell me about a time when you had to convince stakeholders to change direction on a product.",
              type: "behavioral",
              rationale: "Tests stakeholder management and communication",
              expectedAnswer: "Should demonstrate data-backed persuasion and effective communication"
            }
          ],
          isPublic: false,
          questionsNeeded: 5,
          customRequirements: "Focus on product strategy and stakeholder management"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // Get interview details
  const getInterviewDetails = async (id) => {
    try {
      // In a production app, you'd make an API call here if needed
      // For now, just find the interview in our state
      const interview = customInterviews.find(i => i._id === id);
      setSelectedInterview(interview);
    } catch (error) {
      console.error("Error getting interview details:", error);
      toast.error("Failed to load interview details");
    }
  };
  
  // Start a custom interview
  const startInterview = (id) => {
    // In a real app, you would navigate to the interview simulator with this ID
    navigate(`/custom-interview/${id}`);
  };
  
  // Open interview details modal
  const openInterviewDetails = (id) => {
    getInterviewDetails(id);
  };
  
  // Close interview details modal
  const closeInterviewDetails = () => {
    setSelectedInterview(null);
  };
  
  // Delete interview
  const deleteInterview = async (id) => {
    try {
      // In a production app, you'd make an API call here
      // For now, just filter out the interview
      setCustomInterviews(customInterviews.filter(i => i._id !== id));
      toast.success("Interview deleted successfully");
      
      // Close the modal if the deleted interview is currently selected
      if (selectedInterview && selectedInterview._id === id) {
        setSelectedInterview(null);
      }
      
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Failed to delete interview");
    }
  };
  
  // Clone interview
  const cloneInterview = async (interview) => {
    try {
      // Create a new interview based on the existing one
      const clonedInterview = {
        ...interview,
        _id: `clone-${Date.now()}`, // In a real app, the server would generate an ID
        title: `${interview.title} (Clone)`,
        createdAt: new Date().toISOString(),
        isPublic: false
      };
      
      setCustomInterviews([clonedInterview, ...customInterviews]);
      toast.success("Interview cloned successfully");
      
      // Select the cloned interview
      setSelectedInterview(clonedInterview);
    } catch (error) {
      console.error("Error cloning interview:", error);
      toast.error("Failed to clone interview");
    }
  };
  
  // Toggle public/private status
  const togglePublicStatus = async (interview) => {
    try {
      // In a production app, you'd make an API call here
      const updatedInterview = { ...interview, isPublic: !interview.isPublic };
      
      setCustomInterviews(customInterviews.map(i => 
        i._id === interview._id ? updatedInterview : i
      ));
      
      // Update selected interview if it's the one being modified
      if (selectedInterview && selectedInterview._id === interview._id) {
        setSelectedInterview(updatedInterview);
      }
      
      toast.success(`Interview is now ${updatedInterview.isPublic ? 'public' : 'private'}`);
    } catch (error) {
      console.error("Error updating interview visibility:", error);
      toast.error("Failed to update interview visibility");
    }
  };
  
  // Filter interviews based on filters and search query
  const getFilteredInterviews = () => {
    return customInterviews.filter(interview => {
      // Type filter
      const typeMatch = filters.interviewType === 'all' || 
                        interview.interviewType === filters.interviewType;
      
      // Seniority filter
      const seniorityMatch = filters.seniority === 'all' || 
                            interview.seniority === filters.seniority;
      
      // Role filter (case insensitive partial match)
      const roleMatch = !filters.role || 
                        interview.role.toLowerCase().includes(filters.role.toLowerCase());
      
      // Search query (match title, role, or technologies)
      const searchLower = searchQuery.toLowerCase();
      const searchMatch = !searchQuery || 
                        interview.title.toLowerCase().includes(searchLower) ||
                        interview.role.toLowerCase().includes(searchLower) ||
                        (interview.specificTechnologies && 
                         interview.specificTechnologies.some(tech => 
                           tech.toLowerCase().includes(searchLower)
                         ));
      
      return typeMatch && seniorityMatch && roleMatch && searchMatch;
    });
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const filteredInterviews = getFilteredInterviews();

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0h10a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h1 className="text-xl font-medium text-white">
            Your Custom Interviews
            <span className="cyber-blink">_</span>
          </h1>
        </div>
        <p className="mt-2 text-gray-400 max-w-3xl">
          Manage your custom-designed interview templates. Create, edit, or use these interviews for your preparation.
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
              Please log in to view and manage your custom interviews.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <Link to="/login" className="cyber-button-primary">
                <span>Log In</span>
                <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </Link>
              <Link to="/custom-interview" className="cyber-button-secondary">
                <span>Create New Interview</span>
                <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="cyber-content-panel p-6 relative z-10">
          {/* Filters and Actions Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center flex-1">
              {/* Search */}
              <div className="cyber-search-container flex-grow md:max-w-md">
                <input
                  type="text"
                  className="cyber-search-input"
                  placeholder="Search interviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="cyber-search-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <select
                  name="interviewType"
                  value={filters.interviewType}
                  onChange={handleFilterChange}
                  className="cyber-select"
                >
                  <option value="all">All Types</option>
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="mixed">Mixed</option>
                </select>
                
                <select
                  name="seniority"
                  value={filters.seniority}
                  onChange={handleFilterChange}
                  className="cyber-select"
                >
                  <option value="all">All Levels</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid-Level</option>
                  <option value="senior">Senior</option>
                </select>
                
                <input
                  type="text"
                  name="role"
                  value={filters.role}
                  onChange={handleFilterChange}
                  placeholder="Filter by role..."
                  className="cyber-input"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="cyber-view-toggle">
                <button 
                  className={`cyber-view-option ${viewMode === 'grid' ? 'cyber-view-active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button 
                  className={`cyber-view-option ${viewMode === 'list' ? 'cyber-view-active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
              
              {/* Create New Button */}
              <Link to="/custom-interview" className="cyber-button-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create New</span>
              </Link>
            </div>
          </div>
          
          {/* Interviews Display */}
          {loading ? (
            <div className="cyber-loading-container py-8">
              <div className="cyber-loading-spinner">
                <div className="cyber-spinner-ring"></div>
                <div className="cyber-spinner-ring"></div>
                <div className="cyber-spinner-ring"></div>
              </div>
              <p className="cyber-loading-text mt-4">Loading your custom interviews...</p>
            </div>
          ) : filteredInterviews.length > 0 ? (
            viewMode === 'grid' ? (
              // Grid View
              <div className="cyber-interviews-grid">
                {filteredInterviews.map(interview => (
                  <div key={interview._id} className="cyber-interview-card">
                    <div className="cyber-interview-header">
                      <div className="flex items-center">
                        <span className={`cyber-interview-type ${interview.interviewType}`}>
                          {interview.interviewType.charAt(0).toUpperCase() + interview.interviewType.slice(1)}
                        </span>
                        {interview.isPublic && (
                          <span className="cyber-interview-badge">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Public</span>
                          </span>
                        )}
                      </div>
                      <div className="cyber-interview-actions">
                        <button 
                          className="cyber-action-button"
                          onClick={() => openInterviewDetails(interview._id)}
                          title="View Details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          className="cyber-action-button"
                          onClick={() => cloneInterview(interview)}
                          title="Clone Interview"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="cyber-interview-content">
                      <h3 className="cyber-interview-title" onClick={() => openInterviewDetails(interview._id)}>
                        {interview.title}
                      </h3>
                      
                      <div className="cyber-interview-meta">
                        <div className="cyber-interview-meta-item">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{interview.role}</span>
                        </div>
                        <div className="cyber-interview-meta-item">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                          <span>{interview.questions.length} Questions</span>
                        </div>
                        <div className="cyber-interview-meta-item">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(interview.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="cyber-interview-tags">
                        <span className={`cyber-seniority-tag ${interview.seniority}`}>
                          {interview.seniority}
                        </span>
                        
                        {interview.specificTechnologies && interview.specificTechnologies.map((tech, index) => (
                          <span key={index} className="cyber-tech-tag">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="cyber-interview-footer">
                      <button 
                        className="cyber-button-secondary-sm"
                        onClick={() => togglePublicStatus(interview)}
                      >
                        {interview.isPublic ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                            <span>Make Private</span>
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Make Public</span>
                          </>
                        )}
                      </button>
                      <button 
                        className="cyber-button-primary-sm"
                        onClick={() => startInterview(interview._id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Start Interview</span>
                      </button>
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
              // List View
              <div className="cyber-interviews-list">
                <table className="cyber-table">
                  <thead>
                    <tr>
                      <th className="cyber-th">Title</th>
                      <th className="cyber-th">Role</th>
                      <th className="cyber-th">Type</th>
                      <th className="cyber-th">Level</th>
                      <th className="cyber-th">Questions</th>
                      <th className="cyber-th">Created</th>
                      <th className="cyber-th">Status</th>
                      <th className="cyber-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInterviews.map(interview => (
                      <tr key={interview._id} className="cyber-tr">
                        <td className="cyber-td cyber-td-title" onClick={() => openInterviewDetails(interview._id)}>
                          {interview.title}
                        </td>
                        <td className="cyber-td">{interview.role}</td>
                        <td className="cyber-td">
                          <span className={`cyber-badge ${interview.interviewType}`}>
                            {interview.interviewType}
                          </span>
                        </td>
                        <td className="cyber-td">
                          <span className={`cyber-badge ${interview.seniority}`}>
                            {interview.seniority}
                          </span>
                        </td>
                        <td className="cyber-td">{interview.questions.length}</td>
                        <td className="cyber-td">{formatDate(interview.createdAt)}</td>
                        <td className="cyber-td">
                          <span className={`cyber-badge ${interview.isPublic ? 'public' : 'private'}`}>
                            {interview.isPublic ? 'Public' : 'Private'}
                          </span>
                        </td>
                        <td className="cyber-td cyber-td-actions">
                          <button 
                            className="cyber-table-action-button"
                            onClick={() => openInterviewDetails(interview._id)}
                            title="View Details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button 
                            className="cyber-table-action-button"
                            onClick={() => cloneInterview(interview)}
                            title="Clone"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button 
                            className="cyber-table-action-button cyber-action-primary"
                            onClick={() => startInterview(interview._id)}
                            title="Start Interview"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="cyber-empty-state py-12">
              <div className="cyber-empty-icon mb-4">
                <svg className="h-16 w-16 text-gray-700 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0h10a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="cyber-empty-title">No Custom Interviews Found</h3>
              <p className="cyber-empty-message">
                {customInterviews.length === 0 
                  ? "You haven't created any custom interviews yet. Create your first one to get started."
                  : "No interviews match your current filters."}
              </p>
              {customInterviews.length > 0 ? (
                <button 
                  className="cyber-button-secondary mt-6"
                  onClick={() => {
                    setFilters({
                      interviewType: 'all',
                      role: '',
                      seniority: 'all'
                    });
                    setSearchQuery('');
                  }}
                >
                  <span>Clear Filters</span>
                </button>
              ) : (
                <Link to="/custom-interview" className="cyber-button-primary mt-6">
                  <span>Create Your First Interview</span>
                  <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </Link>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Interview Details Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm" onClick={closeInterviewDetails}></div>
          
          <div className="cyber-modal">
            <div className="cyber-modal-header">
              <div className="flex items-center">
                <span className={`cyber-interview-type ${selectedInterview.interviewType}`}>
                  {selectedInterview.interviewType.charAt(0).toUpperCase() + selectedInterview.interviewType.slice(1)}
                </span>
                {selectedInterview.isPublic && (
                  <span className="cyber-interview-badge ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Public</span>
                  </span>
                )}
              </div>
              <button className="cyber-modal-close" onClick={closeInterviewDetails}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="cyber-modal-content">
              <h3 className="cyber-modal-title">{selectedInterview.title}</h3>
              
              <div className="cyber-modal-meta-grid">
                <div className="cyber-modal-meta-item">
                  <div className="cyber-modal-meta-label">Role</div>
                  <div className="cyber-modal-meta-value">{selectedInterview.role}</div>
                </div>
                
                <div className="cyber-modal-meta-item">
                  <div className="cyber-modal-meta-label">Seniority</div>
                  <div className="cyber-modal-meta-value capitalize">{selectedInterview.seniority}</div>
                </div>
                
                <div className="cyber-modal-meta-item">
                  <div className="cyber-modal-meta-label">Questions</div>
                  <div className="cyber-modal-meta-value">{selectedInterview.questions.length}</div>
                </div>
                
                <div className="cyber-modal-meta-item">
                  <div className="cyber-modal-meta-label">Created</div>
                  <div className="cyber-modal-meta-value">{formatDate(selectedInterview.createdAt)}</div>
                </div>
              </div>
              
              {selectedInterview.specificTechnologies && selectedInterview.specificTechnologies.length > 0 && (
                <div className="cyber-modal-section">
                  <h4 className="cyber-modal-subtitle">Technologies</h4>
                  <div className="cyber-tech-tags">
                    {selectedInterview.specificTechnologies.map((tech, index) => (
                      <span key={index} className="cyber-tech-tag-lg">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedInterview.companyValues && selectedInterview.companyValues.length > 0 && (
                <div className="cyber-modal-section">
                  <h4 className="cyber-modal-subtitle">Company Values</h4>
                  <div className="cyber-value-tags">
                    {selectedInterview.companyValues.map((value, index) => (
                      <span key={index} className="cyber-value-tag">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedInterview.customRequirements && (
                <div className="cyber-modal-section">
                  <h4 className="cyber-modal-subtitle">Custom Requirements</h4>
                  <p className="cyber-modal-text">{selectedInterview.customRequirements}</p>
                </div>
              )}
              
              <div className="cyber-modal-section">
                <h4 className="cyber-modal-subtitle">Questions</h4>
                
                <div className="cyber-questions-list">
                  {selectedInterview.questions.map((question, index) => (
                    <div key={index} className="cyber-question-item">
                      <div className={`cyber-question-number ${question.type}`}>{index + 1}</div>
                      <div className="cyber-question-content">
                        <div className="cyber-question-header">
                          <span className={`cyber-tag-sm ${question.type}`}>
                            {question.type}
                          </span>
                        </div>
                        <p className="cyber-question-text">{question.question}</p>
                        
                        <div className="cyber-question-details">
                          {question.rationale && (
                            <div className="cyber-question-detail">
                              <div className="cyber-question-detail-label">Rationale:</div>
                              <div className="cyber-question-detail-value">{question.rationale}</div>
                            </div>
                          )}
                          
                          {question.expectedAnswer && (
                            <div className="cyber-question-detail">
                              <div className="cyber-question-detail-label">Expected Answer:</div>
                              <div className="cyber-question-detail-value">{question.expectedAnswer}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="cyber-modal-footer">
              {confirmDeleteId === selectedInterview._id ? (
                <div className="flex items-center justify-between w-full">
                  <div className="text-sm text-red-400">Are you sure you want to delete this interview?</div>
                  <div className="flex space-x-4">
                    <button 
                      className="cyber-button-secondary-sm"
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="cyber-button-danger-sm"
                      onClick={() => deleteInterview(selectedInterview._id)}
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between w-full">
                  <div className="flex space-x-4">
                    <button 
                      className="cyber-button-secondary-sm"
                      onClick={() => togglePublicStatus(selectedInterview)}
                    >
                      {selectedInterview.isPublic ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                          <span>Make Private</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Make Public</span>
                        </>
                      )}
                    </button>
                    <button 
                      className="cyber-button-secondary-sm"
                      onClick={() => cloneInterview(selectedInterview)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Clone</span>
                    </button>
                    <button 
                      className="cyber-button-danger-sm"
                      onClick={() => setConfirmDeleteId(selectedInterview._id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                  
                  <button 
                    className="cyber-button-primary-sm"
                    onClick={() => startInterview(selectedInterview._id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Start Interview</span>
                  </button>
                </div>
              )}
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
        
        /* Search and Filters */
        .cyber-search-container {
          position: relative;
        }
        
        .cyber-search-input {
          width: 100%;
          padding: 0.625rem 1rem 0.625rem 2.5rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          color: rgba(226, 232, 240, 0.9);
          font-size: 0.875rem;
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
          top: 50%;
          transform: translateY(-50%);
          color: rgba(6, 182, 212, 0.7);
          pointer-events: none;
        }
        
        .cyber-select,
        .cyber-input {
          padding: 0.5rem 0.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          color: rgba(226, 232, 240, 0.9);
          font-size: 0.875rem;
          transition: all 0.3s;
        }
        
        .cyber-select {
          padding-right: 2.5rem;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2306b6d4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1rem;
        }
        
        .cyber-select:focus,
        .cyber-input:focus {
          background-color: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.5);
          outline: none;
          box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2);
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
          min-width: 2.5rem;
        }
        
        .cyber-view-option:hover {
          background: rgba(15, 23, 42, 0.8);
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-view-active {
          background: rgba(6, 182, 212, 0.2);
          color: rgb(6, 182, 212);
        }
        
        /* Interviews Grid */
        .cyber-interviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        /* Interview Card */
        .cyber-interview-card {
          position: relative;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          padding: 1.25rem;
          transition: all 0.3s;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .cyber-interview-card:hover {
          border-color: rgba(6, 182, 212, 0.4);
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.15);
          transform: translateY(-4px);
        }
        
        .cyber-interview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .cyber-interview-type {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.5rem;
          font-size: 0.6875rem;
          font-weight: 500;
          border-radius: 0.25rem;
          text-transform: capitalize;
        }
        
        .cyber-interview-type.technical {
          background: rgba(6, 182, 212, 0.2);
          color: rgb(6, 182, 212);
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        
        .cyber-interview-type.behavioral {
          background: rgba(16, 185, 129, 0.2);
          color: rgb(16, 185, 129);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .cyber-interview-type.mixed {
          background: rgba(124, 58, 237, 0.2);
          color: rgb(124, 58, 237);
          border: 1px solid rgba(124, 58, 237, 0.3);
        }
        
        .cyber-interview-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.5rem;
          font-size: 0.6875rem;
          border-radius: 0.25rem;
          background: rgba(79, 70, 229, 0.2);
          color: rgb(79, 70, 229);
          border: 1px solid rgba(79, 70, 229, 0.3);
          margin-left: 0.5rem;
        }
        
        .cyber-interview-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .cyber-action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 0.25rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.2);
          color: rgba(226, 232, 240, 0.7);
          transition: all 0.3s;
        }
        
        .cyber-action-button:hover {
          background: rgba(15, 23, 42, 1);
          border-color: rgba(6, 182, 212, 0.4);
          color: rgb(6, 182, 212);
        }
        
        .cyber-interview-content {
          flex: 1;
          margin-bottom: 1.25rem;
        }
        
        .cyber-interview-title {
          font-size: 1.125rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.95);
          margin-bottom: 1rem;
          line-height: 1.4;
          cursor: pointer;
        }
        
        .cyber-interview-title:hover {
          color: rgb(6, 182, 212);
        }
        
        .cyber-interview-meta {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .cyber-interview-meta-item {
          display: flex;
          align-items: center;
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.7);
        }
        
        .cyber-interview-meta-item svg {
          margin-right: 0.5rem;
        }
        
        .cyber-interview-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .cyber-seniority-tag {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          border-radius: 0.25rem;
          text-transform: capitalize;
        }
        
        .cyber-seniority-tag.junior {
          background: rgba(16, 185, 129, 0.2);
          color: rgb(16, 185, 129);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .cyber-seniority-tag.mid {
          background: rgba(245, 158, 11, 0.2);
          color: rgb(245, 158, 11);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        
        .cyber-seniority-tag.senior {
          background: rgba(239, 68, 68, 0.2);
          color: rgb(239, 68, 68);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        .cyber-tech-tag {
          display: inline-block;
          padding: 0.125rem 0.375rem;
          font-size: 0.75rem;
          border-radius: 0.25rem;
          background: rgba(15, 23, 42, 0.8);
          color: rgba(226, 232, 240, 0.8);
          border: 1px solid rgba(226, 232, 240, 0.2);
        }
        
        .cyber-interview-footer {
          display: flex;
          justify-content: space-between;
          gap: 0.75rem;
          margin-top: auto;
        }
        
        /* Table View */
        .cyber-interviews-list {
          overflow-x: auto;
        }
        
        .cyber-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        
        .cyber-th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: rgb(6, 182, 212);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: rgba(15, 23, 42, 0.8);
          border-bottom: 1px solid rgba(6, 182, 212, 0.2);
        }
        
        .cyber-th:first-child {
          border-top-left-radius: 0.375rem;
        }
        
        .cyber-th:last-child {
          border-top-right-radius: 0.375rem;
        }
        
        .cyber-td {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.8);
          border-bottom: 1px solid rgba(15, 23, 42, 0.6);
        }
        
        .cyber-tr {
          transition: all 0.3s;
        }
        
        .cyber-tr:hover {
          background: rgba(15, 23, 42, 0.8);
        }
        
        .cyber-tr:last-child .cyber-td {
          border-bottom: none;
        }
        
        .cyber-tr:last-child .cyber-td:first-child {
          border-bottom-left-radius: 0.375rem;
        }
        
        .cyber-tr:last-child .cyber-td:last-child {
          border-bottom-right-radius: 0.375rem;
        }
        
        .cyber-td-title {
          font-weight: 500;
          color: rgba(226, 232, 240, 0.95);
          cursor: pointer;
        }
        
        .cyber-td-title:hover {
          color: rgb(6, 182, 212);
        }
        
        .cyber-td-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }
        
        .cyber-badge {
          display: inline-block;
          padding: 0.125rem 0.375rem;
          font-size: 0.75rem;
          border-radius: 0.25rem;
          text-align: center;
          min-width: 4rem;
        }
        
        .cyber-badge.technical {
          background: rgba(6, 182, 212, 0.2);
          color: rgb(6, 182, 212);
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        
        .cyber-badge.behavioral {
          background: rgba(16, 185, 129, 0.2);
          color: rgb(16, 185, 129);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .cyber-badge.mixed {
          background: rgba(124, 58, 237, 0.2);
          color: rgb(124, 58, 237);
          border: 1px solid rgba(124, 58, 237, 0.3);
        }
        
        .cyber-badge.junior {
          background: rgba(16, 185, 129, 0.2);
          color: rgb(16, 185, 129);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .cyber-badge.mid {
          background: rgba(245, 158, 11, 0.2);
          color: rgb(245, 158, 11);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        
        .cyber-badge.senior {
          background: rgba(239, 68, 68, 0.2);
          color: rgb(239, 68, 68);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        .cyber-badge.public {
          background: rgba(79, 70, 229, 0.2);
          color: rgb(79, 70, 229);
          border: 1px solid rgba(79, 70, 229, 0.3);
        }
        
        .cyber-badge.private {
          background: rgba(15, 23, 42, 0.6);
          color: rgba(226, 232, 240, 0.7);
          border: 1px solid rgba(226, 232, 240, 0.2);
        }
        
        .cyber-table-action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 0.25rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.2);
          color: rgba(226, 232, 240, 0.7);
          transition: all 0.3s;
        }
        
        .cyber-table-action-button:hover {
          border-color: rgba(6, 182, 212, 0.4);
          color: rgb(6, 182, 212);
        }
        
        .cyber-action-primary {
          background: rgba(6, 182, 212, 0.1);
          border-color: rgba(6, 182, 212, 0.3);
          color: rgb(6, 182, 212);
        }
        
        .cyber-action-primary:hover {
          background: rgba(6, 182, 212, 0.2);
        }
        
        /* Modal */
        .cyber-modal {
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          width: 90%;
          max-width: 800px;
          max-height: 85vh;
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
          font-size: 1.5rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.95);
          line-height: 1.4;
          margin-bottom: 1.5rem;
          position: relative;
          padding-bottom: 0.75rem;
        }
        
        .cyber-modal-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 5rem;
          height: 2px;
          background: linear-gradient(90deg, rgb(6, 182, 212), rgba(6, 182, 212, 0));
        }
        
        .cyber-modal-meta-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.5);
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
          font-size: 0.9375rem;
          color: rgba(226, 232, 240, 0.9);
          font-weight: 500;
        }
        
        .cyber-modal-section {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
        }
        
        .cyber-modal-subtitle {
          font-size: 1.125rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 1rem;
        }
        
        .cyber-modal-text {
          font-size: 0.9375rem;
          color: rgba(226, 232, 240, 0.8);
          line-height: 1.6;
        }
        
        .cyber-tech-tags-lg {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .cyber-tech-tag-lg {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
          border-radius: 0.25rem;
          background: rgba(6, 182, 212, 0.1);
          color: rgb(6, 182, 212);
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        
        .cyber-value-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .cyber-value-tag {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
          border-radius: 0.25rem;
          background: rgba(79, 70, 229, 0.1);
          color: rgb(79, 70, 229);
          border: 1px solid rgba(79, 70, 229, 0.3);
        }
        
        .cyber-questions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .cyber-question-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
        }
        
        .cyber-question-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          font-size: 0.875rem;
          font-weight: 600;
          flex-shrink: 0;
        }
        
        .cyber-question-number.technical {
          background: rgba(6, 182, 212, 0.2);
          color: rgb(6, 182, 212);
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        
        .cyber-question-number.behavioral {
          background: rgba(16, 185, 129, 0.2);
          color: rgb(16, 185, 129);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .cyber-question-number.mixed {
          background: rgba(124, 58, 237, 0.2);
          color: rgb(124, 58, 237);
          border: 1px solid rgba(124, 58, 237, 0.3);
        }
        
        .cyber-question-content {
          flex: 1;
        }
        
        .cyber-question-header {
          display: flex;
          margin-bottom: 0.5rem;
        }
        
        .cyber-tag-sm {
          display: inline-block;
          padding: 0.125rem 0.375rem;
          font-size: 0.6875rem;
          font-weight: 500;
          border-radius: 0.25rem;
          text-transform: capitalize;
        }
        
        .cyber-tag-sm.technical {
          background: rgba(6, 182, 212, 0.2);
          color: rgb(6, 182, 212);
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        
        .cyber-tag-sm.behavioral {
          background: rgba(16, 185, 129, 0.2);
          color: rgb(16, 185, 129);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .cyber-tag-sm.mixed {
          background: rgba(124, 58, 237, 0.2);
          color: rgb(124, 58, 237);
          border: 1px solid rgba(124, 58, 237, 0.3);
        }
        
        .cyber-question-text {
          font-size: 0.9375rem;
          color: rgba(226, 232, 240, 0.9);
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }
        
        .cyber-question-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .cyber-question-detail {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .cyber-question-detail-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.7);
        }
        
        .cyber-question-detail-value {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.8);
          line-height: 1.5;
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
        
        .cyber-button-primary-sm {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 0.75rem;
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
          border: none;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 0.375rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .cyber-button-primary-sm:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                    0 2px 4px -1px rgba(0, 0, 0, 0.06),
                    0 0 10px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-button-secondary-sm {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 0.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          color: rgb(6, 182, 212);
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 0.375rem;
          transition: all 0.3s;
        }
        
        .cyber-button-secondary-sm:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.5);
          transform: translateY(-1px);
        }
        
        .cyber-button-danger-sm {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 0.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: rgb(239, 68, 68);
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 0.375rem;
          transition: all 0.3s;
        }
        
        .cyber-button-danger-sm:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(239, 68, 68, 0.5);
          transform: translateY(-1px);
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
        
        /* Loading Animation */
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
        
        /* Empty State */
        .cyber-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2rem 1rem;
        }
        
        .cyber-empty-icon {
          opacity: 0.3;
          margin-bottom: 1.5rem;
        }
        
        .cyber-empty-title {
          font-size: 1.25rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 0.75rem;
        }
        
        .cyber-empty-message {
          font-size: 0.9375rem;
          color: rgba(226, 232, 240, 0.7);
          max-width: 32rem;
          margin: 0 auto 1.5rem;
          line-height: 1.5;
        }`}</style>
    </div>
  );
};

export default CustomInterviewsPage;