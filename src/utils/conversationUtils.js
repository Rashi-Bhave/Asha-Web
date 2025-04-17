// Placeholder content for conversationUtils.js
// utils/conversationUtils.js
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique ID for messages
 * 
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return uuidv4();
};

/**
 * Formats a timestamp for display in chat
 * 
 * @param {Date} date - Date object or timestamp
 * @returns {string} - Formatted time string
 */
export const formatTimestamp = (date) => {
  if (!date) return '';
  const timestamp = new Date(date);
  return timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Truncates a string to a specific length
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export default {
  generateId,
  formatTimestamp,
  truncateText
};