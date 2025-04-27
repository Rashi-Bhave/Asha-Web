// Frontend/src/Components/Chat/NeuralChatInterface.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import './ChatStyles.css'; // Import CSS file
import { MessageAttachment, EnhancedMessage, IntentDetector } from './ChatUIComponents';
import { useNavigate } from 'react-router-dom';
import ChatBubble from '../ChatBubble/ChatBubbleWithoutModal.jsx';
import AnalyticsModal from '../Analytics/AnalyticsModal';


const NeuralChatInterface = () => {
  // Basic state management
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showActions, setShowActions] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [neuralSuggestions, setNeuralSuggestions] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [neuralMode, setNeuralMode] = useState('balanced'); // 'creative', 'balanced', 'precise'
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMessageExpanded, setIsMessageExpanded] = useState(false);
  
  // Advanced AI features state
  const [aiPersona, setAiPersona] = useState('assistant'); // 'assistant', 'coach', 'mentor', 'analyst'
  const [confidenceDisplay, setConfidenceDisplay] = useState(true);
  const [sentimentAnalysis, setSentimentAnalysis] = useState(true);
  const [contextMemory, setContextMemory] = useState(true);
  const [isAutoCompleteEnabled, setIsAutoCompleteEnabled] = useState(true);
  const [autoCompleteSuggestion, setAutoCompleteSuggestion] = useState('');
  const [conversationTopics, setConversationTopics] = useState([]);
  const [aiExplanations, setAiExplanations] = useState({});
  const [showExplanationPanel, setShowExplanationPanel] = useState(false);
  const [activeFeedbackId, setActiveFeedbackId] = useState(null);
  const [messageFeedback, setMessageFeedback] = useState({});
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const [knowledgeGraph, setKnowledgeGraph] = useState(null);
  const [activeMessageForKG, setActiveMessageForKG] = useState(null);
  const [latestBotMessageId, setLatestBotMessageId] = useState(null);

  
  // Multi-turn conversation state
  const [conversationContext, setConversationContext] = useState({
    currentTopic: null,
    detectedIntent: null,
    followupExpected: false,
    openQuestions: [],
    recentEntities: [],
    conversationDepth: 0,
    userPreferences: {}
  });
  const [conversationThreads, setConversationThreads] = useState([]);
  const [activeThread, setActiveThread] = useState('main');
  const [threadColors, setThreadColors] = useState({ main: 'rgb(6, 182, 212)' });
  const [showFollowupSuggestions, setShowFollowupSuggestions] = useState(false);
  const [followupSuggestions, setFollowupSuggestions] = useState([]);
  const [conversationSummary, setConversationSummary] = useState('');
  const [showConversationInsights, setShowConversationInsights] = useState(false);


  const [signupState, setSignupState] = useState('initial');
  const [signupData, setSignupData] = useState({});
  const [isSignupMode, setIsSignupMode] = useState(false);

  const [passwordVisible, setPasswordVisible] = useState(false);

  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);
  const audioVisualRef = useRef(null);
  const recognitionRef = useRef(null);
  const autoCompleteTimeoutRef = useRef(null);
  const knowledgeGraphRef = useRef(null);

  const isAdmin = useRef(false);

  useEffect(() => {
    // This is just a simple check - replace with your actual admin verification
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Assuming the token is a JWT and contains user role info
        const decoded = JSON.parse(atob(token.split('.')[1]));
        isAdmin.current = decoded.role === 'admin' || decoded.isAdmin === true;
      } catch (e) {
        console.error("Error checking admin status:", e);
        isAdmin.current = true;
      }
    }
  }, []);


  const navigate = useNavigate();

  const handleNavigation = (url) => {
    navigate(url);
  };
  
  // API URL
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';

  // Chat suggestions
  const suggestions = [
    {
      id: 'career-growth',
      text: 'How can I advance in my software engineering career?',
      icon: 'fa-chart-line'
    },
    {
      id: 'job-search',
      text: 'Find me SDE jobs in Bangalore',
      icon: 'fa-search'
    },
    {
      id: 'interview-prep',
      text: 'I need to prepare for a product manager interview',
      icon: 'fa-user-tie'
    },
    {
      id: 'coding-challenge',
      text: 'Help me practice array coding problems',
      icon: 'fa-code'
    },
    {
      id: 'events',
      text: 'Are there any tech conferences happening next month?',
      icon: 'fa-calendar-alt'
    },
    {
      id: 'mentorship',
      text: 'I\'m looking for a mentor in AI/ML field',
      icon: 'fa-users'
    },
    {
      id: 'signup',
      text: 'I want to create a new account',
      icon: 'fa-user-plus'
    }

  ];

  // AI Personas configuration
  const aiPersonas = {
    assistant: {
      name: 'Asha Bot',
      icon: 'fa-robot',
      description: 'Balanced, helpful responses for general inquiries',
      color: 'rgb(6, 182, 212)'
    },
    coach: {
      name: 'Career Coach',
      icon: 'fa-user-tie',
      description: 'Motivational, career-focused guidance and advice',
      color: 'rgb(16, 185, 129)'
    },
    mentor: {
      name: 'Technical Mentor',
      icon: 'fa-laptop-code',
      description: 'In-depth technical expertise and detailed explanations',
      color: 'rgb(139, 92, 246)'
    },
    analyst: {
      name: 'Data Analyst',
      icon: 'fa-chart-bar',
      description: 'Data-driven insights and analytical perspectives',
      color: 'rgb(79, 70, 229)'
    }
  };

  const toggleAnalyticsModal = () => {
    setShowAnalyticsModal(prev => !prev);
  };

  // Track mouse movement for background effects
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showModeDropdown && 
          !event.target.closest('.cyber-mode-dropdown')) {
        setShowModeDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModeDropdown]);

  // Initialize speech recognition if supported
  // useEffect(() => {
  //   if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  //     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  //     recognitionRef.current = new SpeechRecognition();
  //     recognitionRef.current.continuous = true;
  //     recognitionRef.current.interimResults = true;
      
  //     recognitionRef.current.onresult = (event) => {
  //       let interimTranscript = '';
  //       let finalTranscript = '';
        
  //       for (let i = event.resultIndex; i < event.results.length; i++) {
  //         const transcript = event.results[i][0].transcript;
  //         if (event.results[i].isFinal) {
  //           finalTranscript += transcript;
  //         } else {
  //           interimTranscript += transcript;
  //         }
  //       }
        
  //       if (finalTranscript) {
  //         setMessage(prevMessage => prevMessage + ' ' + finalTranscript.trim());
  //       } else if (interimTranscript) {
  //         // Update UI to show interim results if needed
  //       }
  //     };
      
  //     recognitionRef.current.onend = () => {
  //       if (isListening) {
  //         recognitionRef.current.start();
  //       } else {
  //         setIsListening(false);
  //       }
  //     };
      
  //     setIsSpeechEnabled(true);
  //   }
  // }, []);

  // Fetch chat history on component mount
  useEffect(() => {
    fetchChatHistory();
    createParticles();
    if (knowledgeGraphRef.current) initializeKnowledgeGraph();
  }, []);

  // Update conversation context when messages change
  useEffect(() => {
    if (messages.length > 0) {
      extractConversationTopics(messages);
      updateConversationContext(messages);
      if (messages.length % 6 === 0) { // Every 6 messages
        generateConversationSummary(messages);
      }
      
      // Check if the last message is from the bot
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.sender === 'bot') {
        generateFollowupSuggestions(lastMessage.text);
      } else {
        setShowFollowupSuggestions(false);
      }
    }
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Adjust textarea height on content change
  useEffect(() => {
    if (textareaRef.current) {
      adjustTextareaHeight();
    }
  }, [message]);

  // Auto-complete functionality
  useEffect(() => {
    if (!isAutoCompleteEnabled || message.length < 3 || loading) {
      setAutoCompleteSuggestion('');
      return;
    }

    clearTimeout(autoCompleteTimeoutRef.current);
    
    autoCompleteTimeoutRef.current = setTimeout(() => {
      // In a real implementation, this would call an API to get predictions
      // Here we'll just simulate it with a simple implementation
      generateAutoComplete(message);
    }, 500);

    return () => clearTimeout(autoCompleteTimeoutRef.current);
  }, [message, isAutoCompleteEnabled, loading]);

  // Initialize audio visualization
  useEffect(() => {
    if (audioVisualRef.current && isListening) {
      visualizeAudio();
    }
  }, [isListening]);

  // // Initialize knowledge graph visualization
  // const initializeKnowledgeGraph = () => {
  //   if (!knowledgeGraphRef.current) return;
    
  //   // This would be a visualization library like D3 or Sigma.js
  //   // For this example we'll create a placeholder implementation
  //   const showGraph = (topics) => {
  //     // In a real implementation, this would create a graph visualization
  //     setKnowledgeGraph({
  //       nodes: topics.map((topic, i) => ({
  //         id: i,
  //         label: topic,
  //         size: 10 + Math.random() * 20,
  //         color: `hsl(${180 + i * 30}, 80%, 60%)`
  //       })),
  //       edges: topics.map((_, i) => {
  //         if (i === 0) return null;
  //         return {
  //           source: i,
  //           target: Math.floor(Math.random() * i)
  //         };
  //       }).filter(Boolean)
  //     });
  //   };
    
  //   showGraph(['Career', 'Software Engineering', 'Data Science', 'AI', 'Machine Learning']);
  // };


  const initializeKnowledgeGraph = () => {
    if (!knowledgeGraphRef.current) return;
    
    // Set initial knowledge graph data
    setKnowledgeGraph({
      nodes: conversationTopics.length > 0 ? 
        conversationTopics.map((topic, i) => ({
          id: i,
          label: topic,
          size: 10 + Math.random() * 20,
          color: `hsl(${180 + i * 30}, 80%, 60%)`
        })) : 
        ['Career', 'Software Engineering', 'Data Science', 'AI', 'Machine Learning'].map((topic, i) => ({
          id: i,
          label: topic,
          size: 10 + Math.random() * 20,
          color: `hsl(${180 + i * 30}, 80%, 60%)`
        })),
      edges: (conversationTopics.length > 0 ? conversationTopics : ['Career', 'Software Engineering', 'Data Science', 'AI', 'Machine Learning']).map((_, i) => {
        if (i === 0) return null;
        return {
          source: i,
          target: Math.floor(Math.random() * i)
        };
      }).filter(Boolean)
    });
  };

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

  // Generate conversation summary
  const generateConversationSummary = (messages) => {
    // In a real implementation, this would use an AI API
    // Here we'll simulate a summary based on detected topics
    
    if (conversationTopics.length === 0) return;
    
    const topicText = conversationTopics.join(', ');
    const messageCount = messages.length;
    const userMessages = messages.filter(m => m.sender === 'user').length;
    
    const summaries = [
      `Conversation focused on ${topicText} with ${messageCount} exchanges.`,
      `User has inquired about ${topicText} through ${userMessages} messages.`,
      `Dialogue covers ${topicText} with multiple follow-up questions.`,
      `Discussion exploring ${topicText} with detailed exchanges on each topic.`
    ];
    
    setConversationSummary(summaries[Math.floor(Math.random() * summaries.length)]);
  };

  // Update conversation context based on message content
  const updateConversationContext = (messages) => {
    if (messages.length < 2) return;
    
    const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user');
    const lastBotMessage = [...messages].reverse().find(m => m.sender === 'bot');
    
    if (!lastUserMessage || !lastBotMessage) return;
    
    // Detect if there's an open question from the bot that needs a follow-up
    const hasQuestion = lastBotMessage.text.includes('?');
    
    // Basic intent detection (in a real implementation, this would use NLP)
    let detectedIntent = 'information';
    if (lastUserMessage.text.toLowerCase().includes('how')) {
      detectedIntent = 'instruction';
    } else if (lastUserMessage.text.toLowerCase().includes('help')) {
      detectedIntent = 'assistance';
    } else if (lastUserMessage.text.toLowerCase().includes('thank')) {
      detectedIntent = 'gratitude';
    }
    
    // Extract potential entities (this would use NER in a real implementation)
    const potentialEntities = ['resume', 'job', 'interview', 'skills', 'career']
      .filter(entity => lastUserMessage.text.toLowerCase().includes(entity));
    
    // Calculate conversation depth
    const conversationDepth = Math.min(5, Math.floor(messages.length / 2));
    
    // Update context
    setConversationContext(prev => ({
      ...prev,
      currentTopic: conversationTopics[0] || prev.currentTopic,
      detectedIntent,
      followupExpected: hasQuestion,
      openQuestions: hasQuestion ? 
        [...prev.openQuestions, lastBotMessage.text.match(/[^.!?]+\?/g)?.[0] || 'Follow-up question'] : 
        prev.openQuestions,
      recentEntities: [...new Set([...potentialEntities, ...prev.recentEntities])].slice(0, 5),
      conversationDepth,
    }));
  };

  // Generate follow-up suggestions based on the conversation
  const generateFollowupSuggestions = (lastBotMessage) => {
    // In a real implementation, this would use an AI API to generate contextual follow-ups
    // Here we'll use a simple template-based approach
    
    if (!contextMemory) {
      setShowFollowupSuggestions(false);
      return;
    }
    
    // Extract potential topics from the last bot message
    const topics = conversationTopics;
    if (!topics || topics.length === 0) return;
    
    const suggestions = [];
    
    // Generate follow-ups based on the primary topic
    const primaryTopic = topics[0].toLowerCase();
    
    if (primaryTopic.includes('career') || primaryTopic.includes('job')) {
      suggestions.push(
        "What specific skills should I focus on developing?",
        "How do I stand out in a competitive job market?",
        "Can you suggest resources for career advancement?"
      );
    } else if (primaryTopic.includes('interview')) {
      suggestions.push(
        "What are common mistakes to avoid during interviews?",
        "How should I prepare for behavioral questions?",
        "Can you help me with a mock interview scenario?"
      );
    } else if (primaryTopic.includes('skill') || primaryTopic.includes('learn')) {
      suggestions.push(
        "What learning path do you recommend for beginners?",
        "Which resources are most effective for self-learning?",
        "How long does it typically take to become proficient?"
      );
    } else {
      // Generic follow-ups
      suggestions.push(
        "Can you elaborate more on this topic?",
        "What are the next steps I should take?",
        "Are there any resources you'd recommend?"
      );
    }
    
    // Add one context-specific follow-up based on conversation state
    if (conversationContext.recentEntities.length > 0) {
      const entity = conversationContext.recentEntities[0];
      suggestions.push(`Tell me more about how ${entity} relates to my career goals.`);
    }
    
    // Take 3 random suggestions
    const selectedSuggestions = suggestions
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    setFollowupSuggestions(selectedSuggestions);
    setShowFollowupSuggestions(true);
  };

  // Audio visualization function
  const visualizeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      source.connect(analyser);
      analyser.fftSize = 256;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const canvas = audioVisualRef.current;
      const canvasCtx = canvas.getContext('2d');
      
      const draw = () => {
        if (!isListening) return;
        
        requestAnimationFrame(draw);
        
        analyser.getByteFrequencyData(dataArray);
        
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] / 2;
          
          canvasCtx.fillStyle = `rgb(
            ${Math.min(barHeight + 100, 255)}, 
            ${Math.min(6 + barHeight/2, 255)}, 
            ${Math.min(212 + barHeight/4, 255)})`;
          canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          
          x += barWidth + 1;
        }
      };
      
      draw();
      
      return () => {
        stream.getTracks().forEach(track => track.stop());
        source.disconnect();
      };
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setIsListening(false);
    }
  };

  // Generate auto-complete suggestion
  const generateAutoComplete = (input) => {
    // Simple auto-complete simulation - in a real implementation
    // this would use a more sophisticated algorithm or API call
    
    const lastWord = input.split(' ').pop().toLowerCase();
    
    if (lastWord.length < 3) {
      setAutoCompleteSuggestion('');
      return;
    }
    
    const commonPhrases = {
      'how': ' can I improve my resume',
      'what': ' are the best practices for technical interviews',
      'can': ' you help me prepare for a coding interview',
      'i need': ' help with my career planning',
      'where': ' can I find good resources for learning',
      'when': ' should I consider changing jobs',
      'which': ' programming language should I learn next',
      'is it': ' a good time to start looking for new opportunities'
    };
    
    // Check if our input ends with any of the keys
    for (const [prefix, completion] of Object.entries(commonPhrases)) {
      if (input.toLowerCase().endsWith(prefix)) {
        setAutoCompleteSuggestion(completion);
        return;
      }
    }
    
    setAutoCompleteSuggestion('');
  };

  // Accept auto-complete suggestion
  const acceptAutoComplete = () => {
    if (!autoCompleteSuggestion) return;
    setMessage(message + autoCompleteSuggestion);
    setAutoCompleteSuggestion('');
  };

  // Create a new conversation thread
  const createNewThread = () => {
    const threadId = `thread-${Date.now()}`;
    const colors = [
      'rgb(16, 185, 129)', // green
      'rgb(245, 158, 11)', // amber
      'rgb(139, 92, 246)', // purple
      'rgb(236, 72, 153)', // pink
      'rgb(239, 68, 68)'   // red
    ];
    
    const threadColor = colors[Math.floor(Math.random() * colors.length)];
    
    setConversationThreads(prev => [...prev, threadId]);
    setThreadColors(prev => ({ ...prev, [threadId]: threadColor }));
    setActiveThread(threadId);
    
    // Create a welcome message for the new thread
    const welcomeMessage = {
      id: Date.now().toString(),
      text: `New conversation thread started. How can I help you with this topic?`,
      sender: 'bot',
      timestamp: new Date().toISOString(),
      thread: threadId,
      confidence: 95
    };
    
    setMessages(prev => [...prev, welcomeMessage]);
  };

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      setIsThinking(true);
      
      const response = await axios.get(`${API_URL}/chat/history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        // Add thread to messages if not present
        const messagesWithThreads = response.data.messages.map(msg => ({
          ...msg,
          thread: msg.thread || 'main'
        }));
        setMessages(messagesWithThreads);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      // Don't show error toast on initial load as it might be the first time
      if (!initialLoad) {
        toast.error('Failed to load chat history');
      }
    } finally {
      setLoading(false);
      setInitialLoad(false);
      setIsThinking(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set the height to match content (max 150px)
    const newHeight = Math.min(textarea.scrollHeight, 150);
    textarea.style.height = `${newHeight}px`;
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e) => {
    // Complete autocomplete suggestion with Tab
    if (e.key === 'Tab' && autoCompleteSuggestion) {
      e.preventDefault();
      acceptAutoComplete();
      return;
    }
    
    // Send message on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (message.trim() && !loading) {
      // Check if this might be a signup intent when not already in signup mode
      if (!isSignupMode && detectSignupIntent(message)) {
        console.log('Detected signup intent in message:', message);
        // Pre-set the signup mode before sending the message
        setIsSignupMode(true);
        setSignupState('initial');
      }
      
      sendMessage(message);
      setMessage('');
      
      // Focus back on textarea after sending
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const detectSignupIntent = (message) => {
    const signupKeywords = [
      'sign up', 'signup', 'register', 'create account', 'new account', 
      'join', 'become a member', 'registration', 'make an account',
      'sign me up', 'how do i sign up', 'how to register', 'get started'
    ];
    
    const lowerMessage = message.toLowerCase();
    return signupKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  const resetSignupFlow = () => {
    console.log('Resetting signup flow');
    setSignupState('initial');
    setSignupData({});
    setIsSignupMode(false);
    toast.info("Signup process has been reset. You can start over if you'd like.");
  };


  useEffect(() => {
    console.log('Signup state changed to:', signupState);
    console.log('Signup data updated:', signupData);
    
    // Special handling for password collection step
    if (signupState === 'collecting_password') {
      // Clear any autocomplete suggestions during password entry
      setAutoCompleteSuggestion('');
      
      // Force disabling speech recognition during password entry for security
      if (isListening) {
        toggleSpeechRecognition();
      }
    }
    
    // If registration is complete, show a success toast
    if (signupState === 'registration_complete') {
      toast.success("Account created successfully!", {
        duration: 5000,
        icon: '🎉'
      });
    }
  }, [signupState, signupData]);


  const renderInputField = () => {
    // For password input, use a special secure input
    if (signupState === 'collecting_password') {
      return (
        <>
          <textarea
            ref={textareaRef}
            type={passwordVisible ? 'text' : 'password'} // Toggle visibility
            className="cyber-input-field cyber-password-input"
            placeholder="Enter password (at least 8 characters)..."
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={loading}
            rows={1}
            style={{
              // Mask characters unless visible
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
        ref={textareaRef}
        className="cyber-input-field"
        placeholder={isSignupMode ? 
          getSignupPlaceholder() : 
          "Enter neural query..."}
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


  const getSignupPlaceholder = () => {
    switch (signupState) {
      case 'collecting_username':
        return "Enter desired username (at least 3 characters)...";
      case 'collecting_fullname':
        return "Enter your full name...";
      case 'collecting_email':
        return "Enter your email address...";
      case 'collecting_password':
        return "Enter password (at least 8 characters)...";
      case 'registration_complete':
        return "Type a message...";
      default:
        return "Enter message...";
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    
    // Create the user message
    const userMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
      thread: activeThread,
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setLoading(true);
    setIsThinking(true);
    setShowFollowupSuggestions(false);
    
    try {
      // Get the recent conversation context
      const recentMessages = messages.slice(-5).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      recentMessages.push({
        role: 'user',
        content: text
      });
      
      // Log current signup state before constructing context
      console.log('Sending message with signup state:', signupState);
      console.log('Sending message with signup data:', signupData);
      
      // Build context object with signup flow data
      const contextObj = {
        recentMessages,
        conversationDepth: conversationContext.conversationDepth,
        detectedIntent: isSignupMode ? 'SignUp_Intent' : conversationContext.detectedIntent, // Force signup intent when in signup mode
        currentTopic: conversationContext.currentTopic,
        recentEntities: conversationContext.recentEntities,
        followupExpected: conversationContext.followupExpected,
        openQuestions: conversationContext.openQuestions,
        needsInsights: showConversationInsights,
        // Explicitly include signup state and data
        signupState: signupState,
        signupData: signupData
      };
      
      console.log('Sending context object:', JSON.stringify(contextObj));
      
      const response = await axios.post(`${API_URL}/chat/send`, 
        { 
          message: text, 
          mode: neuralMode,
          persona: aiPersona,
          context: contextObj,
          thread: activeThread
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined
          }
        }
      );
      
      console.log('Received response:', response.data);
      
      if (response.data.success) {
        // Update the user message with server data if available
        if (response.data.userMessage.sentiment) {
          userMessage.sentiment = response.data.userMessage.sentiment;
          
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === userMessage.id 
                ? { ...msg, sentiment: userMessage.sentiment } 
                : msg
            )
          );
        }
        
        // Create the bot message with additional metadata
        const botMessage = {
          ...response.data.botMessage,
          thread: activeThread,
          confidence: simulateConfidence(),
          sources: simulateSources(text),
          reasoning: simulateReasoning(text),
          // Make sure attachment is passed through:
          attachment: response.data.botMessage.attachment
        };
        
        // Add bot message from response
        setMessages(prevMessages => [...prevMessages, botMessage]);

        setLatestBotMessageId(botMessage.id);
        
        // Update AI explanations
        setAiExplanations(prev => ({
          ...prev,
          [botMessage.id]: {
            confidence: botMessage.confidence,
            sources: botMessage.sources,
            reasoning: botMessage.reasoning
          }
        }));
        
        // Update conversation topics if available
        if (response.data.topics && response.data.topics.length > 0) {
          setConversationTopics(response.data.topics);
        }
        
        // Update conversation insights if available
        if (response.data.insights) {
          setConversationSummary(response.data.insights.summary || '');
          setConversationContext(prev => ({
            ...prev,
            conversationDepth: response.data.insights.depth || prev.conversationDepth,
            recentEntities: response.data.insights.entities || prev.recentEntities,
            openQuestions: response.data.insights.openQuestions || prev.openQuestions
          }));
        }
        
        // CRITICAL FIX: Update signup state and data if available
        console.log('Response includes signupState:', response.data.signupState);
        console.log('Response includes signupData:', response.data.signupData);
        
        if (response.data.signupState !== undefined) {
          setSignupState(response.data.signupState);
          setIsSignupMode(response.data.signupState !== 'initial');
        }
        
        if (response.data.signupData !== undefined) {
          setSignupData(response.data.signupData);
        }
        
        // If registration completes successfully, check for a token in the response
        if (response.data.signupState === 'registration_complete' && response.data.token) {
          localStorage.setItem('token', response.data.token);
          // You might want to update your app's authentication state here
        }
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      // Add a generic error message from the bot
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error processing your request. Please try again.",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        thread: activeThread,
        confidence: 0
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
      setIsThinking(false);
    }
  };

  // Simple sentiment analysis (in a real implementation this would be done with NLP)
  const analyzeSentiment = (text) => {
    const positiveWords = ['happy', 'good', 'great', 'excellent', 'amazing', 'love', 'awesome', 'thanks'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'disappointed', 'poor', 'worst'];
    
    const lowerText = text.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) score += 1;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) score -= 1;
    });
    
    // Normalize to a range between -1 and 1
    const normalized = Math.max(-1, Math.min(1, score * 0.5));
    
    if (normalized > 0.3) return 'positive';
    if (normalized < -0.3) return 'negative';
    return 'neutral';
  };

  // Extract topics from conversation
  const extractConversationTopics = (messages) => {
    // In a real implementation, this would use NLP to extract topics
    // Here we'll use a simple keyword-based approach
    const keywords = [
      'career', 'job', 'interview', 'resume', 'skill', 'software', 
      'programming', 'coding', 'algorithm', 'data', 'AI', 'machine learning',
      'salary', 'experience', 'education', 'project', 'technical', 'leadership'
    ];
    
    const topicCounts = {};
    
    messages.forEach(msg => {
      const text = msg.text.toLowerCase();
      
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          topicCounts[keyword] = (topicCounts[keyword] || 0) + 1;
        }
      });
    });
    
    // Convert to array and sort by frequency
    const sortedTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic.charAt(0).toUpperCase() + topic.slice(1));
    
    setConversationTopics(sortedTopics);
  };

  // Simulate AI confidence level (in a real implementation this would come from the API)
  const simulateConfidence = () => {
    // Random confidence between 70% and 99%
    return Math.floor(Math.random() * 30) + 70;
  };

  // Simulate sources for AI responses (in a real implementation this would come from the API)
  const simulateSources = (query) => {
    const techSources = [
      { title: 'Stack Overflow', url: 'https://stackoverflow.com', relevance: 0.92 },
      { title: 'GitHub Documentation', url: 'https://docs.github.com', relevance: 0.87 },
      { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', relevance: 0.85 },
      { title: 'W3Schools', url: 'https://www.w3schools.com', relevance: 0.78 },
      { title: 'Dev.to Articles', url: 'https://dev.to', relevance: 0.74 }
    ];
    
    const careerSources = [
      { title: 'LinkedIn Career Advice', url: 'https://linkedin.com/learning', relevance: 0.94 },
      { title: 'Indeed Job Trends', url: 'https://indeed.com/trends', relevance: 0.91 },
      { title: 'Glassdoor Salary Data', url: 'https://glassdoor.com', relevance: 0.89 },
      { title: 'Harvard Business Review', url: 'https://hbr.org', relevance: 0.83 },
      { title: 'Career Builder', url: 'https://careerbuilder.com', relevance: 0.75 }
    ];
    
    // Choose sources based on query content
    const lowerQuery = query.toLowerCase();
    const sourcesToUse = lowerQuery.includes('job') || 
                       lowerQuery.includes('career') || 
                       lowerQuery.includes('interview') ? 
                       careerSources : techSources;
    
    // Return 2-3 random sources
    const numSources = Math.floor(Math.random() * 2) + 2;
    return sourcesToUse
      .sort(() => Math.random() - 0.5)
      .slice(0, numSources);
  };

  // Simulate AI reasoning (in a real implementation this would come from the API)
  const simulateReasoning = (query) => {
    // Simple template for reasoning
    const templates = [
      "I analyzed the query for key intent markers and identified the main request as related to {topic}. Based on my training data, I prioritized solutions that emphasize {focus}.",
      "My response is structured to address the core question about {topic} while providing context on related concepts. I've emphasized {focus} based on the query's specific terms.",
      "I detected uncertainty in the query around {topic}, so I provided a comprehensive explanation focusing on {focus} to establish foundational understanding.",
      "The query contains multiple sub-questions related to {topic}. I've organized my response to address each systematically, with emphasis on {focus} as it appears most relevant."
    ];
    
    // Extract topic and focus based on query
    let topic = 'career development';
    let focus = 'practical steps';
    
    if (query.toLowerCase().includes('code') || query.toLowerCase().includes('programming')) {
      topic = 'software development';
      focus = 'best practices and examples';
    } else if (query.toLowerCase().includes('interview')) {
      topic = 'interview preparation';
      focus = 'concrete strategies';
    } else if (query.toLowerCase().includes('job') || query.toLowerCase().includes('career')) {
      topic = 'career advancement';
      focus = 'industry trends and opportunities';
    }
    
    // Select a random template and populate it
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template.replace('{topic}', topic).replace('{focus}', focus);
  };

  const clearChat = async () => {
    if (window.confirm('Are you sure you want to clear the entire chat history?')) {
      try {
        setLoading(true);
        setIsThinking(true);
        
        const response = await axios.delete(`${API_URL}/chat/clear`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success) {
          setMessages([]);
          setMessageFeedback({});
          setConversationTopics([]);
          setAiExplanations({});
          setConversationContext({
            currentTopic: null,
            detectedIntent: null,
            followupExpected: false,
            openQuestions: [],
            recentEntities: [],
            conversationDepth: 0,
            userPreferences: {}
          });
          setConversationThreads([]);
          setActiveThread('main');
          setThreadColors({ main: 'rgb(6, 182, 212)' });
          toast.success('Neural connection reset successfully');
        } else {
          throw new Error(response.data.message || 'Failed to clear chat');
        }
      } catch (error) {
        console.error('Error clearing chat:', error);
        toast.error('Failed to clear chat history');
      } finally {
        setLoading(false);
        setIsThinking(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleMessageClick = (id) => {
    if (showActions === id) {
      setShowActions(null);
    } else {
      setShowActions(id);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Message copied to neural interface clipboard');
    setShowActions(null);
  };

  const changeNeuralMode = (mode) => {
    setNeuralMode(mode);
    
    // Visual feedback based on mode
    let modeDesc = '';
    let modeColor = '';
    
    switch(mode) {
      case 'creative':
        modeDesc = 'Enhanced creativity mode activated';
        modeColor = 'rgb(245, 158, 11)'; // amber
        break;
      case 'balanced':
        modeDesc = 'Balanced response mode activated';
        modeColor = 'rgb(6, 182, 212)'; // cyan
        break;
      case 'precise':
        modeDesc = 'Precision mode activated';
        modeColor = 'rgb(16, 185, 129)'; // green
        break;
      default:
        modeDesc = 'Neural mode switched';
        modeColor = 'rgb(6, 182, 212)';
    }
    
    // Show custom toast with mode-specific color
    toast.success(
      <div className="cyber-toast-content">
        <div 
          className="cyber-toast-icon"
          style={{ backgroundColor: `${modeColor}20`, color: modeColor }}
        >
          {mode === 'creative' ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : mode === 'balanced' ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"></circle>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          )}
        </div>
        <span>{modeDesc}</span>
      </div>, 
      {
        style: {
          borderLeft: `4px solid ${modeColor}`,
          backgroundColor: '#1e293b',
          color: '#e2e8f0'
        },
        duration: 3000
      }
    );
  };

  const changeAiPersona = (persona) => {
    setAiPersona(persona);
    toast.success(`AI persona switched to: ${aiPersonas[persona].name}`);
  };

  // Submit feedback for bot response
  const submitFeedback = (messageId, rating) => {
    // In a real implementation, this would send the feedback to an API
    setMessageFeedback(prev => ({
      ...prev,
      [messageId]: rating
    }));
    
    setActiveFeedbackId(null);
    toast.success('Thank you for your feedback!');
  };

  // Toggle explanation panel for a message
  const toggleExplanation = (messageId) => {
    setShowExplanationPanel(prev => prev === messageId ? null : messageId);
  };

  // Toggle knowledge graph for a message
  const toggleKnowledgeGraph = (messageId) => {
    console.log("Toggle knowledge graph for message:", messageId);
    
    // If we're activating the graph and it's null, initialize it
    if (messageId !== null && !knowledgeGraph) {
      forceInitializeKnowledgeGraph();
    }
    
    setActiveMessageForKG(prev => prev === messageId ? null : messageId);
  };

  const forceInitializeKnowledgeGraph = () => {
    console.log("Forcing knowledge graph initialization");
    
    // Create sample data
    const sampleTopics = conversationTopics.length > 0 ? 
      conversationTopics : 
      ['Career', 'Software Engineering', 'Data Science', 'AI', 'Machine Learning'];
    
    // Set knowledge graph with sample data
    setKnowledgeGraph({
      nodes: sampleTopics.map((topic, i) => ({
        id: i,
        label: topic,
        size: 10 + Math.random() * 20,
        color: `hsl(${180 + i * 30}, 80%, 60%)`
      })),
      edges: sampleTopics.map((_, i) => {
        if (i === 0) return null;
        return {
          source: i,
          target: Math.floor(Math.random() * i)
        };
      }).filter(Boolean)
    });
  };

  useEffect(() => {
    console.log("Knowledge Graph State:", knowledgeGraph);
    console.log("Active Message for KG:", activeMessageForKG);
  }, [knowledgeGraph, activeMessageForKG]);

  // Text-to-speech function
  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Get available voices
      const voices = window.speechSynthesis.getVoices();
      // Try to find a female voice
      const femaleVoice = voices.find(voice => voice.name.includes('Female') || voice.name.includes('female'));
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(timestamp).toLocaleTimeString([], options);
  };

  // Convert markdown-style code blocks to HTML
  const formatMessageText = (text) => {
    // Replace ```language ... ``` with code blocks
    let formattedText = text.replace(
      /```([a-z]*)\n([\s\S]*?)```/g, 
      (match, language, code) => `<pre class="code-block ${language}"><code>${code}</code></pre>`
    );
    
    // Replace inline code blocks `code` with <code> tags
    formattedText = formattedText.replace(
      /`([^`]+)`/g, 
      (match, code) => `<code class="inline-code">${code}</code>`
    );
    
    // Replace URLs with clickable links
    formattedText = formattedText.replace(
      /(https?:\/\/[^\s]+)/g, 
      (match) => `<a href="${match}" target="_blank" rel="noopener noreferrer" class="message-link">${match}</a>`
    );
    
    // Handle line breaks
    formattedText = formattedText.replace(/\n/g, '<br />');
    
    return formattedText;
  };

  // Get color based on confidence level
  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'rgb(16, 185, 129)'; // Green
    if (confidence >= 70) return 'rgb(245, 158, 11)'; // Amber
    return 'rgb(239, 68, 68)'; // Red
  };

  // Get sentiment icon
  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <i className="fas fa-smile sentiment-positive"></i>;
      case 'negative':
        return <i className="fas fa-frown sentiment-negative"></i>;
      default:
        return <i className="fas fa-meh sentiment-neutral"></i>;
    }
  };

  // Memoize the current persona data
  const currentPersona = useMemo(() => {
    return aiPersonas[aiPersona];
  }, [aiPersona]);

  // Add this function to the NeuralChatInterface component after the other utility functions
