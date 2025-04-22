// services/intentClassifierService.js
import axios from 'axios';

// Groq API configuration (ideally should be in environment variables)
const GROQ_API_KEY = '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'; // Replace with your actual Groq API key

/**
 * Classifies user message intent using Groq LLM
 * 
 * @param {string} userMessage - User's message to classify
 * @returns {Promise<string>} - Classified intent category
 */
export const classifyIntent = async (userMessage) => {
  try {
    console.log('Classifying intent for:', userMessage);
    
    // Prepare the messages for the LLM
    const messages = [
      {
        "role": "system",
        "content": `You are an intent classifier for a career assistant chatbot. 
        Analyze the user's message and classify it into EXACTLY ONE of these categories:
        
        1. Career_Trajectory_Switch - User is asking how they can grow in their career or how they can switch to a new career pathway
        2. Job_Listing - User is asking about active jobs/possible jobs at a company
        3. Events_Listings - User is asking about any event, workshop, hackathon, meetups, etc.
        4. Mock_Interview - User wants to be redirected to a mock interview screen for a particular role
        5. Coding_Platform - User is asking for coding questions (e.g., arrays)
        6. Other_Professional - Professional questions like motivational quotes, office management, etc.
        7. Other_Generic - Non-career questions like how to cook, etc.
        
        Return ONLY the intent category name with no additional text or explanations.`
      },
      {
        "role": "user",
        "content": userMessage
      }
    ];

    // Make the API request to Groq
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.2,
        max_tokens: 20
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract and clean the intent from the response
    const intentResponse = response.data.choices[0].message.content.trim();
    console.log('Classified intent:', intentResponse);
    
    return intentResponse;
  } catch (error) {
    console.error('Error classifying intent:', error);
    // Default to Other_Generic if classification fails
    return 'Other_Generic';
  }
};

/**
 * Generate response for professional questions using Groq LLM
 * 
 * @param {string} userMessage - User's message
 * @returns {Promise<string>} - Generated response
 */
export const generateProfessionalResponse = async (userMessage) => {
  try {
    // Prepare messages for the LLM
    const messages = [
      {
        "role": "system",
        "content": `You are a helpful career assistant that provides professional advice.
        Answer questions related to professional growth, workplace issues, leadership, 
        motivation, and other career-related topics. Be concise, practical and supportive.
        Limit your response to 2-3 paragraphs.`
      },
      {
        "role": "user",
        "content": userMessage
      }
    ];

    // Make the API request to Groq
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating professional response:', error);
    return 'I apologize, but I encountered an issue while processing your request. Please try asking your question again.';
  }
};