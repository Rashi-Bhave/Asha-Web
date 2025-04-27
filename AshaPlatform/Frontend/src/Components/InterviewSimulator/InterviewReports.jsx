import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import InterviewNavigation from './InterviewNavigation';

const InterviewReports = () => {
  const currentUser = {
    id: '507f1f77bcf86cd799439011',
    name: 'Demo User',
    email: 'demo@example.com'
  };
  
  const [interviewSessions, setInterviewSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    interviewType: 'all',
    status: 'all',
    role: '',
    timeframe: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    averageTechnicalScore: 0,
    averageCommunicationScore: 0,
    recentActivity: []
  });
  
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
  
  // Fetch interview sessions on component mount
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    fetchInterviewSessions();
  }, []);
  
  // Calculate stats whenever sessions change
  useEffect(() => {
    if (interviewSessions.length > 0) {
      calculateStats();
    }
  }, [interviewSessions]);
  
  // Fetch interview sessions from API
  const fetchInterviewSessions = async () => {
    setLoading(true);
    
    try {
      const response = await axios.get(`${API_URL}/interview/sessions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        setInterviewSessions(response.data.sessions);
      } else {
        throw new Error("Failed to fetch interview sessions");
      }
    } catch (error) {
      console.error("Error fetching interview sessions:", error);
      toast.error("Failed to load your interview sessions");
      
      // Mock data for demonstration
      setInterviewSessions([
        {
          _id: 'is-001',
          interviewType: 'technical',
          role: 'Frontend Developer',
          seniority: 'mid',
          focus: ['React', 'JavaScript', 'CSS'],
          difficulty: 'medium',
          status: 'completed',
          startTime: new Date('2023-07-15T14:30:00').toISOString(),
          endTime: new Date('2023-07-15T15:45:00').toISOString(),
          responses: [
            { 
              question: "Explain how React's virtual DOM works and its advantages.",
              response: "React's virtual DOM is an in-memory representation of the real DOM. When state changes, React creates a new virtual DOM tree, compares it with the previous one (diffing), and then updates only the necessary parts of the real DOM. This approach is more efficient than directly manipulating the DOM for every change.",
              scores: { technical: 85, communication: 78 }
            },
            { 
              question: "What are closures in JavaScript and how would you use them?",
              response: "Closures are functions that have access to variables from their outer (enclosing) lexical scope, even after the outer function has returned. They're useful for data encapsulation, creating private variables, and maintaining state between function calls.",
              scores: { technical: 92, communication: 84 }
            }
          ],
          overallScore: 84,
          keyStrengths: ['Technical knowledge', 'Problem solving', 'Code organization'],
          developmentAreas: ['Communication clarity', 'Time management']
        },
        {
          _id: 'is-002',
          interviewType: 'behavioral',
          role: 'Product Manager',
          seniority: 'senior',
          focus: ['Leadership', 'Stakeholder Management', 'Product Strategy'],
          difficulty: 'medium',
          status: 'completed',
          startTime: new Date('2023-08-02T10:00:00').toISOString(),
          endTime: new Date('2023-08-02T11:15:00').toISOString(),
          responses: [
            { 
              question: "Tell me about a time when you had to make a difficult decision with incomplete information.",
              response: "At my previous company, we needed to decide whether to delay a product launch to fix some last-minute bugs or release on schedule with known issues...",
              scores: { technical: 75, communication: 90 }
            },
            { 
              question: "How do you prioritize features when building a product roadmap?",
              response: "I use a combination of the RICE framework (Reach, Impact, Confidence, Effort) along with qualitative customer feedback...",
              scores: { technical: 82, communication: 88 }
            }
          ],
          overallScore: 86,
          keyStrengths: ['Communication', 'Decision-making', 'Strategic thinking'],
          developmentAreas: ['Technical details', 'Data analysis']
        },
        {
          _id: 'is-003',
          interviewType: 'mixed',
          role: 'Backend Engineer',
          seniority: 'junior',
          focus: ['Node.js', 'Express', 'MongoDB'],
          difficulty: 'easy',
          status: 'in-progress',
          startTime: new Date('2023-08-10T13:00:00').toISOString(),
          responses: [
            { 
              question: "What are the key differences between relational and NoSQL databases?",
              response: "Relational databases like MySQL use structured schemas with tables and rows, while NoSQL databases like MongoDB are more flexible with document-based storage...",
              scores: { technical: 78, communication: 72 }
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate statistics from interview sessions
  const calculateStats = () => {
    const totalInterviews = interviewSessions.length;
    const completedInterviews = interviewSessions.filter(session => session.status === 'completed').length;
    
    // Calculate average technical and communication scores
    let totalTechnical = 0;
    let totalCommunication = 0;
    let technicalCount = 0;
    let communicationCount = 0;
    
    interviewSessions.forEach(session => {
      if (session.responses) {
        session.responses.forEach(response => {
          if (response.scores) {
            if (response.scores.technical) {
              totalTechnical += response.scores.technical;
              technicalCount++;
            }
            if (response.scores.communication) {
              totalCommunication += response.scores.communication;
              communicationCount++;
            }
          }
        });
      }
    });
    
    const averageTechnical = technicalCount > 0 ? Math.round(totalTechnical / technicalCount) : 0;
    const averageCommunication = communicationCount > 0 ? Math.round(totalCommunication / communicationCount) : 0;
    
    // Get recent activity (last 3 sessions)
    const recentActivity = [...interviewSessions]
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice(0, 3);
    
    setStats({
      totalInterviews,
      completedInterviews,
      averageTechnicalScore: averageTechnical,
      averageCommunicationScore: averageCommunication,
      recentActivity
    });
  };
  
  // Filter interview sessions based on filters and search query
  const getFilteredSessions = () => {
    return interviewSessions.filter(session => {
      // Type filter
      const typeMatch = filters.interviewType === 'all' || 
                      session.interviewType === filters.interviewType;
      
      // Status filter
      const statusMatch = filters.status === 'all' || 
                        session.status === filters.status;
      
      // Role filter (case insensitive partial match)
      const roleMatch = !filters.role || 
                      session.role.toLowerCase().includes(filters.role.toLowerCase());
      
      // Timeframe filter
      let timeframeMatch = true;
      if (filters.timeframe !== 'all') {
        const now = new Date();
        const sessionDate = new Date(session.startTime);
        const daysDiff = Math.floor((now - sessionDate) / (1000 * 60 * 60 * 24));
        
        if (filters.timeframe === 'week' && daysDiff > 7) {
          timeframeMatch = false;
        } else if (filters.timeframe === 'month' && daysDiff > 30) {
          timeframeMatch = false;
        } else if (filters.timeframe === 'quarter' && daysDiff > 90) {
          timeframeMatch = false;
        }
      }
      
      // Search query (match role or focus areas)
      const searchLower = searchQuery.toLowerCase();
      const searchMatch = !searchQuery || 
                        session.role.toLowerCase().includes(searchLower) ||
                        (session.focus && 
                         session.focus.some(area => 
                           area.toLowerCase().includes(searchLower)
                         ));
      
      return typeMatch && statusMatch && roleMatch && timeframeMatch && searchMatch;
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
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format duration
  const formatDuration = (startTimeStr, endTimeStr) => {
    if (!endTimeStr) return 'In progress';
    
    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);
    const durationMs = endTime - startTime;
    const minutes = Math.floor(durationMs / (1000 * 60));
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };
  
  const filteredSessions = getFilteredSessions();

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
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full filter blur-[150px] bg-purple-900 opacity-20 animate-pulse-slow animation-delay-1000"
        style={{transform: `translate(${-mousePosition.x * 30}px, ${-mousePosition.y * 30}px)`}}
      ></div>
      
      {/* Header */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center">
          <svg className="h-8 w-8 text-cyan-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h1 className="text-xl font-medium text-white">
            Interview Reports
            <span className="cyber-blink">_</span>
          </h1>
        </div>
        <p className="mt-2 text-gray-400 max-w-3xl">
          Review your interview performance, track progress, and analyze feedback across all your interview sessions.
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
              Please log in to view your interview reports and analytics.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <Link to="/login" className="cyber-button-primary">
                <span>Log In</span>
                <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </Link>
              <Link to="/interview-simulator" className="cyber-button-secondary">
                <span>Start an Interview</span>
                <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          {/* Sidebar - Statistics */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="cyber-content-panel p-6">
                <h2 className="cyber-section-title mb-4">Overview</h2>
                
                <div className="cyber-stat-card">
                  <div className="cyber-stat-icon technical">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0h10a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="cyber-stat-content">
                    <div className="cyber-stat-label">Total Interviews</div>
                    <div className="cyber-stat-value">{stats.totalInterviews}</div>
                  </div>
                </div>
                
                <div className="cyber-stat-card">
                  <div className="cyber-stat-icon behavioral">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="cyber-stat-content">
                    <div className="cyber-stat-label">Completed</div>
                    <div className="cyber-stat-value">{stats.completedInterviews}</div>
                  </div>
                </div>
                
                <div className="cyber-stat-card">
                  <div className="cyber-stat-icon mixed">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div className="cyber-stat-content">
                    <div className="cyber-stat-label">Technical Score</div>
                    <div className="cyber-stat-value">{stats.averageTechnicalScore}%</div>
                  </div>
                </div>
                
                <div className="cyber-stat-card">
                  <div className="cyber-stat-icon senior">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div className="cyber-stat-content">
                    <div className="cyber-stat-label">Communication Score</div>
                    <div className="cyber-stat-value">{stats.averageCommunicationScore}%</div>
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="cyber-content-panel p-6">
                <h2 className="cyber-section-title mb-4">Recent Activity</h2>
                
                {stats.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentActivity.map(session => (
                      <Link to={`/interview-report/${session._id}`} key={session._id} className="cyber-activity-card">
                        <div className={`cyber-activity-type ${session.interviewType}`}>
                          {session.interviewType === 'technical' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                          ) : session.interviewType === 'behavioral' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        
                        <div className="cyber-activity-content">
                          <div className="cyber-activity-title">{session.role}</div>
                          <div className="cyber-activity-meta">
                            <span>{formatDate(session.startTime)}</span>
                            <span className={`cyber-activity-status ${session.status}`}>
                              {session.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="cyber-activity-score">
                          {session.overallScore ? (
                            <div className={`cyber-score ${
                              session.overallScore >= 80 ? 'high' :
                              session.overallScore >= 60 ? 'medium' : 'low'
                            }`}>
                              {session.overallScore}
                            </div>
                          ) : (
                            <div className="cyber-score-placeholder">--</div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="cyber-empty-activity">
                    <p>No recent activity found.</p>
                  </div>
                )}
                
                <Link to="/interview-simulator" className="cyber-activity-button mt-4">
                  <span>Start New Interview</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="cyber-content-panel p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="cyber-section-title">Interview Sessions</h2>
                
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  {/* Search */}
                  <div className="cyber-search-container w-full md:w-auto">
                    <input
                      type="text"
                      className="cyber-search-input"
                      placeholder="Search sessions..."
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
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="cyber-select"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="abandoned">Abandoned</option>
                  </select>
                  
                  <select
                    name="timeframe"
                    value={filters.timeframe}
                    onChange={handleFilterChange}
                    className="cyber-select"
                  >
                    <option value="all">All Time</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="quarter">Last 3 Months</option>
                  </select>
                </div>
              </div>
              
              {loading ? (
                <div className="cyber-loading-container py-8">
                  <div className="cyber-loading-spinner">
                    <div className="cyber-spinner-ring"></div>
                    <div className="cyber-spinner-ring"></div>
                    <div className="cyber-spinner-ring"></div>
                  </div>
                  <p className="cyber-loading-text mt-4">Loading your interview sessions...</p>
                </div>
              ) : filteredSessions.length > 0 ? (
                <div className="cyber-sessions-table">
                  <table className="cyber-table">
                    <thead>
                      <tr>
                        <th className="cyber-th">Date</th>
                        <th className="cyber-th">Role</th>
                        <th className="cyber-th">Type</th>
                        <th className="cyber-th">Level</th>
                        <th className="cyber-th">Duration</th>
                        <th className="cyber-th">Score</th>
                        <th className="cyber-th">Status</th>
                        <th className="cyber-th"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSessions.map(session => (
                        <tr key={session._id} className="cyber-tr">
                          <td className="cyber-td">{formatDate(session.startTime)}</td>
                          <td className="cyber-td">{session.role}</td>
                          <td className="cyber-td">
                            <span className={`cyber-badge ${session.interviewType}`}>
                              {session.interviewType}
                            </span>
                          </td>
                          <td className="cyber-td capitalize">{session.seniority}</td>
                          <td className="cyber-td">{formatDuration(session.startTime, session.endTime)}</td>
                          <td className="cyber-td">
                            {session.overallScore ? (
                              <span className={`cyber-score-badge ${
                                session.overallScore >= 80 ? 'high' :
                                session.overallScore >= 60 ? 'medium' : 'low'
                              }`}>
                                {session.overallScore}
                              </span>
                            ) : (
                              <span className="cyber-score-badge pending">--</span>
                            )}
                          </td>
                          <td className="cyber-td">
                            <span className={`cyber-status-badge ${session.status}`}>
                              {session.status}
                            </span>
                          </td>
                          <td className="cyber-td cyber-td-actions">
                            <Link 
                              to={`/interview-report/${session._id}`}
                              className="cyber-table-action-button"
                              title="View Report"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="cyber-empty-state py-12">
                  <div className="cyber-empty-icon mb-4">
                    <svg className="h-16 w-16 text-gray-700 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="cyber-empty-title">No Interview Sessions Found</h3>
                  <p className="cyber-empty-message">
                    {interviewSessions.length === 0 
                      ? "You haven't completed any interviews yet. Start your first interview to begin tracking your progress."
                      : "No interviews match your current filters."}
                  </p>
                  {interviewSessions.length > 0 ? (
                    <button 
                      className="cyber-button-secondary mt-6"
                      onClick={() => {
                        setFilters({
                          interviewType: 'all',
                          status: 'all',
                          role: '',
                          timeframe: 'all'
                        });
                        setSearchQuery('');
                      }}
                    >
                      <span>Clear Filters</span>
                    </button>
                  ) : (
                    <Link to="/interview-simulator" className="cyber-button-primary mt-6">
                      <span>Start Your First Interview</span>
                      <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </Link>
                  )}
                </div>
              )}
            </div>
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
        
        /* Section Title */
        .cyber-section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: rgb(6, 182, 212);
          letter-spacing: 0.025em;
        }
        
        /* Statistics Cards */
        .cyber-stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          margin-bottom: 0.75rem;
          transition: all 0.3s;
        }
        
        .cyber-stat-card:hover {
          background: rgba(15, 23, 42, 0.7);
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                    0 2px 4px -1px rgba(0, 0, 0, 0.06),
                    0 0 8px rgba(6, 182, 212, 0.1);
        }
        
        .cyber-stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 0.5rem;
          flex-shrink: 0;
        }
        
        .cyber-stat-icon.technical {
          background: rgba(6, 182, 212, 0.2);
          color: rgb(6, 182, 212);
        }
        
        .cyber-stat-icon.behavioral {
          background: rgba(16, 185, 129, 0.2);
          color: rgb(16, 185, 129);
        }
        
        .cyber-stat-icon.mixed {
          background: rgba(124, 58, 237, 0.2);
          color: rgb(124, 58, 237);
        }
        
        .cyber-stat-icon.senior {
          background: rgba(245, 158, 11, 0.2);
          color: rgb(245, 158, 11);
        }
        
        .cyber-stat-content {
          flex: 1;
        }
        
        .cyber-stat-label {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
          margin-bottom: 0.25rem;
        }
        
        .cyber-stat-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.95);
        }
        
        /* Activity Cards */
        .cyber-activity-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .cyber-activity-card:hover {
          background: rgba(15, 23, 42, 0.7);
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                    0 2px 4px -1px rgba(0, 0, 0, 0.06),
                    0 0 8px rgba(6, 182, 212, 0.1);
        }
        
        .cyber-activity-type {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        .cyber-activity-type.technical {
          background: rgba(6, 182, 212, 0.2);
          color: rgb(6, 182, 212);
        }
        
        .cyber-activity-type.behavioral {
          background: rgba(16, 185, 129, 0.2);
          color: rgb(16, 185, 129);
        }
        
        .cyber-activity-type.mixed {
          background: rgba(124, 58, 237, 0.2);
          color: rgb(124, 58, 237);
        }
        
        .cyber-activity-content {
          flex: 1;
          min-width: 0;
        }
        
        .cyber-activity-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .cyber-activity-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.6875rem;
          color: rgba(226, 232, 240, 0.6);
          margin-top: 0.25rem;
        }
        
        .cyber-activity-status {
          text-transform: capitalize;
        }
        
        .cyber-activity-status.completed {
          color: rgb(16, 185, 129);
        }
        
        .cyber-activity-status.in-progress {
          color: rgb(245, 158, 11);
        }
        
        .cyber-activity-status.abandoned {
          color: rgb(239, 68, 68);
        }
        
        .cyber-activity-score {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          flex-shrink: 0;
        }
        
        .cyber-score {
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .cyber-score.high {
          background: rgba(16, 185, 129, 0.2);
          color: rgb(16, 185, 129);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .cyber-score.medium {
          background: rgba(245, 158, 11, 0.2);
          color: rgb(245, 158, 11);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        
        .cyber-score.low {
          background: rgba(239, 68, 68, 0.2);
          color: rgb(239, 68, 68);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        .cyber-score-placeholder {
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 600;
          background: rgba(15, 23, 42, 0.5);
          color: rgba(226, 232, 240, 0.5);
          border: 1px dashed rgba(226, 232, 240, 0.2);
        }
        
        .cyber-empty-activity {
          padding: 1.5rem 0;
          text-align: center;
          color: rgba(226, 232, 240, 0.6);
          font-size: 0.875rem;
        }
        
        .cyber-activity-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 0.75rem;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          color: rgb(6, 182, 212);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .cyber-activity-button:hover {
          background: rgba(6, 182, 212, 0.2);
          transform: translateY(-2px);
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
        
        .cyber-select {
          padding: 0.5rem 0.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          color: rgba(226, 232, 240, 0.9);
          font-size: 0.875rem;
          transition: all 0.3s;
          padding-right: 2.5rem;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2306b6d4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1rem;
        }
        
        .cyber-select:focus {
          background-color: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.5);
          outline: none;
          box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2);
        }
        
        /* Sessions Table */
        .cyber-sessions-table {
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
        
        .cyber-td-actions {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
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
        
        .cyber-badge {
          display: inline-block;
          padding: 0.125rem 0.375rem;
          font-size: 0.75rem;
          border-radius: 0.25rem;
          text-align: center;
          min-width: 4rem;
          text-transform: capitalize;
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
        
        .cyber-score-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 0.25rem;
          min-width: 2.5rem;
          text-align: center;
        }
        
        .cyber-score-badge.high {
          background: rgba(16, 185, 129, 0.2);
          color: rgb(16, 185, 129);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .cyber-score-badge.medium {
          background: rgba(245, 158, 11, 0.2);
          color: rgb(245, 158, 11);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        
        .cyber-score-badge.low {
          background: rgba(239, 68, 68, 0.2);
          color: rgb(239, 68, 68);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        .cyber-score-badge.pending {
          background: rgba(15, 23, 42, 0.5);
          color: rgba(226, 232, 240, 0.5);
          border: 1px dashed rgba(226, 232, 240, 0.2);
        }
        
        .cyber-status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: 0.25rem;
          min-width: 4.5rem;
          text-align: center;
          text-transform: capitalize;
        }
        
        .cyber-status-badge.completed {
          background: rgba(16, 185, 129, 0.2);
          color: rgb(16, 185, 129);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .cyber-status-badge.in-progress {
          background: rgba(245, 158, 11, 0.2);
          color: rgb(245, 158, 11);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        
        .cyber-status-badge.abandoned {
          background: rgba(239, 68, 68, 0.2);
          color: rgb(239, 68, 68);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        /* Loading */
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
      `}</style>
    </div>
  );
};

export default InterviewReports;