// Placeholder content for chatService.js
// services/chatService.js
import { generateId } from '../utils/conversationUtils';
import { fetchJobs } from '../api/jobsApi';
import { fetchEvents } from '../api/eventsApi';

/**
 * Process a user message and generate an appropriate response
 * 
 * @param {string} message - User's message
 * @param {Array} conversation - Previous conversation history
 * @returns {Object} - Response object with text and optional attachment
 */
export const processUserMessage = async (message, conversation = []) => {
  try {
    // Simple intent detection based on keywords
    const intent = detectIntent(message);
    
    // Get response based on intent
    const response = await generateResponse(message, intent, conversation);
    
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
 * Simple intent detection based on keywords
 * 
 * @param {string} message - User's message
 * @returns {string} - Detected intent
 */
const detectIntent = (message) => {
  const messageLC = message.toLowerCase();
  
  if (messageLC.includes('job') || messageLC.includes('career') || messageLC.includes('work') || messageLC.includes('employ')) {
    return 'job_search';
  } else if (messageLC.includes('event') || messageLC.includes('workshop') || messageLC.includes('webinar') || messageLC.includes('conference')) {
    return 'event_info';
  } else if (messageLC.includes('mentor') || messageLC.includes('guidance') || messageLC.includes('advise') || messageLC.includes('coach')) {
    return 'mentorship';
  } else if (messageLC.includes('hello') || messageLC.includes('hi ') || messageLC.includes('hey') || messageLC === 'hi') {
    return 'greeting';
  } else if (messageLC.includes('help')) {
    return 'help';
  } else {
    return 'general';
  }
};

/**
 * Generate a response based on the detected intent
 * 
 * @param {string} message - User's message
 * @param {string} intent - Detected intent
 * @param {Array} conversation - Previous conversation history
 * @returns {Object} - Response object with text and optional attachment
 */
const generateResponse = async (message, intent, conversation) => {
  // Add a delay to simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check conversation context to see if this is a follow-up question
  const isFollowUp = checkIfFollowUp(conversation);
  
  // Generate response based on intent
  switch (intent) {
    case 'job_search':
      return await handleJobIntent(message);
    case 'event_info':
      return await handleEventIntent(message);
    case 'mentorship':
      return await handleMentorshipIntent(message);
    case 'greeting':
      return {
        text: 'Hello! I\'m Asha, an AI assistant for JobsForHer Foundation. I can help you explore career opportunities, find job listings, learn about community events, or connect with mentorship programs. How can I assist you today?',
        attachment: null
      };
    case 'help':
      return {
        text: `I'd be happy to help! As Asha, I can assist you with:
        
1. Finding job opportunities tailored to your skills and interests
2. Discovering upcoming events and workshops
3. Exploring mentorship programs
4. Providing information about women's career development resources

What would you like to know more about?`,
        attachment: null
      };
    default:
      if (isFollowUp) {
        return handleFollowUp(message, conversation);
      }
      return {
        text: 'Thank you for your message. I can provide information about job opportunities, events, mentorship programs, and more. Could you please specify what kind of career information you\'re looking for, and I\'ll do my best to assist you?',
        attachment: null
      };
  }
};

/**
 * Handle job-related queries
 * 
 * @param {string} message - User's message
 * @returns {Object} - Response with job information
 */
const handleJobIntent = async (message) => {
  try {
    // Get job listings
    const jobs = await fetchJobs();
    
    // Simple relevance matching based on the message
    const relevantJobs = findRelevantJobs(message, jobs);
    
    if (relevantJobs.length > 0) {
      const topJob = relevantJobs[0];
      
      return {
        text: `I found a job opportunity that might interest you: ${topJob.title} at ${topJob.company}. This ${topJob.type} position is located in ${topJob.location}. The role offers ${topJob.salary} and requires skills in ${topJob.skills.join(', ')}. Would you like me to find more similar opportunities?`,
        attachment: {
          type: 'job',
          data: topJob
        }
      };
    } else {
      return {
        text: `I'd be happy to help you find job opportunities that match your interests and skills. Could you tell me more about the type of roles you're looking for or any specific industries you're interested in?`,
        attachment: null
      };
    }
  } catch (error) {
    console.error('Error handling job intent:', error);
    return {
      text: 'I apologize, but I encountered an issue while searching for jobs. Please try again or provide more details about the kind of job you\'re looking for.',
      attachment: null
    };
  }
};

/**
 * Handle event-related queries
 * 
 * @param {string} message - User's message
 * @returns {Object} - Response with event information
 */
const handleEventIntent = async (message) => {
  try {
    // Get events
    const events = await fetchEvents();
    
    // Simple relevance matching based on the message
    const relevantEvents = findRelevantEvents(message, events);
    
    if (relevantEvents.length > 0) {
      const topEvent = relevantEvents[0];
      const eventDate = new Date(topEvent.date);
      const formattedDate = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
      
      return {
        text: `I found an upcoming event you might be interested in: "${topEvent.title}" on ${formattedDate}. It will be held ${topEvent.virtual ? 'virtually' : `at ${topEvent.location}`}. ${topEvent.description.substring(0, 100)}... Would you like more details about this event?`,
        attachment: {
          type: 'event',
          data: topEvent
        }
      };
    } else {
      return {
        text: `There are several upcoming events hosted by JobsForHer Foundation. These events cover networking opportunities, skill development workshops, and career fairs. Would you like me to show you events in a specific category or time frame?`,
        attachment: null
      };
    }
  } catch (error) {
    console.error('Error handling event intent:', error);
    return {
      text: 'I apologize, but I encountered an issue while searching for events. Please try again or provide more details about the kind of events you\'re interested in.',
      attachment: null
    };
  }
};

/**
 * Handle mentorship-related queries
 * 
 * @param {string} message - User's message
 * @returns {Object} - Response with mentorship information
 */
const handleMentorshipIntent = async (message) => {
  // Simulate a mentorship program (in a real app, this would come from an API)
  const mentorshipProgram = {
    id: 1,
    title: 'Leadership Accelerator Program',
    mentor: 'Dr. Nandita Sharma',
    mentorTitle: 'CEO, TechInnovations India',
    focus: 'Executive Leadership Development',
    duration: '6 months',
    format: 'One-on-one sessions + Group workshops',
    description: 'This program is designed for mid-career women looking to advance into senior leadership positions. It combines personalized coaching with group learning to develop strategic leadership skills, executive presence, and organizational influence.',
    image: 'https://randomuser.me/api/portraits/women/21.jpg',
    industry: 'Technology',
    startDate: '2025-05-15',
    commitmentHours: '4-6 hours per month',
    application: 'https://example.com/mentorship/apply/1',
  };
  
  return {
    text: `I found a mentorship program that might be a good fit: "${mentorshipProgram.title}" led by ${mentorshipProgram.mentor}. This program focuses on ${mentorshipProgram.focus} and runs for ${mentorshipProgram.duration}. Would you like to learn more about how to apply?`,
    attachment: {
      type: 'mentorship',
      data: mentorshipProgram
    }
  };
};

/**
 * Check if the current message is a follow-up to a previous conversation
 * 
 * @param {Array} conversation - Conversation history
 * @returns {boolean} - True if this appears to be a follow-up question
 */
const checkIfFollowUp = (conversation) => {
  if (!conversation || conversation.length < 2) {
    return false;
  }
  
  // Look at the last two exchanges
  const recentExchanges = conversation.slice(-4);
  
  // Simple heuristic: if the last message from the user is very short,
  // it's likely a follow-up question
  const lastUserMessage = recentExchanges.filter(msg => msg.role === 'user').pop();
  
  if (lastUserMessage && lastUserMessage.content) {
    const wordCount = lastUserMessage.content.split(/\s+/).length;
    return wordCount <= 5;
  }
  
  return false;
};

/**
 * Handle follow-up questions based on conversation context
 * 
 * @param {string} message - Current user message
 * @param {Array} conversation - Conversation history
 * @returns {Object} - Response based on conversation context
 */
const handleFollowUp = (message, conversation) => {
  // Get the last bot response to see what was being discussed
  const lastBotResponse = conversation
    .filter(msg => msg.role === 'assistant')
    .pop();
  
  if (!lastBotResponse) {
    return {
      text: 'Could you please provide more details about what you\'re looking for?',
      attachment: null
    };
  }
  
  // Simple keyword matching to determine context
  const responseLC = lastBotResponse.content.toLowerCase();
  
  if (responseLC.includes('job') || responseLC.includes('career') || responseLC.includes('work')) {
    return {
      text: 'I can help you explore more job opportunities. Would you like to filter by location, industry, or role? Or I can provide information on how to prepare your resume and application.',
      attachment: null
    };
  } else if (responseLC.includes('event') || responseLC.includes('workshop')) {
    return {
      text: 'Would you like to know more about upcoming events? I can filter them by date, topic, or whether they\'re virtual or in-person.',
      attachment: null
    };
  } else if (responseLC.includes('mentor') || responseLC.includes('mentorship')) {
    return {
      text: 'I can provide more details about mentorship programs, including how to apply, what to expect, and how to prepare for your first meeting with a mentor.',
      attachment: null
    };
  } else {
    return {
      text: 'Could you please provide more details about what specific information you\'re looking for?',
      attachment: null
    };
  }
};

/**
 * Find jobs that are relevant to the user's query
 * 
 * @param {string} message - User's message
 * @param {Array} jobs - Available jobs
 * @returns {Array} - Relevant jobs sorted by relevance
 */
const findRelevantJobs = (message, jobs) => {
  const messageLC = message.toLowerCase();
  
  // Score each job based on relevance to the message
  const scoredJobs = jobs.map(job => {
    let score = 0;
    
    // Check for matches in title and description
    if (job.title.toLowerCase().includes(messageLC)) {
      score += 10;
    }
    
    if (job.description.toLowerCase().includes(messageLC)) {
      score += 5;
    }
    
    // Check for skill matches
    if (job.skills) {
      job.skills.forEach(skill => {
        if (messageLC.includes(skill.toLowerCase())) {
          score += 8;
        }
      });
    }
    
    // Check for location preference
    const locationKeywords = ['remote', 'wfh', 'work from home', 'onsite', 'hybrid'];
    locationKeywords.forEach(keyword => {
      if (messageLC.includes(keyword) && job.location.toLowerCase().includes(keyword)) {
        score += 6;
      }
    });
    
    // Check for job type preference
    const typeKeywords = ['full-time', 'part-time', 'contract', 'freelance', 'internship'];
    typeKeywords.forEach(keyword => {
      if (messageLC.includes(keyword) && job.type.toLowerCase().includes(keyword)) {
        score += 6;
      }
    });
    
    return { ...job, relevanceScore: score };
  });
  
  // Sort by relevance score (descending)
  return scoredJobs
    .filter(job => job.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
};

/**
 * Find events that are relevant to the user's query
 * 
 * @param {string} message - User's message
 * @param {Array} events - Available events
 * @returns {Array} - Relevant events sorted by relevance
 */
const findRelevantEvents = (message, events) => {
  const messageLC = message.toLowerCase();
  
  // Score each event based on relevance to the message
  const scoredEvents = events.map(event => {
    let score = 0;
    
    // Check for matches in title and description
    if (event.title.toLowerCase().includes(messageLC)) {
      score += 10;
    }
    
    if (event.description.toLowerCase().includes(messageLC)) {
      score += 5;
    }
    
    // Check for category matches
    if (messageLC.includes(event.category.toLowerCase())) {
      score += 8;
    }
    
    // Check for format preference
    if ((messageLC.includes('online') || messageLC.includes('virtual')) && event.virtual) {
      score += 6;
    }
    
    if ((messageLC.includes('in-person') || messageLC.includes('onsite')) && !event.virtual) {
      score += 6;
    }
    
    // Prioritize upcoming events
    const eventDate = new Date(event.date);
    const now = new Date();
    const daysUntilEvent = Math.floor((eventDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEvent >= 0 && daysUntilEvent <= 7) {
      score += 4; // Event within the next week
    }
    
    return { ...event, relevanceScore: score };
  });
  
  // Sort by relevance score (descending)
  return scoredEvents
    .filter(event => event.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
};