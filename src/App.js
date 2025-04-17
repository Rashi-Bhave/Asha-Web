// App.js - Main application component
import React, { useState, useEffect } from 'react';
import { createContext, useContext } from 'react';
import './App.css';

// Context Providers
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import JobsPage from './pages/JobsPage';
import EventsPage from './pages/EventsPage';
import MentorshipPage from './pages/MentorshipPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import LoadingIndicator from './components/LoadingIndicator';

// Services
import { isAuthenticated } from './services/storageService';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [authChecked, setAuthChecked] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await isAuthenticated();
        setUserAuthenticated(authStatus);
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  if (!authChecked) {
    return (
      <div className="app-loading">
        <div className="loader"></div>
        <p>Loading Asha AI...</p>
      </div>
    );
  }

  // Render appropriate content based on authentication status
  if (!userAuthenticated) {
    return (
      <AuthProvider>
        <div className="app-container">
          {activeTab === 'welcome' && <WelcomePage onNavigate={setActiveTab} />}
          {activeTab === 'login' && <LoginPage onNavigate={setActiveTab} />}
          {activeTab !== 'welcome' && activeTab !== 'login' && <WelcomePage onNavigate={setActiveTab} />}
        </div>
      </AuthProvider>
    );
  }

  // If authenticated, render the main app interface
  return (
    <AuthProvider>
      <ChatProvider>
        <div className="app-container">
          <Header activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="main-content">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="page-content">
              {activeTab === 'chat' && <ChatInterface />}
              {activeTab === 'jobs' && <JobsPage />}
              {activeTab === 'events' && <EventsPage />}
              {activeTab === 'mentorship' && <MentorshipPage />}
              {activeTab === 'settings' && <SettingsPage onNavigate={setActiveTab} />}
              {activeTab === 'profile' && <ProfilePage onNavigate={setActiveTab} />}
              {activeTab === 'about' && <AboutPage />}
            </div>
          </div>
        </div>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;