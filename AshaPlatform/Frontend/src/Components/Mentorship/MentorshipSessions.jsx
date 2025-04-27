import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useMentorship } from './MentorshipContextProvider';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getSessionLink, getSessionLinkWithRole, enhanceSessionWithRole, FIXED_MENTOR_ID, FIXED_MENTEE_ID } from './MentorshipUtils';

// API URL from environment or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const MentorshipSessions = () => {
  const navigate = useNavigate();
  const { isAuthenticated, formatDateTime } = useMentorship();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancelling, setCancelling] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  
  // Fetch session data with polling for real-time updates
  useEffect(() => {
    const fetchSessions = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log("TRYING TO GET SESSIONS")
        const response = await axios.get(`${API_URL}/mentorship/sessions`);
        console.log("Fetched sessions:", response.data);
        if (response.data.success) {
          setSessions(response.data.sessions);
        } else {
          console.error("Failed to fetch sessions:", response.data.message);
          // Load mock data if API call fails
          loadMockSessionData();
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
        toast.error('Failed to load mentorship sessions');
        // Load mock data on error
        loadMockSessionData();
      } finally {
        setLoading(false);
      }
    };
    
    // Initial fetch
    fetchSessions();
    
    // Set up polling interval (every 30 seconds)
    const interval = setInterval(fetchSessions, 30000);
    setRefreshInterval(interval);
    
    // Clean up interval on component unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      clearInterval(interval);
    };
  }, [ isAuthenticated]);
  
  // Mock session data for fallback
  const loadMockSessionData = () => {
    const now = new Date();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const mockSessions = [
      {
        _id: 'mock_session_1',
        mentorId: {
          _id: FIXED_MENTOR_ID, // Hardcoded mentor ID
          name: "Jane Smith",
          title: "Senior Software Engineer",
          imageUrl: null,
          rating: 4.9
        },
        userId: FIXED_MENTEE_ID,
        sessionDateTime: new Date(today.setHours(today.getHours() + 2)),
        duration: 60,
        topic: "React Performance Optimization",
        status: 'scheduled'
      },
      {
        _id: 'mock_session_2',
        mentorId: {
          _id: FIXED_MENTOR_ID,
          name: "Jane Smith", 
          title: "Senior Software Engineer",
          imageUrl: null,
          rating: 4.9
        },
        userId: FIXED_MENTEE_ID,
        sessionDateTime: tomorrow,
        duration: 45,
        topic: "Career Advice: Moving to Senior Developer",
        status: 'scheduled'
      },
      {
        _id: 'mock_session_3',
        mentorId: {
          _id: FIXED_MENTOR_ID,
          name: "Jane Smith",
          title: "Senior Software Engineer",
          imageUrl: null,
          rating: 4.9
        },
        userId: FIXED_MENTEE_ID,
        sessionDateTime: yesterday,
        duration: 30,
        topic: "Code Review Best Practices",
        status: 'completed'
      }
    ];
    
    setSessions(mockSessions);
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
  
  // Handle session cancellation
  const handleCancelSession = async (sessionId) => {
    try {
      setCancelling(sessionId);
      
      const response = await axios.put(`${API_URL}/mentorship/sessions/${sessionId}`, {
        status: 'cancelled'
      });
      
      if (response.data.success) {
        // Update local state
        setSessions(sessions.map(session => 
          session._id === sessionId ? { ...session, status: 'cancelled' } : session
        ));
        
        toast.success('Session cancelled successfully');
      } else {
        toast.error(response.data.message || 'Failed to cancel session');
      }
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error('Failed to cancel session');
    } finally {
      setCancelling(null);
    }
  };
  
  // Get day classes based on proximity to session
  const getDayClasses = (dateTimeString) => {
    const sessionDate = new Date(dateTimeString);
    const today = new Date();
    const timeDiff = sessionDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff <= 1) {
      return 'cyber-day-today';
    } else if (daysDiff <= 3) {
      return 'cyber-day-soon';
    }
    return 'cyber-day-normal';
  };

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatDay = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Navigate to the meeting with session info
  const handleJoinSession = (session) => {
    // Enhanced session with explicit role information for mentee
    const enhancedSession = enhanceSessionWithRole(session, 'mentee');
    
    // Navigate to the session with role parameter
    navigate(getSessionLinkWithRole(session._id, 'mentee'), { 
      state: { sessionInfo: enhancedSession }
    });
  };

  return (
    <div className="cyber-sessions-container">
      <div className="cyber-sessions-header">
        <h2 className="cyber-sessions-title">Your Mentorship Sessions</h2>
        <Link to="/mentorship" className="cyber-browse-button">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
          <span>Browse Mentors</span>
        </Link>
      </div>
      
      {/* Tab Navigation */}
      <div className="cyber-sessions-tabs">
        <button 
          className={`cyber-tab-button ${activeTab === 'upcoming' ? 'cyber-tab-active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Upcoming</span>
        </button>
        
        <button 
          className={`cyber-tab-button ${activeTab === 'past' ? 'cyber-tab-active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Past</span>
        </button>
        
        <button 
          className={`cyber-tab-button ${activeTab === 'cancelled' ? 'cyber-tab-active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Cancelled</span>
        </button>
      </div>
      
      {/* Sessions Content */}
      <div className="cyber-sessions-content">
        {loading ? (
          <div className="cyber-loading-state">
            <div className="cyber-loading-spinner">
              <div className="cyber-spinner-ring"></div>
              <div className="cyber-spinner-ring"></div>
              <div className="cyber-spinner-ring"></div>
            </div>
            <p className="cyber-loading-text">Loading your sessions...</p>
          </div>
        ) : !isAuthenticated ? (
          <div className="cyber-auth-required">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="cyber-message-title">Authentication Required</h3>
            <p className="cyber-message-text">Please log in to view your mentorship sessions.</p>
            <Link to="/login" className="cyber-login-button">
              Login to Continue
            </Link>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="cyber-empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="cyber-message-title">No {activeTab} sessions found</h3>
            <p className="cyber-message-text">
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming sessions scheduled. Browse mentors to book a session." 
                : activeTab === 'past'
                ? "You don't have any past sessions yet."
                : "You don't have any cancelled sessions."}
            </p>
            {activeTab === 'upcoming' && (
              <Link to="/mentorship" className="cyber-browse-link">
                Browse Mentors
              </Link>
            )}
          </div>
        ) : (
          <div className="cyber-sessions-list">
            {filteredSessions.map(session => (
              <div key={session._id} className="cyber-session-card">
                <div className={`cyber-session-date ${getDayClasses(session.sessionDateTime)}`}>
                  <div className="cyber-date-day">{formatDay(session.sessionDateTime)}</div>
                  <div className="cyber-date-time">{formatTime(session.sessionDateTime)}</div>
                  <div className="cyber-date-duration">{session.duration} mins</div>
                </div>
                
                <div className="cyber-session-details">
                  <div className="cyber-mentor-info">
                    <div className="cyber-mentor-avatar">
                      {session.mentorId?.imageUrl ? (
                        <img 
                          src={session.mentorId.imageUrl} 
                          alt={session.mentorId.name} 
                          className="cyber-avatar-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(session.mentorId.name)}&background=7B3FA9&color=fff&size=100`;
                          }}
                        />
                      ) : (
                        <div className="cyber-avatar-placeholder">
                          {session.mentorId?.name?.charAt(0) || 'M'}
                        </div>
                      )}
                    </div>
                    <div className="cyber-mentor-details">
                      <h4 className="cyber-mentor-name">{session.mentorId?.name || 'Mentor'}</h4>
                      <p className="cyber-mentor-title">{session.mentorId?.title || 'Mentor'}</p>
                    </div>
                  </div>
                  
                  <div className="cyber-session-info">
                    <h3 className="cyber-session-topic">{session.topic}</h3>
                    {session.notes && (
                      <p className="cyber-session-notes">{session.notes}</p>
                    )}
                    
                    {session.status === 'completed' && (
                      <div className="cyber-session-badge completed">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Completed</span>
                      </div>
                    )}
                    
                    {session.status === 'no-show' && (
                      <div className="cyber-session-badge no-show">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>No Show</span>
                      </div>
                    )}
                    
                    {session.status === 'cancelled' && (
                      <div className="cyber-session-badge cancelled">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Cancelled</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="cyber-session-actions">
                    {/* Use isSessionStartable or always enable for testing */}
                    {activeTab === 'upcoming' && session.status !== 'cancelled' && (
                      <button 
                        onClick={() => handleJoinSession(session)} 
                        className="cyber-action-button join"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Join Meeting</span>
                      </button>
                    )}
                    
                    {session.meetingLink && (
                      <a 
                        href={session.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="cyber-action-button join"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>External Link</span>
                      </a>
                    )}
                    
                    {activeTab === 'upcoming' && session.status !== 'cancelled' && (
                      <>
                        <button className="cyber-action-button reschedule">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Reschedule</span>
                        </button>
                        
                        <button 
                          className="cyber-action-button cancel"
                          onClick={() => handleCancelSession(session._id)}
                          disabled={cancelling === session._id}
                        >
                          {cancelling === session._id ? (
                            <>
                              <div className="cyber-button-spinner"></div>
                              <span>Cancelling...</span>
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>Cancel</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                    
                    {activeTab === 'past' && session.status === 'completed' && (
                      <button className="cyber-action-button feedback">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span>Leave Feedback</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style jsx>{`
        /* Sessions Container */
        .cyber-sessions-container {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          overflow: hidden;
          width: 100%;
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 0 0 1px rgba(6, 182, 212, 0.1) inset,
            0 0 20px rgba(6, 182, 212, 0.1);
        }
        
        /* Header */
        .cyber-sessions-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(6, 182, 212, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .cyber-sessions-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
          display: flex;
          align-items: center;
        }
        
        .cyber-browse-button {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          color: rgb(6, 182, 212);
          font-size: 0.875rem;
          transition: all 0.3s;
        }
        
        .cyber-browse-button:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.5);
          transform: translateY(-2px);
        }
        
        /* Tabs */
        .cyber-sessions-tabs {
          display: flex;
          padding: 0 1.5rem;
          border-bottom: 1px solid rgba(6, 182, 212, 0.2);
        }
        
        .cyber-tab-button {
          display: flex;
          align-items: center;
          padding: 0.875rem 1rem;
          background: transparent;
          border: none;
          color: rgba(226, 232, 240, 0.7);
          font-size: 0.875rem;
          font-weight: 500;
          border-bottom: 2px solid transparent;
          transition: all 0.3s;
        }
        
        .cyber-tab-button:hover {
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-tab-active {
          color: rgb(6, 182, 212);
          border-bottom-color: rgb(6, 182, 212);
        }
        
        /* Content */
        .cyber-sessions-content {
          padding: 1.5rem;
          min-height: 300px;
        }
        
        /* Loading State */
        .cyber-loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
        }
        
        .cyber-loading-spinner {
          position: relative;
          width: 3rem;
          height: 3rem;
          margin-bottom: 1rem;
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
        
        /* Auth Required & Empty State */
        .cyber-auth-required,
        .cyber-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          min-height: 300px;
          padding: 2rem;
        }
        
        .cyber-message-title {
          font-size: 1.125rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.8);
          margin-bottom: 0.5rem;
        }
        
        .cyber-message-text {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.6);
          max-width: 24rem;
          margin-bottom: 1.5rem;
        }
        
        .cyber-login-button,
        .cyber-browse-link {
          display: inline-flex;
          align-items: center;
          padding: 0.625rem 1.25rem;
          background: rgba(6, 182, 212, 0.2);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          color: rgb(6, 182, 212);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .cyber-login-button:hover,
        .cyber-browse-link:hover {
          background: rgba(6, 182, 212, 0.3);
          border-color: rgba(6, 182, 212, 0.5);
          transform: translateY(-2px);
        }
        
        /* Sessions List */
        .cyber-sessions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        /* Session Card */
        .cyber-session-card {
          display: flex;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .cyber-session-card:hover {
          border-color: rgba(6, 182, 212, 0.4);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.1);
          transform: translateY(-2px);
        }
        
        /* Session Date */
        .cyber-session-date {
          width: 120px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 1.25rem;
          background: rgba(15, 23, 42, 0.6);
          border-right: 1px solid rgba(6, 182, 212, 0.2);
          font-family: 'JetBrains Mono', monospace;
        }
        
        .cyber-date-day {
          font-size: 0.875rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 0.25rem;
        }
        
        .cyber-date-time {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        
        .cyber-date-duration {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
        }
        
        /* Date color variations */
        .cyber-day-normal {
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-day-soon {
          color: rgb(245, 158, 11);
        }
        
        .cyber-day-today {
          color: rgb(239, 68, 68);
        }
        
        /* Session Details */
        .cyber-session-details {
          flex: 1;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        /* Mentor Info */
        .cyber-mentor-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .cyber-mentor-avatar {
          width: 2.5rem;
          height: 2.5rem;
          flex-shrink: 0;
          border-radius: 0.375rem;
          overflow: hidden;
        }
        
        .cyber-avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .cyber-avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(79, 70, 229, 0.3) 100%);
          color: white;
          font-weight: 600;
          font-size: 1.125rem;
        }
        
        .cyber-mentor-details {
          display: flex;
          flex-direction: column;
        }
        
        .cyber-mentor-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 0.125rem;
        }
        
        .cyber-mentor-title {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
        }
        
        /* Session Info */
        .cyber-session-info {
          flex: 1;
        }
        
        .cyber-session-topic {
          font-size: 1rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 0.5rem;
        }
        
        .cyber-session-notes {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.7);
          margin-bottom: 0.75rem;
        }
        
        /* Status Badges */
        .cyber-session-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          width: fit-content;
        }
        
        .cyber-session-badge.completed {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: rgb(16, 185, 129);
        }
        
        .cyber-session-badge.cancelled {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: rgb(239, 68, 68);
        }
        
        .cyber-session-badge.no-show {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: rgb(245, 158, 11);
        }
        
        /* Session Actions */
        .cyber-session-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
          flex-wrap: wrap;
        }
        
        .cyber-action-button {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .cyber-action-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .cyber-action-button.join {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3));
          border: 1px solid rgba(16, 185, 129, 0.5);
          color: rgb(167, 243, 208);
          animation: join-button-pulse 2s infinite;
        }
        
        @keyframes join-button-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
        }
        
        .cyber-action-button.join:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.4));
          border-color: rgba(16, 185, 129, 0.7);
          transform: translateY(-2px);
        }
        
        .cyber-action-button.reschedule {
          background: rgba(79, 70, 229, 0.1);
          border: 1px solid rgba(79, 70, 229, 0.3);
          color: rgb(79, 70, 229);
        }
        
        .cyber-action-button.reschedule:hover:not(:disabled) {
          background: rgba(79, 70, 229, 0.2);
          border-color: rgba(79, 70, 229, 0.5);
          transform: translateY(-2px);
        }
        
        .cyber-action-button.cancel {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: rgb(239, 68, 68);
        }
        
        .cyber-action-button.cancel:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.5);
          transform: translateY(-2px);
        }
        
        .cyber-action-button.feedback {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: rgb(245, 158, 11);
        }
        
        .cyber-action-button.feedback:hover:not(:disabled) {
          background: rgba(245, 158, 11, 0.2);
          border-color: rgba(245, 158, 11, 0.5);
          transform: translateY(-2px);
        }
        
        /* Button Spinner */
        .cyber-button-spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(239, 68, 68, 0.3);
          border-top-color: rgb(239, 68, 68);
          border-radius: 50%;
          margin-right: 0.5rem;
          animation: spinner-rotate 1s linear infinite;
        }
        
        @keyframes spinner-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .cyber-session-card {
            flex-direction: column;
          }
          
          .cyber-session-date {
            width: 100%;
            padding: 0.75rem;
            flex-direction: row;
            gap: 0.75rem;
            border-right: none;
            border-bottom: 1px solid rgba(6, 182, 212, 0.2);
          }
          
          .cyber-session-actions {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default MentorshipSessions;