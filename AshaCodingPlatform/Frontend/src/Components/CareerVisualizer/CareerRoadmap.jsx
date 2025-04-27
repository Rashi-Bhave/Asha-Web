import React, { useState } from 'react';
import axios from 'axios';

const CareerRoadmap = ({ activeCareer }) => {
  // State for roadmap generator
  const [roadmapData, setRoadmapData] = useState(null);
  const [formData, setFormData] = useState({
    currentRole: '',
    targetRole: '',
    yearsExperience: '',
    currentSkills: [''],
    interests: [''],
    timeframe: '3-5 years',
    challenges: '',
    workStyle: ''
  });
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Results
  const [activeRoadmapSection, setActiveRoadmapSection] = useState('overview');
  const [activeMilestone, setActiveMilestone] = useState(0);

  // Backend API URL
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle multi-value fields (skills, interests)
  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  // Add new item to multi-value fields
  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  // Remove item from multi-value fields
  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      const newArray = [...formData[field]];
      newArray.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        [field]: newArray
      }));
    }
  };

  // Generate roadmap from LLM
  const generateRoadmap = async () => {
    setLoadingRoadmap(true);
    
    try {
      // Filter out empty values from arrays
      const cleanedFormData = {
        ...formData,
        currentSkills: formData.currentSkills.filter(skill => skill.trim() !== ''),
        interests: formData.interests.filter(interest => interest.trim() !== '')
      };
      
      const response = await axios.post(`${API_URL}/career/roadmap`, cleanedFormData);
      
      if (response.data && response.data.success) {
        setRoadmapData(response.data.roadmap);
        setStep(2); // Move to results view
        setActiveMilestone(0); // Reset active milestone
      }
    } catch (error) {
      console.error("Error generating career roadmap:", error);
      // Handle error - could show an error message to the user
    } finally {
      setLoadingRoadmap(false);
    }
  };

  // Reset the form and go back to input
  const resetRoadmap = () => {
    setStep(1);
    setRoadmapData(null);
  };

  // Pre-populate current role if available from active career
  React.useEffect(() => {
    if (activeCareer) {
      const formattedCareer = activeCareer.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      setFormData(prev => ({
        ...prev,
        currentRole: formattedCareer
      }));
    }
  }, [activeCareer]);

  return (
    <div className="cyber-content-panel">
      <div className="cyber-roadmap">
        <h2 className="cyber-content-title mb-6">
          Neural Path Optimizer: Personalized Career Roadmap
        </h2>
        
        {step === 1 ? (
          // Step 1: Roadmap Generator Form
          <div className="cyber-roadmap-form">
            <p className="cyber-form-intro mb-6">
              Generate a personalized career roadmap with advanced AI analysis. Enter your details and goals to receive a tailored progression plan enhanced with cognitive optimization algorithms.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Current Role */}
              <div className="cyber-form-group">
                <label className="cyber-form-label">Current Role</label>
                <div className="cyber-input-container">
                  <input
                    type="text"
                    name="currentRole"
                    value={formData.currentRole}
                    onChange={handleChange}
                    className="cyber-form-input"
                    placeholder="Software Engineer"
                  />
                  <div className="cyber-input-focus-bar"></div>
                </div>
              </div>
              
              {/* Target Role */}
              <div className="cyber-form-group">
                <label className="cyber-form-label">Target Role</label>
                <div className="cyber-input-container">
                  <input
                    type="text"
                    name="targetRole"
                    value={formData.targetRole}
                    onChange={handleChange}
                    className="cyber-form-input"
                    placeholder="Senior Software Engineer"
                  />
                  <div className="cyber-input-focus-bar"></div>
                </div>
              </div>
              
              {/* Years of Experience */}
              <div className="cyber-form-group">
                <label className="cyber-form-label">Years of Experience</label>
                <div className="cyber-input-container">
                  <input
                    type="text"
                    name="yearsExperience"
                    value={formData.yearsExperience}
                    onChange={handleChange}
                    className="cyber-form-input"
                    placeholder="2"
                  />
                  <div className="cyber-input-focus-bar"></div>
                </div>
              </div>
              
              {/* Timeframe */}
              <div className="cyber-form-group">
                <label className="cyber-form-label">Target Timeframe</label>
                <div className="cyber-select-container">
                  <select
                    name="timeframe"
                    value={formData.timeframe}
                    onChange={handleChange}
                    className="cyber-form-select"
                  >
                    <option value="1-2 years">1-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                  <div className="cyber-select-arrow"></div>
                </div>
              </div>
              
              {/* Preferred Work Style */}
              <div className="cyber-form-group">
                <label className="cyber-form-label">Preferred Work Style</label>
                <div className="cyber-select-container">
                  <select
                    name="workStyle"
                    value={formData.workStyle}
                    onChange={handleChange}
                    className="cyber-form-select"
                  >
                    <option value="">Select work style</option>
                    <option value="Individual Contributor">Individual Contributor</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="Manager">Manager</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                  <div className="cyber-select-arrow"></div>
                </div>
              </div>
              
              {/* Challenges */}
              <div className="cyber-form-group md:col-span-2">
                <label className="cyber-form-label">Current Challenges</label>
                <div className="cyber-input-container">
                  <textarea
                    name="challenges"
                    value={formData.challenges}
                    onChange={handleChange}
                    className="cyber-form-textarea"
                    placeholder="What career challenges are you currently facing?"
                    rows="2"
                  ></textarea>
                  <div className="cyber-input-focus-bar"></div>
                </div>
              </div>
            </div>
            
            {/* Skills */}
            <div className="cyber-form-group mb-6">
              <label className="cyber-form-label">Current Skills</label>
              <div className="space-y-3">
                {formData.currentSkills.map((skill, index) => (
                  <div key={`skill-${index}`} className="cyber-input-array-item">
                    <div className="cyber-input-container flex-1">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleArrayChange('currentSkills', index, e.target.value)}
                        className="cyber-form-input"
                        placeholder="JavaScript, React, etc."
                      />
                      <div className="cyber-input-focus-bar"></div>
                    </div>
                    <button 
                      type="button"
                      className="cyber-array-button-remove"
                      onClick={() => removeArrayItem('currentSkills', index)}
                      aria-label="Remove skill"
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
                  onClick={() => addArrayItem('currentSkills')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Skill</span>
                </button>
              </div>
            </div>
            
            {/* Interests */}
            <div className="cyber-form-group mb-8">
              <label className="cyber-form-label">Career Interests</label>
              <div className="space-y-3">
                {formData.interests.map((interest, index) => (
                  <div key={`interest-${index}`} className="cyber-input-array-item">
                    <div className="cyber-input-container flex-1">
                      <input
                        type="text"
                        value={interest}
                        onChange={(e) => handleArrayChange('interests', index, e.target.value)}
                        className="cyber-form-input"
                        placeholder="AI/ML, Cloud Architecture, etc."
                      />
                      <div className="cyber-input-focus-bar"></div>
                    </div>
                    <button 
                      type="button"
                      className="cyber-array-button-remove"
                      onClick={() => removeArrayItem('interests', index)}
                      aria-label="Remove interest"
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
                  onClick={() => addArrayItem('interests')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Interest</span>
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="cyber-form-actions">
              <button 
                type="button"
                className="cyber-button-primary"
                onClick={generateRoadmap}
                disabled={!formData.currentRole || !formData.targetRole || loadingRoadmap}
              >
                {loadingRoadmap ? (
                  <>
                    <div className="cyber-loading-spinner-small mr-2">
                      <div className="cyber-spinner-ring"></div>
                      <div className="cyber-spinner-ring"></div>
                    </div>
                    <span>Generating Roadmap...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span>Generate Neural Career Path</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // Step 2: Display Roadmap Results
          <div className="cyber-roadmap-results">
            {roadmapData ? (
              <>
                {/* Navigation tabs */}
                <div className="cyber-roadmap-tabs mb-6">
                  <button 
                    className={`cyber-roadmap-tab ${activeRoadmapSection === 'overview' ? 'cyber-roadmap-tab-active' : ''}`}
                    onClick={() => setActiveRoadmapSection('overview')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Overview</span>
                  </button>
                  <button 
                    className={`cyber-roadmap-tab ${activeRoadmapSection === 'milestones' ? 'cyber-roadmap-tab-active' : ''}`}
                    onClick={() => setActiveRoadmapSection('milestones')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>Milestones</span>
                  </button>
                  <button 
                    className={`cyber-roadmap-tab ${activeRoadmapSection === 'challenges' ? 'cyber-roadmap-tab-active' : ''}`}
                    onClick={() => setActiveRoadmapSection('challenges')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Challenges</span>
                  </button>
                  <button 
                    className={`cyber-roadmap-tab ${activeRoadmapSection === 'advice' ? 'cyber-roadmap-tab-active' : ''}`}
                    onClick={() => setActiveRoadmapSection('advice')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>Key Advice</span>
                  </button>
                </div>
                
                {/* Content based on active section */}
                <div className="cyber-roadmap-content mb-8">
                  {activeRoadmapSection === 'overview' && (
                    <div className="cyber-roadmap-overview">
                      <div className="cyber-overview-panel">
                        <h3 className="cyber-panel-title">Neural Path Analysis</h3>
                        <p className="cyber-overview-text">{roadmapData.overview}</p>
                        
                        {/* Path visualization */}
                        <div className="cyber-path-visual mt-8">
                          <div className="cyber-path-from">
                            <div className="cyber-node-circle"></div>
                            <div className="cyber-node-label">{formData.currentRole}</div>
                          </div>
                          
                          <div className="cyber-path-line">
                            {roadmapData.milestones.map((_, index) => (
                              <div key={index} className="cyber-path-point"></div>
                            ))}
                          </div>
                          
                          <div className="cyber-path-to">
                            <div className="cyber-node-circle"></div>
                            <div className="cyber-node-label">{formData.targetRole}</div>
                          </div>
                        </div>
                        
                        {/* Milestones summary */}
                        <div className="cyber-milestones-summary mt-8">
                          <h4 className="cyber-summary-title">Progression Milestones</h4>
                          <div className="cyber-milestone-list">
                            {roadmapData.milestones.map((milestone, index) => (
                              <div key={index} className="cyber-milestone-summary-item">
                                <div className="cyber-milestone-number">{index + 1}</div>
                                <div className="cyber-milestone-summary-content">
                                  <div className="cyber-milestone-title">{milestone.title}</div>
                                  <div className="cyber-milestone-timeframe">{milestone.timeframe}</div>
                                </div>
                              </div>
                            ))}
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
                  )}
                  
                  {activeRoadmapSection === 'milestones' && (
                    <div className="cyber-roadmap-milestones">
                      {/* Milestone selector */}
                      <div className="cyber-milestone-selector mb-6">
                        <div className="cyber-milestone-tabs">
                          {roadmapData.milestones.map((milestone, index) => (
                            <button 
                              key={index}
                              className={`cyber-milestone-tab ${activeMilestone === index ? 'cyber-milestone-tab-active' : ''}`}
                              onClick={() => setActiveMilestone(index)}
                            >
                              <span className="cyber-milestone-tab-number">{index + 1}</span>
                              <span className="cyber-milestone-tab-title">{milestone.title}</span>
                              <span className="cyber-milestone-tab-time">{milestone.timeframe}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Active milestone details */}
                      {roadmapData.milestones[activeMilestone] && (
                        <div className="cyber-milestone-details">
                          <div className="cyber-milestone-header">
                            <h3 className="cyber-milestone-header-title">
                              {roadmapData.milestones[activeMilestone].title}
                            </h3>
                            <div className="cyber-milestone-header-time">
                              {roadmapData.milestones[activeMilestone].timeframe}
                            </div>
                          </div>
                          
                          <p className="cyber-milestone-description mb-6">
                            {roadmapData.milestones[activeMilestone].description}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Skills to acquire */}
                            <div className="cyber-milestone-skills">
                              <h4 className="cyber-milestone-section-title">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Skills To Acquire
                              </h4>
                              <ul className="cyber-milestone-skills-list">
                                {roadmapData.milestones[activeMilestone].skills.map((skill, index) => (
                                  <li key={index} className="cyber-milestone-skill-item">
                                    <div className="cyber-skill-dot"></div>
                                    <span>{skill}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            {/* Actions to take */}
                            <div className="cyber-milestone-actions">
                              <h4 className="cyber-milestone-section-title">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                Actions To Take
                              </h4>
                              <ul className="cyber-milestone-actions-list">
                                {roadmapData.milestones[activeMilestone].actions.map((action, index) => (
                                  <li key={index} className="cyber-milestone-action-item">
                                    <div className="cyber-action-number">{index + 1}</div>
                                    <span>{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          {/* Resources */}
                          {roadmapData.milestones[activeMilestone].resources && roadmapData.milestones[activeMilestone].resources.length > 0 && (
                            <div className="cyber-milestone-resources">
                              <h4 className="cyber-milestone-section-title">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13c-1.168-.776-2.754-1.253-4.5-1.253-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Recommended Resources
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {roadmapData.milestones[activeMilestone].resources.map((resource, index) => (
                                  <div key={index} className="cyber-resource-card">
                                    <div className="cyber-resource-type">{resource.type}</div>
                                    <h5 className="cyber-resource-title">{resource.title}</h5>
                                    {resource.description && (
                                      <p className="cyber-resource-description">{resource.description}</p>
                                    )}
                                    
                                    {/* Decorative elements */}
                                    <div className="cyber-corner cyber-corner-tl"></div>
                                    <div className="cyber-corner cyber-corner-tr"></div>
                                    <div className="cyber-corner cyber-corner-bl"></div>
                                    <div className="cyber-corner cyber-corner-br"></div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeRoadmapSection === 'challenges' && (
                    <div className="cyber-roadmap-challenges">
                      <div className="cyber-challenges-container">
                        <h3 className="cyber-panel-title mb-4">Potential Challenges & Strategies</h3>
                        
                        <div className="space-y-6">
                          {roadmapData.challenges.map((challenge, index) => (
                            <div key={index} className="cyber-challenge-card">
                              <div className="cyber-challenge-header">
                                <div className="cyber-challenge-icon">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                </div>
                                <h4 className="cyber-challenge-title">{challenge.challenge}</h4>
                              </div>
                              
                              <div className="cyber-strategies-list">
                                {challenge.strategies.map((strategy, strategyIndex) => (
                                  <div key={strategyIndex} className="cyber-strategy-item">
                                    <div className="cyber-strategy-bullet"></div>
                                    <p className="cyber-strategy-text">{strategy}</p>
                                  </div>
                                ))}
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
                      </div>
                    </div>
                  )}
                  
                  {activeRoadmapSection === 'advice' && (
                    <div className="cyber-roadmap-advice">
                      <div className="cyber-advice-container">
                        <h3 className="cyber-panel-title mb-4">Key Neural Insights</h3>
                        
                        <div className="cyber-advice-grid">
                          {roadmapData.keyAdvice.map((advice, index) => (
                            <div key={index} className="cyber-advice-card">
                              <div className="cyber-advice-number">
                                {(index + 1).toString().padStart(2, '0')}
                              </div>
                              <p className="cyber-advice-text">{advice}</p>
                              
                              {/* Background effect */}
                              <div className="cyber-advice-glow"></div>
                              
                              {/* Decorative elements */}
                              <div className="cyber-corner cyber-corner-tl"></div>
                              <div className="cyber-corner cyber-corner-tr"></div>
                              <div className="cyber-corner cyber-corner-bl"></div>
                              <div className="cyber-corner cyber-corner-br"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="cyber-roadmap-actions">
                  <button 
                    type="button"
                    className="cyber-button-secondary"
                    onClick={resetRoadmap}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                    </svg>
                    <span>Adjust Parameters</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="cyber-loading-container py-8 text-center">
                <div className="cyber-loading-spinner mx-auto mb-4">
                  <div className="cyber-spinner-ring"></div>
                  <div className="cyber-spinner-ring"></div>
                  <div className="cyber-spinner-ring"></div>
                </div>
                <p className="cyber-loading-text">Neural pathway optimization in progress...</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Custom styles for career roadmap */}
      <style jsx>{`
        /* Career Roadmap Form Styles */
        .cyber-form-intro {
          font-size: 1rem;
          color: rgba(226, 232, 240, 0.8);
          line-height: 1.5;
        }
        
        .cyber-form-group {
          margin-bottom: 1.5rem;
        }
        
        .cyber-form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgb(6, 182, 212);
          margin-bottom: 0.5rem;
        }
        
        .cyber-input-container,
        .cyber-select-container {
          position: relative;
          width: 100%;
        }
        
        .cyber-form-input,
        .cyber-form-select,
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
        .cyber-form-select:focus,
        .cyber-form-textarea:focus {
          outline: none;
          border-color: rgba(6, 182, 212, 0.8);
          box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.3);
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
        
        .cyber-form-textarea {
          resize: vertical;
          min-height: 5rem;
        }
        
        .cyber-select-container {
          position: relative;
        }
        
        .cyber-select-arrow {
          position: absolute;
          top: 50%;
          right: 1rem;
          transform: translateY(-50%);
          width: 0.8rem;
          height: 0.8rem;
          pointer-events: none;
          border-style: solid;
          border-width: 0.4rem 0.4rem 0 0.4rem;
          border-color: rgba(6, 182, 212, 0.8) transparent transparent transparent;
        }
        
        .cyber-form-select {
          appearance: none;
          padding-right: 2.5rem;
        }
        
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
        
        .cyber-form-actions {
          display: flex;
          justify-content: flex-end;
        }
        
        .cyber-button-primary,
        .cyber-button-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        
        .cyber-button-primary {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
          color: rgba(226, 232, 240, 0.9);
          border: 1px solid rgba(6, 182, 212, 0.3);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .cyber-button-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                      0 4px 6px -2px rgba(0, 0, 0, 0.05),
                      0 0 20px rgba(6, 182, 212, 0.3);
        }
        
        .cyber-button-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .cyber-button-secondary {
          background: rgba(15, 23, 42, 0.6);
          color: rgba(226, 232, 240, 0.9);
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        
        .cyber-button-secondary:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.5);
        }
        
        .cyber-loading-spinner-small {
          position: relative;
          width: 1.25rem;
          height: 1.25rem;
        }
        
        /* Roadmap Results Styles */
        .cyber-roadmap-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          border-bottom: 1px solid rgba(6, 182, 212, 0.3);
          padding-bottom: 0.5rem;
        }
        
        .cyber-roadmap-tab {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.7);
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid transparent;
          transition: all 0.3s;
        }
        
        .cyber-roadmap-tab:hover {
          background: rgba(15, 23, 42, 0.6);
          color: rgba(226, 232, 240, 0.9);
          border-color: rgba(6, 182, 212, 0.3);
        }
        
        .cyber-roadmap-tab-active {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
          color: rgb(6, 182, 212);
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                      0 2px 4px -1px rgba(0, 0, 0, 0.06),
                      0 0 10px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-overview-panel {
          position: relative;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          padding: 1.5rem;
          overflow: hidden;
        }
        
        .cyber-overview-text {
          font-size: 1rem;
          color: rgba(226, 232, 240, 0.8);
          line-height: 1.6;
        }
        
        .cyber-path-visual {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 2rem 0;
        }
        
        .cyber-path-from,
        .cyber-path-to {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 6rem;
        }
        
        .cyber-node-circle {
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          margin-bottom: 0.5rem;
          position: relative;
          z-index: 1;
        }
        
        .cyber-path-from .cyber-node-circle {
          background: rgb(6, 182, 212);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
        }
        
        .cyber-path-to .cyber-node-circle {
          background: rgb(79, 70, 229);
          box-shadow: 0 0 15px rgba(79, 70, 229, 0.5);
        }
        
        .cyber-node-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-path-line {
          flex: 1;
          height: 2px;
          background: linear-gradient(90deg, rgb(6, 182, 212), rgb(79, 70, 229));
          position: relative;
          margin: 0 1rem;
          display: flex;
          justify-content: space-evenly;
          align-items: center;
        }
        
        .cyber-path-point {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
          background: rgba(226, 232, 240, 0.9);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
        }
        
        .cyber-summary-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 1rem;
        }
        
        .cyber-milestone-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
          gap: 1rem;
        }
        
        .cyber-milestone-summary-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          transition: all 0.3s;
        }
        
        .cyber-milestone-summary-item:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.4);
          transform: translateY(-2px);
        }
        
        .cyber-milestone-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.2);
          color: rgb(6, 182, 212);
          font-weight: 600;
          flex-shrink: 0;
        }
        
        .cyber-milestone-summary-content {
          flex: 1;
        }
        
        .cyber-milestone-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 0.25rem;
        }
        
        .cyber-milestone-timeframe {
          font-size: 0.75rem;
          color: rgba(6, 182, 212, 0.8);
        }
        
        /* Milestone tabs */
        .cyber-milestone-selector {
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(6, 182, 212, 0.5) rgba(15, 23, 42, 0.3);
        }
        
        .cyber-milestone-tabs {
          display: flex;
          gap: 0.5rem;
          padding-bottom: 0.5rem;
        }
        
        .cyber-milestone-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 8rem;
          padding: 0.75rem 1rem;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          transition: all 0.3s;
        }
        
        .cyber-milestone-tab:hover {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(6, 182, 212, 0.4);
        }
        
        .cyber-milestone-tab-active {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
          border-color: rgba(6, 182, 212, 0.6);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                      0 2px 4px -1px rgba(0, 0, 0, 0.06),
                      0 0 10px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-milestone-tab-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.2);
          color: rgb(6, 182, 212);
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .cyber-milestone-tab-active .cyber-milestone-tab-number {
          background: rgba(6, 182, 212, 0.8);
          color: rgba(15, 23, 42, 0.9);
        }
        
        .cyber-milestone-tab-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
          text-align: center;
          margin-bottom: 0.25rem;
        }
        
        .cyber-milestone-tab-time {
          font-size: 0.75rem;
          color: rgba(6, 182, 212, 0.8);
        }
        
        /* Milestone details */
        .cyber-milestone-details {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }
        
        .cyber-milestone-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(6, 182, 212, 0.3);
        }
        
        .cyber-milestone-header-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-milestone-header-time {
          font-size: 0.875rem;
          color: rgb(6, 182, 212);
          background: rgba(6, 182, 212, 0.1);
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
        }
        
        .cyber-milestone-description {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.8);
          line-height: 1.6;
        }
        
        .cyber-milestone-section-title {
          display: flex;
          align-items: center;
          font-size: 1rem;
          font-weight: 600;
          color: rgb(6, 182, 212);
          margin-bottom: 0.75rem;
        }
        
        .cyber-milestone-skills-list,
        .cyber-milestone-actions-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .cyber-milestone-skill-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-skill-dot {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background: rgb(6, 182, 212);
          flex-shrink: 0;
        }
        
        .cyber-milestone-action-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-action-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 50%;
          background: rgba(79, 70, 229, 0.2);
          color: rgb(79, 70, 229);
          font-size: 0.75rem;
          font-weight: 600;
          flex-shrink: 0;
        }
        
        .cyber-milestone-resources {
          margin-top: 1.5rem;
        }
        
        .cyber-resource-card {
          position: relative;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          padding: 1rem;
          transition: all 0.3s;
          height: 100%;
        }
        
        .cyber-resource-card:hover {
          transform: translateY(-2px);
          border-color: rgba(6, 182, 212, 0.4);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                      0 2px 4px -1px rgba(0, 0, 0, 0.06),
                      0 0 10px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-resource-type {
          display: inline-block;
          font-size: 0.75rem;
          color: rgb(6, 182, 212);
          background: rgba(6, 182, 212, 0.1);
          padding: 0.125rem 0.5rem;
          border-radius: 0.25rem;
          margin-bottom: 0.5rem;
        }
        
        .cyber-resource-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 0.5rem;
        }
        
        .cyber-resource-description {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
          line-height: 1.5;
        }
        
        /* Challenges section */
        .cyber-challenges-container {
          position: relative;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          padding: 1.5rem;
          overflow: hidden;
        }
        
        .cyber-challenge-card {
          position: relative;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          padding: 1.25rem;
          overflow: hidden;
        }
        
        .cyber-challenge-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .cyber-challenge-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 50%;
          color: rgb(239, 68, 68);
          flex-shrink: 0;
        }
        
        .cyber-challenge-title {
          font-size: 1rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-strategies-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .cyber-strategy-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        
        .cyber-strategy-bullet {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background: rgb(6, 182, 212);
          margin-top: 0.5rem;
          flex-shrink: 0;
        }
        
        .cyber-strategy-text {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.8);
          line-height: 1.5;
          flex: 1;
        }
        
        /* Advice section */
        .cyber-advice-container {
          position: relative;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          padding: 1.5rem;
          overflow: hidden;
        }
        
        .cyber-advice-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        @media (min-width: 768px) {
          .cyber-advice-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        
        .cyber-advice-card {
          position: relative;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          padding: 1.25rem;
          overflow: hidden;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .cyber-advice-card:hover .cyber-advice-glow {
          opacity: 0.1;
        }
        
        .cyber-advice-number {
          font-size: 1.25rem;
          font-weight: 700;
          color: rgb(6, 182, 212);
          flex-shrink: 0;
          line-height: 1.2;
          text-shadow: 0 0 5px rgba(6, 182, 212, 0.5);
        }
        
        .cyber-advice-text {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.9);
          line-height: 1.6;
          flex: 1;
        }
        
        .cyber-advice-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgb(6, 182, 212) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        
        /* Actions */
        .cyber-roadmap-actions {
          display: flex;
          justify-content: center;
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default CareerRoadmap;