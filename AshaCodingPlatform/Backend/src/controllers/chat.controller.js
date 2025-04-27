// Backend/src/controllers/chat.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { ChatMessage } from '../models/chat-message.model.js';
import axios from 'axios';

import {
  handleCareerTrajectoryIntent,
  handleJobListingIntent,
  handleMockInterviewIntent,
  handleCodingPlatformIntent
} from '../utils/intent-handlers.js';

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/v1/chat/completions';
const GROQ_MODEL = 'llama3-70b-8192';

// Initialize Groq client with proper configuration
const groqClient = axios.create({
  baseURL: 'https://api.groq.com/openai/v1', // Updated to correct endpoint
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
  },
  timeout: 30000 // Add timeout to prevent hanging requests
});

/**
 * @route   POST /api/v1/chat/send
 * @desc    Process a user message and generate a response
 * @access  Private
 */
export const processMessage = asyncHandler(async (req, res) => {
  console.log('PROCESS DEBUG - New message received');
  const { message, mode, persona, context } = req.body;
  
  console.log('PROCESS DEBUG - Context received:', JSON.stringify(context));
  
  const userId = req.user ? req.user._id : null;  // Make userId optional for signup flow
  console.log('PROCESS DEBUG - User ID:', userId ? 'Authenticated' : 'Not authenticated');

  // Initialize analytics context
  const analyticsContext = {
    sessionId: req.headers['x-session-id'] || Date.now().toString(),
    userAgent: req.headers['user-agent'],
    referrer: req.headers['referer'] || null,
    interactionCount: context?.analyticsData?.interactionCount || 0,
    startTime: context?.analyticsData?.startTime || Date.now()
  };

  // Check for direct LLM calls from internal components
  if (context && context.internalRequest === true && context.needsDirectLLMResponse === true) {
    try {
      console.log('PROCESS DEBUG - Processing internal LLM request');
      // Parse the message assuming it contains the messages array for the LLM
      const llmMessages = JSON.parse(message);
      
      // Make direct call to Groq API
      const response = await groqClient.post('/chat/completions', {
        messages: llmMessages,
        model: GROQ_MODEL,
        temperature: context.temperature || 0.3,
        max_tokens: context.maxTokens || 500
      });
      
      // Return the raw LLM response
      return res.status(200).json({
        success: true,
        botMessage: {
          text: response.data.choices[0].message.content.trim()
        }
      });
    } catch (error) {
      console.error("Error in direct LLM call:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to process LLM request",
        error: error.message
      });
    }
  }

  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid message"
    });
  }

  try {
    // Save user message to database only if user is authenticated
    let userMessage;
    if (userId) {
      userMessage = new ChatMessage({
        userId,
        text: message,
        sender: 'user',
        timestamp: new Date()
      });
      
      await userMessage.save();
      console.log('PROCESS DEBUG - Saved authenticated user message to DB');
    } else {
      // Create temporary message object for non-authenticated users
      userMessage = {
        id: Date.now().toString(),
        text: message,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      console.log('PROCESS DEBUG - Created temporary message for non-authenticated user');
    }

    // Perform bias detection
    const biasAnalysis = await detectGenderBias(message);
    
    // Update user message with bias detection results
    if (userId) {
      userMessage.biasDetected = biasAnalysis.biasDetected;
      userMessage.biasScore = biasAnalysis.biasScore;
      userMessage.biasCategory = biasAnalysis.biasCategory;
      await userMessage.save();
    } else {
      // For non-authenticated users, add the properties to the temporary message object
      userMessage.biasDetected = biasAnalysis.biasDetected;
      userMessage.biasScore = biasAnalysis.biasScore;
      userMessage.biasCategory = biasAnalysis.biasCategory;
    }

    console.log('BIAS DEBUG - Analysis result:', JSON.stringify(biasAnalysis));

    // Special handling for biased messages that need redirection
    if (biasAnalysis.biasDetected && biasAnalysis.needsRedirection) {
      console.log('BIAS DEBUG - Generating bias redirection response');
      const redirectionResponse = await generateBiasRedirectionResponse(biasAnalysis, message);
      
      // Save bot response with bias redirection metadata
      let botMessage;
      if (userId) {
        botMessage = new ChatMessage({
          userId,
          text: redirectionResponse.text,
          sender: 'bot',
          timestamp: new Date(),
          intentCategory: 'Bias_Redirection',
          biasRedirected: true,
          biasCategory: biasAnalysis.biasCategory,
          biasScore: biasAnalysis.biasScore,
          sentiment: 'neutral'
        });
        
        await botMessage.save();
      } else {
        botMessage = {
          id: (Date.now() + 1).toString(),
          text: redirectionResponse.text,
          sender: 'bot',
          timestamp: new Date().toISOString(),
          intentCategory: 'Bias_Redirection',
          biasRedirected: true,
          biasCategory: biasAnalysis.biasCategory,
          biasScore: biasAnalysis.biasScore,
          sentiment: 'neutral'
        };
      }
      
      // Track analytics for bias redirection
      await trackAnalytics({
        userId: userId,
        messageId: userMessage._id || userMessage.id,
        event: 'bias_redirected',
        biasDetected: biasAnalysis.biasDetected,
        biasScore: biasAnalysis.biasScore,
        biasCategory: biasAnalysis.biasCategory,
        biasRedirected: true,
        engagementMetrics: {
          responseTime: Date.now() - analyticsContext.startTime,
          interactionCount: analyticsContext.interactionCount + 1,
          messageLength: message.length,
          responseLength: redirectionResponse.text.length
        }
      });
      
      return res.status(200).json({
        success: true,
        userMessage: userMessage,
        botMessage: botMessage,
        biasDetected: true,
        biasRedirected: true,
        analyticsData: {
          interactionCount: analyticsContext.interactionCount + 1,
          startTime: analyticsContext.startTime,
          sessionId: analyticsContext.sessionId
        }
      });
    }

    // Fetch recent conversation history or use from context
    let recentMessages = [];
    if (userId) {
      recentMessages = await ChatMessage.find({ userId })
        .sort({ timestamp: -1 })
        .limit(6)
        .sort({ timestamp: 1 });
      
      recentMessages = recentMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      console.log('PROCESS DEBUG - Fetched conversation history from DB');
    } else if (context && context.recentMessages) {
      // For non-authenticated users, use the context.recentMessages
      recentMessages = context.recentMessages;
      console.log('PROCESS DEBUG - Using conversation history from context');
    }
    
    // Add current message to recentMessages
    recentMessages.push({
      role: 'user',
      content: message
    });

    // Analyze message sentiment
    let sentiment = "neutral";
    if (userId) {
      sentiment = await analyzeSentiment(message);
      userMessage.sentiment = sentiment;
      await userMessage.save();
      console.log('PROCESS DEBUG - Analyzed sentiment:', sentiment);
    }

    // Extract conversation topics
    const topics = await extractConversationTopics(recentMessages);
    console.log('PROCESS DEBUG - Extracted topics:', topics);

    // Generate insights if needed
    let insights = null;
    if (context && context.needsInsights) {
      insights = await generateConversationInsights(recentMessages);
      console.log('PROCESS DEBUG - Generated insights');
    }

    // Extract signup state and data with proper fallbacks
    const signupState = context && typeof context.signupState === 'string' 
      ? context.signupState 
      : 'initial';
      
    const signupData = context && context.signupData 
      ? context.signupData 
      : {};

    console.log('PROCESS DEBUG - Using signup state:', signupState);
    console.log('PROCESS DEBUG - Using signup data:', JSON.stringify(signupData));

    // Prepare full context for response generation
    const fullContext = {
      ...context,
      recentMessages,
      sentiment,
      topics,
      insights,
      mode: mode || 'balanced',
      persona: persona || 'assistant',
      signupState,
      signupData
    };

    // Process the message with context
    console.log('PROCESS DEBUG - Generating response');
    const botResponse = await generateResponse(message, fullContext, userId);
    console.log('PROCESS DEBUG - Response generated');

    // Save bot response to database if user is authenticated
    let botMessage;
    if (userId) {
      botMessage = new ChatMessage({
        userId,
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        attachment: botResponse.attachment,
        intentCategory: botResponse.intent || 'Other_Generic',
        sentiment: 'neutral',
        topics: topics
      });
      
      await botMessage.save();
      console.log('PROCESS DEBUG - Saved bot message to DB');
    } else {
      // Create temporary message object for non-authenticated users
      botMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        attachment: botResponse.attachment,
        intentCategory: botResponse.intent || 'Other_Generic',
        sentiment: 'neutral',
        topics: topics
      };
      console.log('PROCESS DEBUG - Created temporary bot message');
    }

    // Add bot response to recentMessages for context tracking
    recentMessages.push({
      role: 'assistant',
      content: botResponse.text
    });

    // Extract signup state and data from bot response
    const newSignupState = 
      typeof botResponse.signupState === 'string' 
        ? botResponse.signupState 
        : signupState;
        
    const newSignupData = botResponse.signupData || signupData;

    console.log('PROCESS DEBUG - New signup state to return:', newSignupState);
    console.log('PROCESS DEBUG - New signup data to return:', JSON.stringify(newSignupData));

    // Track analytics for this interaction
    const analyticsData = await trackAnalytics({
      userId: userId,
      messageId: botMessage._id || botMessage.id,
      event: 'message_processed',
      biasDetected: biasAnalysis?.biasDetected || false,
      biasScore: biasAnalysis?.biasScore || 0,
      biasCategory: biasAnalysis?.biasCategory || null,
      biasRedirected: botMessage.biasRedirected || false,
      responseAccuracy: null, // Would be populated by feedback
      engagementMetrics: {
        responseTime: Date.now() - analyticsContext.startTime,
        interactionCount: analyticsContext.interactionCount + 1,
        messageLength: message.length,
        responseLength: botMessage.text.length
      },
      metadata: {
        intent: botMessage.intentCategory,
        sentiment: userMessage.sentiment || 'neutral',
        topics: topics
      }
    });

    return res.status(200).json({
      success: true,
      userMessage: userMessage,
      botMessage: botMessage,
      insights: insights,
      topics: topics,
      recentMessages: recentMessages,
      signupState: newSignupState,
      signupData: newSignupData,
      analyticsData: {
        interactionCount: analyticsContext.interactionCount + 1,
        startTime: analyticsContext.startTime,
        sessionId: analyticsContext.sessionId
      }
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
 * Detect gender bias in a message using Groq LLM
 * 
 * @param {string} message - User's message
 * @returns {Promise<Object>} - Detection result with bias score and category
 */
const detectGenderBias = async (message) => {
  try {
    const messages = [
      {
        "role": "system",
        "content": `You are a gender bias detector focused on identifying language that may contain stereotypes, 
        prejudice, or discrimination based on gender, particularly in technical and career contexts.
        
        Analyze the message for any gender bias, including but not limited to:
        
        1. Stereotyping of gender roles or abilities
        2. Assuming gender for technical or leadership roles
        3. Disparaging remarks or assumptions about women in technology/careers
        4. Reinforcing gender-specific expectations in professional settings
        5. Use of gendered language when gender is not relevant
        
        Rate the bias on a scale of 0-10 where:
        - 0: No bias detected
        - 1-3: Subtle bias or assumptions
        - 4-7: Moderate bias requiring redirection
        - 8-10: Strong bias requiring clear correction
        
        Categorize the type of bias detected (stereotype, role assumption, ability assumption, etc.)
        
        Return ONLY a JSON object with the following structure:
        {
          "biasDetected": true/false,
          "biasScore": 0-10,
          "biasCategory": "category of bias",
          "explanation": "brief explanation",
          "needsRedirection": true/false
        }`
      },
      {
        "role": "user",
        "content": message
      }
    ];

    const response = await groqClient.post('/chat/completions', {
      messages,
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 150
    });

    let biasAnalysis = {};
    try {
      const content = response.data.choices[0].message.content.trim();
      biasAnalysis = JSON.parse(content);
    } catch (e) {
      console.error("Error parsing bias analysis:", e);
      biasAnalysis = {
        biasDetected: false,
        biasScore: 0,
        biasCategory: "unknown",
        explanation: "Unable to analyze bias",
        needsRedirection: false
      };
    }

    return biasAnalysis;
  } catch (error) {
    console.error("Bias detection error:", error);
    // Default safe response if API call fails
    return {
      biasDetected: false,
      biasScore: 0,
      biasCategory: "unknown",
      explanation: "Bias detection unavailable",
      needsRedirection: false
    };
  }
};

/**
 * Generate a bias redirection response
 * 
 * @param {Object} biasAnalysis - The bias analysis result
 * @param {string} originalMessage - User's original message
 * @returns {Promise<Object>} - Bot response object
 */
const generateBiasRedirectionResponse = async (biasAnalysis, originalMessage) => {
  try {
    const messages = [
      {
        "role": "system",
        "content": `You are an inclusive career assistant focused on promoting diversity and equity in tech fields.
        
        A user has sent a message that contains gender bias. Your task is to:
        
        1. Acknowledge their question/intent without calling out the bias in a way that might make them defensive
        2. Provide a thoughtful, factual response that subtly reframes the query in a more inclusive way
        3. Include relevant information highlighting the achievements and contributions of women in tech/careers where appropriate
        4. Maintain a helpful, supportive tone without being preachy or condescending
        
        Bias Analysis:
        Category: ${biasAnalysis.biasCategory}
        Score: ${biasAnalysis.biasScore}/10
        Explanation: ${biasAnalysis.explanation}
        
        Craft a response that maintains the user's primary intent while gently redirecting to a more inclusive perspective.
        Include a fact about women's achievements in tech/career fields relevant to the query if possible.`
      },
      {
        "role": "user",
        "content": originalMessage
      }
    ];

    const response = await groqClient.post('/chat/completions', {
      messages,
      model: GROQ_MODEL,
      temperature: 0.4,
      max_tokens: 500
    });

    return {
      text: response.data.choices[0].message.content.trim(),
      attachment: null,
      intent: "Bias_Redirection",
      biasDetected: true,
      biasCategory: biasAnalysis.biasCategory,
      biasScore: biasAnalysis.biasScore
    };
  } catch (error) {
    console.error("Bias redirection error:", error);
    // Fallback response if API call fails
    return {
      text: "I understand your question about careers and would like to provide a balanced perspective. Research shows diverse teams perform better, with companies having gender-diverse leadership often showing better financial performance. How can I help you explore this topic in a way that recognizes talent across all demographics?",
      attachment: null,
      intent: "Bias_Redirection",
      biasDetected: true,
      biasCategory: biasAnalysis.biasCategory,
      biasScore: biasAnalysis.biasScore
    };
  }
};

/**
 * Track analytics for conversation interactions
 * 
 * @param {Object} data - Analytics data to track
 * @returns {Promise<Object>} - The tracked analytics data
 */
const trackAnalytics = async (data) => {
  try {
    const { 
      userId, 
      messageId, 
      event, 
      biasDetected = false, 
      biasScore = 0, 
      biasCategory = null, 
      biasRedirected = false,
      responseAccuracy = null,
      engagementMetrics = {},
      metadata = {}
    } = data;
    
    // Create analytics record
    const analyticsData = {
      timestamp: new Date(),
      userId,
      messageId,
      event,
      biasDetection: {
        detected: biasDetected,
        score: biasScore,
        category: biasCategory,
        redirected: biasRedirected
      },
      responseMetrics: {
        accuracy: responseAccuracy,
        engagement: engagementMetrics
      },
      metadata
    };
    
    // In a real implementation, this would likely use a dedicated analytics service or database
    // For this example, we'll update the message with analytics data
    if (userId && messageId) {
      await ChatMessage.findByIdAndUpdate(messageId, {
        $set: { analyticsData: analyticsData }
      });
    }
    
    // Log analytics event
    console.log('ANALYTICS - Tracked event:', event, 'bias detected:', biasDetected);
    
    return analyticsData;
  } catch (error) {
    console.error("Error tracking analytics:", error);
    return {
      error: true,
      message: error.message
    };
  }
};

/**
 * Analyze sentiment of a message using Groq LLM
 * 
 * @param {string} message - The message to analyze
 * @returns {Promise<string>} - Sentiment classification (positive, negative, neutral)
 */
const analyzeSentiment = async (message) => {
  try {
    const messages = [
      {
        "role": "system",
        "content": `You are a sentiment analyzer. Analyze the sentiment of the user's message and classify it as:
        - 'positive': Clearly positive sentiment, expressing happiness, gratitude, excitement, etc.
        - 'negative': Clearly negative sentiment, expressing frustration, anger, disappointment, etc.
        - 'neutral': Neutral sentiment, factual statements, questions without emotional content.
        
        Return ONLY the sentiment category name with no additional text.`
      },
      {
        "role": "user",
        "content": message
      }
    ];

    const response = await groqClient.post('/chat/completions', {
      messages,
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 10
    });

    const sentiment = response.data.choices[0].message.content.trim().toLowerCase();
    return ['positive', 'negative', 'neutral'].includes(sentiment) ? sentiment : 'neutral';
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return "neutral"; // Default fallback
  }
};

/**
 * Extract conversation topics using Groq LLM
 * 
 * @param {Array} conversationHistory - Array of conversation messages
 * @returns {Promise<Array>} - Array of topics
 */
const extractConversationTopics = async (conversationHistory) => {
  try {
    const conversationText = conversationHistory
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const messages = [
      {
        "role": "system",
        "content": `You are a conversation analyzer. Extract 2-5 main topics from the conversation.
        Focus on identifying career-related, technical, or professional development topics.
        Return the topics as a JSON array of strings, for example: ["JavaScript", "Career Transition", "Resume Building"]
        Return ONLY the JSON array with no additional text.`
      },
      {
        "role": "user",
        "content": `Extract the main topics from this conversation:\n${conversationText}`
      }
    ];

    const response = await groqClient.post('/chat/completions', {
      messages,
      model: GROQ_MODEL,
      temperature: 0.3,
      max_tokens: 100
    });

    let topics = [];
    try {
      const content = response.data.choices[0].message.content.trim();
      topics = JSON.parse(content);
      if (!Array.isArray(topics)) {
        topics = [];
      }
    } catch (e) {
      console.error("Error parsing topics:", e);
      topics = [];
    }

    return topics;
  } catch (error) {
    console.error("Topic extraction error:", error);
    return []; // Default fallback
  }
};

/**
 * Generate conversation insights using Groq LLM
 * 
 * @param {Array} conversationHistory - Array of conversation messages
 * @returns {Promise<Object>} - Conversation insights
 */
const generateConversationInsights = async (conversationHistory) => {
  try {
    const conversationText = conversationHistory
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const messages = [
      {
        "role": "system",
        "content": `You are a conversation analyst. Analyze the conversation and generate insights including:
        1. A brief conversation summary
        2. The conversation depth level (1-5)
        3. Key entities or terms mentioned
        4. Any open questions that should be addressed
        
        Return the analysis as a JSON object with the following structure:
        {
          "summary": "Brief summary of conversation",
          "depth": 3, // number from 1-5
          "entities": ["entity1", "entity2"],
          "openQuestions": ["question1", "question2"]
        }
        
        Return ONLY the JSON object with no additional text.`
      },
      {
        "role": "user",
        "content": `Analyze this conversation:\n${conversationText}`
      }
    ];

    const response = await groqClient.post('/chat/completions', {
      messages,
      model: GROQ_MODEL,
      temperature: 0.3,
      max_tokens: 500
    });

    let insights = {};
    try {
      const content = response.data.choices[0].message.content.trim();
      insights = JSON.parse(content);
    } catch (e) {
      console.error("Error parsing insights:", e);
      insights = {
        summary: "Conversation analysis unavailable",
        depth: 1,
        entities: [],
        openQuestions: []
      };
    }

    return insights;
  } catch (error) {
    console.error("Insights generation error:", error);
    return {
      summary: "Conversation analysis unavailable",
      depth: 1,
      entities: [],
      openQuestions: []
    };
  }
};

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
 * @route   GET /api/v1/chat/analytics
 * @desc    Get analytics insights on bias detection and engagement
 * @access  Admin
 */
export const getChatAnalytics = asyncHandler(async (req, res) => {
  try {
    // Only allow admin access
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Access denied: Admin privileges required"
    //   });
    // }

    console.log("IN getChatAnalytics")
    
    // Get date range from query params or use last 30 days
    const endDate = new Date();
    const startDate = new Date(req.query.startDate || endDate.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    // Aggregated analytics for bias detection effectiveness
    const biasAnalytics = await ChatMessage.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          biasDetected: true
        }
      },
      {
        $group: {
          _id: "$biasCategory",
          count: { $sum: 1 },
          averageScore: { $avg: "$biasScore" },
          redirected: { $sum: { $cond: ["$biasRedirected", 1, 0] } }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // User engagement metrics
    const engagementAnalytics = await ChatMessage.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$userId",
          messageCount: { $sum: 1 },
          averageLength: { $avg: { $strLenCP: "$text" } },
          sentiments: {
            $push: "$sentiment"
          },
          lastActive: { $max: "$timestamp" }
        }
      },
      {
        $project: {
          messageCount: 1,
          averageLength: 1,
          positiveCount: {
            $size: {
              $filter: {
                input: "$sentiments",
                as: "sentiment",
                cond: { $eq: ["$$sentiment", "positive"] }
              }
            }
          },
          negativeCount: {
            $size: {
              $filter: {
                input: "$sentiments",
                as: "sentiment",
                cond: { $eq: ["$$sentiment", "negative"] }
              }
            }
          },
          neutralCount: {
            $size: {
              $filter: {
                input: "$sentiments",
                as: "sentiment",
                cond: { $eq: ["$$sentiment", "neutral"] }
              }
            }
          },
          lastActive: 1
        }
      },
      {
        $sort: { messageCount: -1 }
      },
      {
        $limit: 100
      }
    ]);
    
    // Intent analytics
    const intentAnalytics = await ChatMessage.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          sender: 'bot'
        }
      },
      {
        $group: {
          _id: "$intentCategory",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Summary statistics
    const totalMessages = await ChatMessage.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate }
    });
    
    const biasedMessages = await ChatMessage.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate },
      biasDetected: true
    });
    
    const redirectedMessages = await ChatMessage.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate },
      biasRedirected: true
    });
    
    const uniqueUsers = await ChatMessage.distinct('userId', {
      timestamp: { $gte: startDate, $lte: endDate }
    });
    
    // Bias mitigation effectiveness
    const biasEffectiveness = await ChatMessage.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          biasRedirected: true
        }
      },
      {
        $lookup: {
          from: "chatMessages",
          let: { userId: "$userId", timestamp: "$timestamp" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$userId", "$$userId"] },
                    { $gt: ["$timestamp", "$$timestamp"] }
                  ]
                }
              }
            },
            { $sort: { timestamp: 1 } },
            { $limit: 1 }
          ],
          as: "nextMessage"
        }
      },
      {
        $project: {
          biasCategory: 1,
          biasScore: 1,
          hasFollowUp: { $gt: [{ $size: "$nextMessage" }, 0] },
          followUpBiased: {
            $cond: {
              if: { $gt: [{ $size: "$nextMessage" }, 0] },
              then: { $arrayElemAt: ["$nextMessage.biasDetected", 0] },
              else: false
            }
          }
        }
      },
      {
        $group: {
          _id: "effectiveness",
          total: { $sum: 1 },
          withFollowUp: { $sum: { $cond: ["$hasFollowUp", 1, 0] } },
          followUpNoBias: {
            $sum: {
              $cond: {
                if: { $and: ["$hasFollowUp", { $eq: ["$followUpBiased", false] }] },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          withFollowUp: 1,
          followUpNoBias: 1,
          effectivenessRate: {
            $cond: {
              if: { $gt: ["$withFollowUp", 0] },
              then: { $divide: ["$followUpNoBias", "$withFollowUp"] },
              else: 0
            }
          }
        }
      }
    ]);
    
    return res.status(200).json({
      success: true,
      dateRange: {
        start: startDate,
        end: endDate
      },
      summary: {
        totalMessages,
        biasedMessages,
        biasRate: biasedMessages / totalMessages,
        redirectedMessages,
        redirectionRate: redirectedMessages / (biasedMessages || 1),
        uniqueUsers: uniqueUsers.length
      },
      biasAnalytics,
      engagementAnalytics,
      intentAnalytics,
      biasEffectiveness: biasEffectiveness[0] || {
        total: 0,
        withFollowUp: 0,
        followUpNoBias: 0,
        effectivenessRate: 0
      }
    });
  } catch (error) {
    console.error("Error generating analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate analytics",
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
        8. SignUp_Intent - User wants to register/signup/create an account or asks how to create a new account
        
        Return ONLY the intent category name with no additional text or explanations.`
      },
      {
        "role": "user",
        "content": message
      }
    ];

    const response = await groqClient.post('/chat/completions', {
      messages,
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 20
    });

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
const generateResponse = async (message, context, userId) => {
  const defaultResponse = {
    text: "I apologize, but I'm having trouble processing your request right now. Please try again or ask something different.",
    attachment: null,
    intent: "Other_Generic",
    signupState: context.signupState || 'initial',
    signupData: context.signupData || {}
  };

  try {
    // First, classify the intent
    const intent = await classifyIntent(message);
    console.log('INTENT DEBUG - Classified intent:', intent);
    
    // If we're in a signup flow, prioritize that intent regardless of classification
    if (context.signupState && context.signupState !== 'initial') {
      console.log('INTENT DEBUG - In signup flow, overriding intent');
      
      // Handle the signup conversation
      return await handleSignupIntent(message, context, userId);
    }
    
    // For new signup requests
    if (intent === 'SignUp_Intent' || 
        (message.toLowerCase().includes('sign up') || 
         message.toLowerCase().includes('create account') ||
         message.toLowerCase().includes('register'))) {
      console.log('INTENT DEBUG - Detected signup intent, starting signup flow');
      return await handleSignupIntent(message, context, userId);
    }
    
    // Handle specific intents with enhanced handlers that use LLM parameter extraction
    if (intent === 'Career_Trajectory_Switch') {
      return await handleCareerTrajectoryIntent(message, userId);
    } else if (intent === 'Job_Listing') {
      return await handleJobListingIntent(message, userId);
    } else if (intent === 'Mock_Interview') {
      return await handleMockInterviewIntent(message, userId);
    } else if (intent === 'Coding_Platform') {
      return await handleCodingPlatformIntent(message, userId);
    } else if (intent === 'Events_Listings') {
      return await handleEventsIntent(message, userId);
    }
    
    // For other intents, use the contextual conversational response
    return await generateConversationalResponse(message, intent, context);
    
  } catch (error) {
    console.error("Error generating response:", error);
    return {
      ...defaultResponse,
      text: "I apologize, but I'm having trouble processing your request right now. Please try again or ask something different."
    };
  }
};

const handleSignupIntent = async (message, context, userId) => {
  console.log('SIGNUP DEBUG - Current state:', context.signupState);
  console.log('SIGNUP DEBUG - Current data:', context.signupData);

  userId = null
  
  // Check if user is already authenticated
  if (userId) {
    return {
      text: "You're already logged in with an account. No need to sign up again! Is there something else I can help you with?",
      attachment: null,
      intent: "Other_Professional", // Using existing intent category
      signupState: 'initial',
      signupData: {}
    };
  }

  // Get signup flow state information from context
  // Default to 'initial' if undefined or null (important fix!)
  const signupState = context.signupState || 'initial';
  const signupData = context.signupData || {};

  console.log('SIGNUP DEBUG - Processing for state:', signupState);

  // Multi-step conversation flow for signup
  switch (signupState) {
    case 'initial':
      // Start the signup flow
      console.log('SIGNUP DEBUG - Starting new signup flow');
      return {
        text: "I'd be happy to help you create a new account! I'll walk you through the signup process step by step. First, what username would you like to use?",
        attachment: null,
        intent: "Other_Professional", // Using existing intent category
        signupState: 'collecting_username',
        signupData: {}
      };

    case 'collecting_username':
      // Extract username from the message
      const username = message.trim();
      console.log('SIGNUP DEBUG - Received username:', username);
      
      if (!username || username.length < 3) {
        console.log('SIGNUP DEBUG - Username validation failed');
        return {
          text: "Your username should be at least 3 characters long. Please try again with a longer username.",
          attachment: null,
          intent: "Other_Professional", // Using existing intent category
          signupState: 'collecting_username',
          signupData
        };
      }

      // Store username and ask for full name
      console.log('SIGNUP DEBUG - Username accepted, moving to collecting_fullname');
      return {
        text: "Great username choice! Now, please tell me your full name.",
        attachment: null,
        intent: "Other_Professional", // Using existing intent category
        signupState: 'collecting_fullname',
        signupData: { ...signupData, username }
      };

    case 'collecting_fullname':
      // Extract fullname from the message
      const fullname = message.trim();
      console.log('SIGNUP DEBUG - Received fullname:', fullname);
      
      if (!fullname || fullname.length < 2) {
        console.log('SIGNUP DEBUG - Fullname validation failed');
        return {
          text: "Your full name seems too short. Please provide your complete full name.",
          attachment: null,
          intent: "Other_Professional",
          signupState: 'collecting_fullname',
          signupData
        };
      }

      // Store fullname and ask for email
      console.log('SIGNUP DEBUG - Fullname accepted, moving to collecting_email');
      return {
        text: `Thank you, ${fullname.split(' ')[0]}! Now, please provide your email address.`,
        attachment: null,
        intent: "Other_Professional",
        signupState: 'collecting_email',
        signupData: { ...signupData, fullname }
      };

    case 'collecting_email':
      // Extract and validate email
      const email = message.trim().toLowerCase();
      console.log('SIGNUP DEBUG - Received email:', email);
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('SIGNUP DEBUG - Email validation failed');
        return {
          text: "That doesn't appear to be a valid email address format. Please provide a valid email (e.g., example@domain.com).",
          attachment: null,
          intent: "Other_Professional",
          signupState: 'collecting_email',
          signupData
        };
      }

      // Store email and ask for password
      console.log('SIGNUP DEBUG - Email accepted, moving to collecting_password');
      return {
        text: "Great! Finally, please provide a password. For security, it should be at least 8 characters long.",
        attachment: null,
        intent: "Other_Professional",
        signupState: 'collecting_password',
        signupData: { ...signupData, email }
      };

    case 'collecting_password':
      // Extract and validate password
      const password = message.trim();
      console.log('SIGNUP DEBUG - Received password (length only):', password ? password.length : 0);
      
      if (!password || password.length < 8) {
        console.log('SIGNUP DEBUG - Password validation failed');
        return {
          text: "Your password should be at least 8 characters long for better security. Please try again with a stronger password.",
          attachment: null,
          intent: "Other_Professional",
          signupState: 'collecting_password',
          signupData
        };
      }

      // Store password and try to register the user
      console.log('SIGNUP DEBUG - Password accepted, attempting registration');
      try {
        const userData = {
          username: signupData.username,
          fullname: signupData.fullname,
          email: signupData.email,
          password
        };

        console.log('SIGNUP DEBUG - Registration data prepared:', JSON.stringify({
          ...userData,
          password: '[REDACTED]'
        }));

        // Call the user registration API
        const response = await axios.post(`${process.env.API_BASE_URL || 'http://localhost:8000'}/api/v1/users/register`, userData);
        console.log('SIGNUP DEBUG - Registration API response:', response.data);

        if (response.data.success) {
          // Registration successful
          console.log('SIGNUP DEBUG - Registration successful');
          return {
            text: `Success! Your account has been created successfully. You can now log in with your username "${userData.username}" and the password you provided. Would you like to log in now?`,
            attachment: null,
            intent: "Other_Professional",
            signupState: 'registration_complete',
            signupData: {}
          };
        } else {
          // Registration failed
          console.log('SIGNUP DEBUG - Registration failed:', response.data.message);
          return {
            text: `I'm sorry, but there was an issue creating your account: ${response.data.message || 'Unknown error'}. Please try again or contact support if the issue persists.`,
            attachment: null,
            intent: "Other_Professional",
            signupState: 'initial',
            signupData: {}
          };
        }
      } catch (error) {
        console.error("SIGNUP DEBUG - Registration error:", error);
        
        // Check for specific error types
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.message || '';
          console.log('SIGNUP DEBUG - Registration error message:', errorMessage);
          
          if (errorMessage.includes("exists")) {
            return {
              text: "I'm sorry, but a user with that username or email already exists. Would you like to try with a different username or email?",
              attachment: null,
              intent: "Other_Professional",
              signupState: 'initial',
              signupData: {}
            };
          }
        }
        
        // Generic error
        return {
          text: "I apologize, but I encountered an issue while creating your account. Please try again later or contact support if the issue persists.",
          attachment: null,
          intent: "Other_Professional",
          signupState: 'initial',
          signupData: {}
        };
      }

    case 'registration_complete':
      // User has successfully registered and is likely responding to "Would you like to log in now?"
      console.log('SIGNUP DEBUG - In registration complete state, processing:', message);
      
      if (message.toLowerCase().includes("yes") || message.toLowerCase().includes("yeah") || message.toLowerCase().includes("sure")) {
        console.log('SIGNUP DEBUG - User wants to log in, providing login instructions');
        return {
          text: "Great! To log in, go to the login page with your new credentials. If you're on mobile, tap the menu icon and select 'Login'. On desktop, click the 'Login' button in the top right corner. If you need any help with anything else, just let me know!",
          attachment: null,
          intent: "Other_Professional",
          signupState: 'initial',
          signupData: {}
        };
      } else {
        console.log('SIGNUP DEBUG - User doesn\'t want to log in, ending signup flow');
        return {
          text: "No problem! If you need help with anything else, just let me know. Welcome to our platform!",
          attachment: null,
          intent: "Other_Generic",
          signupState: 'initial',
          signupData: {}
        };
      }

    default:
      // Reset the signup flow if state is invalid
      console.log('SIGNUP DEBUG - Invalid state, resetting to initial state');
      return {
        text: "I'd be happy to help you sign up! I'll need a few details from you. First, what username would you like to use?",
        attachment: null,
        intent: "Other_Professional",
        signupState: 'collecting_username',
        signupData: {}
      };
  }
};

