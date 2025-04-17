// Placeholder content for SettingsPage.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { loadSettings, saveSettings, clearChat } from '../services/storageService';

const SettingsPage = () => {
  const { user, logout } = useContext(AuthContext);
  
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: 'en',
    fontSize: 'medium',
    analyticsEnabled: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const savedSettings = await loadSettings();
        if (savedSettings) {
          setSettings(savedSettings);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading settings:', error);
        setLoading(false);
      }
    };
    
    loadUserSettings();
  }, []);
  
  const updateSetting = async (key, value) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    
    try {
      await saveSettings(updatedSettings);
      setNotification({
        show: true,
        message: 'Settings updated successfully',
        type: 'success'
      });
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
    } catch (error) {
      console.error(`Error saving ${key} setting:`, error);
      setNotification({
        show: true,
        message: 'Failed to update settings',
        type: 'error'
      });
    }
  };
  
  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      try {
        await clearChat();
        setNotification({
          show: true,
          message: 'Chat history cleared successfully',
          type: 'success'
        });
      } catch (error) {
        console.error('Error clearing chat history:', error);
        setNotification({
          show: true,
          message: 'Failed to clear chat history',
          type: 'error'
        });
      }
    }
  };
  
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
      } catch (error) {
        console.error('Error logging out:', error);
        setNotification({
          show: true,
          message: 'Failed to logout',
          type: 'error'
        });
      }
    }
  };
  
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }
  
  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>
      
      {user && (
        <div className="profile-section">
          <div className="profile-info">
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-email">{user.email}</p>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
      
      <div className="settings-section">
        <h2 className="section-title">Preferences</h2>
        
        <div className="setting-item">
          <div className="setting-info">
            <h3 className="setting-title">Notifications</h3>
            <p className="setting-description">Receive push notifications</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => updateSetting('notifications', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <div className="setting-item">
          <div className="setting-info">
            <h3 className="setting-title">Dark Mode</h3>
            <p className="setting-description">Use dark theme</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) => updateSetting('darkMode', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <div className="setting-item">
          <div className="setting-info">
            <h3 className="setting-title">Text Size</h3>
            <p className="setting-description">Adjust the size of text throughout the app</p>
          </div>
          <select
            className="setting-select"
            value={settings.fontSize}
            onChange={(e) => updateSetting('fontSize', e.target.value)}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        
        <div className="setting-item">
          <div className="setting-info">
            <h3 className="setting-title">Language</h3>
            <p className="setting-description">Select your preferred language</p>
          </div>
          <select
            className="setting-select"
            value={settings.language}
            onChange={(e) => updateSetting('language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
            <option value="kn">Kannada</option>
          </select>
        </div>
      </div>
      
      <div className="settings-section">
        <h2 className="section-title">Privacy & Data</h2>
        
        <div className="setting-item">
          <div className="setting-info">
            <h3 className="setting-title">Analytics</h3>
            <p className="setting-description">Help improve the app by sharing usage data</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.analyticsEnabled}
              onChange={(e) => updateSetting('analyticsEnabled', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <div className="setting-item">
          <div className="setting-info">
            <h3 className="setting-title">Clear Chat History</h3>
            <p className="setting-description">Delete all conversations</p>
          </div>
          <button 
            className="danger-button"
            onClick={handleClearChat}
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="settings-section">
        <h2 className="section-title">About</h2>
        
        <div className="setting-item clickable">
          <div className="setting-info">
            <h3 className="setting-title">About Asha AI</h3>
            <p className="setting-description">Learn more about Asha AI</p>
          </div>
          <i className="fas fa-chevron-right"></i>
        </div>
        
        <div className="setting-item clickable">
          <div className="setting-info">
            <h3 className="setting-title">Privacy Policy</h3>
          </div>
          <i className="fas fa-chevron-right"></i>
        </div>
        
        <div className="setting-item clickable">
          <div className="setting-info">
            <h3 className="setting-title">Terms of Service</h3>
          </div>
          <i className="fas fa-chevron-right"></i>
        </div>
      </div>
      
      <div className="version-info">
        <p>Version 1.0.0</p>
      </div>
      
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button 
            className="notification-close"
            onClick={() => setNotification({ ...notification, show: false })}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;