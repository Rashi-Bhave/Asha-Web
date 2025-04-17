import CryptoJS from 'crypto-js';

// In a real app, this would be an environment variable
// and never hardcoded in the source code
const ENCRYPTION_KEY = 'asha-secure-encryption-key-75391';

/**
 * Encrypts data using AES encryption
 * 
 * @param {string} data - Data to encrypt
 * @returns {string} - Encrypted data
 */
export const encryptData = (data) => {
  try {
    if (!data) return '';
    
    const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

/**
 * Decrypts AES encrypted data
 * 
 * @param {string} encryptedData - Encrypted data
 * @returns {string} - Decrypted data
 */
export const decryptData = (encryptedData) => {
  try {
    if (!encryptedData) return '';
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

/**
 * Generates a secure random string
 * 
 * @param {number} length - Length of the random string
 * @returns {Promise<string>} - Random string
 */
export const generateRandomString = async (length = 16) => {
  try {
    // For web, we'll use a simpler implementation
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Error generating random string:', error);
    
    // Fallback method
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }
};

/**
 * Creates a SHA-256 hash of the input
 * 
 * @param {string} input - String to hash
 * @returns {Promise<string>} - Hashed string
 */
export const hashString = async (input) => {
  try {
    // For web, we'll use the SubtleCrypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    
    // Convert buffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Error hashing string:', error);
    
    // Fallback to CryptoJS
    return CryptoJS.SHA256(input).toString();
  }
};

/**
 * Validates and sanitizes user input to prevent security issues
 * 
 * @param {string} input - User input
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  
  // Basic sanitization
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim();
};
