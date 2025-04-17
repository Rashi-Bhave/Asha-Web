// components/ChatBubble.js
import React, { useState } from 'react';

// Import card components that were missing
import JobCard from './JobCard';
import EventCard from './EventCard';
import MentorshipCard from './MentorshipCard';

const ChatBubble = ({ message }) => {
  const [showActions, setShowActions] = useState(false);
  
  const isUser = message.sender === 'user';
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleClick = () => {
    setShowActions(!showActions);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setShowActions(false);
  };

  const renderAttachment = () => {
    if (!message.attachment) return null;

    switch (message.attachment.type) {
      case 'job':
        return <JobCard job={message.attachment.data} />;
      case 'event':
        return <EventCard event={message.attachment.data} />;
      case 'mentorship':
        return <MentorshipCard mentorship={message.attachment.data} />;
      case 'image':
        return (
          <img
            src={message.attachment.data.url}
            alt="Attachment"
            className="attachment-image"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`message-bubble-container ${isUser ? 'user-container' : 'bot-container'}`}>
      <div 
        className={`message-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}
        onClick={handleClick}
      >
        {!isUser && message.thinking && (
          <div className="thinking-text">
            Thinking about this...
          </div>
        )}
        
        <div className="message-text">
          {message.text}
        </div>
        
        {renderAttachment()}
        
        <div className={`timestamp ${isUser ? 'user-timestamp' : 'bot-timestamp'}`}>
          {timestamp}
        </div>
      </div>
      
      {showActions && (
        <div className={`message-actions ${isUser ? 'user-actions' : 'bot-actions'}`}>
          <button className="action-button" onClick={handleCopy}>
            <i className="fas fa-copy"></i>
            <span>Copy</span>
          </button>
          
          {!isUser && (
            <button className="action-button" onClick={() => setShowActions(false)}>
              <i className="fas fa-flag"></i>
              <span>Report</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBubble;