import React from 'react';
import ReactDOM from 'react-dom';
import { useMentorship } from './MentorshipContextProvider';

const ProgramDetailsModal = ({ program, onClose, onApply, isApplying }) => {
  const { formatDate } = useMentorship();
  
  // Close on background click
  const handleBackgroundClick = (e) => {
    if (e.target.classList.contains('cyber-modal-backdrop')) {
      onClose();
    }
  };
  
  // Portal the modal to the end of the document body
  return ReactDOM.createPortal(
    <div className="cyber-modal-backdrop" onClick={handleBackgroundClick}>
      <div className="cyber-modal">
        <div className="cyber-modal-header">
          <h3 className="cyber-modal-title">{program.title}</h3>
          <button className="cyber-modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="cyber-modal-content">
          {/* Program Image */}
          <div className="cyber-program-image-container">
            <img 
              src={program.image || `https://picsum.photos/seed/${program.title}/800/400`} 
              alt={program.title}
              className="cyber-program-hero-image"
            />
            <div className="cyber-image-overlay"></div>
            <div className="cyber-program-category">{program.category.charAt(0).toUpperCase() + program.category.slice(1).replace('_', ' ')}</div>
          </div>
          
          {/* Program Overview */}
          <div className="cyber-program-overview">
            <div className="cyber-overview-left">
              <div className="cyber-mentor-info">
                <span className="cyber-info-label">Led by</span>
                <span className="cyber-mentor-name">{program.mentor}</span>
              </div>
              
              <div className="cyber-program-metrics">
                <div className="cyber-metric">
                  <div className="cyber-metric-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="cyber-metric-data">
                    <span className="cyber-metric-label">Starts</span>
                    <span className="cyber-metric-value">{formatDate(program.startDate)}</span>
                  </div>
                </div>
                
                <div className="cyber-metric">
                  <div className="cyber-metric-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="cyber-metric-data">
                    <span className="cyber-metric-label">Duration</span>
                    <span className="cyber-metric-value">{program.duration}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="cyber-overview-right">
              <div className="cyber-program-metrics">
                <div className="cyber-metric">
                  <div className="cyber-metric-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="cyber-metric-data">
                    <span className="cyber-metric-label">Format</span>
                    <span className="cyber-metric-value">{program.format}</span>
                  </div>
                </div>
                
                <div className="cyber-metric">
                  <div className="cyber-metric-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="cyber-metric-data">
                    <span className="cyber-metric-label">Industry</span>
                    <span className="cyber-metric-value">{program.industry}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Program Description */}
          <div className="cyber-section">
            <h4 className="cyber-section-title">About this Program</h4>
            <p className="cyber-section-content">
              {program.description}
            </p>
          </div>
          
          {/* Program Requirements */}
          <div className="cyber-section">
            <h4 className="cyber-section-title">Required Skills</h4>
            <div className="cyber-skills-grid">
              {program.requiredSkills && program.requiredSkills.map((skill, index) => (
                <div key={index} className="cyber-skill-item">
                  <div className="cyber-skill-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="cyber-skill-text">{skill}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* What You'll Learn Section (Sample) */}
          <div className="cyber-section">
            <h4 className="cyber-section-title">What You'll Learn</h4>
            <div className="cyber-learning-grid">
              <div className="cyber-learning-item">
                <div className="cyber-learning-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="cyber-learning-text">Core concepts and fundamentals</span>
              </div>
              <div className="cyber-learning-item">
                <div className="cyber-learning-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <span className="cyber-learning-text">Practical hands-on experience</span>
              </div>
              <div className="cyber-learning-item">
                <div className="cyber-learning-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <span className="cyber-learning-text">Personalized feedback and mentorship</span>
              </div>
              <div className="cyber-learning-item">
                <div className="cyber-learning-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="cyber-learning-text">Industry-relevant projects and portfolio</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="cyber-modal-footer">
          <button type="button" className="cyber-cancel-button" onClick={onClose}>
            Close
          </button>
          <button 
            type="button" 
            className="cyber-apply-button"
            onClick={onApply}
            disabled={isApplying}
          >
            {isApplying ? (
              <>
                <div className="cyber-button-spinner"></div>
                <span>Applying...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <span>Apply Now</span>
              </>
            )}
          </button>
        </div>
        
        {/* Decorative corners */}
        <div className="cyber-corner cyber-corner-tl"></div>
        <div className="cyber-corner cyber-corner-tr"></div>
        <div className="cyber-corner cyber-corner-bl"></div>
        <div className="cyber-corner cyber-corner-br"></div>
        
        <style jsx>{`
          /* Modal Backdrop */
          .cyber-modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 50;
            overflow-y: auto;
            padding: 2rem 1rem;
          }
          
          /* Modal */
          .cyber-modal {
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid rgba(6, 182, 212, 0.3);
            border-radius: 0.5rem;
            width: 100%;
            max-width: 48rem;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            animation: modal-appear 0.3s ease-out;
          }
          
          @keyframes modal-appear {
            from {
              opacity: 0;
              transform: translateY(1rem);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          /* Modal Header */
          .cyber-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid rgba(6, 182, 212, 0.2);
            position: sticky;
            top: 0;
            background: rgba(15, 23, 42, 0.95);
            z-index: 10;
          }
          
          .cyber-modal-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: white;
          }
          
          .cyber-modal-close {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2rem;
            height: 2rem;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(6, 182, 212, 0.2);
            border-radius: 0.375rem;
            color: rgba(226, 232, 240, 0.7);
            transition: all 0.3s;
          }
          
          .cyber-modal-close:hover {
            background: rgba(15, 23, 42, 0.8);
            border-color: rgba(6, 182, 212, 0.4);
            color: rgba(226, 232, 240, 0.9);
          }
          
          /* Modal Content */
          .cyber-modal-content {
            padding: 0 0 1.5rem 0;
          }
          
          /* Program Image */
          .cyber-program-image-container {
            position: relative;
            width: 100%;
            height: 240px;
            overflow: hidden;
          }
          
          .cyber-program-hero-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .cyber-image-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              to bottom,
              rgba(15, 23, 42, 0.3) 0%,
              rgba(15, 23, 42, 0.7) 100%
            );
          }
          
          .cyber-program-category {
            position: absolute;
            top: 1rem;
            right: 1rem;
            padding: 0.375rem 0.75rem;
            background: rgba(6, 182, 212, 0.2);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(6, 182, 212, 0.3);
            border-radius: 0.375rem;
            font-size: 0.75rem;
            font-weight: 500;
            color: rgb(6, 182, 212);
          }
          
          /* Program Overview */
          .cyber-program-overview {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            padding: 1.5rem;
            border-bottom: 1px solid rgba(6, 182, 212, 0.2);
          }
          
          .cyber-overview-left, .cyber-overview-right {
            flex: 1;
            min-width: 250px;
          }
          
          .cyber-mentor-info {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            margin-bottom: 1rem;
          }
          
          .cyber-info-label {
            font-size: 0.75rem;
            color: rgba(226, 232, 240, 0.6);
          }
          
          .cyber-mentor-name {
            font-size: 1rem;
            font-weight: 500;
            color: white;
          }
          
          .cyber-program-metrics {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .cyber-metric {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
          
          .cyber-metric-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2.25rem;
            height: 2.25rem;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(6, 182, 212, 0.2);
            border-radius: 0.375rem;
            color: rgb(6, 182, 212);
            flex-shrink: 0;
          }
          
          .cyber-metric-data {
            display: flex;
            flex-direction: column;
            gap: 0.125rem;
          }
          
          .cyber-metric-label {
            font-size: 0.75rem;
            color: rgba(226, 232, 240, 0.6);
          }
          
          .cyber-metric-value {
            font-size: 0.875rem;
            font-weight: 500;
            color: rgba(226, 232, 240, 0.9);
          }
          
          /* Content Sections */
          .cyber-section {
            padding: 1.5rem;
            border-bottom: 1px solid rgba(6, 182, 212, 0.2);
          }
          
          .cyber-section:last-child {
            border-bottom: none;
          }
          
          .cyber-section-title {
            font-size: 1rem;
            font-weight: 600;
            color: white;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
          }
          
          .cyber-section-content {
            font-size: 0.875rem;
            color: rgba(226, 232, 240, 0.8);
            line-height: 1.6;
          }
          
          /* Skills Grid */
          .cyber-skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 0.75rem;
          }
          
          .cyber-skill-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: rgba(226, 232, 240, 0.9);
          }
          
          .cyber-skill-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 1.5rem;
            height: 1.5rem;
            background: rgba(16, 185, 129, 0.1);
            border-radius: 50%;
            color: rgb(16, 185, 129);
            flex-shrink: 0;
          }
          
          /* Learning Grid */
          .cyber-learning-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 1rem;
          }
          
          .cyber-learning-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            background: rgba(15, 23, 42, 0.4);
            border: 1px solid rgba(6, 182, 212, 0.1);
            border-radius: 0.375rem;
            transition: all 0.3s;
          }
          
          .cyber-learning-item:hover {
            background: rgba(15, 23, 42, 0.6);
            border-color: rgba(6, 182, 212, 0.2);
            transform: translateY(-2px);
          }
          
          .cyber-learning-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2rem;
            height: 2rem;
            background: rgba(79, 70, 229, 0.1);
            border-radius: 0.375rem;
            color: rgb(79, 70, 229);
            flex-shrink: 0;
          }
          
          .cyber-learning-text {
            font-size: 0.875rem;
            color: rgba(226, 232, 240, 0.9);
          }
          
          /* Modal Footer */
          .cyber-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            padding: 1.25rem 1.5rem;
            border-top: 1px solid rgba(6, 182, 212, 0.2);
            position: sticky;
            bottom: 0;
            background: rgba(15, 23, 42, 0.95);
          }
          
          .cyber-cancel-button {
            padding: 0.625rem 1.25rem;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(226, 232, 240, 0.2);
            border-radius: 0.375rem;
            color: rgba(226, 232, 240, 0.7);
            font-size: 0.875rem;
            transition: all 0.3s;
          }
          
          .cyber-cancel-button:hover:not(:disabled) {
            background: rgba(15, 23, 42, 0.8);
            border-color: rgba(226, 232, 240, 0.3);
            color: rgba(226, 232, 240, 0.9);
          }
          
          .cyber-apply-button {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.625rem 1.25rem;
            background: linear-gradient(90deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 0.375rem;
            color: rgb(16, 185, 129);
            font-size: 0.875rem;
            font-weight: 500;
            transition: all 0.3s;
          }
          
          .cyber-apply-button:hover:not(:disabled) {
            background: linear-gradient(90deg, rgba(16, 185, 129, 0.3) 0%, rgba(6, 182, 212, 0.3) 100%);
            border-color: rgba(16, 185, 129, 0.5);
            transform: translateY(-2px);
            box-shadow: 0 2px 10px rgba(16, 185, 129, 0.2);
          }
          
          .cyber-apply-button:disabled, .cyber-cancel-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          
          /* Button Spinner */
          .cyber-button-spinner {
            width: 1rem;
            height: 1rem;
            border: 2px solid rgba(16, 185, 129, 0.3);
            border-top-color: rgb(16, 185, 129);
            border-radius: 50%;
            margin-right: 0.5rem;
            animation: spinner-rotate 1s linear infinite;
          }
          
          @keyframes spinner-rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* Corner Decorations */
          .cyber-corner {
            position: absolute;
            width: 8px;
            height: 8px;
            border-color: rgb(6, 182, 212);
            z-index: 1;
          }
          
          .cyber-corner-tl {
            top: 0;
            left: 0;
            border-top: 1px solid;
            border-left: 1px solid;
          }
          
          .cyber-corner-tr {
            top: 0;
            right: 0;
            border-top: 1px solid;
            border-right: 1px solid;
          }
          
          .cyber-corner-bl {
            bottom: 0;
            left: 0;
            border-bottom: 1px solid;
            border-left: 1px solid;
          }
          
          .cyber-corner-br {
            bottom: 0;
            right: 0;
            border-bottom: 1px solid;
            border-right: 1px solid;
          }
        `}</style>
      </div>
    </div>,
    document.body
  );
};

export default ProgramDetailsModal;