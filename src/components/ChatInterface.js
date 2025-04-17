// components/ChatInterface.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import { ChatContext } from '../context/ChatContext';
import ChatBubble from './ChatBubble';
import MessageInput from './MessageInput';

const ChatInterface = () => {
  const { messages, sendMessage, typing, clearChat } = useContext(ChatContext);
  const [inputText, setInputText] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (inputText.trim() === '') return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight > 200) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  };

  const renderTypingIndicator = () => {
    if (!typing) return null;
    
    return (
      <div className="message-bubble-container bot-container">
        <div className="message-bubble bot-bubble">
          <div className="thinking-text">Asha is typing...</div>
        </div>
      </div>
    );
  };

  const renderEmptyChat = () => {
    return (
      <div className="empty-chat">
        <h2 className="empty-title">Welcome to Asha AI!</h2>
        <p className="empty-text">
          I'm here to help you explore job listings, community events, 
          mentorship programs, and more. How can I assist you today?
        </p>
        <div className="suggestion-container">
          <button 
            className="suggestion-button"
            onClick={() => sendMessage("Show me recent job listings")}
          >
            Show job listings
          </button>
          <button 
            className="suggestion-button"
            onClick={() => sendMessage("What events are happening soon?")}
          >
            Upcoming events
          </button>
          <button 
            className="suggestion-button"
            onClick={() => sendMessage("Tell me about mentorship programs")}
          >
            Mentorship programs
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-container">
      {messages.length === 0 ? (
        renderEmptyChat()
      ) : (
        <div 
          className="messages-container" 
          onScroll={handleScroll}
        >
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          {renderTypingIndicator()}
          <div ref={messagesEndRef} />
          
          {showScrollButton && (
            <button
              className="scroll-button"
              onClick={scrollToBottom}
              aria-label="Scroll to bottom"
            >
              <i className="fas fa-chevron-down"></i>
            </button>
          )}
        </div>
      )}
      
      <div className="input-container">
        <MessageInput
          value={inputText}
          onChange={setInputText}
          onSend={handleSend}
          disabled={typing}
        />
      </div>
    </div>
  );
};

export default ChatInterface;