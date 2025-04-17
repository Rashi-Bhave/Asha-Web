// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

// Services
import { getUserProfile, loginUser, registerUser, logoutUser } from '../api/index';
import { 
  saveAuthToken, 
  getAuthToken, 
  removeAuthToken, 
  saveUserData, 
  getUserData, 
  clearAllStorage 
} from '../services/storageService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check for existing auth token on initial render
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await getAuthToken();
        
        if (token) {
          // Fetch user profile with token
          const userProfile = await getUserProfile();
          if (userProfile) {
            setUser(userProfile);
            // Also save user data to storage for persistence
            await saveUserData(userProfile);
          }
        } else {
          // Try to get user from storage as fallback
          const storedUser = await getUserData();
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (e) {
        console.error('Authentication error:', e);
        // Clear invalid token and data
        await clearAllStorage();
      } finally {
        setLoading(false);
      }
    };
    
    bootstrapAsync();
  }, []);
  
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await loginUser(email, password);
      
      // Save auth token securely
      await saveAuthToken(response.token);
      
      // Set user data
      setUser(response.user);
      
      // Also save user data to storage
      await saveUserData(response.user);
      
      return { success: true, user: response.user };
    } catch (e) {
      console.error('Login error:', e);
      setError(e.message || 'Invalid email or password. Please try again.');
      return { success: false, error: e.message || 'Invalid email or password. Please try again.' };
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await registerUser(userData);
      
      // Save auth token securely
      await saveAuthToken(response.token);
      
      // Set user data
      setUser(response.user);
      
      // Also save user data to storage
      await saveUserData(response.user);
      
      return { success: true, user: response.user };
    } catch (e) {
      console.error('Registration error:', e);
      setError(e.message || 'Registration failed. This email may already be in use.');
      return { success: false, error: e.message || 'Registration failed. This email may already be in use.' };
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    setLoading(true);
    
    try {
      // Call logout API
      await logoutUser();
      
      // Clear all stored data
      await clearAllStorage();
      
      // Clear user state
      setUser(null);
      
      return { success: true };
    } catch (e) {
      console.error('Logout error:', e);
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  };
  
  const updateUserProfile = async (updatedData) => {
    setLoading(true);
    
    try {
      // Would call API to update profile
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      
      // Also update in storage
      await saveUserData(updatedUser);
      
      return { success: true };
    } catch (e) {
      console.error('Profile update error:', e);
      setError(e.message || 'An error occurred while updating profile.');
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUserProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};