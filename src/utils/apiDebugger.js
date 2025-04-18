// src/utils/apiDebugger.js

/**
 * Utility for debugging API issues
 */

// Enable or disable debug mode
const DEBUG_MODE = true;

/**
 * Log API requests with formatted output
 * @param {string} endpoint - API endpoint being called
 * @param {Object} params - Request parameters
 */
export const logApiRequest = (endpoint, params) => {
  if (!DEBUG_MODE) return;
  
  console.group(`🔷 API Request: ${endpoint}`);
  console.log('Parameters:', params);
  console.groupEnd();
};

/**
 * Log API responses with formatted output
 * @param {string} endpoint - API endpoint that was called
 * @param {Object} response - Response data
 */
export const logApiResponse = (endpoint, response) => {
  if (!DEBUG_MODE) return;
  
  console.group(`🔶 API Response: ${endpoint}`);
  console.log('Status:', response.status);
  console.log('Headers:', response.headers);
  console.log('Data:', response.data);
  console.groupEnd();
};

/**
 * Log API errors with formatted output
 * @param {string} endpoint - API endpoint that failed
 * @param {Error} error - Error object
 */
export const logApiError = (endpoint, error) => {
  if (!DEBUG_MODE) return;
  
  console.group(`❌ API Error: ${endpoint}`);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log('Status:', error.response.status);
    console.log('Headers:', error.response.headers);
    console.log('Data:', error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.log('Request was made but no response was received');
    console.log('Request:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log('Error setting up request:', error.message);
  }
  
  console.log('Error config:', error.config);
  console.groupEnd();
};

/**
 * Test the API connection
 * @param {string} apiUrl - API URL to test
 * @param {Object} params - Request parameters
 * @returns {Promise<Object>} - Test results
 */
export const testApiConnection = async (apiUrl, params = {}) => {
  try {
    const fetch = window.fetch;
    
    console.log(`Testing API connection to: ${apiUrl}`);
    
    // Try to fetch with no credentials first to test CORS
    const corsTestResponse = await fetch(`${apiUrl}?test=1`, {
      method: 'GET',
      mode: 'cors',
    }).catch(e => ({ error: e, type: 'cors-preflight' }));
    
    if (corsTestResponse.error) {
      return {
        success: false,
        error: 'CORS Error - API might not allow cross-origin requests',
        details: corsTestResponse.error
      };
    }
    
    // Now try with actual parameters
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    const fullUrl = `${apiUrl}?${queryString}`;
    console.log(`Full URL being tested: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers.entries()]),
      data,
      contentType
    };
  } catch (error) {
    console.error('API test failed:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
};

export default {
  logApiRequest,
  logApiResponse,
  logApiError,
  testApiConnection
};