// and before the return statement

// Speech recognition toggle function
const toggleSpeechRecognition = () => {
  if (!isSpeechEnabled) return;
  
  if (isListening) {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    setIsListening(false);
  } else {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        console.error('Speech recognition not initialized');
        toast.error('Speech recognition not available');
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
      toast.error('Failed to start speech recognition');
    }
  }
};

// Improved speech recognition initialization
useEffect(() => {
  // Check if the browser supports speech recognition
  if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    try {
      // Create a new instance of SpeechRecognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setMessage(prevMessage => prevMessage + ' ' + finalTranscript.trim());
        }
      };
      
      recognition.onend = () => {
        if (isListening) {
          try {
            recognition.start();
          } catch (error) {
            console.error('Error restarting speech recognition:', error);
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error(`Speech recognition error: ${event.error}`);
      };
      
      // Store the recognition instance in the ref
      recognitionRef.current = recognition;
      setIsSpeechEnabled(true);
      
      console.log('Speech recognition initialized successfully');
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      setIsSpeechEnabled(false);
    }
  } else {
    console.log('Speech recognition not supported in this browser');
    setIsSpeechEnabled(false);
  }
  
  // Clean up the speech recognition instance when the component unmounts
  return () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  };
}, []);  // Empty dependency array to run only once on mount


