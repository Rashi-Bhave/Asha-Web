// Placeholder content for MentorshipPage.js
// pages/MentorshipPage.js
import React, { useState, useEffect } from 'react';

const MentorshipPage = () => {
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadMentorships = async () => {
      try {
        setLoading(true);
        // In a real app, fetch from API
        // For demo, create mock data
        const mockMentorships = [
          {
            id: 1,
            title: 'Leadership Accelerator Program',
            mentor: 'Dr. Nandita Sharma',
            mentorTitle: 'CEO, TechInnovations India',
            focus: 'Executive Leadership Development',
            duration: '6 months',
            format: 'One-on-one sessions + Group workshops',
            description: 'This program is designed for mid-career women looking to advance into senior leadership positions. It combines personalized coaching with group learning to develop strategic leadership skills, executive presence, and organizational influence.',
            image: 'https://randomuser.me/api/portraits/women/21.jpg',
            industry: 'Technology',
            startDate: '2025-05-15',
            commitmentHours: '4-6 hours per month',
            application: 'https://example.com/mentorship/apply/1',
          },
          {
            id: 2,
            title: 'Tech Career Pathfinder',
            mentor: 'Ananya Kapoor',
            mentorTitle: 'Senior Engineering Manager, GlobalSoft',
            focus: 'Technical Career Advancement',
            duration: '4 months',
            format: 'Bi-weekly one-on-one sessions',
            description: 'Designed for women in technical roles looking to grow their careers in engineering, data science, or product development. This mentorship program provides guidance on technical skill development, career planning, and navigating challenges in tech-focused roles.',
            image: 'https://randomuser.me/api/portraits/women/23.jpg',
            industry: 'Software & Technology',
            startDate: '2025-06-01',
            commitmentHours: '2-3 hours per month',
            application: 'https://example.com/mentorship/apply/2',
          },
          {
            id: 3,
            title: 'Entrepreneurship Launchpad',
            mentor: 'Ritu Malhotra',
            mentorTitle: 'Founder & CEO, GrowthVentures',
            focus: 'Business Development & Entrepreneurship',
            duration: '6 months',
            format: 'Monthly one-on-one + Peer group sessions',
            description: 'For women entrepreneurs at any stage of their business journey. This program provides guidance on business planning, funding strategies, operations, marketing, and leadership challenges specific to startup founders and small business owners.',
            image: 'https://randomuser.me/api/portraits/women/25.jpg',
            industry: 'Entrepreneurship',
            startDate: '2025-05-10',
            commitmentHours: '4-5 hours per month',
            application: 'https://example.com/mentorship/apply/3',
          }
        ];
        
        setMentorships(mockMentorships);
        setLoading(false);
      } catch (error) {
        console.error('Error loading mentorships:', error);
        setLoading(false);
      }
    };
    
    loadMentorships();
  }, []);
  
  const renderMentorshipCard = (mentorship) => {
    return (
      <div key={mentorship.id} className="card">
        <div className="card-header">
          <div className="card-title-container">
            <h3 className="card-title">{mentorship.title}</h3>
            <div className="card-subtitle">Led by {mentorship.mentor}</div>
          </div>
          
          {mentorship.image && (
            <img
              src={mentorship.image}
              alt={mentorship.mentor}
              className="card-logo mentor-image"
            />
          )}
        </div>
        
        <div className="card-content">
          <div className="card-details">
            <div className="card-detail-item">
              <i className="fas fa-briefcase"></i>
              <span className="card-detail-text">{mentorship.focus}</span>
            </div>
            
            <div className="card-detail-item">
              <i className="fas fa-clock"></i>
              <span className="card-detail-text">{mentorship.duration}</span>
            </div>
            
            <div className="card-detail-item">
              <i className="fas fa-industry"></i>
              <span className="card-detail-text">{mentorship.industry}</span>
            </div>
          </div>
          
          <div className="card-detail-item">
            <i className="fas fa-calendar-alt"></i>
            <span className="card-detail-text">Starts {formatDate(mentorship.startDate)}</span>
          </div>
          
          <div className="card-detail-item">
            <i className="fas fa-user-clock"></i>
            <span className="card-detail-text">Commitment: {mentorship.commitmentHours}</span>
          </div>
          
          <div className="card-detail-item">
            <i className="fas fa-users"></i>
            <span className="card-detail-text">Format: {mentorship.format}</span>
          </div>
          
          <p className="card-description">
            {mentorship.description}
          </p>
        </div>
        
        <div className="card-actions">
          <button className="action-button">
            <i className="far fa-bookmark"></i>
            <span>Save</span>
          </button>
          
          <button className="action-button">
            <i className="fas fa-share"></i>
            <span>Share</span>
          </button>
          
          <a 
            href={mentorship.application} 
            target="_blank" 
            rel="noopener noreferrer"
            className="primary-button"
          >
            Apply Now
          </a>
        </div>
      </div>
    );
  };
  
  return (
    <div className="mentorship-page">
      <div className="page-header">
        <h1 className="page-title">Mentorship Programs</h1>
        <p className="page-description">
          Connect with experienced mentors who can guide your professional journey
        </p>
      </div>
      
      <div className="search-filter-container">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search mentors, programs, skills..."
          />
          <button className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>
      
      <div className="mentorship-list">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading mentorship programs...</p>
          </div>
        ) : mentorships.length > 0 ? (
          mentorships.map(mentorship => renderMentorshipCard(mentorship))
        ) : (
          <div className="empty-state">
            <i className="fas fa-users empty-icon"></i>
            <h2 className="empty-title">No mentorship programs found</h2>
            <p className="empty-text">
              There are no mentorship programs available at the moment. Please check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Utility function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'Soon';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

export default MentorshipPage;

// pages/SettingsPage.js
