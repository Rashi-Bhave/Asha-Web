// Placeholder content for ChatContext.js
import React, { createContext, useState, useEffect } from 'react';

// Services
import { processUserMessage } from '../services/chatService';
import { detectBias } from '../services/biasDetectionService';
import { saveChat, loadChat } from '../services/storageService';

// Utils
import { generateId } from '../utils/conversationUtils';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [conversation, setConversation] = useState([]);
  
  // Load previous chat on initial render
  useEffect(() => {
    const loadPreviousChat = async () => {
      try {
        const savedMessages = await loadChat();
        if (savedMessages && savedMessages.length > 0) {
          setMessages(savedMessages);
          
          // Reconstruct conversation context
          const conversationHistory = savedMessages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }));
          setConversation(conversationHistory);
        }
      } catch (error) {
        console.error('Error loading chat:', error);
      }
    };
    
    loadPreviousChat();
  }, []);
  
  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveChat(messages);
    }
  }, [messages]);
  
  const addMessage = (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
    
    // Update conversation context
    setConversation(prevConversation => [
      ...prevConversation, 
      {
        role: message.sender === 'user' ? 'user' : 'assistant',
        content: message.text
      }
    ]);
  };
  
  const sendMessage = async (text) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMessage = {
      id: generateId(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    addMessage(userMessage);
    
    // Start typing indicator
    setTyping(true);
    
    try {
      // Check for gender bias
      const { hasBias, correctedText } = await detectBias(text);
      
      if (hasBias) {
        // Add bias warning message
        addMessage({
          id: generateId(),
          text: `I noticed potential gender bias in your query. To ensure an inclusive experience, I've adjusted how I'll respond. My goal is to provide balanced information about career opportunities for all individuals.`,
          sender: 'bot',
          timestamp: new Date().toISOString(),
          thinking: true,
        });
      }
      
      // Process the message
      const response = await processUserMessage(
        hasBias ? correctedText : text,
        conversation
      );
      
      // Add bot response
      addMessage({
        id: generateId(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        attachment: response.attachment,
      });
      
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Add error message
      addMessage({
        id: generateId(),
        text: 'I apologize, but I encountered an issue processing your request. Please try again or rephrase your question.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
      });
      
    } finally {
      setTyping(false);
    }
  };
  
  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the entire conversation?')) {
      setMessages([]);
      setConversation([]);
      saveChat([]);
    }
  };
  
  return (
    <ChatContext.Provider
      value={{
        messages,
        typing,
        sendMessage,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};