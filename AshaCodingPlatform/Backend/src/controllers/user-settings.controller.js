// Backend/src/controllers/chat.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { ChatMessage } from '../models/chat-message.model.js';
import axios from 'axios';

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

/**
 * @route   POST /api/v1/chat/send
 * @desc    Process a user message and generate a response
 * @access  Private
 */
export const processMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const userId = req.user._id; // Assuming authenticated user

  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid message"
    });
  }

  try {
    // Save user message to database
    const userMessage = new ChatMessage({
      userId,
      text: message,
      sender: 'user',
      timestamp: new Date()
    });
    
    await userMessage.save();

    // Classify the intent first
    const intent = await classifyIntent(message);

    // Process the message based on intent
    const botResponse = await generateResponse(message, intent, userId);

    // Save bot response to database
    const botMessage = new ChatMessage({
      userId,
      text: botResponse.text,
      sender: 'bot',
      timestamp: new Date(),
      attachment: botResponse.attachment,
      intentCategory: intent
    });
    
    await botMessage.save();

    return res.status(200).json({
      success: true,
      userMessage: userMessage.toFrontend(),
      botMessage: botMessage.toFrontend()
    });
  } catch (error) {
    console.error("Error processing message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process message",
      error: error.message
    });
  }
});

/**
 * @route   GET /api/v1/chat/history
 * @desc    Get user's chat history
 * @access  Private
 */
export const getChatHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const limit = parseInt(req.query.limit) || 50;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  try {
    const messages = await ChatMessage.find({ userId })
      .sort({ timestamp: 1 })
      .skip(skip)
      .limit(limit);

    const totalMessages = await ChatMessage.countDocuments({ userId });

    return res.status(200).json({
      success: true,
      messages: messages.map(msg => msg.toFrontend()),
      pagination: {
        total: totalMessages,
        page,
        limit,
        pages: Math.ceil(totalMessages / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/v1/chat/clear
 * @desc    Clear user's chat history
 * @access  Private
 */
export const clearChatHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    await ChatMessage.deleteMany({ userId });

    return res.status(200).json({
      success: true,
      message: "Chat history cleared successfully"
    });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear chat history",
      error: error.message
    });
  }
});

/**
 * Classify intent of user message using Groq LLM
 * 
 * @param {string} message - User's message
 * @returns {Promise<string>} - Intent classification
 */
const classifyIntent = async (message) => {
  try {
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
        "content": message
      }
    ];

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages,
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

    const intentResponse = response.data.choices[0].message.content.trim();
    return intentResponse;
  } catch (error) {
    console.error("Intent classification error:", error);
    return "Other_Generic"; // Default fallback
  }
};

/**
 * Generate response based on user message and intent
 * 
 * @param {string} message - User's message
 * @param {string} intent - Intent classification
 * @param {string} userId - User ID for contextualization
 * @returns {Promise<Object>} - Generated response with possible attachment
 */
const generateResponse = async (message, intent, userId) => {
  // Default response if something goes wrong
  let defaultResponse = {
    text: "I apologize, but I'm having trouble processing your request right now. Please try again or ask something different.",
    attachment: null
  };

  try {
    // Process response differently based on intent
    switch (intent) {
      case 'Job_Listing':
        return await handleJobListingIntent(message, userId);
      
      case 'Events_Listings':
        return await handleEventsIntent(message, userId);
      
      case 'Mentorship':
        return await handleMentorshipIntent(message, userId);
      
      case 'Mock_Interview':
        return await handleMockInterviewIntent(message, userId);
      
      case 'Coding_Platform':
        return await handleCodingPlatformIntent(message, userId);
      
      default:
        // For other intents, use the general professional response
        return await generateProfessionalResponse(message);
    }
  } catch (error) {
    console.error("Error generating response:", error);
    return defaultResponse;
  }
};

/**
 * Generate general professional response using Groq LLM
 * 
 * @param {string} message - User's message
 * @returns {Promise<Object>} - Generated response
 */
const generateProfessionalResponse = async (message) => {
  try {
    const messages = [
      {
        "role": "system",
        "content": `You are Asha AI, a helpful career assistant that provides professional advice.
        Answer questions related to professional growth, workplace issues, leadership, 
        motivation, and other career-related topics. Be concise, practical and supportive.
        Limit your response to 2-3 paragraphs.`
      },
      {
        "role": "user",
        "content": message
      }
    ];

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages,
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

    return {
      text: response.data.choices[0].message.content.trim(),
      attachment: null
    };
  } catch (error) {
    console.error("Professional response generation error:", error);
    return {
      text: "I apologize, but I encountered an issue while processing your request. Please try asking your question again.",
      attachment: null
    };
  }
};

// Intent handlers for job listings, events, and more (to be implemented)
const handleJobListingIntent = async (message, userId) => {
  // This would implement job search logic based on message content
  // For now, return a placeholder response
  return {
    text: "I understand you're looking for job listings. I'm searching for relevant positions based on your query. You can also visit our Jobs page for more options.",
    attachment: null
  };
};

const handleEventsIntent = async (message, userId) => {
  // This would implement events search logic based on message content
  return {
    text: "I see you're interested in events. I'm looking for relevant workshops and meetups based on your query. You can also check our Events page for all upcoming opportunities.",
    attachment: null
  };
};

const handleMentorshipIntent = async (message, userId) => {
  // This would implement mentorship search logic based on message content
  return {
    text: "I understand you're looking for mentorship opportunities. We have several programs that might interest you. Check out our Mentorship page for more details.",
    attachment: null
  };
};

const handleMockInterviewIntent = async (message, userId) => {
  return {
    text: "It sounds like you're interested in practicing for an interview. Our Interview Simulator can help you prepare with realistic questions and feedback. Would you like me to direct you there?",
    attachment: null
  };
};

const handleCodingPlatformIntent = async (message, userId) => {
  return {
    text: "I see you're looking for coding practice. Our platform offers a variety of coding challenges and problem sets to help you improve your skills. Would you like me to show you some recommendations?",
    attachment: null
  };
};