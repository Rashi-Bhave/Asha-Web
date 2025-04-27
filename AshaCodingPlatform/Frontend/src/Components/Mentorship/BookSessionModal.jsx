import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const BookSessionModal = ({ mentor, onClose, onSubmit, isLoading }) => {
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [sessionTopic, setSessionTopic] = useState('');
  const [errors, setErrors] = useState({});
  
  // Calculate min and max dates for the datepicker
  const today = new Date();
  const minDate = today.toISOString().split('T')[0]; // Today
  
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3); // 3 months from now
  const maxDateString = maxDate.toISOString().split('T')[0];
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!sessionDate) newErrors.date = 'Please select a date';
    if (!sessionTime) newErrors.time = 'Please select a time';
    if (!sessionTopic) newErrors.topic = 'Please enter a topic';
    
    // If there are errors, show them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create a datetime string in ISO format
    const dateTimeString = `${sessionDate}T${sessionTime}:00Z`;
    
    // Pass to parent component
    onSubmit(dateTimeString, sessionTopic);
  };
  
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
          <h3 className="cyber-modal-title">Book a Session with {mentor.name}</h3>
          <button className="cyber-modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="cyber-modal-content">
          <div className="cyber-mentor-brief">
            <div className="cyber-brief-avatar">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=7B3FA9&color=fff&size=100`}
                alt={mentor.name}
                className="cyber-brief-image"
              />
            </div>
            <div className="cyber-brief-info">
              <p className="cyber-brief-title">{mentor.title}</p>
              <div className="cyber-brief-rating">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="cyber-brief-rating-value">{mentor.rating}</span>
              </div>
              {mentor.callInfo && (
                <div className="cyber-brief-callinfo">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{mentor.callInfo}</span>
                </div>
              )}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="cyber-booking-form">
            <div className="cyber-form-section">
              <label className="cyber-form-label">
                <span className="cyber-label-text">Session Date</span>
                <div className="cyber-form-input-wrapper">
                  <input
                    type="date"
                    className={`cyber-form-input ${errors.date ? 'cyber-input-error' : ''}`}
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    min={minDate}
                    max={maxDateString}
                    disabled={isLoading}
                  />
                  {errors.date && <span className="cyber-error-message">{errors.date}</span>}
                </div>
              </label>
            </div>
            
            <div className="cyber-form-section">
              <label className="cyber-form-label">
                <span className="cyber-label-text">Session Time</span>
                <div className="cyber-form-input-wrapper">
                  <input
                    type="time"
                    className={`cyber-form-input ${errors.time ? 'cyber-input-error' : ''}`}
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.time && <span className="cyber-error-message">{errors.time}</span>}
                </div>
              </label>
            </div>
            
            <div className="cyber-form-section">
              <label className="cyber-form-label">
                <span className="cyber-label-text">What would you like to discuss?</span>
                <div className="cyber-form-input-wrapper">
                  <textarea
                    className={`cyber-form-textarea ${errors.topic ? 'cyber-input-error' : ''}`}
                    value={sessionTopic}
                    onChange={(e) => setSessionTopic(e.target.value)}
                    placeholder="Brief description of what you'd like to discuss..."
                    rows={4}
                    disabled={isLoading}
                  ></textarea>
                  {errors.topic && <span className="cyber-error-message">{errors.topic}</span>}
                </div>
              </label>
            </div>
            
            <div className="cyber-form-actions">
              <button 
                type="button" 
                className="cyber-cancel-button"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="cyber-submit-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="cyber-button-spinner"></div>
                    <span>Booking...</span>
                  </>
                ) : (
                  <span>Book Session</span>
                )}
              </button>
            </div>
          </form>
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
            padding: 1rem;
          }
          
          /* Modal */
          .cyber-modal {
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid rgba(6, 182, 212, 0.3);
            border-radius: 0.5rem;
            width: 100%;
            max-width: 32rem;
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
          }
          
          .cyber-modal-title {
            font-size: 1.125rem;
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
            padding: 1.5rem;
          }
          
          /* Mentor Brief */
          .cyber-mentor-brief {
            display: flex;
            gap: 1rem;
            padding-bottom: 1.25rem;
            margin-bottom: 1.25rem;
            border-bottom: 1px solid rgba(6, 182, 212, 0.2);
          }
          
          .cyber-brief-avatar {
            width: 3.5rem;
            height: 3.5rem;
            flex-shrink: 0;
          }
          
          .cyber-brief-image {
            width: 100%;
            height: 100%;
            border-radius: 0.375rem;
            object-fit: cover;
          }
          
          .cyber-brief-info {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }
          
          .cyber-brief-title {
            font-size: 0.875rem;
            color: rgba(226, 232, 240, 0.9);
          }
          
          .cyber-brief-rating {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.75rem;
            color: rgb(245, 158, 11);
          }
          
          .cyber-brief-callinfo {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.75rem;
            color: rgba(226, 232, 240, 0.7);
          }
          
          /* Form */
          .cyber-booking-form {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }
          
          .cyber-form-section {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .cyber-form-label {
            display: flex;
            flex-direction: column;
            gap: 0.375rem;
          }
          
          .cyber-label-text {
            font-size: 0.875rem;
            font-weight: 500;
            color: rgba(226, 232, 240, 0.9);
          }
          
          .cyber-form-input-wrapper {
            position: relative;
          }
          
          .cyber-form-input {
            width: 100%;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(6, 182, 212, 0.3);
            border-radius: 0.375rem;
            padding: 0.625rem 0.75rem;
            color: rgba(226, 232, 240, 0.9);
            font-size: 0.875rem;
            transition: all 0.3s;
          }
          
          .cyber-form-input:focus {
            border-color: rgba(6, 182, 212, 0.6);
            box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.2);
            outline: none;
          }
          
          .cyber-form-textarea {
            width: 100%;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(6, 182, 212, 0.3);
            border-radius: 0.375rem;
            padding: 0.625rem 0.75rem;
            color: rgba(226, 232, 240, 0.9);
            font-size: 0.875rem;
            resize: vertical;
            min-height: 5rem;
            transition: all 0.3s;
          }
          
          .cyber-form-textarea:focus {
            border-color: rgba(6, 182, 212, 0.6);
            box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.2);
            outline: none;
          }
          
          .cyber-input-error {
            border-color: rgb(239, 68, 68);
          }
          
          .cyber-error-message {
            font-size: 0.75rem;
            color: rgb(239, 68, 68);
            margin-top: 0.25rem;
          }
          
          /* Form Actions */
          .cyber-form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            margin-top: 0.5rem;
          }
          
          .cyber-cancel-button {
            padding: 0.625rem 1rem;
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
          
          .cyber-submit-button {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.625rem 1.25rem;
            background: linear-gradient(90deg, rgba(6, 182, 212, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
            border: 1px solid rgba(6, 182, 212, 0.3);
            border-radius: 0.375rem;
            color: rgb(6, 182, 212);
            font-size: 0.875rem;
            font-weight: 500;
            transition: all 0.3s;
          }
          
          .cyber-submit-button:hover:not(:disabled) {
            background: linear-gradient(90deg, rgba(6, 182, 212, 0.3) 0%, rgba(79, 70, 229, 0.3) 100%);
            border-color: rgba(6, 182, 212, 0.5);
            transform: translateY(-1px);
            box-shadow: 0 2px 10px rgba(6, 182, 212, 0.2);
          }
          
          .cyber-submit-button:disabled, .cyber-cancel-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
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

export default BookSessionModal;