const findLatestBotMessage = (messages, thread) => {
  const threadMessages = messages.filter(msg => msg.thread === thread && msg.sender === 'bot');
  
  if (threadMessages.length === 0) return null;
  
  // Sort by timestamp first (most reliable)
  let latest = threadMessages.sort((a, b) => {
    // Try to compare by timestamp first
    if (a.timestamp && b.timestamp) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    }
    
    // Fallback to ID comparison
    // IDs may be string, number, or timestamp format
    // Try to parse as timestamps first
    try {
      const aTime = new Date(a.id).getTime();
      const bTime = new Date(b.id).getTime();
      
      if (!isNaN(aTime) && !isNaN(bTime)) {
        return bTime - aTime;
      }
    } catch (e) {
      // Not timestamp format, continue to next method
    }
    
    // Try to parse as integers
    const aNum = parseInt(a.id, 10);
    const bNum = parseInt(b.id, 10);
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return bNum - aNum;
    }
    
    // Last resort: string comparison
    return String(b.id).localeCompare(String(a.id));
  })[0];
  
  return latest?.id;
};


useEffect(() => {
  if (messages.length > 0) {
    // Find messages for the current active thread that are from the bot
    const botMessages = messages.filter(
      msg => msg.thread === activeThread && msg.sender === 'bot'
    );
    
    if (botMessages.length > 0) {
      // Sort by timestamp (most recent first)
      const sortedMessages = [...botMessages].sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return new Date(b.timestamp) - new Date(a.timestamp);
        }
        return 0;
      });
      
      // Set the latest bot message ID
      setLatestBotMessageId(sortedMessages[0].id);
    }
  }
}, [messages, activeThread]);

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
          transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
          background: aiPersona === 'assistant' ? 'rgb(6, 182, 212)' : currentPersona.color
        }}
      ></div>
      <div 
        className="cyber-glow-orb cyber-glow-orb-2"
        style={{
          transform: `translate(${-mousePosition.x * 30}px, ${-mousePosition.y * 30}px)`
        }}
      ></div>
      
      {/* Thread Selector */}
      <div className="cyber-thread-selector">
        <div className="cyber-thread-list">
          {['main', ...conversationThreads].map(threadId => (
            <button
              key={threadId}
              className={`cyber-thread-button ${activeThread === threadId ? 'cyber-thread-active' : ''}`}
              onClick={() => setActiveThread(threadId)}
              style={{
                '--thread-color': threadColors[threadId] || 'rgb(6, 182, 212)'
              }}
            >
              <div className="cyber-thread-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <span className="cyber-thread-name">
                {threadId === 'main' ? 'Main Thread' : `Thread ${conversationThreads.indexOf(threadId) + 1}`}
              </span>
            </button>
          ))}
          
          <button className="cyber-new-thread" onClick={createNewThread}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span>New Thread</span>
          </button>
        </div>
      </div>
      
      {/* Advanced AI Panel (collapsible) */}
      <div className={`cyber-advanced-panel ${showAdvancedPanel ? 'cyber-panel-expanded' : ''}`}>
        <div className="cyber-panel-header" onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}>
          <div className="cyber-panel-title">
            <svg className="cyber-panel-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 0-4 4m4-4a4 4 0 0 1 4 4m-4-4v4m-8 8a4 4 0 0 0 4 4m-4-4a4 4 0 0 1 4-4m-4 4h4m8 0a4 4 0 0 1-4 4m4-4a4 4 0 0 0-4-4m4 4h-4m0-8a4 4 0 0 0-4 4m4-4a4 4 0 0 1 4 4m-4-4v4"></path>
            </svg>
            <span>AI Configuration Pane</span>
          </div>
          <div className="cyber-panel-toggle">
            <i className={`fas fa-chevron-${showAdvancedPanel ? 'up' : 'down'}`}></i>
          </div>
        </div>
        
        {showAdvancedPanel && (
          <div className="cyber-panel-content">
            {/* Persona Selection */}
            <div className="cyber-panel-section">
              <h3 className="cyber-section-title">AI Persona</h3>
              <div className="cyber-persona-selector">
                {Object.entries(aiPersonas).map(([id, persona]) => (
                  <button
                    key={id}
                    className={`cyber-persona-option ${aiPersona === id ? 'cyber-persona-active' : ''}`}
                    onClick={() => changeAiPersona(id)}
                    style={{
                      '--persona-color': persona.color
                    }}
                  >
                    <div className="cyber-persona-icon">
                      <i className={`fas ${persona.icon}`}></i>
                    </div>
                    <div className="cyber-persona-info">
                      <span className="cyber-persona-name">{persona.name}</span>
                      <span className="cyber-persona-desc">{persona.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* AI Features Toggle */}
            <div className="cyber-panel-section">
              <h3 className="cyber-section-title">Neural Features</h3>
              <div className="cyber-toggles-grid">
                <div className="cyber-toggle-item">
                  <div className="cyber-toggle-info">
                    <span className="cyber-toggle-label">Auto-Complete</span>
                    <span className="cyber-toggle-desc">Predictive text suggestions</span>
                  </div>
                  <label className="cyber-switch">
                    <input 
                      type="checkbox" 
                      checked={isAutoCompleteEnabled}
                      onChange={() => setIsAutoCompleteEnabled(!isAutoCompleteEnabled)}
                    />
                    <span className="cyber-slider"></span>
                  </label>
                </div>
                
                <div className="cyber-toggle-item">
                  <div className="cyber-toggle-info">
                    <span className="cyber-toggle-label">Confidence Display</span>
                    <span className="cyber-toggle-desc">Show AI confidence levels</span>
                  </div>
                  <label className="cyber-switch">
                    <input 
                      type="checkbox" 
                      checked={confidenceDisplay}
                      onChange={() => setConfidenceDisplay(!confidenceDisplay)}
                    />
                    <span className="cyber-slider"></span>
                  </label>
                </div>
                
                <div className="cyber-toggle-item">
                  <div className="cyber-toggle-info">
                    <span className="cyber-toggle-label">Sentiment Analysis</span>
                    <span className="cyber-toggle-desc">Detect message sentiment</span>
                  </div>
                  <label className="cyber-switch">
                    <input 
                      type="checkbox" 
                      checked={sentimentAnalysis}
                      onChange={() => setSentimentAnalysis(!sentimentAnalysis)}
                    />
                    <span className="cyber-slider"></span>
                  </label>
                </div>
                
                <div className="cyber-toggle-item">
                  <div className="cyber-toggle-info">
                    <span className="cyber-toggle-label">Context Memory</span>
                    <span className="cyber-toggle-desc">Track conversation context</span>
                  </div>
                  <label className="cyber-switch">
                    <input 
                      type="checkbox" 
                      checked={contextMemory}
                      onChange={() => setContextMemory(!contextMemory)}
                    />
                    <span className="cyber-slider"></span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Conversation Topics */}
            {contextMemory && conversationTopics.length > 0 && (
              <div className="cyber-panel-section">
                <h3 className="cyber-section-title">Conversation Topics</h3>
                <div className="cyber-topics-container">
                  {conversationTopics.map((topic, index) => (
                    <div key={index} className="cyber-topic-tag" style={{ '--delay': `${index * 0.1}s` }}>
                      {topic}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Knowledge Graph Preview */}
            {knowledgeGraph && (
              <div className="cyber-panel-section">
                <h3 className="cyber-section-title">Knowledge Network</h3>
                <div className="cyber-knowledge-preview" ref={knowledgeGraphRef}>
                  {/* In a real implementation, this would be a D3 or Sigma.js graph */}
                  <div className="cyber-graph-simulation">
                    {knowledgeGraph.nodes.map(node => (
                      <div 
                        key={node.id}
                        className="cyber-graph-node"
                        style={{
                          left: `${20 + Math.random() * 60}%`,
                          top: `${20 + Math.random() * 60}%`,
                          width: `${node.size}px`,
                          height: `${node.size}px`,
                          background: node.color
                        }}
                        title={node.label}
                      >
                        <span className="cyber-node-label">{node.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Conversation Insights Toggle */}
      <button 
        className={`cyber-context-toggle ${showConversationInsights ? 'cyber-context-active' : ''}`}
        onClick={() => setShowConversationInsights(!showConversationInsights)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <path d="M13 6h3a2 2 0 0 1 2 2v7" />
          <line x1="6" y1="9" x2="6" y2="21" />
        </svg>
        <span>Conversation Insights</span>
      </button>

      <button 
        className="cyber-context-toggle1"
        onClick={toggleAnalyticsModal}
      >
        <span className="cyber-toggle-icon">
          <i className="fas fa-chart-bar"></i>
        </span>
        <span>Conversation Insights</span>
      </button>

      {/* Conversation Insights Panel */}
      {showConversationInsights && (
        <div className="cyber-context-panel">
          <div className="cyber-context-header">
            <h3>Neural Conversation Analysis</h3>
            <button 
              className="cyber-context-close"
              onClick={() => setShowConversationInsights(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          
          <div className="cyber-context-content">
            {/* Conversation Summary */}
            <div className="cyber-context-section">
              <h4>Conversation Summary</h4>
              <p className="cyber-summary-text">{conversationSummary || 'Conversation analysis in progress...'}</p>
            </div>
            
            {/* Conversation Depth */}
            <div className="cyber-context-section">
              <h4>Conversation Depth</h4>
              <div className="cyber-depth-meter">
                <div className="cyber-depth-track">
                  <div 
                    className="cyber-depth-indicator" 
                    style={{width: `${Math.min(100, conversationContext.conversationDepth * 20)}%`}}
                  ></div>
                </div>
                <div className="cyber-depth-labels">
                  <span>Surface</span>
                  <span>Basic</span>
                  <span>Detailed</span>
                  <span>In-depth</span>
                  <span>Expert</span>
                </div>
              </div>
            </div>
            
            {/* Topic Tracking */}
            <div className="cyber-context-section">
              <h4>Active Topics</h4>
              <div className="cyber-topic-chips">
                {conversationTopics.length > 0 ? (
                  conversationTopics.map((topic, index) => (
                    <div 
                      key={index} 
                      className="cyber-topic-chip"
                      style={{
                        opacity: 1 - (index * 0.15),
                        '--relevance': (100 - (index * 20)) + '%'
                      }}
                    >
                      <span className="cyber-topic-name">{topic}</span>
                      <div className="cyber-topic-relevance">
                        <div className="cyber-relevance-bar"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="cyber-empty-topics">No topics detected yet</div>
                )}
              </div>
            </div>
            
            {/* Entity Recognition */}
            {conversationContext.recentEntities.length > 0 && (
              <div className="cyber-context-section">
                <h4>Key Entities</h4>
                <div className="cyber-entity-list">
                  {conversationContext.recentEntities.map((entity, index) => (
                    <div key={index} className="cyber-entity-item">
                      <svg xmlns="http://www.w3.org/2000/svg" className="cyber-entity-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      <span>{entity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Open Questions */}
            {conversationContext.openQuestions.length > 0 && (
              <div className="cyber-context-section">
                <h4>Open Questions</h4>
                <ul className="cyber-question-list">
                  {conversationContext.openQuestions.map((question, index) => (
                    <li key={index} className="cyber-question-item">
                      <svg xmlns="http://www.w3.org/2000/svg" className="cyber-question-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Chat Container */}
      <div className="cyber-chat-container">
        {/* Chat Header */}
        <div className="cyber-chat-header">
          <div className="cyber-chat-title">
            <div className="cyber-bot-avatar" style={{ '--avatar-color': currentPersona.color }}>
              <div className="cyber-bot-avatar-icon">
                <i className={`fas ${currentPersona.icon}`}></i>
              </div>
              <div className="cyber-bot-avatar-pulse"></div>
            </div>
            <div className="cyber-title-content">
              <h1 className="cyber-title-text">
                {currentPersona.name}
                <span className="cyber-blink">_</span>
              </h1>
              <div className="cyber-bot-status">
                <span className="cyber-status-indicator cyber-online"></span>
                <span className="cyber-status-text">Quantum Core Active</span>
              </div>
            </div>
          </div>
          
          <div className="cyber-header-actions">
            {/* Neural Mode Selector - Dropdown Version */}
            <div className="cyber-mode-dropdown">
              <button 
                className="cyber-mode-current"
                onClick={() => setShowModeDropdown(!showModeDropdown)}
              >
                <div className="cyber-mode-icon">
                  {neuralMode === 'creative' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="mode-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5"></circle>
                      <line x1="12" y1="1" x2="12" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="23"></line>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                      <line x1="1" y1="12" x2="3" y2="12"></line>
                      <line x1="21" y1="12" x2="23" y2="12"></line>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                  )}
                  {neuralMode === 'balanced' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="mode-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                  )}
                  {neuralMode === 'precise' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="mode-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9"></circle>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </div>
                <div className="cyber-mode-label">
                  <span className="cyber-mode-name">
                    {neuralMode.charAt(0).toUpperCase() + neuralMode.slice(1)} Mode
                  </span>
                  <span className="cyber-mode-desc">
                    {neuralMode === 'creative' ? 'Imaginative responses' : 
                     neuralMode === 'balanced' ? 'Default balanced responses' : 
                     'Factual and precise answers'}
                  </span>
                </div>
                <div className="cyber-dropdown-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>

                {/* Decorative elements */}
                <div className="cyber-corner cyber-corner-tl"></div>
                <div className="cyber-corner cyber-corner-tr"></div>
                <div className="cyber-corner cyber-corner-bl"></div>
                <div className="cyber-corner cyber-corner-br"></div>
                <div className="cyber-scan-line"></div>
              </button>
              
              {showModeDropdown && (
                <div className="cyber-mode-options">
                  <button 
                    className={`cyber-mode-option ${neuralMode === 'creative' ? 'cyber-option-active' : ''}`}
                    onClick={() => {
                      changeNeuralMode('creative');
                      setShowModeDropdown(false);
                    }}
                  >
                    <div className="cyber-option-icon cyber-icon-creative">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                      </svg>
                    </div>
                    <div className="cyber-option-info">
                      <span className="cyber-option-name">Creative</span>
                      <span className="cyber-option-desc">Imaginative and diverse responses</span>
                    </div>
                    <div className="cyber-option-indicator"></div>
                  </button>
                  
                  <button 
                    className={`cyber-mode-option ${neuralMode === 'balanced' ? 'cyber-option-active' : ''}`}
                    onClick={() => {
                      changeNeuralMode('balanced');
                      setShowModeDropdown(false);
                    }}
                  >
                    <div className="cyber-option-icon cyber-icon-balanced">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                      </svg>
                    </div>
                    <div className="cyber-option-info">
                      <span className="cyber-option-name">Balanced</span>
                      <span className="cyber-option-desc">Optimal blend of creativity and precision</span>
                    </div>
                    <div className="cyber-option-indicator"></div>
                  </button>
                  
                  <button 
                    className={`cyber-mode-option ${neuralMode === 'precise' ? 'cyber-option-active' : ''}`}
                    onClick={() => {
                      changeNeuralMode('precise');
                      setShowModeDropdown(false);
                    }}
                  >
                    <div className="cyber-option-icon cyber-icon-precise">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9"></circle>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </div>
                    <div className="cyber-option-info">
                      <span className="cyber-option-name">Precise</span>
                      <span className="cyber-option-desc">Factual and concise information</span>
                    </div>
                    <div className="cyber-option-indicator"></div>
                  </button>
                </div>
              )}
            </div>
            
            {/* Advanced AI Panel Toggle */}
            <button 
              className="cyber-toggle-button"
              onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
              title="Toggle advanced AI panel"
            >
              <span className="cyber-toggle-icon">
                <i className={`fas fa-brain ${showAdvancedPanel ? 'cyber-enabled' : ''}`}></i>
              </span>
              <span className="cyber-toggle-label">Neural Config</span>
            </button>
            
            {/* Toggle Neural Suggestions */}
            <button 
              className="cyber-toggle-button"
              onClick={() => setNeuralSuggestions(!neuralSuggestions)}
              title="Toggle neural suggestions"
            >
              <span className="cyber-toggle-icon">
                <i className={`fas fa-lightbulb ${neuralSuggestions ? 'cyber-enabled' : ''}`}></i>
              </span>
              <span className="cyber-toggle-label">Neural Suggestions</span>
            </button>
            
            {/* Clear Chat Button */}
            <button 
              onClick={clearChat} 
              className="cyber-clear-button" 
              disabled={loading || messages.length === 0}
              title="Clear neural connection history"
            >
              <span className="cyber-button-icon">
                <i className="fas fa-trash-alt"></i>
              </span>
              <span className="cyber-button-text">Reset Connection</span>
              
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
  {messages.length === 0 ? (
    <div className="cyber-empty-chat">
      <div className="cyber-empty-chat-content">
        
        
        <ChatBubble />
        
       
        
        {neuralSuggestions && (
          <div className="cyber-suggestions-container">
            <h3 className="cyber-suggestions-title">
              <svg className="cyber-neural-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 0-4 4m4-4a4 4 0 0 1 4 4m-4-4v4m-8 8a4 4 0 0 0 4 4m-4-4a4 4 0 0 1 4-4m-4 4h4m8 0a4 4 0 0 1-4 4m4-4a4 4 0 0 0-4-4m4 4h-4m0-8a4 4 0 0 0-4 4m4-4a4 4 0 0 1 4 4m-4-4v4"></path>
              </svg>
              <span>Get Started with AshaBot</span>
            </h3>
            
            <div className="cyber-suggestions-grid">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  className="cyber-suggestion-card"
                  onClick={() => handleSuggestionClick(suggestion.text)}
                >
                  <div className="cyber-suggestion-icon">
                    <i className={`fas ${suggestion.icon}`}></i>
                  </div>
                  <span className="cyber-suggestion-text">{suggestion.text}</span>
                  
                  {/* Decorative corners */}
                  <div className="cyber-corner cyber-corner-tl"></div>
                  <div className="cyber-corner cyber-corner-tr"></div>
                  <div className="cyber-corner cyber-corner-bl"></div>
                  <div className="cyber-corner cyber-corner-br"></div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  ) : (
    <>
     {messages
  .filter(message => message.thread === activeThread)
  .map((message) => {
    // Check if this message is the latest bot message
    const isLatestBotMessage = message.sender === 'bot' && 
                               message.id === latestBotMessageId;
    
    return (
      <EnhancedMessage
        key={message.id}
        message={message}
        handleMessageClick={handleMessageClick}
        isLatestBotMessage={message.sender === 'bot' && message.id === latestBotMessageId}
        isThinking={isThinking}
        latestBotMessageId={latestBotMessageId}
        handleCopy={handleCopy}
        speakMessage={speakMessage}
        toggleExplanation={toggleExplanation}
        setActiveFeedbackId={setActiveFeedbackId}
        activeFeedbackId={activeFeedbackId}
        toggleKnowledgeGraph={toggleKnowledgeGraph}
        activeMessageForKG={activeMessageForKG}
        setIsMessageExpanded={setIsMessageExpanded}
        isMessageExpanded={isMessageExpanded === message.id}
        conversationTopics={conversationTopics}
        showExplanationPanel={showExplanationPanel}
        aiExplanations={aiExplanations}
        submitFeedback={submitFeedback}
        messageFeedback={messageFeedback}
        confidenceDisplay={confidenceDisplay}
        sentimentAnalysis={sentimentAnalysis}
        knowledgeGraph={knowledgeGraph}
        showActions={showActions} // Pass the ID dir
      />
    );
  })
}

      <IntentDetector 
        messages={messages}
        onSuggestionClick={(suggestion) => sendMessage(suggestion)}
      />
      
      {/* Show follow-up suggestions after last bot message */}
      {showFollowupSuggestions && (
        <div className="cyber-followup-container">
          <div className="cyber-followup-header">
            <svg xmlns="http://www.w3.org/2000/svg" className="cyber-followup-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <span>Follow-up Questions</span>
          </div>
          <div className="cyber-followup-suggestions">
            {followupSuggestions.map((suggestion, index) => (
              <button 
                key={index} 
                className="cyber-followup-button"
                onClick={() => sendMessage(suggestion)}
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
      )}
    </>
  )}


  {isThinking && (
    <div className="cyber-thinking-indicator">
      <div className="cyber-neural-thinking">
        <div className="cyber-thinking-avatar" style={{ '--avatar-color': currentPersona.color }}>
          <div className="cyber-avatar-icon">
            <i className={`fas ${currentPersona.icon}`}></i>
          </div>
          <div className="cyber-thinking-pulse"></div>
        </div>
        
        <div className="cyber-thinking-process">
          <div className="cyber-thinking-text">Neural processing...</div>
          <div className="cyber-thinking-animation">
            <div className="cyber-synapse cyber-synapse-1"></div>
            <div className="cyber-synapse cyber-synapse-2"></div>
            <div className="cyber-synapse cyber-synapse-3"></div>
          </div>
        </div>
      </div>
    </div>
  )}
  
  <div ref={messagesEndRef} />
</div>
        
        {/* Audio Visualization */}
        {isListening && (
          <div className="cyber-audio-visualization">
            <canvas ref={audioVisualRef} width="300" height="60"></canvas>
          </div>
        )}
        
        {/* Message Input */}
<div className="cyber-input-container">
  {/* Signup indicator */}
  {isSignupMode && (
    <div className="cyber-signup-indicator">
      <div className="cyber-signup-icon">
        <i className="fas fa-user-plus"></i>
      </div>
      <div className="cyber-signup-status">
        <div className="cyber-signup-label">Account Creation In Progress</div>
        <div className="cyber-signup-progress">
          {signupState === 'collecting_username' && 'Step 1: Username'}
          {signupState === 'collecting_fullname' && 'Step 2: Full Name'}
          {signupState === 'collecting_email' && 'Step 3: Email'}
          {signupState === 'collecting_password' && 'Step 4: Password'}
          {signupState === 'registration_complete' && 'Complete!'}
        </div>
      </div>
    </div>
  )}

  {/* Reset signup button */}
  {isSignupMode && (
    <button 
      className="cyber-reset-button"
      onClick={resetSignupFlow}
      title="Reset signup process"
    >
      <i className="fas fa-redo-alt"></i>
      <span>Reset Signup</span>
    </button>
  )}

          {activeThread !== 'main' && (
            <div className="cyber-thread-indicator" style={{ '--thread-color': threadColors[activeThread] }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="cyber-thread-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <span className="cyber-thread-label">
                {activeThread === 'main' ? 'Main Thread' : `Thread ${conversationThreads.indexOf(activeThread) + 1}`}
              </span>
            </div>
          )}
          
          <div className={`cyber-input-wrapper ${isFocused ? 'cyber-focused' : ''} ${loading ? 'cyber-disabled' : ''}`}>
          {renderInputField()}
            
            {/* Auto-complete suggestion */}
            {isAutoCompleteEnabled && autoCompleteSuggestion && (
              <div className="cyber-autocomplete">
                <span className="cyber-autocomplete-current">{message}</span>
                <span className="cyber-autocomplete-suggestion">{autoCompleteSuggestion}</span>
                <div className="cyber-autocomplete-hint">
                  Press <span className="cyber-key">Tab</span> to accept
                </div>
              </div>
            )}
            
            {isSpeechEnabled && signupState !== 'collecting_password' && (
      <button
        className={`cyber-mic-button ${isListening ? 'cyber-listening' : ''}`}
        onClick={toggleSpeechRecognition}
        disabled={loading}
        title={isListening ? 'Stop voice input' : 'Start voice input'}
      >
        <i className={`fas fa-microphone${isListening ? '-alt' : ''}`}></i>
        {isListening && <div className="cyber-mic-wave"></div>}
      </button>
    )}
            
            <button
              className="cyber-send-button"
              onClick={handleSend}
              disabled={!message.trim() || loading}
              title="Send message"
              style={{ backgroundColor: loading ? '#2d3748' : currentPersona.color }}
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
          {/* <div className="cyber-keyboard-info">
            <span className="cyber-key">Enter</span> to send
            <span className="cyber-divider">|</span>
            <span className="cyber-key">Shift</span> + <span className="cyber-key">Enter</span> for line break
            {isAutoCompleteEnabled && (
              <>
                <span className="cyber-divider">|</span>
                <span className="cyber-key">Tab</span> to complete
              </>
            )}
          </div> */}
        </div>
        
        {/* Quantum Status Ticker */}
        <div className="cyber-status-ticker">
          <div className="cyber-ticker-content">
            <span className="cyber-ticker-text">Neural Interface Online • {currentPersona.name} Activated • Quantum Core Processing • Synaptic Enhancement Active • Neural Path Optimization • Deep Learning Calibration Complete • Ready For Cognitive Connection</span>
          </div>
        </div>
      </div>

      <AnalyticsModal 
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
      />

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
        
        .cyber-header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .cyber-toggle-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          color: rgba(226, 232, 240, 0.7);
          font-size: 0.875rem;
          transition: all 0.3s;
        }
        
        .cyber-toggle-button:hover {
          background: rgba(15, 23, 42, 0.8);
          color: rgba(226, 232, 240, 0.9);
          border-color: rgba(6, 182, 212, 0.5);
        }
        
        .cyber-toggle-icon {
          font-size: 1rem;
          transition: all 0.3s;
        }
        
        .cyber-enabled {
          color: rgb(16, 185, 129);
          text-shadow: 0 0 5px rgba(16, 185, 129, 0.8);
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
        
        /* Empty Chat State */
        .cyber-empty-chat {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
        }
        
        .cyber-empty-chat-content {
          max-width: 36rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .cyber-welcome-avatar {
          position: relative;
          width: 6rem;
          height: 6rem;
          margin-bottom: 2rem;
          margin-top: 350px;
        }
        
        .cyber-avatar-ring {
          position: absolute;
          inset: -0.5rem;
          border: 2px dashed rgba(6, 182, 212, 0.5);
          border-radius: 50%;
          animation: rotate 20s linear infinite;
        }
        
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .cyber-avatar-icon {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
          border-radius: 50%;
          color: rgba(15, 23, 42, 0.9);
          font-size: 3rem;
          z-index: 2;
          box-shadow: 0 0 25px rgba(6, 182, 212, 0.5);
        }
        
        .cyber-avatar-particles {
          position: absolute;
          inset: 0;
          z-index: 3;
        }
        
        .cyber-avatar-particle {
          position: absolute;
          width: 0.5rem;
          height: 0.5rem;
          background: rgb(6, 182, 212);
          border-radius: 50%;
          animation: particle-orbit 4s linear infinite;
        }
        
        @keyframes particle-orbit {
          0% {
            transform: rotate(0deg) translateX(3.5rem) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(3.5rem) rotate(-360deg);
          }
        }
        
        .cyber-empty-title {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(90deg, rgb(6, 182, 212) 0%, rgb(79, 70, 229) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          margin-bottom: 1rem;
        }
        
        .cyber-empty-description {
          font-size: 1.125rem;
          color: rgba(226, 232, 240, 0.7);
          line-height: 1.5;
          margin-bottom: 2rem;
          max-width: 36rem;
        }
        
        /* Suggestions */
        .cyber-suggestions-container {
          width: 100%;
        }
        
        .cyber-suggestions-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: rgb(6, 182, 212);
          margin-bottom: 1.5rem;
          justify-content: center;
          margin-left: -72px
        }
        
        .cyber-neural-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: rgb(6, 182, 212);
        }
        
        .cyber-suggestions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }
        
        .cyber-suggestion-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          padding: 1rem;
          text-align: left;
          transition: all 0.3s;
          overflow: hidden;
        }
        
        .cyber-suggestion-card:hover {
          transform: translateY(-5px);
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                      0 4px 6px -2px rgba(0, 0, 0, 0.05),
                      0 0 0 1px rgba(6, 182, 212, 0.2) inset,
                      0 0 15px rgba(6, 182, 212, 0.2);
        }
        
        .cyber-suggestion-card:hover .cyber-suggestion-icon {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
          color: rgb(226, 232, 240);
        }
        
        .cyber-suggestion-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 2.5rem;
          height: 2.5rem;
          background: rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          color: rgb(6, 182, 212);
          font-size: 1rem;
          transition: all 0.3s;
        }
        
        .cyber-suggestion-text {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.9);
          line-height: 1.4;
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
        
        /* Code Blocks */
        .code-block {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.25rem;
          padding: 0.75rem;
          margin: 0.5rem 0;
          overflow-x: auto;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.9);
          position: relative;
        }
        
        .code-block::before {
          content: '// Neural Code';
          position: absolute;
          top: 0;
          right: 0.5rem;
          font-size: 0.75rem;
          color: rgba(6, 182, 212, 0.8);
          background: rgba(15, 23, 42, 0.8);
          padding: 0.125rem 0.375rem;
          border-bottom-left-radius: 0.25rem;
          border-bottom-right-radius: 0.25rem;
        }
        
        .code-block code {
          display: block;
          line-height: 1.5;
        }
        
        .inline-code {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.25rem;
          padding: 0.125rem 0.25rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.875em; /* Relative to parent */
          color: rgb(6, 182, 212);
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
          margin-bottom: 10px;
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
        
        .cyber-send-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .cyber-shortcuts-info {
          display: flex;
          justify-content: center;
          margin-top: 0.75rem;
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.5);
        }
        
        .cyber-shortcuts-info kbd {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.25rem;
          padding: 0.125rem 0.25rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
          margin: 0 0.25rem;
        }
        
        /* Status Ticker */
        .cyber-status-ticker {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 50%, rgba(6, 182, 212, 0.8) 100%);
          color: rgb(15, 23, 42);
          padding: 0.5rem 0;
          text-align: center;
          font-size: 0.875rem;
          font-weight: 500;
          transform: translateY(0);
          transition: transform 0.5s;
          overflow: hidden;
          z-index: 20;
        }
        
        .cyber-status-ticker:hover {
          transform: translateY(-5px);
        }
        
        .cyber-ticker-text {
          display: inline-block;
          white-space: nowrap;
          animation: scroll-x 20s linear infinite;
        }
        
        @keyframes scroll-x {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
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
        
        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .cyber-chat-container {
            height: calc(100vh - 2rem);
            border-radius: 0;
            box-shadow: none;
          }
          
          .cyber-chat-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .cyber-header-actions {
            width: 100%;
            justify-content: space-between;
          }
          
          .cyber-message-content {
            max-width: calc(100% - 4rem);
          }
          
          .cyber-suggestions-grid {
            grid-template-columns: 1fr;
          }
          
          .cyber-neural-thinking {
            max-width: 80%;
          }
        }

        .cyber-advanced-panel {
    position: absolute;
    top: 5rem;
    right: 12.5rem;
    width: 20rem;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(6, 182, 212, 0.3);
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2),
                0 4px 6px -2px rgba(0, 0, 0, 0.1),
                0 0 0 1px rgba(6, 182, 212, 0.1) inset,
                0 0 20px rgba(6, 182, 212, 0.2);
    backdrop-filter: blur(10px);
    z-index: 20;
    transition: all 0.3s cubic-bezier(0.33, 1, 0.68, 1);
    transform: translateX(calc(100% - 3rem));
    max-height: calc(100vh - 10rem);
    overflow-y: auto;
  }
  
  .cyber-advanced-panel.cyber-panel-expanded {
    transform: translateX(0);
  }
  
  .cyber-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid rgba(6, 182, 212, 0.3);
    cursor: pointer;
  }
  
  .cyber-panel-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: rgb(6, 182, 212);
    margin-left: -7px;

  }
  
  .cyber-panel-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .cyber-panel-toggle {
    color: rgba(226, 232, 240, 0.7);
  }
  
  .cyber-panel-content {
    padding: 1rem;
  }
  
  .cyber-panel-section {
    margin-bottom: 1.5rem;
  }
  
  .cyber-section-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(226, 232, 240, 0.9);
    margin-bottom: 0.75rem;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid rgba(6, 182, 212, 0.2);
  }
  
  /* Persona Selector */
  .cyber-persona-selector {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .cyber-persona-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(var(--persona-color, 6, 182, 212), 0.3);
    border-radius: 0.375rem;
    transition: all 0.3s;
    text-align: left;
  }
  
  .cyber-persona-option:hover {
    background: rgba(15, 23, 42, 0.8);
    border-color: rgba(var(--persona-color, 6, 182, 212), 0.6);
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .cyber-persona-active {
    background: rgba(var(--persona-color, 6, 182, 212), 0.2);
    border-color: rgba(var(--persona-color, 6, 182, 212), 0.8);
    box-shadow: 0 0 15px rgba(var(--persona-color, 6, 182, 212), 0.3);
  }
  
  .cyber-persona-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background: rgba(var(--persona-color, 6, 182, 212), 0.2);
    border-radius: 50%;
    color: var(--persona-color, rgb(6, 182, 212));
    flex-shrink: 0;
  }
  
  .cyber-persona-info {
    display: flex;
    flex-direction: column;
  }
  
  .cyber-persona-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(226, 232, 240, 0.9);
  }
  
  .cyber-persona-desc {
    font-size: 0.75rem;
    color: rgba(226, 232, 240, 0.7);
  }
  
  /* Toggle Switches */
  .cyber-toggles-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .cyber-toggle-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: rgba(15, 23, 42, 0.4);
    border-radius: 0.375rem;
  }
  
  .cyber-toggle-info {
    display: flex;
    flex-direction: column;
  }
  
  .cyber-toggle-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(226, 232, 240, 0.9);
  }
  
  .cyber-toggle-desc {
    font-size: 0.75rem;
    color: rgba(226, 232, 240, 0.6);
  }
  
  .cyber-switch {
    position: relative;
    display: inline-block;
    width: 2.5rem;
    height: 1.25rem;
  }
  
  .cyber-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .cyber-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(6, 182, 212, 0.3);
    border-radius: 1.25rem;
    transition: all 0.3s;
  }
  
  .cyber-slider:before {
    position: absolute;
    content: "";
    height: 0.875rem;
    width: 0.875rem;
    left: 0.125rem;
    bottom: 0.125rem;
    background: rgba(226, 232, 240, 0.9);
    border-radius: 50%;
    transition: all 0.3s;
  }
  
  .cyber-switch input:checked + .cyber-slider {
    background: rgba(6, 182, 212, 0.4);
    border-color: rgba(6, 182, 212, 0.8);
  }
  
  .cyber-switch input:checked + .cyber-slider:before {
    transform: translateX(1.25rem);
    background: rgb(6, 182, 212);
  }
  
  /* Topics Display */
  .cyber-topics-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .cyber-topic-tag {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
    border: 1px solid rgba(6, 182, 212, 0.4);
    border-radius: 0.25rem;
    color: rgba(226, 232, 240, 0.9);
    animation: fadeIn 0.3s ease forwards;
    animation-delay: var(--delay, 0s);
    opacity: 0;
  }
  
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  /* Knowledge Graph */
  .cyber-knowledge-preview {
    height: 12rem;
    background: rgba(15, 23, 42, 0.4);
    border: 1px solid rgba(6, 182, 212, 0.2);
    border-radius: 0.375rem;
    overflow: hidden;
    position: relative;
  }
  
  .cyber-graph-simulation {
    position: relative;
    width: 100%;
    height: 100%;
  }
  
  .cyber-graph-node {
    position: absolute;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
    animation: pulse 2s infinite;
    transition: all 0.3s;
    cursor: pointer;
    z-index: 2;
  }
  
  .cyber-node-label {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 0.3rem;
    font-size: 0.6rem;
    white-space: nowrap;
    background: rgba(15, 23, 42, 0.8);
    padding: 0.1rem 0.3rem;
    border-radius: 0.2rem;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .cyber-graph-node:hover {
    transform: scale(1.2);
  }
  
  .cyber-graph-node:hover .cyber-node-label {
    opacity: 1;
  }
  
  .cyber-graph-edge {
    position: absolute;
    height: 1px;
    background: linear-gradient(90deg, rgba(6, 182, 212, 0.5), rgba(79, 70, 229, 0.5));
    opacity: 0.6;
    z-index: 1;
  }
  
  /* Message Enhancements */
  .cyber-message-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  
  /* Confidence Indicator */
  .cyber-confidence-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
    --confidence-color: rgb(16, 185, 129);
  }
  
  .cyber-confidence-bar {
    flex: 1;
    height: 0.25rem;
    background: rgba(15, 23, 42, 0.6);
    border-radius: 0.125rem;
    overflow: hidden;
  }
  
  .cyber-confidence-level {
    height: 100%;
    background: var(--confidence-color);
    border-radius: 0.125rem;
    animation: confidenceReveal 1s ease-out forwards;
    transform-origin: left;
    transform: scaleX(0);
  }
  
  @keyframes confidenceReveal {
    0% { transform: scaleX(0); }
    100% { transform: scaleX(1); }
  }
  
  .cyber-confidence-value {
    font-size: 0.6875rem;
    color: var(--confidence-color);
    min-width: 2.5rem;
    text-align: right;
  }
  
  /* Sentiment Analysis */
  .cyber-sentiment-indicator {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    font-size: 0.875rem;
  }
  
  .cyber-sentiment-positive {
    color: rgb(16, 185, 129);
  }
  
  .cyber-sentiment-negative {
    color: rgb(239, 68, 68);
  }
  
  .cyber-sentiment-neutral {
    color: rgb(245, 158, 11);
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
    max-height: min-content;
  }
  
  @keyframes slideDown {
    0% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  .cyber-feedback-prompt {
    font-size: 0.870rem;
    color: rgba(226, 232, 240, 0.9);
    margin-bottom: 10px;
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
  
  /* AI Explanation Panel */
  .cyber-explanation-panel {
    margin: 0.5rem 0 1rem 3.5rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(6, 182, 212, 0.3);
    border-radius: 0.375rem;
    overflow: hidden;
    animation: slideDown 0.3s ease-out forwards;
    max-width: 90%;
  }
  
  .cyber-explanation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: rgba(15, 23, 42, 0.8);
    border-bottom: 1px solid rgba(6, 182, 212, 0.3);
  }
  
  .cyber-explanation-header h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9375rem;
    font-weight: 600;
    color: rgb(6, 182, 212);
    margin: 0;
  }
  
  .cyber-explanation-icon {
    width: 1rem;
    height: 1rem;
  }
  
  .cyber-explanation-close {
    background: transparent;
    border: none;
    color: rgba(226, 232, 240, 0.6);
    cursor: pointer;
    transition: color 0.3s;
  }
  
  .cyber-explanation-close:hover {
    color: rgba(226, 232, 240, 0.9);
  }
  
  .cyber-explanation-content {
    padding: 1rem;
  }
  
  .cyber-explanation-section {
    margin-bottom: 1rem;
  }
  
  .cyber-explanation-section h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(226, 232, 240, 0.9);
    margin: 0 0 0.5rem 0;
  }
  
  .cyber-confidence-detail {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .cyber-confidence-bar-large {
    flex: 1;
    height: 0.5rem;
    background: rgba(15, 23, 42, 0.8);
    border-radius: 0.25rem;
    overflow: hidden;
  }
  
  .cyber-confidence-text {
    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(226, 232, 240, 0.9);
  }
  
  .cyber-reasoning-text {
    font-size: 0.875rem;
    color: rgba(226, 232, 240, 0.8);
    line-height: 1.4;
  }
  
  .cyber-sources-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .cyber-source-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
  }
  
  .cyber-source-info {
    display: flex;
    flex-direction: column;
  }
  
  .cyber-source-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(226, 232, 240, 0.9);
  }
  
  .cyber-source-url {
    font-size: 0.75rem;
    color: rgba(6, 182, 212, 0.8);
  }
  
  .cyber-source-relevance {
    width: 3rem;
    height: 0.375rem;
    background: rgba(15, 23, 42, 0.8);
    border-radius: 0.125rem;
    overflow: hidden;
  }
  
  .cyber-relevance-bar {
    height: 100%;
    background: linear-gradient(90deg, rgba(16, 185, 129, 0.8) 0%, rgba(6, 182, 212, 0.8) 100%);
    border-radius: 0.125rem;
  }
  
  /* Knowledge Graph Panel */
  .cyber-knowledge-panel {
    margin: 0.5rem 0 1rem 3.5rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(6, 182, 212, 0.3);
    border-radius: 0.375rem;
    overflow: hidden;
    animation: slideDown 0.3s ease-out forwards;
    position: relative;
    z-index: 999 !important; /* Very high z-index */
    background: rgba(15, 23, 42, 0.9) !important;
    border: 2px solid rgba(6, 182, 212, 0.7) !important;
    width: 100%;
    margin-left: 0px;
  }
  
  .cyber-knowledge-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: rgba(15, 23, 42, 0.8);
    border-bottom: 1px solid rgba(6, 182, 212, 0.3);
  }
  
  .cyber-knowledge-header h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9375rem;
    font-weight: 600;
    color: rgb(6, 182, 212);
    margin: 0;
  }
  
  .cyber-knowledge-icon {
    color: rgb(6, 182, 212);
  }
  
  .cyber-knowledge-close {
    background: transparent;
    border: none;
    color: rgba(226, 232, 240, 0.6);
    cursor: pointer;
    transition: color 0.3s;
  }
  
  .cyber-knowledge-close:hover {
    color: rgba(226, 232, 240, 0.9);
  }
  
  .cyber-knowledge-content {
    padding: 1rem;
  }
  
  .cyber-graph-container {
    height: 12rem;
    background: rgba(15, 23, 42, 0.4);
    border-radius: 0.375rem;
    position: relative;
    margin-bottom: 1rem;
  }
  
  .cyber-graph-large {
    height: 100%;
  }
  
  .cyber-graph-legend {
    padding: 0.5rem;
    background: rgba(15, 23, 42, 0.4);
    border-radius: 0.375rem;
  }
  
  .cyber-legend-title {
    font-size: 0.75rem;
    font-weight: 500;
    color: rgba(226, 232, 240, 0.7);
    margin-bottom: 0.5rem;
  }
  
  .cyber-topics-flow {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }
  
  .cyber-topic-node {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    background: rgba(6, 182, 212, 0.1);
    border: 1px solid rgba(6, 182, 212, 0.3);
    border-radius: 0.25rem;
    color: rgb(6, 182, 212);
  }
  
  /* Auto-Complete Features */
  .cyber-autocomplete {
    position: absolute;
    pointer-events: none;
    top: 1rem;
    left: 1rem;
    right: 3.5rem;
    font-family: inherit;
    font-size: 0.9375rem;
    color: rgba(226, 232, 240, 0.9);
    opacity: 0.7;
    white-space: nowrap;
    overflow: hidden;
  }
  
  .cyber-autocomplete-current {
    opacity: 0;
  }
  
  .cyber-autocomplete-suggestion {
    color: rgba(226, 232, 240, 0.5);
  }
  
  .cyber-autocomplete-hint {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    font-size: 0.75rem;
    color: rgba(6, 182, 212, 0.8);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  /* AI Action Button Styles */
  .cyber-action-active {
    background: rgba(6, 182, 212, 0.2);
    border-color: rgba(6, 182, 212, 0.5);
    color: rgb(6, 182, 212);
  }
  
  /* Avatar Persona Colors */
  .cyber-avatar {
    --avatar-color: rgb(6, 182, 212);
  }
  
  .cyber-bot-avatar-icon {
    background: linear-gradient(135deg, var(--avatar-color) 0%, rgba(79, 70, 229, 0.8) 100%);
  }
  
  .cyber-bot-avatar-pulse {
    border-color: var(--avatar-color);
  }

  .cyber-mode-dropdown {
  position: relative;
  z-index: 30;
  // width: 14rem;
}

.cyber-mode-current {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.625rem 1rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.5rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  text-align: left;
}

.cyber-mode-current:hover {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(6, 182, 212, 0.6);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
}

.cyber-mode-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(6, 182, 212, 0.1);
  border-radius: 50%;
  flex-shrink: 0;
}

.mode-svg {
  width: 1.25rem;
  height: 1.25rem;
  color: rgb(6, 182, 212);
}

.cyber-mode-label {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.cyber-mode-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(6, 182, 212);
}

.cyber-mode-desc {
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.7);
}

.cyber-dropdown-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  color: rgba(226, 232, 240, 0.6);
  transition: transform 0.3s;
}

.cyber-mode-options {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  width: 100%;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2),
              0 4px 6px -2px rgba(0, 0, 0, 0.1),
              0 0 0 1px rgba(6, 182, 212, 0.1) inset,
              0 0 20px rgba(6, 182, 212, 0.2);
  animation: dropdownAppear 0.3s ease forwards;
  transform-origin: top center;
  z-index: 40;
}

@keyframes dropdownAppear {
  0% { opacity: 0; transform: scaleY(0.8); }
  100% { opacity: 1; transform: scaleY(1); }
}

.cyber-mode-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  transition: all 0.3s;
  position: relative;
  text-align: left;
  border-bottom: 1px solid rgba(6, 182, 212, 0.1);
}

.cyber-mode-option:last-child {
  border-bottom: none;
}

.cyber-mode-option:hover {
  background: rgba(6, 182, 212, 0.1);
}

.cyber-option-active {
  background: rgba(6, 182, 212, 0.15);
}

.cyber-option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.cyber-icon-creative {
  background: rgba(245, 158, 11, 0.2);
  color: rgb(245, 158, 11);
}

.cyber-icon-balanced {
  background: rgba(6, 182, 212, 0.2);
  color: rgb(6, 182, 212);
}

.cyber-icon-precise {
  background: rgba(16, 185, 129, 0.2);
  color: rgb(16, 185, 129);
}

.cyber-option-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.cyber-option-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(226, 232, 240, 0.9);
}

.cyber-option-desc {
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.6);
}

.cyber-option-indicator {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: rgba(6, 182, 212, 0.8);
  opacity: 0;
  transition: opacity 0.3s;
}

.cyber-option-active .cyber-option-indicator {
  opacity: 1;
}

/* Improved Button and Icon Styles */
.cyber-toggle-button {
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  color: rgba(226, 232, 240, 0.7);
  padding: 0.375rem;
  gap: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.3s;
}

.cyber-toggle-button:hover {
  color: rgb(6, 182, 212);
}

.cyber-toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.375rem;
  transition: all 0.3s;
}

.cyber-toggle-button:hover .cyber-toggle-icon {
  border-color: rgba(6, 182, 212, 0.6);
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.3);
  transform: translateY(-2px);
}

.cyber-enabled {
  color: rgb(6, 182, 212);
}

.cyber-toggle-button:hover .cyber-enabled {
  text-shadow: 0 0 8px rgba(6, 182, 212, 0.5);
}

.cyber-toggle-label {
  display: none;
}

@media (min-width: 640px) {
  .cyber-toggle-label {
    display: inline;
  }
}

.cyber-clear-button {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.375rem;
  color: rgba(239, 68, 68, 0.8);
  font-size: 0.875rem;
  gap: 0.5rem;
  transition: all 0.3s;
  overflow: hidden;
}

.cyber-clear-button:not(:disabled):hover {
  background: rgba(15, 23, 42, 1);
  border-color: rgba(239, 68, 68, 0.6);
  color: rgb(239, 68, 68);
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
  transform: translateY(-2px);
}

.cyber-button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* SVG Icon Styles for Message Actions */
.cyber-message-actions {
  display: flex;
  gap: 0.5rem;
}

.cyber-action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.375rem;
  color: rgba(226, 232, 240, 0.7);
  transition: all 0.3s;
}

.cyber-action-button:hover {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(6, 182, 212, 0.5);
  color: rgb(6, 182, 212);
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.3);
  transform: translateY(-2px);
}

.cyber-action-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Icon Animation for Neural Thinking */
.cyber-thinking-animation {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.cyber-synapse {
  width: 0.5rem;
  height: 0.5rem;
  background: rgb(6, 182, 212);
  border-radius: 50%;
  animation: synapse-pulse 1.5s ease-in-out infinite;
  filter: drop-shadow(0 0 3px rgba(6, 182, 212, 0.6));
}

@keyframes synapse-pulse {
  0% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.8); opacity: 0.5; }
}

/* Fix for Font Awesome Icons */
.cyber-avatar-icon i,
.cyber-bot-avatar-icon i,
.cyber-suggestion-icon i,
.cyber-message-actions i,
.cyber-toggle-icon i {
  font-size: 1.25rem; /* Increase size for better visibility */
  color: inherit;
  display: inline-block; /* Ensure proper rendering */
}

/* Neural Status Ticker customization */
.cyber-status-ticker {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1.75rem;
  background: linear-gradient(90deg, 
    rgba(15, 23, 42, 0.9) 0%,
    rgba(6, 182, 212, 0.2) 50%,
    rgba(15, 23, 42, 0.9) 100%
  );
  border-top: 1px solid rgba(6, 182, 212, 0.3);
  overflow: hidden;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: rgb(6, 182, 212);
  text-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
  letter-spacing: 0.5px;
}
  .cyber-toast-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .cyber-toast-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.375rem;
  }
  
  .cyber-toast-icon svg {
    width: 1.25rem;
    height: 1.25rem;
  }


  .cyber-thread-selector {
  position: absolute;
  top: 5rem;
  left: 18rem;
  width: 16rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2),
              0 4px 6px -2px rgba(0, 0, 0, 0.1),
              0 0 0 1px rgba(6, 182, 212, 0.1) inset,
              0 0 20px rgba(6, 182, 212, 0.2);
  backdrop-filter: blur(10px);
  z-index: 20;
  // overflow: hidden;
  transition: all 0.3s cubic-bezier(0.33, 1, 0.68, 1);
  transform: translateX(-110%);
  opacity: 1;
}

// .cyber-thread-selector:hover {
//   transform: translateX(0);
//   opacity: 1;
// }

.cyber-thread-selector::after {
  content: 'Threads';
  position: absolute;
  top: 50%;
  right: -2.5rem;
  transform: translateY(-50%) rotate(90deg);
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-bottom: none;
  border-radius: 0.5rem 0.5rem 0 0;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  color: rgb(6, 182, 212);
  white-space: nowrap;
}

.cyber-thread-list {
  max-height: 75vh;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cyber-thread-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(var(--thread-color, 6, 182, 212), 0.3);
  border-radius: 0.375rem;
  transition: all 0.3s;
  text-align: left;
  --thread-color: rgb(6, 182, 212);
}

.cyber-thread-button:hover {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(var(--thread-color, 6, 182, 212), 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.cyber-thread-active {
  background: rgba(var(--thread-color, 6, 182, 212), 0.2);
  border-color: var(--thread-color, rgb(6, 182, 212));
  box-shadow: 0 0 15px rgba(var(--thread-color, 6, 182, 212), 0.3);
}

.cyber-thread-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: rgba(var(--thread-color, 6, 182, 212), 0.2);
  border-radius: 50%;
  color: var(--thread-color, rgb(6, 182, 212));
  flex-shrink: 0;
}

.cyber-thread-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.cyber-thread-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(226, 232, 240, 0.9);
}

.cyber-new-thread {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  margin-top: 0.5rem;
  background: rgba(6, 182, 212, 0.1);
  border: 1px dashed rgba(6, 182, 212, 0.4);
  border-radius: 0.375rem;
  color: rgb(6, 182, 212);
  transition: all 0.3s;
}

.cyber-new-thread:hover {
  background: rgba(6, 182, 212, 0.2);
  border-color: rgba(6, 182, 212, 0.6);
}

.cyber-new-thread svg {
  width: 1rem;
  height: 1rem;
}

/* Conversation Insights Panel */
.cyber-context-toggle {
  position: absolute;
  top: 11rem;
  right: -0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.375rem;
  color: rgba(226, 232, 240, 0.7);
  transition: all 0.3s;
  z-index: 2;
}

.cyber-context-toggle:hover {
  background: rgba(15, 23, 42, 1);
  border-color: rgba(6, 182, 212, 0.6);
  color: rgb(6, 182, 212);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.cyber-context-toggle svg {
  width: 1.25rem;
  height: 1.25rem;
}

.cyber-context-active {
  background: rgba(6, 182, 212, 0.2);
  border-color: rgba(6, 182, 212, 0.6);
  color: rgb(6, 182, 212);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);
}

.cyber-context-panel {
  position: absolute;
  top: calc(5rem + 3rem);
  right: 1.5rem;
  width: 20rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2),
              0 4px 6px -2px rgba(0, 0, 0, 0.1),
              0 0 0 1px rgba(6, 182, 212, 0.1) inset,
              0 0 20px rgba(6, 182, 212, 0.2);
  backdrop-filter: blur(10px);
  z-index: 25;
  animation: panelSlideIn 0.3s cubic-bezier(0.33, 1, 0.68, 1) forwards;
  max-height: 70vh;
  overflow-y: auto;
}

@keyframes panelSlideIn {
  0% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
}

.cyber-context-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(6, 182, 212, 0.3);
}

.cyber-context-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(6, 182, 212);
  margin: 0;
}

.cyber-context-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.375rem;
  color: rgba(226, 232, 240, 0.7);
  transition: all 0.3s;
}

.cyber-context-close:hover {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(6, 182, 212, 0.5);
  color: rgb(6, 182, 212);
}

.cyber-context-close svg {
  width: 1rem;
  height: 1rem;
}

.cyber-context-content {
  padding: 1rem;
}

.cyber-context-section {
  margin-bottom: 1.5rem;
}

.cyber-context-section h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.9);
  margin: 0 0 0.75rem 0;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid rgba(6, 182, 212, 0.2);
}

.cyber-summary-text {
  font-size: 0.875rem;
  color: rgba(226, 232, 240, 0.8);
  line-height: 1.5;
  margin: 0;
}

/* Conversation Depth Meter */
.cyber-depth-meter {
  margin-top: 0.5rem;
}

.cyber-depth-track {
  height: 0.5rem;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 0.25rem;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.cyber-depth-indicator {
  height: 100%;
  background: linear-gradient(90deg, 
    rgba(6, 182, 212, 0.8) 0%, 
    rgba(16, 185, 129, 0.8) 50%, 
    rgba(79, 70, 229, 0.8) 100%
  );
  border-radius: 0.25rem;
  transition: width 0.5s ease-out;
}

.cyber-depth-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.6875rem;
  color: rgba(226, 232, 240, 0.6);
}

/* Topic Chips */
.cyber-topic-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.cyber-topic-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.625rem;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.375rem;
  transition: all 0.3s;
  max-width: 100%;
  --relevance: 100%;
}

