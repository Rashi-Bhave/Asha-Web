import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMentorship } from './MentorshipContextProvider';
import ProgramDetailsModal from './ProgramDetailsModal'; // Add this import statement

const MentorshipProgram = ({ program }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const { 
    formatDate, 
    saveProgram, 
    removeSavedProgram, 
    isProgramSaved, 
    applyToProgram 
  } = useMentorship();
  
  // Check if program is saved
  const programIsSaved = isProgramSaved(program.id);
  
  // Handle saving/unsaving program
  const handleSaveToggle = () => {
    if (programIsSaved) {
      removeSavedProgram(program.id);
    } else {
      saveProgram(program.id);
    }
  };
  
  // Handle sharing program
  const handleShare = () => {
    // In a real app, this would use the Web Share API or copy to clipboard
    const shareText = `Check out this program: ${program.title} - led by ${program.mentor}`;
    
    if (navigator.share) {
      navigator.share({
        title: program.title,
        text: shareText,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
        copyToClipboard(shareText);
      });
    } else {
      copyToClipboard(shareText);
    }
  };
  
  // Helper to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Program link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    });
  };
  
  // Handle apply to program
  const handleApply = async () => {
    try {
      setIsApplying(true);
      
      toast.success(`Applying to ${program.title}`);
      
      // Call the context function to apply to a program
      const applicationUrl = await applyToProgram(program.id);
      
      // If the program has an application link, open it
      if (applicationUrl) {
        window.open(applicationUrl, '_blank');
      } else {
        toast.success('Application submitted successfully!');
      }
    } catch (error) {
      console.error('Error applying to program:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };
  
  // Toggle program details modal
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <>
      <div className="cyber-program-card" onClick={toggleDetails}>
        {/* Card Image */}
        <div className="cyber-program-image-container">
          <img 
            src={program.image || `https://picsum.photos/seed/${program.title}/400/200`} 
            alt={program.title}
            className="cyber-program-image"
          />
          <div className="cyber-image-overlay"></div>
          <div className="cyber-program-category">{program.category.charAt(0).toUpperCase() + program.category.slice(1).replace('_', ' ')}</div>
        </div>
        
        {/* Card Content */}
        <div className="cyber-program-content">
          <h3 className="cyber-program-title">{program.title}</h3>
          
          <div className="cyber-program-mentor">
            <span className="cyber-program-label">Led by:</span>
            <span className="cyber-program-mentor-name">{program.mentor}</span>
          </div>
          
          <div className="cyber-program-details">
            <div className="cyber-detail-item">
              <div className="cyber-detail-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="cyber-detail-content">
                <span className="cyber-detail-label">Starts</span>
                <span className="cyber-detail-value">{formatDate(program.startDate)}</span>
              </div>
            </div>
            
            <div className="cyber-detail-item">
              <div className="cyber-detail-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="cyber-detail-content">
                <span className="cyber-detail-label">Duration</span>
                <span className="cyber-detail-value">{program.duration}</span>
              </div>
            </div>
            
            <div className="cyber-detail-item">
              <div className="cyber-detail-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="cyber-detail-content">
                <span className="cyber-detail-label">Format</span>
                <span className="cyber-detail-value">{program.format}</span>
              </div>
            </div>
            
            <div className="cyber-detail-item">
              <div className="cyber-detail-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="cyber-detail-content">
                <span className="cyber-detail-label">Industry</span>
                <span className="cyber-detail-value">{program.industry}</span>
              </div>
            </div>
          </div>
          
          <div className="cyber-program-description">
            <p>
              {program.description.length > 150
                ? `${program.description.substring(0, 150)}...`
                : program.description}
            </p>
          </div>
          
          {/* Skills and Experience Required */}
          {program.requiredSkills && program.requiredSkills.length > 0 && (
            <div className="cyber-program-skills">
              <span className="cyber-program-label">Skills Required:</span>
              <div className="cyber-skills-list">
                {program.requiredSkills.map((skill, index) => (
                  <span key={index} className="cyber-skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Card Actions */}
        <div className="cyber-program-actions" onClick={(e) => e.stopPropagation()}>
          <button 
            className={`cyber-program-action ${programIsSaved ? 'cyber-action-active' : ''}`}
            onClick={handleSaveToggle}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill={programIsSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span>{programIsSaved ? 'Saved' : 'Save'}</span>
          </button>
          
          <button className="cyber-program-action" onClick={handleShare}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share</span>
          </button>
          
          <button 
            className="cyber-apply-button"
            onClick={handleApply}
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
            
            {/* Decorative corners */}
            <span className="cyber-corner cyber-corner-tl"></span>
            <span className="cyber-corner cyber-corner-tr"></span>
            <span className="cyber-corner cyber-corner-bl"></span>
            <span className="cyber-corner cyber-corner-br"></span>
          </button>
        </div>
        
        {/* Decorative corners for the card */}
        <div className="cyber-corner cyber-corner-tl"></div>
        <div className="cyber-corner cyber-corner-tr"></div>
        <div className="cyber-corner cyber-corner-bl"></div>
        <div className="cyber-corner cyber-corner-br"></div>
        
        {/* Scan line animation */}
        <div className="cyber-scan-line"></div>
        
        <style jsx>{`
          /* Program Card */
          .cyber-program-card {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(6, 182, 212, 0.2);
            border-radius: 0.5rem;
            overflow: hidden;
            position: relative;
            transition: all 0.3s;
            height: 100%;
            display: flex;
            flex-direction: column;
            cursor: pointer;
          }
          
          .cyber-program-card:hover {
            border-color: rgba(6, 182, 212, 0.5);
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.2);
            transform: translateY(-4px);
          }
          
          /* Image Section */
          .cyber-program-image-container {
            height: 180px;
            position: relative;
            overflow: hidden;
          }
          
          .cyber-program-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: all 0.3s;
          }
          
          .cyber-program-card:hover .cyber-program-image {
            transform: scale(1.05);
          }
          
          .cyber-image-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              to bottom,
              rgba(15, 23, 42, 0) 0%,
              rgba(15, 23, 42, 0.8) 100%
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
          
          /* Content Section */
          .cyber-program-content {
            padding: 1.5rem;
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          
          .cyber-program-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: white;
            margin-bottom: 0.5rem;
            line-height: 1.3;
          }
          
          .cyber-program-mentor {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
          }
          
          .cyber-program-label {
            font-size: 0.75rem;
            color: rgba(226, 232, 240, 0.6);
          }
          
          .cyber-program-mentor-name {
            font-size: 0.875rem;
            font-weight: 500;
            color: rgba(226, 232, 240, 0.9);
          }
          
          /* Program Details */
          .cyber-program-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem 0.5rem;
            margin-bottom: 1rem;
          }
          
          .cyber-detail-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .cyber-detail-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 1.75rem;
            height: 1.75rem;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(6, 182, 212, 0.2);
            border-radius: 0.375rem;
            color: rgb(6, 182, 212);
            flex-shrink: 0;
          }
          
          .cyber-detail-content {
            display: flex;
            flex-direction: column;
          }
          
          .cyber-detail-label {
            font-size: 0.6875rem;
            color: rgba(226, 232, 240, 0.6);
          }
          
          .cyber-detail-value {
            font-size: 0.75rem;
            color: rgba(226, 232, 240, 0.9);
          }
          
          /* Program Description */
          .cyber-program-description {
            font-size: 0.875rem;
            color: rgba(226, 232, 240, 0.8);
            line-height: 1.5;
            margin-bottom: 1rem;
          }
          
          /* Skills Tags */
          .cyber-program-skills {
            margin-top: auto;
          }
          
          .cyber-skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.375rem;
            margin-top: 0.375rem;
          }
          
          .cyber-skill-tag {
            display: inline-block;
            padding: 0.125rem 0.375rem;
            background: rgba(79, 70, 229, 0.1);
            border: 1px solid rgba(79, 70, 229, 0.2);
            border-radius: 0.25rem;
            font-size: 0.6875rem;
            color: rgba(226, 232, 240, 0.9);
          }
          
          /* Card Actions */
          .cyber-program-actions {
            display: flex;
            padding: 1rem 1.5rem;
            border-top: 1px solid rgba(6, 182, 212, 0.2);
            gap: 0.5rem;
          }
          
          .cyber-program-action {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem;
            background: rgba(15, 23, 42, 0.4);
            border: 1px solid rgba(6, 182, 212, 0.2);
            border-radius: 0.375rem;
            color: rgba(226, 232, 240, 0.7);
            font-size: 0.75rem;
            transition: all 0.3s;
          }
          
          .cyber-program-action:hover {
            background: rgba(15, 23, 42, 0.6);
            border-color: rgba(6, 182, 212, 0.4);
            color: rgba(226, 232, 240, 0.9);
          }
          
          .cyber-action-active {
            background: rgba(6, 182, 212, 0.2);
            border-color: rgba(6, 182, 212, 0.4);
            color: rgb(6, 182, 212);
          }
          
          .cyber-apply-button {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem 1rem;
            background: linear-gradient(90deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 0.375rem;
            color: rgb(16, 185, 129);
            font-size: 0.75rem;
            font-weight: 500;
            margin-left: auto;
            position: relative;
            overflow: hidden;
            transition: all 0.3s;
          }
          
          .cyber-apply-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          
          .cyber-apply-button:not(:disabled):hover {
            background: linear-gradient(90deg, rgba(16, 185, 129, 0.3) 0%, rgba(6, 182, 212, 0.3) 100%);
            border-color: rgba(16, 185, 129, 0.5);
            transform: translateY(-2px);
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
            width: 6px;
            height: 6px;
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
          
          /* Scan line animation */
          .cyber-scan-line {
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 1px;
            background: linear-gradient(
              90deg,
              transparent 0%,
              rgba(6, 182, 212, 0) 0%,
              rgba(6, 182, 212, 0.8) 50%,
              rgba(6, 182, 212, 0) 100%
            );
            animation: scan-line 3s linear infinite;
            opacity: 0;
            transition: opacity 0.3s;
          }
          
          .cyber-program-card:hover .cyber-scan-line {
            opacity: 1;
          }
          
          @keyframes scan-line {
            0% { left: -100%; }
            100% { left: 200%; }
          }
        `}</style>
      </div>
      
      {/* Program Details Modal */}
      {showDetails && (
        <ProgramDetailsModal
          program={program}
          onClose={() => setShowDetails(false)}
          onApply={handleApply}
          isApplying={isApplying}
        />
      )}
    </>
  );
};

export default MentorshipProgram;