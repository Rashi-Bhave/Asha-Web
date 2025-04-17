// components/Header.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Header = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-title">Asha AI Chatbot</div>
      <div className="header-actions">
        <button
          className="header-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <i className="fas fa-ellipsis-v"></i>
        </button>
        {menuOpen && (
          <div className="dropdown-menu">
            <button
              className="dropdown-item"
              onClick={() => {
                setActiveTab('chat');
                setMenuOpen(false);
              }}
            >
              Clear Chat
            </button>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