.cyber-topic-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(226, 232, 240, 0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cyber-topic-relevance {
  width: 2.5rem;
  height: 0.25rem;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 0.125rem;
  overflow: hidden;
  flex-shrink: 0;
}

.cyber-relevance-bar {
  height: 100%;
  width: var(--relevance);
  background: linear-gradient(90deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
  border-radius: 0.125rem;
}

.cyber-empty-topics {
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.5);
  font-style: italic;
}

/* Entity List */
.cyber-entity-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.cyber-entity-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  background: rgba(79, 70, 229, 0.1);
  border: 1px solid rgba(79, 70, 229, 0.3);
  border-radius: 0.375rem;
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.9);
}

.cyber-entity-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: rgb(79, 70, 229);
}

/* Question List */
.cyber-question-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cyber-question-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 0.375rem;
}

.cyber-question-icon {
  width: 1rem;
  height: 1rem;
  color: rgb(6, 182, 212);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.cyber-question-item span {
  font-size: 0.8125rem;
  color: rgba(226, 232, 240, 0.8);
  line-height: 1.4;
}

/* Follow-up Suggestions */
.cyber-followup-container {
  margin: 0.5rem 0 1rem 3.5rem;
  max-width: 90%;
  animation: fadeIn 0.3s ease forwards;
}

.cyber-followup-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
}

