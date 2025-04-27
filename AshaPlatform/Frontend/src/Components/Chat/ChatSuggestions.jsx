// Frontend/src/Components/Chat/ChatSuggestions.jsx
import React from 'react';
import './ChatStyles.css';

const ChatSuggestions = ({ onSuggestionClick }) => {
  const suggestions = [
    {
      id: 'career-growth',
      text: 'How can I advance in my software engineering career?',
      icon: 'fa-chart-line'
    },
    {
      id: 'job-search',
      text: 'Find me SDE jobs in Bangalore',
      icon: 'fa-search'
    },
    {
      id: 'interview-prep',
      text: 'I need to prepare for a product manager interview',
      icon: 'fa-user-tie'
    },
    {
      id: 'coding-challenge',
      text: 'Help me practice array coding problems',
      icon: 'fa-code'
    },
    {
      id: 'events',
      text: 'Are there any tech conferences happening next month?',
      icon: 'fa-calendar-alt'
    },
    {
      id: 'mentorship',
      text: 'Im looking for a mentor in AI/ML field',
      icon: 'fa-users'
    }
  ];

  return (
    <div className="suggestions-container">
      <h3 className="suggestions-title">Try asking about:</h3>
      <div className="suggestions-grid">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            className="suggestion-item"
            onClick={() => onSuggestionClick(suggestion.text)}
          >
            <div className="suggestion-icon">
              <i className={`fas ${suggestion.icon}`}></i>
            </div>
            <span className="suggestion-text">{suggestion.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatSuggestions;