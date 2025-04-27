import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MentorshipSessions } from './index';
import { useMentorship } from './MentorshipContextProvider';

const MentorshipSessionsPage = () => {
  const { isAuthenticated } = useMentorship();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="cyber-grid"></div>
      </div>
      
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full filter blur-[150px] bg-blue-900 opacity-20 animate-pulse-slow"
        style={{transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`}}
      ></div>
      <div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full filter blur-[150px] bg-purple-900 opacity-20 animate-pulse-slow animation-delay-1000"
        style={{transform: `translate(${-mousePosition.x * 30}px, ${-mousePosition.y * 30}px)`}}
      ></div>
      
      {/* Header */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="h-8 w-8 text-cyan-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h1 className="text-xl font-medium text-white">
              Mentorship <span className="text-cyan-400">Sessions</span>
              <span className="cyber-blink">_</span>
            </h1>
          </div>
          
          <Link to="/mentorship" className="cyber-dashboard-button">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Mentorship Dashboard</span>
          </Link>
        </div>
        <p className="mt-2 text-gray-400 max-w-3xl">
          View and manage all your scheduled mentorship sessions in one place.
        </p>
      </div>
      
      {/* Sessions Component */}
      <div className="relative z-10">
        <MentorshipSessions />
      </div>
      
      {/* Additional Info Section */}
      {isAuthenticated && (
        <div className="cyber-info-panel mt-8 relative z-10">
          <div className="cyber-info-header">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="cyber-info-title">Session Information</h3>
          </div>
          
          <div className="cyber-info-content">
            <div className="cyber-info-item">
              <div className="cyber-info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="cyber-info-text">
                <h4 className="cyber-info-subtitle">Session Duration</h4>
                <p>Most mentorship sessions are 30-60 minutes long. Make sure to join on time and be prepared with your questions.</p>
              </div>
            </div>
            
            <div className="cyber-info-item">
              <div className="cyber-info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="cyber-info-text">
                <h4 className="cyber-info-subtitle">Cancellation Policy</h4>
                <p>Please cancel at least 24 hours in advance so mentors can reschedule their time. Repeated last-minute cancellations may affect your ability to book future sessions.</p>
              </div>
            </div>
            
            <div className="cyber-info-item">
              <div className="cyber-info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="cyber-info-text">
                <h4 className="cyber-info-subtitle">Meeting Links</h4>
                <p>The meeting link will be available 15 minutes before your scheduled session. Click the "Join Meeting" button to connect with your mentor.</p>
              </div>
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
        
        /* Dashboard Button */
        .cyber-dashboard-button {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          color: rgb(6, 182, 212);
          font-size: 0.875rem;
          transition: all 0.3s;
        }
        
        .cyber-dashboard-button:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
        }
        
        /* Info Panel */
        .cyber-info-panel {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          overflow: hidden;
          backdrop-filter: blur(10px);
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 0 0 1px rgba(6, 182, 212, 0.1) inset,
            0 0 20px rgba(6, 182, 212, 0.1);
        }
        
        .cyber-info-header {
          display: flex;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(6, 182, 212, 0.2);
          background: rgba(15, 23, 42, 0.8);
        }
        
        .cyber-info-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
        }
        
        .cyber-info-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .cyber-info-item {
          display: flex;
          gap: 1rem;
        }
        
        .cyber-info-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          color: rgb(6, 182, 212);
          flex-shrink: 0;
        }
        
        .cyber-info-text {
          flex: 1;
        }
        
        .cyber-info-subtitle {
          font-size: 1rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
          margin-bottom: 0.375rem;
        }
        
        .cyber-info-text p {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.7);
          line-height: 1.5;
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

export default MentorshipSessionsPage;