import React, { useState, useEffect } from 'react';
import ChatInterface from '../Chat/ChatInterface';

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  // Messages that will cycle in the bubble
  const messages = [
    "Hi! Need tech career help?",
    "Struggling with coding challenges?",
    "Want advice on your tech resume?",
    "Looking for interview preparation?",
    "Need mentorship guidance?"
  ];

  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [messages.length]);

  const toggleModal = () => {
    if (!isOpen) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsOpen(true);
        setIsAnimating(false);
      }, 400);
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsAnimating(false);
      }, 400);
    }
  };

  return (
    <>
      {/* Chat Modal (Full Screen) */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Animated background overlay */}
          <div 
            className="cyber-modal-backdrop"
            onClick={toggleModal}
          >
            <div className="cyber-modal-particles"></div>
          </div>
          
          <div className="cyber-chat-modal-fullscreen">
            {/* Decorative elements */}
            <div className="cyber-corner cyber-corner-tl"></div>
            <div className="cyber-corner cyber-corner-tr"></div>
            <div className="cyber-corner cyber-corner-bl"></div>
            <div className="cyber-corner cyber-corner-br"></div>
            <div className="cyber-scan-line"></div>
            
            {/* Close button floating in corner */}
            <button 
              className="cyber-floating-close"
              onClick={toggleModal}
              title="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Full screen chat interface */}
            <div className="cyber-chat-content">
              <ChatInterface />
            </div>
          </div>
        </div>
      )}

      {/* New Animated Chat Bubble with GIF */}
      <div 
        className={`modern-chat-launcher ${isAnimating ? 'modern-launcher-animating' : ''}`}
        onClick={toggleModal}
        aria-label="Open Asha Bot"
      >
        <div className="modern-bubble-container">
          {/* Animated Speech Bubble */}
          <div className="modern-speech-bubble">
            {/* Bubble content with changing messages */}
            <div className="modern-bubble-content">
              <div className="modern-message-container">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`modern-message ${currentMessageIndex === index ? 'modern-message-active' : ''}`}
                  >
                    {message}
                  </div>
                ))}
              </div>
              
              <div className="modern-bubble-cta">Click to chat with me</div>
              
              {/* Typing indicator */}
              <div className="modern-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            
            {/* Bubble pointer */}
            <div className="modern-bubble-pointer"></div>
          </div>
          
          {/* GIF container */}
          <div className="modern-gif-container">
            <img 
              src="https://res.cloudinary.com/dyfmlusbc/image/upload/v1745423184/video_chatbot_lgdiya.gif" 
              alt="AI Assistant" 
              className="modern-assistant-image"
            />
            
            {/* Animated particles and effects */}
            <div className="modern-particle modern-particle-1"></div>
            <div className="modern-particle modern-particle-2"></div>
            <div className="modern-particle modern-particle-3"></div>
            <div className="modern-glow"></div>
          </div>
        </div>
        
        {/* Pulse animation */}
        <div className="modern-pulse-ring"></div>
      </div>
      
      <style jsx>{`
        /* Modern Chat Bubble Styles */
        .modern-chat-launcher {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 40;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .modern-chat-launcher:hover {
          transform: scale(1.03) translateY(-5px);
        }
        
        .modern-launcher-animating {
          animation: modern-launcher-click 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        @keyframes modern-launcher-click {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        
        /* GIF Container */
        .modern-gif-container {
          position: relative;
          width: 240px;
          height: 240px;
          border-radius: 20%;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3), 
                      0 0 0 3px rgba(219, 39, 119, 0.5);
          transition: all 0.3s ease;
          z-index: 2;
        }
        
        .modern-assistant-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        /* Animated particles */
        .modern-particle {
          position: absolute;
          border-radius: 50%;
          background: rgb(219, 39, 119);
          filter: blur(1px);
          opacity: 0.6;
          z-index: 0;
        }
        
        .modern-particle-1 {
          width: 10px;
          height: 10px;
          top: 15%;
          left: 15%;
          animation: float-around 8s infinite linear;
        }
        
        .modern-particle-2 {
          width: 6px;
          height: 6px;
          bottom: 20%;
          left: 20%;
          animation: float-around 6s infinite linear reverse;
        }
        
        .modern-particle-3 {
          width: 8px;
          height: 8px;
          top: 30%;
          right: 15%;
          animation: float-around 10s infinite linear;
        }
        
        @keyframes float-around {
          0% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(15px) translateY(-10px); }
          50% { transform: translateX(0) translateY(-20px); }
          75% { transform: translateX(-15px) translateY(-10px); }
          100% { transform: translateX(0) translateY(0); }
        }
        
        .modern-glow {
          position: absolute;
          inset: -5px;
          background: radial-gradient(circle at center, rgba(219, 39, 119, 0.4) 0%, transparent 70%);
          border-radius: 50%;
          animation: pulse-glow 3s infinite alternate;
        }
        
        @keyframes pulse-glow {
          0% { opacity: 0.5; }
          100% { opacity: 0.9; }
        }
        
        /* Bubble Container */
        .modern-bubble-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        /* Speech Bubble */
        .modern-speech-bubble {
          position: relative;
          background: rgba(17, 24, 39, 0.9);
          border-radius: 20px;
          padding: 20px 24px;
          margin-bottom: 15px;
          max-width: 340px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2), 
                      0 0 0 2px rgba(219, 39, 119, 0.3);
          z-index: 1;
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          transform: translateZ(0);
          animation: bubble-appear 0.5s ease-out forwards;
        }
        
        @keyframes bubble-appear {
          0% { opacity: 0; transform: scale(0.8) translateY(-10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        .modern-bubble-content {
          min-height: 60px;
          display: flex;
          flex-direction: column;
        }
        
        .modern-message-container {
          position: relative;
          height: 50px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        
        .modern-message {
          position: absolute;
          width: 100%;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          font-size: 15px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .modern-message-active {
          opacity: 1;
          transform: translateY(0);
        }
        
        .modern-bubble-cta {
          color: rgb(219, 39, 119);
          font-size: 14px;
          font-weight: 600;
          opacity: 0.9;
          margin-top: auto;
        }
        
        /* Typing indicator */
        .modern-typing-indicator {
          display: flex;
          align-items: center;
          position: absolute;
          bottom: 20px;
          right: 24px;
        }
        
        .modern-typing-indicator span {
          width: 8px;
          height: 8px;
          margin: 0 3px;
          background-color: rgba(219, 39, 119, 0.7);
          border-radius: 50%;
          display: inline-block;
          opacity: 0.4;
        }
        
        .modern-typing-indicator span:nth-child(1) {
          animation: typing 1.2s infinite ease-in-out;
        }
        
        .modern-typing-indicator span:nth-child(2) {
          animation: typing 1.2s infinite ease-in-out 0.2s;
        }
        
        .modern-typing-indicator span:nth-child(3) {
          animation: typing 1.2s infinite ease-in-out 0.4s;
        }
        
        @keyframes typing {
          0% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-5px); opacity: 1; }
          100% { transform: translateY(0); opacity: 0.4; }
        }
        
        /* Bubble pointer */
        .modern-bubble-pointer {
          position: absolute;
          width: 30px;
          height: 30px;
          background: rgba(17, 24, 39, 0.9);
          left: 50%;
          bottom: -10px;
          transform: translateX(-50%) rotate(45deg);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          z-index: -1;
        }
        
        /* Pulse animation ring */
        .modern-pulse-ring {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 250px;
          height: 250px;
          border-radius: 20%;
          border: 3px solid rgba(219, 39, 119, 0.7);
          opacity: 0;
          z-index: 0;
          animation: pulse-ring 3s infinite;
        }
        
        @keyframes pulse-ring {
          0% { transform: translateX(-50%) scale(0.8); opacity: 0.7; }
          70% { transform: translateX(-50%) scale(1.2); opacity: 0; }
          100% { transform: translateX(-50%) scale(0.8); opacity: 0; }
        }
        
        /* Full Screen Modal Styles (maintaining the original styles) */
        .cyber-modal-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(8px);
          z-index: 50;
          animation: backdrop-appear 0.4s cubic-bezier(0.33, 1, 0.68, 1);
          overflow: hidden;
        }
        
        @keyframes backdrop-appear {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        .cyber-modal-particles {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(219, 39, 119, 0.1) 0%, transparent 70%),
            radial-gradient(circle at 80% 60%, rgba(124, 58, 237, 0.1) 0%, transparent 70%);
          opacity: 0.5;
          z-index: 0;
        }
        
        .cyber-chat-modal-fullscreen {
          position: absolute;
          inset: 0;
          background: transparent;
          z-index: 51;
          display: flex;
          flex-direction: column;
          animation: modal-slide-in 0.5s cubic-bezier(0.33, 1, 0.68, 1);
          overflow: hidden;
          border-left: 1px solid rgba(219, 39, 119, 0.3);
          border-right: 1px solid rgba(219, 39, 119, 0.3);
        }
        
        @keyframes modal-slide-in {
          0% { transform: translateY(10%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        .cyber-floating-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 50%;
          color: rgba(239, 68, 68, 0.8);
          transition: all 0.3s;
          z-index: 53;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
        }
        
        .cyber-floating-close:hover {
          background: rgba(239, 68, 68, 0.3);
          color: rgb(239, 68, 68);
          transform: rotate(90deg);
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
        }
        
        .cyber-chat-content {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        /* Decorative elements */
        .cyber-corner {
          position: absolute;
          width: 10px;
          height: 10px;
          z-index: 52;
        }
        
        .cyber-corner-tl {
          top: 0;
          left: 0;
          border-top: 2px solid rgb(219, 39, 119);
          border-left: 2px solid rgb(219, 39, 119);
        }
        
        .cyber-corner-tr {
          top: 0;
          right: 0;
          border-top: 2px solid rgb(219, 39, 119);
          border-right: 2px solid rgb(219, 39, 119);
        }
        
        .cyber-corner-bl {
          bottom: 0;
          left: 0;
          border-bottom: 2px solid rgb(219, 39, 119);
          border-left: 2px solid rgb(219, 39, 119);
        }
        
        .cyber-corner-br {
          bottom: 0;
          right: 0;
          border-bottom: 2px solid rgb(219, 39, 119);
          border-right: 2px solid rgb(219, 39, 119);
        }
        
        .cyber-scan-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(219, 39, 119, 0.7), transparent);
          opacity: 0.5;
          animation: scan-line 3s infinite linear;
          z-index: 52;
        }
        
        @keyframes scan-line {
          0% { transform: translateY(0); }
          100% { transform: translateY(100vh); }
        }
        
        /* Responsive styles */
        @media (max-width: 768px) {
          .modern-speech-bubble {
            max-width: 300px;
            padding: 16px 20px;
          }
          
          .modern-message-container {
            height: 70px;
          }
          
          .modern-message {
            font-size: 16px;
          }
          
          .modern-gif-container {
            width: 180px;
            height: 180px;
          }
          
          .modern-pulse-ring {
            width: 190px;
            height: 190px;
          }
        }
        
        @media (max-width: 480px) {
          .modern-chat-launcher {
            bottom: 1.5rem;
            right: 1.5rem;
          }
          
          .modern-bubble-container {
            align-items: center;
          }
          
          .modern-speech-bubble {
            margin-bottom: 12px;
            max-width: 240px;
          }
          
          .modern-gif-container {
            width: 150px;
            height: 150px;
          }
          
          .modern-pulse-ring {
            width: 160px;
            height: 160px;
          }
        }
      `}</style>
    </>
  );
};

export default ChatBubble;