const generateConversationalResponse = async (message, intent, context) => {
  try {
    // Create personality based on persona
    let personalityPrompt = "";
    switch(context.persona) {
      case 'coach':
        personalityPrompt = `You are a Career Coach AI named Asha. Your communication style is motivational, encouraging, and focused on professional growth. 
        You use positive reinforcement and ask thoughtful questions to guide users toward their career goals. You speak with confidence and authority on career-related topics.
        
        You are committed to advancing gender equality in tech and career spaces. Incorporate factual information about women's achievements in relevant fields when appropriate, 
        highlight diverse role models, and ensure your advice is inclusive and works for people of all genders. When discussing leadership, technical roles, or any career path,
        use inclusive language and examples featuring women and people of diverse backgrounds.`;
        break;
      case 'mentor':
        personalityPrompt = `You are a Technical Mentor AI named Asha. Your communication style is detail-oriented, methodical, and educational. 
        You excel at breaking down complex technical concepts in digestible ways. You often reference best practices and provide examples when explaining technical concepts.
        
        You are committed to promoting diversity and inclusion in tech fields. When providing examples of successful professionals, include prominent women in tech.
        Highlight contributions from diverse engineers and scientists, and use inclusive language in all explanations. Ensure your technical guidance is accessible
        to people from all backgrounds, and consider different learning styles in your explanations.`;
        break;
      case 'analyst':
        personalityPrompt = `You are a Data Analyst AI named Asha. Your communication style is precise, analytical, and evidence-based. 
        You reference trends, patterns, and data points in your responses. You help users interpret information and make data-driven decisions about their careers.
        
        You are committed to accuracy and inclusivity in data interpretation. Include statistics on gender diversity in workplaces when relevant, highlight studies
        showing the benefits of diverse teams, and present data objectively while ensuring your analysis doesn't perpetuate biases. Look for opportunities to share
        facts about women's achievements in data science, analytics, and related fields.`;
        break;
      default: // assistant
        personalityPrompt = `You are an AI Career Assistant named Asha. Your communication style is helpful, friendly, and conversational. 
        You aim to provide balanced and informative responses while maintaining a natural, engaging tone.
        
        You are designed following global AI ethics frameworks, prioritizing fairness, transparency, and inclusion. You are committed to providing 
        career guidance that works for everyone regardless of gender, background, or identity. Incorporate factual information about women's achievements 
        in tech and business when relevant, and ensure your responses avoid reinforcing stereotypes or biases. Your aim is to empower all users while 
        being particularly mindful of historically underrepresented groups in tech fields.`;
    }
    
    // Adjust response style based on mode
    let modePrompt = "";
    switch(context.mode) {
      case 'creative':
        modePrompt = `Respond in a creative, exploratory style. Feel free to suggest innovative ideas, use metaphors, and think outside the box. 
        Your responses should inspire users with unique perspectives and imaginative solutions.`;
        break;
      case 'precise':
        modePrompt = `Respond in a precise, factual style. Focus on accuracy, clarity, and conciseness. 
        Prioritize well-established information and make clear distinctions between facts and opinions.`;
        break;
      default: // balanced
        modePrompt = `Respond in a balanced style, combining helpful information with conversational tone. 
        Provide thoughtful answers that are both informative and engaging.`;
    }
    
    // Add global ethics guidelines
    const ethicsGuidelines = `
    Follow these AI ethics guidelines in all responses:
    1. Prioritize fairness and inclusion by ensuring examples and advice work for all demographics
    2. Respect user privacy and maintain confidentiality of all conversation data 
    3. Provide transparent reasoning without hidden biases or agendas
    4. Present balanced, factual information, especially when discussing gender in career contexts
    5. If detecting potential bias in a query, maintain respect while gently reframing in a more inclusive way
    6. Highlight diversity success stories when relevant to provide positive, factual role models
    7. Avoid reinforcing stereotypes related to who "typically" holds specific roles or has certain capabilities
    8. Maintain awareness of global cultural contexts around gender in professional settings`;
    
    // Build conversation history for context
    const recentMessagesPrompt = context.recentMessages && context.recentMessages.length > 0 
      ? `\nHere is the recent conversation history for context:\n${context.recentMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`
      : '';
    
    // Add topic awareness
    const topicsPrompt = context.topics && context.topics.length > 0
      ? `\nThe conversation has been focused on these topics: ${context.topics.join(', ')}.`
      : '';
    
    // Build the system prompt
    const systemPrompt = `${personalityPrompt}

${modePrompt}

${ethicsGuidelines}

You assist users with career development, job search, technical interview preparation, and coding questions.${topicsPrompt}

When responding:
1. Be conversational and natural, avoiding overly formal language
2. Keep responses concise yet helpful (2-3 paragraphs maximum)
3. Be empathetic to user's career challenges and aspirations
4. If the conversation mentions specific technical topics, demonstrate knowledge in those areas
5. For career advice, provide actionable suggestions when possible
6. Maintain the conversation thread by referencing previous messages when relevant
7. When relevant, incorporate factual information about women's achievements in tech and career fields
8. Use inclusive language and diverse examples in all technical and career explanations${recentMessagesPrompt}`;

    const messages = [
      {
        "role": "system",
        "content": systemPrompt
      },
      ...context.recentMessages,
      {
        "role": "user",
        "content": message
      }
    ];

    const response = await groqClient.post('/chat/completions', {
      messages,
      model: GROQ_MODEL,
      temperature: context.mode === 'creative' ? 0.8 : context.mode === 'precise' ? 0.3 : 0.6,
      max_tokens: 800
    });

    return {
      text: response.data.choices[0].message.content.trim(),
      attachment: null,
      intent: intent
    };
  } catch (error) {
    console.error("Conversational response generation error:", error);
    return {
      text: "I apologize, but I encountered an issue while processing your request. Please try asking your question again.",
      attachment: null,
      intent: intent
    };
  }
};

// Events intent handler
const handleEventsIntent = async (message, userId) => {
  // Implement your events handler here similar to other intent handlers
  // This is a placeholder implementation
  return {
    text: "I can help you find events, workshops, and meetups. Our Events page lists upcoming opportunities for networking and learning.",
    attachment: {
      type: 'link',
      data: {
        url: '/events',
        label: 'Browse Events',
        description: 'Find upcoming tech events and workshops'
      }
    },
    intent: "Events_Listings"
  };
};