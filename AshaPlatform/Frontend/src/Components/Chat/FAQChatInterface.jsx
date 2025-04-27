import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { sendFAQMessage, getFAQChatHistory, getOrCreateSessionId, submitFAQFeedback } from '../../Services/FAQ.service';
import { registerUser } from '../../Services/Auth.service.js'; // Import the same function used in Register.jsx

const FAQChatInterface = () => {
  // Navigation
  const navigate = useNavigate();
  
  // State management
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [context, setContext] = useState({
    page: 'login',
    isLoginPage: true,
    needsSignupHelp: false
  });
  
  // Signup state tracking
  const [signupState, setSignupState] = useState('initial');
  const [signupData, setSignupData] = useState({});
  const [isSignupMode, setIsSignupMode] = useState(false);
  
  // Message feedback
  const [activeFeedbackId, setActiveFeedbackId] = useState(null);
  const [messageFeedback, setMessageFeedback] = useState({});
  
  // Password visibility toggle for signup
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  // Message quick reply suggestions
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  
  // References
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // Mouse position tracking for UI effects
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Initialize chat session
  useEffect(() => {
    const initSession = async () => {
      try {
        // Get or create session ID
        const id = getOrCreateSessionId();
        setSessionId(id);
        
        // Fetch chat history
        const response = await getFAQChatHistory(id);
        if (response.success && response.messages.length > 0) {
          setMessages(response.messages);
          
          // Check for signup state in recent messages
          const botMessages = response.messages.filter(msg => msg.sender === 'bot');
          if (botMessages.length > 0) {
            const lastBotMessage = botMessages[botMessages.length - 1];
            if (lastBotMessage.attachment && lastBotMessage.attachment.type === 'signup') {
              // Resume signup state if found
              setSignupState(lastBotMessage.attachment.data.step || 'initial');
              setSignupData(lastBotMessage.attachment.data.formData || {});
              setIsSignupMode(true);
            }
          }
        } else {
          // Add a welcome message if no history
          setMessages([{
            id: 'welcome',
            text: 'Hi there! I\'m Asha, your assistant for the Asha Coding Platform. How can I help you today? Need assistance with signing up, logging in, or learning about our platform?',
            sender: 'bot',
            timestamp: new Date().toISOString(),
            attachment: null
          }]);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        // Add fallback welcome message if there's an error
        setMessages([{
          id: 'welcome',
          text: 'Welcome! I\'m Asha, ready to help you with signing up, logging in, or answering questions about our platform.',
          sender: 'bot',
          timestamp: new Date().toISOString(),
          attachment: null
        }]);
      }
    };
    
    initSession();
    createParticles();
  }, []);

  // Track mouse movement for UI effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (chatContainerRef.current) {
        const rect = chatContainerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
    
    // Hide quick replies after a few messages
    if (messages.length > 2) {
      setShowQuickReplies(false);
    }
  }, [messages]);
  
  // Update context when signup state changes
  useEffect(() => {
    setContext(prev => ({
      ...prev,
      signupState,
      signupData,
      isSignupMode
    }));
    
    // Special handling for password collection step
    if (signupState === 'collecting_password') {
      // Clear any autocomplete suggestions during password entry for security
      setMessage('');
    }
    
    // If registration is complete, show a success toast
    if (signupState === 'registration_complete') {
      toast.success("Account created successfully!", {
        duration: 5000,
        icon: '🎉'
      });
      
      // Navigate to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  }, [signupState, signupData, isSignupMode, navigate]);
  
  // Create animated particles
  const createParticles = () => {
    const container = document.querySelector('.cyber-particles-container');
    if (container) {
      // Remove any existing particles
      const existingParticles = container.querySelectorAll('.cyber-particle');
      existingParticles.forEach(p => p.remove());
      
      // Create new particles
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'cyber-particle';
        
        // Randomize properties
        const size = Math.random() * 6 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const animationDuration = Math.random() * 20 + 10;
        const animationDelay = Math.random() * 5;
        const opacity = Math.random() * 0.5 + 0.1;
        
        // Apply styles
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.opacity = opacity;
        particle.style.animationDuration = `${animationDuration}s`;
        particle.style.animationDelay = `${animationDelay}s`;
        
        container.appendChild(particle);
      }
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSend = async () => {
    if (!message.trim() || loading) return;
    
    try {
      setLoading(true);
      setIsThinking(true);
      
      console.log('Current signup state before sending:', signupState);
      console.log('Current signup data before sending:', signupData);
      
      // Add user message to UI
      const userMessage = {
        id: `temp-${Date.now()}`,
        text: message,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Check if this might be a signup intent when not already in signup mode
      if (!isSignupMode && detectSignupIntent(message)) {
        console.log('Detected signup intent in message:', message);
        setIsSignupMode(true);
        setSignupState('initial');
      }
      
      // Important: Always include the original user message content
      const messageContent = message.trim();
      
      // Update context with current state
      const updatedContext = {
        ...context,
        isSignupMode,
        signupState,
        signupData,
        recentMessages: messages.slice(-5).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      };
      
      console.log('Sending context to server:', updatedContext);
      
      // Send message to API with the original message content
      const response = await sendFAQMessage(messageContent, {
        sessionId,
        ...updatedContext
      });
      
      console.log('Full response from server:', response);
      
      // Handle response
      if (response.success) {
        // Add bot response to messages
        setMessages(prev => [
          ...prev.filter(m => m.id !== userMessage.id), // Remove temp message
          response.userMessage, // Add actual user message from server
          response.botMessage // Add bot response
        ]);
        
        // Update session ID if new one was provided
        if (response.sessionId && response.sessionId !== sessionId) {
          setSessionId(response.sessionId);
          localStorage.setItem('faq_chat_session_id', response.sessionId);
        }
        
        // Check for signup data in attachment
        if (response.botMessage.attachment && response.botMessage.attachment.type === 'signup') {
          console.log('Found signup data in attachment:', response.botMessage.attachment.data.step);
          setSignupState(response.botMessage.attachment.data.step || 'initial');
          setSignupData(response.botMessage.attachment.data.formData || {});
          setIsSignupMode(true);
        }
        // Frontend-driven signup flow logic
        else if (isSignupMode) {
          console.log('Managing signup flow on the frontend');
          
          // Process user input based on current signup state
          if (signupState === 'username' || signupState === 'collecting_username') {
            // User has provided username, save it and move to next step
            const username = messageContent; // Use the original message
            console.log('Saving username and advancing to fullname step:', username);
            
            const updatedData = { ...signupData, username };
            setSignupData(updatedData);
            setSignupState('collecting_fullname');
            
            // Don't use setTimeout here as it might cause race conditions
            // Don't add a system message directly - instead, send another API request
            // with structured data that the server can process
            sendFAQMessage("", {  // Send empty message with special context
              sessionId,
              isSignupMode: true,
              signupState: 'collecting_fullname',
              signupData: updatedData,
              systemMessage: `Great! I've saved your username: ${username}. Now, please enter your full name.`
            });
          } 
          else if (signupState === 'fullname' || signupState === 'collecting_fullname') {
            // User has provided full name, save it and move to email step
            const fullname = messageContent;
            console.log('Saving fullname and advancing to email step:', fullname);
            
            const updatedData = { ...signupData, fullname };
            setSignupData(updatedData);
            setSignupState('collecting_email');
            
            sendFAQMessage("", {  // Send empty message with special context
              sessionId,
              isSignupMode: true,
              signupState: 'collecting_email',
              signupData: updatedData,
              systemMessage: `Thanks ${fullname}! Now, please enter your email address.`
            });
          }
          else if (signupState === 'email' || signupState === 'collecting_email') {
            // User has provided email, save it and move to password step
            const email = messageContent;
            console.log('Saving email and advancing to password step:', email);
            
            const updatedData = { ...signupData, email };
            setSignupData(updatedData);
            setSignupState('collecting_password');
            
            sendFAQMessage("", {  // Send empty message with special context
              sessionId,
              isSignupMode: true,
              signupState: 'collecting_password',
              signupData: updatedData,
              systemMessage: `Great! Now please create a secure password (at least 8 characters).`
            });
          }
          else if (signupState === 'password' || signupState === 'collecting_password') {
            // User has provided password, save it and move to confirmation step
            const password = messageContent;
            console.log('Saving password and advancing to confirmation step');
            
            const updatedData = { ...signupData, password };
            setSignupData(updatedData);
            setSignupState('confirmation');
            
            sendFAQMessage("", {  // Send empty message with special context
              sessionId,
              isSignupMode: true,
              signupState: 'confirmation',
              signupData: updatedData,
              systemMessage: `Perfect! Please review your information:
              
  Username: ${updatedData.username}
  Full Name: ${updatedData.fullname}
  Email: ${updatedData.email}
  Password: ••••••••
  
  Type "confirm" to create your account.`
            });
          }
          else if (signupState === 'confirmation') {
            // User has confirmed, complete registration
            if (messageContent.toLowerCase() === 'confirm') {
              console.log('User confirmed, completing registration with data:', signupData);
              setIsThinking(true);
              
              try {
                // Call the registration endpoint
                const userData = {
                  fullname: signupData.fullname,
                  username: signupData.username,
                  email: signupData.email,
                  password: signupData.password
                };
                
                // Register the user
                const result = await registerUser(userData);
                console.log('Registration result:', result);
                
                // If successful, show success message
                if (result) {
                  setSignupState('registration_complete');
                  
                  // Add a success message to the chat
                  setMessages(prev => [...prev, {
                    id: `system-${Date.now()}`,
                    text: `Congratulations! Your account has been successfully created. You can now log in with your username and password.`,
                    sender: 'bot',
                    timestamp: new Date().toISOString()
                  }]);
                  
                  // Show success toast
                  toast.success("Account created successfully!", {
                    duration: 5000,
                    icon: '🎉'
                  });
                  
                  // Navigate to login after a delay
                  setTimeout(() => {
                    navigate('/login');
                  }, 3000);
                } else {
                  throw new Error('Registration failed');
                }
              } catch (error) {
                console.error('Error registering user:', error);
                
                // Show error message in chat
                setMessages(prev => [...prev, {
                  id: `error-${Date.now()}`,
                  text: "There was an error creating your account. Please try again.",
                  sender: 'bot',
                  timestamp: new Date().toISOString()
                }]);
                
                toast.error('Registration failed. Please try again.');
              } finally {
                setIsThinking(false);
              }
            } else {
              // User didn't confirm, stay in confirmation state
              setMessages(prev => [...prev, {
                id: `system-${Date.now()}`,
                text: `To create your account, please type "confirm". If you want to make changes, you can restart the signup process.`,
                sender: 'bot',
                timestamp: new Date().toISOString()
              }]);
            }
          }
        }
      } else {
        // Handle error response
        console.error('Error from server:', response);
        
        // Replace temp message with error indicator
        setMessages(prev => [
          ...prev.filter(m => m.id !== userMessage.id),
          {
            ...userMessage,
            id: `user-${Date.now()}`
          },
          {
            id: `error-${Date.now()}`,
            text: "Sorry, I couldn't process your message. Please try again.",
            sender: 'bot',
            timestamp: new Date().toISOString()
          }
        ]);
        
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error message
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
      setIsThinking(false);
      setMessage(''); // Clear input
    }
  };
  
  // Detect signup intent in message
  const detectSignupIntent = (text) => {
    const signupKeywords = [
      'sign up', 'signup', 'register', 'create account', 
      'new account', 'join', 'become a member', 
      'registration', 'make an account', 'sign me up',
      'how do i sign up', 'how to register', 'get started'
    ];
    
    const lowerText = text.toLowerCase();
    return signupKeywords.some(keyword => lowerText.includes(keyword));
  };

  // Clear chat history
  const clearChat = async () => {
    if (window.confirm('Are you sure you want to clear the entire chat history?')) {
      try {
        setLoading(true);
        setIsThinking(true);
        
        // Since there's no clearFAQChat service function available,
        // we'll handle this client-side by resetting the session
        
        // Generate a new session ID
        const newSessionId = `faq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        setSessionId(newSessionId);
        localStorage.setItem('faq_chat_session_id', newSessionId);
        
        // Reset all states
        setMessages([{
          id: 'welcome',
          text: 'Hi there! I\'m Asha, your assistant for the Asha Coding Platform. How can I help you today?',
          sender: 'bot',
          timestamp: new Date().toISOString(),
          attachment: null
        }]);
        setMessageFeedback({});
        setSignupState('initial');
        setSignupData({});
        setIsSignupMode(false);
        setShowQuickReplies(true);
        
        toast.success('Chat history cleared successfully');
      } catch (error) {
        console.error('Error clearing chat:', error);
        toast.error('Failed to clear chat history');
      } finally {
        setLoading(false);
        setIsThinking(false);
      }
    }
  };
  
  // Reset signup process
  const resetSignupFlow = () => {
    console.log('Resetting signup flow');
    setSignupState('initial');
    setSignupData({});
    setIsSignupMode(false);
    toast.info("Signup process has been reset. You can start over if you'd like.");
  };
  
  const handleChange = (e) => {
    setMessage(e.target.value);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleQuickReplyClick = (text) => {
    setMessage(text);
    handleSend();
  };
  
  // Submit feedback for bot message
  const submitFeedback = async (messageId, rating) => {
    try {
      await submitFAQFeedback(messageId, rating);
      
      setMessageFeedback(prev => ({
        ...prev,
        [messageId]: rating
      }));
      
      setActiveFeedbackId(null);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };
  
  // Get input placeholder based on signup state
  const getInputPlaceholder = () => {
    if (!isSignupMode) return "Type your message...";
    
    switch (signupState) {
      case 'username':
      case 'collecting_username':
        return "Enter desired username (at least 3 characters)...";
      case 'fullname':
      case 'collecting_fullname':
        return "Enter your full name...";
      case 'email':
      case 'collecting_email':
        return "Enter your email address...";
      case 'password':
      case 'collecting_password':
        return "Enter password (at least 8 characters)...";
      case 'confirmation':
        return "Type 'confirm' to create your account...";
      case 'registration_complete':
        return "Type a message...";
      default:
        return "Type your message...";
    }
  };
  
  // Render the input field based on state
  const renderInputField = () => {
    // For password input, use a special secure input
    if (signupState === 'password' || signupState === 'collecting_password') {
      return (
        <>
          <textarea
            ref={inputRef}
            type={passwordVisible ? 'text' : 'password'}
            className="cyber-input-field cyber-password-input"
            placeholder={getInputPlaceholder()}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={loading}
            rows={1}
            style={{
              fontFamily: passwordVisible ? 
                "'JetBrains Mono', monospace" : 
                "text-security-disc, 'JetBrains Mono', monospace",
              letterSpacing: passwordVisible ? 'normal' : '0.25em'
            }}
          />
          <button 
            className="cyber-password-toggle"
            onClick={() => setPasswordVisible(!passwordVisible)}
            type="button"
            title={passwordVisible ? "Hide password" : "Show password"}
          >
            <i className={`fas fa-${passwordVisible ? 'eye-slash' : 'eye'}`}></i>
          </button>
        </>
      );
    }
    
    // Default input for all other states
    return (
      <textarea
        ref={inputRef}
        className="cyber-input-field"
        placeholder={getInputPlaceholder()}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={loading}
        rows={1}
      />
    );
  };
  
  // Format message text (convert markdown, URLs, etc.)
  const formatMessageText = (text) => {
    if (!text) return '';
    
    // Replace URLs with clickable links
    let formattedText = text.replace(
      /(https?:\/\/[^\s]+)/g, 
      (match) => `<a href="${match}" target="_blank" rel="noopener noreferrer" class="message-link">${match}</a>`
    );
    
    // Replace line breaks with <br>
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    return formattedText;
  };
  
  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Quick reply suggestions for new chats
  const getQuickReplies = () => {
    // If there are more than 2 messages, don't show quick replies
    if (messages.length > 2 || !showQuickReplies) return null;
    
    const suggestions = [
      "How do I create an account?",
      "I forgot my password",
      "What is AshaVerse platform?",
      "What features do you offer?"
    ];
    
    return (
      <div className="cyber-quick-replies">
        <div className="cyber-quick-replies-label">Suggested questions:</div>
        <div className="cyber-quick-replies-container">
          {suggestions.map(suggestion => (
            <button 
              key={suggestion}
              className="cyber-quick-reply-button"
              onClick={() => handleQuickReplyClick(suggestion)}
            >
              {suggestion}
              <div className="cyber-corner cyber-corner-tl"></div>
              <div className="cyber-corner cyber-corner-tr"></div>
              <div className="cyber-corner cyber-corner-bl"></div>
              <div className="cyber-corner cyber-corner-br"></div>
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="cyber-chat-interface" ref={chatContainerRef}>
      {/* Background particle animation container */}
      <div className="cyber-particles-container"></div>
      
      {/* Animated grid lines */}
      <div className="cyber-grid-lines"></div>
      
      {/* Glowing orbs */}
      <div 
        className="cyber-glow-orb cyber-glow-orb-1"
        style={{
          transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`
        }}
      ></div>
      <div 
        className="cyber-glow-orb cyber-glow-orb-2"
        style={{
          transform: `translate(${-mousePosition.x * 30}px, ${-mousePosition.y * 30}px)`
        }}
      ></div>
      
      {/* Chat Container */}
      <div className="cyber-chat-container">
        {/* Chat Header */}
        <div className="cyber-chat-header">
          <div className="cyber-chat-title">
            <div className="cyber-bot-avatar">
              <div className="cyber-bot-avatar-icon">
                <i className="fas fa-robot"></i>
              </div>
              <div className="cyber-bot-avatar-pulse"></div>
            </div>
            <div className="cyber-title-content">
              <h1 className="cyber-title-text">
                Asha Assistant
                <span className="cyber-blink">_</span>
              </h1>
              <div className="cyber-bot-status">
                <span className="cyber-status-indicator cyber-online"></span>
                <span className="cyber-status-text">Ready to help</span>
              </div>
            </div>
          </div>

          <div className="cyber-header-actions">
            {/* Clear Chat Button */}
            <button 
              onClick={() => clearChat()} 
              className="cyber-clear-button" 
              disabled={loading || messages.length === 0}
              title="Clear chat history"
            >
              <span className="cyber-button-icon">
                <i className="fas fa-trash-alt"></i>
              </span>
              <span className="cyber-button-text">Reset Chat</span>
              
              {/* Decorative corners */}
              <div className="cyber-corner cyber-corner-tl"></div>
              <div className="cyber-corner cyber-corner-tr"></div>
              <div className="cyber-corner cyber-corner-bl"></div>
              <div className="cyber-corner cyber-corner-br"></div>
            </button>
          </div>
        </div>
        
        {/* Messages Container */}
        <div className="cyber-messages-container">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            const hasAttachment = msg.attachment !== null;
            const hasFeedback = messageFeedback[msg.id] !== undefined;
            const isShowingFeedback = activeFeedbackId === msg.id;
            
            return (
              <div 
                key={msg.id} 
                className={`cyber-message ${isBot ? 'cyber-bot-message' : 'cyber-user-message'}`}
              >
                <div className="cyber-message-container">
                  {isBot && (
                    <div className="cyber-avatar">
                      <div className="cyber-avatar-icon">
                        <i className="fas fa-robot"></i>
                      </div>
                    </div>
                  )}
                  
                  <div className="cyber-message-content">
                    <div 
                      className={`cyber-message-bubble ${isBot ? 'cyber-bot-bubble' : 'cyber-user-bubble'}`}
                      onClick={() => isBot && setActiveFeedbackId(isShowingFeedback ? null : msg.id)}
                    >
                      <div 
                        className="cyber-message-text"
                        dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }}
                      />
                    </div>
                    
                    <div className="cyber-message-meta">
                      <div className="cyber-message-time">
                        <svg xmlns="http://www.w3.org/2000/svg" className="cyber-time-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{formatTime(msg.timestamp)}</span>
                      </div>
                      
                      {isBot && (
                        <div className="cyber-message-actions">
                          {hasFeedback ? (
                            <div className="cyber-feedback-display">
                              <i className={`fas fa-${messageFeedback[msg.id] > 3 ? 'thumbs-up' : 'thumbs-down'} cyber-feedback-${messageFeedback[msg.id] > 3 ? 'up' : 'down'}`}></i>
                            </div>
                          ) : !isShowingFeedback && (
                            <button 
                              className="cyber-action-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveFeedbackId(msg.id);
                              }}
                              title="Rate this response"
                            >
                              <i className="fas fa-thumbs-up"></i>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Feedback UI when active */}
                    {isBot && isShowingFeedback && (
                      <div className="cyber-feedback-ui">
                        <div className="cyber-feedback-prompt">Was this response helpful?</div>
                        <div className="cyber-feedback-buttons">
                          <button 
                            className="cyber-feedback-button cyber-feedback-up"
                            onClick={() => submitFeedback(msg.id, 5)}
                          >
                            <i className="fas fa-thumbs-up"></i>
                            <span>Helpful</span>
                          </button>
                          <button 
                            className="cyber-feedback-button cyber-feedback-down"
                            onClick={() => submitFeedback(msg.id, 2)}
                          >
                            <i className="fas fa-thumbs-down"></i>
                            <span>Not helpful</span>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Render attachments if present */}
                    {hasAttachment && isBot && (
                      <div className="cyber-attachment">
                        {/* Signup form attachment */}
                        {msg.attachment.type === 'signup' && (
                          <div className="cyber-signup-form">
                            <div className="cyber-signup-header">
                              <div className="cyber-signup-icon">
                                <i className="fas fa-user-plus"></i>
                              </div>
                              <h3 className="cyber-signup-title">Account Creation</h3>
                            </div>
                            <div className="cyber-signup-info">
                              {msg.attachment.data.step === 'username' && (
                                <p>Please enter a username to get started with your new account.</p>
                              )}
                              {msg.attachment.data.step === 'fullname' && (
                                <p>Great! Now please enter your full name.</p>
                              )}
                              {msg.attachment.data.step === 'email' && (
                                <p>Next, please enter your email address.</p>
                              )}
                              {msg.attachment.data.step === 'password' && (
                                <p>Almost done! Please create a secure password for your account.</p>
                              )}
                              {msg.attachment.data.step === 'confirmation' && (
                                <div className="cyber-signup-summary">
                                  <p>Please review your information:</p>
                                  <div className="cyber-signup-data">
                                    <div><span>Username:</span> {msg.attachment.data.formData.username}</div>
                                    {msg.attachment.data.formData.fullname && (
                                      <div><span>Full Name:</span> {msg.attachment.data.formData.fullname}</div>
                                    )}
                                    <div><span>Email:</span> {msg.attachment.data.formData.email}</div>
                                    <div><span>Password:</span> ••••••••</div>
                                  </div>
                                  <p>Type "confirm" to create your account.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Link attachment */}
                        {msg.attachment.type === 'link' && (
                          <div className="cyber-link-attachment">
                            <a 
                              href={msg.attachment.data.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="cyber-attachment-link"
                            >
                              <div className="cyber-attachment-icon">
                                <i className={`fas fa-${msg.attachment.data.icon || 'link'}`}></i>
                              </div>
                              <div className="cyber-attachment-content">
                                <div className="cyber-attachment-title">{msg.attachment.data.title}</div>
                                <div className="cyber-attachment-desc">{msg.attachment.data.description}</div>
                              </div>
                              <div className="cyber-attachment-arrow">
                                <i className="fas fa-chevron-right"></i>
                              </div>
                              <div className="cyber-scan-line"></div>
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {!isBot && (
                    <div className="cyber-avatar cyber-user-avatar">
                      <div className="cyber-avatar-icon">
                        <i className="fas fa-user"></i>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Loading indicator */}
          {isThinking && (
            <div className="cyber-thinking-indicator">
              <div className="cyber-neural-thinking">
                <div className="cyber-thinking-avatar">
                  <div className="cyber-avatar-icon">
                    <i className="fas fa-robot"></i>
                  </div>
                  <div className="cyber-thinking-pulse"></div>
                </div>
                
                <div className="cyber-thinking-process">
                  <div className="cyber-thinking-text">Thinking...</div>
                  <div className="cyber-thinking-animation">
                    <div className="cyber-synapse cyber-synapse-1"></div>
                    <div className="cyber-synapse cyber-synapse-2"></div>
                    <div className="cyber-synapse cyber-synapse-3"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Quick replies */}
          {getQuickReplies()}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Container */}
        <div className="cyber-input-container">
          {/* Show signup state indicator if in signup flow */}
          {isSignupMode && signupState !== 'initial' && signupState !== 'registration_complete' && (
            <div className="cyber-signup-indicator">
              <div className="cyber-signup-icon">
                <i className="fas fa-user-plus"></i>
              </div>
              <div className="cyber-signup-status">
                <div className="cyber-signup-label">Account Creation In Progress</div>
                <div className="cyber-signup-progress">
                  {(signupState === 'username' || signupState === 'collecting_username') && 'Step 1: Username'}
                  {(signupState === 'fullname' || signupState === 'collecting_fullname') && 'Step 2: Full Name'}
                  {(signupState === 'email' || signupState === 'collecting_email') && 'Step 3: Email'}
                  {(signupState === 'password' || signupState === 'collecting_password') && 'Step 4: Password'}
                  {signupState === 'confirmation' && 'Step 5: Confirmation'}
                </div>
              </div>
            </div>
          )}
          
          {/* Reset signup button */}
          {isSignupMode && signupState !== 'initial' && signupState !== 'registration_complete' && (
            <button 
              className="cyber-reset-button"
              onClick={resetSignupFlow}
              title="Reset signup process"
            >
              <i className="fas fa-redo-alt"></i>
              <span>Reset Signup</span>
            </button>
          )}
          
          <div className={`cyber-input-wrapper ${isFocused ? 'cyber-focused' : ''} ${loading ? 'cyber-disabled' : ''}`}>
            {renderInputField()}
            
            <button
              className="cyber-send-button"
              onClick={handleSend}
              disabled={!message.trim() || loading}
            >
              <svg className="cyber-send-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              
              <div className="cyber-button-glow"></div>
            </button>
            
            {/* Decorative corners */}
            <div className="cyber-corner cyber-corner-tl"></div>
            <div className="cyber-corner cyber-corner-tr"></div>
            <div className="cyber-corner cyber-corner-bl"></div>
            <div className="cyber-corner cyber-corner-br"></div>
          </div>
          
          {/* Keyboard shortcuts info */}
          <div className="cyber-keyboard-info">
            <span className="cyber-key">Enter</span> to send
            <span className="cyber-divider">|</span>
            <span className="cyber-key">Shift</span> + <span className="cyber-key">Enter</span> for line break
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Core cyberpunk styling */
        .cyber-chat-interface {
          min-height: 100vh;
          background-color: rgba(15, 23, 42, 0.95);
          font-family: 'JetBrains Mono', monospace;
          position: relative;
          overflow: hidden;
          color: rgb(226, 232, 240);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 0;
        }
        
        /* Animated Background Elements */
        .cyber-particles-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        
        .cyber-particle {
          position: absolute;
          background: linear-gradient(45deg, rgb(6, 182, 212), rgb(79, 70, 229));
          border-radius: 50%;
          animation: float-around infinite linear;
        }
        
        @keyframes float-around {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(50px, -20px) rotate(90deg);
          }
          50% {
            transform: translate(0, -40px) rotate(180deg);
          }
          75% {
            transform: translate(-50px, -20px) rotate(270deg);
          }
          100% {
            transform: translate(0, 0) rotate(360deg);
          }
        }
        
        .cyber-grid-lines {
          position: fixed;
          inset: 0;
          z-index: 0;
          background-image: 
            linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: grid-move 30s linear infinite;
          opacity: 0.2;
        }
        
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        
        .cyber-glow-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.2;
          z-index: 0;
          transition: transform 0.5s ease-out;
        }
        
        .cyber-glow-orb-1 {
          top: 15%;
          left: 15%;
          width: 16rem;
          height: 16rem;
          background: rgb(6, 182, 212);
          animation: float 8s ease-in-out infinite;
        }
        
        .cyber-glow-orb-2 {
          bottom: 20%;
          right: 15%;
          width: 18rem;
          height: 18rem;
          background: rgb(79, 70, 229);
          animation: float 10s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        
        /* Chat Container */
        .cyber-chat-container {
          position: relative;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                      0 2px 4px -1px rgba(0, 0, 0, 0.06),
                      0 0 0 1px rgba(6, 182, 212, 0.1) inset,
                      0 0 20px rgba(6, 182, 212, 0.1);
          display: flex;
          flex-direction: column;
          height: calc(100vh - 4rem);
          z-index: 10;
          overflow: hidden;
        }
        
        /* Chat Header */
        .cyber-chat-header {
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(6, 182, 212, 0.3);
          background: rgba(15, 23, 42, 0.8);
        }
        
        .cyber-chat-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .cyber-bot-avatar {
          position: relative;
          width: 3rem;
          height: 3rem;
        }
        
        .cyber-bot-avatar-icon {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
          border-radius: 1rem;
          color: rgba(15, 23, 42, 0.9);
          font-size: 1.5rem;
          z-index: 2;
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
        }
        
        .cyber-bot-avatar-pulse {
          position: absolute;
          inset: -0.25rem;
          border-radius: 1.25rem;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.5) 0%, rgba(79, 70, 229, 0.5) 100%);
          z-index: 1;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.1); }
          100% { opacity: 0.5; transform: scale(1); }
        }
        
        .cyber-title-content {
          display: flex;
          flex-direction: column;
        }
        
        .cyber-title-text {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(90deg, rgb(6, 182, 212) 0%, rgb(79, 70, 229) 50%, rgb(124, 58, 237) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          line-height: 1.2;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }
        
        .cyber-blink {
          animation: blink 1s step-end infinite;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .cyber-bot-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .cyber-status-indicator {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
        }
        
        .cyber-online {
          background: rgb(16, 185, 129);
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
        }
        
        .cyber-status-text {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
        }
        
        /* Header Actions */
        .cyber-header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .cyber-clear-button {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 0.375rem;
          color: rgba(239, 68, 68, 0.9);
          font-size: 0.875rem;
          transition: all 0.3s;
          overflow: hidden;
        }
        
        .cyber-clear-button:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.3);
          border-color: rgba(239, 68, 68, 0.6);
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
          transform: translateY(-2px);
        }
        
        .cyber-clear-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .cyber-button-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Messages Container */
        .cyber-messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="0.5" fill="rgba(6, 182, 212, 0.05)"/></svg>');
        }
        
        /* Scrollbar Styling */
        .cyber-messages-container::-webkit-scrollbar {
          width: 0.375rem;
        }
        
        .cyber-messages-container::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.4);
        }
        
        .cyber-messages-container::-webkit-scrollbar-thumb {
          background: linear-gradient(
            to bottom,
            rgba(6, 182, 212, 0.8),
            rgba(79, 70, 229, 0.8)
          );
          border-radius: 0.25rem;
        }
        
        /* Messages */
        .cyber-message {
          display: flex;
          flex-direction: column;
          max-width: 100%;
        }
        
        .cyber-message-container {
          display: flex;
          gap: 1rem;
          width: 100%;
        }
        
        .cyber-user-message .cyber-message-container {
          justify-content: flex-end;
        }
        
        .cyber-avatar {
          position: relative;
          width: 2.5rem;
          height: 2.5rem;
          flex-shrink: 0;
        }
        
        .cyber-message-content {
          display: flex;
          flex-direction: column;
          max-width: calc(100% - 7rem); /* Account for avatars on both sides */
        }
        
        .cyber-message-bubble {
          position: relative;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          padding: 1rem;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .cyber-message:hover .cyber-message-bubble {
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-user-bubble {
          background: rgba(79, 70, 229, 0.2);
          border-color: rgba(79, 70, 229, 0.3);
        }
        
        .cyber-user-message:hover .cyber-message-bubble {
          border-color: rgba(79, 70, 229, 0.5);
          box-shadow: 0 0 15px rgba(79, 70, 229, 0.2);
        }
        
        .cyber-bot-bubble {
          background: rgba(6, 182, 212, 0.1);
        }
        
        .cyber-message-text {
          font-size: 0.9375rem;
          color: rgba(226, 232, 240, 0.9);
          line-height: 1.5;
        }
        
        .cyber-message-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.5rem;
          padding: 0 0.5rem;
        }
        
        .cyber-message-time {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.5);
        }
        
        .cyber-time-icon {
          width: 0.875rem;
          height: 0.875rem;
        }
        
        .cyber-message-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .cyber-action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.75rem;
          height: 1.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.25rem;
          color: rgba(226, 232, 240, 0.7);
          font-size: 0.875rem;
          transition: all 0.3s;
        }
        
        .cyber-action-button:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.5);
          color: rgba(226, 232, 240, 0.9);
          transform: translateY(-2px);
        }
        
        .message-link {
          color: rgb(6, 182, 212);
          text-decoration: underline;
          text-decoration-color: rgba(6, 182, 212, 0.5);
          text-underline-offset: 2px;
          transition: all 0.3s;
        }
        
        .message-link:hover {
          text-decoration-color: rgb(6, 182, 212);
          color: rgb(14, 165, 233);
        }
        
        /* Thinking Indicator */
        .cyber-thinking-indicator {
          display: flex;
          justify-content: flex-start;
          width: 100%;
          margin: 0.5rem 0;
        }
        
        .cyber-neural-thinking {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          width: auto;
          max-width: 50%;
        }
        
        .cyber-thinking-avatar {
          position: relative;
          width: 2rem;
          height: 2rem;
          flex-shrink: 0;
        }
        
        .cyber-thinking-pulse {
          position: absolute;
          inset: -0.25rem;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.2);
          animation: thinking-pulse 1.5s infinite;
        }
        
        @keyframes thinking-pulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.2; }
          100% { transform: scale(1); opacity: 0.5; }
        }
        
        .cyber-thinking-process {
          display: flex;
          flex-direction: column;
        }
        
        .cyber-thinking-text {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.7);
          margin-bottom: 0.5rem;
        }
        
        .cyber-thinking-animation {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .cyber-synapse {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          animation: synapse 1.5s infinite;
        }
        
        .cyber-synapse-1 {
          background: rgb(6, 182, 212);
          animation-delay: 0s;
        }
        
        .cyber-synapse-2 {
          background: rgb(79, 70, 229);
          animation-delay: 0.2s;
        }
        
        .cyber-synapse-3 {
          background: rgb(124, 58, 237);
          animation-delay: 0.4s;
        }
        
        @keyframes synapse {
          0%, 60%, 100% { transform: scale(1); opacity: 1; }
          30% { transform: scale(2); opacity: 0.5; }
        }
        
        /* Input Container */
        .cyber-input-container {
          padding: 1rem 1.5rem;
          background: rgba(15, 23, 42, 0.8);
          border-top: 1px solid rgba(6, 182, 212, 0.3);
        }
        
        .cyber-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          padding: 0.75rem;
          transition: all 0.3s;
          overflow: hidden;
        }
        
        .cyber-focused {
          border-color: rgba(6, 182, 212, 0.8);
          box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.2) inset,
                      0 0 15px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-disabled {
          opacity: 0.7;
          pointer-events: none;
        }
        
        .cyber-input-field {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: rgba(226, 232, 240, 0.9);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9375rem;
          line-height: 1.5;
          resize: none;
          max-height: 150px;
          padding: 0.25rem;
        }
        
        .cyber-input-field::placeholder {
          color: rgba(226, 232, 240, 0.5);
        }
        
        .cyber-send-button {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          padding: 0.5rem 1rem;
          color: rgb(6, 182, 212);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.3s;
          overflow: hidden;
        }
        
        .cyber-send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .cyber-send-button:not(:disabled):hover {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(79, 70, 229, 0.3) 100%);
          border-color: rgba(6, 182, 212, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                      0 2px 4px -1px rgba(0, 0, 0, 0.06),
                      0 0 10px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-send-button .cyber-send-icon {
          width: 1.25rem;
          height: 1.25rem;
        }
        
        .cyber-keyboard-info {
          display: flex;
          justify-content: center;
          margin-top: 0.75rem;
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.5);
        }
        
        .cyber-key {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.25rem;
          padding: 0.125rem 0.25rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
          margin: 0 0.25rem;
        }
        
        .cyber-divider {
          margin: 0 0.5rem;
          color: rgba(226, 232, 240, 0.3);
        }
        
        /* Cyber corners */
        .cyber-corner {
          position: absolute;
          width: 8px;
          height: 8px;
          z-index: 1;
        }
        
        .cyber-corner-tl {
          top: -1px;
          left: -1px;
          border-top: 2px solid rgb(6, 182, 212);
          border-left: 2px solid rgb(6, 182, 212);
        }
        
        .cyber-corner-tr {
          top: -1px;
          right: -1px;
          border-top: 2px solid rgb(6, 182, 212);
          border-right: 2px solid rgb(6, 182, 212);
        }
        
        .cyber-corner-bl {
          bottom: -1px;
          left: -1px;
          border-bottom: 2px solid rgb(6, 182, 212);
          border-left: 2px solid rgb(6, 182, 212);
        }
        
        .cyber-corner-br {
          bottom: -1px;
          right: -1px;
          border-bottom: 2px solid rgb(6, 182, 212);
          border-right: 2px solid rgb(6, 182, 212);
        }
        
        /* Quick Replies */
        .cyber-quick-replies {
          width: 100%;
          margin: 1rem 0;
          padding: 0.5rem;
        }
        
        .cyber-quick-replies-label {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.7);
          margin-bottom: 0.75rem;
        }
        
        .cyber-quick-replies-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        
        .cyber-quick-reply-button {
          position: relative;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          padding: 0.625rem 1rem;
          color: rgba(226, 232, 240, 0.9);
          font-size: 0.875rem;
          transition: all 0.3s;
          overflow: hidden;
          text-align: left;
          max-width: 250px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .cyber-quick-reply-button:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
        }
        
        /* Feedback UI */
        .cyber-feedback-ui {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          margin: 0.5rem 0 1rem 3.5rem;
          animation: slideDown 0.3s ease-out forwards;
          max-width: 90%;
        }
        
        @keyframes slideDown {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .cyber-feedback-prompt {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-feedback-buttons {
          display: flex;
          gap: 0.5rem;
        }
        
        .cyber-feedback-button {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          transition: all 0.3s;
        }
        
        .cyber-feedback-up {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: rgb(16, 185, 129);
        }
        
        .cyber-feedback-up:hover {
          background: rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.6);
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
        }
        
        .cyber-feedback-down {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: rgb(239, 68, 68);
        }
        
        .cyber-feedback-down:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.6);
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
        }
        
        .cyber-feedback-display {
          font-size: 0.875rem;
        }
        
        .cyber-feedback-up {
          color: rgb(16, 185, 129);
        }
        
        .cyber-feedback-down {
          color: rgb(239, 68, 68);
        }
        
        /* Signup Indicator */
        .cyber-signup-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(79, 70, 229, 0.1);
          border: 1px solid rgba(79, 70, 229, 0.3);
          border-radius: 0.375rem;
          animation: pulse 2s infinite;
        }
        
        .cyber-signup-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: rgba(79, 70, 229, 0.2);
          border-radius: 50%;
          color: rgb(79, 70, 229);
          font-size: 1.25rem;
        }
        
        .cyber-signup-status {
          display: flex;
          flex-direction: column;
        }
        
        .cyber-signup-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: rgb(79, 70, 229);
        }
        
        .cyber-signup-progress {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
        }
        
        /* Reset signup button */
        .cyber-reset-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          padding: 0.5rem 0.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 0.375rem;
          color: rgba(239, 68, 68, 0.9);
          font-size: 0.875rem;
          transition: all 0.3s;
        }
        
        .cyber-reset-button:hover {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(239, 68, 68, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
        }
        
        /* Special styling for password input during signup */
        .cyber-password-toggle {
          position: absolute;
          right: 3.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: rgba(226, 232, 240, 0.5);
          cursor: pointer;
        }
        
        .cyber-password-toggle:hover {
          color: rgb(6, 182, 212);
        }
        
        /* Attachments */
        .cyber-attachment {
          margin-top: 1rem;
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        /* Signup Form Attachment */
        .cyber-signup-form {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(79, 70, 229, 0.3);
          border-radius: 0.5rem;
          padding: 1rem;
        }
        
        .cyber-signup-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        
        .cyber-signup-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: rgba(79, 70, 229, 0.2);
          border-radius: 0.5rem;
          color: rgb(79, 70, 229);
          font-size: 1.25rem;
        }
        
        .cyber-signup-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: rgb(79, 70, 229);
          margin: 0;
        }
        
        .cyber-signup-info {
          font-size: 0.9375rem;
          color: rgba(226, 232, 240, 0.9);
        }
        
        .cyber-signup-summary {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .cyber-signup-data {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background: rgba(15, 23, 42, 0.4);
          border-radius: 0.375rem;
          padding: 0.75rem;
        }
        
        .cyber-signup-data div {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }
        
        .cyber-signup-data span {
          color: rgba(226, 232, 240, 0.7);
          margin-right: 0.5rem;
        }
        
        /* Link Attachment */
        .cyber-link-attachment {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          overflow: hidden;
          transition: all 0.3s;
          position: relative;
        }
        
        .cyber-link-attachment:hover {
          transform: translateY(-2px);
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.6);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-attachment-link {
          display: flex;
          align-items: center;
          padding: 1rem;
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
        }
        
        .cyber-attachment-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: rgba(6, 182, 212, 0.1);
          border-radius: 50%;
          color: rgb(6, 182, 212);
          margin-right: 1rem;
          flex-shrink: 0;
        }
        
        .cyber-attachment-content {
          flex: 1;
        }
        
        .cyber-attachment-title {
          font-size: 0.9375rem;
          font-weight: 600;
          color: rgb(6, 182, 212);
          margin-bottom: 0.25rem;
        }
        
        .cyber-attachment-desc {
          font-size: 0.8125rem;
          color: rgba(226, 232, 240, 0.7);
        }
        
        .cyber-attachment-arrow {
          color: rgba(226, 232, 240, 0.5);
          margin-left: 0.75rem;
          transition: transform 0.2s;
        }
        
        .cyber-attachment-link:hover .cyber-attachment-arrow {
          transform: translateX(4px);
          color: rgb(6, 182, 212);
        }
        
        /* Scan line animation for cyberpunk effect */
        .cyber-scan-line {
          position: absolute;
          top: 0;
          left: -100%;
          width: 80%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(6, 182, 212, 0) 0%,
            rgba(6, 182, 212, 0.8) 50%,
            rgba(6, 182, 212, 0) 100%
          );
          animation: scanline 2s linear infinite;
          opacity: 0;
        }
        
        .cyber-link-attachment:hover .cyber-scan-line {
          opacity: 1;
        }
        
        @keyframes scanline {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        
        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .cyber-chat-container {
            height: calc(100vh - 2rem);
            border-radius: 0;
            box-shadow: none;
          }
          
          .cyber-message-content {
            max-width: calc(100% - 4rem);
          }
          
          .cyber-neural-thinking {
            max-width: 80%;
          }
          
          .cyber-quick-replies-container {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default FAQChatInterface;