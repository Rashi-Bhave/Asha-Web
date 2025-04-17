// Placeholder content for MessageInput.js
import React, { useState, useRef, useEffect } from 'react';

const MessageInput = ({ value, onChange, onSend, disabled }) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    onChange(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  useEffect(() => {
    if (textareaRef.current) {
      adjustTextareaHeight();
    }
  }, [value]);

  return (
    <div className={`input-wrapper ${isFocused ? 'focused' : ''}`}>
      <textarea
        ref={textareaRef}
        className="message-input"
        placeholder="Message Asha AI..."
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        rows={1}
      />
      <button
        className="send-button"
        onClick={onSend}
        disabled={!value.trim() || disabled}
        aria-label="Send message"
      >
        <i className="fas fa-paper-plane"></i>
      </button>
    </div>
  );
};