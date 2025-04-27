import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../Loading/Loading.jsx';
import CareerRoadmap from './CareerRoadmap.jsx';
import axios from 'axios';

const CareerVisualizer = () => {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('trajectory');
  const [careerData, setCareerData] = useState(null);
  const [careerPhase, setCareerPhase] = useState('early'); // early, mid, senior
  const [profileAnalysisEnabled, setProfileAnalysisEnabled] = useState(false);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(null);
  const [loadingLLM, setLoadingLLM] = useState(false);
  const [activeCareer, setActiveCareer] = useState('software-engineer');
  const visualizerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Dynamic LLM-generated state
  const [careerPaths, setCareerPaths] = useState([]);
  const [careerPhases, setCareerPhases] = useState([]);
  const [notableWomen, setNotableWomen] = useState({});
  const [careerProgressionData, setCareerProgressionData] = useState({});

  // Backend API URL - should match your environment configuration
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';

  // Fetch career paths from LLM
  const fetchCareerPaths = async () => {
    try {
      const response = await axios.get(`${API_URL}/career/paths`);
      if (response.data && response.data.success) {
        setCareerPaths(response.data.paths);
        // Set active career to first one if not already set
        if (!activeCareer && response.data.paths.length > 0) {
          setActiveCareer(response.data.paths[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching career paths:", error);
      // Fallback to minimal default paths if LLM fetch fails
      setCareerPaths([
        { id: 'software-engineer', name: 'Software Engineer', icon: 'code' },
        { id: 'data-scientist', name: 'Data Scientist', icon: 'chart' }
      ]);
    }
  };

  // Fetch career phases from LLM
  const fetchCareerPhases = async () => {
    try {
      const response = await axios.get(`${API_URL}/career/phases`);
      if (response.data && response.data.success) {
        setCareerPhases(response.data.phases);
      }
    } catch (error) {
      console.error("Error fetching career phases:", error);
      // Fallback to minimal default phases if LLM fetch fails
      setCareerPhases([
        { 
          id: 'early', 
          name: 'Early Career', 
          description: 'Building foundations and gaining initial experience',
          timeframe: '0-3 years'
        },
        { 
          id: 'mid', 
          name: 'Mid Career', 
          description: 'Specializing skills and taking on more responsibility',
          timeframe: '4-8 years'
        },
        { 
          id: 'senior', 
          name: 'Senior Level', 
          description: 'Leading projects and mentoring others in the field',
          timeframe: '8+ years'
        }
      ]);
    }
  };

  // Fetch notable women in tech for a specific career field from LLM
  const fetchNotableWomen = async (career) => {
    try {
      const response = await axios.get(`${API_URL}/career/notable-women?career=${career}`);
      if (response.data && response.data.success) {
        setNotableWomen(prevState => ({
          ...prevState,
          [career]: response.data.women
        }));
      }
    } catch (error) {
      console.error(`Error fetching notable women for ${career}:`, error);
      // We'll handle the empty state in the rendering logic
    }
  };

  // Fetch career progression data for a specific career and phase from LLM
  const fetchCareerProgressionData = async (career, phase) => {
    try {
      const response = await axios.get(`${API_URL}/career/progression?career=${career}&phase=${phase}`);
      if (response.data && response.data.success) {
        setCareerProgressionData(prevState => ({
          ...prevState,
          [career]: {
            ...(prevState[career] || {}),
            [phase]: response.data.progression
          }
        }));
        setCareerData(response.data.progression);
      }
    } catch (error) {
      console.error(`Error fetching progression data for ${career} at ${phase} phase:`, error);
      // We'll handle the empty state in the rendering logic
    }
  };

  // Get personalized recommendations from LLM
  const fetchGroqRecommendations = async () => {
    setLoadingLLM(true);
    
    try {
      // Get current user data - in a real app, this would come from your auth context or similar
      const userData = {
        currentRole: activeCareer.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        yearsExperience: careerPhase === 'early' ? 2 : careerPhase === 'mid' ? 6 : 10,
        skills: careerData?.skills || [],
        interests: ['AI/ML', 'Cloud Technologies', 'Leadership'],
        goals: ['Technical Leadership', 'Work-Life Balance', 'Skill Development']
      };
      
      const response = await axios.post(`${API_URL}/career/recommendations`, userData);
      
      if (response.data && response.data.success) {
        setPersonalizedRecommendations(response.data.recommendations.personalRecommendations);
      }
    } catch (error) {
      console.error("Error fetching recommendations from LLM:", error);
      // Show error message to user here
    } finally {
      setLoadingLLM(false);
    }
  };

  // Load initial data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      
      try {
        // Load career paths and phases first
        await fetchCareerPaths();
        await fetchCareerPhases();
        
        // Start initial loading animation
        setTimeout(() => {
          setIsLoading(false);
          
          // Start entry animations after loading
          setTimeout(() => {
            setAnimationComplete(true);
          }, 500);
        }, 1000);
      } catch (error) {
        console.error("Error loading initial data:", error);
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Load career data when activeCareer or careerPhase changes
  useEffect(() => {
    if (!isLoading && activeCareer && careerPhase) {
      // Check if we already have this data cached in state
      if (careerProgressionData[activeCareer]?.[careerPhase]) {
        setCareerData(careerProgressionData[activeCareer][careerPhase]);
      } else {
        // Otherwise fetch it
        fetchCareerProgressionData(activeCareer, careerPhase);
      }
    }
  }, [activeCareer, careerPhase, isLoading]);

  // Load notable women data when activeCareer changes and the "notable" tab is active
  useEffect(() => {
    if (!isLoading && activeCareer && activeTab === 'notable') {
      // Check if we already have this data cached
      if (!notableWomen[activeCareer]) {
        fetchNotableWomen(activeCareer);
      }
    }
  }, [activeCareer, activeTab, isLoading]);

  // Mouse movement effect for visualizer section
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (visualizerRef.current) {
        const rect = visualizerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Fetch personalized recommendations when profileAnalysisEnabled changes
  useEffect(() => {
    if (profileAnalysisEnabled && careerData) {
      fetchGroqRecommendations();
    }
  }, [profileAnalysisEnabled, careerData]);

  // Create animated particles
  useEffect(() => {
    const createParticles = () => {
      const container = document.querySelector('.cyber-particles-container');
      if (container) {
        // Remove any existing particles
        const existingParticles = container.querySelectorAll('.cyber-particle');
        existingParticles.forEach(p => p.remove());
        
        // Create new particles
        for (let i = 0; i < 50; i++) {
          const particle = document.createElement('div');
          particle.className = 'cyber-particle';
          
          // Randomize properties
          const size = Math.random() * 6 + 1;
          const posX = Math.random() * 100;
          const posY = Math.random() * 100;
          const animationDuration = Math.random() * 20 + 10;
          const animationDelay = Math.random() * 5;
          const opacity = Math.random() * 0.5 + 0.1;
          
          // Apply styles
          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          particle.style.left = `${posX}%`;
          particle.style.top = `${posY}%`;
          particle.style.opacity = opacity;
          particle.style.animationDuration = `${animationDuration}s`;
          particle.style.animationDelay = `${animationDelay}s`;
          
          container.appendChild(particle);
        }
      }
    };
    
    if (!isLoading) {
      createParticles();
    }
  }, [isLoading]);

  if (isLoading) {
    return <Loading />;
  }

  // Icon component based on type
  const getIcon = (type) => {
    switch(type) {
      case 'code':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case 'chart':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'design':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        );
      case 'tasks':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'server':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
        );
      case 'shield':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  return (
    <div className="cyber-career-visualizer">
      {/* Background particle animation container */}
      <div className="cyber-particles-container"></div>
      
      {/* Hero Section */}
      <section 
        ref={visualizerRef}
        className="cyber-visualizer-section"
        style={{
          backgroundPosition: `${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%`,
        }}
      >
        {/* Animated grid lines */}
        <div className="cyber-grid-lines"></div>
        
        {/* Glowing orbs */}
        <div className="cyber-glow-orb cyber-glow-orb-1"></div>
        <div className="cyber-glow-orb cyber-glow-orb-2"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-10">
            <h1 className="cyber-visualizer-title">
              Neural Path Optimizer
              <span className="cyber-blink">_</span>
            </h1>
            <p className="cyber-visualizer-subtitle">
              Advanced career trajectory visualization with cognitive enhancement through machine learning
            </p>
          </div>
          
          {/* Career Path Selection */}
          <div className="cyber-career-selector mb-12">
            <h2 className="cyber-section-title text-center mb-6">Neural Interface Path Selection</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {careerPaths.length > 0 ? (
                careerPaths.map(career => (
                  <button
                    key={career.id}
                    className={`cyber-career-option ${activeCareer === career.id ? 'cyber-career-active' : ''}`}
                    onClick={() => setActiveCareer(career.id)}
                  >
                    <div className="cyber-career-icon">
                      {getIcon(career.icon)}
                    </div>
                    <span className="cyber-career-name">{career.name}</span>
                    
                    {/* Decorative elements */}
                    <div className="cyber-corner cyber-corner-tl"></div>
                    <div className="cyber-corner cyber-corner-tr"></div>
                    <div className="cyber-corner cyber-corner-bl"></div>
                    <div className="cyber-corner cyber-corner-br"></div>
                  </button>
                ))
              ) : (
                <div className="col-span-full text-center py-4 cyber-loading-text">
                  <svg className="animate-spin h-5 w-5 mr-3 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading career paths...
                </div>
              )}
            </div>
          </div>
          
          {/* Career Phase Selection */}
          <div className="cyber-phase-selector mb-12" style={{
            opacity: animationComplete ? 1 : 0,
            transform: animationComplete ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s cubic-bezier(0.33, 1, 0.68, 1)',
            transitionDelay: '0.2s'
          }}>
            <div className="cyber-phase-track">
              {careerPhases.map((phase, index) => (
                <div 
                  key={phase.id} 
                  className={`cyber-phase-node ${careerPhase === phase.id ? 'cyber-phase-active' : ''}`}
                  onClick={() => setCareerPhase(phase.id)}
                >
                  <div className="cyber-phase-indicator">
                    <div className="cyber-phase-dot"></div>
                    {index < careerPhases.length - 1 && <div className="cyber-phase-line"></div>}
                  </div>
                  <div className="cyber-phase-content">
                    <h3 className="cyber-phase-title">{phase.name}</h3>
                    <p className="cyber-phase-description">{phase.description}</p>
                    <span className="cyber-phase-timeframe">{phase.timeframe}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Profile Analysis Toggle */}
          <div className="cyber-profile-toggle mb-12" style={{
            opacity: animationComplete ? 1 : 0,
            transform: animationComplete ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s cubic-bezier(0.33, 1, 0.68, 1)',
            transitionDelay: '0.4s'
          }}>
            <div className="cyber-toggle-container">
              <div className="cyber-toggle-label">
                <h3>Neural Profile Analysis</h3>
                <p>Enable personalized recommendations based on your profile data</p>
              </div>
              <label className="cyber-toggle">
                <input 
                  type="checkbox" 
                  checked={profileAnalysisEnabled}
                  onChange={() => setProfileAnalysisEnabled(!profileAnalysisEnabled)}
                />
                <span className="cyber-toggle-slider">
                  <span className="cyber-toggle-knob"></span>
                  <span className="cyber-toggle-on">ON</span>
                  <span className="cyber-toggle-off">OFF</span>
                </span>
              </label>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="cyber-tabs mb-8" style={{
  opacity: animationComplete ? 1 : 0,
  transform: animationComplete ? 'translateY(0)' : 'translateY(20px)',
  transition: 'all 0.6s cubic-bezier(0.33, 1, 0.68, 1)',
  transitionDelay: '0.6s'
}}>
  <div className="cyber-tabs-container">
    <button 
      className={`cyber-tab ${activeTab === 'trajectory' ? 'cyber-tab-active' : ''}`}
      onClick={() => setActiveTab('trajectory')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
      <span>Career Trajectory</span>
    </button>
    <button 
      className={`cyber-tab ${activeTab === 'stories' ? 'cyber-tab-active' : ''}`}
      onClick={() => setActiveTab('stories')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
      <span>Success Stories</span>
    </button>
    <button 
      className={`cyber-tab ${activeTab === 'notable' ? 'cyber-tab-active' : ''}`}
      onClick={() => setActiveTab('notable')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <span>Notable Women</span>
    </button>
    {/* Add new Roadmap tab */}
    <button 
      className={`cyber-tab ${activeTab === 'roadmap' ? 'cyber-tab-active' : ''}`}
      onClick={() => setActiveTab('roadmap')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
      <span>Career Roadmap</span>
    </button>
    {profileAnalysisEnabled && (
      <button 
        className={`cyber-tab ${activeTab === 'personal' ? 'cyber-tab-active' : ''}`}
        onClick={() => setActiveTab('personal')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span>Personalized Path</span>
      </button>
    )}
  </div>
</div>
        </div>
        
        {/* Main Content Area */}
        <div className="container mx-auto px-6 pb-16 relative z-10" style={{
          opacity: animationComplete ? 1 : 0,
          transform: animationComplete ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s cubic-bezier(0.33, 1, 0.68, 1)',
          transitionDelay: '0.8s'
        }}>
          {/* Career Trajectory Tab */}
          {activeTab === 'trajectory' && (
            <div className="cyber-content-panel">
              <div className="cyber-career-trajectory">
                <h2 className="cyber-content-title mb-6">
                  {activeCareer.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} - {careerPhases.find(p => p.id === careerPhase)?.name}
                </h2>
                
                {careerData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Skills to Master */}
                    <div className="cyber-skills-panel">
                      <h3 className="cyber-panel-title">Essential Skills</h3>
                      {careerData.skills && careerData.skills.length > 0 ? (
                        <ul className="cyber-skills-list">
                          {careerData.skills.map((skill, index) => (
                            <li key={index} className="cyber-skill-item">
                              <div className="cyber-skill-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <span>{skill}</span>
                              
                              {/* Animated progress bar */}
                              <div className="cyber-skill-progress">
                                <div 
                                  className="cyber-skill-bar" 
                                  style={{
                                    width: `${85 - index * 10}%`, 
                                    animationDelay: `${index * 0.2}s`
                                  }}
                                ></div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="cyber-loading-container py-4">
                          <p>Loading skills data...</p>
                        </div>
                      )}
                      
                      {/* Decorative elements */}
                      <div className="cyber-corner cyber-corner-tl"></div>
                      <div className="cyber-corner cyber-corner-tr"></div>
                      <div className="cyber-corner cyber-corner-bl"></div>
                      <div className="cyber-corner cyber-corner-br"></div>
                      <div className="cyber-scan-line"></div>
                    </div>
                    
                    {/* Continuous Learning */}
                    <div className="cyber-learning-panel">
                      <h3 className="cyber-panel-title">Learning Path</h3>
                      {careerData.learning && careerData.learning.length > 0 ? (
                        <ul className="cyber-learning-list">
                          {careerData.learning.map((item, index) => (
                            <li key={index} className="cyber-learning-item">
                              <div className="cyber-learning-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              </div>
                              <span>{item}</span>
                              
                              {/* Decorative pulse */}
                              <div className="cyber-learning-pulse" style={{ animationDelay: `${index * 0.3}s` }}></div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="cyber-loading-container py-4">
                          <p>Loading learning path data...</p>
                        </div>
                      )}
                      
                      {/* Decorative elements */}
                      <div className="cyber-corner cyber-corner-tl"></div>
                      <div className="cyber-corner cyber-corner-tr"></div>
                      <div className="cyber-corner cyber-corner-bl"></div>
                      <div className="cyber-corner cyber-corner-br"></div>
                      <div className="cyber-scan-line"></div>
                    </div>
                  </div>
                ) : (
                  <div className="cyber-loading-container py-8 text-center">
                    <div className="cyber-loading-spinner mx-auto mb-4">
                      <div className="cyber-spinner-ring"></div>
                      <div className="cyber-spinner-ring"></div>
                      <div className="cyber-spinner-ring"></div>
                    </div>
                    <p className="cyber-loading-text">Loading career progression data...</p>
                  </div>
                )}
                
                {/* Next Steps - This can be LLM-generated when careerData is available */}
                {careerData && (
                  <div className="cyber-next-steps mt-8">
                    <h3 className="cyber-panel-title">Neural Pathway Enhancement</h3>
                    <div className="cyber-next-steps-content">
                      <p className="cyber-next-steps-intro">
                        Optimize your career trajectory by following these recommended cognitive enhancements:
                      </p>
                      {careerData.nextSteps && careerData.nextSteps.length > 0 ? (
                        <ul className="cyber-next-steps-list">
                          {careerData.nextSteps.map((step, index) => (
                            <li key={index}>
                              <div className="cyber-step-number">{(index + 1).toString().padStart(2, '0')}</div>
                              <div className="cyber-step-content">
                                <h4>{step.title}</h4>
                                <p>{step.description}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="cyber-next-steps-list">
                          <li>
                            <div className="cyber-step-number">01</div>
                            <div className="cyber-step-content">
                              <h4>Master Core Competencies</h4>
                              <p>Focus on developing the essential skills listed for your current phase before attempting to advance.</p>
                            </div>
                          </li>
                          <li>
                            <div className="cyber-step-number">02</div>
                            <div className="cyber-step-content">
                              <h4>Expand Knowledge Network</h4>
                              <p>Continuously learn the emerging technologies and methodologies in your field through courses and hands-on projects.</p>
                            </div>
                          </li>
                          <li>
                            <div className="cyber-step-number">03</div>
                            <div className="cyber-step-content">
                              <h4>Connect Neural Nodes</h4>
                              <p>Build relationships with mentors and peers who can provide guidance and opportunities for growth.</p>
                            </div>
                          </li>
                          <li>
                            <div className="cyber-step-number">04</div>
                            <div className="cyber-step-content">
                              <h4>Demonstrate Capability Upgrades</h4>
                              <p>Take on projects that showcase your skills and create measurable impact for your organization.</p>
                            </div>
                          </li>
                        </ul>
                      )}
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="cyber-corner cyber-corner-tl"></div>
                    <div className="cyber-corner cyber-corner-tr"></div>
                    <div className="cyber-corner cyber-corner-bl"></div>
                    <div className="cyber-corner cyber-corner-br"></div>
                    <div className="cyber-scan-line"></div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Success Stories Tab */}
          {activeTab === 'stories' && (
            <div className="cyber-content-panel">
              <div className="cyber-success-stories">
                <h2 className="cyber-content-title mb-6">
                  Success Stories: {careerPhases.find(p => p.id === careerPhase)?.name} {activeCareer.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </h2>
                
                {careerData && careerData.stories && careerData.stories.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {careerData.stories.map((story, index) => (
                      <div key={index} className="cyber-story-panel">
                        <div className="cyber-story-header">
                          <div className="cyber-story-avatar">
                            <div className="cyber-avatar-placeholder">
                              {story.name.charAt(0)}
                            </div>
                            
                            {/* Orbital animation */}
                            <div className="cyber-avatar-orbit">
                              <div className="cyber-orbit-particle"></div>
                            </div>
                          </div>
                          <h3 className="cyber-story-name">{story.name}</h3>
                        </div>
                        
                        <div className="cyber-story-content">
                          <p className="cyber-story-text">{story.story}</p>
                          
                          <div className="cyber-story-advice">
                            <h4 className="cyber-advice-title">Neural Insight:</h4>
                            <p className="cyber-advice-text">"{story.advice}"</p>
                          </div>
                        </div>
                        
                        {/* Decorative elements */}
                        <div className="cyber-corner cyber-corner-tl"></div>
                        <div className="cyber-corner cyber-corner-tr"></div>
                        <div className="cyber-corner cyber-corner-bl"></div>
                        <div className="cyber-corner cyber-corner-br"></div>
                        <div className="cyber-scan-line"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="cyber-loading-container py-8 text-center">
                    <div className="cyber-loading-spinner mx-auto mb-4">
                      <div className="cyber-spinner-ring"></div>
                      <div className="cyber-spinner-ring"></div>
                      <div className="cyber-spinner-ring"></div>
                    </div>
                    <p className="cyber-loading-text">Loading success stories...</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Notable Women Tab */}
          {activeTab === 'notable' && (
            <div className="cyber-content-panel">
              <div className="cyber-notable-women">
                <h2 className="cyber-content-title mb-6">
                  Notable Women in {activeCareer.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </h2>
                
                {notableWomen[activeCareer] ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {notableWomen[activeCareer].map((woman, index) => (
                      <div key={index} className="cyber-woman-panel">
                        <div className="cyber-woman-image-container">
                          <div className="cyber-woman-image">
                            {/* Dynamic placeholder with initials */}
                            <div className="cyber-image-placeholder">
                              {woman.name.split(' ').map(name => name[0]).join('')}
                            </div>
                            
                            {/* Animated frame */}
                            <div className="cyber-image-frame">
                              <div className="cyber-frame-corner cyber-frame-tl"></div>
                              <div className="cyber-frame-corner cyber-frame-tr"></div>
                              <div className="cyber-frame-corner cyber-frame-bl"></div>
                              <div className="cyber-frame-corner cyber-frame-br"></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="cyber-woman-content">
                          <h3 className="cyber-woman-name">{woman.name}</h3>
                          <div className="cyber-woman-role">{woman.role}</div>
                          <p className="cyber-woman-achievements">{woman.achievements}</p>
                          
                          <div className="cyber-woman-quote">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 cyber-quote-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <p className="cyber-quote-text">"{woman.quote}"</p>
                          </div>
                        </div>
                        
                        {/* Decorative elements */}
                        <div className="cyber-corner cyber-corner-tl"></div>
                        <div className="cyber-corner cyber-corner-tr"></div>
                        <div className="cyber-corner cyber-corner-bl"></div>
                        <div className="cyber-corner cyber-corner-br"></div>
                        <div className="cyber-scan-line"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="cyber-loading-container py-8 text-center">
                    <div className="cyber-loading-spinner mx-auto mb-4">
                      <div className="cyber-spinner-ring"></div>
                      <div className="cyber-spinner-ring"></div>
                      <div className="cyber-spinner-ring"></div>
                    </div>
                    <p className="cyber-loading-text">Loading notable women in this field...</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Personalized Recommendations Tab */}
          {activeTab === 'personal' && (
            <div className="cyber-content-panel">
              <div className="cyber-personalized">
                <h2 className="cyber-content-title mb-6">
                  Personalized Career Enhancement
                </h2>
                
                {loadingLLM ? (
                  <div className="cyber-loading-llm">
                    <div className="cyber-loading-container">
                      <div className="cyber-loading-spinner">
                        <div className="cyber-spinner-ring"></div>
                        <div className="cyber-spinner-ring"></div>
                        <div className="cyber-spinner-ring"></div>
                      </div>
                      <p className="cyber-loading-text">Neural Interface Computing...</p>
                      <div className="cyber-loading-progress">
                        <div className="cyber-progress-track">
                          <div className="cyber-progress-bar"></div>
                        </div>
                        <div className="cyber-loading-status">
                          <span className="cyber-status-text">Analyzing career patterns...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : personalizedRecommendations ? (
                  <div className="cyber-recommendations">
                    <div className="cyber-recommendations-intro">
                      <p>{personalizedRecommendations.personalization}</p>
                    </div>
                    
                    {/* Learning Resources */}
                    <div className="cyber-learning-resources mt-8">
                      <h3 className="cyber-section-subtitle mb-4">Recommended Learning Path</h3>
                      
                      <div className="cyber-learning-path-container">
                        {personalizedRecommendations.learningPath && personalizedRecommendations.learningPath.length > 0 && (
                          <>
                            <div className="cyber-learning-path-name">
                              <div className="cyber-path-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                              <h4>{personalizedRecommendations.learningPath[0].name}</h4>
                            </div>
                            
                            <div className="cyber-resources-grid">
                              {personalizedRecommendations.learningPath[0].resources.map((resource, index) => (
                                <div key={index} className="cyber-resource-card">
                                  <div className="cyber-resource-type">
                                    {resource.type === 'Course' && (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13c-1.168-.776-2.754-1.253-4.5-1.253-1.746 0-3.332.477-4.5 1.253" />
                                      </svg>
                                    )}
                                    {resource.type === 'Book' && (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13c-1.168-.776-2.754-1.253-4.5-1.253-1.746 0-3.332.477-4.5 1.253" />
                                      </svg>
                                    )}
                                    {resource.type === 'Community' && (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                      </svg>
                                    )}
                                    <span>{resource.type}</span>
                                  </div>
                                  
                                  <div className="cyber-resource-content">
                                    <h5 className="cyber-resource-title">{resource.title}</h5>
                                    {resource.author && <p className="cyber-resource-author">By {resource.author}</p>}
                                    {resource.provider && <p className="cyber-resource-provider">Provider: {resource.provider}</p>}
                                    {resource.duration && <p className="cyber-resource-duration">Duration: {resource.duration}</p>}
                                    {resource.description && <p className="cyber-resource-description">{resource.description}</p>}
                                  </div>
                                  
                                  <a href={resource.link || "#"} className="cyber-resource-link">
                                    <span>Access</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                  </a>
                                  
                                  {/* Decorative elements */}
                                  <div className="cyber-corner cyber-corner-tl"></div>
                                  <div className="cyber-corner cyber-corner-tr"></div>
                                  <div className="cyber-corner cyber-corner-bl"></div>
                                  <div className="cyber-corner cyber-corner-br"></div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Next Steps */}
                    {personalizedRecommendations.nextSteps && personalizedRecommendations.nextSteps.length > 0 && (
                      <div className="cyber-next-actions mt-8">
                        <h3 className="cyber-section-subtitle mb-4">Recommended Neural Actions</h3>
                        
                        <div className="cyber-actions-grid">
                          {personalizedRecommendations.nextSteps.map((step, index) => (
                            <div key={index} className="cyber-action-item">
                              <div className="cyber-action-number">{(index + 1).toString().padStart(2, '0')}</div>
                              <p className="cyber-action-text">{step}</p>
                              
                              {/* Decorative pulse */}
                              <div className="cyber-action-pulse" style={{ animationDelay: `${index * 0.5}s` }}></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="cyber-activate-llm">
                    <div className="cyber-activate-container">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 cyber-activate-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <h3 className="cyber-activate-title">Initiate Neural Analysis</h3>
                      <p className="cyber-activate-text">
                        Connect to the Groq LLM neural interface to generate personalized career recommendations based on your profile data.
                      </p>
                      <button 
                        className="cyber-activate-button"
                        onClick={fetchGroqRecommendations}
                      >
                        <span className="relative z-10">Initialize Analysis</span>
                        {/* Button animation */}
                        <span className="cyber-button-glow"></span>
                      </button>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="cyber-corner cyber-corner-tl"></div>
                    <div className="cyber-corner cyber-corner-tr"></div>
                    <div className="cyber-corner cyber-corner-bl"></div>
                    <div className="cyber-corner cyber-corner-br"></div>
                    <div className="cyber-scan-line"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Career Roadmap Tab */}
          {activeTab === 'roadmap' && (
            <CareerRoadmap activeCareer={activeCareer} />
          )}
        </div>
        
        {/* Status ticker */}
        <div className="cyber-status-ticker">
          <p className="cyber-ticker-text">
            Career optimization protocol active • Neural path synchronization • Cognitive enhancement in progress • Data matrix analysis • Career trajectory visualization
          </p>
        </div>
      </section>
      
      {/* Custom styling */}
      <style jsx>{`
        /* Core cyberpunk styling */
        .cyber-career-visualizer {
          min-height: 100vh;
          background-color: rgba(15, 23, 42, 0.95);
          font-family: 'JetBrains Mono', monospace;
          position: relative;
          overflow: hidden;
          color: rgb(226, 232, 240);
        }
        
        /* Visualizer Section */
        .cyber-visualizer-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(17, 24, 39, 0.98) 100%);
          isolation: isolate;
          padding: 2rem 0;
        }
        
        .cyber-grid-lines {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image: 
            linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: grid-move 30s linear infinite;
          opacity: 0.2;
        }
        
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        
        .cyber-glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.2;
        }
        
        .cyber-glow-orb-1 {
          top: 15%;
          left: 15%;
          width: 16rem;
          height: 16rem;
          background: rgb(6, 182, 212);
          animation: float 8s ease-in-out infinite;
        }
        
        .cyber-glow-orb-2 {
          bottom: 20%;
          right: 15%;
          width: 18rem;
          height: 18rem;
          background: rgb(79, 70, 229);
          animation: float 10s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        
        .cyber-visualizer-title {
          font-size: 3rem;
          font-weight: 700;
          background: linear-gradient(90deg, rgb(6, 182, 212) 0%, rgb(79, 70, 229) 50%, rgb(124, 58, 237) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          margin-bottom: 1rem;
          line-height: 1.2;
          letter-spacing: 0.5px;
          text-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }
        
        .cyber-visualizer-subtitle {
          font-size: 1.125rem;
          color: rgba(226, 232, 240, 0.8);
          max-width: 36rem;
          margin: 0 auto;
        }
        
        .cyber-blink {
          animation: blink 1s step-end infinite;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .cyber-section-title {
          font-size: 1.5rem;
          font-weight: 600;
          background: linear-gradient(90deg, rgb(6, 182, 212) 0%, rgb(79, 70, 229) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }
        
        .cyber-section-subtitle {
          font-size: 1.25rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
        }
        
        /* Career Selector */
        .cyber-career-selector {
          position: relative;
          z-index: 10;
        }
        
        .cyber-career-option {
          position: relative;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          padding: 1.25rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                      0 2px 4px -1px rgba(0, 0, 0, 0.06),
                      0 0 0 1px rgba(6, 182, 212, 0.1) inset;
          cursor: pointer;
        }
        
        .cyber-career-option:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                      0 4px 6px -2px rgba(0, 0, 0, 0.05),
                      0 0 0 1px rgba(6, 182, 212, 0.2) inset,
                      0 0 20px rgba(6, 182, 212, 0.2);
          border-color: rgba(6, 182, 212, 0.5);
        }
        
        .cyber-career-active {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
          border-color: rgba(6, 182, 212, 0.8);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                      0 4px 6px -2px rgba(0, 0, 0, 0.05),
                      0 0 0 1px rgba(6, 182, 212, 0.3) inset,
                      0 0 20px rgba(6, 182, 212, 0.3);
        }
        
        .cyber-career-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
          border-radius: 0.5rem;
          margin-bottom: 0.75rem;
          color: rgb(6, 182, 212);
          transition: all 0.3s;
        }
        
        .cyber-career-option:hover .cyber-career-icon {
          transform: scale(1.1);
          color: rgb(226, 232, 240);
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
        }
        
        .cyber-career-active .cyber-career-icon {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
          color: rgb(226, 232, 240);
        }
        
        .cyber-career-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
          text-align: center;
        }
        
        /* Phase Selector */
        .cyber-phase-selector {
          position: relative;
          z-index: 10;
        }
        
        .cyber-phase-track {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: relative;
          max-width: 48rem;
          margin: 0 auto;
        }
        
        @media (min-width: 768px) {
          .cyber-phase-track {
            flex-direction: row;
            gap: 0;
          }
        }
        
        .cyber-phase-node {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          cursor: pointer;
        }
        
        .cyber-phase-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          height: 2rem;
          margin-bottom: 0.5rem;
        }
        
        @media (min-width: 768px) {
          .cyber-phase-indicator {
            flex-direction: row;
            height: auto;
          }
        }
        
        .cyber-phase-dot {
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.8);
          border: 2px solid rgba(6, 182, 212, 0.5);
          z-index: 1;
          transition: all 0.3s;
        }
        
        .cyber-phase-active .cyber-phase-dot {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
          border-color: rgba(226, 232, 240, 0.9);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
          transform: scale(1.2);
        }
        
        .cyber-phase-line {
          flex: 1;
          height: 2px;
          background: rgba(6, 182, 212, 0.3);
          position: relative;
        }
        
        @media (min-width: 768px) {
          .cyber-phase-line {
            width: 100%;
            height: 2px;
          }
        }
        
        .cyber-phase-content {
          padding: 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          transition: all 0.3s;
        }
        
        .cyber-phase-active .cyber-phase-content {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%);
          border-color: rgba(6, 182, 212, 0.8);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                      0 4px 6px -2px rgba(0, 0, 0, 0.05),
                      0 0 0 1px rgba(6, 182, 212, 0.2) inset,
                      0 0 20px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-phase-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 0.25rem;
        }
        
        .cyber-phase-description {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.7);
          margin-bottom: 0.5rem;
        }
        
        .cyber-phase-timeframe {
          font-size: 0.75rem;
          font-weight: 500;
          color: rgb(6, 182, 212);
          background: rgba(6, 182, 212, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          display: inline-block;
        }
        
        /* Profile Toggle */
        .cyber-profile-toggle {
          position: relative;
          z-index: 10;
        }
        
        .cyber-toggle-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          padding: 1.5rem;
          max-width: 48rem;
          margin: 0 auto;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                      0 2px 4px -1px rgba(0, 0, 0, 0.06),
                      0 0 0 1px rgba(6, 182, 212, 0.1) inset;
        }
        
        @media (min-width: 768px) {
          .cyber-toggle-container {
            flex-direction: row;
            justify-content: space-between;
          }
        }
        
        .cyber-toggle-label {
          flex: 1;
        }
        
        .cyber-toggle-label h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 0.5rem;
        }
        
        .cyber-toggle-label p {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.7);
        }
        
        .cyber-toggle {
          position: relative;
          display: inline-block;
          width: 3.5rem;
          height: 2rem;
        }
        
        .cyber-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .cyber-toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.5);
          border-radius: 2rem;
          transition: all 0.3s;
          overflow: hidden;
        }
        
        .cyber-toggle-knob {
          position: absolute;
          content: "";
          height: 1.5rem;
          width: 1.5rem;
          left: 0.25rem;
          bottom: 0.25rem;
          background: rgba(226, 232, 240, 0.9);
          border-radius: 50%;
          transition: transform 0.3s, background 0.3s;
          z-index: 2;
        }
        
        .cyber-toggle input:checked + .cyber-toggle-slider {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
          border-color: rgba(226, 232, 240, 0.3);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);
        }
        
        .cyber-toggle input:checked + .cyber-toggle-slider .cyber-toggle-knob {
          transform: translateX(1.5rem);
          background: rgb(226, 232, 240);
        }
        
        .cyber-toggle-on,
        .cyber-toggle-off {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.625rem;
          font-weight: 700;
          transition: opacity 0.3s;
        }
        
        .cyber-toggle-on {
          right: 0.5rem;
          color: rgba(226, 232, 240, 0.9);
          opacity: 0;
        }
        
        .cyber-toggle-off {
          left: 0.5rem;
          color: rgba(6, 182, 212, 0.8);
          opacity: 1;
        }
        
        .cyber-toggle input:checked + .cyber-toggle-slider .cyber-toggle-on {
          opacity: 1;
        }
        
        .cyber-toggle input:checked + .cyber-toggle-slider .cyber-toggle-off {
          opacity: 0;
        }
        
        /* Tabs */
        .cyber-tabs {
          position: relative;
          z-index: 10;
        }
        
        .cyber-tabs-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          border-bottom: 1px solid rgba(6, 182, 212, 0.3);
          padding-bottom: 0.5rem;
        }
        
        .cyber-tab {
          position: relative;
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.7);
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid transparent;
          border-radius: 0.5rem;
          transition: all 0.3s;
          cursor: pointer;
        }
        
        .cyber-tab:hover {
          background: rgba(15, 23, 42, 0.6);
          color: rgba(226, 232, 240, 0.9);
          border-color: rgba(6, 182, 212, 0.3);
        }
        
        .cyber-tab-active {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
          color: rgb(6, 182, 212);
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                      0 2px 4px -1px rgba(0, 0, 0, 0.06),
                      0 0 10px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-tab-active::after {
          content: '';
          position: absolute;
          bottom: -0.5rem;
          left: 50%;
          transform: translateX(-50%);
          width: 50%;
          height: 2px;
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
          border-radius: 1px;
        }
        
        /* Content Panel */
        .cyber-content-panel {
          position: relative;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          padding: 2rem;
          z-index: 10;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                      0 2px 4px -1px rgba(0, 0, 0, 0.06),
                      0 0 0 1px rgba(6, 182, 212, 0.1) inset,
                      0 0 20px rgba(6, 182, 212, 0.1);
          backdrop-filter: blur(8px);
        }
        
        .cyber-content-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 1.5rem;
          border-bottom: 1px solid rgba(6, 182, 212, 0.3);
          padding-bottom: 0.75rem;
        }
        
        /* Skills Panel */
        .cyber-skills-panel,
        .cyber-learning-panel {
          position: relative;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          padding: 1.5rem;
          overflow: hidden;
        }
        
        .cyber-panel-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: rgb(6, 182, 212);
          margin-bottom: 1rem;
        }
        
        .cyber-skills-list,
        .cyber-learning-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .cyber-skill-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-skill-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.5rem;
          height: 1.5rem;
          background: rgba(6, 182, 212, 0.2);
          border-radius: 50%;
          color: rgb(6, 182, 212);
          flex-shrink: 0;
        }
        
        .cyber-skill-progress {
          flex: 1;
          height: 0.5rem;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 0.25rem;
          overflow: hidden;
        }
        
        .cyber-skill-bar {
          height: 100%;
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
          border-radius: 0.25rem;
          animation: skill-animate 1.5s ease forwards;
          transform-origin: left;
          transform: scaleX(0);
        }
        
        @keyframes skill-animate {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        
        .cyber-learning-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-learning-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.5rem;
          height: 1.5rem;
          background: rgba(79, 70, 229, 0.2);
          border-radius: 50%;
          color: rgb(79, 70, 229);
          flex-shrink: 0;
        }
        
        .cyber-learning-pulse {
          position: absolute;
          right: 0;
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background: rgb(6, 182, 212);
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(6, 182, 212, 0); }
          100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
        }
        
        /* Next Steps */
        .cyber-next-steps {
          position: relative;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          padding: 1.5rem;
          overflow: hidden;
        }
        
        .cyber-next-steps-intro {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.7);
          margin-bottom: 1.5rem;
        }
        
        .cyber-next-steps-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        @media (min-width: 768px) {
          .cyber-next-steps-list {
            grid-template-columns: 1fr 1fr;
          }
        }
        
        .cyber-next-steps-list li {
          display: flex;
          gap: 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          padding: 1rem;
          transition: all 0.3s;
        }
        
        .cyber-next-steps-list li:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                      0 4px 6px -2px rgba(0, 0, 0, 0.05),
                      0 0 0 1px rgba(6, 182, 212, 0.3) inset,
                      0 0 20px rgba(6, 182, 212, 0.2);
          border-color: rgba(6, 182, 212, 0.4);
        }
        
        .cyber-step-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: rgb(6, 182, 212);
          line-height: 1;
          flex-shrink: 0;
          text-shadow: 0 0 5px rgba(6, 182, 212, 0.5);
        }
        
        .cyber-step-content h4 {
          font-size: 1rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 0.5rem;
        }
        
        .cyber-step-content p {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.7);
        }
        
        /* Success Stories */
        .cyber-story-panel {
          position: relative;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          padding: 1.5rem;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .cyber-story-panel:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                      0 4px 6px -2px rgba(0, 0, 0, 0.05),
                      0 0 0 1px rgba(6, 182, 212, 0.3) inset,
                      0 0 20px rgba(6, 182, 212, 0.2);
          border-color: rgba(6, 182, 212, 0.5);
        }
        
        .cyber-story-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .cyber-story-avatar {
          position: relative;
          width: 3rem;
          height: 3rem;
          flex-shrink: 0;
        }
        
        .cyber-avatar-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
          border-radius: 50%;
          color: rgba(226, 232, 240, 0.9);
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .cyber-avatar-orbit {
          position: absolute;
          inset: -0.25rem;
          border: 1px dashed rgba(6, 182, 212, 0.5);
          border-radius: 50%;
          animation: rotate 10s linear infinite;
        }
        
        .cyber-orbit-particle {
          position: absolute;
          top: 0;
          left: 50%;
          width: 0.5rem;
          height: 0.5rem;
          background: rgb(6, 182, 212);
          border-radius: 50%;
          transform: translateX(-50%);
          animation: pulse 2s infinite;
        }
        
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .cyber-story-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-story-text {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.7);
          margin-bottom: 1rem;
          line-height: 1.5;
        }
        
        .cyber-story-advice {
          background: rgba(15, 23, 42, 0.6);
          border-left: 2px solid rgb(6, 182, 212);
          padding: 0.75rem 1rem;
          border-radius: 0 0.25rem 0.25rem 0;
        }
        
        .cyber-advice-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: rgb(6, 182, 212);
          margin-bottom: 0.25rem;
        }
        
        .cyber-advice-text {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.9);
          font-style: italic;
        }
        
        /* Notable Women */
        .cyber-woman-panel {
          position: relative;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          padding: 1.5rem;
          overflow: hidden;
          transition: all 0.3s;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .cyber-woman-panel:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                      0 4px 6px -2px rgba(0, 0, 0, 0.05),
                      0 0 0 1px rgba(6, 182, 212, 0.3) inset,
                      0 0 20px rgba(6, 182, 212, 0.2);
          border-color: rgba(6, 182, 212, 0.5);
        }
        
        .cyber-woman-image-container {
          margin-bottom: 1rem;
        }
        
        .cyber-woman-image {
          position: relative;
          width: 8rem;
          height: 8rem;
          margin: 0 auto;
        }
        
        .cyber-image-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
          border-radius: 50%;
          color: rgba(226, 232, 240, 0.9);
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .cyber-image-frame {
          position: absolute;
          inset: -0.5rem;
          border: 1px solid rgba(6, 182, 212, 0.5);
          border-radius: 50%;
        }
        
        .cyber-frame-corner {
          position: absolute;
          width: 1rem;
          height: 1rem;
          border-color: rgb(6, 182, 212);
          border-style: solid;
          border-width: 0;
        }
        
        .cyber-frame-tl {
          top: 0;
          left: 0;
          border-top-width: 2px;
          border-left-width: 2px;
          border-top-left-radius: 0.5rem;
        }
        
        .cyber-frame-tr {
          top: 0;
          right: 0;
          border-top-width: 2px;
          border-right-width: 2px;
          border-top-right-radius: 0.5rem;
        }
        
        .cyber-frame-bl {
          bottom: 0;
          left: 0;
          border-bottom-width: 2px;
          border-left-width: 2px;
          border-bottom-left-radius: 0.5rem;
        }
        
        .cyber-frame-br {
          bottom: 0;
          right: 0;
          border-bottom-width: 2px;
          border-right-width: 2px;
          border-bottom-right-radius: 0.5rem;
        }
        
        .cyber-woman-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .cyber-woman-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 0.25rem;
          text-align: center;
        }
        
        .cyber-woman-role {
          font-size: 0.875rem;
          color: rgb(6, 182, 212);
          margin-bottom: 1rem;
          text-align: center;
        }
        
        .cyber-woman-achievements {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.7);
          margin-bottom: 1rem;
          line-height: 1.5;
        }
        
        .cyber-woman-quote {
          margin-top: auto;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          padding: 1rem;
          position: relative;
        }
        
        .cyber-quote-icon {
          position: absolute;
          top: -0.75rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.8);
          border-radius: 50%;
          padding: 0.25rem;
          color: rgb(6, 182, 212);
        }
        
        .cyber-quote-text {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.9);
          font-style: italic;
          line-height: 1.5;
        }
        
        /* Personalized Recommendations */
        .cyber-activate-llm {
          position: relative;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          padding: 2rem;
          overflow: hidden;
          text-align: center;
        }
        
        .cyber-activate-container {
          max-width: 32rem;
          margin: 0 auto;
        }
        
        .cyber-activate-icon {
          color: rgb(6, 182, 212);
          margin-bottom: 1.5rem;
        }
        
        .cyber-activate-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 1rem;
        }
        
        .cyber-activate-text {
          font-size: 1rem;
          color: rgba(226, 232, 240, 0.7);
          margin-bottom: 2rem;
          line-height: 1.5;
        }
        
        .cyber-activate-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
          color: rgba(226, 232, 240, 0.9);
          font-weight: 500;
          border-radius: 0.375rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .cyber-activate-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                      0 4px 6px -2px rgba(0, 0, 0, 0.05),
                      0 0 20px rgba(6, 182, 212, 0.3);
        }
        
        .cyber-button-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .cyber-activate-button:hover .cyber-button-glow {
          opacity: 0.3;
          animation: button-pulse 2s infinite;
        }
        
        @keyframes button-pulse {
          0% { transform: scale(0.95); opacity: 0.3; }
          50% { transform: scale(1.05); opacity: 0.5; }
          100% { transform: scale(0.95); opacity: 0.3; }
        }
        
        .cyber-loading-llm {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 16rem;
        }
        
        .cyber-loading-container {
          text-align: center;
          max-width: 32rem;
        }
        
        .cyber-loading-spinner {
          position: relative;
          width: 6rem;
          height: 6rem;
          margin: 0 auto 2rem;
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
          font-size: 1.125rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 1.5rem;
        }
        
        .cyber-loading-progress {
          width: 100%;
        }
        
        .cyber-progress-track {
          width: 100%;
          height: 0.5rem;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 0.25rem;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        
        .cyber-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
          border-radius: 0.25rem;
          width: 20%;
          position: relative;
          animation: progress 2s linear infinite;
        }
        
        @keyframes progress {
          0% { width: 10%; left: 0%; }
          50% { width: 30%; }
          100% { width: 10%; left: 90%; }
        }
        
        .cyber-loading-status {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.7);
        }
        
        .cyber-status-text {
          display: inline-block;
          animation: status-change 10s steps(1) infinite;
        }
        
        @keyframes status-change {
          0% { content: "Analyzing career patterns..."; }
          25% { content: "Processing profile data..."; }
          50% { content: "Optimizing neural pathways..."; }
          75% { content: "Generating recommendations..."; }
        }
        
        .cyber-recommendations {
          position: relative;
        }
        
        .cyber-recommendations-intro {
          font-size: 1rem;
          color: rgba(226, 232, 240, 0.9);
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          padding: 1.5rem;
          line-height: 1.5;
        }
        
        .cyber-learning-path-container {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          padding: 1.5rem;
          overflow: hidden;
        }
        
        .cyber-learning-path-name {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        
        .cyber-path-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          color: rgb(6, 182, 212);
        }
        
        .cyber-learning-path-name h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-resources-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        @media (min-width: 768px) {
          .cyber-resources-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        .cyber-resource-card {
          position: relative;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: all 0.3s;
        }
        
        .cyber-resource-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                      0 4px 6px -2px rgba(0, 0, 0, 0.05),
                      0 0 10px rgba(6, 182, 212, 0.2);
          border-color: rgba(6, 182, 212, 0.4);
        }
        
        .cyber-resource-type {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: rgb(6, 182, 212);
          background: rgba(6, 182, 212, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          margin-bottom: 0.75rem;
          width: fit-content;
        }
        
        .cyber-resource-content {
          flex: 1;
          margin-bottom: 1rem;
        }
        
        .cyber-resource-title {
          font-size: 1rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 0.5rem;
        }
        
        .cyber-resource-author,
        .cyber-resource-provider,
        .cyber-resource-duration,
        .cyber-resource-description {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.7);
          margin-top: 0.25rem;
        }
        
        .cyber-resource-link {
          display: inline-flex;
          align-items: center;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgb(6, 182, 212);
          padding: 0.5rem 0.75rem;
          background: rgba(6, 182, 212, 0.1);
          border-radius: 0.25rem;
          transition: all 0.3s;
          margin-top: auto;
          width: fit-content;
        }
        
        .cyber-resource-link:hover {
          background: rgba(6, 182, 212, 0.2);
          transform: translateX(5px);
        }
        
        .cyber-actions-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        @media (min-width: 768px) {
          .cyber-actions-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        
        .cyber-action-item {
          position: relative;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          padding: 1rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          transition: all 0.3s;
        }
        
        .cyber-action-item:hover {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(6, 182, 212, 0.4);
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                      0 4px 6px -2px rgba(0, 0, 0, 0.05),
                      0 0 10px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-action-number {
          font-size: 1.25rem;
          font-weight: 700;
          color: rgb(6, 182, 212);
          flex-shrink: 0;
        }
        
        .cyber-action-text {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.9);
          line-height: 1.5;
        }
        
        .cyber-action-pulse {
          position: absolute;
          bottom: 0.5rem;
          right: 0.5rem;
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background: rgb(6, 182, 212);
          animation: pulse 2s infinite;
        }
        
        /* Status ticker */
        .cyber-status-ticker {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 50%, rgba(6, 182, 212, 0.8) 100%);
          color: rgb(15, 23, 42);
          padding: 0.5rem 0;
          text-align: center;
          font-size: 0.875rem;
          font-weight: 500;
          transform: translateY(0);
          transition: transform 0.5s;
          overflow: hidden;
          z-index: 20;
        }
        
        .cyber-status-ticker:hover {
          transform: translateY(-5px);
        }
        
        .cyber-ticker-text {
          display: inline-block;
          white-space: nowrap;
          animation: scroll-x 20s linear infinite;
        }
        
        @keyframes scroll-x {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        
        /* Cyber corners */
        .cyber-corner {
          position: absolute;
          width: 12px;
          height: 12px;
          z-index: 1;
        }
        
        .cyber-corner-tl {
          top: 0;
          left: 0;
          border-top: 2px solid rgb(6, 182, 212);
          border-left: 2px solid rgb(6, 182, 212);
        }
        
        .cyber-corner-tr {
          top: 0;
          right: 0;
          border-top: 2px solid rgb(6, 182, 212);
          border-right: 2px solid rgb(6, 182, 212);
        }
        
        .cyber-corner-bl {
          bottom: 0;
          left: 0;
          border-bottom: 2px solid rgb(6, 182, 212);
          border-left: 2px solid rgb(6, 182, 212);
        }
        
        .cyber-corner-br {
          bottom: 0;
          right: 0;
          border-bottom: 2px solid rgb(6, 182, 212);
          border-right: 2px solid rgb(6, 182, 212);
        }
        
        .cyber-scan-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.8), transparent);
          animation: scan-line 3s linear infinite;
          opacity: 0.5;
        }
        
        @keyframes scan-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
        
        /* Particles */
        .cyber-particles-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        
        .cyber-particle {
          position: absolute;
          background: linear-gradient(45deg, rgb(6, 182, 212), rgb(79, 70, 229));
          border-radius: 50%;
          animation: float-around infinite linear;
        }
        
        @keyframes float-around {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(50px, -20px) rotate(90deg);
          }
          50% {
            transform: translate(0, -40px) rotate(180deg);
          }
          75% {
            transform: translate(-50px, -20px) rotate(270deg);
          }
          100% {
            transform: translate(0, 0) rotate(360deg);
          }
        }
      `}</style>
      </div>
    );
  };
  
  export default CareerVisualizer;