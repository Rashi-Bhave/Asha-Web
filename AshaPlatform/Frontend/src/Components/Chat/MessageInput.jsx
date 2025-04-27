// Frontend/src/Components/Chat/MessageInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import './ChatStyles.css';

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  // Adjust textarea height on content change
  useEffect(() => {
    if (textareaRef.current) {
      adjustTextareaHeight();
    }
  }, [message]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set the height to match content (max 150px)
    const newHeight = Math.min(textarea.scrollHeight, 150);
    textarea.style.height = `${newHeight}px`;
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e) => {
    // Send message on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      
      // Focus back on textarea after sending
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  return (
    <div className="message-input-container">
      <div className={`input-wrapper ${isFocused ? 'focused' : ''} ${disabled ? 'disabled' : ''}`}>
        <textarea
          ref={textareaRef}
          className="message-textarea"
          placeholder="Ask Asha something..."
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          rows={1}
        />
        
        <button
          className="send-button"
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          aria-label="Send message"
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
      
      {/* Keyboard shortcuts info */}
      <div className="keyboard-shortcuts">
        <span>Press <kbd>Enter</kbd> to send, <kbd>Shift</kbd> + <kbd>Enter</kbd> for a new line</span>
      </div>
    </div>
  );
};

export default MessageInput;