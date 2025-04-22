// services/chatService.js
import { classifyIntent, generateProfessionalResponse } from './intentClassifierService';
import { generateId } from '../utils/conversationUtils';

/**
 * Process a user message and generate an appropriate response
 * 
 * @param {string} message - User's message
 * @param {Array} conversation - Previous conversation history
 * @returns {Object} - Response object with text and optional attachment
 */
export const processUserMessage = async (message, conversation = []) => {
  try {
    // Step 1: Classify the intent using Groq
    const intent = await classifyIntent(message);
    console.log(`Intent classified as: ${intent}`);
    
    // Step 2: Handle response based on the detected intent
    const response = await handleIntentResponse(message, intent);
    
    return response;
  } catch (error) {
    console.error('Error processing message:', error);
    return {
      text: 'I apologize, but I encountered an issue processing your request. Please try again or rephrase your question.',
      attachment: null,
    };
  }
};

/**
 * Generate response based on detected intent
 * 
 * @param {string} message - User's message
 * @param {string} intent - Detected intent
 * @returns {Promise<Object>} - Response object with text and attachment
 */
const handleIntentResponse = async (message, intent) => {
  // Map intent to appropriate response handler
  switch (intent) {
    case 'Career_Trajectory_Switch':
      return {
        text: 'Intent Detected: Career Trajectory/Switch',
        attachment: null
      };
      
    case 'Job_Listing':
      return {
        text: 'Intent Detected: Job Listing',
        attachment: null
      };
      
    case 'Events_Listings':
      return {
        text: 'Intent Detected: Events Listings',
        attachment: null
      };
      
    case 'Mock_Interview':
      return {
        text: 'Intent Detected: Mock Interview',
        attachment: null
      };
      
    case 'Coding_Platform':
      return {
        text: 'Intent Detected: Coding Platform',
        attachment: null
      };
      
    case 'Other_Professional':
      // For professional questions, generate a custom response using LLM
      const professionalResponse = await generateProfessionalResponse(message);
      return {
        text: professionalResponse,
        attachment: null
      };
      
    case 'Other_Generic':
    default:
      // Default response for non-career questions
      return {
        text: "I'm sorry, but I can only assist with career-related questions. Please feel free to ask me about job opportunities, career development, professional growth, or other career-related topics.",
        attachment: null
      };
  }
};

/**
 * Example usage in a React component:
 * 
 * import { processUserMessage } from '../services/chatService';
 * 
 * // In your component:
 * const handleSendMessage = async (userMessage) => {
 *   // Add user message to chat
 *   setMessages(prev => [...prev, { 
 *     id: generateId(), 
 *     text: userMessage, 
 *     sender: 'user', 
 *     timestamp: new Date().toISOString() 
 *   }]);
 *   
 *   // Set loading/typing indicator
 *   setTyping(true);
 *   
 *   try {
 *     // Process message and get response
 *     const response = await processUserMessage(userMessage, conversation);
 *     
 *     // Add bot response to chat
 *     setMessages(prev => [...prev, {
 *       id: generateId(),
 *       text: response.text,
 *       sender: 'bot',
 *       timestamp: new Date().toISOString(),
 *       attachment: response.attachment
 *     }]);
 *   } catch (error) {
 *     console.error('Error handling message:', error);
 *     // Add error response
 *   } finally {
 *     setTyping(false);
 *   }
 * };
 */