.cyber-followup-icon {
  width: 1rem;
  height: 1rem;
  color: rgb(6, 182, 212);
}

.cyber-followup-header span {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(6, 182, 212);
}

.cyber-followup-suggestions {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.cyber-followup-button {
  position: relative;
  padding: 0.625rem 1rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.375rem;
  color: rgba(226, 232, 240, 0.9);
  font-size: 0.875rem;
  text-align: left;
  transition: all 0.3s;
  overflow: hidden;
}

.cyber-followup-button:hover {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(6, 182, 212, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Message Threading */
.cyber-message-continuation {
  display: flex;
  justify-content: center;
  height: 0.5rem;
  margin: -0.25rem 0;
  position: relative;
  z-index: 1;
}

.cyber-continuation-line {
  width: 1px;
  height: 100%;
  background: linear-gradient(to bottom, 
    rgba(6, 182, 212, 0), 
    rgba(6, 182, 212, 0.4), 
    rgba(6, 182, 212, 0)
  );
}

.cyber-message.cyber-continuation .cyber-avatar {
  opacity: 0;
  visibility: hidden;
  height: 0;
}

.cyber-message.cyber-continuation {
  margin-top: -0.5rem;
}

/* Thread Indicator in Input Area */
.cyber-thread-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--thread-color, rgba(6, 182, 212, 0.3));
  border-radius: 0.375rem;
  --thread-color: rgb(6, 182, 212);
}

.cyber-thread-icon {
  width: 1rem;
  height: 1rem;
  color: var(--thread-color, rgb(6, 182, 212));
}

.cyber-thread-label {
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.8);
}

