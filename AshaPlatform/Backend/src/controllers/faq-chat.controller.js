// Backend/src/controllers/faq-chat.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { FAQChatMessage } from '../models/faq-chat.model.js';
import axios from 'axios';

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/v1/chat/completions';
const GROQ_MODEL = 'llama3-70b-8192';

// Initialize Groq client with proper configuration
const groqClient = axios.create({
  baseURL: 'https://api.groq.com/openai/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
  },
  timeout: 15000 // 15 second timeout
});

/**
 * @route   POST /api/v1/faq-chat/send
 * @desc    Process a message for the FAQ chat system
 * @access  Public (no auth required)
 */
export const processFAQMessage = asyncHandler(async (req, res) => {
  console.log('FAQ CHAT - New message received');
  const { message, context = {} } = req.body;
  
  // Validate input
  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid message"
    });
  }

  try {
    // Extract session ID from context or create new one
    let sessionId = context.sessionId;
    if (!sessionId) {
      sessionId = FAQChatMessage.createSessionId();
      console.log('FAQ CHAT - Created new session:', sessionId);
    }
    
    // Get user ID if authenticated
    const userId = req.user ? req.user._id : null;
    
    // Get client IP and user agent for analytics
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Save user message to database
    const userMessage = new FAQChatMessage({
      sessionId,
      userId,
      text: message,
      sender: 'user',
      timestamp: new Date(),
      ipAddress,
      userAgent,
      context: {
        page: context.page || 'login',
        isLoginPage: context.isLoginPage || false,
        needsSignupHelp: context.needsSignupHelp || false
      }
    });
    
    await userMessage.save();
    console.log('FAQ CHAT - Saved user message to DB');
    
    // Get recent conversation history
    let recentMessages = context.recentMessages || [];
    
    if (!recentMessages.length) {
      const history = await FAQChatMessage.getSessionMessages(sessionId, 5);
      recentMessages = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      console.log('FAQ CHAT - Fetched conversation history from DB');
    }
    
    // Add current message if not already there
    if (!recentMessages.some(msg => msg.role === 'user' && msg.content === message)) {
      recentMessages.push({
        role: 'user',
        content: message
      });
    }
    
    // Categorize the message
    const category = await categorizeFAQMessage(message, context);
    console.log('FAQ CHAT - Categorized message as:', category);
    
    // Set category for the user message
    userMessage.category = category;
    await userMessage.save();
    
    // Generate the response
    const botResponse = await generateFAQResponse(message, category, { 
      recentMessages, 
      context, 
      sessionId 
    });
    
    // Save bot response to database
    const botMessage = new FAQChatMessage({
      sessionId,
      userId,
      text: botResponse.text,
      sender: 'bot',
      timestamp: new Date(),
      attachment: botResponse.attachment,
      category: botResponse.category || category,
      ipAddress,
      userAgent,
      context: {
        page: context.page || 'login',
        isLoginPage: context.isLoginPage || false,
        needsSignupHelp: context.needsSignupHelp || false
      }
    });
    
    await botMessage.save();
    console.log('FAQ CHAT - Saved bot response to DB');
    
    // Return the response
    return res.status(200).json({
      success: true,
      sessionId,
      userMessage: userMessage.toFrontend(),
      botMessage: botMessage.toFrontend()
    });
    
  } catch (error) {
    console.error("FAQ Chat error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process message",
      error: error.message
    });
  }
});

/**
 * Categorize the FAQ message
 */
const categorizeFAQMessage = async (message, context) => {
  try {
    const messages = [
      {
        "role": "system",
        "content": `You are a message categorizer for a FAQ chatbot on a coding platform login page. 
        Analyze the user's message and classify it into EXACTLY ONE of these categories:
        
        1. platform_info - Questions about what the platform is, what it offers, etc.
        2. account_help - Questions about existing accounts, password reset, etc.
        3. features - Questions about specific features of the platform
        4. pricing - Questions about pricing, subscription plans, trials, etc.
        5. technical_issues - Questions about errors, bugs, or technical problems
        6. signup_assistance - User wants help creating a new account
        7. other - Any other type of question
        
        Return ONLY the category name with no additional text.`
      },
      {
        "role": "user",
        "content": message
      }
    ];

    // Check if context indicates this is likely a signup question
    if (context.needsSignupHelp) {
      return 'signup_assistance';
    }

    const response = await groqClient.post('/chat/completions', {
      messages,
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 20
    });

    const category = response.data.choices[0].message.content.trim().toLowerCase();
    
    // Validate the response is one of our categories
    const validCategories = [
      'platform_info', 
      'account_help', 
      'features', 
      'pricing', 
      'technical_issues',
      'signup_assistance',
      'other'
    ];
    
    if (validCategories.includes(category)) {
      return category;
    }
    
    return 'other'; // Default fallback
  } catch (error) {
    console.error("Category detection error:", error);
    return "other"; // Default fallback
  }
};

