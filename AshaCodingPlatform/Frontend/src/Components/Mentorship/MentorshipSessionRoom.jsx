import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { formatSessionDay, formatSessionTime, formatSessionDuration } from './MentorshipUtils';

const MentorshipSessionRoom = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMentor, setIsMentor] = useState(false);
  const [activeTab, setActiveTab] = useState('video');
  const [isConnecting, setIsConnecting] = useState(true);
  const [notes, setNotes] = useState('');
  const [meetingStartTime, setMeetingStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Handle session data from navigation state or fetch from API
  useEffect(() => {
    const loadSessionData = async () => {
      setLoading(true);
      try {
        let sessionData;
        
        // Check if session data was passed in location state
        if (location.state?.sessionInfo) {
          sessionData = location.state.sessionInfo;
          // Check if this is a mentor (simplified check for demo)
          setIsMentor(sessionData.mentorId?._id === sessionData.mentorId?.userId);
        } else {
          // In a real app, we would fetch the session data
          // const response = await axios.get(`/api/v1/mentorship/sessions/${sessionId}`);
          // sessionData = response.data.session;
          toast.error("No session data found. Redirecting back...");
          setTimeout(() => navigate(-1), 3000);
          return;
        }
        
        setSessionInfo(sessionData);
        
        // Initialize notes if available
        if (sessionData.notes) {
          setNotes(sessionData.notes);
        }
      } catch (error) {
        console.error("Error loading session data:", error);
        toast.error("Failed to load session data");
      } finally {
        setLoading(false);
      }
    };
    
    loadSessionData();
  }, [sessionId, location.state, navigate]);
  
  // Set up meeting connection simulation
  useEffect(() => {
    if (!sessionInfo) return;
    
    // Simulate connection delay
    const connectionTimer = setTimeout(() => {
      setIsConnecting(false);
      setMeetingStartTime(new Date());
      toast.success("Meeting connection established");
    }, 2500);
    
    return () => clearTimeout(connectionTimer);
  }, [sessionInfo]);
  
  // Set up timer to track elapsed meeting time
  useEffect(() => {
    if (!meetingStartTime) return;
    
    const timerInterval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now - meetingStartTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [meetingStartTime]);
  
  // Format elapsed time as MM:SS
  const formatElapsedTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle notes saving
  const saveNotes = async () => {
    try {
      // In a real app, this would send notes to the backend
      // await axios.put(`/api/v1/mentorship/sessions/${sessionId}/notes`, { notes });
      toast.success("Notes saved successfully");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes");
    }
  };
  
  // Handle end session
  const endSession = async () => {
    if (!window.confirm("Are you sure you want to end this session?")) {
      return;
    }
    
    try {
      setLoading(true);
      // In a real app, this would update the session status
      // await axios.put(`/api/v1/mentorship/sessions/${sessionId}/end`, {
      //   notes,
      //   duration: Math.floor(elapsedTime / 60)
      // });
      
      toast.success("Session ended successfully");
      navigate(isMentor ? '/mentor-dashboard' : '/mentorship/sessions');
    } catch (error) {
      console.error("Error ending session:", error);
      toast.error("Failed to end session");
      setLoading(false);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
        <div className="cyber-loading-state">
          <div className="cyber-loading-spinner">
            <div className="cyber-spinner-ring"></div>
            <div className="cyber-spinner-ring"></div>
            <div className="cyber-spinner-ring"></div>
          </div>
          <p className="cyber-loading-text mt-4">Preparing session room...</p>
        </div>
      </div>
    );
  }
  
  // Render error if no session data
  if (!sessionInfo) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
        <div className="cyber-error-state text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-medium text-white mb-2">Session Not Found</h2>
          <p className="text-gray-400 mb-4">Unable to load the session information.</p>
          <Link to={isMentor ? '/mentor-dashboard' : '/mentorship/sessions'} className="cyber-button">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="cyber-session-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link to={isMentor ? '/mentor-dashboard' : '/mentorship/sessions'} className="cyber-back-button mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            
            <div>
              <h1 className="text-lg font-medium text-white flex items-center">
                <span>{isMentor ? 'Mentoring Session' : 'Mentorship Session'}</span>
                <span className="ml-3 h-2.5 w-2.5 rounded-full bg-green-400"></span>
                <span className="ml-2 text-sm text-green-400">Live</span>
                <span className="ml-3 text-sm text-gray-400">{formatElapsedTime(elapsedTime)}</span>
              </h1>
              <p className="text-sm text-gray-400">
                {sessionInfo.topic}
              </p>
            </div>
          </div>
          
          <div className="cyber-session-actions flex items-center space-x-2">
            <button className="cyber-action-button" onClick={() => setActiveTab(activeTab === 'video' ? 'notes' : 'video')}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={
                  activeTab === 'video' 
                    ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    : "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                } />
              </svg>
              <span>{activeTab === 'video' ? 'Notes' : 'Video'}</span>
            </button>
            
            <button className="cyber-end-button" onClick={endSession}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              <span>End Session</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="cyber-session-container">
          {/* Session Info Panel */}
          <div className="cyber-info-panel">
            {/* Session Time Info */}
            <div className="cyber-time-info">
              <div className="cyber-clock-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="cyber-session-day">{formatSessionDay(sessionInfo.sessionDateTime)}</div>
                <div className="cyber-session-time">{formatSessionTime(sessionInfo.sessionDateTime)}</div>
                <div className="cyber-session-duration">{formatSessionDuration(sessionInfo.duration)}</div>
              </div>
            </div>
            
            {/* Participant Info */}
            <div className="cyber-participant-info">
              {isMentor ? (
                <div className="cyber-mentee-card">
                  <div className="cyber-mentee-avatar">
                    <img 
                      src={sessionInfo.menteeInfo?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(sessionInfo.menteeInfo?.name || 'Mentee')}&size=48`} 
                      alt={sessionInfo.menteeInfo?.name} 
                      className="cyber-avatar-image"
                    />
                  </div>
                  <div>
                    <h3 className="cyber-participant-name">{sessionInfo.menteeInfo?.name || 'Mentee'}</h3>
                    <p className="cyber-participant-title">{sessionInfo.menteeInfo?.title || 'Student'}</p>
                  </div>
                </div>
              ) : (
                <div className="cyber-mentor-card">
                  <div className="cyber-mentor-avatar">
                    <img 
                      src={sessionInfo.mentorId?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(sessionInfo.mentorId?.name || 'Mentor')}&size=48`} 
                      alt={sessionInfo.mentorId?.name} 
                      className="cyber-avatar-image"
                    />
                  </div>
                  <div>
                    <h3 className="cyber-participant-name">{sessionInfo.mentorId?.name || 'Mentor'}</h3>
                    <p className="cyber-participant-title">{sessionInfo.mentorId?.title || 'Expert'}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Session Topic */}
            <div className="cyber-topic-info">
              <h3 className="cyber-section-title">Session Topic</h3>
              <p className="cyber-topic-text">{sessionInfo.topic}</p>
            </div>
            
            {/* Session Controls */}
            <div className="cyber-controls">
              <button className="cyber-control-button mic">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span>Mic</span>
              </button>
              
              <button className="cyber-control-button camera">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Camera</span>
              </button>
              
              <button className="cyber-control-button screen">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Share</span>
              </button>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="cyber-content-area">
            {activeTab === 'video' ? (
              <div className="cyber-video-container">
                {isConnecting ? (
                  <div className="cyber-connecting-state">
                    <div className="cyber-loading-spinner">
                      <div className="cyber-spinner-ring"></div>
                      <div className="cyber-spinner-ring"></div>
                      <div className="cyber-spinner-ring"></div>
                    </div>
                    <p className="cyber-connecting-text">Establishing secure video connection...</p>
                  </div>
                ) : (
                  <>
                    <div className="cyber-video-main">
                      <div className="cyber-remote-video">
                        {/* Placeholder for remote video */}
                        <div className="cyber-video-placeholder remote">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2