/* Misc animations */
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

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

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
  100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
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

/* Special styling for password input during signup */
.cyber-input-wrapper.password-input {
  position: relative;
}

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

/* Link Attachment Styles */
.cyber-attachment {
  margin-top: 1rem;
  animation: fadeIn 0.3s ease-out forwards;
}

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

/* Options Attachment Styles */
.cyber-options-attachment {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
}

.cyber-options-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(6, 182, 212);
  margin-bottom: 0.75rem;
}

.cyber-options-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cyber-option-item {
  position: relative;
  display: block;
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 0.375rem;
  transition: all 0.3s;
  text-align: left;
  width: 100%;
  cursor: pointer;
}

.cyber-option-item:hover {
  transform: translateY(-2px);
  border-color: rgba(6, 182, 212, 0.5);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
}

.cyber-option-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.9);
  margin-bottom: 0.25rem;
}

.cyber-option-desc {
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.6);
}

/* Job Attachment Styles */
.cyber-job-attachment {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
}

.cyber-job-header {
  margin-bottom: 0.75rem;
}

.cyber-job-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(16, 185, 129);
  margin-bottom: 0.25rem;
}

.cyber-job-company {
  font-size: 0.875rem;
  color: rgba(226, 232, 240, 0.8);
}

.cyber-job-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.cyber-job-location,
.cyber-job-salary {
  font-size: 0.8125rem;
  color: rgba(226, 232, 240, 0.7);
}

