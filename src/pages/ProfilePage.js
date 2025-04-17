// pages/ProfilePage.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Profile.css';

const ProfilePage = ({ onNavigate }) => {
  const { user, updateUserProfile } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ show: false, message: '', type: '' });
  const [editMode, setEditMode] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    headline: '',
    location: '',
    bio: '',
    contactInfo: {
      email: '',
      phone: '',
      website: ''
    },
    workExperience: [],
    education: [],
    skills: [],
    certifications: []
  });
  
  // Work experience form state
  const [workForm, setWorkForm] = useState({
    company: '',
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });
  
  // Education form state
  const [educationForm, setEducationForm] = useState({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });
  
  // Initialize profile with user data
  useEffect(() => {
    if (user) {
      // In a real app, you'd fetch the complete profile from an API
      // For now, we'll use the basic user data we have and mock the rest
      setProfile(prevProfile => ({
        ...prevProfile,
        name: user.name || '',
        contactInfo: {
          ...prevProfile.contactInfo,
          email: user.email || ''
        }
      }));
    }
  }, [user]);
  
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // In a real app, you would save the full profile to your backend
      // For now, we'll just update the user's name
      await updateUserProfile({ name: profile.name });
      
      setSaveStatus({
        show: true,
        message: 'Profile saved successfully',
        type: 'success'
      });
      
      setEditMode(false);
      
      // Auto-hide the status message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ show: false, message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveStatus({
        show: true,
        message: 'Failed to save profile',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (section, field, value) => {
    if (section) {
      setProfile(prevProfile => ({
        ...prevProfile,
        [section]: {
          ...prevProfile[section],
          [field]: value
        }
      }));
    } else {
      setProfile(prevProfile => ({
        ...prevProfile,
        [field]: value
      }));
    }
  };
  
  const handleWorkFormChange = (field, value) => {
    setWorkForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleEducationFormChange = (field, value) => {
    setEducationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const addWorkExperience = () => {
    // Validate required fields
    if (!workForm.company || !workForm.title || !workForm.startDate) {
      alert('Please fill in required fields: Company, Title, and Start Date');
      return;
    }
    
    const newWorkExperience = {
      id: Date.now(), // Generate a temporary ID
      ...workForm
    };
    
    setProfile(prevProfile => ({
      ...prevProfile,
      workExperience: [...prevProfile.workExperience, newWorkExperience]
    }));
    
    // Reset the form
    setWorkForm({
      company: '',
      title: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    });
  };
  
  const addEducation = () => {
    // Validate required fields
    if (!educationForm.institution || !educationForm.degree || !educationForm.startDate) {
      alert('Please fill in required fields: Institution, Degree, and Start Date');
      return;
    }
    
    const newEducation = {
      id: Date.now(), // Generate a temporary ID
      ...educationForm
    };
    
    setProfile(prevProfile => ({
      ...prevProfile,
      education: [...prevProfile.education, newEducation]
    }));
    
    // Reset the form
    setEducationForm({
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    });
  };
  
  const addSkill = (skill) => {
    if (!skill.trim()) return;
    
    setProfile(prevProfile => ({
      ...prevProfile,
      skills: [...prevProfile.skills, skill.trim()]
    }));
  };
  
  const removeWorkExperience = (id) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      workExperience: prevProfile.workExperience.filter(item => item.id !== id)
    }));
  };
  
  const removeEducation = (id) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      education: prevProfile.education.filter(item => item.id !== id)
    }));
  };
  
  const removeSkill = (index) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      skills: prevProfile.skills.filter((_, i) => i !== index)
    }));
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  return (
    <div className="profile-page">
      <div className="page-header">
        <h1 className="page-title">Professional Profile</h1>
        
        <div className="page-actions">
          {editMode ? (
            <>
              <button 
                className="secondary-button"
                onClick={() => setEditMode(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="primary-button"
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Save Profile
                  </>
                )}
              </button>
            </>
          ) : (
            <button 
              className="primary-button"
              onClick={() => setEditMode(true)}
            >
              <i className="fas fa-pencil-alt"></i> Edit Profile
            </button>
          )}
        </div>
      </div>
      
      {saveStatus.show && (
        <div className={`notification-banner ${saveStatus.type}`}>
          <span>{saveStatus.message}</span>
          <button 
            className="notification-close"
            onClick={() => setSaveStatus({ show: false, message: '', type: '' })}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
      
      <div className="profile-content">
        {/* Basic Info Section */}
        <section className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-user"></i> Basic Information
            </h2>
          </div>
          
          <div className="profile-basic-info">
            <div className="profile-avatar-container">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={profile.name} 
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              {editMode && (
                <button className="avatar-upload-button">
                  <i className="fas fa-camera"></i>
                </button>
              )}
            </div>
            
            <div className="profile-details">
              {editMode ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.name}
                      onChange={(e) => handleInputChange(null, 'name', e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Professional Headline</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.headline}
                      onChange={(e) => handleInputChange(null, 'headline', e.target.value)}
                      placeholder="e.g., Software Engineer at TechCorp"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.location}
                      onChange={(e) => handleInputChange(null, 'location', e.target.value)}
                      placeholder="e.g., Bangalore, India"
                    />
                  </div>
                </>
              ) : (
                <>
                  <h2 className="profile-name">{profile.name || 'Your Name'}</h2>
                  {profile.headline && <p className="profile-headline">{profile.headline}</p>}
                  {profile.location && (
                    <p className="profile-location">
                      <i className="fas fa-map-marker-alt"></i> {profile.location}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
        
        {/* About/Bio Section */}
        <section className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-info-circle"></i> About Me
            </h2>
          </div>
          
          {editMode ? (
            <div className="form-group">
              <label className="form-label">Professional Summary</label>
              <textarea
                className="form-textarea"
                value={profile.bio}
                onChange={(e) => handleInputChange(null, 'bio', e.target.value)}
                placeholder="Write a brief professional summary..."
                rows={4}
              />
            </div>
          ) : (
            <div className="profile-bio">
              {profile.bio ? (
                <p>{profile.bio}</p>
              ) : (
                <p className="empty-section-text">Add a professional summary to tell others about yourself.</p>
              )}
            </div>
          )}
        </section>
        
        {/* Contact Information */}
        <section className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-address-card"></i> Contact Information
            </h2>
          </div>
          
          {editMode ? (
            <div className="contact-form">
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={profile.contactInfo.email}
                  onChange={(e) => handleInputChange('contactInfo', 'email', e.target.value)}
                  placeholder="Your email address"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={profile.contactInfo.phone}
                  onChange={(e) => handleInputChange('contactInfo', 'phone', e.target.value)}
                  placeholder="Your phone number"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Website</label>
                <input
                  type="url"
                  className="form-input"
                  value={profile.contactInfo.website}
                  onChange={(e) => handleInputChange('contactInfo', 'website', e.target.value)}
                  placeholder="Your personal website"
                />
              </div>
            </div>
          ) : (
            <div className="contact-info">
              {profile.contactInfo.email && (
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <span>{profile.contactInfo.email}</span>
                </div>
              )}
              
              {profile.contactInfo.phone && (
                <div className="contact-item">
                  <i className="fas fa-phone"></i>
                  <span>{profile.contactInfo.phone}</span>
                </div>
              )}
              
              {profile.contactInfo.website && (
                <div className="contact-item">
                  <i className="fas fa-globe"></i>
                  <a href={profile.contactInfo.website} target="_blank" rel="noopener noreferrer">
                    {profile.contactInfo.website}
                  </a>
                </div>
              )}
              
              {!profile.contactInfo.email && !profile.contactInfo.phone && !profile.contactInfo.website && (
                <p className="empty-section-text">Add your contact information to help others connect with you.</p>
              )}
            </div>
          )}
        </section>
        
        {/* Work Experience Section */}
        <section className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-briefcase"></i> Work Experience
            </h2>
          </div>
          
          {/* Display existing work experience */}
          <div className="experience-list">
            {profile.workExperience.length > 0 ? (
              profile.workExperience.map((work) => (
                <div key={work.id} className="experience-item">
                  {editMode && (
                    <button 
                      className="remove-button"
                      onClick={() => removeWorkExperience(work.id)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                  
                  <div className="experience-header">
                    <h3 className="experience-title">{work.title}</h3>
                    <p className="experience-company">{work.company}</p>
                    <p className="experience-date">
                      {formatDate(work.startDate)} - {work.current ? 'Present' : formatDate(work.endDate)}
                    </p>
                    {work.location && <p className="experience-location">{work.location}</p>}
                  </div>
                  
                  {work.description && (
                    <p className="experience-description">{work.description}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="empty-section-text">Add your work experience to showcase your professional journey.</p>
            )}
          </div>
          
          {/* Work experience form (in edit mode) */}
          {editMode && (
            <div className="experience-form">
              <h3 className="form-subtitle">Add Work Experience</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={workForm.title}
                    onChange={(e) => handleWorkFormChange('title', e.target.value)}
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Company *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={workForm.company}
                    onChange={(e) => handleWorkFormChange('company', e.target.value)}
                    placeholder="e.g., TechCorp Solutions"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={workForm.location}
                    onChange={(e) => handleWorkFormChange('location', e.target.value)}
                    placeholder="e.g., Bangalore, India"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="month"
                    className="form-input"
                    value={workForm.startDate}
                    onChange={(e) => handleWorkFormChange('startDate', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="month"
                    className="form-input"
                    value={workForm.endDate}
                    onChange={(e) => handleWorkFormChange('endDate', e.target.value)}
                    disabled={workForm.current}
                  />
                  
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="currentJob"
                      checked={workForm.current}
                      onChange={(e) => handleWorkFormChange('current', e.target.checked)}
                    />
                    <label htmlFor="currentJob">I currently work here</label>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={workForm.description}
                  onChange={(e) => handleWorkFormChange('description', e.target.value)}
                  placeholder="Describe your responsibilities and achievements..."
                  rows={3}
                />
              </div>
              
              <button 
                className="primary-button"
                onClick={addWorkExperience}
              >
                <i className="fas fa-plus"></i> Add Experience
              </button>
            </div>
          )}
        </section>
        
        {/* Education Section */}
        <section className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-graduation-cap"></i> Education
            </h2>
          </div>
          
          {/* Display existing education */}
          <div className="education-list">
            {profile.education.length > 0 ? (
              profile.education.map((edu) => (
                <div key={edu.id} className="education-item">
                  {editMode && (
                    <button 
                      className="remove-button"
                      onClick={() => removeEducation(edu.id)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                  
                  <div className="education-header">
                    <h3 className="education-institution">{edu.institution}</h3>
                    <p className="education-degree">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</p>
                    <p className="education-date">
                      {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                    </p>
                  </div>
                  
                  {edu.description && (
                    <p className="education-description">{edu.description}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="empty-section-text">Add your education to showcase your academic background.</p>
            )}
          </div>
          
          {/* Education form (in edit mode) */}
          {editMode && (
            <div className="education-form">
              <h3 className="form-subtitle">Add Education</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Institution *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={educationForm.institution}
                    onChange={(e) => handleEducationFormChange('institution', e.target.value)}
                    placeholder="e.g., University of Delhi"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Degree *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={educationForm.degree}
                    onChange={(e) => handleEducationFormChange('degree', e.target.value)}
                    placeholder="e.g., Bachelor of Technology"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Field of Study</label>
                  <input
                    type="text"
                    className="form-input"
                    value={educationForm.field}
                    onChange={(e) => handleEducationFormChange('field', e.target.value)}
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="month"
                    className="form-input"
                    value={educationForm.startDate}
                    onChange={(e) => handleEducationFormChange('startDate', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="month"
                    className="form-input"
                    value={educationForm.endDate}
                    onChange={(e) => handleEducationFormChange('endDate', e.target.value)}
                    disabled={educationForm.current}
                  />
                  
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="currentEducation"
                      checked={educationForm.current}
                      onChange={(e) => handleEducationFormChange('current', e.target.checked)}
                    />
                    <label htmlFor="currentEducation">I am currently studying here</label>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={educationForm.description}
                  onChange={(e) => handleEducationFormChange('description', e.target.value)}
                  placeholder="Add details about your academic achievements..."
                  rows={3}
                />
              </div>
              
              <button 
                className="primary-button"
                onClick={addEducation}
              >
                <i className="fas fa-plus"></i> Add Education
              </button>
            </div>
          )}
        </section>
        
        {/* Skills Section */}
        <section className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-chart-bar"></i> Skills
            </h2>
          </div>
          
          <div className="skills-container">
            {profile.skills.length > 0 ? (
              <div className="skills-list">
                {profile.skills.map((skill, index) => (
                  <div key={index} className="skill-tag">
                    {skill}
                    {editMode && (
                      <button 
                        className="skill-remove"
                        onClick={() => removeSkill(index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-section-text">Add your professional skills to highlight your expertise.</p>
            )}
          </div>
          
          {/* Skills form (in edit mode) */}
          {editMode && (
            <div className="skills-form">
              <h3 className="form-subtitle">Add Skills</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Skill</label>
                  <div className="skill-input-container">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Project Management"
                      id="skillInput"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button 
                      className="skill-add-button"
                      onClick={() => {
                        const input = document.getElementById('skillInput');
                        addSkill(input.value);
                        input.value = '';
                      }}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <small className="form-help-text">Press Enter to add each skill</small>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;