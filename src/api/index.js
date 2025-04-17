// api/index.js
import axios from 'axios';
import { getAuthToken } from '../services/storageService';

// Base API URL
const API_BASE_URL = 'https://api.jobsforher.org/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    // For auth endpoints, don't add token
    if (config.url.includes('/auth')) {
      return config;
    }
    
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (expired token)
    if (error.response && error.response.status === 401) {
      // Could dispatch an action to logout user
      console.error('Unauthorized - Token expired or invalid');
    }
    
    return Promise.reject(error);
  }
);

// Authentication APIs
export const loginUser = async (email, password) => {
  try {
    // In a real app, this would call the actual API
    // const response = await api.post('/auth/login', { email, password });
    // return response.data;
    
    // For demo purposes, simulate API response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    // Return demo user data
    return {
      token: 'demo-token-12345',
      user: {
        id: '123',
        name: 'Demo User',
        email: email,
        profilePicture: null,
      }
    };
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    // In a real app, this would call the actual API
    // const response = await api.post('/auth/register', userData);
    // return response.data;
    
    // For demo purposes, simulate API response
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Demo validation
    if (!userData.email || !userData.password || !userData.name) {
      throw new Error('Name, email and password are required');
    }
    
    if (!userData.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    
    if (userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    // Return demo user data
    return {
      token: 'demo-token-12345',
      user: {
        id: '123',
        name: userData.name,
        email: userData.email,
        profilePicture: null,
      }
    };
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Registration failed');
    }
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    // In a real app, this would call the actual API
    // const response = await api.post('/auth/logout');
    // return response.data;
    
    // For demo purposes, just wait a bit
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true };
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Logout failed');
    }
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    // In a real app, this would call the actual API
    // const response = await api.get('/user/profile');
    // return response.data;
    
    // For demo purposes, simulate API response
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return demo user data
    return {
      id: '123',
      name: 'Demo User',
      email: 'demo@example.com',
      profilePicture: null,
    };
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to get user profile');
    }
    throw error;
  }
};

export default api;

// api/jobsApi.js