/**
 * Generate a response for the FAQ chat
 */
const generateFAQResponse = async (message, category, { recentMessages, context, sessionId }) => {
  // Defaults for error cases
  const defaultResponse = {
    text: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
    attachment: null,
    category: category
  };

  try {
    // Create a specific system prompt based on the category
    let systemPrompt = `You are an FAQ assistant named AshaVerse for a women centric skill development platform. You're currently helping a user on the login page. Your responses should be friendly, informative, and focused on helping users understand the platform or create an account.

Key information about the AshaVerse platform:
- AshaVerse is a comprehensive coding education platform focused on interview preparation and skill development
- Features include: coding practice problems, mock interviews, career pathway guidance, mentorship, and job listings
- There is a free basic tier and premium subscription options starting at $9.99/month
- Account creation requires an email, username, and password (minimum 8 characters)
- Passwords can be reset through the "Forgot Password" link on the login page

Keep your responses concise (under 3 sentences for simple questions) and helpful.`;

    // Add category-specific instructions
    if (category === 'signup_assistance') {
      systemPrompt += `\n\nThe user wants help with account creation. Guide them through the signup process. Explain the steps clearly and offer to help them sign up right now through this chat interface if they want.`;
    } else if (category === 'account_help') {
      systemPrompt += `\n\nThe user needs help with their account. If they forgot their password, explain they can use the "Forgot Password" link on the login page. If they can't remember their username, explain they can use their email to log in.`;
    }

    // Add interaction style guidance
    systemPrompt += `\n\nInteraction style:
- Be conversational but efficient
- Offer specific, actionable next steps when possible
- For signup assistance, suggest using the "Create Account" button or offer to help right away
- Don't use technical jargon unnecessarily
- For questions you don't know the answer to, acknowledge the limitations and suggest contacting support@ashaplatform.com`;

    const messages = [
      {
        "role": "system",
        "content": systemPrompt
      },
      ...recentMessages
    ];

    const response = await groqClient.post('/chat/completions', {
      messages,
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 500
    });

    const responseText = response.data.choices[0].message.content.trim();
    
    // Check if we should include an attachment
    let attachment = null;
    
    // For signup assistance, add a signup form attachment if it seems appropriate
    if (category === 'signup_assistance' && 
        (message.toLowerCase().includes('sign') || 
         message.toLowerCase().includes('creat') || 
         message.toLowerCase().includes('regist') ||
         responseText.toLowerCase().includes('create an account') ||
         responseText.toLowerCase().includes('sign up'))) {
      
      attachment = {
        type: 'signup',
        data: {
          step: 'username',
          formData: {}
        }
      };
    }
    
    // For account help, add a link to the password reset page
    else if (category === 'account_help' && 
             (message.toLowerCase().includes('forgot') || 
              message.toLowerCase().includes('reset') ||
              message.toLowerCase().includes('password'))) {
      
      attachment = {
        type: 'link',
        data: {
          url: '/reset-password',
          label: 'Reset Your Password',
          description: 'Follow this link to reset your password'
        }
      };
    }
    
    // For platform info, maybe add a link to features page
    else if (category === 'platform_info' && 
             (message.toLowerCase().includes('what') || 
              message.toLowerCase().includes('about') ||
              message.toLowerCase().includes('learn'))) {
      
      attachment = {
        type: 'options',
        data: {
          title: 'Learn More About Asha',
          options: [
            { 
              label: 'Features Overview', 
              url: '/features',
              icon: 'fa-list-ul'
            },
            { 
              label: 'Pricing Plans', 
              url: '/pricing',
              icon: 'fa-tag'
            },
            { 
              label: 'Student Success Stories', 
              url: '/success-stories',
              icon: 'fa-star'
            }
          ]
        }
      };
    }

    return {
      text: responseText,
      attachment: attachment,
      category: category
    };
  } catch (error) {
    console.error("FAQ response generation error:", error);
    return defaultResponse;
  }
};

