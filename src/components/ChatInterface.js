// components/ChatInterface.js
import React, { useState, useEffect, useRef } from 'react';
import { processUserMessage } from '../services/chatService';
import { generateId } from '../utils/conversationUtils';
import ChatBubble from './ChatBubble';
import MessageInput from './MessageInput';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [inputText, setInputText] = useState('');

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle sending a message
  const handleSend = async () => {
    if (inputText.trim() === '') return;
    
    // Add user message to chat
    const userMessage = {
      id: generateId(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText(''); // Clear input
    setTyping(true); // Show typing indicator
    
    try {
      // Process the message using our intent classification service
      const response = await processUserMessage(userMessage.text);
      
      // Add bot response to chat
      const botMessage = {
        id: generateId(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        attachment: response.attachment
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Add error message
      const errorMessage = {
        id: generateId(),
        text: 'I apologize, but I encountered an issue processing your request. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setTyping(false); // Hide typing indicator
    }
  };

  // Render typing indicator
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

  // Render empty chat state
  const renderEmptyChat = () => {
    return (
      <div className="empty-chat">
        <h2 className="empty-title">Welcome to Asha AI!</h2>
        <p className="empty-text">
          I'm here to help with your career questions. You can ask me about:
        </p>
        <div className="suggestion-container">
          <button 
            className="suggestion-button"
            onClick={() => setInputText("How can I advance in my software engineering career?")}
          >
            Career growth advice
          </button>
          <button 
            className="suggestion-button"
            onClick={() => setInputText("What jobs are available at Google for product managers?")}
          >
            Job listings
          </button>
          <button 
            className="suggestion-button"
            onClick={() => setInputText("Are there any tech conferences happening next month?")}
          >
            Upcoming events
          </button>
          <button 
            className="suggestion-button"
            onClick={() => setInputText("I'd like to practice for a frontend developer interview")}
          >
            Mock interviews
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
        <div className="messages-container">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          {renderTypingIndicator()}
          <div ref={messagesEndRef} />
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