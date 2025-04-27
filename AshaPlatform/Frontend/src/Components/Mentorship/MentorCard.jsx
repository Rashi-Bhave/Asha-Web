import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMentorship } from './MentorshipContextProvider';
import BookSessionModal from './BookSessionModal';

const MentorCard = ({ mentor }) => {
  const [isBooking, setIsBooking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const { 
    saveMentor, 
    removeSavedMentor, 
    isMentorSaved, 
    bookMentorSession 
  } = useMentorship();
  
  // Generate deterministic avatar URL or use the imageUrl from topmate
  const getAvatarUrl = () => {
    if (mentor.imageUrl && !mentor.imageUrl.startsWith('profile_image_')) {
      return mentor.imageUrl;
    }
    
    // Fallback to a generated avatar based on name
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=7B3FA9&color=fff&size=100`;
  };
  
  const avatarUrl = getAvatarUrl();
  
  // Check if mentor is saved
  const mentorIsSaved = isMentorSaved(mentor.id);
  
  // Handle saving/unsaving mentor
  const handleSaveToggle = () => {
    if (mentorIsSaved) {
      removeSavedMentor(mentor.id);
    } else {
      saveMentor(mentor.id);
    }
  };
  
  // Handle sharing mentor profile
  const handleShare = () => {
    // In a real app, this would use the Web Share API or copy to clipboard
    const shareText = `Check out this mentor: ${mentor.name} - ${mentor.title}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${mentor.name} - Mentor Profile`,
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
      toast.success('Profile link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    });
  };
  
  // Handle booking session
  const handleBookSession = async () => {
    try {
      setIsBooking(true);
      setShowModal(true);
    } catch (error) {
      console.error('Error preparing to book mentor session:', error);
      toast.error('Failed to prepare booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };
  
  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  // Handle session booking submission
  const handleSessionSubmit = async (date, topic) => {
    console.log("MENTOR INFO")
    console.log(mentor)
    try {
      setIsBooking(true);
      
      // Call the context function to book a session
      await bookMentorSession(mentor._id, date, topic);
      
      // Close the modal on success
      setShowModal(false);
      toast.success(`Session booked with ${mentor.name}`);
    } catch (error) {
      console.error('Error booking mentor session:', error);
      toast.error('Failed to book session. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  // Render "New" badge if mentor is new
  const renderNewBadge = () => {
    if (mentor.isNew) {
      return (
        <div className="cyber-new-badge">
          <span className="cyber-badge-dot"></span>
          New
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="cyber-mentor-card">
        {/* Card Header */}
        <div className="cyber-mentor-header">
          <div className="cyber-mentor-info">
            <h3 className="cyber-mentor-name">{mentor.name}</h3>
            <p className="cyber-mentor-title">{mentor.title}</p>
          </div>
          
          <div className="cyber-mentor-avatar">
            <img
              src={avatarUrl}
              alt={mentor.name}
              className="cyber-avatar-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://picsum.photos/seed/${mentor.name.length * 5}/100/100`;
              }}
            />
            <div className="cyber-avatar-ring"></div>
          </div>
        </div>
        
        {/* Card Content */}
        <div className="cyber-mentor-content">
          <div className="cyber-mentor-metrics">
            <div className="cyber-metric">
              <div className="cyber-metric-icon rating">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="cyber-metric-data">
                <span className="cyber-metric-value">{mentor.rating}</span>
                <span className="cyber-metric-label">Rating</span>
              </div>
            </div>
            
            <div className="cyber-metric">
              <div className="cyber-metric-icon bookings">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="cyber-metric-data">
                <span className="cyber-metric-value">{mentor.bookings}</span>
                <span className="cyber-metric-label">Sessions</span>
              </div>
            </div>
            
            <div className="cyber-metric">
              <div className="cyber-metric-icon call">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="cyber-metric-data">
                <span className="cyber-metric-value">{mentor.callInfo || "1:1 Call"}</span>
                <span className="cyber-metric-label">Format</span>
              </div>
            </div>
          </div>
          
          {/* Tags Container */}
          {mentor.subcategories && mentor.subcategories.length > 0 && (
            <div className="cyber-tags-container">
              {mentor.subcategories.map((tag, index) => (
                <span key={index} className="cyber-tag">
                  <span className="cyber-tag-dot"></span>
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Priority Badge */}
          {mentor.priorityDM && (
            <div className="cyber-priority-badge">
              <span className="cyber-priority-dot"></span>
              Priority Mentor
            </div>
          )}
          
          {/* New Badge */}
          {renderNewBadge()}
        </div>
        
        {/* Card Actions */}
        <div className="cyber-mentor-actions">
          <button 
            className={`cyber-action-button ${mentorIsSaved ? 'cyber-action-active' : ''}`}
            onClick={handleSaveToggle}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill={mentorIsSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span>{mentorIsSaved ? 'Saved' : 'Save'}</span>
          </button>
          
          <button className="cyber-action-button" onClick={handleShare}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share</span>
          </button>
          
          <button 
            className="cyber-book-button"
            onClick={handleBookSession}
            disabled={isBooking}
          >
            {isBooking ? (
              <>
                <div className="cyber-button-spinner"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Book Session</span>
              </>
            )}
            
            {/* Button Glow Effect */}
            <span className="cyber-button-glow"></span>
            
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
        
        {/* Animated scan line */}
        <div className="cyber-scan-line"></div>
        
        <style jsx>{`
          /* Mentor Card */
          .cyber-mentor-card {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(6, 182, 212, 0.2);
            border-radius: 0.5rem;
            padding: 1.5rem;
            position: relative;
            overflow: hidden;
            transition: all 0.3s;
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          
          .cyber-mentor-card:hover {
            border-color: rgba(6, 182, 212, 0.5);
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.2);
            transform: translateY(-4px);
          }
          
          /* Card Header */
          .cyber-mentor-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1.25rem;
          }
          
          .cyber-mentor-info {
            flex: 1;
          }
          
          .cyber-mentor-name {
            font-size: 1.125rem;
            font-weight: 600;
            color: white;
            margin-bottom: 0.25rem;
          }
          
          .cyber-mentor-title {
            font-size: 0.875rem;
            color: rgba(226, 232, 240, 0.7);
            line-height: 1.4;
          }
          
          .cyber-mentor-avatar {
            position: relative;
            width: 3.5rem;
            height: 3.5rem;
            margin-left: 1rem;
            flex-shrink: 0;
          }
          
          .cyber-avatar-image {
            width: 100%;
            height: 100%;
            border-radius: 0.5rem;
            object-fit: cover;
            position: relative;
            z-index: 2;
          }
          
          .cyber-avatar-ring {
            position: absolute;
            inset: -0.25rem;
            border: 2px dashed rgba(6, 182, 212, 0.5);
            border-radius: 0.75rem;
            animation: rotate 20s linear infinite;
            z-index: 1;
          }
          
          @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* Card Content */
          .cyber-mentor-content {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          
          .cyber-mentor-metrics {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
          }
          
          .cyber-metric {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .cyber-metric-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 1.75rem;
            height: 1.75rem;
            border-radius: 0.375rem;
            flex-shrink: 0;
          }
          
          .cyber-metric-icon.rating {
            background: rgba(245, 158, 11, 0.2);
            color: rgb(245, 158, 11);
          }
          
          .cyber-metric-icon.bookings {
            background: rgba(6, 182, 212, 0.2);
            color: rgb(6, 182, 212);
          }
          
          .cyber-metric-icon.call {
            background: rgba(16, 185, 129, 0.2);
            color: rgb(16, 185, 129);
          }
          
          .cyber-metric-data {
            display: flex;
            flex-direction: column;
          }
          
          .cyber-metric-value {
            font-size: 0.875rem;
            font-weight: 500;
            color: rgba(226, 232, 240, 0.9);
          }
          
          .cyber-metric-label {
            font-size: 0.6875rem;
            color: rgba(226, 232, 240, 0.6);
          }
          
          /* Tags */
          .cyber-tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
          }
          
          .cyber-tag {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem 0.5rem;
            background: rgba(79, 70, 229, 0.1);
            border: 1px solid rgba(79, 70, 229, 0.3);
            border-radius: 0.375rem;
            font-size: 0.75rem;
            color: rgba(226, 232, 240, 0.9);
          }
          
          .cyber-tag-dot {
            width: 0.375rem;
            height: 0.375rem;
            background: rgb(79, 70, 229);
            border-radius: 50%;
          }
          
          /* Priority Badge */
          .cyber-priority-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            padding: 0.25rem 0.5rem;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 0.375rem;
            font-size: 0.75rem;
            color: rgb(16, 185, 129);
            font-weight: 500;
            width: fit-content;
            margin-top: auto;
          }
          
          .cyber-priority-dot {
            width: 0.375rem;
            height: 0.375rem;
            background: rgb(16, 185, 129);
            border-radius: 50%;
            box-shadow: 0 0 5px rgba(16, 185, 129, 0.5);
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
          }
          
          /* Card Actions */
          .cyber-mentor-actions {
            display: flex;
            margin-top: 1.5rem;
            border-top: 1px solid rgba(6, 182, 212, 0.2);
            padding-top: 1rem;
            gap: 0.5rem;
          }
          
          .cyber-action-button {
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
          
          .cyber-action-button:hover {
            background: rgba(15, 23, 42, 0.6);
            border-color: rgba(6, 182, 212, 0.4);
            color: rgba(226, 232, 240, 0.9);
          }
          
          .cyber-action-active {
            background: rgba(6, 182, 212, 0.2);
            border-color: rgba(6, 182, 212, 0.4);
            color: rgb(6, 182, 212);
          }
          
          .cyber-book-button {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem 1rem;
            background: linear-gradient(90deg, rgba(6, 182, 212, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
            border: 1px solid rgba(6, 182, 212, 0.3);
            border-radius: 0.375rem;
            color: rgb(6, 182, 212);
            font-size: 0.75rem;
            font-weight: 500;
            margin-left: auto;
            position: relative;
            overflow: hidden;
            transition: all 0.3s;
          }
          
          .cyber-book-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          
          .cyber-book-button:not(:disabled):hover {
            background: linear-gradient(90deg, rgba(6, 182, 212, 0.3) 0%, rgba(79, 70, 229, 0.3) 100%);
            border-color: rgba(6, 182, 212, 0.5);
            transform: translateY(-2px);
          }
          
          .cyber-button-glow {
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(
              circle at center,
              rgba(6, 182, 212, 0.4) 0%,
              transparent 70%
            );
            opacity: 0;
            transition: opacity 0.3s;
          }
          
          .cyber-book-button:not(:disabled):hover .cyber-button-glow {
            opacity: 1;
            animation: glow-rotate 2s infinite;
          }
          
          @keyframes glow-rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* Button Spinner */
          .cyber-button-spinner {
            width: 1rem;
            height: 1rem;
            border: 2px solid rgba(6, 182, 212, 0.3);
            border-top-color: rgb(6, 182, 212);
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
          
          .cyber-mentor-card:hover .cyber-scan-line {
            opacity: 1;
          }
          
          @keyframes scan-line {
            0% { left: -100%; }
            100% { left: 200%; }
          }
        `}</style>
      </div>
      
      {/* Booking Session Modal */}
      {showModal && (
        <BookSessionModal
          mentor={mentor}
          onClose={handleCloseModal}
          onSubmit={handleSessionSubmit}
          isLoading={isBooking}
        />
      )}
    </>
  );
};

export default MentorCard;