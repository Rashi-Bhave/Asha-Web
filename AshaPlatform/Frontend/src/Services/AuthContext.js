// src/Contexts/AuthContext.js
import React, { createContext, useContext, useState } from 'react';

// Create the auth context
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({
    id: 'dummy-user-id-123', // Mock user ID
    name: 'Demo User',
    email: 'demo@example.com'
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Mock authentication functions
  const login = () => {
    setIsAuthenticated(true);
    setCurrentUser({
      id: 'dummy-user-id-123',
      name: 'Demo User',
      email: 'demo@example.com'
    });
    return Promise.resolve();
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    return Promise.resolve();
  };

  const value = {
    currentUser,
    isAuthenticated,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};