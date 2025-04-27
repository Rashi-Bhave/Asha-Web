import React, { useEffect, useState, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoverLink, setHoverLink] = useState(null);
  const headerRef = useRef(null);
  
  // Navigation links configuration
  const navLinks = [
    { name: 'Home', path: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Problems', path: '/problems', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { name: 'Discuss', path: '/discuss', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    // Added Chat navigation link
    { name: 'Chat', path: '/chat', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    // Added Jobs navigation link
    { name: 'Jobs', path: '/jobs', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { name: 'Career', path: '/career', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 017.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { 
      name: 'Interview', 
      path: '/interview-prep', 
      icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' 
    },
    // Added Mentorship navigation link
    { 
      name: 'Mentorship', 
      path: '/mentorship', 
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' 
    },
    // Added Events navigation link
    { 
      name: 'Events', 
      path: '/events', 
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' 
    },
    { name: 'Join', path: '/join-interview', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Host', path: '/host-interview', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' }
  ];
  
  // Admin link to be shown only when logged in
  // const adminLink = { 
  //   name: 'Admin', 
  //   path: '/admin', 
  //   icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' 
  // };
  
  useEffect(() => {
    // Add scroll listener for header effects
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Fetch user data from local storage
    const localUser = localStorage.getItem('user');
    if (localUser) setUser(JSON.parse(localUser));
    
    // Create animated background elements
    const createBackgroundElements = () => {
      if (headerRef.current) {
        // Remove any existing elements first
        const existingElements = headerRef.current.querySelectorAll('.bg-element');
        existingElements.forEach(el => el.remove());
        
        // Create new elements
        for (let i = 0; i < 15; i++) {
          const element = document.createElement('div');
          element.className = 'bg-element';
          
          // Randomize size, position, and animation duration
          const size = Math.random() * 20 + 5;
          element.style.width = `${size}px`;
          element.style.height = `${size}px`;
          element.style.left = `${Math.random() * 100}%`;
          element.style.top = `${Math.random() * 100}%`;
          element.style.animationDuration = `${Math.random() * 50 + 10}s`;
          element.style.animationDelay = `${Math.random() * 5}s`;
          
          headerRef.current.appendChild(element);
        }
      }
    };
    
    createBackgroundElements();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Get all navigation links, including the admin link if user is logged in
  const getAllNavLinks = () => {
    const links = [...navLinks];
    // if (user) {
    //   links.push(adminLink);
    // }
    return links;
  };

  return (
    <header 
      ref={headerRef}
      className={`sticky top-0 z-50 transition-all duration-500 overflow-hidden ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-lg shadow-blue-500/10 h-16' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 h-20'
      }`}
    >
      {/* Animated background elements styled in the CSS section below */}
      
      <div className="container mx-auto relative z-10">
      <div className={`flex items-center justify-between h-full px-4 sm:px-6 lg:px-8 ${scrolled ? '' : 'mt-3'}`}>
      {/* Logo */}
          <NavLink to="/" className="flex items-center group perspective">
            <div className="relative w-10 h-10 mr-3 transform transition-all duration-500 group-hover:rotate-y-180 preserve-3d"  style={{width: 140, height: "4.4rem"}}>
              <img 
                src="https://res.cloudinary.com/dyfmlusbc/image/upload/v1745745967/ashaverselogonobgupscaled1_uxcitk.png" 
                alt="AshaVerse Logo" 
                className="w-full h-full object-cover absolute backface-hidden"
              />
              {/* <div className="absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center bg-blue-600 rounded-full text-white text-xl font-bold">
                CR
              </div> */}
            </div>
            <div className="overflow-hidden">
              {/* <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap inline-block transform transition-transform duration-500 hover:translate-y-[-100%]">
                AshaVerse
              </span> */}
              {/* <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent whitespace-nowrap inline-block transform transition-transform duration-500 translate-y-[100%] group-hover:translate-y-0">
                Explorer
              </span> */}
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex items-center">
              {getAllNavLinks().map((link) => (
                <li key={link.name} className="relative mx-1">
                  <NavLink 
                    to={link.path}
                    className={({ isActive }) => `
                      px-4 py-2 flex items-center text-sm font-medium rounded-md transition-all duration-300
                      ${isActive 
                        ? 'text-white group' 
                        : 'text-gray-700 hover:text-blue-600 group'
                      }
                    `}
                    onMouseEnter={() => setHoverLink(link.name)}
                    onMouseLeave={() => setHoverLink(null)}
                  >
                    {({ isActive }) => (
                      <>
                        {/* Background animation */}
                        <span className={`absolute inset-0 rounded-md transition-all duration-300 z-0 ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-400/20' 
                            : 'bg-transparent group-hover:bg-blue-50'
                        }`}>
                          {/* Animated dots at corners */}
                          <span className="absolute top-0 left-0 w-1 h-1 rounded-full bg-blue-400 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:animate-ping"></span>
                          <span className="absolute top-0 right-0 w-1 h-1 rounded-full bg-indigo-400 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:animate-ping delay-100"></span>
                          <span className="absolute bottom-0 left-0 w-1 h-1 rounded-full bg-purple-400 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:animate-ping delay-200"></span>
                          <span className="absolute bottom-0 right-0 w-1 h-1 rounded-full bg-blue-400 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:animate-ping delay-300"></span>
                        </span>
                        
                        {/* Icon - FIXED: added relative z-10 to make sure the icon stays visible */}
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-4 w-4 mr-1.5 transition-all duration-300 relative z-10 ${
                            isActive ? 'text-white' : 'text-blue-600 group-hover:scale-110'
                          }`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor" 
                          strokeWidth={isActive ? 2.5 : 1.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                        </svg>
                        
                        {/* Text */}
                        <span className="relative z-10">{link.name}</span>
                        
                        {/* Animated underline */}
                        <span className={`absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 transition-transform duration-300 ${
                          isActive 
                            ? 'bg-white scale-x-100' 
                            : 'bg-blue-400 group-hover:scale-x-100'
                        }`}></span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile / Login Buttons */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-2">
                {/* Username Display - NEW COOL FEATURE */}
                <div className="hidden sm:flex items-center mr-2 group">
                  {/* Animated welcome text */}
                  <div className="overflow-hidden h-5 w-16 mr-1.5" style={{marginTop: 7}}>
                    <div className="transform transition-transform duration-500 group-hover:translate-y-[-100%]">
                      <span className="block text-xs font-medium text-gray-500">Welcome</span>
                      <span className="block text-xs font-medium text-blue-500">Hello</span>
                    </div>
                  </div>
                  
                  {/* Username with hover effects */}
                  <div className="relative">
                    <span className="text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {user.username || 'User'}
                    </span>
                    
                    {/* Animated underline */}
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                    
                    {/* Particle effects on hover */}
                    <span className="absolute top-0 right-0 w-1 h-1 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 group-hover:animate-ping"></span>
                    <span className="absolute bottom-0 left-0 w-1 h-1 rounded-full bg-indigo-400 opacity-0 group-hover:opacity-100 group-hover:animate-ping" style={{ animationDelay: '0.3s' }}></span>
                  </div>
                </div>
                
                {/* Profile Button */}
                <Link 
                  to="/profile" 
                  className="relative p-1.5 rounded-md transition-all duration-300 hover:bg-blue-100 text-blue-600 hover:text-blue-700 group"
                  title="Profile"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 transform transition-transform duration-300 group-hover:scale-110" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                </Link>
                
                {/* Logout Button */}
                <button 
                  onClick={() => {
                    // Clear user from local storage
                    localStorage.removeItem('user');
                    // Reload the page or navigate to home
                    window.location.href = '/';
                  }}
                  className="relative p-1.5 rounded-md transition-all duration-300 hover:bg-red-100 text-red-600 hover:text-red-700 group"
                  title="Logout"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 transform transition-transform duration-300 group-hover:scale-110" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
                
                {/* User Avatar */}
                <Link 
                  to="/profile" 
                  className="group relative ml-1 p-1.5 rounded-full transition-all duration-300 hover:bg-gray-100 overflow-hidden"
                >
                  {/* Orbital circles animation */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100">
                    <div className="absolute inset-[-30%] border-2 border-transparent border-t-blue-400 border-r-indigo-400 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute inset-[-15%] border border-transparent border-b-indigo-400 border-l-blue-400 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                  </div>
                  
                 
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-0 right-0 transform translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-300 mt-2 w-48 bg-white rounded-md shadow-lg z-20 pointer-events-none">
                    <div className="absolute right-0 top-0 transform -translate-y-2 w-4 h-4 rotate-45 bg-white"></div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900">Signed in as:</p>
                      <p className="text-sm text-gray-600 truncate">{user.email || user.username}</p>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-blue-600">Click to view profile</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <NavLink 
                  to="/login" 
                  className="relative overflow-hidden px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:border-blue-400 transition-colors duration-300 group"
                >
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-white">Login</span>
                  <span className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-gradient-to-r from-blue-500 to-indigo-600"></span>
                </NavLink>
                <NavLink 
                  to="/register" 
                  className="relative overflow-hidden px-3 py-1.5 text-sm font-medium text-white rounded-md shadow-sm transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-md hover:shadow-blue-500/20"
                >
                  <span className="relative z-10">Register</span>
                  <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></span>
                  
                  {/* Animated dots */}
                  <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-blue-300 opacity-70 animate-ping"></span>
                  <span className="absolute bottom-0 left-0 w-1 h-1 rounded-full bg-indigo-300 opacity-70 animate-ping" style={{ animationDelay: '0.5s' }}></span>
                </NavLink>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="ml-4 p-1.5 rounded-md md:hidden text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 focus:outline-none transform hover:scale-110 active:scale-95"
              aria-label="Toggle mobile menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        <div 
          className={`md:hidden px-4 py-2 pb-4 border-t border-gray-200 bg-white/90 backdrop-blur-md transform transition-all duration-300 ${
            mobileMenuOpen 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-[-20px] opacity-0 pointer-events-none'
          }`}
        >
          {/* Mobile Username Display - NEW FEATURE */}
          {user && (
            <div className="flex items-center py-2 mb-2 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-400">
                  <img 
                    src={user.avatar || '/defaultuser.png'} 
                    alt={user.username || 'User'} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Welcome back</p>
                  <p className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {user.username || 'User'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <ul className="grid grid-cols-2 gap-2">
            {getAllNavLinks().map((link) => (
              <li key={link.name}>
                <NavLink 
                  to={link.path}
                  className={({ isActive }) => `
                    flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300
                    ${isActive 
                      ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-400/20' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {/* FIXED: Added z-index to make sure the icon stays visible in mobile menu too */}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 mr-1.5 relative z-10" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                  </svg>
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* CSS for animated background elements */}
      <style jsx>{`
        /* Create a containing environment */
        .perspective {
          perspective: 1000px;
        }
        
        /* 3D transforms */
        .preserve-3d {
          transform-style: preserve-3d;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        
        /* Background elements */
        .bg-element {
          position: absolute;
          background: linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1));
          border-radius: 50%;
          animation: float linear infinite;
          opacity: 0.5;
          z-index: 0;
        }
        
        @keyframes float {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(10px, 10px) rotate(90deg);
          }
          50% {
            transform: translate(0, 20px) rotate(180deg);
          }
          75% {
            transform: translate(-10px, 10px) rotate(270deg);
          }
          100% {
            transform: translate(0, 0) rotate(360deg);
          }
        }
      `}</style>
    </header>
  );
};

export default Header;