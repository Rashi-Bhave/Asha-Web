import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import InterviewNavigation from './InterviewNavigation';
// import { useAuth } from '../../Contexts/AuthContext'; // Assuming you have an AuthContext

const InterviewPreparation = () => {
  const navigate = useNavigate();
  const currentUser = {
    id: '507f1f77bcf86cd799439011', // Valid ObjectId format
    _id: '507f1f77bcf86cd799439011',
    name: 'Demo User',
    email: 'demo@example.com'
  };
  const [loading, setLoading] = useState(false);
  const [pastSessions, setPastSessions] = useState([]);
  const [userStats, setUserStats] = useState({
    totalInterviews: 0,
    averageTechnicalScore: 0,
    averageCommunicationScore: 0,
    topPerformanceAreas: [],
    improvementAreas: []
  });
  const [featuredResources, setFeaturedResources] = useState([]);
  const [savedInterviews, setSavedInterviews] = useState([]);
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
  
  // Fetch user's past interview sessions
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        return;
      }

      setLoading(true);
      
      try {
        // Fetch interview sessions
        const sessionsResponse = await axios.get(`${API_URL}/interview/sessions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

       
        
        if (sessionsResponse.data && sessionsResponse.data.success) {

          console.log("YESSSS")
          // Process and prepare interview sessions data
          const sessions = sessionsResponse.data.sessions.map(session => ({
            id: session._id,
            date: session.startTime,
            role: session.role,
            type: session.interviewType,
            technicalScore: calculateAverageScore(session.responses, 'technical'),
            communicationScore: calculateAverageScore(session.responses, 'communication'),
            duration: calculateDuration(session.startTime, session.endTime),
            questionCount: session.responses.length,
            status: session.status,
            keyStrengths: session.keyStrengths || [],
            developmentAreas: session.developmentAreas || []
          }));
          console.log("YESSSS1")
          
          setPastSessions(sessions);
          
          // Calculate user stats from sessions
          if (sessions.length > 0) {
            console.log("YESSSS2")
            const totalTechnical = sessions.reduce((sum, session) => sum + session.technicalScore, 0);
            const totalCommunication = sessions.reduce((sum, session) => sum + session.communicationScore, 0);
            
            // Collect all strengths and improvement areas from all sessions
            const allStrengths = sessions.flatMap(session => session.keyStrengths);
            const allImprovements = sessions.flatMap(session => session.developmentAreas);
            
            // Count occurrences of each strength and improvement area
            const strengthCounts = {};
            const improvementCounts = {};
            
            allStrengths.forEach(strength => {
              strengthCounts[strength] = (strengthCounts[strength] || 0) + 1;
            });
            
            allImprovements.forEach(area => {
              improvementCounts[area] = (improvementCounts[area] || 0) + 1;
            });
            
            // Sort by frequency and get top 3
            const topStrengths = Object.entries(strengthCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(entry => entry[0]);
              
            const topImprovements = Object.entries(improvementCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(entry => entry[0]);
            
            setUserStats({
              totalInterviews: sessions.length,
              averageTechnicalScore: Math.round(totalTechnical / sessions.length),
              averageCommunicationScore: Math.round(totalCommunication / sessions.length),
              topPerformanceAreas: topStrengths.length > 0 ? 
                topStrengths : ['System Design', 'Problem Solving', 'Technical Knowledge'],
              improvementAreas: topImprovements.length > 0 ? 
                topImprovements : ['Communication Clarity', 'Behavioral Examples']
            });
            console.log("YESSSS3")
          }
        }
        
        // Fetch custom interviews
        const customInterviewsResponse = await axios.get(`${API_URL}/interview/custom-interviews`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        console.log("YESSSS4")
        console.log(customInterviewsResponse)
        
        if (customInterviewsResponse.data && customInterviewsResponse.data.success) {
          setSavedInterviews(customInterviewsResponse.data.customInterviews);
        }

        console.log("YESSSS5")
        
        // Fetch featured resources
        fetchFeaturedResources();

        console.log("YESSSS6")
        
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load your interview data");
      } finally {
        setLoading(false);
      }
    };
    
    const fetchFeaturedResources = async () => {
      // In a real implementation, these would come from an API
      // For now, we'll use static resources
      const sampleResources = [
        {
          id: 'res-001',
          title: 'Top 10 System Design Interview Questions',
          category: 'Technical',
          type: 'Article',
          difficulty: 'Advanced',
          estimatedTime: '15 min',
          url: '/resources/system-design'
        },
        {
          id: 'res-002',
          title: 'Behavioral Interview Preparation Guide',
          category: 'Behavioral',
          type: 'Video',
          difficulty: 'Intermediate',
          estimatedTime: '25 min',
          url: '/resources/behavioral'
        },
        {
          id: 'res-003',
          title: 'Data Structures for Technical Interviews',
          category: 'Technical',
          type: 'Practice Set',
          difficulty: 'Intermediate',
          estimatedTime: '45 min',
          url: '/resources/data-structures'
        }
      ];
      
      setFeaturedResources(sampleResources);
    };
    
    fetchUserData();
  }, [API_URL]);
  
  // Helper function to calculate average score
  const calculateAverageScore = (responses, type) => {
    if (!responses || responses.length === 0) return 0;
    
    let total = 0;
    let count = 0;
    
    responses.forEach(response => {
      if (response.scores && response.scores[type]) {
        total += response.scores[type];
        count++;
      }
    });
    
    return count > 0 ? Math.round(total / count) : 0;
  };
  
  // Helper function to calculate duration in minutes
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    
    return Math.round(durationMs / (1000 * 60)); // Convert ms to minutes
  };
  
  // Format date string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Navigate to a custom interview
  const startCustomInterview = (interviewId) => {
    navigate(`/custom-interview/${interviewId}`);
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h1 className="text-xl font-medium text-white">
            Interview Preparation Hub
            <span className="cyber-blink">_</span>
          </h1>
        </div>
        <p className="mt-2 text-gray-400 max-w-3xl">
          Enhance your interview skills with AI-powered simulations, custom interview builders, and performance tracking.
        </p>
      </div>
      
      {!currentUser ? (
        <div className="cyber-content-panel p-6 text-center mb-8">
          <div className="cyber-empty-state py-8">
            <div className="cyber-empty-icon mb-4">
              <svg className="h-16 w-16 text-gray-700 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="cyber-empty-title">Authentication Required</h3>
            <p className="cyber-empty-message">
              Please log in to access your personalized interview preparation hub and track your progress.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <Link to="/login" className="cyber-button-primary">
                <span>Log In</span>
                <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </Link>
              <Link to="/interview-simulator" className="cyber-button-secondary">
                <span>Continue as Guest</span>
                <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          {/* Left Column - Main Interview Features */}
          <div className="lg:col-span-2">
            <div className="cyber-content-panel p-6 mb-8">
              <h2 className="cyber-section-title mb-6">Interview Training Modules</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Standard Interview Simulator */}
                <div className="cyber-feature-card">
                  <div className="cyber-feature-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="cyber-feature-title">Neural Interview Simulator</h3>
                  <p className="cyber-feature-description">
                    Complete AI-powered interview simulation with real-time feedback on technical content, communication, posture, and voice.
                  </p>
                  <div className="cyber-feature-details">
                    <div className="cyber-feature-detail">
                      <span className="cyber-detail-label">Powered by:</span>
                      <span className="cyber-detail-value">Groq LLM API</span>
                    </div>
                    <div className="cyber-feature-detail">
                      <span className="cyber-detail-label">Features:</span>
                      <span className="cyber-detail-value">Video Analysis, Voice Analysis, Real-time Feedback</span>
                    </div>
                  </div>
                  <Link to="/interview-simulator" className="cyber-feature-button">
                    <span>Start Simulator</span>
                    <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                
                {/* Custom Interview Builder */}
                <div className="cyber-feature-card">
                  <div className="cyber-feature-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0h10a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="cyber-feature-title">Custom Interview Builder</h3>
                  <p className="cyber-feature-description">
                    Build personalized interviews with questions tailored to specific technologies, company values, and custom requirements.
                  </p>
                  <div className="cyber-feature-details">
                    <div className="cyber-feature-detail">
                      <span className="cyber-detail-label">Powered by:</span>
                      <span className="cyber-detail-value">Groq LLM API</span>
                    </div>
                    <div className="cyber-feature-detail">
                      <span className="cyber-detail-label">Features:</span>
                      <span className="cyber-detail-value">Custom Questions, Role-Specific Content, Company Value Alignment</span>
                    </div>
                  </div>
                  <Link to="/custom-interview" className="cyber-feature-button">
                    <span>Build Custom Interview</span>
                    <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                
                {/* Host Mock Interview */}
                <div className="cyber-feature-card">
                  <div className="cyber-feature-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="cyber-feature-title">Peer Mock Interviews</h3>
                  <p className="cyber-feature-description">
                    Host or join real-time mock interviews with peers. Practice with other developers and provide feedback to each other.
                  </p>
                  <div className="cyber-feature-details">
                    <div className="cyber-feature-detail">
                      <span className="cyber-detail-label">Powered by:</span>
                      <span className="cyber-detail-value">WebRTC, Socket.io</span>
                    </div>
                    <div className="cyber-feature-detail">
                      <span className="cyber-detail-label">Features:</span>
                      <span className="cyber-detail-value">Real-time Video, Code Sharing, Collaborative Feedback</span>
                    </div>
                  </div>
                  <Link to="/host-interview" className="cyber-feature-button">
                    <span>Host Mock Interview</span>
                    <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                
                {/* Question Bank */}
                <div className="cyber-feature-card">
                  <div className="cyber-feature-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="cyber-feature-title">Interview Question Database</h3>
                  <p className="cyber-feature-description">
                    Browse our extensive database of technical and behavioral interview questions from top tech companies.
                  </p>
                  <div className="cyber-feature-details">
                    <div className="cyber-feature-detail">
                      <span className="cyber-detail-label">Categories:</span>
                      <span className="cyber-detail-value">Technical, Behavioral, System Design</span>
                    </div>
                    <div className="cyber-feature-detail">
                      <span className="cyber-detail-label">Companies:</span>
                      <span className="cyber-detail-value">Google, Amazon, Microsoft, Meta, and more</span>
                    </div>
                  </div>
                  <Link to="/question-bank" className="cyber-feature-button">
                    <span>Explore Questions</span>
                    <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* User's Past Interview Sessions */}
            <div className="cyber-content-panel p-6">
              <h2 className="cyber-section-title mb-6 flex justify-between items-center">
                <span>Your Interview Sessions</span>
                
                {pastSessions.length > 0 && (
                  <Link to="/interview-analytics" className="cyber-button-sm">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </Link>
                )}
              </h2>
              
              {loading ? (
                <div className="cyber-loading-container py-8">
                  <div className="cyber-loading-spinner">
                    <div className="cyber-spinner-ring"></div>
                    <div className="cyber-spinner-ring"></div>
                    <div className="cyber-spinner-ring"></div>
                  </div>
                  <p className="cyber-loading-text mt-4">Loading interview history...</p>
                </div>
              ) : pastSessions.length > 0 ? (
                <div className="space-y-4">
                  {pastSessions.slice(0, 3).map(session => (
                    <div key={session.id} className="cyber-session-card">
                      <div className="cyber-session-header">
                        <div className="flex items-center">
                          <div className={`cyber-session-type-indicator ${
                            session.type === 'technical' ? 'technical' :
                            session.type === 'behavioral' ? 'behavioral' : 'mixed'
                          }`}></div>
                          <span className="cyber-session-role">{session.role}</span>
                        </div>
                        <span className="cyber-session-date">{formatDate(session.date)}</span>
                      </div>
                      
                      <div className="cyber-session-metrics">
                        <div className="cyber-session-metric">
                          <span className="cyber-metric-label">Technical Score</span>
                          <div className="cyber-metric-bar">
                            <div 
                              className={`cyber-metric-fill ${
                                session.technicalScore >= 80 ? 'bg-green-500' : 
                                session.technicalScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${session.technicalScore}%` }}
                            ></div>
                          </div>
                          <span className="cyber-metric-value">{session.technicalScore}%</span>
                        </div>
                        
                        <div className="cyber-session-metric">
                          <span className="cyber-metric-label">Communication</span>
                          <div className="cyber-metric-bar">
                            <div 
                              className={`cyber-metric-fill ${
                                session.communicationScore >= 80 ? 'bg-green-500' : 
                                session.communicationScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${session.communicationScore}%` }}
                            ></div>
                          </div>
                          <span className="cyber-metric-value">{session.communicationScore}%</span>
                        </div>
                      </div>
                      
                      <div className="cyber-session-details">
                        <div className="cyber-session-detail">
                          <span className="cyber-detail-label">Questions</span>
                          <span className="cyber-detail-value">{session.questionCount}</span>
                        </div>
                        
                        <div className="cyber-session-detail">
                          <span className="cyber-detail-label">Duration</span>
                          <span className="cyber-detail-value">{session.duration} min</span>
                        </div>
                        
                        <div className="cyber-session-detail cyber-session-detail-expand">
                          <Link to={`/interview-report/${session.id}`} className="cyber-detail-button">
                            <span>View Details</span>
                            <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                      
                      {/* Corner Decorations */}
                      <div className="cyber-corner cyber-corner-tl"></div>
                      <div className="cyber-corner cyber-corner-tr"></div>
                      <div className="cyber-corner cyber-corner-bl"></div>
                      <div className="cyber-corner cyber-corner-br"></div>
                    </div>
                  ))}
                  
                  {pastSessions.length > 3 && (
                    <div className="mt-4 text-center">
                      <Link to="/interview-analytics" className="cyber-button-secondary w-full">
                        <span>View All {pastSessions.length} Sessions</span>
                        <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="cyber-empty-state py-12">
                  <div className="cyber-empty-icon mb-4">
                    <svg className="h-16 w-16 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="cyber-empty-title">No Interview Sessions Yet</h3>
                  <p className="cyber-empty-message">
                    Start your first interview simulation to track your progress and get personalized feedback.
                  </p>
                  <Link to="/interview-simulator" className="cyber-button-primary mt-6">
                    <span>Start Your First Interview</span>
                    <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Stats and Resources */}
          <div>
            {/* User Stats */}
            {userStats.totalInterviews > 0 && (
              <div className="cyber-content-panel p-6 mb-8">
                <h2 className="cyber-section-title mb-6">Your Performance</h2>
                
                <div className="cyber-stats-summary">
                  <div className="cyber-stat-item">
                    <div className="cyber-stat-value">{userStats.totalInterviews}</div>
                    <div className="cyber-stat-label">Interviews Completed</div>
                  </div>
                  
                  <div className="cyber-stat-item">
                    <div className="cyber-stat-value">{userStats.averageTechnicalScore}%</div>
                    <div className="cyber-stat-label">Avg. Technical Score</div>
                  </div>
                  
                  <div className="cyber-stat-item">
                    <div className="cyber-stat-value">{userStats.averageCommunicationScore}%</div>
                    <div className="cyber-stat-label">Avg. Communication Score</div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 gap-4">
                  <div className="cyber-performance-card">
                    <div className="cyber-performance-header">
                      <svg className="h-5 w-5 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <span>Strength Areas</span>
                    </div>
                    
                    <div className="cyber-performance-content">
                      <ul className="cyber-performance-list">
                        {userStats.topPerformanceAreas.map((area, index) => (
                          <li key={index} className="cyber-performance-item">
                            <div className="cyber-item-bullet cyber-bullet-positive"></div>
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="cyber-performance-card">
                    <div className="cyber-performance-header">
                      <svg className="h-5 w-5 text-yellow-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Areas to Improve</span>
                    </div>
                    
                    <div className="cyber-performance-content">
                      <ul className="cyber-performance-list">
                        {userStats.improvementAreas.map((area, index) => (
                          <li key={index} className="cyber-performance-item">
                            <div className="cyber-item-bullet cyber-bullet-negative"></div>
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <Link to="/interview-analytics" className="cyber-button-secondary w-full">
                    <span>View Detailed Analytics</span>
                    <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
            
            {/* Saved Custom Interviews */}
            {savedInterviews.length > 0 && (
              <div className="cyber-content-panel p-6 mb-8">
                <h2 className="cyber-section-title mb-6">Your Custom Interviews</h2>
                
                <div className="space-y-3">
                  {savedInterviews.slice(0, 3).map(interview => (
                    <div 
                      key={interview._id} 
                      className="cyber-saved-interview"
                      onClick={() => startCustomInterview(interview._id)}
                    >
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white">{interview.title}</h4>
                        <div className="flex text-xs text-gray-400 space-x-3 mt-1">
                          <span>{interview.role}</span>
                          <span>•</span>
                          <span className="capitalize">{interview.interviewType}</span>
                        </div>
                      </div>
                      <svg className="h-5 w-5 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>
                
                {savedInterviews.length > 3 && (
                  <div className="mt-4 text-center">
                    <Link to="/custom-interview" className="cyber-button-secondary w-full">
                      <span>View All Custom Interviews</span>
                      <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {/* Featured Resources */}
            <div className="cyber-content-panel p-6">
              <h2 className="cyber-section-title mb-6">Featured Resources</h2>
              
              <div className="space-y-4">
                {featuredResources.map(resource => (
                  <div key={resource.id} className="cyber-resource-card">
                    <div className="cyber-resource-type">
                      <div className={`cyber-resource-icon ${resource.category.toLowerCase()}`}>
                        {resource.type === 'Article' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        ) : resource.type === 'Video' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    <div className="cyber-resource-content">
                      <h3 className="cyber-resource-title">{resource.title}</h3>
                      
                      <div className="cyber-resource-details">
                        <div className="cyber-resource-tag">
                          {resource.category}
                        </div>
                        <div className="cyber-resource-tag">
                          {resource.difficulty}
                        </div>
                        <div className="cyber-resource-time">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{resource.estimatedTime}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="cyber-resource-action">
                      <Link to={resource.url} className="cyber-resource-button">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Link to="/resources" className="cyber-button-secondary">
                  <span>View All Resources</span>
                  <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="cyber-cta-panel mt-8">
              <div className="cyber-cta-content">
                <h3 className="cyber-cta-title">Ready to host a mock interview?</h3>
                <p className="cyber-cta-description">
                  Practice with other developers in real-time and get valuable feedback from your peers.
                </p>
              </div>
              
              <Link to="/host-interview" className="cyber-cta-button">
                <span>Host Now</span>
                <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
      
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
        
        /* Section Titles */
        .cyber-section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: rgb(6, 182, 212);
          letter-spacing: 0.025em;
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
          margin-bottom: 1.5rem;
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
        
        .cyber-feature-button {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1.25rem;
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          color: rgb(6, 182, 212);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .cyber-feature-button:hover {
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.3) 0%, rgba(79, 70, 229, 0.3) 100%);
          transform: translateY(-2px);
        }
        
        /* Session Cards */
        .cyber-session-card {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          padding: 1rem;
          position: relative;
          transition: all 0.3s;
        }
        
        .cyber-session-card:hover {
          border-color: rgba(6, 182, 212, 0.4);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.1);
        }
        
        .cyber-session-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .cyber-session-type-indicator {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
          margin-right: 0.5rem;
        }
        
        .cyber-session-type-indicator.technical {
          background: rgb(6, 182, 212);
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.5);
        }
        
        .cyber-session-type-indicator.behavioral {
          background: rgb(16, 185, 129);
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
        }
        
        .cyber-session-type-indicator.mixed {
          background: rgb(124, 58, 237);
          box-shadow: 0 0 8px rgba(124, 58, 237, 0.5);
        }
        
        .cyber-session-role {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-session-date {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.6);
          font-family: 'JetBrains Mono', monospace;
        }
        
        .cyber-session-metrics {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .cyber-session-metric {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .cyber-metric-label {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
          width: 5.5rem;
          flex-shrink: 0;
        }
        
        .cyber-metric-bar {
          flex: 1;
          height: 0.375rem;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 0.25rem;
          overflow: hidden;
        }
        
        .cyber-metric-fill {
          height: 100%;
          border-radius: 0.25rem;
          width: 0;
          transition: width 1s ease-in-out;
        }
        
        .cyber-metric-value {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.9);
          width: 2.5rem;
          text-align: right;
          font-family: 'JetBrains Mono', monospace;
        }
        
        .cyber-session-details {
          display: flex;
          gap: 1rem;
          border-top: 1px solid rgba(6, 182, 212, 0.2);
          padding-top: 0.75rem;
        }
        
        .cyber-session-detail {
          display: flex;
          flex-direction: column;
        }
        
        .cyber-detail-label {
          font-size: 0.6875rem;
          color: rgba(226, 232, 240, 0.6);
        }
        
        .cyber-detail-value {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.9);
          font-weight: 500;
        }
        
        .cyber-session-detail-expand {
          margin-left: auto;
          display: flex;
          align-items: center;
        }
        
        .cyber-detail-button {
          display: inline-flex;
          align-items: center;
          font-size: 0.75rem;
          color: rgb(6, 182, 212);
          transition: all 0.3s;
        }
        
        .cyber-detail-button:hover {
          color: rgb(14, 165, 233);
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
        
        /* Stats Summary */
        .cyber-stats-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        
        .cyber-stat-item {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          padding: 1rem;
          text-align: center;
        }
        
        .cyber-stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: rgb(6, 182, 212);
          margin-bottom: 0.25rem;
        }
        
        .cyber-stat-label {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
        }
        
        /* Performance Cards */
        .cyber-performance-card {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          overflow: hidden;
        }
        
        .cyber-performance-header {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          background: rgba(15, 23, 42, 0.8);
          border-bottom: 1px solid rgba(6, 182, 212, 0.2);
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-performance-content {
          padding: 0.75rem 1rem;
        }
        
        .cyber-performance-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .cyber-performance-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0;
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.8);
        }
        
        .cyber-item-bullet {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        .cyber-bullet-positive {
          background: rgb(16, 185, 129);
          box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
        }
        
        .cyber-bullet-negative {
          background: rgb(245, 158, 11);
          box-shadow: 0 0 6px rgba(245, 158, 11, 0.5);
        }
        
        /* Resource Cards */
        .cyber-resource-card {
          display: flex;
          align-items: stretch;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .cyber-resource-card:hover {
          border-color: rgba(6, 182, 212, 0.4);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.1);
          transform: translateY(-2px);
        }
        
        .cyber-resource-type {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          background: rgba(15, 23, 42, 0.8);
          border-right: 1px solid rgba(6, 182, 212, 0.2);
          padding: 0.75rem 0;
        }
        
        .cyber-resource-icon {
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        
        .cyber-resource-icon.technical {
          background: rgba(6, 182, 212, 0.2);
          color: rgb(6, 182, 212);
        }
        
        .cyber-resource-icon.behavioral {
          background: rgba(16, 185, 129, 0.2);
          color: rgb(16, 185, 129);
        }
        
        .cyber-resource-content {
          flex: 1;
          padding: 0.75rem;
        }
        
        .cyber-resource-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 0.5rem;
        }
        
        .cyber-resource-details {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .cyber-resource-tag {
          font-size: 0.6875rem;
          padding: 0.125rem 0.375rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.25rem;
          color: rgba(226, 232, 240, 0.7);
        }
        
        .cyber-resource-time {
          display: flex;
          align-items: center;
          font-size: 0.6875rem;
          color: rgba(226, 232, 240, 0.6);
          margin-left: auto;
        }
        
        .cyber-resource-action {
          display: flex;
          align-items: center;
          padding-right: 0.75rem;
        }
        
        .cyber-resource-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          background: transparent;
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 50%;
          color: rgb(6, 182, 212);
          transition: all 0.3s;
        }
        
        .cyber-resource-button:hover {
          background: rgba(6, 182, 212, 0.1);
          border-color: rgba(6, 182, 212, 0.5);
          transform: scale(1.1);
        }
        
        /* Small Button */
        .cyber-button-sm {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.375rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          color: rgb(6, 182, 212);
          transition: all 0.2s;
        }
        
        .cyber-button-sm:hover {
          background: rgba(15, 23, 42, 1);
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
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
      `}</style>
    </div>
  );
};

export default InterviewPreparation;