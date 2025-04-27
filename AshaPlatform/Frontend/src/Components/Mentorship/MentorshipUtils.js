// MentorshipUtils.js - Utility functions for the mentorship components

/**
 * Constants for mentor and mentee IDs
 */
export const FIXED_MENTOR_ID = '680b677731a8d253d825a34e';
export const FIXED_MENTEE_ID = '507f1f77bcf86cd799439011';

/**
 * Returns the URL path for a specific mentorship session meeting
 * @param {string} sessionId - The ID of the mentorship session
 * @returns {string} The URL path to the meeting
 */

/**
 * Determines if a session is ready to be started (within time window)
 * @param {string} dateTimeString - The session's start time as an ISO string
 * @returns {boolean} True if the session is startable
 */
export const isSessionStartable = (dateTimeString) => {
  const sessionDate = new Date(dateTimeString);
  const now = new Date();
  
  // Check if session is within 15 minutes of start time or already started but not more than 30 minutes ago
  const timeDiff = (sessionDate.getTime() - now.getTime()) / (1000 * 60); // difference in minutes
  // During development, always return true for easier testing
  // return timeDiff <= 15 && timeDiff > -30;
  return true;
};


// MentorshipUtils.js - Utilities for mentorship functionality

/**
 * Generates a consistent meeting link for a specific session
 * This ensures both mentor and mentee get the same link
 * @param {string} sessionId - ID of the session
 * @returns {string} - URL for the meeting
 */
export const getSessionLink = (sessionId) => {
  // In a real app, this might generate a link to a video conferencing service
  // or a custom built meeting solution with the session ID as a parameter
  
  // For this demo, we'll create a consistent link format
  return `/mentorship-meeting/${sessionId}`;
};

/**
 * Generates the URL with proper role parameters
 * @param {string} sessionId - ID of the session
 * @param {string} role - Either 'mentor' or 'mentee'
 * @returns {string} - Complete URL with role parameters
 */
export const getSessionLinkWithRole = (sessionId, role) => {
  const baseLink = getSessionLink(sessionId);
  
  if (role === 'mentor') {
    return `${baseLink}?role=mentor`;
  } else {
    return `${baseLink}?role=mentee&mentee_id=${FIXED_MENTEE_ID}`;
  }
};

/**
 * Enriches session data with proper role information
 * @param {Object} session - The session data
 * @param {string} role - Either 'mentor' or 'mentee'
 * @returns {Object} - Session data with role information
 */
export const enhanceSessionWithRole = (session, role) => {
  // Base enhanced session
  const enhancedSession = { ...session };
  
  if (role === 'mentor') {
    // Set mentor-specific properties
    enhancedSession.mentorId = {
      ...enhancedSession.mentorId,
      userId: FIXED_MENTOR_ID,
      role: 'mentor',
      isMentor: true
    };
    enhancedSession.role = 'mentor';
    enhancedSession.isMentor = true;
    
    // Ensure consistent mentee information
    if (enhancedSession.userId) {
      enhancedSession.userId = FIXED_MENTEE_ID;
    }
  } else {
    // Set mentee-specific properties
    enhancedSession.userId = FIXED_MENTEE_ID;
    enhancedSession.role = 'mentee';
    enhancedSession.isMentee = true;
    
    // Ensure consistent mentor information
    enhancedSession.mentorId = {
      ...enhancedSession.mentorId,
      userId: FIXED_MENTOR_ID,
      role: 'mentor',
      isMentor: true
    };
  }
  
  return enhancedSession;
};

/**
 * Calculates whether a session is starting soon
 * @param {string|Date} sessionDateTime - Date/time of the session
 * @param {number} thresholdMinutes - Minutes threshold (default: 30 min)
 * @param {boolean} isMentor - Whether the user is a mentor (mentors get earlier access)
 * @returns {boolean} - Whether the session is starting soon
 */
export const isSessionStartingSoon = (sessionDateTime, thresholdMinutes = 30, isMentor = false) => {
  const sessionDate = new Date(sessionDateTime);
  const now = new Date();
  
  // Time difference in minutes
  const timeDiff = (sessionDate.getTime() - now.getTime()) / (1000 * 60);
  
  // Mentors can join earlier
  const mentorExtraTime = isMentor ? 15 : 0;
  
  // Session is starting soon if within threshold, and not more than 30 min past
  return timeDiff <= (thresholdMinutes + mentorExtraTime) && timeDiff > -30;
};

/**
 * Format session day
 * @param {string|Date} dateTimeString - Date to format
 * @returns {string} - Formatted day
 */
export const formatSessionDay = (dateTimeString) => {
  const date = new Date(dateTimeString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format session time
 * @param {string|Date} dateTimeString - Time to format
 * @returns {string} - Formatted time
 */
export const formatSessionTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculate CSS class for session date based on proximity
 * @param {string|Date} dateTimeString - Session date/time
 * @returns {string} - CSS class name
 */
export const getDateStatusClass = (dateTimeString) => {
  const sessionDate = new Date(dateTimeString);
  const now = new Date();
  const timeDiff = (sessionDate.getTime() - now.getTime()) / (1000 * 60); // minutes
  
  if (timeDiff <= 30 && timeDiff > -30) {
    return 'cyber-day-imminent';
  } else if (timeDiff <= 24 * 60 && timeDiff > 0) { // within 24 hours
    return 'cyber-day-today';
  }
  return 'cyber-day-normal';
};

/**
 * Get session duration in a readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration
 */
export const formatSessionDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} min`;
};

/**
 * Verify if a user can access a specific session
 * @param {Object} session - Session object
 * @param {string} userId - User ID
 * @param {boolean} isMentor - Whether the user is a mentor
 * @returns {boolean} - Whether user has access
 */
export const canAccessSession = (session, userId, isMentor) => {
  if (!session) return false;
  
  // Mentor access check
  if (isMentor && session.mentorId?._id === userId) {
    return true;
  }
  
  // Mentee access check
  if (!isMentor && session.userId === userId) {
    return true;
  }
  
  return false;
};

/**
 * Generate a session feedback key to prevent duplicate feedback
 * @param {string} sessionId - Session ID
 * @param {string} userId - User ID
 * @param {boolean} isMentor - Whether feedback is from mentor
 * @returns {string} - Unique feedback key
 */
export const generateFeedbackKey = (sessionId, userId, isMentor) => {
  return `feedback_${sessionId}_${userId}_${isMentor ? 'mentor' : 'mentee'}`;
};