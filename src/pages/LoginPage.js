// pages/LoginPage.js
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { sanitizeInput } from '../services/encryptionService';

const LoginPage = ({ onNavigate }) => {
  const { login, register, loading, isAuthenticated, user } = useContext(AuthContext);
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [redirecting, setRedirecting] = useState(false);
  
  // Redirect to chat page if authentication is successful
  useEffect(() => {
    if (isAuthenticated && user) {
      setRedirecting(true);
      // Force navigation to chat after a short delay
      const timer = setTimeout(() => {
        onNavigate('chat');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, onNavigate]);
  
  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Name validation (only for register)
    if (!isLogin && !name) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isLogin) {
        // Login attempt
        const result = await login(sanitizeInput(email), password);
        if (!result.success) {
          setNotification({ 
            show: true, 
            message: result.error || 'Invalid email or password. Please try again.', 
            type: 'error' 
          });
        } else {
          // Show success message
          setNotification({
            show: true,
            message: 'Login successful! Redirecting to dashboard...',
            type: 'success'
          });
          // Force redirection - better handling for any state issues
          setTimeout(() => {
            onNavigate('chat');
          }, 1000);
        }
      } else {
        // Register attempt
        const userData = {
          name: sanitizeInput(name),
          email: sanitizeInput(email),
          password,
        };
        
        const result = await register(userData);
        if (!result.success) {
          setNotification({ 
            show: true, 
            message: result.error || 'Registration failed. This email may already be in use.', 
            type: 'error' 
          });
        } else {
          // Show success notification
          setNotification({
            show: true,
            message: 'Account created successfully! Redirecting to dashboard...',
            type: 'success'
          });
          // Force redirection - better handling for any state issues
          setTimeout(() => {
            onNavigate('chat');
          }, 1000);
        }
      }
    } catch (error) {
      setNotification({ 
        show: true, 
        message: error.message || 'An error occurred. Please try again.', 
        type: 'error' 
      });
    }
  };
  
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setNotification({ show: false, message: '', type: '' });
  };
  
  const handleBack = () => {
    onNavigate('welcome');
  };
  
  if (redirecting) {
    return (
      <div className="app-loading">
        <div className="loader"></div>
        <p>Redirecting to chat...</p>
      </div>
    );
  }
  
  return (
    <div className="login-page">
      <div className="login-container">
        <button className="back-button" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        
        <div className="login-header">
          <h2 className="login-title">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className="login-subtitle">
            {isLogin 
              ? 'Sign in to access your personalized AI assistant'
              : 'Join Asha AI and start your career growth journey'}
          </p>
        </div>
        
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
            <button 
              className="notification-close" 
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
        
        <form className="login-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                disabled={loading}
              />
              {errors.name && (
                <div className="form-error">{errors.name}</div>
              )}
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? 'form-input-error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />
            {errors.email && (
              <div className="form-error">{errors.email}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={`form-input ${errors.password ? 'form-input-error' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
            {errors.password && (
              <div className="form-error">{errors.password}</div>
            )}
          </div>
          
          {isLogin && (
            <div className="form-group text-right">
              <a href="#" className="forgot-password">Forgot Password?</a>
            </div>
          )}
          
          <button 
            type="submit" 
            className="form-button"
            disabled={loading}
          >
            {loading ? (
              <span>
                <i className="fas fa-spinner fa-spin"></i> Loading...
              </span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
          
          <div className="form-toggle">
            <button 
              type="button"
              className="form-link"
              onClick={toggleMode}
            >
              {isLogin 
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;