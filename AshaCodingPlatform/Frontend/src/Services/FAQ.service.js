// AshaCodingPlatform/Frontend/src/Services/FAQ.service.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';

/**
 * Send a message to the FAQ chat service
 * @param {string} message - The user's message
 * @param {Object} context - Additional context about the conversation
 * @returns {Promise} - The response from the API
 */
export const sendFAQMessage = async (message, context = {}) => {
  try {
    const response = await axios.post(`${API_URL}/faq-chat/send`, {
      message,
      context
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending FAQ message:', error);
    throw error;
  }
};

/**
 * Get chat history for a specific session
 * @param {string} sessionId - The session ID
 * @returns {Promise} - The response from the API
 */
export const getFAQChatHistory = async (sessionId) => {
  try {
    const response = await axios.get(`${API_URL}/faq-chat/history/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching FAQ chat history:', error);
    throw error;
  }
};

/**
 * Submit feedback for a message
 * @param {string} messageId - The message ID
 * @param {number} rating - The rating (1-5)
 * @param {string} feedback - Optional additional feedback
 * @returns {Promise} - The response from the API
 */
export const submitFAQFeedback = async (messageId, rating, feedback = '') => {
  try {
    const response = await axios.post(`${API_URL}/faq-chat/feedback`, {
      messageId,
      rating,
      feedback
    });
    
    return response.data;
  } catch (error) {
    console.error('Error submitting FAQ feedback:', error);
    throw error;
  }
};

/**
 * Create a session ID for the client side if one doesn't exist
 * @returns {string} - A new session ID
 */
export const createClientSessionId = () => {
  return `faq_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Get a stored session ID from localStorage or create a new one
 * @returns {string} - The session ID
 */
export const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem('faq_chat_session_id');
  
  if (!sessionId) {
    sessionId = createClientSessionId();
    localStorage.setItem('faq_chat_session_id', sessionId);
  }
  
  return sessionId;
};