.cyber-job-location i,
.cyber-job-salary i {
  color: rgb(16, 185, 129);
  margin-right: 0.25rem;
}

.cyber-job-view-button {
  width: 100%;
  padding: 0.625rem;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 0.375rem;
  color: rgb(16, 185, 129);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s;
  cursor: pointer;
}

.cyber-job-view-button:hover {
  background: rgba(16, 185, 129, 0.3);
  border-color: rgba(16, 185, 129, 0.6);
}

/* Intent suggestion styles */
.cyber-intent-suggestions {
  margin: 1rem 0 1rem 3.5rem;
  max-width: 90%;
  animation: fadeIn 0.3s ease-out forwards;
}

.cyber-intent-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgba(226, 232, 240, 0.7);
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
}

.cyber-intent-header i {
  color: rgb(245, 158, 11);
}

.cyber-intent-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cyber-intent-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.375rem;
  color: rgb(226, 232, 240);
  font-size: 0.875rem;
  text-align: left;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.cyber-intent-option:hover {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(6, 182, 212, 0.5);
  transform: translateY(-2px);
}

.cyber-intent-option i {
  color: rgb(6, 182, 212);
  font-size: 1rem;
  flex-shrink: 0;
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

.cyber-link-attachment:hover .cyber-scan-line,
.cyber-option-item:hover .cyber-scan-line,
.cyber-intent-option:hover .cyber-scan-line {
  opacity: 1;
}

@keyframes scanline {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive styles */
@media (max-width: 768px) {
  .cyber-attachment-link {
    padding: 0.75rem;
  }
  
  .cyber-attachment-icon {
    width: 2rem;
    height: 2rem;
    margin-right: 0.75rem;
  }
  
  .cyber-options-list {
    gap: 0.5rem;
  }
  
  .cyber-intent-options {
    gap: 0.375rem;
  }
}

/* Glow effect for interactive elements */
.cyber-attachment-link:focus,
.cyber-option-item:focus,
.cyber-intent-option:focus,
.cyber-job-view-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.4), 0 0 15px rgba(6, 182, 212, 0.3);
},
.cyber-external-link {
  background: rgba(79, 70, 229, 0.2) !important; /* Purple for external links */
  border-color: rgba(79, 70, 229, 0.4) !important;
  color: rgb(79, 70, 229) !important;
}

