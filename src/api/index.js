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

// Local storage keys for user database
const LOCAL_USERS_KEY = 'asha_registered_users';

// Helper to get registered users from local storage
const getRegisteredUsers = () => {
  const usersJson = localStorage.getItem(LOCAL_USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

// Helper to save registered users to local storage
const saveRegisteredUsers = (users) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

// Authentication APIs
export const loginUser = async (email, password) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    // Demo validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }
    
    // Get registered users from local storage
    const registeredUsers = getRegisteredUsers();
    
    // Find the user with matching email and password
    const user = registeredUsers.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Return user data (without password) and a demo token
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      token: `demo-token-${Date.now()}`,
      user: userWithoutPassword
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    
    // Validation
    if (!userData.email || !userData.password || !userData.name) {
      throw new Error('Name, email and password are required');
    }
    
    if (!userData.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    
    if (userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    // Get registered users
    const registeredUsers = getRegisteredUsers();
    
    // Check if email already exists
    if (registeredUsers.some(user => user.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('This email is already registered');
    }
    
    // Create new user
    const newUser = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      password: userData.password, // In a real app, this would be hashed
      profilePicture: null,
      createdAt: new Date().toISOString()
    };
    
    // Add to registered users
    registeredUsers.push(newUser);
    saveRegisteredUsers(registeredUsers);
    
    // Return user data (without password) and a demo token
    const { password, ...userWithoutPassword } = newUser;
    
    return {
      token: `demo-token-${Date.now()}`,
      user: userWithoutPassword
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    // Just wait a bit to simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    // Get token - if no token, user is not logged in
    const token = await getAuthToken();
    if (!token) {
      return null;
    }
    
    // In a real app, this would call an API
    // For demo, we'll extract user info from registered users
    const registeredUsers = getRegisteredUsers();
    
    // Simulate getting the user profile
    // In a real app, this would validate the token and return the correct user
    // For demo purposes, we'll just return the most recently added user
    if (registeredUsers.length > 0) {
      const mostRecentUser = [...registeredUsers].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )[0];
      
      // Return without password
      const { password, ...userWithoutPassword } = mostRecentUser;
      return userWithoutPassword;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export default api;