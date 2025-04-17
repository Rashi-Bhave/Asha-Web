// Placeholder content for AboutPage.js
// pages/AboutPage.js
import React from 'react';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="page-header">
        <h1 className="page-title">About Asha AI</h1>
      </div>
      
      <div className="about-content">
        <section className="about-section">
          <h2 className="section-title">Our Mission</h2>
          <p className="section-text">
            Asha AI is dedicated to empowering women in their career journeys by providing 
            personalized guidance, access to opportunities, and a supportive community. 
            Our mission is to bridge the gender gap in the workforce and help women 
            achieve their professional goals.
          </p>
        </section>
        
        <section className="about-section">
          <h2 className="section-title">Who We Are</h2>
          <p className="section-text">
            Developed by the JobsForHer Foundation, Asha AI combines artificial 
            intelligence with human expertise to create a personalized career companion. 
            Our team is comprised of technologists, career coaches, and industry experts 
            who are passionate about women's professional growth.
          </p>
        </section>
        
        <section className="about-section">
          <h2 className="section-title">How Asha AI Works</h2>
          <p className="section-text">
            Asha AI uses natural language processing to understand your career goals, 
            preferences, and challenges. It then provides tailored recommendations for 
            job opportunities, skills development, networking events, and mentorship 
            programs. The more you interact with Asha, the more personalized your 
            experience becomes.
          </p>
        </section>
        
        <section className="about-section">
          <h2 className="section-title">Our Features</h2>
          <div className="features-list">
            <div className="feature-item">
              <i className="fas fa-briefcase feature-icon"></i>
              <div className="feature-text">
                <h3 className="feature-title">Job Opportunities</h3>
                <p className="feature-description">
                  Discover personalized job listings that match your skills and career goals.
                </p>
              </div>
            </div>
            
            <div className="feature-item">
              <i className="fas fa-calendar feature-icon"></i>
              <div className="feature-text">
                <h3 className="feature-title">Community Events</h3>
                <p className="feature-description">
                  Stay updated with events, workshops, and networking opportunities.
                </p>
              </div>
            </div>
            
            <div className="feature-item">
              <i className="fas fa-users feature-icon"></i>
              <div className="feature-text">
                <h3 className="feature-title">Mentorship Programs</h3>
                <p className="feature-description">
                  Connect with experienced mentors who can guide your professional journey.
                </p>
              </div>
            </div>
            
            <div className="feature-item">
              <i className="fas fa-comment-dots feature-icon"></i>
              <div className="feature-text">
                <h3 className="feature-title">Smart Conversations</h3>
                <p className="feature-description">
                  Engage with Asha AI for career advice and information tailored to your needs.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="about-section">
          <h2 className="section-title">Contact Us</h2>
          <p className="section-text">
            Have questions or feedback? We'd love to hear from you.
          </p>
          <div className="contact-info">
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <span>support@ashaai.org</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <span>+91 1234567890</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;