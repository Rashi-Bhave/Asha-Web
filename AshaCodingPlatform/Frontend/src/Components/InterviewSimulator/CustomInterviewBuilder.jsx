import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import InterviewNavigation from './InterviewNavigation';
// import { useAuth } from '../../Contexts/AuthContext'; // Assuming you have an AuthContext

const CustomInterviewBuilder = () => {
  // Get current user from auth context
  // const { currentUser } = useAuth();

  const currentUser = {
    id: '507f1f77bcf86cd799439011', // Valid ObjectId format
    _id: '507f1f77bcf86cd799439011',
    name: 'Demo User',
    email: 'demo@example.com'
  };
  
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [savedInterviews, setSavedInterviews] = useState([]);
  
  // Form state
  const [interviewConfig, setInterviewConfig] = useState({
    interviewType: 'mixed',
    role: '',
    seniority: 'mid',
    specificTechnologies: [''],
    companyValues: [''],
    questionsNeeded: 5,
    customRequirements: '',
    userId: currentUser?._id,
    saveInterview: false,
    title: ''
  });
  
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
  
  // Fetch user's saved custom interviews
  useEffect(() => {
    const fetchSavedInterviews = async () => {
      if (!currentUser) return;
      
      try {
        const response = await axios.get(`${API_URL}/interview/custom-interviews`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data && response.data.success) {
          setSavedInterviews(response.data.customInterviews);
        }
      } catch (error) {
        console.error("Error fetching saved interviews:", error);
      }
    };
    
    fetchSavedInterviews();
  }, [currentUser, API_URL]);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInterviewConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle multi-value fields (technologies, values)
  const handleArrayChange = (field, index, value) => {
    const newArray = [...interviewConfig[field]];
    newArray[index] = value;
    setInterviewConfig(prev => ({
      ...prev,
      [field]: newArray
    }));
  };
  
  // Add new item to multi-value fields
  const addArrayItem = (field) => {
    setInterviewConfig(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };
  
  // Remove item from multi-value fields
  const removeArrayItem = (field, index) => {
    if (interviewConfig[field].length > 1) {
      const newArray = [...interviewConfig[field]];
      newArray.splice(index, 1);
      setInterviewConfig(prev => ({
        ...prev,
        [field]: newArray
      }));
    }
  };
  
  // Generate custom interview questions
  const generateCustomQuestions = async () => {
    // Validate required fields
    if (!interviewConfig.role.trim()) {
      toast.error("Please enter a role");
      return;
    }
    
    // Filter out empty values from arrays
    const cleanedConfig = {
      ...interviewConfig,
      specificTechnologies: interviewConfig.specificTechnologies.filter(tech => tech.trim() !== ''),
      companyValues: interviewConfig.companyValues.filter(value => value.trim() !== ''),
      userId: currentUser?._id,
      title: interviewConfig.title || `${interviewConfig.role} ${interviewConfig.interviewType} Interview`
    };
    
    setIsLoading(true);
    
    try {
      // Make API call to backend
      const response = await axios.post(`${API_URL}/interview/custom-questions`, cleanedConfig, {
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
        }
      });
      
      if (response.data && response.data.success) {
        setQuestions(response.data.questions);
        setShowQuestions(true);
        
        // If the interview was saved, update saved interviews list
        if (cleanedConfig.saveInterview && response.data.customInterviewId) {
          setSavedInterviews(prev => [
            {
              _id: response.data.customInterviewId,
              title: cleanedConfig.title,
              role: cleanedConfig.role,
              interviewType: cleanedConfig.interviewType,
              createdAt: new Date().toISOString()
            },
            ...prev
          ]);
          toast.success("Interview questions generated and saved successfully!");
        } else {
          toast.success("Interview questions generated successfully!");
        }
      } else {
        throw new Error("Failed to generate questions");
      }
    } catch (error) {
      console.error("Error generating custom interview questions:", error);
      toast.error(error.response?.data?.message || "Failed to generate custom questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset form and questions
  const resetForm = () => {
    setInterviewConfig({
      interviewType: 'mixed',
      role: '',
      seniority: 'mid',
      specificTechnologies: [''],
      companyValues: [''],
      questionsNeeded: 5,
      customRequirements: '',
      userId: currentUser?._id,
      saveInterview: false,
      title: ''
    });
    setQuestions([]);
    setShowQuestions(false);
  };
  
  // Copy questions to clipboard
  const copyQuestionsToClipboard = () => {
    const textToCopy = questions.map((q, index) => 
      `Question ${index + 1}: "${q.question}"\n\nRationale: ${q.rationale}\n\nExpected Answer: ${q.expectedAnswer}\n\n---\n\n`
    ).join('');
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast.success("Questions copied to clipboard"))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };
  
  // Save questions to user's profile
  const saveQuestionsToProfile = async () => {
    if (!questions.length) return;
    if (!currentUser) {
      toast.error("Please log in to save questions");
      return;
    }
    
    try {
      const saveData = {
        title: interviewConfig.title || `${interviewConfig.role} ${interviewConfig.interviewType} Interview`,
        interviewType: interviewConfig.interviewType,
        role: interviewConfig.role,
        seniority: interviewConfig.seniority,
        specificTechnologies: interviewConfig.specificTechnologies.filter(tech => tech.trim() !== ''),
        companyValues: interviewConfig.companyValues.filter(value => value.trim() !== ''),
        questionsNeeded: interviewConfig.questionsNeeded,
        customRequirements: interviewConfig.customRequirements,
        questions: questions,
        userId: currentUser._id,
        isPublic: false
      };
      
      const response = await axios.post(`${API_URL}/interview/custom-questions`, {
        ...saveData,
        saveInterview: true
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        // Add the newly saved interview to the list
        setSavedInterviews(prev => [
          {
            _id: response.data.customInterviewId,
            title: saveData.title,
            role: saveData.role,
            interviewType: saveData.interviewType,
            createdAt: new Date().toISOString()
          },
          ...prev
        ]);
        
        toast.success("Questions saved to your profile successfully!");
      } else {
        throw new Error("Failed to save questions");
      }
    } catch (error) {
      console.error("Error saving questions:", error);
      toast.error("Failed to save questions. Please try again.");
    }
  };
  
  // Load a saved interview
  const loadSavedInterview = async (interviewId) => {
    try {
      setIsLoading(true);
      
      const response = await axios.get(`${API_URL}/interview/custom-interviews/${interviewId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        const interview = response.data.customInterview;
        
        // Update form with saved interview data
        setInterviewConfig({
          interviewType: interview.interviewType,
          role: interview.role,
          seniority: interview.seniority,
          specificTechnologies: interview.specificTechnologies.length ? interview.specificTechnologies : [''],
          companyValues: interview.companyValues.length ? interview.companyValues : [''],
          questionsNeeded: interview.questionsNeeded,
          customRequirements: interview.customRequirements || '',
          userId: currentUser?._id,
          saveInterview: false,
          title: interview.title
        });
        
        // Set questions from saved interview
        setQuestions(interview.questions);
        setShowQuestions(true);
        
        toast.success("Interview loaded successfully!");
      } else {
        throw new Error("Failed to load interview");
      }
    } catch (error) {
      console.error("Error loading saved interview:", error);
      toast.error("Failed to load interview. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0h10a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h1 className="text-xl font-medium text-white">
            Custom Interview Builder
            <span className="cyber-blink">_</span>
          </h1>
        </div>
        <p className="mt-2 text-gray-400 max-w-3xl">
          Build a personalized interview with AI-generated questions tailored to specific technologies, company values, and custom requirements.
        </p>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Configuration Form */}
        <div className="cyber-content-panel p-6">
          <h2 className="cyber-section-title mb-6">Neural Interview Parameters</h2>
          
          {/* Interview Title (New) */}
          <div className="mb-6">
            <label className="cyber-form-label" htmlFor="title">Interview Title</label>
            <div className="cyber-input-container">
              <input
                type="text"
                id="title"
                name="title"
                value={interviewConfig.title}
                onChange={handleChange}
                placeholder="e.g., Frontend Engineer Technical Interview"
                className="cyber-form-input"
              />
              <div className="cyber-input-focus-bar"></div>
            </div>
          </div>
          
          {/* Interview Type */}
          <div className="mb-6">
            <label className="cyber-form-label mb-2">Interview Type</label>
            <div className="cyber-option-group grid grid-cols-3 gap-3">
              <button
                className={`cyber-option ${interviewConfig.interviewType === 'technical' ? 'cyber-option-active' : ''}`}
                onClick={() => setInterviewConfig({...interviewConfig, interviewType: 'technical'})}
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span>Technical</span>
              </button>
              
              <button
                className={`cyber-option ${interviewConfig.interviewType === 'behavioral' ? 'cyber-option-active' : ''}`}
                onClick={() => setInterviewConfig({...interviewConfig, interviewType: 'behavioral'})}
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Behavioral</span>
              </button>
              
              <button
                className={`cyber-option ${interviewConfig.interviewType === 'mixed' ? 'cyber-option-active' : ''}`}
                onClick={() => setInterviewConfig({...interviewConfig, interviewType: 'mixed'})}
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <span>Mixed</span>
              </button>
            </div>
          </div>
          
          {/* Role */}
          <div className="mb-6">
            <label className="cyber-form-label" htmlFor="role">Role Title</label>
            <div className="cyber-input-container">
              <input
                type="text"
                id="role"
                name="role"
                value={interviewConfig.role}
                onChange={handleChange}
                placeholder="e.g., Senior Frontend Engineer"
                className="cyber-form-input"
              />
              <div className="cyber-input-focus-bar"></div>
            </div>
          </div>
          
          {/* Seniority Level */}
          <div className="mb-6">
            <label className="cyber-form-label mb-2">Seniority Level</label>
            <div className="cyber-option-group grid grid-cols-3 gap-3">
              <button
                className={`cyber-option ${interviewConfig.seniority === 'junior' ? 'cyber-option-active' : ''}`}
                onClick={() => setInterviewConfig({...interviewConfig, seniority: 'junior'})}
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Junior</span>
              </button>
              
              <button
                className={`cyber-option ${interviewConfig.seniority === 'mid' ? 'cyber-option-active' : ''}`}
                onClick={() => setInterviewConfig({...interviewConfig, seniority: 'mid'})}
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Mid-Level</span>
              </button>
              
              <button
                className={`cyber-option ${interviewConfig.seniority === 'senior' ? 'cyber-option-active' : ''}`}
                onClick={() => setInterviewConfig({...interviewConfig, seniority: 'senior'})}
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Senior</span>
              </button>
            </div>
          </div>
          
          {/* Specific Technologies */}
          <div className="mb-6">
            <label className="cyber-form-label mb-2">Specific Technologies</label>
            <div className="space-y-3">
              {interviewConfig.specificTechnologies.map((tech, index) => (
                <div key={`tech-${index}`} className="cyber-input-array-item">
                  <div className="cyber-input-container flex-1">
                    <input
                      type="text"
                      value={tech}
                      onChange={(e) => handleArrayChange('specificTechnologies', index, e.target.value)}
                      className="cyber-form-input"
                      placeholder="e.g., React, Python, AWS, etc."
                    />
                    <div className="cyber-input-focus-bar"></div>
                  </div>
                  <button 
                    type="button"
                    className="cyber-array-button-remove"
                    onClick={() => removeArrayItem('specificTechnologies', index)}
                    aria-label="Remove technology"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button 
                type="button"
                className="cyber-array-button-add"
                onClick={() => addArrayItem('specificTechnologies')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Technology</span>
              </button>
            </div>
          </div>
          
          {/* Company Values */}
          <div className="mb-6">
            <label className="cyber-form-label mb-2">Company Values</label>
            <div className="space-y-3">
              {interviewConfig.companyValues.map((value, index) => (
                <div key={`value-${index}`} className="cyber-input-array-item">
                  <div className="cyber-input-container flex-1">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleArrayChange('companyValues', index, e.target.value)}
                      className="cyber-form-input"
                      placeholder="e.g., Innovation, Teamwork, etc."
                    />
                    <div className="cyber-input-focus-bar"></div>
                  </div>
                  <button 
                    type="button"
                    className="cyber-array-button-remove"
                    onClick={() => removeArrayItem('companyValues', index)}
                    aria-label="Remove value"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button 
                type="button"
                className="cyber-array-button-add"
                onClick={() => addArrayItem('companyValues')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Company Value</span>
              </button>
            </div>
          </div>
          
          {/* Number of Questions */}
          <div className="mb-6">
            <label className="cyber-form-label mb-2">Number of Questions</label>
            <div className="flex items-center">
              <input
                type="range"
                min="3"
                max="10"
                step="1"
                name="questionsNeeded"
                value={interviewConfig.questionsNeeded}
                onChange={handleChange}
                className="cyber-range-slider"
              />
              <span className="ml-4 text-cyan-400 font-mono">{interviewConfig.questionsNeeded}</span>
            </div>
          </div>
          
          {/* Custom Requirements */}
          <div className="mb-6">
            <label className="cyber-form-label" htmlFor="customRequirements">Custom Requirements</label>
            <div className="cyber-input-container">
              <textarea
                id="customRequirements"
                name="customRequirements"
                value={interviewConfig.customRequirements}
                onChange={handleChange}
                placeholder="Specify any additional requirements, e.g., 'Focus on database optimization' or 'Include questions about handling difficult stakeholders'"
                className="cyber-form-textarea"
                rows={4}
              ></textarea>
              <div className="cyber-input-focus-bar"></div>
            </div>
          </div>
          
          {/* Save to Profile Option */}
          {currentUser && (
            <div className="mb-6 flex items-center">
              <input
                type="checkbox"
                id="saveInterview"
                name="saveInterview"
                checked={interviewConfig.saveInterview}
                onChange={(e) => setInterviewConfig(prev => ({
                  ...prev,
                  saveInterview: e.target.checked
                }))}
                className="cyber-checkbox"
              />
              <label htmlFor="saveInterview" className="ml-2 text-gray-300">
                Save this interview to my profile
              </label>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button 
              className="cyber-button-primary flex-1"
              onClick={generateCustomQuestions}
              disabled={isLoading || !interviewConfig.role.trim()}
            >
              {isLoading ? (
                <>
                  <div className="cyber-loading-spinner-small mr-2">
                    <div className="cyber-spinner-ring"></div>
                    <div className="cyber-spinner-ring"></div>
                  </div>
                  <span>Generating Questions...</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Generate Neural Questions</span>
                </>
              )}
            </button>
            
            <button 
              className="cyber-button-secondary"
              onClick={resetForm}
              disabled={isLoading}
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reset</span>
            </button>
          </div>
          
          {/* Saved Interviews Section */}
          {currentUser && savedInterviews.length > 0 && (
            <div className="mt-8 border-t border-gray-800 pt-6">
              <h3 className="text-md font-medium text-cyan-400 mb-4">Your Saved Interviews</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {savedInterviews.map(interview => (
                  <div 
                    key={interview._id} 
                    className="cyber-saved-interview"
                    onClick={() => loadSavedInterview(interview._id)}
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-200">{interview.title}</h4>
                      <div className="flex text-xs text-gray-400 space-x-3 mt-1">
                        <span>{interview.role}</span>
                        <span>•</span>
                        <span className="capitalize">{interview.interviewType}</span>
                        <span>•</span>
                        <span>{new Date(interview.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <svg className="h-5 w-5 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Generated Questions */}
        <div className="cyber-content-panel p-6">
          <h2 className="cyber-section-title mb-6 flex justify-between items-center">
            <span>Generated Neural Questions</span>
            
            {questions.length > 0 && (
              <div className="flex space-x-2">
                <button 
                  className="cyber-button-sm"
                  onClick={copyQuestionsToClipboard}
                  title="Copy questions to clipboard"
                >
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                
                {currentUser && !interviewConfig.saveInterview && (
                  <button 
                    className="cyber-button-sm"
                    onClick={saveQuestionsToProfile}
                    title="Save questions to your profile"
                  >
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </h2>
          
          {isLoading ? (
            <div className="cyber-loading-container py-8 text-center">
              <div className="cyber-loading-spinner mx-auto mb-4">
                <div className="cyber-spinner-ring"></div>
                <div className="cyber-spinner-ring"></div>
                <div className="cyber-spinner-ring"></div>
              </div>
              <p className="cyber-loading-text">Generating neural interview questions...</p>
              <p className="text-gray-400 text-sm mt-2">This may take a moment as our AI crafts questions specifically for {interviewConfig.role}</p>
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-6 cyber-questions-container">
              {questions.map((question, index) => (
                <div key={index} className="cyber-question-card">
                  <div className="cyber-question-number">Q{index + 1}</div>
                  
                  <div className="cyber-question-type">
                    <span className={`cyber-question-tag cyber-question-tag-${question.type}`}>
                      {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                    </span>
                  </div>
                  
                  <div className="cyber-question-content">
                    <h3 className="cyber-question-text">{question.question}</h3>
                    
                    <div className="cyber-question-details">
                      <div className="cyber-question-section">
                        <h4 className="cyber-question-section-title">Rationale</h4>
                        <p className="cyber-question-section-content">{question.rationale}</p>
                      </div>
                      
                      <div className="cyber-question-section">
                        <h4 className="cyber-question-section-title">Expected Answer</h4>
                        <p className="cyber-question-section-content">{question.expectedAnswer}</p>
                      </div>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="cyber-corner cyber-corner-tl"></div>
                    <div className="cyber-corner cyber-corner-tr"></div>
                    <div className="cyber-corner cyber-corner-bl"></div>
                    <div className="cyber-corner cyber-corner-br"></div>
                    <div className="cyber-scan-line"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="cyber-questions-placeholder">
              <div className="cyber-placeholder-icon">
                <svg className="h-12 w-12 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="cyber-placeholder-title">No Questions Generated Yet</h3>
              <p className="cyber-placeholder-text">Configure your interview parameters and click "Generate Neural Questions" to create custom interview questions</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Cyberpunk styling */}
      {/* Cyberpunk styling */}
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
        
        /* Form Controls */
        .cyber-form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgb(6, 182, 212);
        }
        
        .cyber-input-container {
          position: relative;
          width: 100%;
        }
        
        .cyber-form-input,
        .cyber-form-textarea {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          padding: 0.75rem 1rem;
          color: rgba(226, 232, 240, 0.9);
          font-size: 0.875rem;
          transition: all 0.3s;
          font-family: 'JetBrains Mono', monospace;
        }
        
        .cyber-form-input:focus,
        .cyber-form-textarea:focus {
          outline: none;
          border-color: rgba(6, 182, 212, 0.8);
          box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.3);
        }
        
        .cyber-form-textarea {
          resize: vertical;
          min-height: 6rem;
        }
        
        .cyber-input-focus-bar {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
          transition: transform 0.3s;
          transform-origin: center;
        }
        
        .cyber-form-input:focus + .cyber-input-focus-bar,
        .cyber-form-textarea:focus + .cyber-input-focus-bar {
          transform: translateX(-50%) scaleX(1);
        }
        
        /* Range slider */
        .cyber-range-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 3px;
          outline: none;
        }
        
        .cyber-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgb(6, 182, 212);
          cursor: pointer;
          border: 2px solid rgba(15, 23, 42, 0.8);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }
        
        .cyber-range-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgb(6, 182, 212);
          cursor: pointer;
          border: 2px solid rgba(15, 23, 42, 0.8);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }
        
        /* Option groups */
        .cyber-option-group {
          display: grid;
        }
        
        .cyber-option {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          color: rgba(226, 232, 240, 0.8);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.3s;
          cursor: pointer;
        }
        
        .cyber-option:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                    0 2px 4px -1px rgba(0, 0, 0, 0.06),
                    0 0 10px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-option-active {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
          border-color: rgba(6, 182, 212, 0.6);
          color: rgb(6, 182, 212);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                    0 2px 4px -1px rgba(0, 0, 0, 0.06),
                    0 0 10px rgba(6, 182, 212, 0.3);
        }
        
        /* Array inputs */
        .cyber-input-array-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .cyber-array-button-remove {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.2);
          color: rgb(239, 68, 68);
          border: 1px solid rgba(239, 68, 68, 0.3);
          transition: all 0.3s;
          flex-shrink: 0;
        }
        
        .cyber-array-button-remove:hover {
          background: rgba(239, 68, 68, 0.3);
          border-color: rgba(239, 68, 68, 0.5);
        }
        
        .cyber-array-button-add {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          background: rgba(6, 182, 212, 0.1);
          color: rgb(6, 182, 212);
          border: 1px solid rgba(6, 182, 212, 0.3);
          font-size: 0.875rem;
          transition: all 0.3s;
        }
        
        .cyber-array-button-add:hover {
          background: rgba(6, 182, 212, 0.2);
          border-color: rgba(6, 182, 212, 0.5);
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
        
        .cyber-button-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .cyber-button-primary:not(:disabled):hover {
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
        
        .cyber-button-sm {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.375rem;
          background: rgba(17, 24, 39, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          color: rgb(6, 182, 212);
          transition: all 0.2s;
        }
        
        .cyber-button-sm:hover {
          background: rgba(17, 24, 39, 1);
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
        }
        
        /* Loading spinner */
        .cyber-loading-spinner-small {
          position: relative;
          width: 1.25rem;
          height: 1.25rem;
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
        
        .cyber-loading-spinner-small .cyber-spinner-ring:nth-child(1) {
          border-top-color: white;
          animation: spin 1.5s linear infinite;
        }
        
        .cyber-loading-spinner-small .cyber-spinner-ring:nth-child(2) {
          border-right-color: white;
          animation: spin 2s linear infinite;
        }
        
        .cyber-loading-spinner .cyber-spinner-ring:nth-child(1) {
          border-top-color: rgb(6, 182, 212);
          animation: spin 1.5s linear infinite;
        }
        
        .cyber-loading-spinner .cyber-spinner-ring:nth-child(2) {
          border-right-color: rgb(79, 70, 229);
          animation: spin 2s linear infinite;
        }
        
        .cyber-loading-spinner .cyber-spinner-ring:nth-child(3) {
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
        
        /* Questions container */
        .cyber-questions-container {
          max-height: 700px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(6, 182, 212, 0.5) rgba(15, 23, 42, 0.3);
          padding-right: 0.5rem;
        }
        
        .cyber-questions-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .cyber-questions-container::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 3px;
        }
        
        .cyber-questions-container::-webkit-scrollbar-thumb {
          background-color: rgba(6, 182, 212, 0.5);
          border-radius: 3px;
        }
        
        /* Question cards */
        .cyber-question-card {
          position: relative;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          padding: 1.5rem;
          overflow: hidden;
        }
        
        .cyber-question-number {
          position: absolute;
          top: 1rem;
          left: 1rem;
          height: 2rem;
          width: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(6, 182, 212, 0.2);
          color: rgb(6, 182, 212);
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 500;
          font-family: 'JetBrains Mono', monospace;
        }
        
        .cyber-question-type {
          position: absolute;
          top: 1rem;
          right: 1rem;
        }
        
        .cyber-question-tag {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .cyber-question-tag-technical {
          background: rgba(6, 182, 212, 0.2);
          color: rgb(6, 182, 212);
          border: 1px solid rgba(6, 182, 212, 0.4);
        }
        
        .cyber-question-tag-behavioral {
          background: rgba(16, 185, 129, 0.2);
          color: rgb(16, 185, 129);
          border: 1px solid rgba(16, 185, 129, 0.4);
        }
        
        .cyber-question-tag-mixed {
          background: rgba(124, 58, 237, 0.2);
          color: rgb(124, 58, 237);
          border: 1px solid rgba(124, 58, 237, 0.4);
        }
        
        .cyber-question-content {
          padding-top: 1.5rem;
        }
        
        .cyber-question-text {
          font-size: 1rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 1rem;
          padding-left: 1rem;
          border-left: 2px solid rgba(6, 182, 212, 0.5);
        }
        
        .cyber-question-details {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        .cyber-question-section {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(6, 182, 212, 0.1);
          border-radius: 0.375rem;
          padding: 0.75rem;
        }
        
        .cyber-question-section-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgb(6, 182, 212);
          margin-bottom: 0.5rem;
        }
        
        .cyber-question-section-content {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.8);
          line-height: 1.5;
        }
        
        /* Empty questions placeholder */
        .cyber-questions-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          text-align: center;
          padding: 2rem;
        }
        
        .cyber-placeholder-icon {
          margin-bottom: 1rem;
          opacity: 0.3;
        }
        
        .cyber-placeholder-title {
          font-size: 1.125rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.8);
          margin-bottom: 0.5rem;
        }
        
        .cyber-placeholder-text {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.6);
          max-width: 24rem;
        }
        
        /* Scan line animation */
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
        
        /* Corner decorations */
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
        
        /* Animations */
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

export default CustomInterviewBuilder;