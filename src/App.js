// App.js - Main application component
import React, { useState, useEffect, useContext } from 'react';
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

// Auth Consumer component to track authentication state changes
const AuthStateManager = ({ setUserAuthenticated, setActiveTab }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  
  useEffect(() => {
    setUserAuthenticated(isAuthenticated);
    // If user becomes authenticated, always set active tab to chat
    if (isAuthenticated) {
      setActiveTab('chat');
    }
  }, [isAuthenticated, setUserAuthenticated, setActiveTab]);
  
  return null;
};

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [authChecked, setAuthChecked] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await isAuthenticated();
        setUserAuthenticated(authStatus);
        // If user is authenticated on initial load, ensure we start on chat tab
        if (authStatus) {
          setActiveTab('chat');
        }
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

  return (
    <AuthProvider>
      <AuthStateManager 
        setUserAuthenticated={setUserAuthenticated} 
        setActiveTab={setActiveTab}
      />
      
      <div className="app-container">
        {!userAuthenticated ? (
          <>
            {activeTab === 'welcome' && <WelcomePage onNavigate={setActiveTab} />}
            {activeTab === 'login' && <LoginPage onNavigate={setActiveTab} />}
            {activeTab !== 'welcome' && activeTab !== 'login' && <WelcomePage onNavigate={setActiveTab} />}
          </>
        ) : (
          <ChatProvider>
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
          </ChatProvider>
        )}
      </div>
    </AuthProvider>
  );
}

export default App;