.cyber-external-link:hover {
  background: rgba(79, 70, 229, 0.3) !important;
  border-color: rgba(79, 70, 229, 0.6) !important;
}



.cyber-avatar-gif-container {
  position: relative;
  width: 10rem; /* Larger than the original avatar */
  height: 10rem; 
  margin-right: 1rem;
  flex-shrink: 0;
  overflow: hidden; /* Ensures transitions stay contained */
}

/* Main avatar GIF styling */
.cyber-avatar-gif-large {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 0 10px rgba(6, 182, 212, 0.8));
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

/* Regular avatar GIF with floating animation */
.cyber-avatar-gif {
  animation: gif-float 3s ease-in-out infinite, gif-glow 2s alternate infinite;
}

/* Loading GIF specific styles */
.cyber-loading-gif {
  animation: loading-pulse 1.5s ease-in-out infinite;
}

/* Animation for the loading GIF */
@keyframes loading-pulse {
  0% {
    transform: scale(1);
    filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.7));
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 15px rgba(245, 158, 11, 0.9));
  }
  100% {
    transform: scale(1);
    filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.7));
  }
}

/* Floating animation for the main avatar GIF */
@keyframes gif-float {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(2deg);
  }
  100% {
    transform: translateY(0) rotate(0deg);
  }
}

/* Glowing effect animation */
@keyframes gif-glow {
  0% {
    filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.7));
  }
  100% {
    filter: drop-shadow(0 0 15px rgba(124, 58, 237, 0.9));
  }
}

/* Special styling for the message bubble when in loading state */
.cyber-loading-bubble {
  border-color: rgba(245, 158, 11, 0.7) !important;
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.3) !important;
  animation: pulse-loading 1.5s infinite !important;
}

@keyframes pulse-loading {
  0% {
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.6);
  }
  100% {
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
  }
}

/* Add cyberpunk circuit lines around the GIF */
.cyber-avatar-gif-container::before,
.cyber-avatar-gif-container::after {
  content: '';
  position: absolute;
  background: linear-gradient(90deg, transparent 50%, rgba(6, 182, 212, 0.8) 50%);
  background-size: 10px 1px;
  z-index: 1;
}

.cyber-avatar-gif-container::before {
  top: -5px;
  left: -5px;
  right: 15px;
  height: 1px;
  animation: circuit-slide 3s linear infinite;
}

.cyber-avatar-gif-container::after {
  bottom: -5px;
  left: 15px;
  right: -5px;
  height: 1px;
  animation: circuit-slide-reverse 3s linear infinite;
}

/* Vertical circuit lines */
.cyber-avatar-gif-container::before {
  content: '';
  position: absolute;
  top: 15px;
  bottom: -5px;
  left: -5px;
  width: 1px;
  background: linear-gradient(0deg, transparent 50%, rgba(124, 58, 237, 0.8) 50%);
  background-size: 1px 10px;
  animation: circuit-slide-vertical 4s linear infinite;
}

.cyber-avatar-gif-container::after {
  content: '';
  position: absolute;
  top: -5px;
  bottom: 15px;
  right: -5px;
  width: 1px;
  background: linear-gradient(0deg, transparent 50%, rgba(124, 58, 237, 0.8) 50%);
  background-size: 1px 10px;
  animation: circuit-slide-vertical-reverse 4s linear infinite;
}

/* Special circuit animation for loading state */
.cyber-loading-gif + .cyber-avatar-gif-container::before,
.cyber-loading-gif + .cyber-avatar-gif-container::after {
  background: linear-gradient(90deg, transparent 50%, rgba(245, 158, 11, 0.8) 50%);
  animation-duration: 1.5s; /* Faster animation during loading */
}

/* Sliding circuit animations */
@keyframes circuit-slide {
  0% { background-position: 0 0; }
  100% { background-position: 20px 0; }
}

@keyframes circuit-slide-reverse {
  0% { background-position: 20px 0; }
  100% { background-position: 0 0; }
}

@keyframes circuit-slide-vertical {
  0% { background-position: 0 0; }
  100% { background-position: 0 20px; }
}

@keyframes circuit-slide-vertical-reverse {
  0% { background-position: 0 20px; }
  100% { background-position: 0 0; }
}

/* Enhanced transition effect */
.cyber-avatar-gif-container {
  overflow: hidden;
}

.cyber-avatar-gif-container img {
  transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
}

.cyber-analytics-button .cyber-toggle-icon {
  background: rgba(139, 92, 246, 0.2);
  color: rgb(139, 92, 246);

  position: absolute;
  top: 16rem;
  right: 2.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.375rem;
  color: rgba(226, 232, 240, 0.7);
  transition: all 0.3s;
  z-index: 2;
}

.cyber-analytics-button:hover .cyber-toggle-icon {
  background: rgba(139, 92, 246, 0.3);
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.3);

  background: rgba(15, 23, 42, 1);
  border-color: rgba(6, 182, 212, 0.6);
  color: rgb(6, 182, 212);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Conversation Insights Panel */
.cyber-context-toggle1 {
  position: absolute;
  top: 16rem;
  right: -0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.375rem;
  color: rgba(226, 232, 240, 0.7);
  transition: all 0.3s;
  z-index: 2;
}

.cyber-context-toggle1:hover {
  background: rgba(15, 23, 42, 1);
  border-color: rgba(6, 182, 212, 0.6);
  color: rgb(6, 182, 212);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.cyber-context-toggle1 svg {
  width: 1.25rem;
  height: 1.25rem;
}

.cyber-expanded {
  max-height: none !important;
  overflow: visible !important;
}
      `}</style>

    </div>
  );
};

export default NeuralChatInterface;