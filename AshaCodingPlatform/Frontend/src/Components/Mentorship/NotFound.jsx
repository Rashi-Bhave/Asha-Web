import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="cyber-glitch-box">
        <h1 className="cyber-glitch-text" data-text="404">404</h1>
      </div>
      
      <h2 className="not-found-title">Page Not Found</h2>
      <p className="not-found-message">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <Link to="/mentorship" className="cyber-return-button">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Return to Mentorship Hub
      </Link>
      
      <div className="cyber-grid"></div>
      <div className="cyber-noise"></div>
      
      <style jsx>{`
        .not-found-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          background: #0f172a;
        }
        
        .cyber-glitch-box {
          position: relative;
          margin-bottom: 2rem;
        }
        
        .cyber-glitch-text {
          font-size: 8rem;
          font-weight: 700;
          color: white;
          position: relative;
          display: inline-block;
        }
        
        .cyber-glitch-text::before,
        .cyber-glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .cyber-glitch-text::before {
          left: 2px;
          text-shadow: -2px 0 rgb(6, 182, 212);
          clip: rect(24px, 550px, 90px, 0);
          animation: cyber-glitch-anim-2 3s infinite linear alternate-reverse;
        }
        
        .cyber-glitch-text::after {
          left: -2px;
          text-shadow: -2px 0 rgb(239, 68, 68);
          clip: rect(85px, 550px, 140px, 0);
          animation: cyber-glitch-anim 2.5s infinite linear alternate-reverse;
        }
        
        @keyframes cyber-glitch-anim {
          0% {
            clip: rect(60px, 9999px, 12px, 0);
          }
          20% {
            clip: rect(31px, 9999px, 148px, 0);
          }
          40% {
            clip: rect(20px, 9999px, 64px, 0);
          }
          60% {
            clip: rect(86px, 9999px, 150px, 0);
          }
          80% {
            clip: rect(5px, 9999px, 115px, 0);
          }
          100% {
            clip: rect(96px, 9999px, 78px, 0);
          }
        }
        
        @keyframes cyber-glitch-anim-2 {
          0% {
            clip: rect(19px, 9999px, 67px, 0);
          }
          20% {
            clip: rect(93px, 9999px, 26px, 0);
          }
          40% {
            clip: rect(27px, 9999px, 133px, 0);
          }
          60% {
            clip: rect(45px, 9999px, 34px, 0);
          }
          80% {
            clip: rect(75px, 9999px, 94px, 0);
          }
          100% {
            clip: rect(18px, 9999px, 119px, 0);
          }
        }
        
        .not-found-title {
          font-size: 2rem;
          font-weight: 600;
          color: white;
          margin-bottom: 1rem;
        }
        
        .not-found-message {
          font-size: 1.125rem;
          color: rgba(226, 232, 240, 0.7);
          margin-bottom: 2.5rem;
          max-width: 24rem;
        }
        
        .cyber-return-button {
          display: inline-flex;
          align-items: center;
          padding: 0.875rem 1.5rem;
          background: rgba(6, 182, 212, 0.2);
          border: 1px solid rgba(6, 182, 212, 0.5);
          border-radius: 0.375rem;
          color: rgb(6, 182, 212);
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        
        .cyber-return-button:hover {
          background: rgba(6, 182, 212, 0.3);
          border-color: rgba(6, 182, 212, 0.7);
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
          text-decoration: none;
        }
        
        .cyber-grid {
          position: absolute;
          inset: 0;
          z-index: -1;
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
        
        .cyber-noise {
          position: absolute;
          inset: 0;
          z-index: -2;
          opacity: 0.05;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
};

export default NotFound;