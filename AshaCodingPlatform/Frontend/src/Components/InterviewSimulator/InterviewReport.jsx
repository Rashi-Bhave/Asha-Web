import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import InterviewNavigation from './InterviewNavigation';
// import { useAuth } from '../../Contexts/AuthContext'; // Assuming you have an auth context

const InterviewReport = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const currentUser = {
    id: '507f1f77bcf86cd799439011', // Valid ObjectId format
    name: 'Demo User',
    email: 'demo@example.com'
  };
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, questions, feedback
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
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
  
  // Fetch interview session data
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        const response = await axios.get(`${API_URL}/interview/sessions/${sessionId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data && response.data.success) {
          setSession(response.data.session);
        } else {
          throw new Error("Failed to fetch interview session");
        }
      } catch (error) {
        console.error("Error fetching interview session:", error);
        toast.error("Failed to load interview report");
        navigate('/interview-analytics'); // Redirect to analytics page on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionData();
  }, [sessionId, navigate, API_URL]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format duration
  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    
    const minutes = Math.floor(durationMs / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    
    return `${minutes} min ${seconds} sec`;
  };
  
  // Calculate average scores for all responses
  const calculateAverageScores = () => {
    if (!session || !session.responses || session.responses.length === 0) {
      return {
        technical: 0,
        communication: 0,
        confidence: 0,
        clarity: 0
      };
    }
    
    let technicalSum = 0;
    let technicalCount = 0;
    let communicationSum = 0;
    let communicationCount = 0;
    let confidenceSum = 0;
    let confidenceCount = 0;
    let claritySum = 0;
    let clarityCount = 0;
    
    session.responses.forEach(response => {
      if (response.scores && response.scores.technical) {
        technicalSum += response.scores.technical;
        technicalCount++;
      }
      
      if (response.scores && response.scores.communication) {
        communicationSum += response.scores.communication;
        communicationCount++;
      }
      
      if (response.nonVerbalMetrics && response.nonVerbalMetrics.confidence) {
        confidenceSum += response.nonVerbalMetrics.confidence;
        confidenceCount++;
      }
      
      if (response.voiceMetrics && response.voiceMetrics.clarity) {
        claritySum += response.voiceMetrics.clarity;
        clarityCount++;
      }
    });
    
    return {
      technical: technicalCount > 0 ? Math.round(technicalSum / technicalCount) : 0,
      communication: communicationCount > 0 ? Math.round(communicationSum / communicationCount) : 0,
      confidence: confidenceCount > 0 ? Math.round(confidenceSum / confidenceCount) : 0,
      clarity: clarityCount > 0 ? Math.round(claritySum / clarityCount) : 0
    };
  };
  
  // Determine score class for color coding
  const getScoreClass = (score) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };
  
  // Render the Overview tab
  const renderOverviewTab = () => {
    if (!session) return null;
    
    const averageScores = calculateAverageScores();
    
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Interview Info */}
          <div className="cyber-info-panel">
            <h3 className="cyber-panel-title">Interview Information</h3>
            <div className="cyber-info-list">
              <div className="cyber-info-item">
                <span className="cyber-info-label">Date:</span>
                <span className="cyber-info-value">{formatDate(session.startTime)}</span>
              </div>
              <div className="cyber-info-item">
                <span className="cyber-info-label">Role:</span>
                <span className="cyber-info-value">{session.role}</span>
              </div>
              <div className="cyber-info-item">
                <span className="cyber-info-label">Type:</span>
                <span className="cyber-info-value">{session.interviewType.charAt(0).toUpperCase() + session.interviewType.slice(1)}</span>
              </div>
              <div className="cyber-info-item">
                <span className="cyber-info-label">Seniority:</span>
                <span className="cyber-info-value">{session.seniority.charAt(0).toUpperCase() + session.seniority.slice(1)}</span>
              </div>
              <div className="cyber-info-item">
                <span className="cyber-info-label">Duration:</span>
                <span className="cyber-info-value">{formatDuration(session.startTime, session.endTime)}</span>
              </div>
              <div className="cyber-info-item">
                <span className="cyber-info-label">Questions:</span>
                <span className="cyber-info-value">{session.responses.length}</span>
              </div>
              <div className="cyber-info-item">
                <span className="cyber-info-label">Status:</span>
                <span className={`cyber-info-value cyber-status-${session.status}`}>{session.status.charAt(0).toUpperCase() + session.status.slice(1)}</span>
              </div>
            </div>
          </div>
          
          {/* Performance Metrics */}
          <div className="cyber-info-panel">
            <h3 className="cyber-panel-title">Performance Metrics</h3>
            <div className="cyber-metrics-grid">
              <div className="cyber-metric-card">
                <div className="cyber-metric-icon cyber-metric-icon-blue">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div className="cyber-metric-value">{averageScores.technical}%</div>
                <div className="cyber-metric-label">Technical</div>
                <div className={`cyber-metric-indicator cyber-metric-${getScoreClass(averageScores.technical)}`}></div>
              </div>
              
              <div className="cyber-metric-card">
                <div className="cyber-metric-icon cyber-metric-icon-purple">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="cyber-metric-value">{averageScores.communication}%</div>
                <div className="cyber-metric-label">Communication</div>
                <div className={`cyber-metric-indicator cyber-metric-${getScoreClass(averageScores.communication)}`}></div>
              </div>
              
              <div className="cyber-metric-card">
                <div className="cyber-metric-icon cyber-metric-icon-green">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="cyber-metric-value">{averageScores.confidence}%</div>
                <div className="cyber-metric-label">Confidence</div>
                <div className={`cyber-metric-indicator cyber-metric-${getScoreClass(averageScores.confidence)}`}></div>
              </div>
              
              <div className="cyber-metric-card">
                <div className="cyber-metric-icon cyber-metric-icon-orange">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div className="cyber-metric-value">{averageScores.clarity}%</div>
                <div className="cyber-metric-label">Voice Clarity</div>
                <div className={`cyber-metric-indicator cyber-metric-${getScoreClass(averageScores.clarity)}`}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Overall Score and Feedback */}
        <div className="cyber-content-panel p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="cyber-section-title">Overall Assessment</h3>
            {session.overallScore && (
              <div className="cyber-overall-score">
                <div className={`cyber-score-value cyber-score-${getScoreClass(session.overallScore)}`}>
                  {session.overallScore}%
                </div>
              </div>
            )}
          </div>
          
          {session.overallFeedback ? (
            <div>
              <div className="cyber-feedback-section mb-6">
                <h4 className="cyber-feedback-title">Overall Feedback</h4>
                <p className="cyber-feedback-text">{session.overallFeedback}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                {session.keyStrengths && session.keyStrengths.length > 0 && (
                  <div className="cyber-strengths-panel">
                    <h4 className="cyber-strengths-title">
                      <svg className="h-5 w-5 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <span>Key Strengths</span>
                    </h4>
                    <ul className="cyber-strengths-list">
                      {session.keyStrengths.map((strength, index) => (
                        <li key={index} className="cyber-strength-item">
                          <div className="cyber-strength-bullet"></div>
                          <div className="cyber-strength-text">{strength}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Areas for Improvement */}
                {session.developmentAreas && session.developmentAreas.length > 0 && (
                  <div className="cyber-improvements-panel">
                    <h4 className="cyber-improvements-title">
                      <svg className="h-5 w-5 text-orange-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Areas for Improvement</span>
                    </h4>
                    <ul className="cyber-improvements-list">
                      {session.developmentAreas.map((area, index) => (
                        <li key={index} className="cyber-improvement-item">
                          <div className="cyber-improvement-bullet"></div>
                          <div className="cyber-improvement-text">{area}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="cyber-feedback-placeholder">
              <p>Overall feedback not available. This could be because the interview was not completed or the feedback is still being processed.</p>
            </div>
          )}
        </div>
        
        {/* Recommended Resources */}
        {session.recommendedResources && session.recommendedResources.length > 0 && (
          <div className="cyber-content-panel p-6 mb-8">
            <h3 className="cyber-section-title mb-4">Recommended Resources</h3>
            
            <div className="space-y-4">
              {session.recommendedResources.map((resource, index) => (
                <div key={index} className="cyber-resource-card">
                  <div className="cyber-resource-type">
                    <div className={`cyber-resource-icon ${resource.type ? resource.type.toLowerCase() : 'default'}`}>
                      {resource.type === 'Book' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      ) : resource.type === 'Course' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      ) : resource.type === 'Practice' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  <div className="cyber-resource-content">
                    <h4 className="cyber-resource-title">{resource.title}</h4>
                    <p className="cyber-resource-description">{resource.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Next Steps */}
        {session.nextSteps && session.nextSteps.length > 0 && (
          <div className="cyber-content-panel p-6">
            <h3 className="cyber-section-title mb-4">Recommended Next Steps</h3>
            
            <ol className="cyber-next-steps-list">
              {session.nextSteps.map((step, index) => (
                <li key={index} className="cyber-next-step-item">
                  <div className="cyber-next-step-number">{index + 1}</div>
                  <div className="cyber-next-step-content">{step}</div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  };
  
  // Render the Questions tab
  const renderQuestionsTab = () => {
    if (!session || !session.responses || session.responses.length === 0) {
      return (
        <div className="cyber-empty-state py-12">
          <div className="cyber-empty-icon mb-4">
            <svg className="h-16 w-16 text-gray-700 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="cyber-empty-title">No Questions Available</h3>
          <p className="cyber-empty-message">
            This interview session does not have any recorded questions or responses.
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Questions List */}
        <div className="md:col-span-1">
          <div className="cyber-questions-panel">
            <h3 className="cyber-questions-title">Questions</h3>
            <div className="cyber-questions-list">
              {session.responses.map((response, index) => (
                <button
                  key={index}
                  className={`cyber-question-button ${activeQuestionIndex === index ? 'cyber-question-active' : ''}`}
                  onClick={() => setActiveQuestionIndex(index)}
                >
                  <div className="cyber-question-number">Q{index + 1}</div>
                  <div className="cyber-question-preview">
                    {response.question.length > 60 
                      ? `${response.question.substring(0, 60)}...` 
                      : response.question}
                  </div>
                  {response.scores && (
                    <div className={`cyber-question-score cyber-score-${getScoreClass(Math.round((response.scores.technical + response.scores.communication) / 2))}`}>
                      {Math.round((response.scores.technical + response.scores.communication) / 2)}%
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Question Details */}
        <div className="md:col-span-2">
          <div className="cyber-question-detail-panel">
            {session.responses[activeQuestionIndex] ? (
              <>
                <div className="cyber-question-detail-header">
                  <h3 className="cyber-question-detail-title">Question {activeQuestionIndex + 1}</h3>
                  <div className="cyber-question-nav">
                    <button 
                      className="cyber-question-nav-button"
                      disabled={activeQuestionIndex === 0}
                      onClick={() => setActiveQuestionIndex(prevIndex => Math.max(0, prevIndex - 1))}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="cyber-question-nav-info">
                      {activeQuestionIndex + 1} of {session.responses.length}
                    </span>
                    <button 
                      className="cyber-question-nav-button"
                      disabled={activeQuestionIndex === session.responses.length - 1}
                      onClick={() => setActiveQuestionIndex(prevIndex => Math.min(session.responses.length - 1, prevIndex + 1))}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="cyber-question-content">
                  <h4 className="cyber-content-subtitle">Question</h4>
                  <p className="cyber-content-text">{session.responses[activeQuestionIndex].question}</p>
                </div>
                
                {session.responses[activeQuestionIndex].response && (
                  <div className="cyber-response-content">
                    <h4 className="cyber-content-subtitle">Your Response</h4>
                    <p className="cyber-content-text">{session.responses[activeQuestionIndex].response}</p>
                  </div>
                )}
                
                {session.responses[activeQuestionIndex].feedback && (
                  <div className="cyber-feedback-content">
                    <h4 className="cyber-content-subtitle">Feedback</h4>
                    <p className="cyber-content-text">{session.responses[activeQuestionIndex].feedback}</p>
                  </div>
                )}
                
                {/* Performance Metrics */}
                {session.responses[activeQuestionIndex].scores && (
                  <div className="cyber-metrics-content">
                    <h4 className="cyber-content-subtitle">Performance Metrics</h4>
                    
                    <div className="cyber-question-metrics-grid">
                      {/* Technical Score */}
                      <div className="cyber-question-metric">
                        <div className="cyber-question-metric-header">
                          <span className="cyber-question-metric-label">Technical</span>
                          <span className="cyber-question-metric-value">
                            {session.responses[activeQuestionIndex].scores.technical}%
                          </span>
                        </div>
                        <div className="cyber-question-metric-bar">
                          <div 
                            className={`cyber-question-metric-fill cyber-metric-${getScoreClass(session.responses[activeQuestionIndex].scores.technical)}`} 
                            style={{ width: `${session.responses[activeQuestionIndex].scores.technical}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Communication Score */}
                      <div className="cyber-question-metric">
                        <div className="cyber-question-metric-header">
                          <span className="cyber-question-metric-label">Communication</span>
                          <span className="cyber-question-metric-value">
                            {session.responses[activeQuestionIndex].scores.communication}%
                          </span>
                        </div>
                        <div className="cyber-question-metric-bar">
                          <div 
                            className={`cyber-question-metric-fill cyber-metric-${getScoreClass(session.responses[activeQuestionIndex].scores.communication)}`} 
                            style={{ width: `${session.responses[activeQuestionIndex].scores.communication}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Keyword Matches */}
                {session.responses[activeQuestionIndex].keywordMatches && session.responses[activeQuestionIndex].keywordMatches.length > 0 && (
                  <div className="cyber-keywords-content">
                    <h4 className="cyber-content-subtitle">Key Concepts Covered</h4>
                    <div className="cyber-keywords-list">
                      {session.responses[activeQuestionIndex].keywordMatches.map((keyword, index) => (
                        <span key={index} className="cyber-keyword-tag">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Non-Verbal Metrics */}
                {session.responses[activeQuestionIndex].nonVerbalMetrics && 
                 Object.values(session.responses[activeQuestionIndex].nonVerbalMetrics).some(value => value > 0) && (
                  <div className="cyber-nonverbal-content">
                    <h4 className="cyber-content-subtitle">Non-Verbal Communication</h4>
                    
                    <div className="cyber-nonverbal-metrics-grid">
                      {/* Only show metrics that have values */}
                      {session.responses[activeQuestionIndex].nonVerbalMetrics.confidence > 0 && (
                        <div className="cyber-nonverbal-metric">
                          <div className="cyber-nonverbal-metric-circle">
                            <svg viewBox="0 0 36 36" className="cyber-circle-chart">
                              <path className="cyber-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                              <path 
                                className={`cyber-circle-fill cyber-metric-${getScoreClass(session.responses[activeQuestionIndex].nonVerbalMetrics.confidence)}`}
                                strokeDasharray={`${session.responses[activeQuestionIndex].nonVerbalMetrics.confidence}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <text x="18" y="20.35" className="cyber-circle-text">
                                {session.responses[activeQuestionIndex].nonVerbalMetrics.confidence}%
                              </text>
                            </svg>
                          </div>
                          <div className="cyber-nonverbal-metric-label">Confidence</div>
                        </div>
                      )}
                      
                      {session.responses[activeQuestionIndex].nonVerbalMetrics.eyeContact > 0 && (
                        <div className="cyber-nonverbal-metric">
                          <div className="cyber-nonverbal-metric-circle">
                            <svg viewBox="0 0 36 36" className="cyber-circle-chart">
                              <path className="cyber-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                              <path 
                                className={`cyber-circle-fill cyber-metric-${getScoreClass(session.responses[activeQuestionIndex].nonVerbalMetrics.eyeContact)}`}
                                strokeDasharray={`${session.responses[activeQuestionIndex].nonVerbalMetrics.eyeContact}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <text x="18" y="20.35" className="cyber-circle-text">
                                {session.responses[activeQuestionIndex].nonVerbalMetrics.eyeContact}%
                              </text>
                            </svg>
                          </div>
                          <div className="cyber-nonverbal-metric-label">Eye Contact</div>
                        </div>
                      )}
                      
                      {session.responses[activeQuestionIndex].nonVerbalMetrics.posture > 0 && (
                        <div className="cyber-nonverbal-metric">
                          <div className="cyber-nonverbal-metric-circle">
                            <svg viewBox="0 0 36 36" className="cyber-circle-chart">
                              <path className="cyber-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                              <path 
                                className={`cyber-circle-fill cyber-metric-${getScoreClass(session.responses[activeQuestionIndex].nonVerbalMetrics.posture)}`}
                                strokeDasharray={`${session.responses[activeQuestionIndex].nonVerbalMetrics.posture}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <text x="18" y="20.35" className="cyber-circle-text">
                                {session.responses[activeQuestionIndex].nonVerbalMetrics.posture}%
                              </text>
                            </svg>
                          </div>
                          <div className="cyber-nonverbal-metric-label">Posture</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Voice Metrics */}
                {session.responses[activeQuestionIndex].voiceMetrics && 
                 Object.values(session.responses[activeQuestionIndex].voiceMetrics).some(value => value > 0 || (typeof value === 'object' && Object.keys(value).length > 0)) && (
                  <div className="cyber-voice-content">
                    <h4 className="cyber-content-subtitle">Voice Metrics</h4>
                    
                    <div className="cyber-voice-metrics-grid">
                      {/* Only show metrics that have values */}
                      {session.responses[activeQuestionIndex].voiceMetrics.clarity > 0 && (
                        <div className="cyber-voice-metric">
                          <div className="cyber-voice-metric-name">Clarity</div>
                          <div className="cyber-voice-metric-bar">
                            <div 
                              className={`cyber-voice-metric-fill cyber-metric-${getScoreClass(session.responses[activeQuestionIndex].voiceMetrics.clarity)}`} 
                              style={{ width: `${session.responses[activeQuestionIndex].voiceMetrics.clarity}%` }}
                            ></div>
                          </div>
                          <div className="cyber-voice-metric-value">
                            {session.responses[activeQuestionIndex].voiceMetrics.clarity}%
                          </div>
                        </div>
                      )}
                      
                      {session.responses[activeQuestionIndex].voiceMetrics.pace > 0 && (
                        <div className="cyber-voice-metric">
                          <div className="cyber-voice-metric-name">Pace</div>
                          <div className="cyber-voice-metric-bar">
                            <div 
                              className={`cyber-voice-metric-fill cyber-metric-${getScoreClass(session.responses[activeQuestionIndex].voiceMetrics.pace)}`} 
                              style={{ width: `${session.responses[activeQuestionIndex].voiceMetrics.pace}%` }}
                            ></div>
                          </div>
                          <div className="cyber-voice-metric-value">
                            {session.responses[activeQuestionIndex].voiceMetrics.pace}%
                          </div>
                        </div>
                      )}
                      
                      {session.responses[activeQuestionIndex].voiceMetrics.volume > 0 && (
                        <div className="cyber-voice-metric">
                          <div className="cyber-voice-metric-name">Volume</div>
                          <div className="cyber-voice-metric-bar">
                            <div 
                              className={`cyber-voice-metric-fill cyber-metric-${getScoreClass(session.responses[activeQuestionIndex].voiceMetrics.volume)}`} 
                              style={{ width: `${session.responses[activeQuestionIndex].voiceMetrics.volume}%` }}
                            ></div>
                          </div>
                          <div className="cyber-voice-metric-value">
                            {session.responses[activeQuestionIndex].voiceMetrics.volume}%
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Filler Words */}
                    {session.responses[activeQuestionIndex].voiceMetrics.fillerWords && 
                     Object.keys(session.responses[activeQuestionIndex].voiceMetrics.fillerWords).length > 0 && (
                      <div className="cyber-filler-words-section">
                        <h5 className="cyber-filler-words-title">Filler Words</h5>
                        <div className="cyber-filler-words-grid">
                          {Object.entries(session.responses[activeQuestionIndex].voiceMetrics.fillerWords).map(([word, count]) => (
                            <div key={word} className="cyber-filler-word-item">
                              <span className="cyber-filler-word">{word}</span>
                              <span className="cyber-filler-count">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="cyber-empty-state py-12">
                <h3 className="cyber-empty-title">No Question Selected</h3>
                <p className="cyber-empty-message">
                  Please select a question from the list to view its details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h1 className="text-xl font-medium text-white">
            Interview Performance Report
            <span className="cyber-blink">_</span>
          </h1>
        </div>
        <p className="mt-2 text-gray-400 max-w-3xl">
          Detailed analysis and feedback from your interview session. Review your performance and areas for improvement.
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
              Please log in to view your interview reports.
            </p>
            <Link to="/login" className="cyber-button-primary mt-6">
              <span>Log In</span>
              <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </Link>
          </div>
        </div>
      ) : loading ? (
        <div className="cyber-content-panel p-6">
          <div className="cyber-loading-container py-12">
            <div className="cyber-loading-spinner">
              <div className="cyber-spinner-ring"></div>
              <div className="cyber-spinner-ring"></div>
              <div className="cyber-spinner-ring"></div>
            </div>
            <p className="cyber-loading-text mt-4">Loading your interview report...</p>
          </div>
        </div>
      ) : !session ? (
        <div className="cyber-content-panel p-6 text-center">
          <div className="cyber-empty-state py-8">
            <div className="cyber-empty-icon mb-4">
              <svg className="h-16 w-16 text-gray-700 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="cyber-empty-title">Interview Not Found</h3>
            <p className="cyber-empty-message">
              We couldn't find this interview session. It may have been deleted or you may not have permission to view it.
            </p>
            <Link to="/interview-analytics" className="cyber-button-primary mt-6">
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
              </svg>
              <span>Back to Analytics</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          {/* Tab Navigation */}
          <div className="cyber-tab-navigation mb-6">
            <button
              className={`cyber-tab ${activeTab === 'overview' ? 'cyber-tab-active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Overview</span>
            </button>
            <button
              className={`cyber-tab ${activeTab === 'questions' ? 'cyber-tab-active' : ''}`}
              onClick={() => setActiveTab('questions')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Questions & Responses</span>
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="cyber-tab-content">
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'questions' && renderQuestionsTab()}
          </div>
        </div>
      )}
      
      {/* Styling */}
      <style jsx>{`
        /* Cyberpunk styling would go here */
        /* Tab Navigation */
        .cyber-tab-navigation {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
        }
        
        .cyber-tab {
          display: flex;
          align-items: center;
          padding: 0.75rem 1.25rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          color: rgba(226, 232, 240, 0.7);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
          white-space: nowrap;
        }
        
        .cyber-tab:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.3);
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-tab-active {
          background: rgba(6, 182, 212, 0.1);
          border-color: rgba(6, 182, 212, 0.5);
          color: rgb(6, 182, 212);
        }
        
        /* Info Panels */
        .cyber-info-panel,
        .cyber-content-panel {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }
        
        .cyber-panel-title,
        .cyber-section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: rgb(6, 182, 212);
          margin-bottom: 1rem;
        }
        
        .cyber-info-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .cyber-info-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }
        
        .cyber-info-label {
          color: rgba(226, 232, 240, 0.6);
        }
        
        .cyber-info-value {
          color: rgba(226, 232, 240, 0.9);
          font-weight: 500;
        }
        
        .cyber-status-completed {
          color: rgb(16, 185, 129);
        }
        
        .cyber-status-in-progress {
          color: rgb(245, 158, 11);
        }
        
        .cyber-status-abandoned {
          color: rgb(239, 68, 68);
        }
        
        /* Metrics Grid */
        .cyber-metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        
        .cyber-metric-card {
          position: relative;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(6, 182, 212, 0.1);
          border-radius: 0.375rem;
          padding: 1rem;
          text-align: center;
          overflow: hidden;
        }
        
        .cyber-metric-icon {
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.5rem;
          border-radius: 50%;
        }
        
        .cyber-metric-icon-blue {
          background: rgba(6, 182, 212, 0.1);
          color: rgb(6, 182, 212);
        }
        
        .cyber-metric-icon-purple {
          background: rgba(124, 58, 237, 0.1);
          color: rgb(124, 58, 237);
        }
        
        .cyber-metric-icon-green {
          background: rgba(16, 185, 129, 0.1);
          color: rgb(16, 185, 129);
        }
        
        .cyber-metric-icon-orange {
          background: rgba(245, 158, 11, 0.1);
          color: rgb(245, 158, 11);
        }
        
        .cyber-metric-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-metric-label {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.6);
        }
        
        .cyber-metric-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          width: 100%;
        }
        
        .cyber-metric-high {
          background: rgb(16, 185, 129);
        }
        
        .cyber-metric-medium {
          background: rgb(245, 158, 11);
        }
        
        .cyber-metric-low {
          background: rgb(239, 68, 68);
        }
        
        /* Overall Score */
        .cyber-overall-score {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .cyber-score-value {
          font-size: 1.5rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
        }
        
        .cyber-score-high {
          background: rgba(16, 185, 129, 0.1);
          color: rgb(16, 185, 129);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .cyber-score-medium {
          background: rgba(245, 158, 11, 0.1);
          color: rgb(245, 158, 11);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        
        .cyber-score-low {
          background: rgba(239, 68, 68, 0.1);
          color: rgb(239, 68, 68);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        /* Feedback Sections */
        .cyber-feedback-section {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          padding: 1.25rem;
        }
        
        .cyber-feedback-title,
        .cyber-strengths-title,
        .cyber-improvements-title {
          font-size: 1rem;
          font-weight: 500;
          color: rgb(6, 182, 212);
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
        }
        
        .cyber-feedback-text {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.8);
          line-height: 1.6;
        }
        
        /* Strengths & Improvements */
        .cyber-strengths-panel,
        .cyber-improvements-panel {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          padding: 1.25rem;
        }
        
        .cyber-strengths-list,
        .cyber-improvements-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .cyber-strength-item,
        .cyber-improvement-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }
        
        .cyber-strength-bullet,
        .cyber-improvement-bullet {
          flex-shrink: 0;
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          margin-top: 0.375rem;
          margin-right: 0.75rem;
        }
        
        .cyber-strength-bullet {
          background: rgb(16, 185, 129);
        }
        
        .cyber-improvement-bullet {
          background: rgb(245, 158, 11);
        }
        
        .cyber-strength-text,
        .cyber-improvement-text {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.8);
          line-height: 1.5;
        }
        
        /* Resources */
        .cyber-resource-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          padding: 1rem;
        }
        
        .cyber-resource-icon {
          flex-shrink: 0;
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.375rem;
        }
        
        .cyber-resource-icon.book {
          background: rgba(6, 182, 212, 0.1);
          color: rgb(6, 182, 212);
        }
        
        .cyber-resource-icon.course {
          background: rgba(124, 58, 237, 0.1);
          color: rgb(124, 58, 237);
        }
        
        .cyber-resource-icon.practice {
          background: rgba(16, 185, 129, 0.1);
          color: rgb(16, 185, 129);
        }
        
        .cyber-resource-icon.default {
          background: rgba(245, 158, 11, 0.1);
          color: rgb(245, 158, 11);
        }
        
        .cyber-resource-content {
          flex: 1;
        }
        
        .cyber-resource-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 0.375rem;
        }
        
        .cyber-resource-description {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
          line-height: 1.5;
        }
        
        /* Next Steps */
        .cyber-next-steps-list {
          list-style: none;
          padding: 0;
          margin: 0;
          counter-reset: step-counter;
        }
        
        .cyber-next-step-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 1rem;
          position: relative;
          padding-left: 3rem;
        }
        
        .cyber-next-step-number {
          position: absolute;
          left: 0;
          top: 0;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(6, 182, 212, 0.1);
          color: rgb(6, 182, 212);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 50%;
          font-size: 0.875rem;
          font-weight: 600;
        }
        
        .cyber-next-step-content {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.8);
          line-height: 1.6;
          padding-top: 0.25rem;
        }
        
        /* Questions Tab */
        .cyber-questions-panel {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          height: 100%;
        }
        
        .cyber-questions-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: rgb(6, 182, 212);
          padding: 1.25rem;
          border-bottom: 1px solid rgba(6, 182, 212, 0.2);
        }
        
        .cyber-questions-list {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 600px;
          overflow-y: auto;
        }
        
        .cyber-question-button {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 0.75rem;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(6, 182, 212, 0.1);
          border-radius: 0.375rem;
          color: rgba(226, 232, 240, 0.8);
          font-size: 0.875rem;
          text-align: left;
          transition: all 0.2s;
        }
        
        .cyber-question-button:hover {
          background: rgba(15, 23, 42, 0.7);
          border-color: rgba(6, 182, 212, 0.3);
        }
        
        .cyber-question-active {
          background: rgba(6, 182, 212, 0.1);
          border-color: rgba(6, 182, 212, 0.4);
          color: rgb(6, 182, 212);
        }
        
        .cyber-question-number {
          flex-shrink: 0;
          width: 1.75rem;
          height: 1.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 500;
          margin-right: 0.75rem;
        }
        
        .cyber-question-active .cyber-question-number {
          background: rgba(6, 182, 212, 0.2);
        }
        
        .cyber-question-preview {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-right: 0.5rem;
        }
        
        .cyber-question-score {
          flex-shrink: 0;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        /* Question Detail Panel */
        .cyber-question-detail-panel {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          height: 100%;
        }
        
        .cyber-question-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem;
          border-bottom: 1px solid rgba(6, 182, 212, 0.2);
        }
        
        .cyber-question-detail-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: rgb(6, 182, 212);
        }
        
        .cyber-question-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .cyber-question-nav-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          color: rgb(6, 182, 212);
          transition: all 0.2s;
        }
        
        .cyber-question-nav-button:hover:not(:disabled) {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.4);
        }
        
        .cyber-question-nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .cyber-question-nav-info {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.6);
        }
        
        .cyber-question-content,
        .cyber-response-content,
        .cyber-feedback-content,
        .cyber-metrics-content,
        .cyber-keywords-content,
        .cyber-nonverbal-content,
        .cyber-voice-content {
          padding: 1.25rem;
          border-bottom: 1px solid rgba(15, 23, 42, 0.7);
        }
        
        .cyber-content-subtitle {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgb(6, 182, 212);
          margin-bottom: 0.625rem;
        }
        
        .cyber-content-text {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.8);
          line-height: 1.6;
          white-space: pre-line;
        }
        
        /* Question Metrics */
        .cyber-question-metrics-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 1rem;
        }
        
        @media (min-width: 640px) {
          .cyber-question-metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        .cyber-question-metric {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(6, 182, 212, 0.1);
          border-radius: 0.375rem;
          padding: 0.75rem;
        }
        
        .cyber-question-metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .cyber-question-metric-label {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.6);
        }
        
        .cyber-question-metric-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-question-metric-bar {
          height: 0.375rem;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 0.25rem;
          overflow: hidden;
        }
        
        .cyber-question-metric-fill {
          height: 100%;
          border-radius: 0.25rem;
          transition: width 1s ease-out;
        }
        
        /* Keywords */
        .cyber-keywords-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .cyber-keyword-tag {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          background: rgba(6, 182, 212, 0.1);
          color: rgb(6, 182, 212);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.25rem;
        }
        
        /* Non-verbal Metrics */
        .cyber-nonverbal-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 1rem;
        }
        
        .cyber-nonverbal-metric {
          text-align: center;
        }
        
        .cyber-nonverbal-metric-circle {
          width: 80px;
          height: 80px;
          margin: 0 auto 0.5rem;
        }
        
        .cyber-circle-chart {
          width: 100%;
          height: 100%;
        }
        
        .cyber-circle-bg {
          fill: none;
          stroke: rgba(15, 23, 42, 0.8);
          stroke-width: 2;
        }
        
        .cyber-circle-fill {
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          transform: rotate(-90deg);
          transform-origin: center;
          transition: stroke-dasharray 1s ease-out;
        }
        
        .cyber-circle-fill.cyber-metric-high {
          stroke: rgb(16, 185, 129);
        }
        
        .cyber-circle-fill.cyber-metric-medium {
          stroke: rgb(245, 158, 11);
        }
        
        .cyber-circle-fill.cyber-metric-low {
          stroke: rgb(239, 68, 68);
        }
        
        .cyber-circle-text {
          fill: rgba(226, 232, 240, 0.9);
          font-size: 6px;
          text-anchor: middle;
          font-weight: 500;
        }
        
        .cyber-nonverbal-metric-label {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
        }
        
        /* Voice Metrics */
        .cyber-voice-metrics-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        
        @media (min-width: 640px) {
          .cyber-voice-metrics-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        .cyber-voice-metric {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(6, 182, 212, 0.1);
          border-radius: 0.375rem;
          padding: 0.75rem;
        }
        
        .cyber-voice-metric-name {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.6);
          margin-bottom: 0.5rem;
        }
        
        .cyber-voice-metric-bar {
          height: 0.375rem;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 0.25rem;
          overflow: hidden;
          margin-bottom: 0.375rem;
        }
        
        .cyber-voice-metric-fill {
          height: 100%;
          border-radius: 0.25rem;
          transition: width 1s ease-out;
        }
        
        .cyber-voice-metric-value {
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
          text-align: right;
        }
        
        /* Filler Words */
        .cyber-filler-words-section {
          margin-top: 1.25rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(15, 23, 42, 0.7);
        }
        
        .cyber-filler-words-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgb(6, 182, 212);
          margin-bottom: 0.75rem;
        }
        
        .cyber-filler-words-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }
        
        .cyber-filler-word-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(6, 182, 212, 0.1);
          border-radius: 0.25rem;
          padding: 0.5rem 0.75rem;
        }
        
        .cyber-filler-word {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.8);
        }
        
        .cyber-filler-count {
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(239, 68, 68, 0.9);
          background: rgba(239, 68, 68, 0.1);
          border-radius: 0.25rem;
          padding: 0.125rem 0.375rem;
        }
      `}</style>
    </div>
  );
};

export default InterviewReport;