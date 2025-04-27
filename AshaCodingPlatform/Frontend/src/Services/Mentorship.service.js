import axios from 'axios';

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get all mentors
 * @returns {Promise} Promise with mentors data
 */
export const getAllMentors = async () => {
  try {
    const response = await axios.get(`${API_URL}/mentorship/mentors`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mentors:', error);
    throw error;
  }
};

/**
 * Get all mentorship programs
 * @returns {Promise} Promise with programs data
 */
export const getAllPrograms = async () => {
  try {
    const response = await axios.get(`${API_URL}/mentorship/programs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching programs:', error);
    throw error;
  }
};

/**
 * Get user's enrolled programs
 * @returns {Promise} Promise with enrolled programs data
 */
export const getEnrolledPrograms = async () => {
  try {
    const response = await axios.get(`${API_URL}/mentorship/enrolled`);
    return response.data;
  } catch (error) {
    console.error('Error fetching enrolled programs:', error);
    throw error;
  }
};

/**
 * Get user's booked sessions
 * @returns {Promise} Promise with booked sessions data
 */
export const getBookedSessions = async () => {
  try {
    const response = await axios.get(`${API_URL}/mentorship/sessions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booked sessions:', error);
    throw error;
  }
};

/**
 * Get user's saved mentors
 * @returns {Promise} Promise with saved mentors data
 */
export const getSavedMentors = async () => {
  try {
    const response = await axios.get(`${API_URL}/mentorship/saved/mentors`);
    return response.data;
  } catch (error) {
    console.error('Error fetching saved mentors:', error);
    throw error;
  }
};

/**
 * Get user's saved programs
 * @returns {Promise} Promise with saved programs data
 */
export const getSavedPrograms = async () => {
  try {
    const response = await axios.get(`${API_URL}/mentorship/saved/programs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching saved programs:', error);
    throw error;
  }
};

/**
 * Save a mentor to favorites
 * @param {number} mentorId - The ID of the mentor to save
 * @returns {Promise} Promise with success message
 */
export const saveMentorToFavorites = async (mentorId) => {
  try {
    const response = await axios.post(`${API_URL}/mentorship/save/mentor/${mentorId}`);
    return response.data;
  } catch (error) {
    console.error('Error saving mentor:', error);
    throw error;
  }
};

/**
 * Save a program to favorites
 * @param {number} programId - The ID of the program to save
 * @returns {Promise} Promise with success message
 */
export const saveProgramToFavorites = async (programId) => {
  try {
    const response = await axios.post(`${API_URL}/mentorship/save/program/${programId}`);
    return response.data;
  } catch (error) {
    console.error('Error saving program:', error);
    throw error;
  }
};

/**
 * Remove a mentor from favorites
 * @param {number} mentorId - The ID of the mentor to remove
 * @returns {Promise} Promise with success message
 */
export const removeSavedMentor = async (mentorId) => {
  try {
    const response = await axios.delete(`${API_URL}/mentorship/unsave/mentor/${mentorId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing mentor:', error);
    throw error;
  }
};

/**
 * Remove a program from favorites
 * @param {number} programId - The ID of the program to remove
 * @returns {Promise} Promise with success message
 */
export const removeSavedProgram = async (programId) => {
  try {
    const response = await axios.delete(`${API_URL}/mentorship/unsave/program/${programId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing program:', error);
    throw error;
  }
};

/**
 * Book a session with a mentor
 * @param {Object} sessionData - The session data (mentorId, date, topic)
 * @returns {Promise} Promise with the created session
 */
export const bookMentorSession = async (sessionData) => {
  try {
    const response = await axios.post(`${API_URL}/mentorship/book`, sessionData);
    return response.data;
  } catch (error) {
    console.error('Error booking session:', error);
    throw error;
  }
};

/**
 * Apply to a program
 * @param {number} programId - The ID of the program to apply to
 * @returns {Promise} Promise with application response
 */
export const applyToProgram = async (programId) => {
  try {
    const response = await axios.post(`${API_URL}/mentorship/apply/${programId}`);
    return response.data;
  } catch (error) {
    console.error('Error applying to program:', error);
    throw error;
  }
};

/**
 * Get mentor by ID
 * @param {number} mentorId - The ID of the mentor
 * @returns {Promise} Promise with mentor data
 */
export const getMentorById = async (mentorId) => {
  try {
    const response = await axios.get(`${API_URL}/mentorship/mentors/${mentorId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mentor:', error);
    throw error;
  }
};

/**
 * Get program by ID
 * @param {number} programId - The ID of the program
 * @returns {Promise} Promise with program data
 */
export const getProgramById = async (programId) => {
  try {
    const response = await axios.get(`${API_URL}/mentorship/programs/${programId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching program:', error);
    throw error;
  }
};

/**
 * Get mentors by category
 * @param {string} category - The category to filter by
 * @returns {Promise} Promise with mentors data
 */
export const getMentorsByCategory = async (category) => {
  try {
    const response = await axios.get(`${API_URL}/mentorship/mentors/category/${category}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mentors by category:', error);
    throw error;
  }
};

/**
 * Get programs by category
 * @param {string} category - The category to filter by
 * @returns {Promise} Promise with programs data
 */
export const getProgramsByCategory = async (category) => {
  try {
    const response = await axios.get(`${API_URL}/mentorship/programs/category/${category}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching programs by category:', error);
    throw error;
  }
};

/**
 * Search mentors and programs
 * @param {string} query - The search query
 * @returns {Promise} Promise with search results
 */
export const searchMentorshipContent = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/mentorship/search?q=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error searching mentorship content:', error);
    throw error;
  }
};