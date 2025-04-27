// Frontend/src/Components/Chat/NeuralChatInterface.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import './ChatStyles.css'; // Import base CSS file

const NeuralChatInterface = () => {
  // State management - Base functionality
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
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMessageExpanded, setIsMessageExpanded] = useState(false);
  
  // NEW STATE - Advanced AI features
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
  const [showModeDropdown, setShowModeDropdown] = useState(false);

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


  // Refs
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);
  const audioVisualRef = useRef(null);
  const recognitionRef = useRef(null);
  const autoCompleteTimeoutRef = useRef(null);
  const knowledgeGraphRef = useRef(null);
  
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
    }
  ];

  // AI Personas configuration
  const aiPersonas = {
    assistant: {
      name: 'Neural Assistant',
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

  // Initialize speech recognition if supported
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
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
        } else if (interimTranscript) {
          // Update UI to show interim results if needed
        }
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        } else {
          setIsListening(false);
        }
      };
      
      setIsSpeechEnabled(true);
    }
  }, []);

  // Fetch chat history on component mount
  useEffect(() => {
    fetchChatHistory();
    createParticles();
    if (knowledgeGraphRef.current) initializeKnowledgeGraph();
  }, []);

  // Initialize knowledge graph visualization
  const initializeKnowledgeGraph = () => {
    if (!knowledgeGraphRef.current) return;
    
    // This would be a visualization library like D3 or Sigma.js
    // For this example we'll create a placeholder implementation
    const showGraph = (topics) => {
      // In a real implementation, this would create a graph visualization
      setKnowledgeGraph({
        nodes: topics.map((topic, i) => ({
          id: i,
          label: topic,
          size: 10 + Math.random() * 20,
          color: `hsl(${180 + i * 30}, 80%, 60%)`
        })),
        edges: topics.map((_, i) => {
          if (i === 0) return null;
          return {
            source: i,
            target: Math.floor(Math.random() * i)
          };
        }).filter(Boolean)
      });
    };
    
    showGraph(['Career', 'Software Engineering', 'Data Science', 'AI', 'Machine Learning']);
  };

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

  // Update conversation topics when messages change
  useEffect(() => {
    if (messages.length > 0) {
      extractConversationTopics(messages);
    }
  }, [messages]);

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

  // Initialize audio visualization
  useEffect(() => {
    if (audioVisualRef.current && isListening) {
      visualizeAudio();
    }
  }, [isListening]);

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

  const toggleSpeechRecognition = () => {
    if (!isSpeechEnabled) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Speech recognition error:', error);
      }
    }
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
        setMessages(response.data.messages);
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
      sendMessage(message);
      setMessage('');
      
      // Focus back on textarea after sending
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    
    // Optimistically add the user message
    const userMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
      // Add sentiment analysis (in real implementation this would be analyzed by an API)
      sentiment: analyzeSentiment(text)
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setLoading(true);
    setIsThinking(true);
    
    try {
      const response = await axios.post(`${API_URL}/chat/send`, 
        { 
          message: text, 
          mode: neuralMode,
          persona: aiPersona
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        // In a real implementation, this response would include AI confidence
        // and other metadata. Here we'll simulate it
        const botMessage = {
          ...response.data.botMessage,
          confidence: simulateConfidence(),
          sources: simulateSources(text),
          reasoning: simulateReasoning(text)
        };
        
        // Add bot message from response
        setMessages(prevMessages => [...prevMessages, botMessage]);
        
        // Update AI explanations
        setAiExplanations(prev => ({
          ...prev,
          [botMessage.id]: {
            confidence: botMessage.confidence,
            sources: botMessage.sources,
            reasoning: botMessage.reasoning
          }
        }));
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
    setActiveMessageForKG(prev => prev === messageId ? null : messageId);
  };

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
      
      {/* Advanced AI Panel (collapsible) */}
      <div className={`cyber-advanced-panel ${showAdvancedPanel ? 'cyber-panel-expanded' : ''}`}>
        <div className="cyber-panel-header" onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}>
          <div className="cyber-panel-title">
            <svg className="cyber-panel-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 0-4 4m4-4a4 4 0 0 1 4 4m-4-4v4m-8 8a4 4 0 0 0 4 4m-4-4a4 4 0 0 1 4-4m-4 4h4m8 0a4 4 0 0 1-4 4m4-4a4 4 0 0 0-4-4m4 4h-4m0-8a4 4 0 0 0-4 4m4-4a4 4 0 0 1 4 4m-4-4v4"></path>
            </svg>
            <span>AI Neural Configuration</span>
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
            {/* Neural Mode Selector */}
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
                <div className="cyber-welcome-avatar" style={{ '--avatar-color': currentPersona.color }}>
                  <div className="cyber-avatar-ring"></div>
                  <div className="cyber-avatar-icon">
                    <i className={`fas ${currentPersona.icon}`}></i>
                  </div>
                  <div className="cyber-avatar-particles">
                    {[...Array(8)].map((_, index) => (
                      <div 
                        key={index}
                        className="cyber-avatar-particle"
                        style={{
                          animationDelay: `${index * 0.2}s`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
                
                <h2 className="cyber-empty-title">
                  Welcome to {currentPersona.name}
                </h2>
                
                <p className="cyber-empty-description">
                  I'm your advanced AI career assistant with quantum cognitive capabilities. Ask me anything about jobs, career advancement, interview preparation, or technical challenges.
                </p>
                
                {neuralSuggestions && (
                  <div className="cyber-suggestions-container">
                    <h3 className="cyber-suggestions-title">
                      <svg className="cyber-neural-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a4 4 0 0 0-4 4m4-4a4 4 0 0 1 4 4m-4-4v4m-8 8a4 4 0 0 0 4 4m-4-4a4 4 0 0 1 4-4m-4 4h4m8 0a4 4 0 0 1-4 4m4-4a4 4 0 0 0-4-4m4 4h-4m0-8a4 4 0 0 0-4 4m4-4a4 4 0 0 1 4 4m-4-4v4"></path>
                      </svg>
                      <span>Neural Network Suggestions:</span>
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
              {messages.map((message) => {
                const isUser = message.sender === 'user';
                const isExpanded = isMessageExpanded === message.id;
                const hasExplanation = !isUser && aiExplanations[message.id];
                const showingExplanation = showExplanationPanel === message.id;
                
                return (
                  <div key={message.id} className="cyber-message-wrapper">
                    <div 
                      className={`cyber-message ${isUser ? 'cyber-user-message' : 'cyber-bot-message'}`}
                      onClick={() => handleMessageClick(message.id)}
                    >
                      <div className="cyber-message-container">
                        {!isUser && (
                          <div className="cyber-avatar" style={{ '--avatar-color': currentPersona.color }}>
                            <div className="cyber-avatar-icon">
                              <i className={`fas ${currentPersona.icon}`}></i>
                            </div>
                            <div className="cyber-avatar-ring"></div>
                          </div>
                        )}
                        
                        <div className="cyber-message-content">
                          {/* Confidence Display */}
                          {!isUser && confidenceDisplay && message.confidence !== undefined && (
                            <div className="cyber-confidence-indicator" style={{ '--confidence-color': getConfidenceColor(message.confidence) }}>
                              <div className="cyber-confidence-bar">
                                <div 
                                  className="cyber-confidence-level" 
                                  style={{ width: `${message.confidence}%` }}
                                ></div>
                              </div>
                              <span className="cyber-confidence-value">{message.confidence}%</span>
                            </div>
                          )}
                          
                          <div className={`cyber-message-bubble ${isUser ? 'cyber-user-bubble' : 'cyber-bot-bubble'} ${isExpanded ? 'cyber-expanded' : ''}`}>
                            {/* Sentiment indicator */}
                            {sentimentAnalysis && message.sentiment && (
                              <div className={`cyber-sentiment-indicator cyber-sentiment-${message.sentiment}`}>
                                {getSentimentIcon(message.sentiment)}
                              </div>
                            )}
                            
                            <div 
                              className="cyber-message-text"
                              dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
                            />
                            
                            {/* Decorative corners */}
                            <div className="cyber-corner cyber-corner-tl"></div>
                            <div className="cyber-corner cyber-corner-tr"></div>
                            <div className="cyber-corner cyber-corner-bl"></div>
                            <div className="cyber-corner cyber-corner-br"></div>
                            
                            {/* Message scan line effect */}
                            <div className="cyber-scan-line"></div>
                          </div>
                          
                          <div className="cyber-message-meta">
                            <div className="cyber-message-time">
                              <svg className="cyber-time-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                              </svg>
                              <span>{formatTime(message.timestamp)}</span>
                            </div>
                            
                            {/* Feedback display */}
                            {!isUser && messageFeedback[message.id] !== undefined && (
                              <div className="cyber-feedback-display">
                                <i className={`fas fa-thumbs-${messageFeedback[message.id] === 'up' ? 'up' : 'down'} cyber-feedback-${messageFeedback[message.id]}`}></i>
                              </div>
                            )}
                            
                            {showActions === message.id && (
                              <div className="cyber-message-actions">
                                <button 
                                  className="cyber-action-button" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(message.text);
                                  }}
                                  title="Copy to clipboard"
                                >
                                  <i className="fas fa-copy"></i>
                                </button>
                                
                                {!isUser && (
                                  <button 
                                    className="cyber-action-button" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      speakMessage(message.text);
                                    }}
                                    title="Read aloud"
                                  >
                                    <i className="fas fa-volume-up"></i>
                                  </button>
                                )}
                                
                                {!isUser && hasExplanation && (
                                  <button 
                                    className={`cyber-action-button ${showingExplanation ? 'cyber-action-active' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleExplanation(message.id);
                                    }}
                                    title="Show AI explanation"
                                  >
                                    <i className="fas fa-brain"></i>
                                  </button>
                                )}
                                
                                {!isUser && (
                                  <button 
                                    className="cyber-action-button" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveFeedbackId(activeFeedbackId === message.id ? null : message.id);
                                    }}
                                    title="Rate response"
                                  >
                                    <i className="fas fa-thumbs-up"></i>
                                  </button>
                                )}
                                
                                {!isUser && conversationTopics.length > 0 && (
                                  <button 
                                    className={`cyber-action-button ${activeMessageForKG === message.id ? 'cyber-action-active' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleKnowledgeGraph(message.id);
                                    }}
                                    title="Show knowledge graph"
                                  >
                                    <i className="fas fa-project-diagram"></i>
                                  </button>
                                )}
                                
                                <button 
                                  className="cyber-action-button" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMessageExpanded(isExpanded ? null : message.id);
                                  }}
                                  title={isExpanded ? "Collapse" : "Expand"}
                                >
                                  <i className={`fas fa-${isExpanded ? 'compress-alt' : 'expand-alt'}`}></i>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {isUser && (
                          <div className="cyber-avatar">
                            <div className="cyber-avatar-icon">
                              <i className="fas fa-user"></i>
                            </div>
                            <div className="cyber-avatar-ring"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Feedback UI */}
                    {activeFeedbackId === message.id && (
                      <div className="cyber-feedback-ui">
                        <div className="cyber-feedback-prompt">Was this response helpful?</div>
                        <div className="cyber-feedback-buttons">
                          <button 
                            className="cyber-feedback-button cyber-feedback-up"
                            onClick={() => submitFeedback(message.id, 'up')}
                          >
                            <i className="fas fa-thumbs-up"></i>
                            <span>Helpful</span>
                          </button>
                          <button 
                            className="cyber-feedback-button cyber-feedback-down"
                            onClick={() => submitFeedback(message.id, 'down')}
                          >
                            <i className="fas fa-thumbs-down"></i>
                            <span>Not Helpful</span>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* AI Explanation Panel */}
                    {showExplanationPanel === message.id && hasExplanation && (
                      <div className="cyber-explanation-panel">
                        <div className="cyber-explanation-header">
                          <h3>
                            <svg className="cyber-explanation-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2a4 4 0 0 0-4 4m4-4a4 4 0 0 1 4 4m-4-4v4m-8 8a4 4 0 0 0 4 4m-4-4a4 4 0 0 1 4-4m-4 4h4m8 0a4 4 0 0 1-4 4m4-4a4 4 0 0 0-4-4m4 4h-4m0-8a4 4 0 0 0-4 4m4-4a4 4 0 0 1 4 4m-4-4v4"></path>
                            </svg>
                            AI Response Analysis
                          </h3>
                          <button 
                            className="cyber-explanation-close"
                            onClick={() => setShowExplanationPanel(null)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                        
                        <div className="cyber-explanation-content">
                          <div className="cyber-explanation-section">
                            <h4>Confidence</h4>
                            <div className="cyber-confidence-detail">
                              <div className="cyber-confidence-bar-large">
                                <div 
                                  className="cyber-confidence-level" 
                                  style={{ 
                                    width: `${aiExplanations[message.id].confidence}%`,
                                    backgroundColor: getConfidenceColor(aiExplanations[message.id].confidence)
                                  }}
                                ></div>
                              </div>
                              <span className="cyber-confidence-text">
                                {aiExplanations[message.id].confidence}% confidence
                              </span>
                            </div>
                          </div>
                          
                          <div className="cyber-explanation-section">
                            <h4>AI Reasoning</h4>
                            <p className="cyber-reasoning-text">
                              {aiExplanations[message.id].reasoning}
                            </p>
                          </div>
                          
                          {aiExplanations[message.id].sources && aiExplanations[message.id].sources.length > 0 && (
                            <div className="cyber-explanation-section">
                              <h4>Sources</h4>
                              <ul className="cyber-sources-list">
                                {aiExplanations[message.id].sources.map((source, index) => (
                                  <li key={index} className="cyber-source-item">
                                    <div className="cyber-source-info">
                                      <span className="cyber-source-title">{source.title}</span>
                                      <span className="cyber-source-url">{source.url}</span>
                                    </div>
                                    <div className="cyber-source-relevance" title={`${Math.round(source.relevance * 100)}% relevant`}>
                                      <div 
                                        className="cyber-relevance-bar"
                                        style={{ width: `${source.relevance * 100}%` }}
                                      ></div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Knowledge Graph for message */}
                    {activeMessageForKG === message.id && knowledgeGraph && (
                      <div className="cyber-knowledge-panel">
                        <div className="cyber-knowledge-header">
                          <h3>
                            <i className="fas fa-project-diagram cyber-knowledge-icon"></i>
                            Knowledge Network
                          </h3>
                          <button 
                            className="cyber-knowledge-close"
                            onClick={() => setActiveMessageForKG(null)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                        
                        <div className="cyber-knowledge-content">
                          <div className="cyber-graph-container">
                            {/* In a real implementation, this would be a D3 or Sigma.js graph */}
                            <div className="cyber-graph-simulation cyber-graph-large">
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
                              
                              {/* Edge lines - in a real implementation these would be SVG paths */}
                              {knowledgeGraph.edges.map((edge, i) => {
                                const source = knowledgeGraph.nodes[edge.source];
                                const target = knowledgeGraph.nodes[edge.target];
                                return (
                                  <div 
                                    key={i}
                                    className="cyber-graph-edge"
                                    style={{
                                      left: `${30 + Math.random() * 40}%`,
                                      top: `${30 + Math.random() * 40}%`,
                                      width: `${40 + Math.random() * 20}px`,
                                      transform: `rotate(${Math.random() * 360}deg)`
                                    }}
                                  ></div>
                                );
                              })}
                            </div>
                          </div>
                          
                          <div className="cyber-graph-legend">
                            <div className="cyber-legend-title">Detected Topics</div>
                            <div className="cyber-topics-flow">
                              {conversationTopics.map((topic, i) => (
                                <div key={i} className="cyber-topic-node">
                                  <span>{topic}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
          <div className={`cyber-input-wrapper ${isFocused ? 'cyber-focused' : ''} ${loading ? 'cyber-disabled' : ''}`}>
            <textarea
              ref={textareaRef}
              className="cyber-input-field"
              placeholder="Enter neural query..."
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={loading}
              rows={1}
            />
            
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
            
            {isSpeechEnabled && (
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
          <div className="cyber-keyboard-info">
            <span className="cyber-key">Enter</span> to send
            <span className="cyber-divider">|</span>
            <span className="cyber-key">Shift</span> + <span className="cyber-key">Enter</span> for line break
            {isAutoCompleteEnabled && (
              <>
                <span className="cyber-divider">|</span>
                <span className="cyber-key">Tab</span> to complete
              </>
            )}
          </div>
        </div>
        
        {/* Quantum Status Ticker */}
        <div className="cyber-status-ticker">
          <div className="cyber-ticker-content">
            <span className="cyber-ticker-text">Neural Interface Online • {currentPersona.name} Activated • Quantum Core Processing • Synaptic Enhancement Active • Neural Path Optimization • Deep Learning Calibration Complete • Ready For Cognitive Connection</span>
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
    max-width: 90%;
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
      `}</style>
    </div>
  );
};

export default NeuralChatInterface;