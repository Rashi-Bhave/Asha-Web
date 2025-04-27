import axios from 'axios';
import { toast } from 'react-hot-toast';

// API base URL
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';

/**
 * Service class for all interview-related API calls
 */
class InterviewService {
  /**
   * Generate interview questions based on parameters
   * @param {Object} params - Question generation parameters
   * @returns {Promise<Object>} - Generated questions
   */
  static async generateQuestions(params) {
    try {
      const response = await axios.post(`${API_URL}/interview/generate-questions`, params);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error generating interview questions');
      throw error;
    }
  }

  /**
   * Generate custom interview questions
   * @param {Object} params - Custom question generation parameters
   * @returns {Promise<Object>} - Generated custom questions
   */
  static async generateCustomQuestions(params) {
    try {
      const response = await axios.post(`${API_URL}/interview/custom-questions`, params);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error generating custom interview questions');
      throw error;
    }
  }

  /**
   * Analyze interview response
   * @param {Object} params - Response analysis parameters
   * @returns {Promise<Object>} - Analysis results
   */
  static async analyzeResponse(params) {
    try {
      const response = await axios.post(`${API_URL}/interview/analyze-response`, params);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error analyzing interview response');
      throw error;
    }
  }

  /**
   * Generate overall interview feedback
   * @param {Object} params - Overall feedback parameters
   * @returns {Promise<Object>} - Overall feedback results
   */
  static async generateOverallFeedback(params) {
    try {
      const response = await axios.post(`${API_URL}/interview/overall-feedback`, params);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error generating overall feedback');
      throw error;
    }
  }

  /**
   * Analyze video data for non-verbal cues
   * @param {Object} params - Video data parameters
   * @returns {Promise<Object>} - Video analysis results
   */
  static async analyzeVideoData(params) {
    try {
      const response = await axios.post(`${API_URL}/interview/analyze-video`, params);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error analyzing video data');
      throw error;
    }
  }

  /**
   * Analyze audio data for voice characteristics
   * @param {Object} params - Audio data parameters
   * @returns {Promise<Object>} - Audio analysis results
   */
  static async analyzeAudioData(params) {
    try {
      const response = await axios.post(`${API_URL}/interview/analyze-audio`, params);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error analyzing audio data');
      throw error;
    }
  }

  /**
   * Get user's interview history
   * @returns {Promise<Object>} - User's interview history
   */
  static async getInterviewHistory() {
    try {
      const response = await axios.get(`${API_URL}/interview/sessions`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error fetching interview history');
      throw error;
    }
  }

  /**
   * Get interview session details
   * @param {string} sessionId - Interview session ID
   * @returns {Promise<Object>} - Session details
   */
  static async getInterviewSession(sessionId) {
    try {
      const response = await axios.get(`${API_URL}/interview/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error fetching interview session');
      throw error;
    }
  }

  /**
   * Get all custom interviews for the user
   * @returns {Promise<Object>} - Custom interviews
   */
  static async getCustomInterviews() {
    try {
      const response = await axios.get(`${API_URL}/interview/custom-interviews`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error fetching custom interviews');
      throw error;
    }
  }

  /**
   * Get a specific custom interview
   * @param {string} id - Custom interview ID
   * @returns {Promise<Object>} - Custom interview details
   */
  static async getCustomInterview(id) {
    try {
      const response = await axios.get(`${API_URL}/interview/custom-interviews/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error fetching custom interview');
      throw error;
    }
  }

  /**
   * Get interview question bank
   * @param {Object} filters - Optional filters for questions
   * @returns {Promise<Object>} - Question bank data
   */
  static async getQuestionBank(filters = {}) {
    try {
      const response = await axios.get(`${API_URL}/interview/question-bank`, { 
        params: filters 
      });
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error fetching question bank');
      throw error;
    }
  }

  /**
   * Add question to the question bank
   * @param {Object} question - The question data
   * @returns {Promise<Object>} - Added question
   */
  static async addQuestion(question) {
    try {
      const response = await axios.post(`${API_URL}/interview/question-bank/add`, question);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error adding question');
      throw error;
    }
  }

  /**
   * Save a question to user's saved list
   * @param {Object} data - Save question data
   * @returns {Promise<Object>} - Saved question data
   */
  static async saveQuestion(data) {
    try {
      const response = await axios.post(`${API_URL}/interview/save-question`, data);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error saving question');
      throw error;
    }
  }

  /**
   * Get user's saved questions
   * @returns {Promise<Object>} - Saved questions
   */
  static async getSavedQuestions() {
    try {
      const response = await axios.get(`${API_URL}/interview/saved-questions`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error fetching saved questions');
      throw error;
    }
  }

  /**
   * Remove a question from saved list
   * @param {string} id - Saved question ID
   * @returns {Promise<Object>} - Response data
   */
  static async removeSavedQuestion(id) {
    try {
      const response = await axios.delete(`${API_URL}/interview/saved-questions/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error removing saved question');
      throw error;
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - The error object
   * @param {string} defaultMessage - Default error message
   * @private
   */
  static _handleError(error, defaultMessage) {
    console.error(`${defaultMessage}:`, error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data?.message || defaultMessage;
      toast.error(errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('No response from server. Please check your connection.');
    } else {
      // Something happened in setting up the request
      toast.error(defaultMessage);
    }
  }
}

export default InterviewService;