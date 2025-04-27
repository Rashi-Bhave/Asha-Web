// Frontend/src/Components/Chat/ChatBubble.jsx
import React, { useState } from 'react';
// import JobCard from '../Jobs/JobCard';
// import EventCard from '../Events/EventCard';
// import MentorshipCard from '../Mentorship/MentorshipCard';
import './ChatStyles.css';

const ChatBubble = ({ message }) => {
  const [showActions, setShowActions] = useState(false);
  
  const isUser = message.sender === 'user';
  
  // Format timestamp
  const formatTime = (timestamp) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(timestamp).toLocaleTimeString([], options);
  };

  const handleClick = () => {
    setShowActions(!showActions);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    toast.success('Message copied to clipboard');
    setShowActions(false);
  };

  // Render attachment based on type
  const renderAttachment = () => {
    if (!message.attachment) return null;

    switch (message.attachment.type) {
    //   case 'job':
    //     return <JobCard job={message.attachment.data} isInChat={true} />;
    //   case 'event':
    //     return <EventCard event={message.attachment.data} isInChat={true} />;
    //   case 'mentorship':
    //     return <MentorshipCard mentorship={message.attachment.data} isInChat={true} />;
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

  // Convert markdown-style code blocks to HTML
  const formatMessageText = (text) => {
    // Replace ```language ... ``` with code blocks
    let formattedText = text.replace(
      /```([a-z]*)\n([\s\S]*?)```/g, 
      (match, language, code) => `<pre class="code-block ${language}"><code>${code}</code></pre>`
    );
    
    // Replace inline code blocks `code` with <code> tags
    formattedText = formattedText.replace(
      /`([^`]+)`/g, 
      (match, code) => `<code class="inline-code">${code}</code>`
    );
    
    // Replace URLs with clickable links
    formattedText = formattedText.replace(
      /(https?:\/\/[^\s]+)/g, 
      (match) => `<a href="${match}" target="_blank" rel="noopener noreferrer" class="message-link">${match}</a>`
    );
    
    // Handle line breaks
    formattedText = formattedText.replace(/\n/g, '<br />');
    
    return formattedText;
  };

  return (
    <div 
      className={`message-container ${isUser ? 'user-message' : 'bot-message'}`}
      onClick={handleClick}
    >
      {!isUser && (
        <div className="avatar">
          <div className="avatar-icon">
            <i className="fas fa-robot"></i>
          </div>
        </div>
      )}
      
      <div className="message-content">
        <div className={`message-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>
          <div 
            className="message-text"
            dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
          />
          
          {renderAttachment()}
        </div>
        
        <div className="message-info">
          <span className="message-time">{formatTime(message.timestamp)}</span>
          
          {showActions && (
            <div className="message-actions">
              <button className="action-button" onClick={handleCopy}>
                <i className="fas fa-copy"></i>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="avatar">
          <div className="avatar-icon">
            <i className="fas fa-user"></i>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBubble;