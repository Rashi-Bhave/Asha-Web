import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import InterviewNavigation from './InterviewNavigation';
// import { useAuth } from '../../Contexts/AuthContext'; // Assuming you have an AuthContext

const InterviewAnalytics = () => {
  // Get current user from auth context
  // const { currentUser } = useAuth();

  const currentUser = {
    id: '507f1f77bcf86cd799439011', // Valid ObjectId format
    _id: '507f1f77bcf86cd799439011',
    name: 'Demo User',
    email: 'demo@example.com'
  };
  
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [interviewData, setInterviewData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalInterviews: 0,
    averageTechnicalScore: 0,
    averageCommunicationScore: 0,
    averageConfidence: 0,
    averageClarity: 0,
    mostFrequentRole: '',
    topPerformanceAreas: [],
    improvementAreas: []
  });
  const [timeRange, setTimeRange] = useState('all');
  const [chartData, setChartData] = useState({
    technical: [],
    communication: [],
    confidence: [],
    clarity: []
  });
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Backend API URL
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
  
  // Fetch interview data on component mount
  useEffect(() => {
    const fetchInterviewData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const response = await axios.get(`${API_URL}/interview/sessions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data && response.data.success) {
          // Transform the data to match our frontend format
          const transformedData = response.data.sessions.map(session => ({
            id: session._id,
            date: session.startTime,
            role: session.role,
            type: session.interviewType,
            technicalScore: calculateAverageScore(session.responses, 'technical'),
            communicationScore: calculateAverageScore(session.responses, 'communication'),
            confidenceScore: calculateAverageScore(session.responses, 'confidence'),
            clarityScore: calculateAverageScore(session.responses, 'clarity'),
            duration: calculateDuration(session.startTime, session.endTime),
            questionCount: session.responses.length,
            status: session.status,
            overallScore: session.overallScore || 0,
            keyStrengths: session.keyStrengths || [],
            developmentAreas: session.developmentAreas || []
          }));
          
          setInterviewData(transformedData);
          const filteredData = filterDataByTimeRange(transformedData, timeRange);
          calculateSummaryStats(filteredData);
          generateChartData(filteredData);
        } else {
          throw new Error("Failed to fetch interview sessions");
        }
      } catch (error) {
        console.error("Error fetching interview data:", error);
        toast.error("Failed to load interview analytics");
        
        // If no data is available, set empty values
        setInterviewData([]);
        setSummaryStats({
          totalInterviews: 0,
          averageTechnicalScore: 0,
          averageCommunicationScore: 0,
          averageConfidence: 0,
          averageClarity: 0,
          mostFrequentRole: 'None',
          topPerformanceAreas: [],
          improvementAreas: []
        });
        setChartData({
          technical: [],
          communication: [],
          confidence: [],
          clarity: []
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInterviewData();
  }, [API_URL]);
  
  // Update chart data when time range changes
  useEffect(() => {
    if (interviewData.length > 0) {
      const filteredData = filterDataByTimeRange(interviewData, timeRange);
      calculateSummaryStats(filteredData);
      generateChartData(filteredData);
    }
  }, [timeRange, interviewData]);
  
  // Calculate average score for a specific metric
  const calculateAverageScore = (responses, type) => {
    if (!responses || responses.length === 0) return 0;
    
    const scores = [];
    
    if (type === 'technical' || type === 'communication') {
      responses.forEach(response => {
        if (response.scores && response.scores[type]) {
          scores.push(response.scores[type]);
        }
      });
    } else if (type === 'confidence') {
      responses.forEach(response => {
        if (response.nonVerbalMetrics && response.nonVerbalMetrics.confidence) {
          scores.push(response.nonVerbalMetrics.confidence);
        }
      });
    } else if (type === 'clarity') {
      responses.forEach(response => {
        if (response.voiceMetrics && response.voiceMetrics.clarity) {
          scores.push(response.voiceMetrics.clarity);
        }
      });
    }
    
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };
  
  // Calculate session duration in minutes
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    
    return Math.round(durationMs / (1000 * 60)); // Convert ms to minutes
  };
  
  // Filter data based on selected time range
  const filterDataByTimeRange = (data, range) => {
    const now = new Date();
    let cutoffDate;
    
    switch (range) {
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        // 'all' - no filtering
        return data;
    }
    
    return data.filter(interview => new Date(interview.date) >= cutoffDate);
  };
  
  // Calculate summary statistics from interview data
  const calculateSummaryStats = (data) => {
    if (data.length === 0) {
      setSummaryStats({
        totalInterviews: 0,
        averageTechnicalScore: 0,
        averageCommunicationScore: 0,
        averageConfidence: 0,
        averageClarity: 0,
        mostFrequentRole: 'None',
        topPerformanceAreas: [],
        improvementAreas: []
      });
      return;
    }
    
    // Calculate average scores
    const avgTechnical = data.reduce((sum, item) => sum + item.technicalScore, 0) / data.length;
    const avgCommunication = data.reduce((sum, item) => sum + item.communicationScore, 0) / data.length;
    const avgConfidence = data.reduce((sum, item) => sum + item.confidenceScore, 0) / data.length;
    const avgClarity = data.reduce((sum, item) => sum + item.clarityScore, 0) / data.length;
    
    // Find most frequent role
    const roleCounts = data.reduce((counts, item) => {
      counts[item.role] = (counts[item.role] || 0) + 1;
      return counts;
    }, {});
    
    const mostFrequentRole = Object.entries(roleCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])[0] || 'None';
    
    // Collect all strengths and improvement areas from interview data
    const allStrengths = data.flatMap(item => item.keyStrengths || []);
    const allImprovements = data.flatMap(item => item.developmentAreas || []);
    
    // Count frequency of each strength and improvement area
    const strengthCounts = allStrengths.reduce((counts, strength) => {
      counts[strength] = (counts[strength] || 0) + 1;
      return counts;
    }, {});
    
    const improvementCounts = allImprovements.reduce((counts, area) => {
      counts[area] = (counts[area] || 0) + 1;
      return counts;
    }, {});
    
    // Get top 3 strengths and improvement areas by frequency
    const topStrengths = Object.entries(strengthCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
    
    const topImprovements = Object.entries(improvementCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
    
    // Use default values if not enough data
    const defaultStrengths = [
      'Technical Problem Solving',
      'Logical Thinking',
      'Communication Structure'
    ];
    
    const defaultImprovements = [
      'Conciseness in Responses',
      'Handling Ambiguity',
      'Non-verbal Communication'
    ];
    
    setSummaryStats({
      totalInterviews: data.length,
      averageTechnicalScore: Math.round(avgTechnical),
      averageCommunicationScore: Math.round(avgCommunication),
      averageConfidence: Math.round(avgConfidence),
      averageClarity: Math.round(avgClarity),
      mostFrequentRole,
      topPerformanceAreas: topStrengths.length ? topStrengths : defaultStrengths,
      improvementAreas: topImprovements.length ? topImprovements : defaultImprovements
    });
  };
  
  // Generate chart data for visualization
  const generateChartData = (data) => {
    if (data.length === 0) {
      setChartData({
        technical: [],
        communication: [],
        confidence: [],
        clarity: []
      });
      return;
    }
    
    // Sort interviews by date (ascending)
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Extract data points for each metric
    const technicalData = sortedData.map(item => ({
      date: formatDate(item.date),
      value: item.technicalScore
    }));
    
    const communicationData = sortedData.map(item => ({
      date: formatDate(item.date),
      value: item.communicationScore
    }));
    
    const confidenceData = sortedData.map(item => ({
      date: formatDate(item.date),
      value: item.confidenceScore
    }));
    
    const clarityData = sortedData.map(item => ({
      date: formatDate(item.date),
      value: item.clarityScore
    }));
    
    setChartData({
      technical: technicalData,
      communication: communicationData,
      confidence: confidenceData,
      clarity: clarityData
    });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format date with year for full display
  const formatFullDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // View interview details
  const viewInterviewDetails = async (interview) => {
    try {
      // Fetch full interview details
      const response = await axios.get(`${API_URL}/interview/sessions/${interview.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        // Combine the summary data we already have with detailed data
        setSelectedInterview({
          ...interview,
          responses: response.data.session.responses,
          overallFeedback: response.data.session.overallFeedback,
          keyStrengths: response.data.session.keyStrengths,
          developmentAreas: response.data.session.developmentAreas,
          recommendedResources: response.data.session.recommendedResources,
          nextSteps: response.data.session.nextSteps
        });
      } else {
        throw new Error("Failed to fetch interview details");
      }
    } catch (error) {
      console.error("Error fetching interview details:", error);
      toast.error("Failed to load interview details");
      
      // Use what we have as a fallback
      setSelectedInterview(interview);
    }
  };
  
  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };
  
  // A simple bar chart component
  const MetricChart = ({ data, color, maxValue = 100 }) => {
    if (!data || data.length === 0) return null;
    
    return (
      <div className="cyber-chart">
        <div className="cyber-chart-bars">
          {data.map((item, index) => (
            <div key={index} className="cyber-chart-bar-container" title={`${item.date}: ${item.value}%`}>
              <div 
                className={`cyber-chart-bar cyber-chart-bar-${color}`} 
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              >
                <span className="cyber-chart-value">{item.value}</span>
              </div>
              <span className="cyber-chart-label">{item.date}</span>
            </div>
          ))}
        </div>
        <div className="cyber-chart-grid">
          <div className="cyber-chart-grid-line" style={{ bottom: '25%' }}>
            <span className="cyber-chart-grid-label">25</span>
          </div>
          <div className="cyber-chart-grid-line" style={{ bottom: '50%' }}>
            <span className="cyber-chart-grid-label">50</span>
          </div>
          <div className="cyber-chart-grid-line" style={{ bottom: '75%' }}>
            <span className="cyber-chart-grid-label">75</span>
          </div>
          <div className="cyber-chart-grid-line" style={{ bottom: '100%' }}>
            <span className="cyber-chart-grid-label">100</span>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h1 className="text-xl font-medium text-white">
            Neural Performance Analytics
            <span className="cyber-blink">_</span>
          </h1>
        </div>
        <p className="mt-2 text-gray-400 max-w-3xl">
          Track your interview performance metrics and progress over time with detailed analytics.
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
              Please log in to view your interview analytics and performance metrics.
            </p>
            <Link to="/login" className="cyber-button-primary mt-6">
              <span>Log In</span>
              <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          {/* Left Column - Summary Stats and Charts */}
          <div className="lg:col-span-2">
            {/* Summary Stats Panel */}
            <div className="cyber-content-panel p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="cyber-section-title">Neural Performance Summary</h2>
                
                {/* Time Range Filter */}
                <div className="cyber-tab-group">
                  <button 
                    className={`cyber-tab ${timeRange === 'week' ? 'cyber-tab-active' : ''}`}
                    onClick={() => handleTimeRangeChange('week')}
                  >
                    Week
                  </button>
                  <button 
                    className={`cyber-tab ${timeRange === 'month' ? 'cyber-tab-active' : ''}`}
                    onClick={() => handleTimeRangeChange('month')}
                  >
                    Month
                  </button>
                  <button 
                    className={`cyber-tab ${timeRange === 'quarter' ? 'cyber-tab-active' : ''}`}
                    onClick={() => handleTimeRangeChange('quarter')}
                  >
                    Quarter
                  </button>
                  <button 
                    className={`cyber-tab ${timeRange === 'all' ? 'cyber-tab-active' : ''}`}
                    onClick={() => handleTimeRangeChange('all')}
                  >
                    All Time
                  </button>
                </div>
              </div>
              
              {isLoading ? (
                // Loading state
                <div className="cyber-loading-container py-8">
                  <div className="cyber-loading-spinner">
                    <div className="cyber-spinner-ring"></div>
                    <div className="cyber-spinner-ring"></div>
                    <div className="cyber-spinner-ring"></div>
                  </div>
                  <p className="cyber-loading-text mt-4">Analyzing neural performance data...</p>
                </div>
              ) : summaryStats.totalInterviews > 0 ? (
                // Summary stats
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    {/* Total Interviews */}
                    <div className="cyber-stat-card">
                      <div className="cyber-stat-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="cyber-stat-info">
                        <div className="cyber-stat-value">{summaryStats.totalInterviews}</div>
                        <div className="cyber-stat-label">Interviews</div>
                      </div>
                    </div>
                    
                    {/* Technical Score */}
                    <div className="cyber-stat-card">
                      <div className="cyber-stat-icon cyber-stat-icon-blue">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <div className="cyber-stat-info">
                        <div className="cyber-stat-value">{summaryStats.averageTechnicalScore}%</div>
                        <div className="cyber-stat-label">Avg. Technical</div>
                      </div>
                    </div>
                    
                    {/* Communication Score */}
                    <div className="cyber-stat-card">
                      <div className="cyber-stat-icon cyber-stat-icon-purple">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div className="cyber-stat-info">
                        <div className="cyber-stat-value">{summaryStats.averageCommunicationScore}%</div>
                        <div className="cyber-stat-label">Avg. Communication</div>
                      </div>
                    </div>
                    
                    {/* Most Frequent Role */}
                    <div className="cyber-stat-card">
                      <div className="cyber-stat-icon cyber-stat-icon-green">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="cyber-stat-info">
                        <div className="cyber-stat-value cyber-stat-value-text">{summaryStats.mostFrequentRole}</div>
                        <div className="cyber-stat-label">Top Role</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Charts */}
                  <div className="cyber-charts-container">
                    <div className="cyber-charts-header">
                      <h3 className="cyber-chart-title">Performance Trends</h3>
                      <div className="cyber-chart-legend">
                        <div className="cyber-legend-item">
                          <div className="cyber-legend-color cyber-legend-blue"></div>
                          <span>Technical</span>
                        </div>
                        <div className="cyber-legend-item">
                          <div className="cyber-legend-color cyber-legend-purple"></div>
                          <span>Communication</span>
                        </div>
                        <div className="cyber-legend-item">
                          <div className="cyber-legend-color cyber-legend-green"></div>
                          <span>Confidence</span>
                        </div>
                        <div className="cyber-legend-item">
                          <div className="cyber-legend-color cyber-legend-orange"></div>
                          <span>Clarity</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="cyber-charts-grid">
                      <div className="cyber-chart-container">
                        <MetricChart data={chartData.technical} color="blue" />
                      </div>
                      <div className="cyber-chart-container">
                        <MetricChart data={chartData.communication} color="purple" />
                      </div>
                      <div className="cyber-chart-container">
                        <MetricChart data={chartData.confidence} color="green" />
                      </div>
                      <div className="cyber-chart-container">
                        <MetricChart data={chartData.clarity} color="orange" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // No data state
                <div className="cyber-empty-state py-8 text-center">
                  <div className="cyber-empty-icon mb-4">
                    <svg className="h-16 w-16 text-gray-700 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h3 className="cyber-empty-title">No Interview Data Available</h3>
                  <p className="cyber-empty-message">
                    Complete your first interview simulation to start tracking your performance metrics.
                  </p>
                  <Link to="/interview-simulator" className="cyber-button-primary mt-6">
                    <span>Start Interview Simulation</span>
                    <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Strength & Improvement Areas */}
            {summaryStats.totalInterviews > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Strength Areas */}
                <div className="cyber-content-panel p-6">
                  <h2 className="cyber-section-title mb-6 flex items-center">
                    <svg className="h-5 w-5 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <span>Top Performance Areas</span>
                  </h2>
                  
                  <ul className="cyber-strength-list">
                    {summaryStats.topPerformanceAreas.map((area, index) => (
                      <li key={index} className="cyber-strength-item">
                        <div className="cyber-strength-bullet"></div>
                        <div className="cyber-strength-content">
                          <div className="cyber-strength-text">{area}</div>
                          <div className="cyber-strength-bar">
                            <div className="cyber-strength-fill" style={{ width: `${90 - index * 10}%` }}></div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Improvement Areas */}
                <div className="cyber-content-panel p-6">
                  <h2 className="cyber-section-title mb-6 flex items-center">
                    <svg className="h-5 w-5 text-orange-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Areas for Improvement</span>
                  </h2>
                  
                  <ul className="cyber-improvement-list">
                    {summaryStats.improvementAreas.map((area, index) => (
                      <li key={index} className="cyber-improvement-item">
                        <div className="cyber-improvement-bullet"></div>
                        <div className="cyber-improvement-content">
                          <div className="cyber-improvement-text">{area}</div>
                          <div className="cyber-improvement-bar">
                            <div className="cyber-improvement-fill" style={{ width: `${60 - index * 10}%` }}></div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Interview History */}
          <div>
            <div className="cyber-content-panel p-6">
              <h2 className="cyber-section-title mb-6">Neural Interview History</h2>
              
              {isLoading ? (
                // Loading state
                <div className="cyber-loading-container py-8">
                  <div className="cyber-loading-spinner">
                    <div className="cyber-spinner-ring"></div>
                    <div className="cyber-spinner-ring"></div>
                    <div className="cyber-spinner-ring"></div>
                  </div>
                  <p className="cyber-loading-text mt-4">Retrieving interview data...</p>
                </div>
              ) : interviewData.length > 0 ? (
                // Interview history list
                <div className="cyber-interviews-list space-y-4">
                  {interviewData.map(interview => (
                    <div key={interview.id} className="cyber-interview-card">
                      <div className="cyber-interview-header">
                        <div className="cyber-interview-date">
                          {formatFullDate(interview.date)}
                        </div>
                        <div className={`cyber-interview-type cyber-interview-type-${interview.type}`}>
                          {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)}
                        </div>
                      </div>
                      
                      <div className="cyber-interview-role">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{interview.role}</span>
                      </div>
                      
                      <div className="cyber-interview-stats">
                        <div className="cyber-interview-stat">
                          <span className="cyber-stat-name">Technical</span>
                          <div className="cyber-stat-progress">
                            <div className="cyber-stat-bar">
                              <div className={`cyber-stat-fill cyber-stat-fill-blue ${getScoreClass(interview.technicalScore)}`} style={{ width: `${interview.technicalScore}%` }}></div>
                            </div>
                            <span className="cyber-stat-percentage">{interview.technicalScore}%</span>
                          </div>
                        </div>
                        
                        <div className="cyber-interview-stat">
                          <span className="cyber-stat-name">Communication</span>
                          <div className="cyber-stat-progress">
                            <div className="cyber-stat-bar">
                              <div className={`cyber-stat-fill cyber-stat-fill-purple ${getScoreClass(interview.communicationScore)}`} style={{ width: `${interview.communicationScore}%` }}></div>
                            </div>
                            <span className="cyber-stat-percentage">{interview.communicationScore}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="cyber-interview-meta">
                        <div className="cyber-interview-meta-item">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{interview.duration} min</span>
                        </div>
                        
                        <div className="cyber-interview-meta-item">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{interview.questionCount} Questions</span>
                        </div>
                      </div>
                      
                      <button 
                        className="cyber-interview-button"
                        onClick={() => viewInterviewDetails(interview)}
                      >
                        <span>View Details</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5-5 5M5 7l5 5-5 5" />
                        </svg>
                      </button>
                      
                      {/* Decorative Elements */}
                      <div className="cyber-corner cyber-corner-tl"></div>
                      <div className="cyber-corner cyber-corner-tr"></div>
                      <div className="cyber-corner cyber-corner-bl"></div>
                      <div className="cyber-corner cyber-corner-br"></div>
                    </div>
                  ))}
                </div>
              ) : (
                // No interviews state
                <div className="cyber-empty-state py-8 text-center">
                  <div className="cyber-empty-icon mb-4">
                    <svg className="h-16 w-16 text-gray-700 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="cyber-empty-title">No Interview History</h3>
                  <p className="cyber-empty-message">
                    You haven't completed any interview simulations yet.
                  </p>
                </div>
              )}
              
              {/* CTA Button to start a new interview */}
              <div className="mt-6">
                <Link to="/interview-simulator" className="cyber-button-primary w-full">
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Start New Interview</span>
                </Link>
              </div>
            </div>
            
            {/* Resources Panel */}
            <div className="cyber-content-panel p-6 mt-8">
              <h2 className="cyber-section-title mb-6">Interview Resources</h2>
              
              <div className="space-y-4">
                <div className="cyber-resource-item">
                  <div className="cyber-resource-icon cyber-resource-icon-blue">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="cyber-resource-content">
                    <h3 className="cyber-resource-title">Behavioral Interview Guide</h3>
                    <p className="cyber-resource-description">Learn the STAR method and practice answering common behavioral questions.</p>
                  </div>
                  <Link to="/resources/behavioral-guide" className="cyber-resource-button">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Link>
                </div>
                
                <div className="cyber-resource-item">
                  <div className="cyber-resource-icon cyber-resource-icon-purple">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="cyber-resource-content">
                    <h3 className="cyber-resource-title">Technical Interview Masterclass</h3>
                    <p className="cyber-resource-description">Video course covering system design, algorithms, and problem-solving techniques.</p>
                  </div>
                  <Link to="/resources/technical-masterclass" className="cyber-resource-button">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Link>
                </div>
                
                <div className="cyber-resource-item">
                  <div className="cyber-resource-icon cyber-resource-icon-green">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="cyber-resource-content">
                    <h3 className="cyber-resource-title">Interview Question Database</h3>
                    <p className="cyber-resource-description">Browse and practice with real questions from top tech companies.</p>
                  </div>
                  <Link to="/question-bank" className="cyber-resource-button">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Interview Details Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm" onClick={() => setSelectedInterview(null)}></div>
          
          <div className="cyber-modal">
            <div className="cyber-modal-header">
              <h3 className="cyber-modal-title">Interview Details</h3>
              <button className="cyber-modal-close" onClick={() => setSelectedInterview(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="cyber-modal-content">
              <div className="cyber-modal-info">
                <div className="cyber-modal-info-item">
                  <span className="cyber-modal-label">Date:</span>
                  <span className="cyber-modal-value">{formatFullDate(selectedInterview.date)}</span>
                </div>
                
                <div className="cyber-modal-info-item">
                  <span className="cyber-modal-label">Role:</span>
                  <span className="cyber-modal-value">{selectedInterview.role}</span>
                </div>
                
                <div className="cyber-modal-info-item">
                  <span className="cyber-modal-label">Type:</span>
                  <span className="cyber-modal-value cyber-modal-badge">{selectedInterview.type}</span>
                </div>
                
                <div className="cyber-modal-info-item">
                  <span className="cyber-modal-label">Duration:</span>
                  <span className="cyber-modal-value">{selectedInterview.duration} minutes</span>
                </div>
                
                <div className="cyber-modal-info-item">
                  <span className="cyber-modal-label">Questions:</span>
                  <span className="cyber-modal-value">{selectedInterview.questionCount} questions</span>
                </div>
              </div>
              
              <div className="cyber-modal-scores">
                <h4 className="cyber-modal-subtitle">Performance Metrics</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="cyber-modal-metric">
                    <div className="cyber-modal-metric-header">
                      <span>Technical Score</span>
                      <span className="cyber-modal-metric-value">{selectedInterview.technicalScore}%</span>
                    </div>
                    <div className="cyber-modal-metric-bar">
                      <div className={`cyber-modal-metric-fill cyber-stat-fill-blue ${getScoreClass(selectedInterview.technicalScore)}`} style={{ width: `${selectedInterview.technicalScore}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="cyber-modal-metric">
                    <div className="cyber-modal-metric-header">
                      <span>Communication Score</span>
                      <span className="cyber-modal-metric-value">{selectedInterview.communicationScore}%</span>
                    </div>
                    <div className="cyber-modal-metric-bar">
                      <div className={`cyber-modal-metric-fill cyber-stat-fill-purple ${getScoreClass(selectedInterview.communicationScore)}`} style={{ width: `${selectedInterview.communicationScore}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="cyber-modal-metric">
                    <div className="cyber-modal-metric-header">
                      <span>Confidence</span>
                      <span className="cyber-modal-metric-value">{selectedInterview.confidenceScore}%</span>
                    </div>
                    <div className="cyber-modal-metric-bar">
                      <div className={`cyber-modal-metric-fill cyber-stat-fill-green ${getScoreClass(selectedInterview.confidenceScore)}`} style={{ width: `${selectedInterview.confidenceScore}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="cyber-modal-metric">
                    <div className="cyber-modal-metric-header">
                      <span>Voice Clarity</span>
                      <span className="cyber-modal-metric-value">{selectedInterview.clarityScore}%</span>
                    </div>
                    <div className="cyber-modal-metric-bar">
                      <div className={`cyber-modal-metric-fill cyber-stat-fill-orange ${getScoreClass(selectedInterview.clarityScore)}`} style={{ width: `${selectedInterview.clarityScore}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Overall Feedback Section */}
              {selectedInterview.overallFeedback && (
                <div className="cyber-modal-feedback mt-4">
                  <h4 className="cyber-modal-subtitle">Overall Feedback</h4>
                  <p className="cyber-modal-feedback-text">{selectedInterview.overallFeedback}</p>
                  
                  {selectedInterview.keyStrengths && selectedInterview.keyStrengths.length > 0 && (
                    <div className="mt-3">
                      <h5 className="cyber-modal-subtitle-sm">Key Strengths</h5>
                      <ul className="cyber-modal-list">
                        {selectedInterview.keyStrengths.map((strength, index) => (
                          <li key={index} className="cyber-modal-list-item">
                            <div className="cyber-list-bullet cyber-list-bullet-positive"></div>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedInterview.developmentAreas && selectedInterview.developmentAreas.length > 0 && (
                    <div className="mt-3">
                      <h5 className="cyber-modal-subtitle-sm">Areas for Improvement</h5>
                      <ul className="cyber-modal-list">
                        {selectedInterview.developmentAreas.map((area, index) => (
                          <li key={index} className="cyber-modal-list-item">
                            <div className="cyber-list-bullet cyber-list-bullet-negative"></div>
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {!selectedInterview.overallFeedback && (
                <div className="cyber-modal-message">
                  <p>Select "View Full Report" to see detailed question-by-question feedback and recordings of your responses.</p>
                </div>
              )}
            </div>
            
            <div className="cyber-modal-footer">
              <button className="cyber-button-secondary" onClick={() => setSelectedInterview(null)}>
                <span>Close</span>
              </button>
              
              <Link to={`/interview-report/${selectedInterview.id}`} className="cyber-button-primary">
                <span>View Full Report</span>
              </Link>
            </div>
          </div>
        </div>
      )}
      
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
        
        /* Tab Group */
        .cyber-tab-group {
          display: flex;
        }
        
        .cyber-tab {
          padding: 0.5rem 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          color: rgba(226, 232, 240, 0.7);
          font-size: 0.75rem;
          transition: all 0.3s;
          position: relative;
        }
        
        .cyber-tab:first-child {
          border-top-left-radius: 0.375rem;
          border-bottom-left-radius: 0.375rem;
        }
        
        .cyber-tab:last-child {
          border-top-right-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
        }
        
        .cyber-tab:not(:first-child) {
          margin-left: -1px;
        }
        
        .cyber-tab:hover {
          background: rgba(15, 23, 42, 0.8);
          color: rgba(226, 232, 240, 0.9);
          z-index: 1;
        }
        
        .cyber-tab-active {
          background: rgba(6, 182, 212, 0.2);
          border-color: rgba(6, 182, 212, 0.5);
          color: rgb(6, 182, 212);
          z-index: 2;
        }
        
        /* Stat Cards */
        .cyber-stat-card {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .cyber-stat-icon {
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(6, 182, 212, 0.1);
          border-radius: 0.5rem;
          color: rgb(6, 182, 212);
        }
        
        .cyber-stat-icon-blue {
          background: rgba(6, 182, 212, 0.1);
          color: rgb(6, 182, 212);
        }
        
        .cyber-stat-icon-purple {
          background: rgba(124, 58, 237, 0.1);
          color: rgb(124, 58, 237);
        }
        
        .cyber-stat-icon-green {
          background: rgba(16, 185, 129, 0.1);
          color: rgb(16, 185, 129);
        }
        
        .cyber-stat-icon-orange {
          background: rgba(245, 158, 11, 0.1);
          color: rgb(245, 158, 11);
        }
        
        .cyber-stat-info {
          flex: 1;
        }
        
        .cyber-stat-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
          line-height: 1.25;
        }
        
        .cyber-stat-value-text {
          font-size: 0.875rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .cyber-stat-label {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.6);
        }
        
        /* Charts */
        .cyber-charts-container {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(6, 182, 212, 0.1);
          border-radius: 0.375rem;
          padding: 1rem;
        }
        
        .cyber-charts-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .cyber-chart-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-chart-legend {
          display: flex;
          gap: 1rem;
        }
        
        .cyber-legend-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
        }
        
        .cyber-legend-color {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
        }
        
        .cyber-legend-blue {
          background: rgb(6, 182, 212);
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.5);
        }
        
        .cyber-legend-purple {
          background: rgb(124, 58, 237);
          box-shadow: 0 0 8px rgba(124, 58, 237, 0.5);
        }
        
        .cyber-legend-green {
          background: rgb(16, 185, 129);
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
        }
        
        .cyber-legend-orange {
          background: rgb(245, 158, 11);
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
        }
        
        .cyber-charts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        
        .cyber-chart-container {
          height: 180px;
          position: relative;
          padding-bottom: 1.5rem;
        }
        
        .cyber-chart {
          width: 100%;
          height: 100%;
          position: relative;
        }
        
        .cyber-chart-bars {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 140px;
          position: relative;
          z-index: 1;
        }
        
        .cyber-chart-bar-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          flex: 1;
        }
        
        .cyber-chart-bar {
          width: 75%;
          min-width: 12px;
          max-width: 24px;
          background: rgba(6, 182, 212, 0.7);
          border-radius: 2px;
          position: relative;
          transition: height 1s ease-out;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }
        
        .cyber-chart-bar-blue {
          background: rgba(6, 182, 212, 0.7);
        }
        
        .cyber-chart-bar-purple {
          background: rgba(124, 58, 237, 0.7);
        }
        
        .cyber-chart-bar-green {
          background: rgba(16, 185, 129, 0.7);
        }
        
        .cyber-chart-bar-orange {
          background: rgba(245, 158, 11, 0.7);
        }
        
        .cyber-chart-value {
          position: absolute;
          top: -20px;
          font-size: 0.625rem;
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-chart-label {
          font-size: 0.625rem;
          color: rgba(226, 232, 240, 0.6);
          margin-top: 0.25rem;
          white-space: nowrap;
          transform: rotate(-45deg);
          transform-origin: center;
          position: absolute;
          bottom: -1.5rem;
        }
        
        .cyber-chart-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        
        .cyber-chart-grid-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(226, 232, 240, 0.1);
        }
        
        .cyber-chart-grid-label {
          position: absolute;
          left: 0.25rem;
          top: -0.5rem;
          font-size: 0.625rem;
          color: rgba(226, 232, 240, 0.5);
        }
        
        /* Strength & Improvement Areas */
        .cyber-strength-list,
        .cyber-improvement-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .cyber-strength-item,
        .cyber-improvement-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .cyber-strength-bullet,
        .cyber-improvement-bullet {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        .cyber-strength-bullet {
          background: rgb(16, 185, 129);
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
        }
        
        .cyber-improvement-bullet {
          background: rgb(245, 158, 11);
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
        }
        
        .cyber-strength-content,
        .cyber-improvement-content {
          flex: 1;
        }
        
        .cyber-strength-text,
        .cyber-improvement-text {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 0.25rem;
        }
        
        .cyber-strength-bar,
        .cyber-improvement-bar {
          width: 100%;
          height: 0.375rem;
          background: rgba(15, 23, 42, 0.6);
          border-radius: 0.25rem;
          overflow: hidden;
        }
        
        .cyber-strength-fill {
          height: 100%;
          background: rgba(16, 185, 129, 0.6);
          border-radius: 0.25rem;
        }
        
        .cyber-improvement-fill {
          height: 100%;
          background: rgba(245, 158, 11, 0.6);
          border-radius: 0.25rem;
        }
        
        /* Interview History */
        .cyber-interviews-list {
          max-height: 600px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(6, 182, 212, 0.5) rgba(15, 23, 42, 0.3);
          padding-right: 0.5rem;
        }
        
        .cyber-interviews-list::-webkit-scrollbar {
          width: 4px;
        }
        
        .cyber-interviews-list::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 2px;
        }
        
        .cyber-interviews-list::-webkit-scrollbar-thumb {
          background-color: rgba(6, 182, 212, 0.5);
          border-radius: 2px;
        }
        
        .cyber-interview-card {
          position: relative;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          padding: 1rem;
          transition: all 0.3s;
        }
        
        .cyber-interview-card:hover {
          border-color: rgba(6, 182, 212, 0.4);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.1);
          transform: translateY(-2px);
        }
        
        .cyber-interview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        
        .cyber-interview-date {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.6);
          font-family: 'JetBrains Mono', monospace;
        }
        
        .cyber-interview-type {
          font-size: 0.625rem;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
        }
        
        .cyber-interview-type-technical {
          background: rgba(6, 182, 212, 0.2);
          color: rgb(6, 182, 212);
          border: 1px solid rgba(6, 182, 212, 0.4);
        }
        
        .cyber-interview-type-behavioral {
          background: rgba(16, 185, 129, 0.2);
          color: rgb(16, 185, 129);
          border: 1px solid rgba(16, 185, 129, 0.4);
        }
        
        .cyber-interview-role {
          display: flex;
          align-items: center;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 0.75rem;
        }
        
        .cyber-interview-stats {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        
        .cyber-interview-stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .cyber-stat-name {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
          width: 5.5rem;
          flex-shrink: 0;
        }
        
        .cyber-stat-progress {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }
        
        .cyber-stat-bar {
          flex: 1;
          height: 0.375rem;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 0.25rem;
          overflow: hidden;
        }
        
        .cyber-stat-fill {
          height: 100%;
          border-radius: 0.25rem;
          transition: width 1s ease-out;
        }
        
        .cyber-stat-fill-blue {
          background: rgb(6, 182, 212);
        }
        
        .cyber-stat-fill-purple {
          background: rgb(124, 58, 237);
        }
        
        .cyber-stat-fill-green {
          background: rgb(16, 185, 129);
        }
        
        .cyber-stat-fill-orange {
          background: rgb(245, 158, 11);
        }
        
        .cyber-stat-fill-high {
          background: rgb(16, 185, 129);
        }
        
        .cyber-stat-fill-medium {
          background: rgb(245, 158, 11);
        }
        
        .cyber-stat-fill-low {
          background: rgb(239, 68, 68);
        }
        
        .cyber-stat-percentage {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.9);
          font-family: 'JetBrains Mono', monospace;
          width: 2.5rem;
          text-align: right;
        }
        
        .cyber-interview-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        
        .cyber-interview-meta-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
        }
        
        .cyber-interview-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 0.5rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.25rem;
          color: rgb(6, 182, 212);
          font-size: 0.75rem;
          transition: all 0.3s;
        }
        
        .cyber-interview-button:hover {
          background: rgba(6, 182, 212, 0.1);
          border-color: rgba(6, 182, 212, 0.4);
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

        /* Resource Items */
        .cyber-resource-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          padding: 0.75rem;
          transition: all 0.3s;
        }
        
        .cyber-resource-item:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.4);
          transform: translateY(-2px);
        }
        
        .cyber-resource-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 0.375rem;
          flex-shrink: 0;
        }
        
        .cyber-resource-icon-blue {
          background: rgba(6, 182, 212, 0.1);
          color: rgb(6, 182, 212);
        }
        
        .cyber-resource-icon-purple {
          background: rgba(124, 58, 237, 0.1);
          color: rgb(124, 58, 237);
        }
        
        .cyber-resource-icon-green {
          background: rgba(16, 185, 129, 0.1);
          color: rgb(16, 185, 129);
        }
        
        .cyber-resource-content {
          flex: 1;
        }
        
        .cyber-resource-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 0.25rem;
        }
        
        .cyber-resource-description {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
        }
        
        .cyber-resource-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.2);
          color: rgb(6, 182, 212);
          transition: all 0.3s;
          flex-shrink: 0;
        }
        
        .cyber-resource-button:hover {
          background: rgba(6, 182, 212, 0.1);
          border-color: rgba(6, 182, 212, 0.4);
          transform: scale(1.1);
        }
        
        /* Modal */
        .cyber-modal {
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          width: 90%;
          max-width: 600px;
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
        }
        
        .cyber-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(6, 182, 212, 0.2);
        }
        
        .cyber-modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: rgb(6, 182, 212);
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
        }
        
        .cyber-modal-content {
          padding: 1.5rem;
        }
        
        .cyber-modal-info {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .cyber-modal-info-item {
          display: flex;
          flex-direction: column;
        }
        
        .cyber-modal-label {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.6);
        }
        
        .cyber-modal-value {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.9);
          font-weight: 500;
        }
        
        .cyber-modal-badge {
          display: inline-block;
          padding: 0.125rem 0.375rem;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.25rem;
          font-size: 0.75rem;
          color: rgb(6, 182, 212);
          text-transform: capitalize;
        }
        
        .cyber-modal-scores {
          margin-bottom: 1.5rem;
        }
        
        .cyber-modal-subtitle {
          font-size: 1rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 0.75rem;
        }
        
        .cyber-modal-metric {
          margin-bottom: 0.75rem;
        }
        
        .cyber-modal-metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.375rem;
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
        }
        
        .cyber-modal-metric-value {
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-modal-metric-bar {
          width: 100%;
          height: 0.5rem;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 0.25rem;
          overflow: hidden;
        }
        
        .cyber-modal-metric-fill {
          height: 100%;
          border-radius: 0.25rem;
          transition: width 1s ease-out;
        }
        
        .cyber-modal-message {
          padding: 0.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.7);
          font-style: italic;
        }
        
        .cyber-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(6, 182, 212, 0.2);
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

// Helper function to determine score class for color coding
const getScoreClass = (score) => {
  if (score >= 80) return 'cyber-stat-fill-high';
  if (score >= 60) return 'cyber-stat-fill-medium';
  return 'cyber-stat-fill-low';
};

export default InterviewAnalytics;