import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { getSessionLink, getSessionLinkWithRole, enhanceSessionWithRole, FIXED_MENTOR_ID } from './MentorshipUtils';

// API URL - use environment variable or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Hardcoded mentor ID - This is the ID we'll use to fetch data
const HARDCODED_MENTOR_ID = FIXED_MENTOR_ID;

const MentorDashboard = () => {
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isSettingUp, setIsSettingUp] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  // Load mentor data using hardcoded ID
  useEffect(() => {
    const fetchMentorData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/mentorship/mentors/${HARDCODED_MENTOR_ID}`);
        console.log("Mentor data response:", response.data);
        if (response.data.success) {
          setMentor(response.data.mentor);
        } else {
          toast.error("Failed to fetch mentor details");
        }
      } catch (error) {
        console.error("Error fetching mentor data:", error);
        toast.error("Error loading mentor data");
        
        // Fallback to mock data if API fails
        const mockMentor = {
          _id: HARDCODED_MENTOR_ID,
          name: "Jane Smith",
          fullname: "Jane Smith",
          title: "Senior Software Engineer",
          imageUrl: null,
          skills: ["JavaScript", "React", "Node.js", "MongoDB"],
          rating: 4.9,
          bookings: 25
        };
        setMentor(mockMentor);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentorData();
  }, []);

  // Fetch mentor sessions (real-time) using hardcoded ID
  useEffect(() => {
    if (!mentor) return;
    
    const fetchMentorSessions = async () => {
      try {
        const response = await axios.get(`${API_URL}/mentorship/mentors/${HARDCODED_MENTOR_ID}/sessions`);
        console.log("Sessions data response:", response.data);
        if (response.data.success) {
          setSessions(response.data.sessions);
        } else {
          console.error("Failed to fetch mentor sessions");
        }
      } catch (error) {
        console.error("Error fetching mentor sessions:", error);
        
        // Fallback to mock data if API fails
        const mockSessions = getMockMentorSessions();
        setSessions(mockSessions);
      }
    };
    
    // Initial fetch
    fetchMentorSessions();
    
    // Set up polling interval for real-time updates (every 30 seconds)
    const sessionsInterval = setInterval(fetchMentorSessions, 30000);
    
    return () => clearInterval(sessionsInterval);
  }, [mentor]);

  // Mock function for sessions if API fails
  const getMockMentorSessions = () => {
    const now = new Date();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return [
      {
        _id: 'mock_session_1',
        mentorId: HARDCODED_MENTOR_ID,
        sessionDateTime: new Date(today.setHours(today.getHours() + 2)),
        duration: 60,
        topic: "React Performance Optimization",
        status: 'scheduled',
        menteeInfo: {
          name: "Alice Johnson",
          title: "Frontend Developer",
          imageUrl: null
        },
        preparationComplete: false
      },
      {
        _id: 'mock_session_2',
        mentorId: HARDCODED_MENTOR_ID,
        sessionDateTime: tomorrow,
        duration: 45,
        topic: "Career Advice: Moving to Senior Developer",
        status: 'scheduled',
        menteeInfo: {
          name: "Bob Smith",
          title: "Mid-level Developer",
          imageUrl: null
        },
        preparationComplete: true
      },
      {
        _id: 'mock_session_3',
        mentorId: HARDCODED_MENTOR_ID,
        sessionDateTime: yesterday,
        duration: 30,
        topic: "Code Review Best Practices",
        status: 'completed',
        menteeInfo: {
          name: "Charlie Davis",
          title: "Junior Developer",
          imageUrl: null
        },
        feedback: {
          rating: 5,
          comment: "Extremely helpful session! Provided great insights on code review practices."
        }
      }
    ];
  };

  // Filter sessions based on active tab
  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.sessionDateTime);
    const today = new Date();
    
    if (activeTab === 'upcoming') {
      return sessionDate > today && session.status !== 'cancelled';
    } else if (activeTab === 'past') {
      return sessionDate < today || session.status === 'completed';
    } else if (activeTab === 'cancelled') {
      return session.status === 'cancelled';
    }
    return true;
  });
  
  // Sort sessions by date
  filteredSessions.sort((a, b) => {
    if (activeTab === 'past') {
      return new Date(b.sessionDateTime) - new Date(a.sessionDateTime);
    }
    return new Date(a.sessionDateTime) - new Date(b.sessionDateTime);
  });

  // Check if a session is starting soon (within 30 minutes for mentors)
  const isSessionStartingSoon = (dateTimeString) => {
    const sessionDate = new Date(dateTimeString);
    const now = new Date();
    
    // Check if session is within 30 minutes of start time (mentors get earlier access)
    const timeDiff = (sessionDate.getTime() - now.getTime()) / (1000 * 60); // difference in minutes
    return timeDiff <= 30 && timeDiff > -30;
  };

  // Format session time
  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format session day
  const formatDay = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get date classes based on proximity
  const getDateClasses = (dateTimeString) => {
    const sessionDate = new Date(dateTimeString);
    const now = new Date();
    const timeDiff = (sessionDate.getTime() - now.getTime()) / (1000 * 60); // minutes
    
    if (timeDiff <= 30) {
      return 'cyber-day-imminent';
    } else if (timeDiff <= 24 * 60) { // within 24 hours
      return 'cyber-day-today';
    }
    return 'cyber-day-normal';
  };

  // Handle session preparation toggle
  const togglePreparation = (sessionId) => {
    setSessions(sessions.map(session => 
      session._id === sessionId 
        ? { ...session, preparationComplete: !session.preparationComplete } 
        : session
    ));
    
    // Show toast notification
    const session = sessions.find(s => s._id === sessionId);
    if (session) {
      if (!session.preparationComplete) {
        toast.success('Session preparation marked as complete');
      } else {
        toast.success('Session preparation marked as incomplete');
      }
    }
  };

  // Start a session
  const startSession = (session) => {
    setIsSettingUp({...isSettingUp, [session._id]: true});
    
    // Simulate setup process
    setTimeout(() => {
      setIsSettingUp({...isSettingUp, [session._id]: false});
      
      // Enhanced session with explicit role information
      const enhancedSession = enhanceSessionWithRole(session, 'mentor');
      
      // Navigate to meeting room using the consistent session link with role parameter
      navigate(getSessionLinkWithRole(session._id, 'mentor'), { 
        state: { sessionInfo: enhancedSession }
      });
    }, 1000);
  };

  // Render mentor stats section
  const renderMentorStats = () => {
    if (!mentor) return null;
    
    return (
      <div className="cyber-mentor-stats grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="cyber-stat-card">
          <div className="cyber-stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="cyber-stat-content">
            <div className="cyber-stat-value">{sessions.filter(s => s.status === 'scheduled').length}</div>
            <div className="cyber-stat-label">Upcoming Sessions</div>
          </div>
        </div>
        
        <div className="cyber-stat-card">
          <div className="cyber-stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="cyber-stat-content">
            <div className="cyber-stat-value">{sessions.filter(s => s.status === 'completed').length}</div>
            <div className="cyber-stat-label">Completed Sessions</div>
          </div>
        </div>
        
        <div className="cyber-stat-card">
          <div className="cyber-stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div className="cyber-stat-content">
            <div className="cyber-stat-value">{mentor.rating || "4.9"}</div>
            <div className="cyber-stat-label">Average Rating</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="cyber-grid"></div>
      </div>
      
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full filter blur-[150px] bg-purple-900 opacity-20 animate-pulse-slow"
        style={{transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`}}
      ></div>
      <div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full filter blur-[150px] bg-blue-900 opacity-20 animate-pulse-slow animation-delay-1000"
        style={{transform: `translate(${-mousePosition.x * 30}px, ${-mousePosition.y * 30}px)`}}
      ></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-medium text-white">
                Mentor <span className="text-purple-400">Dashboard</span>
                <span className="cyber-blink">_</span>
              </h1>
              {mentor && (
                <p className="text-gray-400 mt-1">
                  Welcome back, {mentor.fullname || mentor.name}
                </p>
              )}
            </div>
            
            <div className="mt-3 md:mt-0 flex space-x-3">
              <Link to="/mentorship" className="cyber-button secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Mentorship Home</span>
              </Link>
              
              <Link to="/mentorship-sessions" className="cyber-button">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Session Settings</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Loading State */}
        {loading ? (
          <div className="cyber-loading-state py-12">
            <div className="cyber-loading-spinner">
              <div className="cyber-spinner-ring"></div>
              <div className="cyber-spinner-ring"></div>
              <div className="cyber-spinner-ring"></div>
            </div>
            <p className="cyber-loading-text mt-4">Loading mentor dashboard...</p>
          </div>
        ) : (
          <>
            {/* Mentor Stats */}
            {renderMentorStats()}
            
            {/* Mentor Profile Summary */}
            <div className="cyber-profile-panel mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="cyber-profile-avatar">
                  <img 
                    src={mentor?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor?.fullname || mentor?.name || 'Mentor')}&background=7B3FA9&color=fff&size=100`} 
                    alt={mentor?.fullname || mentor?.name} 
                    className="cyber-avatar-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor?.fullname || mentor?.name || 'Mentor')}&background=7B3FA9&color=fff&size=100`;
                    }}
                  />
                  <div className="cyber-avatar-status"></div>
                </div>
                
                <div className="cyber-profile-info flex-grow">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-medium text-white">{mentor?.fullname || mentor?.name}</h2>
                      <p className="text-gray-400">{mentor?.title}</p>
                    </div>
                    
                    <div className="cyber-profile-actions flex gap-3">
                      <button className="cyber-action-pill">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit Profile</span>
                      </button>
                      <button className="cyber-action-pill">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Settings</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="cyber-profile-skills mt-4">
                    {mentor?.skills && mentor.skills.map((skill, index) => (
                      <span key={index} className="cyber-skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sessions Section */}
            <div className="cyber-sessions-panel">
              <div className="cyber-panel-header flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-white">Mentorship Sessions</h2>
                <div className="cyber-tab-buttons">
                  <button 
                    className={`cyber-tab-button ${activeTab === 'upcoming' ? 'cyber-tab-active' : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                  >
                    Upcoming
                  </button>
                  <button 
                    className={`cyber-tab-button ${activeTab === 'past' ? 'cyber-tab-active' : ''}`}
                    onClick={() => setActiveTab('past')}
                  >
                    Past
                  </button>
                </div>
              </div>
              
              {filteredSessions.length === 0 ? (
                <div className="cyber-empty-state py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="cyber-message-title">No {activeTab} sessions found</h3>
                  <p className="cyber-message-text">
                    {activeTab === 'upcoming' 
                      ? "You don't have any upcoming mentorship sessions scheduled." 
                      : "You don't have any past mentorship sessions."}
                  </p>
                </div>
              ) : (
                <div className="cyber-sessions-list space-y-4">
                  {filteredSessions.map(session => (
                    <div key={session._id} className="cyber-mentor-session-card">
                      <div className={`cyber-session-date ${getDateClasses(session.sessionDateTime)}`}>
                        <div className="cyber-date-day">{formatDay(session.sessionDateTime)}</div>
                        <div className="cyber-date-time">{formatTime(session.sessionDateTime)}</div>
                        <div className="cyber-date-duration">{session.duration} mins</div>
                      </div>
                      
                      <div className="cyber-session-mentee-info">
                        <div className="cyber-mentee-avatar">
                          {session.userId?.imageUrl || session.menteeInfo?.imageUrl ? (
                            <img 
                              src={session.userId?.imageUrl || session.menteeInfo?.imageUrl} 
                              alt={session.userId?.name || session.menteeInfo?.name || 'Mentee'} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="cyber-avatar-placeholder">
                              {(session.userId?.name || session.menteeInfo?.name || 'M').charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="cyber-mentee-name">{session.userId?.name || session.menteeInfo?.name || 'Mentee'}</h4>
                          <p className="cyber-mentee-title">{session.userId?.title || session.menteeInfo?.title || 'Student'}</p>
                        </div>
                      </div>
                      
                      <div className="cyber-session-info">
                        <h3 className="cyber-session-topic">{session.topic}</h3>
                        {session.notes && (
                          <p className="cyber-session-notes">{session.notes}</p>
                        )}
                        
                        {session.status === 'completed' && session.feedback && (
                          <div className="cyber-feedback-preview">
                            <div className="cyber-rating">
                              <span className="cyber-star">★</span>
                              <span>{session.feedback.rating}/5</span>
                            </div>
                            <p className="cyber-feedback-text">"{session.feedback.comment}"</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="cyber-session-actions">
                        {activeTab === 'upcoming' && (
                          <>
                            {/* Always show the Host Session button for mentors */}
                            <button 
                              onClick={() => startSession(session)} 
                              className="cyber-host-button"
                              disabled={isSettingUp[session._id]}
                            >
                              {isSettingUp[session._id] ? (
                                <>
                                  <div className="cyber-button-spinner"></div>
                                  <span>Setting up...</span>
                                </>
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  <span>Host Session</span>
                                </>
                              )}
                            </button>
                            
                            <button 
                              onClick={() => togglePreparation(session._id)} 
                              className={`cyber-prep-button ${session.preparationComplete ? 'complete' : ''}`}
                            >
                              {session.preparationComplete ? (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>Preparation Complete</span>
                                </>
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                  </svg>
                                  <span>Mark as Prepared</span>
                                </>
                              )}
                            </button>
                          </>
                        )}
                        
                        {activeTab === 'past' && (
                          <>
                            <button className="cyber-action-button view">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>View Session Notes</span>
                            </button>
                            
                            {session.feedback ? (
                              <button className="cyber-action-button feedback">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                <span>View Feedback</span>
                              </button>
                            ) : (
                              <div className="cyber-no-feedback">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>No feedback received</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      <style jsx>{`
        /* Cyber Grid */
        .cyber-grid {
          position: absolute;
          inset: 0;
          background-image: 
              linear-gradient(to right, rgba(147, 51, 234, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(147, 51, 234, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: grid-move 50s linear infinite;
        }
        
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
        
        /* Buttons */
        .cyber-button {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background: rgba(147, 51, 234, 0.2);
          border: 1px solid rgba(147, 51, 234, 0.4);
          border-radius: 0.375rem;
          color: rgb(216, 180, 254);
          font-size: 0.875rem;
          transition: all 0.3s;
        }
        
        .cyber-button:hover {
          background: rgba(147, 51, 234, 0.3);
          border-color: rgba(147, 51, 234, 0.6);
          transform: translateY(-2px);
          box-shadow: 0 0 15px rgba(147, 51, 234, 0.3);
        }
        
        .cyber-button.secondary {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(147, 51, 234, 0.3);
        }
        
        .cyber-button.secondary:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(147, 51, 234, 0.5);
        }
        
        /* Loading State */
        .cyber-loading-state {
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
          border-top-color: rgb(147, 51, 234);
          animation: spin 1.5s linear infinite;
        }
        
        .cyber-spinner-ring:nth-child(2) {
          border-right-color: rgb(192, 132, 252);
          animation: spin 2s linear infinite;
        }
        
        .cyber-spinner-ring:nth-child(3) {
          border-bottom-color: rgb(216, 180, 254);
          animation: spin 2.5s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .cyber-loading-text {
          font-size: 0.875rem;
          color: rgb(147, 51, 234);
          font-family: 'JetBrains Mono', monospace;
        }
        
        /* Mentor Stats */
        .cyber-stat-card {
          display: flex;
          align-items: center;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(147, 51, 234, 0.2);
          border-radius: 0.5rem;
          padding: 1.25rem;
          gap: 1rem;
        }
        
        .cyber-stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(147, 51, 234, 0.3);
          border-radius: 0.5rem;
          color: rgb(147, 51, 234);
        }
        
        .cyber-stat-content {
          display: flex;
          flex-direction: column;
        }
        
        .cyber-stat-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: white;
        }
        
        .cyber-stat-label {
          font-size: 0.875rem;
          color: rgb(148, 163, 184);
        }
        
        /* Profile Panel */
        .cyber-profile-panel {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(147, 51, 234, 0.2);
          border-radius: 0.5rem;
          padding: 1.5rem;
        }
        
        .cyber-profile-avatar {
          position: relative;
          width: 5rem;
          height: 5rem;
          border-radius: 0.5rem;
          overflow: hidden;
          border: 2px solid rgba(147, 51, 234, 0.3);
        }
        
        .cyber-avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .cyber-avatar-status {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 1rem;
          height: 1rem;
          background: rgb(34, 197, 94);
          border: 2px solid rgba(15, 23, 42, 0.8);
          border-radius: 50%;
        }
        
        .cyber-action-pill {
          display: flex;
          align-items: center;
          padding: 0.375rem 0.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(147, 51, 234, 0.3);
          border-radius: 2rem;
          color: rgb(216, 180, 254);
          font-size: 0.75rem;
          transition: all 0.3s;
        }
        
        .cyber-action-pill:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(147, 51, 234, 0.5);
          transform: translateY(-2px);
        }
        
        .cyber-profile-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        
        .cyber-skill-tag {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: rgba(147, 51, 234, 0.1);
          border: 1px solid rgba(147, 51, 234, 0.3);
          border-radius: 2rem;
          color: rgb(216, 180, 254);
          font-size: 0.75rem;
        }
        
        /* Sessions Panel */
        .cyber-sessions-panel {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(147, 51, 234, 0.2);
          border-radius: 0.5rem;
          padding: 1.5rem;
        }
        
        .cyber-tab-buttons {
          display: flex;
          gap: 0.5rem;
        }
        
        .cyber-tab-button {
          padding: 0.375rem 0.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(147, 51, 234, 0.2);
          border-radius: 0.375rem;
          color: rgb(148, 163, 184);
          font-size: 0.875rem;
          transition: all 0.3s;
        }
        
        .cyber-tab-button:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(147, 51, 234, 0.4);
          color: rgb(226, 232, 240);
        }
        
        .cyber-tab-active {
          background: rgba(147, 51, 234, 0.2);
          border-color: rgba(147, 51, 234, 0.4);
          color: rgb(216, 180, 254);
        }
        
        /* Empty State */
        .cyber-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .cyber-message-title {
          font-size: 1.125rem;
          font-weight: 500;
          color: rgb(226, 232, 240);
          margin-bottom: 0.5rem;
        }
        
        .cyber-message-text {
          font-size: 0.875rem;
          color: rgb(148, 163, 184);
          max-width: 24rem;
        }
        
        /* Mentor Session Card */
        .cyber-mentor-session-card {
          display: grid;
          grid-template-columns: auto auto 1fr auto;
          gap: 1.5rem;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(147, 51, 234, 0.2);
          border-radius: 0.5rem;
          padding: 1.25rem;
          align-items: center;
          transition: all 0.3s;
        }
        
        .cyber-mentor-session-card:hover {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(147, 51, 234, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 0 15px rgba(147, 51, 234, 0.1);
        }
        
        /* Session Date */
        .cyber-session-date {
          width: 100px;
          display: flex;
          flex-direction: column;
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
        }
        
        .cyber-date-day {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        
        .cyber-date-time {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        
        .cyber-date-duration {
          font-size: 0.75rem;
          color: rgb(148, 163, 184);
        }
        
        /* Date variations */
        .cyber-day-normal {
          color: rgb(226, 232, 240);
        }
        
        .cyber-day-today {
          color: rgb(245, 158, 11);
        }
        
        .cyber-day-imminent {
          color: rgb(147, 51, 234);
        }
        
        /* Mentee info */
        .cyber-session-mentee-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .cyber-mentee-avatar {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid rgba(147, 51, 234, 0.3);
        }
        
        .cyber-avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(147, 51, 234, 0.3) 0%, rgba(79, 70, 229, 0.3) 100%);
          color: white;
          font-weight: 600;
          font-size: 1.125rem;
        }
        
        .cyber-mentee-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: rgb(226, 232, 240);
        }
        
        .cyber-mentee-title {
          font-size: 0.75rem;
          color: rgb(148, 163, 184);
        }
        
        /* Session Info */
        .cyber-session-info {
          padding-right: 1rem;
        }
        
        .cyber-session-topic {
          font-size: 1rem;
          font-weight: 600;
          color: rgb(226, 232, 240);
          margin-bottom: 0.375rem;
        }
        
        .cyber-session-notes {
          font-size: 0.875rem;
          color: rgb(148, 163, 184);
          margin-bottom: 0.75rem;
        }
        
        /* Feedback Preview */
        .cyber-feedback-preview {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: rgba(147, 51, 234, 0.1);
          border: 1px solid rgba(147, 51, 234, 0.2);
          border-radius: 0.375rem;
        }
        
        .cyber-rating {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          color: rgb(216, 180, 254);
          margin-bottom: 0.375rem;
        }
        
        .cyber-star {
          color: rgb(250, 204, 21);
        }
        
        .cyber-feedback-text {
          font-size: 0.875rem;
          color: rgb(226, 232, 240);
          font-style: italic;
        }
        
        /* Session Actions */
        .cyber-session-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          min-width: 12rem;
        }
        
        .cyber-host-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(192, 132, 252, 0.3));
          border: 1px solid rgba(147, 51, 234, 0.5);
          border-radius: 0.375rem;
          color: rgb(216, 180, 254);
          font-weight: 500;
          transition: all 0.3s;
          /* Pulse animation */
          animation: host-button-pulse 2s infinite;
          z-index: 10;
        }
        
        @keyframes host-button-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(147, 51, 234, 0); }
        }
        
        .cyber-host-button:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(147, 51, 234, 0.4), rgba(192, 132, 252, 0.4));
          border-color: rgba(147, 51, 234, 0.7);
          transform: translateY(-2px);
          box-shadow: 0 0 15px rgba(147, 51, 234, 0.3);
        }
        
        .cyber-host-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .cyber-join-button {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3));
          border: 1px solid rgba(16, 185, 129, 0.5);
          color: rgb(167, 243, 208);
          animation: join-button-pulse 2s infinite;
        }
        
        @keyframes join-button-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
        }
        
        .cyber-join-button:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.4));
          border-color: rgba(16, 185, 129, 0.7);
        }
        
        .cyber-button-spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(216, 180, 254, 0.3);
          border-top-color: rgb(216, 180, 254);
          border-radius: 50%;
          margin-right: 0.5rem;
          animation: spinner-rotate 1s linear infinite;
        }
        
        @keyframes spinner-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .cyber-time-remaining {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 0.375rem;
          color: rgb(148, 163, 184);
          font-size: 0.875rem;
        }
        
        .cyber-prep-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(147, 51, 234, 0.3);
          border-radius: 0.375rem;
          color: rgb(216, 180, 254);
          font-size: 0.875rem;
          transition: all 0.3s;
        }
        
        .cyber-prep-button:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(147, 51, 234, 0.5);
        }
        
        .cyber-prep-button.complete {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.3);
          color: rgb(74, 222, 128);
        }
        
        .cyber-prep-button.complete:hover {
          background: rgba(34, 197, 94, 0.2);
          border-color: rgba(34, 197, 94, 0.5);
        }
        
        .cyber-action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(147, 51, 234, 0.3);
          border-radius: 0.375rem;
          color: rgb(216, 180, 254);
          font-size: 0.875rem;
          transition: all 0.3s;
        }
        
        .cyber-action-button:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(147, 51, 234, 0.5);
          transform: translateY(-2px);
        }
        
        .cyber-action-button.view {
          background: rgba(6, 182, 212, 0.1);
          border-color: rgba(6, 182, 212, 0.3);
          color: rgb(103, 232, 249);
        }
        
        .cyber-action-button.view:hover {
          background: rgba(6, 182, 212, 0.2);
          border-color: rgba(6, 182, 212, 0.5);
        }
        
        .cyber-action-button.feedback {
          background: rgba(250, 204, 21, 0.1);
          border-color: rgba(250, 204, 21, 0.3);
          color: rgb(250, 204, 21);
        }
        
        .cyber-action-button.feedback:hover {
          background: rgba(250, 204, 21, 0.2);
          border-color: rgba(250, 204, 21, 0.5);
        }
        
        .cyber-no-feedback {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 0.375rem;
          color: rgb(148, 163, 184);
          font-size: 0.875rem;
        }
        
        /* Animations and effects */
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
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .cyber-mentor-session-card {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .cyber-session-date {
            width: 100%;
            flex-direction: row;
            justify-content: space-between;
            padding-bottom: 0.5rem;
            margin-bottom: 0.5rem;
            border-bottom: 1px solid rgba(147, 51, 234, 0.2);
          }
          
          .cyber-session-actions {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default MentorDashboard;