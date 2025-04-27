import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';


// Bias Analytics Dashboard Component
const BiasAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [activeTool, setActiveTool] = useState('overview');
  const [activeTab, setActiveTab] = useState('detection');
  const [timeframe, setTimeframe] = useState('30d');
  const [isExpanded, setIsExpanded] = useState(false);
  const statsRef = useRef(null);

  // Generate pulse animation for stats when they come into view
  useEffect(() => {
    if (analyticsData && statsRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('stats-appear');
            }
          });
        },
        { threshold: 0.1 }
      );
      
      const statElements = statsRef.current.querySelectorAll('.nova-stat-card');
      statElements.forEach((el) => observer.observe(el));
      
      return () => {
        statElements.forEach((el) => observer.unobserve(el));
      };
    }
  }, [analyticsData]);

  // Colors for charts
  const COLORS = [
    '#06B6D4', // cyan
    '#8B5CF6', // purple
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#EC4899', // pink
    '#6366F1', // indigo
    '#14B8A6'  // teal
  ];
  
  const CYBER_GRADIENTS = [
    ['#06B6D4', '#3B82F6'], // cyan to blue
    ['#8B5CF6', '#D946EF'], // purple to fuchsia
    ['#06B6D4', '#10B981'], // cyan to emerald
    ['#F59E0B', '#EF4444'], // amber to red
    ['#EF4444', '#EC4899'], // red to pink
    ['#8B5CF6', '#6366F1'], // purple to indigo
    ['#14B8A6', '#10B981'], // teal to emerald
    ['#F59E0B', '#F97316']  // amber to orange
  ];

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API fetch with setTimeout and add loading animation
    setLoading(true);
    setTimeout(() => {
      // Mock analytics data
      const mockData = {
        success: true,
        summary: {
          totalMessages: 15782,
          biasedMessages: 3254,
          redirectedMessages: 2128,
          uniqueUsers: 4562,
          biasRate: 0.206,
          redirectionRate: 0.654,
          processingPower: 98.7,
          neuralAccuracy: 99.2
        },
        biasAnalytics: [
          { _id: 'Gender Bias', count: 985, redirected: 772, averageScore: 7.5 },
          { _id: 'Racial Bias', count: 876, redirected: 634, averageScore: 8.2 },
          { _id: 'Age Bias', count: 523, redirected: 312, averageScore: 6.7 },
          { _id: 'Ability Bias', count: 476, redirected: 225, averageScore: 5.9 },
          { _id: 'Cultural Bias', count: 394, redirected: 185, averageScore: 6.1 }
        ],
        intentAnalytics: [
          { _id: 'Education', count: 4215 },
          { _id: 'Employment', count: 3456 },
          { _id: 'Social Media', count: 2879 },
          { _id: 'Healthcare', count: 2541 },
          { _id: 'Other', count: 2691 }
        ],
        biasEffectiveness: {
          total: 2128,
          withFollowUp: 1756,
          followUpNoBias: 1281,
          effectivenessRate: 0.729,
          byCategory: [
            { category: 'Gender Bias', total: 772, withFollowUp: 654, followUpNoBias: 486, effectivenessRate: 0.743 },
            { category: 'Racial Bias', total: 634, withFollowUp: 540, followUpNoBias: 402, effectivenessRate: 0.744 },
            { category: 'Age Bias', total: 312, withFollowUp: 246, followUpNoBias: 167, effectivenessRate: 0.679 },
            { category: 'Ability Bias', total: 225, withFollowUp: 172, followUpNoBias: 114, effectivenessRate: 0.663 },
            { category: 'Cultural Bias', total: 185, withFollowUp: 144, followUpNoBias: 112, effectivenessRate: 0.778 }
          ]
        },
        neuralMetrics: {
          processingTime: [
            { day: '04-01', value: 12 },
            { day: '04-02', value: 18 },
            { day: '04-03', value: 16 },
            { day: '04-04', value: 12 },
            { day: '04-05', value: 15 },
            { day: '04-06', value: 11 },
            { day: '04-07', value: 10 }
          ],
          detectionAccuracy: [
            { name: 'Gender', value: 97 },
            { name: 'Race', value: 98 },
            { name: 'Age', value: 94 },
            { name: 'Ability', value: 92 },
            { name: 'Culture', value: 91 }
          ],
          predictiveInsights: [
            { factor: 'Time of day', correlation: 0.76 },
            { factor: 'User demographics', correlation: 0.82 },
            { factor: 'Content topic', correlation: 0.91 },
            { factor: 'Platform', correlation: 0.64 },
            { factor: 'Previous interactions', correlation: 0.88 }
          ]
        }
      };
      
      setAnalyticsData(mockData);
      setLoading(false);
    }, 1500); // Simulate loading delay
  }, [dateRange, timeframe]);

  // Handle date range changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Generate historical trend data
  const generateBiasOverTimeData = () => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        biasCount: Math.floor(Math.random() * 30) + 70 + (i/2), // Slightly upward trend
        redirected: Math.floor(Math.random() * 20) + 50 + (i/3) // Slightly upward trend
      };
    });
  };

  // If loading
  if (loading) {
    return (
      <div className="nova-analytics-dashboard">
        <div className="nova-dashboard-header">
          <div className="nova-header-content">
            <h1>Neural Bias Analytics Platform <span className="nova-blink">_</span></h1>
            <p className="nova-header-subtitle">Quantum-powered bias detection and mitigation analytics</p>
          </div>
          
          <div className="nova-date-filters">
            <div className="nova-date-range">
              <label>From:</label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="nova-date-input"
              />
            </div>
            
            <div className="nova-date-range">
              <label>To:</label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="nova-date-input"
              />
            </div>
          </div>
        </div>
        
        <div className="nova-timeframe-selector">
          <button 
            className={`nova-timeframe-button ${timeframe === '7d' ? 'nova-active-timeframe' : ''}`}
            onClick={() => setTimeframe('7d')}
          >
            7D
          </button>
          <button 
            className={`nova-timeframe-button ${timeframe === '30d' ? 'nova-active-timeframe' : ''}`}
            onClick={() => setTimeframe('30d')}
          >
            30D
          </button>
          <button 
            className={`nova-timeframe-button ${timeframe === '90d' ? 'nova-active-timeframe' : ''}`}
            onClick={() => setTimeframe('90d')}
          >
            90D
          </button>
          <button 
            className={`nova-timeframe-button ${timeframe === '1y' ? 'nova-active-timeframe' : ''}`}
            onClick={() => setTimeframe('1y')}
          >
            1Y
          </button>
        </div>
        
        <div className="nova-analytics-loading">
          <div className="nova-neural-loader">
            <div className="nova-loader-brain">
              <div className="nova-brain-hemisphere left"></div>
              <div className="nova-brain-hemisphere right"></div>
              <div className="nova-synapse s1"></div>
              <div className="nova-synapse s2"></div>
              <div className="nova-synapse s3"></div>
              <div className="nova-synapse s4"></div>
              <div className="nova-synapse s5"></div>
            </div>
            <div className="nova-loader-progress">
              <div className="nova-progress-bar"></div>
            </div>
          </div>
          <div className="nova-loading-text">
            <span>Neural Network Processing</span>
            <div className="nova-loading-stats">
              <div className="nova-loading-stat">
                <span className="nova-stat-label">Training Models</span>
                <span className="nova-stat-value">98.2%</span>
              </div>
              <div className="nova-loading-stat">
                <span className="nova-stat-label">Data Synchronization</span>
                <span className="nova-stat-value">87.4%</span>
              </div>
              <div className="nova-loading-stat">
                <span className="nova-stat-label">Quantum Verification</span>
                <span className="nova-stat-value">76.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no data
  if (!analyticsData) {
    return (
      <div className="nova-analytics-dashboard">
        <div className="nova-dashboard-header">
          <h1>Neural Bias Analytics Platform</h1>
        </div>
        
        <div className="nova-analytics-error">
          <div className="nova-error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="nova-error-text">Neural Interface Disconnected</div>
          <div className="nova-error-subtext">No analytics data available. Verify quantum connection and retry.</div>
          <button className="nova-error-retry-button">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reinitialize Connection
          </button>
        </div>
      </div>
    );
  }

  // Format data for charts
  const biasCategoryData = analyticsData.biasAnalytics;
  const intentData = analyticsData.intentAnalytics;
  const biasOverTimeData = generateBiasOverTimeData();
  const effectivenessData = [
    { name: 'Effective', value: analyticsData.biasEffectiveness.followUpNoBias },
    { name: 'Not Effective', value: analyticsData.biasEffectiveness.withFollowUp - analyticsData.biasEffectiveness.followUpNoBias },
    { name: 'No Follow-up', value: analyticsData.biasEffectiveness.total - analyticsData.biasEffectiveness.withFollowUp }
  ];

  return (
    <div className="nova-analytics-dashboard">
      <div className="nova-dashboard-header">
        <div className="nova-header-content">
          <h1>Neural Bias Analytics Platform <span className="nova-blink">_</span></h1>
          <p className="nova-header-subtitle">Quantum-powered bias detection and mitigation analytics</p>
        </div>
        
        <div className="nova-date-filters">
          <div className="nova-date-range">
            <label>From:</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="nova-date-input"
            />
          </div>
          
          <div className="nova-date-range">
            <label>To:</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="nova-date-input"
            />
          </div>
          
          <button 
            onClick={() => setLoading(true)}
            className="nova-refresh-button"
          >
            <div className="nova-btn-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span>Synchronize</span>
            <div className="nova-btn-pulse"></div>
          </button>
        </div>
      </div>
      
      <div className="nova-timeframe-selector">
        <button 
          className={`nova-timeframe-button ${timeframe === '7d' ? 'nova-active-timeframe' : ''}`}
          onClick={() => setTimeframe('7d')}
        >
          7D
        </button>
        <button 
          className={`nova-timeframe-button ${timeframe === '30d' ? 'nova-active-timeframe' : ''}`}
          onClick={() => setTimeframe('30d')}
        >
          30D
        </button>
        <button 
          className={`nova-timeframe-button ${timeframe === '90d' ? 'nova-active-timeframe' : ''}`}
          onClick={() => setTimeframe('90d')}
        >
          90D
        </button>
        <button 
          className={`nova-timeframe-button ${timeframe === '1y' ? 'nova-active-timeframe' : ''}`}
          onClick={() => setTimeframe('1y')}
        >
          1Y
        </button>
        
        <div className="nova-timeframe-divider"></div>
        
        <div className="nova-view-selector">
          <button
            className={`nova-view-button ${isExpanded ? 'nova-active-view' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isExpanded ? "M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" : "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"} />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="nova-analytics-tools">
        <div className="nova-tools-primary">
          <button 
            className={`nova-tool-button ${activeTool === 'overview' ? 'nova-active-tool' : ''}`}
            onClick={() => setActiveTool('overview')}
          >
            <div className="nova-tool-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`nova-tool-button ${activeTool === 'categories' ? 'nova-active-tool' : ''}`}
            onClick={() => setActiveTool('categories')}
          >
            <div className="nova-tool-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <span>Bias Categories</span>
          </button>
          
          <button 
            className={`nova-tool-button ${activeTool === 'effectiveness' ? 'nova-active-tool' : ''}`}
            onClick={() => setActiveTool('effectiveness')}
          >
            <div className="nova-tool-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span>Effectiveness</span>
          </button>
          
          <button 
            className={`nova-tool-button ${activeTool === 'trends' ? 'nova-active-tool' : ''}`}
            onClick={() => setActiveTool('trends')}
          >
            <div className="nova-tool-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span>Trends</span>
          </button>
          
          <button 
            className={`nova-tool-button ${activeTool === 'neural' ? 'nova-active-tool' : ''}`}
            onClick={() => setActiveTool('neural')}
          >
            <div className="nova-tool-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <span>Neural Metrics</span>
          </button>
        </div>
        
        <div className="nova-tools-secondary">
          {activeTool === 'neural' && (
            <>
              <button 
                className={`nova-tab-button ${activeTab === 'detection' ? 'nova-active-tab' : ''}`}
                onClick={() => setActiveTab('detection')}
              >
                Detection
              </button>
              <button 
                className={`nova-tab-button ${activeTab === 'processing' ? 'nova-active-tab' : ''}`}
                onClick={() => setActiveTab('processing')}
              >
                Processing
              </button>
              <button 
                className={`nova-tab-button ${activeTab === 'prediction' ? 'nova-active-tab' : ''}`}
                onClick={() => setActiveTab('prediction')}
              >
                Prediction
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="nova-analytics-content">
        {/* Overview Panel */}
        {activeTool === 'overview' && (
          <div className={`nova-overview-panel ${isExpanded ? 'expanded' : ''}`}>
            <div ref={statsRef} className="nova-stats-grid">
              <div className="nova-stat-card">
                <div className="nova-stat-header">
                  <div className="nova-stat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="nova-stat-name">Total Messages</div>
                </div>
                <div className="nova-stat-value">
                  <CountUp value={analyticsData.summary.totalMessages} />
                </div>
                <div className="nova-stat-chart">
                  <div className="nova-mini-chart">
                    <div className="nova-chart-bar" style={{height: '70%'}}></div>
                    <div className="nova-chart-bar" style={{height: '60%'}}></div>
                    <div className="nova-chart-bar" style={{height: '80%'}}></div>
                    <div className="nova-chart-bar" style={{height: '90%'}}></div>
                    <div className="nova-chart-bar" style={{height: '75%'}}></div>
                    <div className="nova-chart-bar highlight" style={{height: '100%'}}></div>
                  </div>
                </div>
                <div className="nova-stat-trend positive">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>+12.3%</span>
                </div>
              </div>
              
              <div className="nova-stat-card">
                <div className="nova-stat-header">
                  <div className="nova-stat-icon warning">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="nova-stat-name">Biased Messages</div>
                </div>
                <div className="nova-stat-value">
                  <CountUp value={analyticsData.summary.biasedMessages} />
                </div>
                <div className="nova-stat-chart">
                  <div className="nova-mini-chart">
                    <div className="nova-chart-bar" style={{height: '50%'}}></div>
                    <div className="nova-chart-bar" style={{height: '70%'}}></div>
                    <div className="nova-chart-bar" style={{height: '60%'}}></div>
                    <div className="nova-chart-bar" style={{height: '80%'}}></div>
                    <div className="nova-chart-bar" style={{height: '90%'}}></div>
                    <div className="nova-chart-bar highlight" style={{height: '85%'}}></div>
                  </div>
                </div>
                <div className="nova-stat-trend negative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                  </svg>
                  <span>-3.7%</span>
                </div>
              </div>
              
              <div className="nova-stat-card">
                <div className="nova-stat-header">
                  <div className="nova-stat-icon success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                  <div className="nova-stat-name">Redirected</div>
                </div>
                <div className="nova-stat-value">
                  <CountUp value={analyticsData.summary.redirectedMessages} />
                </div>
                <div className="nova-stat-chart">
                  <div className="nova-mini-chart">
                    <div className="nova-chart-bar" style={{height: '40%'}}></div>
                    <div className="nova-chart-bar" style={{height: '60%'}}></div>
                    <div className="nova-chart-bar" style={{height: '75%'}}></div>
                    <div className="nova-chart-bar" style={{height: '65%'}}></div>
                    <div className="nova-chart-bar" style={{height: '85%'}}></div>
                    <div className="nova-chart-bar highlight" style={{height: '95%'}}></div>
                  </div>
                </div>
                <div className="nova-stat-trend positive">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>+8.9%</span>
                </div>
              </div>
              
              <div className="nova-stat-card">
                <div className="nova-stat-header">
                  <div className="nova-stat-icon info">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="nova-stat-name">Unique Users</div>
                </div>
                <div className="nova-stat-value">
                  <CountUp value={analyticsData.summary.uniqueUsers} />
                </div>
                <div className="nova-stat-chart">
                  <div className="nova-mini-chart">
                    <div className="nova-chart-bar" style={{height: '80%'}}></div>
                    <div className="nova-chart-bar" style={{height: '75%'}}></div>
                    <div className="nova-chart-bar" style={{height: '85%'}}></div>
                    <div className="nova-chart-bar" style={{height: '90%'}}></div>
                    <div className="nova-chart-bar" style={{height: '95%'}}></div>
                    <div className="nova-chart-bar highlight" style={{height: '100%'}}></div>
                  </div>
                </div>
                <div className="nova-stat-trend positive">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>+15.2%</span>
                </div>
              </div>
            </div>
            
            <div className="nova-advanced-metrics">
              <div className="nova-metric-card">
                <div className="nova-metric-header">
                  <h3>Bias Rate</h3>
                  <div className="nova-metric-badge warning">
                    <span>{(analyticsData.summary.biasRate * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="nova-circle-progress">
                  <svg viewBox="0 0 100 100" className="nova-progress-ring">
                    <circle className="nova-progress-ring-bg" cx="50" cy="50" r="45"></circle>
                    <circle 
                      className="nova-progress-ring-circle warning" 
                      cx="50" 
                      cy="50" 
                      r="45"
                      style={{
                        strokeDasharray: `${2 * Math.PI * 45}`,
                        strokeDashoffset: `${2 * Math.PI * 45 * (1 - analyticsData.summary.biasRate)}`
                      }}
                    ></circle>
                    <text x="50" y="55" className="nova-progress-text">{(analyticsData.summary.biasRate * 100).toFixed(1)}%</text>
                  </svg>
                </div>
                <div className="nova-metric-footer">
                  <span>Previous: 24.3%</span>
                  <div className="nova-trend-indicator negative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                    </svg>
                    <span>-3.7%</span>
                  </div>
                </div>
              </div>
              
              <div className="nova-metric-card">
                <div className="nova-metric-header">
                  <h3>Redirection Rate</h3>
                  <div className="nova-metric-badge success">
                    <span>{(analyticsData.summary.redirectionRate * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="nova-circle-progress">
                  <svg viewBox="0 0 100 100" className="nova-progress-ring">
                    <circle className="nova-progress-ring-bg" cx="50" cy="50" r="45"></circle>
                    <circle 
                      className="nova-progress-ring-circle success" 
                      cx="50" 
                      cy="50" 
                      r="45"
                      style={{
                        strokeDasharray: `${2 * Math.PI * 45}`,
                        strokeDashoffset: `${2 * Math.PI * 45 * (1 - analyticsData.summary.redirectionRate)}`
                      }}
                    ></circle>
                    <text x="50" y="55" className="nova-progress-text">{(analyticsData.summary.redirectionRate * 100).toFixed(1)}%</text>
                  </svg>
                </div>
                <div className="nova-metric-footer">
                  <span>Previous: 58.2%</span>
                  <div className="nova-trend-indicator positive">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>+7.2%</span>
                  </div>
                </div>
              </div>
              
              <div className="nova-metric-card">
                <div className="nova-metric-header">
                  <h3>Neural Processing</h3>
                  <div className="nova-metric-badge">
                    <span>{analyticsData.summary.processingPower}%</span>
                  </div>
                </div>
                <div className="nova-circle-progress">
                  <svg viewBox="0 0 100 100" className="nova-progress-ring">
                    <circle className="nova-progress-ring-bg" cx="50" cy="50" r="45"></circle>
                    <circle 
                      className="nova-progress-ring-circle" 
                      cx="50" 
                      cy="50" 
                      r="45"
                      style={{
                        strokeDasharray: `${2 * Math.PI * 45}`,
                        strokeDashoffset: `${2 * Math.PI * 45 * (1 - analyticsData.summary.processingPower/100)}`
                      }}
                    ></circle>
                    <text x="50" y="55" className="nova-progress-text">{analyticsData.summary.processingPower}%</text>
                  </svg>
                </div>
                <div className="nova-metric-footer">
                  <span>Optimal: 95.0%</span>
                  <div className="nova-trend-indicator positive">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>+3.7%</span>
                  </div>
                </div>
              </div>
              
              <div className="nova-metric-card">
                <div className="nova-metric-header">
                  <h3>Detection Accuracy</h3>
                  <div className="nova-metric-badge success">
                    <span>{analyticsData.summary.neuralAccuracy}%</span>
                  </div>
                </div>
                <div className="nova-circle-progress">
                  <svg viewBox="0 0 100 100" className="nova-progress-ring">
                    <circle className="nova-progress-ring-bg" cx="50" cy="50" r="45"></circle>
                    <circle 
                      className="nova-progress-ring-circle success" 
                      cx="50" 
                      cy="50" 
                      r="45"
                      style={{
                        strokeDasharray: `${2 * Math.PI * 45}`,
                        strokeDashoffset: `${2 * Math.PI * 45 * (1 - analyticsData.summary.neuralAccuracy/100)}`
                      }}
                    ></circle>
                    <text x="50" y="55" className="nova-progress-text">{analyticsData.summary.neuralAccuracy}%</text>
                  </svg>
                </div>
                <div className="nova-metric-footer">
                  <span>Previous: 97.8%</span>
                  <div className="nova-trend-indicator positive">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>+1.4%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="nova-chart-grid">
              <div className="nova-chart-container">
                <div className="nova-chart-header">
                  <h3>Bias Categories Distribution</h3>
                  <div className="nova-chart-controls">
                    <div className="nova-chart-badge">5 Categories</div>
                    <button className="nova-chart-button">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </button>
                    <button className="nova-chart-button">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="nova-chart-content">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <defs>
                        {CYBER_GRADIENTS.map((gradient, index) => (
                          <linearGradient key={index} id={`pieColorGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={gradient[0]} />
                            <stop offset="100%" stopColor={gradient[1]} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={biasCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={90}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="count"
                        paddingAngle={2}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {biasCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#pieColorGradient${index})`} stroke="rgba(15, 23, 42, 0.9)" />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [`${value} (${((value / analyticsData.summary.biasedMessages) * 100).toFixed(1)}%)`, props.payload._id]}
                        contentStyle={{
                          background: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          borderRadius: '0.375rem',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="nova-chart-container">
                <div className="nova-chart-header">
                  <h3>Intent Categories</h3>
                  <div className="nova-chart-controls">
                    <div className="nova-chart-badge">Top 5</div>
                    <button className="nova-chart-button">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </button>
                    <button className="nova-chart-button">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="nova-chart-content">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={intentData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                      barGap={8}
                      barCategoryGap={16}
                    >
                      <defs>
                        <linearGradient id="barColorGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#06B6D4" />
                          <stop offset="100%" stopColor="#3B82F6" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.1)" />
                      <XAxis 
                        type="number" 
                        stroke="rgba(226, 232, 240, 0.6)"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="_id" 
                        stroke="rgba(226, 232, 240, 0.6)"
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} messages`, 'Count']}
                        contentStyle={{
                          background: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          borderRadius: '0.375rem',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        name="Messages" 
                        fill="url(#barColorGradient)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="nova-trend-panel">
              <div className="nova-chart-header">
                <h3>Bias Detection Trend</h3>
                <div className="nova-chart-controls">
                  <div className="nova-chart-badge">Last 30 Days</div>
                  <button className="nova-chart-button">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </button>
                    <button className="nova-chart-button">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="nova-chart-content">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={biasOverTimeData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="biasGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="redirectGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(226, 232, 240, 0.6)"
                      tickLine={false}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                      }}
                    />
                    <YAxis 
                      stroke="rgba(226, 232, 240, 0.6)"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return `Date: ${date.toLocaleDateString()}`;
                      }}
                      contentStyle={{
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        borderRadius: '0.375rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Legend 
                      iconType="circle"
                      wrapperStyle={{
                        paddingTop: 10
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="biasCount" 
                      name="Bias Detected" 
                      stroke="#06B6D4" 
                      fillOpacity={1}
                      fill="url(#biasGradient)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="redirected" 
                      name="Redirected" 
                      stroke="#10B981" 
                      fillOpacity={1}
                      fill="url(#redirectGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
        )}
        
        {/* Bias Categories Panel */}
        {activeTool === 'categories' && (
          <div className="nova-categories-panel">
            <div className="nova-panel-heading">
              <h2>Neural Bias Category Analysis</h2>
              <p>Detailed breakdown of detected bias patterns by category with severity and redirection metrics</p>
            </div>
            
            <div className="nova-bias-chart-container">
              <div className="nova-chart-header">
                <h3>Bias Categories Comparison</h3>
                <div className="nova-chart-controls">
                  <div className="nova-chart-badge">Multidimensional</div>
                  <button className="nova-chart-button">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="nova-chart-content">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={biasCategoryData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    barCategoryGap={20}
                  >
                    <defs>
                      <linearGradient id="detectedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06B6D4" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                      <linearGradient id="redirectedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="severityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#6D28D9" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.1)" />
                    <XAxis 
                      dataKey="_id" 
                      stroke="rgba(226, 232, 240, 0.6)"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      yAxisId="left" 
                      orientation="left" 
                      stroke="#06B6D4" 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      stroke="#8B5CF6" 
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 10]}
                    />
                    <Tooltip 
                      contentStyle={{
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        borderRadius: '0.375rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Legend 
                      iconType="circle"
                      wrapperStyle={{
                        paddingTop: 10
                      }}
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="count" 
                      name="Detected" 
                      fill="url(#detectedGradient)" 
                      radius={[4, 4, 0, 0]}
                      barSize={28}
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="redirected" 
                      name="Redirected" 
                      fill="url(#redirectedGradient)" 
                      radius={[4, 4, 0, 0]}
                      barSize={28}
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="averageScore" 
                      name="Avg. Severity" 
                      fill="url(#severityGradient)" 
                      radius={[4, 4, 0, 0]}
                      barSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="nova-bias-table">
              <div className="nova-table-header">
                <h3>Neural Bias Category Metrics</h3>
                <div className="nova-table-controls">
                  <button className="nova-table-button">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filter
                  </button>
                  <button className="nova-table-button">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
              </div>
              <div className="nova-table-container">
                <table className="nova-data-table">
                  <thead>
                    <tr>
                      <th className="nova-col-category">Category</th>
                      <th className="nova-col-count">Count</th>
                      <th className="nova-col-redirected">Redirected</th>
                      <th className="nova-col-rate">Redirection Rate</th>
                      <th className="nova-col-severity">Avg. Severity</th>
                      <th className="nova-col-trend">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {biasCategoryData.map((category, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'nova-row-alt' : ''}>
                        <td>
                          <div className="nova-category-cell">
                            <div className="nova-category-icon" style={{background: COLORS[index % COLORS.length]}}>
                              {category._id.charAt(0)}
                            </div>
                            <span>{category._id}</span>
                          </div>
                        </td>
                        <td>
                          <span className="nova-count-value">{category.count}</span>
                        </td>
                        <td>
                          <span className="nova-redirected-value">{category.redirected}</span>
                        </td>
                        <td>
                          <div className="nova-rate-cell">
                            <div className="nova-rate-bar">
                              <div 
                                className="nova-rate-fill"
                                style={{
                                  width: `${(category.redirected / category.count) * 100}%`,
                                  background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]} 0%, ${COLORS[(index + 1) % COLORS.length]} 100%)`
                                }}
                              ></div>
                            </div>
                            <span className="nova-rate-value">{((category.redirected / category.count) * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                        <td>
                          <div className="nova-severity-cell">
                            <div 
                              className="nova-severity-indicator"
                              style={{
                                background: category.averageScore > 7 ? '#EF4444' : 
                                          category.averageScore > 4 ? '#F59E0B' : '#10B981'
                              }}
                            >
                              <div className="nova-severity-pulse"></div>
                            </div>
                            <div className="nova-severity-bar">
                              <div 
                                className="nova-severity-fill" 
                                style={{ 
                                  width: `${(category.averageScore / 10) * 100}%`,
                                  background: category.averageScore > 7 ? 'linear-gradient(90deg, #EF4444 0%, #F87171 100%)' : 
                                            category.averageScore > 4 ? 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)' : 
                                            'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                                }}
                              ></div>
                            </div>
                            <span className="nova-severity-value">{category.averageScore.toFixed(1)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="nova-trend-cell">
                            <svg 
                              className="nova-trend-sparkline" 
                              width="80" 
                              height="24" 
                              viewBox="0 0 80 24"
                            >
                              <path 
                                d={`M0,${24 - Math.random() * 10} ${Array.from({length: 10}).map((_, i) => {
                                  return `L${i * 8},${Math.max(4, 24 - Math.random() * 20)}`
                                }).join(' ')} L80,4`}
                                fill="none"
                                stroke={category.averageScore > 7 ? '#EF4444' : 
                                        category.averageScore > 4 ? '#F59E0B' : '#10B981'}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className={`nova-trend-indicator ${index % 3 === 0 ? 'negative' : 'positive'}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={index % 3 === 0 ? "M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" : "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"} />
                              </svg>
                              <span>{index % 3 === 0 ? '-' : '+'}
                              {(Math.random() * 10).toFixed(1)}%</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="nova-table-footer">
                <div className="nova-table-info">
                  Showing <span className="nova-highlight">5</span> of <span className="nova-highlight">5</span> categories
                </div>
                <div className="nova-pagination">
                  <button className="nova-page-button" disabled>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="nova-page-current">1</span>
                  <button className="nova-page-button" disabled>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="nova-categories-insights">
              <div className="nova-insight-header">
                <h3>Neural Pattern Analysis</h3>
                <span>AI-generated insights based on detected bias patterns</span>
              </div>
              
              <div className="nova-insights-grid">
                <div className="nova-insight-card">
                  <div className="nova-insight-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="nova-insight-content">
                    <h4>Primary Bias Triggers</h4>
                    <p>Gender bias is most frequently triggered by pronoun usage, especially in career-focused content. Neural detection shows 72% of cases involve stereotyping of career capabilities.</p>
                  </div>
                </div>
                
                <div className="nova-insight-card">
                  <div className="nova-insight-icon warning">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="nova-insight-content">
                    <h4>Severity Analysis</h4>
                    <p>Racial bias has the highest average severity rating at 8.2/10. Linguistic analysis indicates instances often contain coded language and implicit stereotypes requiring complex detection patterns.</p>
                  </div>
                </div>
                
                <div className="nova-insight-card">
                  <div className="nova-insight-icon success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="nova-insight-content">
                    <h4>Mitigation Effectiveness</h4>
                    <p>Cultural bias redirection has the highest success rate at 77.8%. Neural redirection employing cultural context and educational content shows greatest user receptiveness.</p>
                  </div>
                </div>
                
                <div className="nova-insight-card">
                  <div className="nova-insight-icon info">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="nova-insight-content">
                    <h4>Emerging Patterns</h4>
                    <p>Neural pattern recognition has identified an emerging cluster of context-specific biases related to technological capabilities, with 15.3% growth in the last quarter.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Effectiveness Panel */}
        {activeTool === 'effectiveness' && (
          <div className="nova-effectiveness-panel">
            <div className="nova-panel-heading">
              <h2>Neural Redirection Effectiveness</h2>
              <p>Advanced analysis of bias redirection strategies and their impact on subsequent user interactions</p>
            </div>
            
            <div className="nova-effectiveness-grid">
              <div className="nova-effectiveness-metrics">
                <div className="nova-metric-card wider">
                  <div className="nova-metric-header">
                    <h3>Overall Effectiveness Rate</h3>
                    <div className="nova-metric-badge success">
                      <span>{(analyticsData.biasEffectiveness.effectivenessRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="nova-circle-progress large">
                    <svg viewBox="0 0 100 100" className="nova-progress-ring">
                      <circle className="nova-progress-ring-bg" cx="50" cy="50" r="45"></circle>
                      <circle 
                        className="nova-progress-ring-circle success" 
                        cx="50" 
                        cy="50" 
                        r="45"
                        style={{
                          strokeDasharray: `${2 * Math.PI * 45}`,
                          strokeDashoffset: `${2 * Math.PI * 45 * (1 - analyticsData.biasEffectiveness.effectivenessRate)}`
                        }}
                      ></circle>
                      <text x="50" y="45" className="nova-progress-text large">{(analyticsData.biasEffectiveness.effectivenessRate * 100).toFixed(1)}%</text>
                      <text x="50" y="65" className="nova-progress-subtext">Effectiveness</text>
                    </svg>
                  </div>
                  <div className="nova-metric-details">
                    <div className="nova-detail-item">
                      <span className="nova-detail-label">Successful Redirections:</span>
                      <span className="nova-detail-value">{analyticsData.biasEffectiveness.followUpNoBias}</span>
                    </div>
                    <div className="nova-detail-item">
                      <span className="nova-detail-label">Total Interactions:</span>
                      <span className="nova-detail-value">{analyticsData.biasEffectiveness.withFollowUp}</span>
                    </div>
                    <div className="nova-detail-item">
                      <span className="nova-detail-label">Previous Period:</span>
                      <div className="nova-trend-indicator positive">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span>+6.8%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="nova-submetrics-grid">
                  <div className="nova-metric-card">
                    <div className="nova-metric-header">
                      <h3>Follow-up Rate</h3>
                      <div className="nova-metric-badge">
                        <span>{((analyticsData.biasEffectiveness.withFollowUp / analyticsData.biasEffectiveness.total) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="nova-horizontal-progress">
                      <div className="nova-horizontal-bar">
                        <div 
                          className="nova-horizontal-fill" 
                          style={{
                            width: `${(analyticsData.biasEffectiveness.withFollowUp / analyticsData.biasEffectiveness.total) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="nova-metric-detail">
                      <span className="nova-detail-label">Users continuing conversation after redirection</span>
                      <div className="nova-stat-values">
                        <span className="nova-detail-numbers">{analyticsData.biasEffectiveness.withFollowUp}/{analyticsData.biasEffectiveness.total}</span>
                        <span className="nova-detail-percent">({((analyticsData.biasEffectiveness.withFollowUp / analyticsData.biasEffectiveness.total) * 100).toFixed(1)}%)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="nova-metric-card">
                    <div className="nova-metric-header">
                      <h3>Language Improvement</h3>
                      <div className="nova-metric-badge success">
                        <span>{((analyticsData.biasEffectiveness.followUpNoBias / analyticsData.biasEffectiveness.withFollowUp) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="nova-horizontal-progress">
                      <div className="nova-horizontal-bar">
                        <div 
                          className="nova-horizontal-fill success" 
                          style={{
                            width: `${(analyticsData.biasEffectiveness.followUpNoBias / analyticsData.biasEffectiveness.withFollowUp) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="nova-metric-detail">
                      <span className="nova-detail-label">Follow-up messages showing bias elimination</span>
                      <div className="nova-stat-values">
                        <span className="nova-detail-numbers">{analyticsData.biasEffectiveness.followUpNoBias}/{analyticsData.biasEffectiveness.withFollowUp}</span>
                        <span className="nova-detail-percent">({((analyticsData.biasEffectiveness.followUpNoBias / analyticsData.biasEffectiveness.withFollowUp) * 100).toFixed(1)}%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="nova-effectiveness-chart-container">
                <div className="nova-chart-header">
                  <h3>Redirection Outcome Distribution</h3>
                  <div className="nova-chart-controls">
                    <div className="nova-chart-badge">Neural Analysis</div>
                    <button className="nova-chart-button">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="nova-chart-content">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <defs>
                        <linearGradient id="effectiveGradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#34D399" />
                        </linearGradient>
                        <linearGradient id="ineffectiveGradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#EF4444" />
                          <stop offset="100%" stopColor="#F87171" />
                        </linearGradient>
                        <linearGradient id="noFollowupGradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#6B7280" />
                          <stop offset="100%" stopColor="#9CA3AF" />
                        </linearGradient>
                      </defs>
                      <Pie
                        data={effectivenessData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        innerRadius={60}
                        paddingAngle={2}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="url(#effectiveGradient)" stroke="rgba(15, 23, 42, 0.9)" /> {/* Effective */}
                        <Cell fill="url(#ineffectiveGradient)" stroke="rgba(15, 23, 42, 0.9)" /> {/* Not Effective */}
                        <Cell fill="url(#noFollowupGradient)" stroke="rgba(15, 23, 42, 0.9)" /> {/* No Follow-up */}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} messages`, name]}
                        contentStyle={{
                          background: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          borderRadius: '0.375rem',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="nova-category-effectiveness">
              <div className="nova-chart-header full">
                <h3>Effectiveness by Bias Category</h3>
                <div className="nova-chart-controls">
                  <div className="nova-chart-badge">Multidimensional</div>
                  <button className="nova-chart-button">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="nova-chart-content">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={analyticsData.biasEffectiveness.byCategory}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    barGap={8}
                    barCategoryGap={20}
                  >
                    <defs>
                      <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06B6D4" />
                        <stop offset="100%" stopColor="#0891B2" />
                      </linearGradient>
                      <linearGradient id="followUpGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#7C3AED" />
                      </linearGradient>
                      <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#D97706" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.1)" />
                    <XAxis 
                      dataKey="category" 
                      stroke="rgba(226, 232, 240, 0.6)"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      yAxisId="left" 
                      orientation="left" 
                      stroke="#06B6D4" 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      stroke="#F59E0B" 
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 1]}
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'Success Rate') {
                          return [`${(value * 100).toFixed(1)}%`, name];
                        }
                        return [value, name];
                      }}
                      contentStyle={{
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        borderRadius: '0.375rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Legend 
                      iconType="circle"
                      wrapperStyle={{
                        paddingTop: 10
                      }}
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="total" 
                      name="Total Redirections" 
                      fill="url(#totalGradient)" 
                      radius={[4, 4, 0, 0]}
                      barSize={18}
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="withFollowUp" 
                      name="With Follow-up" 
                      fill="url(#followUpGradient)" 
                      radius={[4, 4, 0, 0]}
                      barSize={18}
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="followUpNoBias" 
                      name="Successful" 
                      fill="url(#successGradient)" 
                      radius={[4, 4, 0, 0]}
                      barSize={18}
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="effectivenessRate" 
                      name="Success Rate" 
                      fill="url(#rateGradient)" 
                      radius={[4, 4, 0, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="nova-effectiveness-insights">
              <div className="nova-insight-header">
                <h3>Neural Effectiveness Insights</h3>
                <span>AI-generated analysis of redirection strategies and outcomes</span>
              </div>
              
              <div className="nova-insights-list">
                <div className="nova-insight-item">
                  <div className="nova-insight-marker success"></div>
                  <div className="nova-insight-content">
                    <h4>Most Effective Redirection Strategy</h4>
                    <p>Educational content with concrete examples shows 83% effectiveness. Neural analysis indicates users are most receptive to contextual explanations with specific alternatives.</p>
                  </div>
                </div>
                
                <div className="nova-insight-item">
                  <div className="nova-insight-marker warning"></div>
                  <div className="nova-insight-content">
                    <h4>Improvement Opportunity</h4>
                    <p>Ability bias redirections have the lowest effectiveness at 66.3%. Analysis suggests more relatable examples and clearer explanations would improve user receptiveness.</p>
                  </div>
                </div>
                
                <div className="nova-insight-item">
                  <div className="nova-insight-marker"></div>
                  <div className="nova-insight-content">
                    <h4>User Engagement Pattern</h4>
                    <p>Messages with personalized redirection achieve 27% higher follow-up rates. Neural language models show adaptive responses based on user interaction history significantly improve outcomes.</p>
                  </div>
                </div>
                
                <div className="nova-insight-item">
                  <div className="nova-insight-marker info"></div>
                  <div className="nova-insight-content">
                    <h4>Content Impact</h4>
                    <p>Redirection content under 50 words achieves 12% higher effectiveness rates. Concise, direct explanations with visually distinguishable alternative phrasing show optimal user adoption.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Trends Panel */}
        {activeTool === 'trends' && (
          <div className="nova-trends-panel">
            <div className="nova-panel-heading">
              <h2>Neural Trend Analysis</h2>
              <p>Advanced pattern recognition and prediction of bias detection and mitigation trends</p>
            </div>
            
            <div className="nova-chart-large">
              <div className="nova-chart-header full">
                <h3>Bias Detection Temporal Analysis</h3>
                <div className="nova-chart-controls">
                  <div className="nova-view-selector small">
                    <button className="nova-view-btn active">Daily</button>
                    <button className="nova-view-btn">Weekly</button>
                    <button className="nova-view-btn">Monthly</button>
                  </div>
                  <button className="nova-chart-button">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="nova-chart-content">
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart
                    data={biasOverTimeData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="biasGradientFull" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="redirectGradientFull" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#06B6D4" floodOpacity="0.3"/>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(226, 232, 240, 0.6)"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                      }}
                    />
                    <YAxis 
                      stroke="rgba(226, 232, 240, 0.6)"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return `Date: ${date.toLocaleDateString()}`;
                      }}
                      contentStyle={{
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        borderRadius: '0.375rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Legend 
                      iconType="circle"
                      wrapperStyle={{
                        paddingTop: 10
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="biasCount" 
                      name="Bias Detected" 
                      stroke="#06B6D4" 
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#biasGradientFull)"
                      filter="url(#shadow)"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="redirected" 
                      name="Redirected" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#redirectGradientFull)"
                      filter="url(#shadow)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="nova-chart-markers">
                <div className="nova-chart-marker">
                  <div className="nova-marker-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="nova-marker-content">
                    <span className="nova-marker-date">Apr 5, 2025</span>
                    <span className="nova-marker-text">Algorithm Update</span>
                  </div>
                </div>
                
                <div className="nova-chart-marker">
                  <div className="nova-marker-icon warning">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="nova-marker-content">
                    <span className="nova-marker-date">Apr 12, 2025</span>
                    <span className="nova-marker-text">Detection Spike</span>
                  </div>
                </div>
                
                <div className="nova-chart-marker">
                  <div className="nova-marker-icon success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="nova-marker-content">
                    <span className="nova-marker-date">Apr 18, 2025</span>
                    <span className="nova-marker-text">Effectiveness Improved</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="nova-trends-insights">
              <div className="nova-insight-header">
                <h3>Neural Trend Analysis</h3>
                <span>AI-powered trend detection and predictive insights</span>
              </div>
              
              <div className="nova-insights-grid">
                <div className="nova-insight-card">
                  <div className="nova-insight-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="nova-insight-content">
                    <h4>Overall Trend</h4>
                    <p>Bias detection has increased by 7.5% in the past 30 days, with a corresponding improvement in redirection effectiveness of 6.8%. Neural analysis attributes this to improved algorithm sensitivity.</p>
                  </div>
                </div>
                
                <div className="nova-insight-card">
                  <div className="nova-insight-icon warning">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="nova-insight-content">
                    <h4>Peak Detection Day</h4>
                    <p>Highest bias detection occurred on April 12, with 103 instances. Contextual analysis shows correlation with trending news topics related to gender and technology industry.</p>
                  </div>
                </div>
                
                <div className="nova-insight-card">
                  <div className="nova-insight-icon success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="nova-insight-content">
                    <h4>User Response Patterns</h4>
                    <p>Users are 15.3% more likely to continue conversation after redirection compared to last month. Improved engagement correlates with neural-optimized redirection content.</p>
                  </div>
                </div>
                
                <div className="nova-insight-card">
                  <div className="nova-insight-icon info">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="nova-insight-content">
                    <h4>Seasonal Patterns</h4>
                    <p>Neural pattern recognition identifies cyclical bias increases correlating with academic schedules. Educational contexts show 22% higher bias detection rates during semester start periods.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="nova-trends-prediction">
              <div className="nova-prediction-header">
                <h3>Neural Prediction Engine</h3>
                <div className="nova-prediction-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Quantum Enhanced</span>
                </div>
              </div>
              
              <div className="nova-prediction-content">
                <div className="nova-prediction-metrics">
                  <div className="nova-prediction-stat">
                    <div className="nova-prediction-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="nova-prediction-details">
                      <span className="nova-prediction-label">Confidence Level</span>
                      <span className="nova-prediction-value">92.7%</span>
                    </div>
                  </div>
                  
                  <div className="nova-prediction-stat">
                    <div className="nova-prediction-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                    <div className="nova-prediction-details">
                      <span className="nova-prediction-label">Features Used</span>
                      <span className="nova-prediction-value">127</span>
                    </div>
                  </div>
                  
                  <div className="nova-prediction-stat">
                    <div className="nova-prediction-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="nova-prediction-details">
                      <span className="nova-prediction-label">Prediction Window</span>
                      <span className="nova-prediction-value">30 Days</span>
                    </div>
                  </div>
                </div>
                
                <div className="nova-prediction-insights">
                  <div className="nova-prediction-list">
                    <div className="nova-prediction-list-item">
                      <div className="nova-prediction-marker up"></div>
                      <div className="nova-prediction-text">
                        <strong>Gender bias detection predicted to increase 5.8%</strong> in the next 30 days based on historical patterns and emerging content trends.
                      </div>
                    </div>
                    
                    <div className="nova-prediction-list-item">
                      <div className="nova-prediction-marker down"></div>
                      <div className="nova-prediction-text">
                        <strong>Racial bias instances projected to decrease 3.2%</strong> due to neural redirection effectiveness improvements and positive user learning patterns.
                      </div>
                    </div>
                    
                    <div className="nova-prediction-list-item">
                      <div className="nova-prediction-marker up"></div>
                      <div className="nova-prediction-text">
                        <strong>Overall redirection effectiveness expected to reach 78.5%</strong> with implementation of adaptive neural response strategies scheduled for next release.
                      </div>
                    </div>
                    
                    <div className="nova-prediction-list-item">
                      <div className="nova-prediction-marker neutral"></div>
                      <div className="nova-prediction-text">
                        <strong>Neural detection model confidence projected steady</strong> at 99.2% with minor fluctuations as new edge cases are incorporated into training data.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Neural Metrics Panel */}
        {activeTool === 'neural' && (
          <div className="nova-neural-panel">
            <div className="nova-panel-heading">
              <h2>Neural Network Performance Metrics</h2>
              <p>Advanced analytics on neural processing, detection accuracy, and predictive capabilities</p>
            </div>
            
            {activeTab === 'detection' && (
              <>
                <div className="nova-neural-grid">
                  <div className="nova-neural-metrics">
                    <div className="nova-neural-header">
                      <h3>Bias Detection Performance</h3>
                      <div className="nova-neural-badge">Real-time</div>
                    </div>
                    
                    <div className="nova-neural-stats-grid">
                      <div className="nova-neural-stat">
                        <div className="nova-neural-stat-header">
                          <div className="nova-neural-stat-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <span className="nova-neural-stat-label">Precision</span>
                        </div>
                        <div className="nova-neural-stat-value">98.7%</div>
                        <div className="nova-neural-stat-bar">
                          <div className="nova-neural-stat-fill" style={{width: '98.7%'}}></div>
                        </div>
                      </div>
                      
                      <div className="nova-neural-stat">
                        <div className="nova-neural-stat-header">
                          <div className="nova-neural-stat-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="nova-neural-stat-label">Recall</span>
                        </div>
                        <div className="nova-neural-stat-value">96.4%</div>
                        <div className="nova-neural-stat-bar">
                          <div className="nova-neural-stat-fill" style={{width: '96.4%'}}></div>
                        </div>
                      </div>
                      
                      <div className="nova-neural-stat">
                        <div className="nova-neural-stat-header">
                          <div className="nova-neural-stat-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <span className="nova-neural-stat-label">F1 Score</span>
                        </div>
                        <div className="nova-neural-stat-value">97.5%</div>
                        <div className="nova-neural-stat-bar">
                          <div className="nova-neural-stat-fill" style={{width: '97.5%'}}></div>
                        </div>
                      </div>
                      
                      <div className="nova-neural-stat">
                        <div className="nova-neural-stat-header">
                          <div className="nova-neural-stat-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                            </svg>
                          </div>
                          <span className="nova-neural-stat-label">Latency</span>
                        </div>
                        <div className="nova-neural-stat-value">12ms</div>
                        <div className="nova-neural-stat-bar">
                          <div className="nova-neural-stat-fill" style={{width: '92%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="nova-neural-chart">
                    <div className="nova-chart-header">
                      <h3>Detection Accuracy by Category</h3>
                      <div className="nova-chart-controls">
                        <div className="nova-chart-badge">Quantum Enhanced</div>
                      </div>
                    </div>
                    <div className="nova-chart-content">
                      <ResponsiveContainer width="100%" height={300}>
                        <RadialBarChart 
                          cx="50%" 
                          cy="50%" 
                          innerRadius="20%" 
                          outerRadius="80%" 
                          data={analyticsData.neuralMetrics.detectionAccuracy} 
                          startAngle={180} 
                          endAngle={0}
                        >
                          <RadialBar
                            minAngle={15}
                            label={{ position: 'insideEnd', fill: '#FFFFFF', fontWeight: 600 }}
                            background={{ fill: 'rgba(15, 23, 42, 0.4)' }}
                            clockWise
                            dataKey="value"
                          >
                            {analyticsData.neuralMetrics.detectionAccuracy.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]} 
                              />
                            ))}
                          </RadialBar>
                          <Legend 
                            iconType="circle"
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{
                              paddingLeft: 20
                            }}
                          />
                          <Tooltip 
                            formatter={(value) => [`${value}%`, 'Accuracy']}
                            contentStyle={{
                              background: 'rgba(15, 23, 42, 0.9)',
                              border: '1px solid rgba(6, 182, 212, 0.3)',
                              borderRadius: '0.375rem',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            }}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                <div className="nova-neural-system">
                  <div className="nova-neural-header full">
                    <h3>Neural Network Architecture</h3>
                    <div className="nova-neural-controls">
                      <div className="nova-neural-badge pulse">Active</div>
                      <button className="nova-neural-button">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="nova-network-diagram">
                    <div className="nova-layers-container">
                      <div className="nova-network-labels">
                        <div className="nova-layer-label">Input</div>
                        <div className="nova-layer-label">Embedding</div>
                        <div className="nova-layer-label">Hidden</div>
                        <div className="nova-layer-label">Attention</div>
                        <div className="nova-layer-label">Output</div>
                      </div>
                      
                      <div className="nova-network-vis">
                        <div className="nova-layer input-layer">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="nova-neuron"></div>
                          ))}
                        </div>
                        
                        <div className="nova-layer-connections">
                          <svg className="nova-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#06B6D4" />
                                <stop offset="100%" stopColor="#8B5CF6" />
                              </linearGradient>
                            </defs>
                            {/* Neural connections would be dynamically generated in a real implementation */}
                            <path d="M0,20 C30,15 70,30 100,20" stroke="url(#connectionGradient)" strokeWidth="0.5" fill="none">
                              <animate attributeName="d" dur="5s" repeatCount="indefinite"
                                values="M0,20 C30,15 70,30 100,20;
                                        M0,20 C30,30 70,15 100,20;
                                        M0,20 C30,15 70,30 100,20" />
                            </path>
                            <path d="M0,50 C30,40 70,60 100,50" stroke="url(#connectionGradient)" strokeWidth="0.5" fill="none">
                              <animate attributeName="d" dur="7s" repeatCount="indefinite"
                                values="M0,50 C30,40 70,60 100,50;
                                        M0,50 C30,60 70,40 100,50;
                                        M0,50 C30,40 70,60 100,50" />
                            </path>
                            <path d="M0,80 C30,70 70,90 100,80" stroke="url(#connectionGradient)" strokeWidth="0.5" fill="none">
                              <animate attributeName="d" dur="6s" repeatCount="indefinite"
                                values="M0,80 C30,70 70,90 100,80;
                                        M0,80 C30,90 70,70 100,80;
                                        M0,80 C30,70 70,90 100,80" />
                            </path>
                          </svg>
                        </div>
                        
                        <div className="nova-layer embedding-layer">
                          {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className={`nova-neuron ${i % 3 === 0 ? 'active' : ''}`}></div>
                          ))}
                        </div>
                        
                        <div className="nova-layer-connections">
                          <svg className="nova-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0,20 C30,15 70,30 100,20" stroke="url(#connectionGradient)" strokeWidth="0.5" fill="none">
                              <animate attributeName="d" dur="8s" repeatCount="indefinite"
                                values="M0,20 C30,15 70,30 100,20;
                                        M0,20 C30,30 70,15 100,20;
                                        M0,20 C30,15 70,30 100,20" />
                            </path>
                            <path d="M0,50 C30,40 70,60 100,50" stroke="url(#connectionGradient)" strokeWidth="0.5" fill="none">
                              <animate attributeName="d" dur="6s" repeatCount="indefinite"
                                values="M0,50 C30,40 70,60 100,50;
                                        M0,50 C30,60 70,40 100,50;
                                        M0,50 C30,40 70,60 100,50" />
                            </path>
                            <path d="M0,80 C30,70 70,90 100,80" stroke="url(#connectionGradient)" strokeWidth="0.5" fill="none">
                              <animate attributeName="d" dur="9s" repeatCount="indefinite"
                                values="M0,80 C30,70 70,90 100,80;
                                        M0,80 C30,90 70,70 100,80;
                                        M0,80 C30,70 70,90 100,80" />
                            </path>
                          </svg>
                        </div>
                        
                        <div className="nova-layer hidden-layer">
                          {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className={`nova-neuron ${i % 4 === 0 ? 'active' : ''}`}></div>
                          ))}
                        </div>
                        
                        <div className="nova-layer-connections">
                          <svg className="nova-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0,20 C30,15 70,30 100,20" stroke="url(#connectionGradient)" strokeWidth="0.5" fill="none">
                              <animate attributeName="d" dur="7s" repeatCount="indefinite"
                                values="M0,20 C30,15 70,30 100,20;
                                        M0,20 C30,30 70,15 100,20;
                                        M0,20 C30,15 70,30 100,20" />
                            </path>
                            <path d="M0,50 C30,40 70,60 100,50" stroke="url(#connectionGradient)" strokeWidth="0.5" fill="none">
                              <animate attributeName="d" dur="5s" repeatCount="indefinite"
                                values="M0,50 C30,40 70,60 100,50;
                                        M0,50 C30,60 70,40 100,50;
                                        M0,50 C30,40 70,60 100,50" />
                            </path>
                            <path d="M0,80 C30,70 70,90 100,80" stroke="url(#connectionGradient)" strokeWidth="0.5" fill="none">
                              <animate attributeName="d" dur="8s" repeatCount="indefinite"
                                values="M0,80 C30,70 70,90 100,80;
                                        M0,80 C30,90 70,70 100,80;
                                        M0,80 C30,70 70,90 100,80" />
                            </path>
                          </svg>
                        </div>
                        
                        <div className="nova-layer attention-layer">
                          {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className={`nova-neuron ${i % 3 === 1 ? 'active' : ''}`}></div>
                          ))}
                        </div>
                        
                        <div className="nova-layer-connections">
                          <svg className="nova-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0,20 C30,15 70,30 100,20" stroke="url(#connectionGradient)" strokeWidth="0.5" fill="none">
                              <animate attributeName="d" dur="6s" repeatCount="indefinite"
                                values="M0,20 C30,15 70,30 100,20;
                                        M0,20 C30,30 70,15 100,20;
                                        M0,20 C30,15 70,30 100,20" />
                            </path>
                            <path d="M0,50 C30,40 70,60 100,50" stroke="url(#connectionGradient)" strokeWidth="0.5" fill="none">
                              <animate attributeName="d" dur="9s" repeatCount="indefinite"
                                values="M0,50 C30,40 70,60 100,50;
                                        M0,50 C30,60 70,40 100,50;
                                        M0,50 C30,40 70,60 100,50" />
                            </path>
                            <path d="M0,80 C30,70 70,90 100,80" stroke="url(#connectionGradient)" strokeWidth="0.5" fill="none">
                              <animate attributeName="d" dur="7s" repeatCount="indefinite"
                                values="M0,80 C30,70 70,90 100,80;
                                        M0,80 C30,90 70,70 100,80;
                                        M0,80 C30,70 70,90 100,80" />
                            </path>
                          </svg>
                        </div>
                        
                        <div className="nova-layer output-layer">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={`nova-neuron ${i === 2 ? 'active-output' : ''}`}></div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="nova-metrics-labels">
                        <div className="nova-metric-row">
                          <div className="nova-metric-name">Tokens</div>
                          <div className="nova-metric-value">768</div>
                        </div>
                        <div className="nova-metric-row">
                          <div className="nova-metric-name">Dimensions</div>
                          <div className="nova-metric-value">1024</div>
                        </div>
                        <div className="nova-metric-row">
                          <div className="nova-metric-name">Parameters</div>
                          <div className="nova-metric-value">1.3B</div>
                        </div>
                        <div className="nova-metric-row">
                          <div className="nova-metric-name">Attention</div>
                          <div className="nova-metric-value">Multi</div>
                        </div>
                        <div className="nova-metric-row">
                          <div className="nova-metric-name">Categories</div>
                          <div className="nova-metric-value">5</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'processing' && (
              <div className="nova-neural-processing">
                <div className="nova-processing-charts">
                  <div className="nova-chart-container">
                    <div className="nova-chart-header">
                      <h3>Neural Processing Time</h3>
                      <div className="nova-chart-controls">
                        <div className="nova-chart-badge">Last 7 Days</div>
                        <button className="nova-chart-button">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="nova-chart-content">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={analyticsData.neuralMetrics.processingTime}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient id="processingGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#06B6D4" />
                              <stop offset="100%" stopColor="#8B5CF6" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.1)" />
                          <XAxis 
                            dataKey="day" 
                            stroke="rgba(226, 232, 240, 0.6)"
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="rgba(226, 232, 240, 0.6)"
                            tickLine={false}
                            axisLine={false}
                            label={{ value: 'Milliseconds', angle: -90, position: 'insideLeft', fill: 'rgba(226, 232, 240, 0.6)' }}
                          />
                          <Tooltip 
                            formatter={(value) => [`${value} ms`, 'Processing Time']}
                            contentStyle={{
                              background: 'rgba(15, 23, 42, 0.9)',
                              border: '1px solid rgba(6, 182, 212, 0.3)',
                              borderRadius: '0.375rem',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            name="Processing Time" 
                            stroke="url(#processingGradient)" 
                            strokeWidth={3}
                            dot={{ fill: '#06B6D4', strokeWidth: 2, r: 6 }}
                            activeDot={{ fill: '#8B5CF6', strokeWidth: 4, r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="nova-processing-metrics">
                    <div className="nova-cpu-gpu-metrics">
                      <div className="nova-chart-header small">
                        <h3>Resource Utilization</h3>
                        <div className="nova-chart-controls">
                          <div className="nova-chart-badge pulse">Real-time</div>
                        </div>
                      </div>
                      
                      <div className="nova-resource-grid">
                        <div className="nova-resource-meter">
                          <div className="nova-resource-header">
                            <span className="nova-resource-label">CPU</span>
                            <span className="nova-resource-value">76%</span>
                          </div>
                          <div className="nova-resource-bar">
                            <div className="nova-resource-fill" style={{width: '76%'}}></div>
                          </div>
                          <div className="nova-resource-details">
                            <span>24 Core Quantum</span>
                            <span>3.7 THz</span>
                          </div>
                        </div>
                        
                        <div className="nova-resource-meter">
                          <div className="nova-resource-header">
                            <span className="nova-resource-label">GPU</span>
                            <span className="nova-resource-value">82%</span>
                          </div>
                          <div className="nova-resource-bar">
                            <div className="nova-resource-fill" style={{width: '82%'}}></div>
                          </div>
                          <div className="nova-resource-details">
                            <span>Neural Tensor Core</span>
                            <span>64 GB VRAM</span>
                          </div>
                        </div>
                        
                        <div className="nova-resource-meter">
                          <div className="nova-resource-header">
                            <span className="nova-resource-label">Memory</span>
                            <span className="nova-resource-value">64%</span>
                          </div>
                          <div className="nova-resource-bar">
                            <div className="nova-resource-fill" style={{width: '64%'}}></div>
                          </div>
                          <div className="nova-resource-details">
                            <span>Quantum RAM</span>
                            <span>128 GB</span>
                          </div>
                        </div>
                        
                        <div className="nova-resource-meter">
                          <div className="nova-resource-header">
                            <span className="nova-resource-label">Network</span>
                            <span className="nova-resource-value">38%</span>
                          </div>
                          <div className="nova-resource-bar">
                            <div className="nova-resource-fill" style={{width: '38%'}}></div>
                          </div>
                          <div className="nova-resource-details">
                            <span>Quantum Entangled</span>
                            <span>10 Tbps</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="nova-processing-stats">
                      <div className="nova-chart-header small">
                        <h3>Neural Processing Statistics</h3>
                      </div>
                      
                      <div className="nova-stats-list">
                        <div className="nova-stats-item">
                          <span className="nova-stats-label">Throughput</span>
                          <span className="nova-stats-value">4,236</span>
                          <span className="nova-stats-unit">req/sec</span>
                        </div>
                        
                        <div className="nova-stats-item">
                          <span className="nova-stats-label">Batch Size</span>
                          <span className="nova-stats-value">128</span>
                          <span className="nova-stats-unit">tensors</span>
                        </div>
                        
                        <div className="nova-stats-item">
                          <span className="nova-stats-label">Avg. Latency</span>
                          <span className="nova-stats-value">12.7</span>
                          <span className="nova-stats-unit">ms</span>
                        </div>
                        
                        <div className="nova-stats-item">
                          <span className="nova-stats-label">p95 Latency</span>
                          <span className="nova-stats-value">18.3</span>
                          <span className="nova-stats-unit">ms</span>
                        </div>
                        
                        <div className="nova-stats-item">
                          <span className="nova-stats-label">p99 Latency</span>
                          <span className="nova-stats-value">24.1</span>
                          <span className="nova-stats-unit">ms</span>
                        </div>
                        
                        <div className="nova-stats-item">
                          <span className="nova-stats-label">Quantum Ops</span>
                          <span className="nova-stats-value">8.7B</span>
                          <span className="nova-stats-unit">ops/s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="nova-embedding-visualization">
                  <div className="nova-chart-header full">
                    <h3>Neural Embedding Visualization</h3>
                    <div className="nova-chart-controls">
                      <div className="nova-view-selector small">
                        <button className="nova-view-btn active">2D</button>
                        <button className="nova-view-btn">3D</button>
                        <button className="nova-view-btn">t-SNE</button>
                      </div>
                      <button className="nova-chart-button">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="nova-embedding-map">
                    <div className="nova-embedding-container">
                      {/* This would be a real visualization in production */}
                      <div className="nova-embedding-clusters">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div 
                            key={i}
                            className="nova-cluster"
                            style={{
                              left: `${20 + Math.random() * 60}%`,
                              top: `${20 + Math.random() * 60}%`,
                              width: `${50 + Math.random() * 100}px`,
                              height: `${50 + Math.random() * 100}px`,
                              background: `radial-gradient(circle, ${COLORS[i % COLORS.length]}33 0%, ${COLORS[i % COLORS.length]}00 70%)`,
                              border: `1px solid ${COLORS[i % COLORS.length]}66`,
                              animationDelay: `${i * 0.2}s`
                            }}
                          >
                            <span className="nova-cluster-label" style={{ color: COLORS[i % COLORS.length] }}>
                              {['Gender', 'Race', 'Age', 'Ability', 'Culture'][i]} 
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="nova-embedding-points">
                        {Array.from({ length: 150 }).map((_, i) => {
                          const cluster = Math.floor(i / 30); // 5 clusters, 30 points each
                          const distance = Math.random() * 0.5; // Distance from cluster center
                          const angle = Math.random() * Math.PI * 2;
                          const clusterX = 20 + Math.random() * 60;
                          const clusterY = 20 + Math.random() * 60;
                          
                          const x = clusterX + Math.cos(angle) * distance * 25;
                          const y = clusterY + Math.sin(angle) * distance * 25;
                          
                          return (
                            <div 
                              key={i}
                              className="nova-point"
                              style={{
                                left: `${x}%`,
                                top: `${y}%`,
                                backgroundColor: COLORS[cluster % COLORS.length],
                                animationDelay: `${Math.random()}s`,
                                transform: `scale(${0.5 + Math.random() * 0.5})`
                              }}
                            ></div>
                          );
                        })}
                      </div>
                      
                      {/* Axes */}
                      <div className="nova-embedding-axis x-axis"></div>
                      <div className="nova-embedding-axis y-axis"></div>
                      <div className="nova-axis-label x-label">Principal Component 1</div>
                      <div className="nova-axis-label y-label">Principal Component 2</div>
                    </div>
                    
                    <div className="nova-embedding-legend">
                      <div className="nova-legend-header">Bias Categories</div>
                      <div className="nova-legend-items">
                        {['Gender', 'Race', 'Age', 'Ability', 'Culture'].map((category, i) => (
                          <div key={i} className="nova-legend-item">
                            <div className="nova-legend-color" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                            <div className="nova-legend-label">{category}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'prediction' && (
              <div className="nova-prediction-panel">
                <div className="nova-prediction-metrics">
                  <div className="nova-chart-header full">
                    <h3>Predictive Correlation Factors</h3>
                    <div className="nova-chart-controls">
                      <div className="nova-chart-badge">Auto-discovered</div>
                      <button className="nova-chart-button">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="nova-correlation-grid">
                    {analyticsData.neuralMetrics.predictiveInsights.map((insight, i) => (
                      <div key={i} className="nova-correlation-card">
                        <div className="nova-correlation-header">
                          <div className="nova-correlation-icon" style={{ background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]} 0%, ${COLORS[(i + 1) % COLORS.length]} 100%)` }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <div className="nova-correlation-title">{insight.factor}</div>
                        </div>
                        <div className="nova-correlation-meter">
                          <div className="nova-correlation-bar">
                            <div className="nova-correlation-fill" style={{ width: `${insight.correlation * 100}%`, background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]} 0%, ${COLORS[(i + 1) % COLORS.length]} 100%)` }}></div>
                          </div>
                          <div className="nova-correlation-value">{insight.correlation.toFixed(2)}</div>
                        </div>
                        <div className="nova-correlation-detail">
                          <div className="nova-detail-label">Confidence</div>
                          <div className="nova-detail-value">{Math.round(insight.correlation * 100)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="nova-prediction-system">
                  <div className="nova-prediction-header">
                    <div className="nova-prediction-title">
                      <h3>Neural Prediction System</h3>
                      <div className="nova-prediction-subtitle">Advanced quantum-enhanced predictive analysis</div>
                    </div>
                    <div className="nova-prediction-status">
                      <div className="nova-status-badge pulse">
                        <span>Active</span>
                      </div>
                      <div className="nova-status-detail">Last updated: 15 minutes ago</div>
                    </div>
                  </div>
                  
                  <div className="nova-prediction-diagram">
                    <div className="nova-diagram-container">
                      <div className="nova-diagram-node input-node">
                        <div className="nova-node-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="nova-node-label">Input</div>
                        <div className="nova-node-detail">Message Data</div>
                      </div>
                      
                      <div className="nova-diagram-arrow">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="arrowGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#06B6D4" />
                              <stop offset="100%" stopColor="#8B5CF6" />
                            </linearGradient>
                          </defs>
                          <path d="M0,50 L90,50 M80,40 L100,50 L80,60" stroke="url(#arrowGradient1)" strokeWidth="2" fill="none" />
                        </svg>
                      </div>
                      
                      <div className="nova-diagram-node process-node">
                        <div className="nova-node-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                          </svg>
                        </div>
                        <div className="nova-node-label">Feature Extraction</div>
                        <div className="nova-node-detail">127 Neural Features</div>
                      </div>
                      
                      <div className="nova-diagram-arrow">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path d="M0,50 L90,50 M80,40 L100,50 L80,60" stroke="url(#arrowGradient1)" strokeWidth="2" fill="none" />
                        </svg>
                      </div>
                      
                      <div className="nova-diagram-node model-node">
                        <div className="nova-node-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                          </svg>
                        </div>
                        <div className="nova-node-label">Quantum Model</div>
                        <div className="nova-node-detail">1.3B Parameters</div>
                      </div>
                      
                      <div className="nova-diagram-arrow">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path d="M0,50 L90,50 M80,40 L100,50 L80,60" stroke="url(#arrowGradient1)" strokeWidth="2" fill="none" />
                        </svg>
                      </div>
                      
                      <div className="nova-diagram-node output-node">
                        <div className="nova-node-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div className="nova-node-label">Prediction</div>
                        <div className="nova-node-detail">92.7% Confidence</div>
                      </div>
                    </div>
                    
                    <div className="nova-system-metrics">
                      <div className="nova-system-metric">
                        <div className="nova-metric-name">Model Version</div>
                        <div className="nova-metric-value">v3.7.6</div>
                      </div>
                      <div className="nova-system-metric">
                        <div className="nova-metric-name">Training Data</div>
                        <div className="nova-metric-value">15.7M Samples</div>
                      </div>
                      <div className="nova-system-metric">
                        <div className="nova-metric-name">Feature Dimensions</div>
                        <div className="nova-metric-value">1,024</div>
                      </div>
                      <div className="nova-system-metric">
                        <div className="nova-metric-name">Update Frequency</div>
                        <div className="nova-metric-value">15 min</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="nova-prediction-insights">
                  <div className="nova-chart-header full">
                    <h3>Neural Prediction Insights</h3>
                    <div className="nova-chart-controls">
                      <div className="nova-chart-badge info">Auto-generated</div>
                    </div>
                  </div>
                  
                  <div className="nova-insights-container">
                    <div className="nova-insight-card wide">
                      <div className="nova-insight-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div className="nova-insight-content">
                        <h4>Feature Importance Analysis</h4>
                        <p>Content topic is the strongest predictor of bias occurrence (0.91 correlation), followed by user demographics (0.82). Neural model shows 87% increased accuracy when incorporating these features into prediction vector spaces.</p>
                      </div>
                    </div>
                    
                    <div className="nova-insight-card wide">
                      <div className="nova-insight-icon warning">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="nova-insight-content">
                        <h4>Emerging Risk Patterns</h4>
                        <p>Neural prediction identifies emerging correlation (0.76) between time of day and bias occurrence, with 22% higher detection rates during evening hours (8pm-12am). System recommends enhanced monitoring during these periods.</p>
                      </div>
                    </div>
                    
                    <div className="nova-insight-card wide">
                      <div className="nova-insight-icon info">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="nova-insight-content">
                        <h4>Predictive Accuracy</h4>
                        <p>Quantum prediction model shows 92.7% accuracy in forecasting bias trends up to 30 days in advance. Integration of previous user interactions (0.88 correlation) significantly enhances prediction confidence intervals.</p>
                      </div>
                    </div>
                    
                    <div className="nova-insight-card wide">
                      <div className="nova-insight-icon success">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="nova-insight-content">
                        <h4>Optimization Opportunities</h4>
                        <p>Predictive analysis identifies platform-specific bias patterns (0.64 correlation) that can be mitigated through targeted content adaptation. Neural system recommends adaptive response strategies for 38% improvement.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx="true">{`
      /* Global Styles */
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        background-color: #0f172a;
        color: #e2e8f0;
        font-family: 'JetBrains Mono', monospace;
        overflow-x: hidden;
      }
      
      /* App Container */
      .app-container {
        background-color: rgba(15, 23, 42, 0.95);
        min-height: 100vh;
        font-family: 'JetBrains Mono', monospace;
        position: relative;
        overflow: hidden;
      }

      /* Cyberpunk Grid */
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
      
      /* Matrix Data Shower */
      .hacker-text-container {
        position: fixed;
        inset: 0;
        z-index: 10;
        pointer-events: none;
        overflow: hidden;
      }
      
      .hacker-text-line {
        position: absolute;
        top: -30px;
        color: rgba(6, 182, 212, 0.7);
        font-family: 'Courier New', monospace;
        font-size: 14px;
        white-space: nowrap;
        text-shadow: 0 0 5px rgba(6, 182, 212, 0.5);
        animation: falling-text linear forwards;
      }
      
      @keyframes falling-text {
        0% { transform: translateY(0); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(105vh); opacity: 0; }
      }
      
      /* Glitch Effect */
      .cyber-glitch {
        animation: glitch 0.3s linear;
      }
      
      @keyframes glitch {
        0% { transform: translate(0); }
        20% { transform: translate(-5px, 5px); }
        40% { transform: translate(-5px, -5px); }
        60% { transform: translate(5px, 5px); }
        80% { transform: translate(5px, -5px); }
        100% { transform: translate(0); }
      }
      
      /* Holographic Elements */
      .holographic-container {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 1;
      }
      
      .holographic-circle {
        position: absolute;
        border-radius: 50%;
        border: 1px solid rgba(6, 182, 212, 0.3);
        box-shadow: 0 0 20px rgba(6, 182, 212, 0.1) inset;
        animation: rotate-3d 20s linear infinite;
      }
      
      .h-circle-1 {
        top: 20%;
        left: 30%;
        width: 200px;
        height: 200px;
        animation-duration: 15s;
      }
      
      .h-circle-2 {
        bottom: 15%;
        right: 25%;
        width: 250px;
        height: 250px;
        animation-duration: 25s;
        animation-direction: reverse;
      }
      
      .h-circle-3 {
        top: 50%;
        left: 50%;
        width: 400px;
        height: 400px;
        animation-duration: 30s;
        transform: translate(-50%, -50%);
      }
      
      @keyframes rotate-3d {
        0% { transform: rotate3d(1, 1, 1, 0deg); }
        100% { transform: rotate3d(1, 1, 1, 360deg); }
      }
      
      /* Floating Code Fragments */
      .code-fragments {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 2;
      }
      
      .code-fragment {
        position: absolute;
        padding: 10px;
        background: rgba(17, 24, 39, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 5px;
        animation: float-code 15s ease-in-out infinite;
      }
      
      .code-text {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: rgba(6, 182, 212, 0.8);
        margin: 0;
      }
      
      @keyframes float-code {
        0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
        50% { transform: translateY(-20px) rotate(2deg); opacity: 0.6; }
      }
      
      /* Holographic Logo */
      .logo-glitch-container {
        position: relative;
        width: 250px;
        height: 80px;
        transform-style: preserve-3d;
      }
      
      .logo-base {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'JetBrains Mono', monospace;
        font-size: 28px;
        font-weight: 700;
        color: rgb(6, 182, 212);
        text-shadow: 0 0 10px rgba(6, 182, 212, 0.6);
        letter-spacing: 2px;
      }
      
      .logo-glitch {
        position: absolute;
        inset: 0;
        background: linear-gradient(45deg, rgba(6, 182, 212, 0.2), rgba(124, 58, 237, 0.2));
        border-radius: 10px;
        filter: blur(10px);
        animation: logo-pulse 3s ease-in-out infinite alternate;
      }
      
      .logo-scan {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 5px;
        background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.8), transparent);
        filter: blur(2px);
        animation: logo-scan 3s linear infinite;
      }
      
      .logo-glow {
        position: absolute;
        inset: -10px;
        border-radius: 20px;
        border: 1px solid rgba(6, 182, 212, 0.3);
        box-shadow: 0 0 15px rgba(6, 182, 212, 0.4) inset,
                    0 0 5px rgba(6, 182, 212, 0.2);
        animation: logo-rotate 10s linear infinite;
        opacity: 0.7;
      }
      
      @keyframes logo-pulse {
        0% { transform: scale(0.9); opacity: 0.5; }
        100% { transform: scale(1.1); opacity: 0.8; }
      }
      
      @keyframes logo-scan {
        0% { transform: translateY(0); opacity: 0.8; }
        70% { opacity: 0.5; }
        100% { transform: translateY(80px); opacity: 0; }
      }
      
      @keyframes logo-rotate {
        0% { transform: rotate(0); }
        100% { transform: rotate(360deg); }
      }
      
      /* Text Effects */
      .cyber-text-glitch {
        position: relative;
      }
      
      .cyber-text-glitch::before,
      .cyber-text-glitch::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, rgb(6, 182, 212) 0%, rgb(124, 58, 237) 50%, rgb(14, 165, 233) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        color: transparent;
      }
      
      .cyber-text-glitch::before {
        left: 2px;
        text-shadow: -1px 0 rgba(124, 58, 237, 0.5);
        animation: text-glitch-1 3s infinite linear alternate-reverse;
      }
      
      .cyber-text-glitch::after {
        left: -2px;
        text-shadow: 1px 0 rgba(14, 165, 233, 0.5);
        animation: text-glitch-2 2s infinite linear alternate-reverse;
      }
      
      @keyframes text-glitch-1 {
        0%, 100% { clip-path: inset(0 0 98% 0); }
        20% { clip-path: inset(33% 0 33% 0); }
        40% { clip-path: inset(50% 0 0 0); }
        60% { clip-path: inset(25% 0 75% 0); }
        80% { clip-path: inset(75% 0 25% 0); }
      }
      
      @keyframes text-glitch-2 {
        0%, 100% { clip-path: inset(0 0 98% 0); }
        25% { clip-path: inset(35% 0 65% 0); }
        50% { clip-path: inset(50% 0 50% 0); }
        75% { clip-path: inset(40% 0 60% 0); }
      }
      
      .cyber-text-scramble {
        position: relative;
        overflow: hidden;
      }
      
      .cyber-text-scramble::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(17, 24, 39, 0.8), transparent);
        animation: text-scramble 3s ease-in-out infinite;
      }
      
      @keyframes text-scramble {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      /* Neural Button */
      .nova-neural-button {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.875rem 1.75rem;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(6, 182, 212, 0.4);
        border-radius: 0.5rem;
        color: rgb(6, 182, 212);
        font-size: 1rem;
        font-weight: 500;
        letter-spacing: 0.025em;
        cursor: pointer;
        overflow: hidden;
        transition: all 0.3s;
        box-shadow: 
          0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 2px 4px -1px rgba(0, 0, 0, 0.06),
          0 0 0 1px rgba(6, 182, 212, 0.1) inset,
          0 0 20px rgba(6, 182, 212, 0.1);
        z-index: 1;
      }
      
      .nova-neural-button:hover {
        transform: translateY(-5px);
        box-shadow: 
          0 10px 25px -5px rgba(0, 0, 0, 0.2),
          0 10px 10px -5px rgba(0, 0, 0, 0.1),
          0 0 0 1px rgba(6, 182, 212, 0.3) inset,
          0 0 30px rgba(6, 182, 212, 0.2);
      }
      
      .nova-neural-button-content {
        display: flex;
        align-items: center;
        position: relative;
        z-index: 2;
      }
      
      .nova-neural-button-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 0.75rem;
        color: rgb(6, 182, 212);
      }
      
      .nova-neural-button-text {
        position: relative;
      }
      
      .nova-button-glow {
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle at center, rgba(6, 182, 212, 0.3) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      .nova-neural-button:hover .nova-button-glow {
        opacity: 0.5;
        animation: glow-pulse 2s infinite;
      }
      
      @keyframes glow-pulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.1); }
      }
      
      .nova-button-grid {
        position: absolute;
        inset: 0;
        opacity: 0.1;
        background-image: 
          linear-gradient(to right, rgba(6, 182, 212, 0.3) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(6, 182, 212, 0.3) 1px, transparent 1px);
        background-size: 10px 10px;
        z-index: 1;
      }
      
      .nova-button-particles {
        position: absolute;
        inset: 0;
        z-index: 1;
        overflow: hidden;
      }
      
      .nova-button-particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(6, 182, 212, 0.7);
        border-radius: 50%;
        opacity: 0;
      }
      
      .nova-neural-button:hover .nova-button-particle {
        animation: particle-burst 0.8s ease-out forwards;
      }
      
      @keyframes particle-burst {
        0% {
          opacity: 0.8;
          transform: translate(calc(var(--x, 0) * 1px), calc(var(--y, 0) * 1px)) scale(0);
        }
        100% {
          opacity: 0;
          transform: translate(
            calc(var(--x, 0) * 1px + var(--dx, 0) * 60px),
            calc(var(--y, 0) * 1px + var(--dy, 0) * 60px)
          ) scale(1);
        }
      }
      
      /* Modal Styles */
      .nova-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(10px);
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        overflow: hidden;
      }
      
      .nova-modal {
        width: 92%;
        height: 92%;
        max-width: 1800px;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 0.75rem;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(6, 182, 212, 0.2);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: modalAppear 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        transform-style: preserve-3d;
        perspective: 1000px;
      }
      
      @keyframes modalAppear {
        0% { opacity: 0; transform: scale(0.95) translateY(30px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      
      .nova-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.75rem;
        background: rgba(15, 23, 42, 0.9);
        border-bottom: 1px solid rgba(6, 182, 212, 0.3);
        position: relative;
      }
      
      .nova-header-left {
        display: flex;
        align-items: center;
      }
      
      .nova-header-icon {
        position: relative;
        width: 40px;
        height: 40px;
        background: rgba(6, 182, 212, 0.1);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgb(6, 182, 212);
        margin-right: 1rem;
      }
      
      .nova-icon-pulse {
        position: absolute;
        inset: 0;
        border-radius: 0.5rem;
        border: 1px solid rgba(6, 182, 212, 0.5);
        opacity: 0;
        animation: icon-pulse 2s infinite;
      }
      
      @keyframes icon-pulse {
        0% { transform: scale(1); opacity: 0.5; }
        100% { transform: scale(1.5); opacity: 0; }
      }
      
      .nova-header-text {
        display: flex;
        flex-direction: column;
      }
      
      .nova-system-info {
        display: flex;
        gap: 1rem;
        margin-top: 0.25rem;
      }
      
      .nova-system-status {
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }
      
      .nova-system-status.online::before {
        content: '';
        display: block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgb(16, 185, 129);
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        animation: pulse 2s infinite;
      }
      
      .nova-system-version,
      .nova-system-ping {
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-header-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      
      .nova-modal-badge {
        font-size: 0.75rem;
        background: rgba(6, 182, 212, 0.1);
        color: rgba(6, 182, 212, 0.9);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 1rem;
        padding: 0.25rem 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }
      
      .nova-modal-control {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 0.375rem;
        color: rgba(226, 232, 240, 0.8);
        cursor: pointer;
        transition: all 0.3s;
        position: relative;
      }
      
      .nova-modal-control:hover {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.5);
        color: rgb(239, 68, 68);
        transform: rotate(90deg);
      }
      
      .nova-control-tooltip {
        position: absolute;
        bottom: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 0.25rem;
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.9);
        white-space: nowrap;
        opacity: 0;
        transition: all 0.2s;
        pointer-events: none;
        z-index: 10;
      }
      
      .nova-modal-control:hover .nova-control-tooltip {
        opacity: 1;
        bottom: -40px;
      }
      
      .nova-modal-content {
        flex: 1;
        overflow-y: auto;
        padding: 0;
      }
      
      .nova-modal-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1.75rem;
        background: rgba(15, 23, 42, 0.9);
        border-top: 1px solid rgba(6, 182, 212, 0.3);
        position: relative;
      }
      
      .nova-footer-info {
        display: flex;
        align-items: center;
        gap: 2rem;
      }
      
      .nova-processing-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.9);
      }
      
      .nova-status-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgb(16, 185, 129);
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        position: relative;
      }
      
      .nova-status-indicator::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: rgb(16, 185, 129);
        opacity: 0.5;
        animation: pulse 2s infinite;
      }
      
      .nova-data-stats {
        display: flex;
        gap: 1.5rem;
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-ai-signature {
        font-size: 0.75rem;
        color: rgba(6, 182, 212, 0.9);
      }
      
      /* Typing Cursor Animation */
      .typing-cursor {
        animation: cursor-blink 1s step-end infinite;
      }
      
      @keyframes cursor-blink {
        from, to { opacity: 1; }
        50% { opacity: 0; }
      }
      
      /* Shimmer Text Effect */
      .shimmer-text {
        background: linear-gradient(
          90deg,
          rgba(226, 232, 240, 0.8) 0%,
          rgba(6, 182, 212, 0.8) 50%,
          rgba(226, 232, 240, 0.8) 100%
        );
        background-size: 200% auto;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: shimmer 3s linear infinite;
      }
      
      @keyframes shimmer {
        to { background-position: 200% center; }
      }
      
      /* Corner Decorations */
      .nova-corner {
        position: absolute;
        width: 1rem;
        height: 1rem;
        border-color: rgba(6, 182, 212, 0.5);
        z-index: 5;
      }
      
      .nova-corner-tl {
        top: 0;
        left: 0;
        border-top: 2px solid;
        border-left: 2px solid;
      }
      
      .nova-corner-tr {
        top: 0;
        right: 0;
        border-top: 2px solid;
        border-right: 2px solid;
      }
      
      .nova-corner-bl {
        bottom: 0;
        left: 0;
        border-bottom: 2px solid;
        border-left: 2px solid;
      }
      
      .nova-corner-br {
        bottom: 0;
        right: 0;
        border-bottom: 2px solid;
        border-right: 2px solid;
      }
      
      .nova-modal-scanline {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          to bottom,
          transparent 0%,
          rgba(6, 182, 212, 0.05) 50%,
          transparent 100%
        );
        opacity: 0.5;
        pointer-events: none;
        animation: scanline 8s linear infinite;
      }
      
      @keyframes scanline {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100%); }
      }
      
      /* Circuit Decorations */
      .nova-circuit-decoration {
        position: absolute;
        background: rgba(6, 182, 212, 0.2);
        pointer-events: none;
      }
      
      .nova-circuit-1 {
        top: 80px;
        left: 20px;
        width: 3px;
        height: 100px;
      }
      
      .nova-circuit-2 {
        top: 180px;
        left: 20px;
        width: 40px;
        height: 3px;
      }
      
      .nova-circuit-3 {
        bottom: 60px;
        right: 30px;
        width: 60px;
        height: 3px;
      }
      
      .nova-circuit-node {
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(6, 182, 212, 0.5);
        box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
      }
      
      .nova-node-1 {
        top: 80px;
        left: 20px;
        animation: node-pulse 2s infinite alternate;
      }
      
      .nova-node-2 {
        top: 180px;
        left: 60px;
        animation: node-pulse 2s infinite alternate 0.5s;
      }
      
      .nova-node-3 {
        bottom: 60px;
        right: 30px;
        animation: node-pulse 2s infinite alternate 1s;
      }
      
      @keyframes node-pulse {
        0% { transform: scale(1); opacity: 0.5; }
        100% { transform: scale(1.5); opacity: 1; }
      }
      
      /* Neural Connectivity Map */
      .neural-connectivity-map {
        position: absolute;
        inset: 0;
        z-index: -1;
        overflow: hidden;
        opacity: 0.2;
        pointer-events: none;
      }
      
      .neural-node {
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(6, 182, 212, 0.8);
        border-radius: 50%;
        animation: neural-pulse 3s infinite alternate;
      }
      
      .neural-pulse {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 1px solid rgba(6, 182, 212, 0.5);
        opacity: 0;
        animation: neural-wave 2s infinite;
      }
      
      .neural-connection {
        position: absolute;
        height: 2px;
        background: linear-gradient(90deg, rgba(6, 182, 212, 0) 0%, rgba(6, 182, 212, 0.5) 50%, rgba(6, 182, 212, 0) 100%);
        animation: connection-pulse 3s infinite alternate;
      }
      
      @keyframes neural-pulse {
        0% { transform: scale(1); opacity: 0.3; }
        100% { transform: scale(1.5); opacity: 0.8; }
      }
      
      @keyframes neural-wave {
        0% { transform: scale(1); opacity: 0.5; }
        100% { transform: scale(3); opacity: 0; }
      }
      
      @keyframes connection-pulse {
        0% { opacity: 0.3; }
        100% { opacity: 0.7; }
      }
      
      /* Analytics Dashboard Styles */
      .nova-analytics-dashboard {
        padding: 1.75rem;
        background: rgba(15, 23, 42, 0.95);
        font-family: 'JetBrains Mono', monospace;
        color: #e2e8f0;
        position: relative;
        height: 100%;
        overflow-y: auto;
      }
      
      /* Dashboard Header */
      .nova-dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.75rem;
        flex-wrap: wrap;
        gap: 1.5rem;
      }
      
      .nova-header-content {
        display: flex;
        flex-direction: column;
      }
      
      .nova-dashboard-header h1 {
        font-size: 1.75rem;
        font-weight: 700;
        background: linear-gradient(90deg, rgb(6, 182, 212) 0%, rgb(79, 70, 229) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        color: transparent;
        margin: 0;
      }
      
      .nova-header-subtitle {
        font-size: 0.875rem;
        color: rgba(226, 232, 240, 0.7);
        margin-top: 0.5rem;
      }
      
      .nova-date-filters {
        display: flex;
        gap: 1rem;
        align-items: center;
        flex-wrap: wrap;
      }
      
      .nova-date-range {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .nova-date-range label {
        font-size: 0.875rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-date-input {
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 0.375rem;
        padding: 0.5rem;
        color: rgba(226, 232, 240, 0.9);
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.875rem;
      }
      
      .nova-refresh-button {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 1rem;
        background: rgba(6, 182, 212, 0.1);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 0.375rem;
        color: rgb(6, 182, 212);
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;
        overflow: hidden;
      }
      
      .nova-refresh-button:hover {
        background: rgba(6, 182, 212, 0.2);
        border-color: rgba(6, 182, 212, 0.5);
        transform: translateY(-2px);
      }
      
      .nova-btn-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .nova-btn-pulse {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at center, rgba(6, 182, 212, 0.3) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      .nova-refresh-button:hover .nova-btn-pulse {
        opacity: 1;
        animation: btn-pulse 2s infinite;
      }
      
      @keyframes btn-pulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.2); }
      }
      
      /* Timeframe Selector */
      .nova-timeframe-selector {
        display: flex;
        align-items: center;
        margin-bottom: 1.75rem;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.5rem;
        padding: 0.5rem;
      }
      
      .nova-timeframe-button {
        padding: 0.5rem 1rem;
        background: transparent;
        border: none;
        color: rgba(226, 232, 240, 0.7);
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s;
        border-radius: 0.375rem;
      }
      
      .nova-timeframe-button:hover {
        color: rgba(226, 232, 240, 0.9);
        background: rgba(15, 23, 42, 0.8);
      }
      
      .nova-active-timeframe {
        background: rgba(6, 182, 212, 0.2);
        color: rgb(6, 182, 212);
        box-shadow: 0 0 10px rgba(6, 182, 212, 0.1);
      }
      
      .nova-timeframe-divider {
        width: 1px;
        height: 2rem;
        background: rgba(6, 182, 212, 0.2);
        margin: 0 0.5rem;
      }
      
      .nova-view-selector {
        margin-left: auto;
      }
      
      .nova-view-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 0.375rem;
        color: rgba(226, 232, 240, 0.8);
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .nova-view-button:hover {
        background: rgba(15, 23, 42, 0.9);
        border-color: rgba(6, 182, 212, 0.5);
        color: rgb(6, 182, 212);
      }
      
      .nova-active-view {
        background: rgba(6, 182, 212, 0.2);
        border-color: rgba(6, 182, 212, 0.5);
        color: rgb(6, 182, 212);
      }
      
      /* Tools Navigation */
      .nova-analytics-tools {
        margin-bottom: 2rem;
      }
      
      .nova-tools-primary {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        border-bottom: 1px solid rgba(6, 182, 212, 0.2);
        padding-bottom: 1rem;
      }
      
      .nova-tool-button {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1.25rem;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 0.375rem;
        color: rgba(226, 232, 240, 0.8);
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .nova-tool-button:hover {
        background: rgba(15, 23, 42, 0.9);
        border-color: rgba(6, 182, 212, 0.5);
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1),
                  0 0 10px rgba(6, 182, 212, 0.2);
      }
      
      .nova-active-tool {
        background: rgba(6, 182, 212, 0.15);
        border-color: rgba(6, 182, 212, 0.5);
        color: rgb(6, 182, 212);
        box-shadow: 0 0 15px rgba(6, 182, 212, 0.1);
      }
      
      .nova-tool-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        background: rgba(15, 23, 42, 0.8);
        border-radius: 0.375rem;
        transition: all 0.3s;
      }
      
      .nova-active-tool .nova-tool-icon {
        background: rgba(6, 182, 212, 0.2);
      }
      
      .nova-tools-secondary {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        padding-left: 0.5rem;
      }
      
      .nova-tab-button {
        padding: 0.5rem 1rem;
        background: transparent;
        border: none;
        color: rgba(226, 232, 240, 0.7);
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s;
        border-radius: 0.375rem;
        border-bottom: 2px solid transparent;
      }
      
      .nova-tab-button:hover {
        color: rgba(226, 232, 240, 0.9);
      }
      
      .nova-active-tab {
        color: rgb(6, 182, 212);
        border-bottom: 2px solid rgb(6, 182, 212);
      }
      
      /* Loading and Error States */
      .nova-analytics-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 60vh;
        gap: 2rem;
      }
      
      .nova-neural-loader {
        position: relative;
        width: 120px;
        height: 120px;
      }
      
      .nova-loader-brain {
        position: relative;
        width: 100%;
        height: 100%;
      }
      
      .nova-brain-hemisphere {
        position: absolute;
        width: 50px;
        height: 80px;
        top: 20px;
        border-radius: 50px 50px 0 0;
        border: 2px solid rgba(6, 182, 212, 0.7);
      }
      
      .nova-brain-hemisphere.left {
        left: 10px;
        transform: rotate(-30deg);
        border-right: none;
        animation: brain-pulse 2s infinite alternate;
      }
      
      .nova-brain-hemisphere.right {
        right: 10px;
        transform: rotate(30deg);
        border-left: none;
        animation: brain-pulse 2s infinite alternate 0.5s;
      }
      
      .nova-synapse {
        position: absolute;
        width: 6px;
        height: 6px;
        background: rgba(6, 182, 212, 0.8);
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
      }
      
      .nova-synapse.s1 {
        top: 30px;
        left: 40px;
        animation: synapse-pulse 1.2s infinite;
      }
      
      .nova-synapse.s2 {
        top: 45px;
        left: 60px;
        animation: synapse-pulse 1.2s infinite 0.2s;
      }
      
      .nova-synapse.s3 {
        top: 60px;
        left: 50px;
        animation: synapse-pulse 1.2s infinite 0.4s;
      }
      
      .nova-synapse.s4 {
        top: 40px;
        right: 35px;
        animation: synapse-pulse 1.2s infinite 0.6s;
      }
      
      .nova-synapse.s5 {
        top: 55px;
        right: 45px;
        animation: synapse-pulse 1.2s infinite 0.8s;
      }
      
      @keyframes brain-pulse {
        0% { opacity: 0.5; }
        100% { opacity: 1; }
      }
      
      @keyframes synapse-pulse {
        0% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.5); opacity: 1; }
        100% { transform: scale(1); opacity: 0.5; }
      }
      
      .nova-loader-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: rgba(15, 23, 42, 0.7);
        border-radius: 2px;
        overflow: hidden;
      }
      
      .nova-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
        width: 0;
        border-radius: 2px;
        animation: progress 2s ease-in-out infinite;
      }
      
      @keyframes progress {
        0% { width: 0; }
        50% { width: 70%; }
        70% { width: 90%; }
        100% { width: 100%; }
      }
      
      .nova-loading-text {
        font-size: 1.25rem;
        color: rgba(226, 232, 240, 0.9);
        text-align: center;
      }
      
      .nova-loading-stats {
        display: flex;
        gap: 1.5rem;
        margin-top: 1rem;
      }
      
      .nova-loading-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
      }
      
      .nova-stat-label {
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-stat-value {
        font-size: 0.875rem;
        color: rgb(6, 182, 212);
      }
      
      .nova-analytics-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 60vh;
        gap: 1.5rem;
        text-align: center;
      }
      
      .nova-error-icon {
        font-size: 4rem;
        color: rgb(239, 68, 68);
      }
      
      .nova-error-text {
        font-size: 1.5rem;
        color: rgba(226, 232, 240, 0.9);
        font-weight: 600;
      }
      
      .nova-error-subtext {
        font-size: 1rem;
        color: rgba(226, 232, 240, 0.7);
        max-width: 30rem;
        margin: 0 auto;
      }
      
      .nova-error-retry-button {
        display: flex;
        align-items: center;
        padding: 0.75rem 1.5rem;
        background: rgba(6, 182, 212, 0.1);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 0.375rem;
        color: rgb(6, 182, 212);
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s;
        margin-top: 1rem;
      }
      
      .nova-error-retry-button:hover {
        background: rgba(6, 182, 212, 0.2);
        border-color: rgba(6, 182, 212, 0.5);
        transform: translateY(-2px);
      }
      
      /* Overview Panel */
      .nova-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }
      
      .nova-stat-card {
        position: relative;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        padding: 1.5rem;
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        opacity: 0;
        transform: translateY(20px);
      }
      
      .nova-stat-card.stats-appear {
        opacity: 1;
        transform: translateY(0);
      }
      
      .nova-stat-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2), 0 0 15px rgba(6, 182, 212, 0.2);
        border-color: rgba(6, 182, 212, 0.4);
      }
      
      .nova-stat-header {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
      }
      
      .nova-stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        background: rgba(6, 182, 212, 0.1);
        border-radius: 0.5rem;
        color: rgb(6, 182, 212);
        margin-right: 1rem;
      }
      
      .nova-stat-icon.warning {
        background: rgba(239, 68, 68, 0.1);
        color: rgb(239, 68, 68);
      }
      
      .nova-stat-icon.success {
        background: rgba(16, 185, 129, 0.1);
        color: rgb(16, 185, 129);
      }
      
      .nova-stat-icon.info {
        background: rgba(79, 70, 229, 0.1);
        color: rgb(79, 70, 229);
      }
      
      .nova-stat-name {
        font-size: 0.875rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: rgba(226, 232, 240, 0.9);
        margin: 0.5rem 0 1rem;
      }
      
      .nova-stat-chart {
        margin-bottom: 0.75rem;
      }
      
      .nova-mini-chart {
        display: flex;
        align-items: flex-end;
        height: 40px;
        gap: 4px;
      }
      
      .nova-chart-bar {
        flex: 1;
        background: rgba(6, 182, 212, 0.1);
        border-radius: 2px 2px 0 0;
        transition: height 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      
      .nova-chart-bar.highlight {
        background: rgba(6, 182, 212, 0.4);
      }
      
      .nova-stat-trend {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        font-weight: 500;
      }
      
      .nova-stat-trend.positive {
        color: rgb(16, 185, 129);
      }
      
      .nova-stat-trend.negative {
        color: rgb(239, 68, 68);
      }
      
      /* Advanced Metrics */
      .nova-advanced-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2.5rem;
      }
      
      .nova-metric-card {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        padding: 1.5rem;
        position: relative;
        transition: all 0.3s;
      }
      
      .nova-metric-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1), 0 0 15px rgba(6, 182, 212, 0.1);
        border-color: rgba(6, 182, 212, 0.3);
      }
      
      .nova-metric-card.wider {
        grid-column: span 2;
      }
      
      .nova-metric-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }
      
      .nova-metric-header h3 {
        font-size: 1rem;
        font-weight: 600;
        color: rgba(226, 232, 240, 0.9);
        margin: 0;
      }
      
      .nova-metric-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem 0.75rem;
        background: rgba(6, 182, 212, 0.1);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 1rem;
        font-size: 0.75rem;
        font-weight: 500;
        color: rgb(6, 182, 212);
      }
      
      .nova-metric-badge.success {
        background: rgba(16, 185, 129, 0.1);
        border-color: rgba(16, 185, 129, 0.3);
        color: rgb(16, 185, 129);
      }
      
      .nova-metric-badge.warning {
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.3);
        color: rgb(239, 68, 68);
      }
      
      .nova-circle-progress {
        display: flex;
        justify-content: center;
        margin: 0 auto 1.5rem;
        width: 120px;
        height: 120px;
        position: relative;
      }
      
      .nova-circle-progress.large {
        width: 160px;
        height: 160px;
      }
      
      .nova-progress-ring {
        transform: rotate(-90deg);
        width: 100%;
        height: 100%;
      }
      
      .nova-progress-ring-bg {
        fill: none;
        stroke: rgba(15, 23, 42, 0.6);
        stroke-width: 4;
      }
      
      .nova-progress-ring-circle {
        fill: none;
        stroke: url(#progressGradient);
        stroke-width: 4;
        stroke-linecap: round;
        transition: stroke-dashoffset 1s ease-in-out;
      }
      
      .nova-progress-ring-circle.success {
        stroke: rgb(16, 185, 129);
      }
      
      .nova-progress-ring-circle.warning {
        stroke: rgb(239, 68, 68);
      }
      
      .nova-progress-text {
        fill: rgba(226, 232, 240, 0.9);
        font-size: 16px;
        font-weight: 600;
        dominant-baseline: middle;
        text-anchor: middle;
      }
      
      .nova-progress-text.large {
        font-size: 22px;
      }
      
      .nova-progress-subtext {
        fill: rgba(226, 232, 240, 0.7);
        font-size: 10px;
        dominant-baseline: middle;
        text-anchor: middle;
      }
      
      .nova-metric-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-trend-indicator {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        font-weight: 500;
      }
      
      .nova-trend-indicator.positive {
        color: rgb(16, 185, 129);
      }
      
      .nova-trend-indicator.negative {
        color: rgb(239, 68, 68);
      }
      
      /* Horizontal Progress Bar */
      .nova-horizontal-progress {
        margin-bottom: 1rem;
      }
      
      .nova-horizontal-bar {
        height: 8px;
        background: rgba(15, 23, 42, 0.6);
        border-radius: 4px;
        overflow: hidden;
      }
      
      .nova-horizontal-fill {
        height: 100%;
        background: linear-gradient(90deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
        border-radius: 4px;
        width: 0;
        transition: width 1s ease-in-out;
      }
      
      .nova-horizontal-fill.success {
        background: linear-gradient(90deg, rgba(16, 185, 129, 0.8) 0%, rgba(5, 150, 105, 0.8) 100%);
      }
      
      .nova-metric-detail {
        display: flex;
        flex-direction: column;
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-stat-values {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 0.5rem;
      }
      
      .nova-detail-numbers {
        font-weight: 600;
        color: rgba(226, 232, 240, 0.9);
      }
      
      .nova-detail-percent {
        color: rgb(6, 182, 212);
      }
      
      .nova-metric-details {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-top: 1.5rem;
      }
      
      .nova-detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;
      }
      
      .nova-detail-label {
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-detail-value {
        font-weight: 600;
        color: rgba(226, 232, 240, 0.9);
      }
      
      /* Chart Grid */
      .nova-chart-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }
      
      .nova-chart-container {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        overflow: hidden;
        transition: all 0.3s;
      }
      
      .nova-chart-container:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1), 0 0 15px rgba(6, 182, 212, 0.1);
        border-color: rgba(6, 182, 212, 0.3);
      }
      
      .nova-chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(6, 182, 212, 0.1);
      }
      
      .nova-chart-header.full {
        margin-bottom: 0;
        border-bottom: 1px solid rgba(6, 182, 212, 0.2);
      }
      
      .nova-chart-header.small {
        padding: 1rem;
      }
      
      .nova-chart-header h3 {
        font-size: 1rem;
        font-weight: 600;
        color: rgba(226, 232, 240, 0.9);
        margin: 0;
      }
      
      .nova-chart-controls {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .nova-chart-badge {
        font-size: 0.75rem;
        background: rgba(6, 182, 212, 0.1);
        color: rgba(6, 182, 212, 0.9);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 1rem;
        padding: 0.25rem 0.75rem;
      }
      
      .nova-chart-badge.pulse {
        position: relative;
      }
      
      .nova-chart-badge.pulse::after {
        content: '';
        position: absolute;
        top: 50%;
        right: 0.5rem;
        transform: translateY(-50%);
        width: 6px;
        height: 6px;
        background: rgb(6, 182, 212);
        border-radius: 50%;
        animation: badge-pulse 2s infinite;
      }
      
      .nova-chart-badge.info {
        background: rgba(79, 70, 229, 0.1);
        color: rgba(79, 70, 229, 0.9);
        border-color: rgba(79, 70, 229, 0.3);
      }
      
      @keyframes badge-pulse {
        0%, 100% { opacity: 1; transform: translateY(-50%) scale(1); }
        50% { opacity: 0.5; transform: translateY(-50%) scale(1.5); }
      }
      
      .nova-chart-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.375rem;
        color: rgba(226, 232, 240, 0.7);
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .nova-chart-button:hover {
        background: rgba(15, 23, 42, 0.9);
        border-color: rgba(6, 182, 212, 0.4);
        color: rgb(6, 182, 212);
      }
      
      .nova-chart-content {
        padding: 1.5rem;
      }
      
      /* Panel Specific Styling */
      .nova-trend-panel {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        overflow: hidden;
        margin-top: 2rem;
      }
      
      .nova-chart-markers {
        display: flex;
        gap: 1.5rem;
        padding: 0 1.5rem 1.5rem;
      }
      
      .nova-chart-marker {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.75rem;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.375rem;
      }
      
      .nova-marker-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        background: rgba(6, 182, 212, 0.1);
        border-radius: 0.25rem;
        color: rgb(6, 182, 212);
      }
      
      .nova-marker-icon.warning {
        background: rgba(239, 68, 68, 0.1);
        color: rgb(239, 68, 68);
      }
      
      .nova-marker-icon.success {
        background: rgba(16, 185, 129, 0.1);
        color: rgb(16, 185, 129);
      }
      
      .nova-marker-content {
        display: flex;
        flex-direction: column;
      }
      
      .nova-marker-date {
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-marker-text {
        font-size: 0.875rem;
        color: rgba(226, 232, 240, 0.9);
      }
      
      /* Overview Panel Expanded State */
      .nova-overview-panel.expanded .nova-stats-grid {
        grid-template-columns: repeat(8, 1fr);
      }
      
      .nova-overview-panel.expanded .nova-stat-card {
        grid-column: span 2;
      }
      
      .nova-overview-panel.expanded .nova-advanced-metrics {
        grid-template-columns: repeat(8, 1fr);
      }
      
      .nova-overview-panel.expanded .nova-metric-card {
        grid-column: span 2;
      }
      
      .nova-overview-panel.expanded .nova-chart-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      /* Neural Network Visualization */
      .nova-network-diagram {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        padding: 1.5rem;
        height: 350px;
        display: flex;
        position: relative;
      }
      
      .nova-layers-container {
        display: flex;
        width: 100%;
        height: 100%;
        position: relative;
      }
      
      .nova-network-labels {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.7);
        padding: 1rem 0;
        width: 100px;
      }
      
      .nova-network-vis {
        display: flex;
        flex: 1;
        position: relative;
        height: 100%;
      }
      
      .nova-layer {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        padding: 1rem 0;
        z-index: 2;
        position: relative;
      }
      
      .nova-neuron {
        width: 12px;
        height: 12px;
        background: rgba(6, 182, 212, 0.3);
        border: 1px solid rgba(6, 182, 212, 0.5);
        border-radius: 50%;
        margin: 4px 0;
        position: relative;
      }
      
      .nova-neuron.active {
        background: rgba(6, 182, 212, 0.7);
        box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        animation: neuron-pulse 2s infinite;
      }
      
      .nova-neuron.active-output {
        background: rgba(16, 185, 129, 0.7);
        border-color: rgba(16, 185, 129, 0.9);
        box-shadow: 0 0 15px rgba(16, 185, 129, 0.6);
        animation: neuron-pulse 2s infinite;
      }
      
      @keyframes neuron-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.3); }
      }
      
      .nova-layer-connections {
        flex: 1;
        position: relative;
        z-index: 1;
      }
      
      .nova-connections {
        width: 100%;
        height: 100%;
      }
      
      .nova-metrics-labels {
        position: absolute;
        bottom: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.5rem;
        padding: 0.75rem;
      }
      
      .nova-metric-row {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        font-size: 0.75rem;
      }
      
      .nova-metric-name {
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-metric-value {
        color: rgb(6, 182, 212);
        font-weight: 500;
      }
      
      /* Neural Stats */
      .nova-neural-metrics {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        padding: 1.5rem;
      }
      
      .nova-neural-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }
      
      .nova-neural-header h3 {
        font-size: 1rem;
        font-weight: 600;
        color: rgba(226, 232, 240, 0.9);
        margin: 0;
      }
      
      .nova-neural-header.full {
        margin-bottom: 0;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(6, 182, 212, 0.2);
      }
      
      .nova-neural-badge {
        font-size: 0.75rem;
        background: rgba(6, 182, 212, 0.1);
        color: rgba(6, 182, 212, 0.9);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 1rem;
        padding: 0.25rem 0.75rem;
      }
      
      .nova-neural-badge.pulse {
        position: relative;
      }
      
      .nova-neural-badge.pulse::after {
        content: '';
        position: absolute;
        top: 50%;
        right: 0.5rem;
        transform: translateY(-50%);
        width: 6px;
        height: 6px;
        background: rgb(6, 182, 212);
        border-radius: 50%;
        animation: badge-pulse 2s infinite;
      }
      
      .nova-neural-controls {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .nova-neural-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.375rem;
        color: rgba(226, 232, 240, 0.7);
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .nova-neural-button:hover {
        background: rgba(15, 23, 42, 0.9);
        border-color: rgba(6, 182, 212, 0.4);
        color: rgb(6, 182, 212);
      }
      
      .nova-neural-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-top: 1.5rem;
      }
      
      .nova-neural-stat {
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.5rem;
        padding: 1.25rem;
        transition: all 0.3s;
      }
      
      .nova-neural-stat:hover {
        transform: translateY(-5px);
        border-color: rgba(6, 182, 212, 0.4);
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
      }
      
      .nova-neural-stat-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
      
      .nova-neural-stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        background: rgba(6, 182, 212, 0.1);
        border-radius: 0.375rem;
        color: rgb(6, 182, 212);
      }
      
      .nova-neural-stat-label {
        font-size: 0.875rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-neural-stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: rgb(6, 182, 212);
        margin-bottom: 1rem;
      }
      
      .nova-neural-stat-bar {
        height: 0.5rem;
        background: rgba(15, 23, 42, 0.5);
        border-radius: 0.25rem;
        overflow: hidden;
      }
      
      .nova-neural-stat-fill {
        height: 100%;
        background: linear-gradient(90deg, rgba(6, 182, 212, 0.7) 0%, rgba(79, 70, 229, 0.7) 100%);
        border-radius: 0.25rem;
        width: 0;
        transition: width 1s ease-in-out;
      }
      
      /* Neural Grid Layout */
      .nova-neural-grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 1.5rem;
        margin-bottom: 2.5rem;
      }
      
      .nova-neural-metrics {
        grid-column: span 5;
      }
      
      .nova-neural-chart {
        grid-column: span 7;
      }
      
      /* Neural Processing Panel */
      .nova-neural-processing {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 1.5rem;
      }
      
      .nova-processing-charts {
        grid-column: span 12;
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 1.5rem;
        margin-bottom: 2.5rem;
      }
      
      .nova-chart-container {
        grid-column: span 8;
      }
      
      .nova-processing-metrics {
        grid-column: span 4;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      
      .nova-cpu-gpu-metrics,
      .nova-processing-stats {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        overflow: hidden;
      }
      
      .nova-resource-grid {
        padding: 1.25rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1.25rem;
      }
      
      .nova-resource-meter {
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.5rem;
        padding: 1rem;
        transition: all 0.3s;
      }
      
      .nova-resource-meter:hover {
        background: rgba(15, 23, 42, 0.7);
        border-color: rgba(6, 182, 212, 0.4);
      }
      
      .nova-resource-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }
      
      .nova-resource-label {
        font-size: 0.875rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-resource-value {
        font-size: 0.875rem;
        font-weight: 600;
        color: rgb(6, 182, 212);
      }
      
      .nova-resource-bar {
        height: 0.5rem;
        background: rgba(15, 23, 42, 0.7);
        border-radius: 0.25rem;
        overflow: hidden;
        margin-bottom: 0.75rem;
      }
      
      .nova-resource-fill {
        height: 100%;
        background: linear-gradient(90deg, rgba(6, 182, 212, 0.7) 0%, rgba(79, 70, 229, 0.7) 100%);
        border-radius: 0.25rem;
        width: 0;
        transition: width 1s ease-in-out;
      }
      
      .nova-resource-details {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.6);
      }
      
      .nova-stats-list {
        padding: 1.25rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1.25rem;
      }
      
      .nova-stats-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      
      .nova-stats-label {
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.7);
        margin-bottom: 0.5rem;
      }
      
      .nova-stats-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: rgb(6, 182, 212);
      }
      
      .nova-stats-unit {
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.6);
        margin-top: 0.25rem;
      }
      
      .nova-embedding-visualization {
        grid-column: span 12;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        overflow: hidden;
      }
      
      .nova-embedding-map {
        padding: 1.5rem;
        display: flex;
      }
      
      .nova-embedding-container {
        flex: 1;
        height: 400px;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.5rem;
        position: relative;
        overflow: hidden;
      }
      
      .nova-embedding-clusters {
        position: absolute;
        inset: 0;
        z-index: 1;
      }
      
      .nova-cluster {
        position: absolute;
        border-radius: 50%;
        animation: cluster-pulse 3s infinite alternate;
      }
      
      @keyframes cluster-pulse {
        0% { transform: scale(1); }
        100% { transform: scale(1.1); }
      }
      
      .nova-cluster-label {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 0.875rem;
        font-weight: 600;
        text-shadow: 0 0 5px rgba(15, 23, 42, 0.9);
      }
      
      .nova-embedding-points {
        position: absolute;
        inset: 0;
        z-index: 2;
      }
      
      .nova-point {
        position: absolute;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: point-pulse 2s infinite alternate;
      }
      
      @keyframes point-pulse {
        0% { opacity: 0.5; }
        100% { opacity: 1; }
      }
      
      .nova-embedding-axis {
        position: absolute;
        background: rgba(226, 232, 240, 0.2);
      }
      
      .nova-embedding-axis.x-axis {
        bottom: 40px;
        left: 40px;
        right: 40px;
        height: 1px;
      }
      
      .nova-embedding-axis.y-axis {
        top: 40px;
        bottom: 40px;
        left: 40px;
        width: 1px;
      }
      
      .nova-axis-label {
        position: absolute;
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-axis-label.x-label {
        bottom: 15px;
        left: 50%;
        transform: translateX(-50%);
      }
      
      .nova-axis-label.y-label {
        top: 50%;
        left: 15px;
        transform: translateY(-50%) rotate(-90deg);
        transform-origin: left center;
      }
      
      .nova-embedding-legend {
        width: 200px;
        margin-left: 1.5rem;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.5rem;
        padding: 1rem;
      }
      
      .nova-legend-header {
        font-size: 0.875rem;
        font-weight: 600;
        color: rgba(226, 232, 240, 0.9);
        margin-bottom: 1rem;
        text-align: center;
      }
      
      .nova-legend-items {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      
      .nova-legend-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .nova-legend-color {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }
      
      .nova-legend-label {
        font-size: 0.875rem;
        color: rgba(226, 232, 240, 0.8);
      }
      
      /* Neural Prediction Panel */
      .nova-prediction-panel {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 1.5rem;
      }
      
      .nova-prediction-metrics {
        grid-column: span 12;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        overflow: hidden;
        margin-bottom: 1.5rem;
      }
      
      .nova-correlation-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1.5rem;
        padding: 1.5rem;
      }
      
      .nova-correlation-card {
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.5rem;
        padding: 1.25rem;
        transition: all 0.3s;
      }
      
      .nova-correlation-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        border-color: rgba(6, 182, 212, 0.4);
      }
      
      .nova-correlation-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.25rem;
      }
      
      .nova-correlation-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 0.5rem;
        color: white;
      }
      
      .nova-correlation-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: rgba(226, 232, 240, 0.9);
      }
      
      .nova-correlation-meter {
        margin-bottom: 1rem;
      }
      
      .nova-correlation-bar {
        height: 0.5rem;
        background: rgba(15, 23, 42, 0.5);
        border-radius: 0.25rem;
        overflow: hidden;
        margin-bottom: 0.5rem;
      }
      
      .nova-correlation-fill {
        height: 100%;
        border-radius: 0.25rem;
        width: 0;
        transition: width 1s ease-in-out;
      }
      
      .nova-correlation-value {
        font-size: 0.875rem;
        font-weight: 600;
        color: rgba(226, 232, 240, 0.9);
        text-align: right;
      }
      
      .nova-correlation-detail {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
      }
      
      .nova-detail-label {
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-detail-value {
        color: rgb(6, 182, 212);
        font-weight: 500;
      }
      
      .nova-prediction-system {
        grid-column: span 12;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        overflow: hidden;
        margin-bottom: 1.5rem;
      }
      
      .nova-prediction-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(6, 182, 212, 0.2);
      }
      
      .nova-prediction-title {
        display: flex;
        flex-direction: column;
      }
      
      .nova-prediction-subtitle {
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.7);
        margin-top: 0.25rem
    }

    `}</style>
    </div>
  );
};

// CountUp animation component
const CountUp = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    
    // Don't run if already at target
    if (start === end) return;
    
    // Calculate increment step based on target value
    let step = Math.max(1, Math.floor(end / 100));
    const totalSteps = end / step;
    const incrementTime = Math.floor(duration / totalSteps);
    
    // Start counter animation
    let timer = setInterval(() => {
      start += step;
      if (start > end) {
        start = end;
        clearInterval(timer);
      }
      setCount(start);
    }, incrementTime);
    
    // Clean up
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span ref={countRef}>{count.toLocaleString()}</span>;
};

export default BiasAnalyticsDashboard;