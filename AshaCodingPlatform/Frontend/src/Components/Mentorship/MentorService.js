// MentorService.js - Service for mentor data operations
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { getMockMentorSessions } from './MentorAuth';

// API base URL - use environment variable if available
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api/v1';

// Hardcoded mentor ID for development
const HARDCODED_MENTOR_ID = "680b677731a8d253d825a34e";

/**
 * Fetch mentor details from the backend
 * @param {string} mentorId - The ID of the mentor to fetch
 * @returns {Promise<Object>} - The mentor details
 */
export const fetchMentorDetails = async (mentorId = HARDCODED_MENTOR_ID) => {
  try {
    const response = await axios.get(`${API_URL}/mentorship/mentors/${mentorId}`);
    return response.data.mentor;
  } catch (error) {
    console.error("Error fetching mentor details:", error);
    toast.error("Failed to load mentor data");
    
    // Fallback to mock data if API fails
    return import('./MentorAuth').then(module => module.DUMMY_MENTOR);
  }
};

/**
 * Fetch mentor sessions from the backend
 * @param {string} mentorId - The ID of the mentor
 * @returns {Promise<Array>} - The mentor's sessions
 */
export const fetchMentorSessions = async (mentorId = HARDCODED_MENTOR_ID) => {
  try {
    // In a real app, this would be an API call like:
    // const response = await axios.get(`${API_URL}/mentorship/mentor-sessions/${mentorId}`);
    // return response.data.sessions;
    
    // For now, use mock data with a delay to simulate network request
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockMentorSessions());
      }, 800);
    });
  } catch (error) {
    console.error("Error fetching mentor sessions:", error);
    toast.error("Failed to load session data");
    return [];
  }
};

/**
 * Generate a consistent meeting link for a session
 * @param {string} sessionId - The session ID
 * @returns {string} - The meeting link
 */
export const generateMeetingLink = (sessionId) => {
  // In a real app, this would be a deterministic link generation
  // that both mentor and mentee would use
  return `https://meet.app/session/${sessionId}`;
};

/**
 * Start a mentorship session
 * @param {string} sessionId - The ID of the session to start
 * @returns {Promise<Object>} - The session with meeting link
 */
export const startMentorshipSession = async (sessionId) => {
  try {
    // In a real app, this would be an API call to start the session
    // const response = await axios.post(`${API_URL}/mentorship/sessions/${sessionId}/start`);
    
    // For now, simulate generating the meeting link
    const meetingLink = generateMeetingLink(sessionId);
    
    // Update the session with the meeting link (mock implementation)
    return {
      sessionId,
      meetingLink,
      startedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error starting session:", error);
    toast.error("Failed to start session");
    throw error;
  }
};

/**
 * Subscribe to real-time session updates (using a polling mechanism for demo)
 * @param {string} mentorId - The mentor ID to monitor
 * @param {function} onSessionsUpdate - Callback when sessions are updated
 * @returns {function} - Function to cancel the subscription
 */
export const subscribeToSessionUpdates = (mentorId, onSessionsUpdate) => {
  // In a real app, this would use WebSockets or Server-Sent Events
  // For the demo, we'll use polling
  const intervalId = setInterval(async () => {
    try {
      const sessions = await fetchMentorSessions(mentorId);
      onSessionsUpdate(sessions);
    } catch (error) {
      console.error("Error in session update subscription:", error);
    }
  }, 30000); // Poll every 30 seconds
  
  // Return cleanup function
  return () => clearInterval(intervalId);
};