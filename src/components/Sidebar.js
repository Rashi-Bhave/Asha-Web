// components/Sidebar.js
import React from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'chat', label: 'Chat', icon: 'fa-comment' },
    { id: 'jobs', label: 'Jobs', icon: 'fa-briefcase' },
    { id: 'events', label: 'Events', icon: 'fa-calendar' },
    { id: 'mentorship', label: 'Mentorship', icon: 'fa-users' },
    { id: 'profile', label: 'Profile', icon: 'fa-user' },
    { id: 'settings', label: 'Settings', icon: 'fa-cog' },
  ];

  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <i className={`fas ${item.icon} nav-icon`}></i>
            <span className="nav-text">{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;