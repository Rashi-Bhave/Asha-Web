// api/eventsApi.js
import { v4 as uuidv4 } from 'uuid';
import PerplexityService from '../services/perplexityService';

/**
 * Fetches events from Perplexity via Groq LLM
 * 
 * @param {string} searchQuery - Search query for events
 * @returns {Promise<Array>} - Array of event objects
 */
export const fetchEventsFromLLM = async (searchQuery) => {
  try {
    console.log('Fetching events from Perplexity with query:', searchQuery);
    
    // Query Perplexity via PerplexityService
    const responseText = await PerplexityService.queryPerplexity(searchQuery);
    console.log('Raw Perplexity response:', responseText);
    
    // Parse the response into structured data
    let eventsData = PerplexityService.parsePerplexityResponse(responseText);
    
    // If no events were found, fallback to default extraction
    if (!eventsData || eventsData.length === 0) {
      console.log('No structured events found, attempting text extraction...');
      eventsData = extractEventsFromText(responseText);
    }
    
    // Ensure each event has the required fields
    const processedEvents = eventsData.map(event => ({
      id: event.id || uuidv4(),
      title: event.title || 'Unnamed Event',
      description: event.description || 'No description available',
      date: formatDate(event.date),
      location: event.location || 'Location not specified',
      virtual: event.virtual || false,
      category: event.category || 'Event',
      image: event.image || 'https://picsum.photos/id/3/400/200', // Placeholder image
      registrationUrl: event.registrationUrl || '#',
      price: event.price || 'Contact organizer for pricing',
      speakers: event.speakers || []
    }));
    
    return processedEvents;
  } catch (error) {
    console.error('Error fetching events from LLM:', error);
    // Fall back to mock data if LLM call fails
    return fetchMockEvents();
  }
};

/**
 * Attempts to extract event data from text when JSON parsing fails
 * 
 * @param {string} text - Text response from LLM
 * @returns {Array} - Array of event objects
 */
const extractEventsFromText = (text) => {
  const events = [];
  
  // Look for patterns like "Event: {title}" or "Title: {title}"
  const eventBlocks = text.split(/(?=Event \d+:|Title:)/);
  
  eventBlocks.forEach((block, index) => {
    if (!block.trim()) return;
    
    const event = {
      id: uuidv4(),
      title: '',
      description: '',
      date: '',
      location: '',
      virtual: false,
      category: 'Event',
      registrationUrl: '#',
      price: 'Contact organizer for pricing',
      speakers: []
    };
    
    // Extract title
    const titleMatch = block.match(/(?:Event \d+:|Title:)\s*([^\n]+)/);
    if (titleMatch) {
      event.title = titleMatch[1].trim();
    }
    
    // Extract date
    const dateMatch = block.match(/(?:Date:|When:)\s*([^\n]+)/);
    if (dateMatch) {
      event.date = dateMatch[1].trim();
    }
    
    // Extract location
    const locationMatch = block.match(/(?:Location:|Where:|Venue:)\s*([^\n]+)/);
    if (locationMatch) {
      event.location = locationMatch[1].trim();
      event.virtual = locationMatch[1].toLowerCase().includes('virtual') || 
                      locationMatch[1].toLowerCase().includes('online');
    }
    
    // Extract description
    const descMatch = block.match(/(?:Description:|About:)\s*([^\n]+(?:\n[^\n]+)*)/);
    if (descMatch) {
      event.description = descMatch[1].trim();
    }
    
    // Extract registration URL
    const urlMatch = block.match(/(?:Registration:|URL:|Website:|Link:)\s*([^\s\n]+)/);
    if (urlMatch) {
      event.registrationUrl = urlMatch[1].trim();
    }
    
    // Extract price
    const priceMatch = block.match(/(?:Price:|Cost:|Fee:)\s*([^\n]+)/);
    if (priceMatch) {
      event.price = priceMatch[1].trim();
    }
    
    // Extract category
    const categoryMatch = block.match(/(?:Category:|Type:)\s*([^\n]+)/);
    if (categoryMatch) {
      event.category = categoryMatch[1].trim();
    }
    
    events.push(event);
  });
  
  return events.length > 0 ? events : generateDefaultEvents();
};