/**
 * @route   GET /api/v1/faq-chat/history/:sessionId
 * @desc    Get chat history for a specific session
 * @access  Public (no auth required)
 */
export const getFAQChatHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: "Session ID is required"
    });
  }
  
  try {
    const messages = await FAQChatMessage.find({ sessionId })
      .sort({ timestamp: 1 });
    
    return res.status(200).json({
      success: true,
      sessionId,
      messages: messages.map(msg => msg.toFrontend())
    });
  } catch (error) {
    console.error("Error fetching FAQ chat history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
      error: error.message
    });
  }
});

/**
 * @route   POST /api/v1/faq-chat/feedback
 * @desc    Submit feedback for a FAQ chat message
 * @access  Public (no auth required)
 */
export const submitFAQFeedback = asyncHandler(async (req, res) => {
  const { messageId, rating, feedback } = req.body;
  
  if (!messageId || !rating) {
    return res.status(400).json({
      success: false,
      message: "Message ID and rating are required"
    });
  }
  
  // Validate rating
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: "Rating must be a number between 1 and 5"
    });
  }
  
  try {
    const message = await FAQChatMessage.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }
    
    // Update the message with feedback
    message.helpfulnessRating = rating;
    
    // If additional feedback was provided, store it in context
    if (feedback) {
      message.context = {
        ...message.context,
        userFeedback: feedback
      };
    }
    
    await message.save();
    
    return res.status(200).json({
      success: true,
      message: "Feedback submitted successfully"
    });
  } catch (error) {
    console.error("Error submitting FAQ feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
      error: error.message
    });
  }
});

/**
 * @route   GET /api/v1/faq-chat/analytics
 * @desc    Get FAQ chat analytics (admin only)
 * @access  Private (Admin)
 */
export const getFAQAnalytics = asyncHandler(async (req, res) => {
  // Verify admin access
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: Admin access required"
    });
  }
  
  // Get date range from query params with defaults
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
  // Default to 30 days ago if not specified
  const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(endDate - 30 * 24 * 60 * 60 * 1000);
  
  try {
    // Get frequent questions
    const frequentQuestions = await FAQChatMessage.getFrequentQuestions(startDate, endDate, 10);
    
    // Get category distribution
    const categoryAggregation = await FAQChatMessage.aggregate([
      {
        $match: {
          timestamp: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get satisfaction ratings
    const ratingsAggregation = await FAQChatMessage.aggregate([
      {
        $match: {
          helpfulnessRating: { $ne: null },
          timestamp: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: '$helpfulnessRating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Get session count
    const sessionCount = await FAQChatMessage.aggregate([
      {
        $match: {
          timestamp: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: '$sessionId'
        }
      },
      {
        $count: 'total'
      }
    ]);
    
    // Get completion rate for signup intents
    const signupSessions = await FAQChatMessage.aggregate([
      {
        $match: {
          category: 'signup_assistance',
          timestamp: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: '$sessionId',
          messages: { $push: '$$ROOT' }
        }
      }
    ]);
    
    // Count how many resulted in completed signups
    // This is a simplified approximation
    const completedSignups = signupSessions.filter(session => {
      const botMessages = session.messages.filter(msg => msg.sender === 'bot');
      return botMessages.some(msg => 
        msg.text.toLowerCase().includes('success') || 
        msg.text.toLowerCase().includes('account created')
      );
    }).length;
    
    return res.status(200).json({
      success: true,
      analytics: {
        timeRange: {
          start: startDate,
          end: endDate
        },
        frequentQuestions,
        categoryDistribution: categoryAggregation,
        satisfactionRatings: ratingsAggregation,
        sessionCount: sessionCount[0]?.total || 0,
        signupAssistance: {
          total: signupSessions.length,
          completed: completedSignups,
          completionRate: signupSessions.length > 0 ? 
            (completedSignups / signupSessions.length * 100).toFixed(2) + '%' : 
            '0%'
        }
      }
    });
    
  } catch (error) {
    console.error("Error fetching FAQ analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message
    });
  }
});