// Frontend/src/Services/Event.service.js
import axios from 'axios';

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';

/**
 * Get events with filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise} Promise with events data
 */
export const getEvents = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/events`, { params: filters });
    
    // Add semanticSearch flag to the response if present in API response
    if (response.data.semanticSearch !== undefined) {
      return {
        ...response.data,
        semanticSearch: response.data.semanticSearch
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

/**
 * Get event by ID
 * @param {string} eventId - Event ID
 * @returns {Promise} Promise with event data
 */
export const getEventById = async (eventId) => {
  try {
    const response = await axios.get(`${API_URL}/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

/**
 * Save an event
 * @param {string} eventId - Event ID
 * @returns {Promise} Promise with response data
 */
export const saveEvent = async (eventId) => {
  try {
    const response = await axios.post(`${API_URL}/events/save/${eventId}`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error saving event:', error);
    throw error;
  }
};

/**
 * Unsave an event
 * @param {string} eventId - Event ID
 * @returns {Promise} Promise with response data
 */
export const unsaveEvent = async (eventId) => {
  try {
    const response = await axios.delete(`${API_URL}/events/save/${eventId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error unsaving event:', error);
    throw error;
  }
};

/**
 * Register for an event
 * @param {string} eventId - Event ID
 * @returns {Promise} Promise with response data
 */
export const registerForEvent = async (eventId) => {
  try {
    const response = await axios.post(`${API_URL}/events/register/${eventId}`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error registering for event:', error);
    throw error;
  }
};

/**
 * Get user's registered events
 * @returns {Promise} Promise with events data
 */
export const getRegisteredEvents = async () => {
  try {
    const response = await axios.get(`${API_URL}/events/user/registered`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching registered events:', error);
    throw error;
  }
};

/**
 * Get user's saved events
 * @returns {Promise} Promise with events data
 */
export const getSavedEvents = async () => {
  try {
    const response = await axios.get(`${API_URL}/events/user/saved`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching saved events:', error);
    throw error;
  }
};

/**
 * Create a new event (admin only)
 * @param {Object} eventData - Event data
 * @returns {Promise} Promise with response data
 */
export const createEvent = async (eventData) => {
  try {
    const response = await axios.post(`${API_URL}/events`, eventData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

/**
 * Get mock events for development
 * @returns {Promise} Promise with mock events
 */
export const getMockEvents = async () => {
  try {
    // For development/testing when API is not available
    const currentDate = new Date();
    
    return {
      success: true,
      events: [
        {
          id: '1',
          title: 'Women in Tech Leadership Summit',
          description: 'Join industry leaders for a day of inspiration, learning, and networking. This summit features keynote speakers, panel discussions, and workshops focused on advancing women in technology leadership roles.',
          date: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          location: 'Taj Bangalore, MG Road',
          virtual: false,
          category: 'Conference',
          image: 'https://picsum.photos/id/3/400/200',
          registrationUrl: 'https://example.com/events/register/1',
          price: '₹2,000',
          speakers: [
            { name: 'Priya Sharma', role: 'CTO, TechInnovate', image: 'https://randomuser.me/api/portraits/women/11.jpg' },
            { name: 'Anita Desai', role: 'VP Engineering, GlobalTech', image: 'https://randomuser.me/api/portraits/women/12.jpg' }
          ],
          organizer: 'Women in Tech Foundation',
          forWomen: true
        },
        {
          id: '2',
          title: 'Returning to Work: Strategies for Success',
          description: 'This virtual workshop is designed for women returning to the workforce after a career break. Learn practical strategies for updating your skills, rebuilding confidence, navigating the job market, and successfully transitioning back to professional life.',
          date: new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          location: 'Online',
          virtual: true,
          category: 'Workshop',
          image: 'https://picsum.photos/id/96/400/200',
          registrationUrl: 'https://example.com/events/register/2',
          price: 'Free',
          speakers: [
            { name: 'Meera Kapoor', role: 'Career Coach', image: 'https://randomuser.me/api/portraits/women/13.jpg' }
          ],
          organizer: 'Tech Moms Network',
          forWomen: true
        },
        {
          id: '3',
          title: 'Hackathon: Build for Social Impact',
          description: 'A 48-hour hackathon focused on creating tech solutions for social good. Open to all skill levels, with mentors available throughout the event to help teams develop their ideas.',
          date: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          location: 'Tech Park, Electronic City',
          virtual: false,
          category: 'Hackathon',
          image: 'https://picsum.photos/id/20/400/200',
          registrationUrl: 'https://example.com/events/register/3',
          price: 'Free',
          speakers: [],
          organizer: 'Code for Change',
          forWomen: false
        }
      ]
    };
  } catch (error) {
    console.error('Error getting mock events:', error);
    throw error;
  }
};