/**
 * Helper function to format dates
 * 
 * @param {string} dateString - Date string from LLM
 * @returns {string} - Formatted date
 */
const formatDate = (dateString) => {
  if (!dateString) {
    // Default to future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    return futureDate.toISOString();
  }
  
  // Check if it's already in ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    return dateString;
  }
  
  // Try to parse with Date constructor
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (e) {
    console.warn('Error parsing date string:', dateString);
  }
  
  // Return as is if we can't parse it
  return dateString;
};

/**
 * Generate default events when LLM fails to provide structured data
 */
const generateDefaultEvents = () => {
  return [
    {
      id: 1,
      title: "Women in Tech Conference",
      description: "Annual conference bringing together women leaders in technology for networking and career development.",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Bangalore Tech Hub",
      virtual: false,
      category: "Conference",
      image: "https://picsum.photos/id/3/400/200",
      registrationUrl: "https://example.com/events/1",
      price: "₹1,000",
      speakers: [
        { name: "Priya Sharma", role: "CTO, TechStart" }
      ]
    },
    {
      id: 2,
      title: "Code for Change Hackathon",
      description: "48-hour hackathon focused on creating tech solutions for social good. Open to all skill levels.",
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Virtual",
      virtual: true,
      category: "Hackathon",
      image: "https://picsum.photos/id/96/400/200",
      registrationUrl: "https://example.com/events/2",
      price: "Free",
      speakers: []
    }
  ];
};

/**
 * Fetches mock events when all else fails
 * 
 * @returns {Promise<Array>} - Array of event objects
 */
export const fetchMockEvents = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Current date for relative date calculations
  const currentDate = new Date();
  
  // Mock event data
  const events = [
    {
      id: 1,
      title: 'Women in Tech Leadership Summit',
      description: 'Join industry leaders for a day of inspiration, learning, and networking. This summit features keynote speakers, panel discussions, and workshops focused on advancing women in technology leadership roles.',
      date: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      location: 'Taj Bangalore, MG Road',
      virtual: false,
      category: 'Conference',
      image: 'https://picsum.photos/id/3/400/200',
      registrationUrl: 'https://example.com/events/register/1',
      price: '₹2,000',
      speakers: [
        { name: 'Priya Sharma', role: 'CTO, TechInnovate', image: 'https://randomuser.me/api/portraits/women/11.jpg' },
        { name: 'Anita Desai', role: 'VP Engineering, GlobalTech', image: 'https://randomuser.me/api/portraits/women/12.jpg' }
      ]
    },
    {
      id: 2,
      title: 'Returning to Work: Strategies for Success',
      description: 'This virtual workshop is designed for women returning to the workforce after a career break. Learn practical strategies for updating your skills, rebuilding confidence, navigating the job market, and successfully transitioning back to professional life.',
      date: new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      location: 'Online',
      virtual: true,
      category: 'Workshop',
      image: 'https://picsum.photos/id/96/400/200',
      registrationUrl: 'https://example.com/events/register/2',
      price: 'Free',
      speakers: [
        { name: 'Meera Kapoor', role: 'Career Coach', image: 'https://randomuser.me/api/portraits/women/13.jpg' }
      ]
    },
    {
      id: 3,
      title: 'Financial Planning for Career Transitions',
      description: 'Learn essential financial planning strategies to support your career transitions, whether you\'re changing industries, starting a business, or taking time off. This webinar covers budgeting, saving, investing, and managing financial risks.',
      date: new Date(currentDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      location: 'Online',
      virtual: true,
      category: 'Webinar',
      image: 'https://picsum.photos/id/20/400/200',
      registrationUrl: 'https://example.com/events/register/3',
      price: 'Free',
      speakers: [
        { name: 'Neha Singh', role: 'Financial Advisor', image: 'https://randomuser.me/api/portraits/women/14.jpg' }
      ]
    }
  ];
  
  return events;
};

// Re-export the old functions for backward compatibility
export const fetchEvents = fetchMockEvents;