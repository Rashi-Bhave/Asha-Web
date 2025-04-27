import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import InterviewNavigation from './InterviewNavigation';
import InterviewService from '../../Services/InterviewService';
// import { useAuth } from '../../Contexts/AuthContext'; // Import auth context for user ID

// Component for the AI Interview Simulator
const InterviewSimulator = () => {
  const navigate = useNavigate();
  
  const currentUser = {
    id: '507f1f77bcf86cd799439011', // Valid ObjectId format
    _id: '507f1f77bcf86cd799439011',
    name: 'Demo User',
    email: 'demo@example.com'
  };
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const containerRef = useRef(null);
  
  // Configuration state
  const [configStage, setConfigStage] = useState(true);
  const [interviewActive, setInterviewActive] = useState(false);
  const [interviewConfig, setInterviewConfig] = useState({
    interviewType: 'technical',
    role: 'software-engineer',
    seniority: 'mid',
    duration: 15,
    focus: [],
    difficulty: 'medium',
    feedbackDetail: 'detailed'
  });
  
  // Custom role entry
  const [customRole, setCustomRole] = useState('');
  const [showCustomRole, setShowCustomRole] = useState(false);
  
  // Interview state
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [userResponse, setUserResponse] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const [responseTime, setResponseTime] = useState(0);
  const [responseStartTime, setResponseStartTime] = useState(null);
  const [interviewComplete, setInterviewComplete] = useState(false);
  
  // Session tracking
  const [sessionId, setSessionId] = useState(null);
  
  // Feedback state
  const [feedback, setFeedback] = useState(null);
  const [overallFeedback, setOverallFeedback] = useState(null);
  const [postureFeedback, setPostureFeedback] = useState(null);
  const [voiceFeedback, setVoiceFeedback] = useState(null);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [clarityScore, setClarityScore] = useState(0);
  const [technicalScore, setTechnicalScore] = useState(0);
  const [communicationScore, setCommunicationScore] = useState(0);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  
  // AI Analysis state
  const [posture, setPosture] = useState({
    eyeContact: 0,
    posture: 0,
    gestures: 0,
    facialExpressions: 0
  });
  const [voice, setVoice] = useState({
    pace: 0,
    volume: 0,
    clarity: 0,
    fillerWords: 0
  });
  
  // Emotion and analysis state
  const [emotionData, setEmotionData] = useState({
    confidence: 0,
    nervousness: 0,
    engagement: 0
  });
  const [keywordMatches, setKeywordMatches] = useState([]);
  const [fillerWordsUsed, setFillerWordsUsed] = useState({});
  const [wordFrequency, setWordFrequency] = useState({});
  
  // Mouse tracking for UI effects
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Animation and UI state
  const [activeFeedbackTab, setActiveFeedbackTab] = useState('content');
  const [animatedBackground, setAnimatedBackground] = useState(true);
  const [showHoloMessage, setShowHoloMessage] = useState(false);
  const [holoMessage, setHoloMessage] = useState('');
  const [recordedResponses, setRecordedResponses] = useState([]);
  
  // Available roles list from backend or default
  const [availableRoles, setAvailableRoles] = useState([
    { id: 'software-engineer', name: 'Software Engineer', icon: 'code' },
    { id: 'data-scientist', name: 'Data Scientist', icon: 'chart' },
    { id: 'product-manager', name: 'Product Manager', icon: 'tasks' },
    { id: 'ux-designer', name: 'UX Designer', icon: 'design' },
    { id: 'devops-engineer', name: 'DevOps Engineer', icon: 'server' },
    { id: 'cybersecurity-analyst', name: 'Cybersecurity Analyst', icon: 'shield' },
    { id: 'ai-engineer', name: 'AI Engineer', icon: 'brain' },
    { id: 'data-engineer', name: 'Data Engineer', icon: 'data' },
    { id: 'custom-role', name: 'Other Role (Custom)', icon: 'tasks' }
  ]);
  
  // Focus areas based on interview type
  const [focusAreas, setFocusAreas] = useState({
    technical: [
      { id: 'algorithms', name: 'Algorithms & Data Structures' },
      { id: 'system-design', name: 'System Design' },
      { id: 'coding', name: 'Coding Challenges' },
      { id: 'database', name: 'Database Knowledge' },
      { id: 'networking', name: 'Networking' },
      { id: 'security', name: 'Security Concepts' },
      { id: 'specific-languages', name: 'Specific Programming Languages' }
    ],
    behavioral: [
      { id: 'leadership', name: 'Leadership' },
      { id: 'teamwork', name: 'Teamwork' },
      { id: 'conflict', name: 'Conflict Resolution' },
      { id: 'challenges', name: 'Overcoming Challenges' },
      { id: 'achievements', name: 'Achievements' },
      { id: 'failures', name: 'Learning from Failures' },
      { id: 'career-goals', name: 'Career Goals' }
    ],
    mixed: [
      { id: 'problem-solving', name: 'Problem Solving' },
      { id: 'communication', name: 'Communication Skills' },
      { id: 'project-experience', name: 'Project Experience' },
      { id: 'technical-knowledge', name: 'Technical Knowledge' },
      { id: 'culture-fit', name: 'Culture Fit' },
      { id: 'adaptability', name: 'Adaptability' },
      { id: 'innovation', name: 'Innovation' }
    ]
  });
  
  // API URL
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';
  
  // Lifecycle hook to load roles from backend
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`${API_URL}/career/paths`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.success) {
            // Add custom role option to backend roles
            const roles = data.paths;
            roles.push({ id: 'custom-role', name: 'Other Role (Custom)', icon: 'tasks' });
            setAvailableRoles(roles);
          }
        }
      } catch (error) {
        console.error("Error fetching career paths:", error);
        // Keep default roles if fetch fails
      }
    };
    
    fetchRoles();
  }, [API_URL]);
  
  // Handle mouse movement for background effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Set up video and audio capture
  useEffect(() => {
    if (interviewActive && !streamRef.current) {
      const setupMediaDevices = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
          });
          
          streamRef.current = stream;
          
          // Set up video
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          
          // Set up audio analysis
          setupAudioAnalysis(stream);
          
          // Create media recorder for response recording
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          
          const chunks = [];
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data);
            }
          };
          
          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const audioURL = URL.createObjectURL(blob);
            
            // Add recorded response to list
            setRecordedResponses(prev => [...prev, {
              question: currentQuestion,
              audioURL,
              blob
            }]);
            
            // Clear chunks for next recording
            chunks.length = 0;
          };
          
          displayHoloMessage('Neural interface established. Video feed online.');
        } catch (err) {
          console.error("Error accessing media devices:", err);
          toast.error("Could not access camera or microphone. Please check permissions.");
          displayHoloMessage('Neural interface failed. Check hardware permissions.');
        }
      };
      
      setupMediaDevices();
    }
    
    // Clean up media streams on unmount
    return () => {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [interviewActive, currentQuestion]);
  
  // Set up periodic posture and voice analysis
  useEffect(() => {
    let postureFeedbackInterval;
    
    if (interviewActive && videoRef.current && canvasRef.current) {
      // Run posture and expression analysis every 3 seconds
      postureFeedbackInterval = setInterval(() => {
        if (!isResponding) return;
        
        analyzePostureAndExpressions();
        analyzeVoice();
      }, 3000);
    }
    
    return () => {
      if (postureFeedbackInterval) {
        clearInterval(postureFeedbackInterval);
      }
    };
  }, [interviewActive, isResponding]);
  
  // Response timer
  useEffect(() => {
    let timerInterval;
    
    if (isResponding) {
      timerInterval = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - responseStartTime) / 1000);
        setResponseTime(elapsedSeconds);
      }, 1000);
    }
    
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isResponding, responseStartTime]);
  
  // Setup audio analysis
  const setupAudioAnalysis = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;
    
    const analyser = audioContext.createAnalyser();
    analyserRef.current = analyser;
    
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
  };
  
  // Analyze voice characteristics - now uses the backend API
  const analyzeVoice = async () => {
    if (!analyserRef.current || !isResponding) return;
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyser.getByteFrequencyData(dataArray);
    
    // First, we still do local analysis for immediate UI feedback
    // Calculate average volume
    const sum = dataArray.reduce((acc, val) => acc + val, 0);
    const average = sum / bufferLength;
    const normalizedVolume = Math.min(100, Math.max(0, average * 1.5));
    
    // Detect pace based on variations in frequency data
    const variations = dataArray.slice(1).map((val, i) => Math.abs(val - dataArray[i]));
    const variationSum = variations.reduce((acc, val) => acc + val, 0);
    const variationAvg = variationSum / variations.length;
    const normalizedPace = Math.min(100, Math.max(0, variationAvg * 2));
    
    // For more accurate analysis, capture audio sample and send to backend (in production)
    // Here we'll simulate this by sending what we've analyzed locally
    try {
      // In a production app, you would convert the audio data to a format suitable for analysis
      // For demo purposes, we'll create a simplified representation
      const audioBlob = JSON.stringify(Array.from(dataArray));
      
      // Use the service to analyze audio
      const result = await InterviewService.analyzeAudioData({ audioBlob });
      
      if (result.success && result.analysis) {
        // Update voice metrics with the backend analysis
        setVoice({
          volume: result.analysis.volume || normalizedVolume,
          pace: result.analysis.pace || normalizedPace,
          clarity: result.analysis.clarity || Math.min(100, normalizedVolume * 0.8 + Math.random() * 20),
          fillerWords: result.analysis.fillerWords ? 
            Object.values(result.analysis.fillerWords).reduce((sum, count) => sum + count, 0) : 
            Math.max(0, 100 - normalizedPace - Math.random() * 30)
        });
        
        // Update fillerWords if available
        if (result.analysis.fillerWords) {
          setFillerWordsUsed(result.analysis.fillerWords);
        }
        
        // Update clarity score
        setClarityScore(result.analysis.clarity || Math.min(100, normalizedVolume * 0.6 + normalizedPace * 0.4));
      } else {
        // Fallback to local analysis if backend fails
        setVoice(prev => ({
          ...prev,
          volume: normalizedVolume,
          pace: normalizedPace,
          clarity: Math.min(100, normalizedVolume * 0.8 + Math.random() * 20),
          fillerWords: Math.max(0, 100 - normalizedPace - Math.random() * 30)
        }));
        
        setClarityScore(Math.min(100, normalizedVolume * 0.6 + normalizedPace * 0.4));
      }
    } catch (error) {
      console.error("Error analyzing audio with backend:", error);
      // Fallback to local analysis
      setVoice(prev => ({
        ...prev,
        volume: normalizedVolume,
        pace: normalizedPace,
        clarity: Math.min(100, normalizedVolume * 0.8 + Math.random() * 20),
        fillerWords: Math.max(0, 100 - normalizedPace - Math.random() * 30)
      }));
      
      setClarityScore(Math.min(100, normalizedVolume * 0.6 + normalizedPace * 0.4));
    }
  };
  
  // Analyze posture and facial expressions - now uses the backend API
  const analyzePostureAndExpressions = async () => {
    if (!videoRef.current || !canvasRef.current || !isResponding) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame on canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // In a real implementation, we would send this frame to our backend for analysis
    // For now, let's convert the canvas to a data URL to simulate sending video data
    try {
      const videoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      // Use the service to analyze video
      const result = await InterviewService.analyzeVideoData({ videoDataUrl });
      
      if (result.success && result.analysis) {
        // Update posture metrics with backend analysis
        setPosture({
          eyeContact: result.analysis.eyeContact || 0,
          posture: result.analysis.posture || 0,
          gestures: result.analysis.gestures || 0,
          facialExpressions: result.analysis.facialExpressions ? 
            Object.values(result.analysis.facialExpressions).reduce((acc, val) => acc + val, 0) / 4 : 0
        });
        
        // Update confidence score based on backend analysis
        setConfidenceScore(
          result.analysis.attentiveness || 
          ((result.analysis.eyeContact * 0.3) + 
          (result.analysis.posture * 0.3) + 
          (result.analysis.gestures * 0.2) + 
          (Object.values(result.analysis.facialExpressions || {}).reduce((acc, val) => acc + val, 0) / 4 * 0.2))
        );
        
        // Update emotion data
        setEmotionData({
          confidence: result.analysis.attentiveness || Math.min(100, result.analysis.posture * 0.7 + result.analysis.eyeContact * 0.3),
          nervousness: Math.max(0, 100 - (result.analysis.posture * 0.5 + result.analysis.eyeContact * 0.5)),
          engagement: result.analysis.attentiveness || Math.min(100, (Object.values(result.analysis.facialExpressions || {}).reduce((acc, val) => acc + val, 0) / 4) * 0.6 + result.analysis.gestures * 0.4)
        });
      } else {
        // Fallback to simulated analysis if backend fails
        simulatePostureAnalysis();
      }
    } catch (error) {
      console.error("Error analyzing video with backend:", error);
      // Fallback to simulated analysis
      simulatePostureAnalysis();
    }
  };
  
  // Fallback function for posture analysis if backend fails
  const simulatePostureAnalysis = () => {
    const eyeContactScore = 60 + Math.random() * 40;
    const postureScore = 70 + Math.random() * 30;
    const gestureScore = 50 + Math.random() * 50;
    const expressionsScore = 60 + Math.random() * 40;
    
    setPosture({
      eyeContact: eyeContactScore,
      posture: postureScore,
      gestures: gestureScore,
      facialExpressions: expressionsScore
    });
    
    // Update confidence score based on posture and expressions
    setConfidenceScore(
      (eyeContactScore * 0.3) + 
      (postureScore * 0.3) + 
      (gestureScore * 0.2) + 
      (expressionsScore * 0.2)
    );
    
    // Update emotion data
    setEmotionData({
      confidence: Math.min(100, postureScore * 0.7 + eyeContactScore * 0.3),
      nervousness: Math.max(0, 100 - (postureScore * 0.5 + eyeContactScore * 0.5)),
      engagement: Math.min(100, expressionsScore * 0.6 + gestureScore * 0.4)
    });
  };
  
  // Generate interview questions using backend LLM
  const generateInterviewQuestions = async () => {
    try {
      // Display loading message
      displayHoloMessage('Generating neural interview matrix...');
      
      // Prepare request data
      const requestData = {
        interviewType: interviewConfig.interviewType,
        role: showCustomRole ? customRole : interviewConfig.role,
        seniority: interviewConfig.seniority,
        focusAreas: interviewConfig.focus,
        difficulty: interviewConfig.difficulty,
        questionCount: Math.floor(interviewConfig.duration / 2.5), // Approximately 2.5 minutes per question
        userId: currentUser?.id // Include user ID for session creation if logged in
      };
      
      // Use the interview service to generate questions
      const response = await InterviewService.generateQuestions(requestData);
      
      if (response && response.success) {
        setQuestions(response.questions);
        setCurrentQuestion(response.questions[0].question);
        
        // Store session ID if available
        if (response.sessionId) {
          setSessionId(response.sessionId);
        }
        
        displayHoloMessage('Interview matrix initialized. Starting simulation.');
        return true;
      } else {
        throw new Error("Failed to generate questions");
      }
    } catch (error) {
      console.error("Error generating interview questions:", error);
      toast.error("Failed to generate interview questions. Please try again.");
      displayHoloMessage('Neural matrix generation failed. System error.');
      return false;
    }
  };
  
  // Analyze user response using backend LLM
  const analyzeResponse = async () => {
    try {
      setLoadingFeedback(true);
      displayHoloMessage('Computing quantum response analysis...');
      
      // Prepare request data
      const requestData = {
        interviewType: interviewConfig.interviewType,
        role: showCustomRole ? customRole : interviewConfig.role,
        seniority: interviewConfig.seniority,
        question: currentQuestion,
        response: userResponse,
        feedbackDetail: interviewConfig.feedbackDetail,
        nonVerbalData: {
          posture: posture,
          voice: voice,
          emotionData: emotionData
        },
        sessionId: sessionId, // Include session ID if available
        questionIndex: sessionId ? questionIndex : null // Include question index if session exists
      };
      
      // Use the interview service to analyze response
      const response = await InterviewService.analyzeResponse(requestData);
      
      if (response && response.success) {
        // Extract scored metrics from response
        setFeedback(response.feedback);
        setTechnicalScore(response.scores.technical || 0);
        setCommunicationScore(response.scores.communication || 0);
        setKeywordMatches(response.keywordMatches || []);
        setFillerWordsUsed(response.fillerWords || {});
        
        // Generate text for posture feedback
        generatePostureFeedback();
        generateVoiceFeedback();
        
        displayHoloMessage('Analysis complete. Feedback ready.');
        return true;
      } else {
        throw new Error("Failed to analyze response");
      }
    } catch (error) {
      console.error("Error analyzing response:", error);
      toast.error("Failed to analyze your response. Please try again.");
      displayHoloMessage('Analysis engine failure. Error in neural matrix.');
      return false;
    } finally {
      setLoadingFeedback(false);
    }
  };
  
  // Generate overall interview feedback
  const generateOverallFeedback = async () => {
    try {
      setLoadingFeedback(true);
      displayHoloMessage('Synthesizing comprehensive neural evaluation...');
      
      // Prepare response data - include transcriptions if available
      const allResponses = questions.map((question, index) => ({
        question: question.question,
        response: recordedResponses[index]?.transcription || userResponse || "Response not available"
      }));
      
      const requestData = {
        interviewType: interviewConfig.interviewType,
        role: showCustomRole ? customRole : interviewConfig.role,
        seniority: interviewConfig.seniority,
        responses: allResponses,
        nonVerbalMetrics: {
          avgConfidence: confidenceScore,
          avgClarity: clarityScore,
          avgTechnicalScore: technicalScore,
          avgCommunicationScore: communicationScore
        },
        feedbackDetail: interviewConfig.feedbackDetail,
        sessionId: sessionId // Include session ID if available
      };
      
      // Use the interview service to generate overall feedback
      const response = await InterviewService.generateOverallFeedback(requestData);
      
      if (response && response.success) {
        setOverallFeedback(response.feedback);
        displayHoloMessage('Neural evaluation complete. Results ready.');
        return true;
      } else {
        throw new Error("Failed to generate overall feedback");
      }
    } catch (error) {
      console.error("Error generating overall feedback:", error);
      toast.error("Failed to generate overall feedback. Please try again.");
      displayHoloMessage('Evaluation synthesis failed. System error.');
      return false;
    } finally {
      setLoadingFeedback(false);
    }
  };
  
  // Generate text feedback for posture and body language
  const generatePostureFeedback = () => {
    let feedbackText = "**Neural Posture Analysis**\n\n";
    
    // Eye contact feedback
    if (posture.eyeContact > 80) {
      feedbackText += "✓ Excellent eye contact maintained throughout response. This projects confidence and engagement.\n\n";
    } else if (posture.eyeContact > 60) {
      feedbackText += "△ Good eye contact observed, with occasional shifts away. Try to maintain more consistent eye contact with the camera.\n\n";
    } else {
      feedbackText += "✗ Limited eye contact detected. Looking directly at the camera more frequently would strengthen your presence.\n\n";
    }
    
    // Posture feedback
    if (posture.posture > 80) {
      feedbackText += "✓ Strong upright posture observed. Your aligned posture projects professionalism and confidence.\n\n";
    } else if (posture.posture > 60) {
      feedbackText += "△ Generally good posture with occasional slouching. Maintaining a consistently upright position would further improve your presence.\n\n";
    } else {
      feedbackText += "✗ Significant slouching detected. Focus on sitting straighter with shoulders back to project more confidence.\n\n";
    }
    
    // Gestures feedback
    if (posture.gestures > 80) {
      feedbackText += "✓ Effective hand gestures complement your verbal communication. Your gestures enhance your explanation without being distracting.\n\n";
    } else if (posture.gestures > 60) {
      feedbackText += "△ Some use of hand gestures, but could be more purposeful. Deliberate gestures can emphasize key points.\n\n";
    } else {
      feedbackText += "✗ Limited use of hand gestures. Adding more purposeful gestures could enhance your communication and engagement.\n\n";
    }
    
    // Facial expressions feedback
    if (posture.facialExpressions > 80) {
      feedbackText += "✓ Excellent facial engagement. Your expressions effectively convey enthusiasm and interest in the discussion.\n\n";
    } else if (posture.facialExpressions > 60) {
      feedbackText += "△ Some facial expressiveness, but could show more engagement. Try to vary your expressions to match the content of your response.\n\n";
    } else {
      feedbackText += "✗ Limited facial expressiveness detected. More animated facial expressions would help convey passion and interest.\n\n";
    }
    
    setPostureFeedback(feedbackText);
  };
  
  // Generate text feedback for voice characteristics
  const generateVoiceFeedback = () => {
    let feedbackText = "**Neural Voice Analysis**\n\n";
    
    // Volume feedback
    if (voice.volume > 80) {
      feedbackText += "✓ Optimal volume level. Your voice is clear and easily heard without being too loud.\n\n";
    } else if (voice.volume > 60) {
      feedbackText += "△ Adequate volume, but occasionally too soft. Try to project your voice more consistently.\n\n";
    } else {
      feedbackText += "✗ Volume levels frequently too low. Speaking more loudly would ensure your points are clearly heard.\n\n";
    }
    
    // Pace feedback
    if (voice.pace > 80) {
      feedbackText += "✓ Excellent speaking pace. Your rate of speech allows for clear understanding while maintaining engagement.\n\n";
    } else if (voice.pace > 60) {
      feedbackText += "△ Generally good pace, but sometimes rushed. Try to slow down during complex explanations.\n\n";
    } else {
      feedbackText += "✗ Speaking pace is too rapid or uneven. A more measured pace would improve clarity and comprehension.\n\n";
    }
    
    // Clarity feedback
    if (voice.clarity > 80) {
      feedbackText += "✓ Excellent clarity of speech. Your pronunciation and articulation enhance understanding.\n\n";
    } else if (voice.clarity > 60) {
      feedbackText += "△ Words are generally clear, with occasional mumbling. Focus on fully articulating technical terms.\n\n";
    } else {
      feedbackText += "✗ Articulation needs improvement. Clearer pronunciation would significantly enhance communication.\n\n";
    }
    
    // Filler words feedback
    if (voice.fillerWords < 20) {
      feedbackText += "✓ Minimal use of filler words. Your speech is concise and confident.\n\n";
    } else if (voice.fillerWords < 40) {
      feedbackText += "△ Moderate use of filler words detected. Reducing words like 'um', 'uh', and 'like' would strengthen your delivery.\n\n";
    } else {
      feedbackText += "✗ Frequent filler words observed. Practice pausing instead of using filler words for more impactful communication.\n\n";
    }
    
    setVoiceFeedback(feedbackText);
  };
  
  // Display holographic message
  const displayHoloMessage = (message) => {
    setHoloMessage(message);
    setShowHoloMessage(true);
    setTimeout(() => {
      setShowHoloMessage(false);
    }, 4000);
  };
  
  // Start the interview
  const startInterview = async () => {
    // Validate configuration
    if (interviewConfig.focus.length === 0) {
      toast.error("Please select at least one focus area");
      return;
    }
    
    if (interviewConfig.role === 'custom-role' && !customRole.trim()) {
      toast.error("Please enter your custom role");
      return;
    }
    
    // Generate questions
    const success = await generateInterviewQuestions();
    if (success) {
      setConfigStage(false);
      setInterviewActive(true);
      setQuestionIndex(0);
    }
  };
  
  // Toggle focus area selection
  const toggleFocusArea = (focusId) => {
    setInterviewConfig(prevConfig => {
      const focus = [...prevConfig.focus];
      
      if (focus.includes(focusId)) {
        // Remove if already selected
        return {
          ...prevConfig,
          focus: focus.filter(id => id !== focusId)
        };
      } else {
        // Add if not already selected (up to 3)
        if (focus.length < 3) {
          return {
            ...prevConfig,
            focus: [...focus, focusId]
          };
        }
        // If already at 3 selected, show error toast
        toast.error("Maximum 3 focus areas allowed");
        return prevConfig;
      }
    });
  };
  
  // Start recording response
  const startResponse = () => {
    setIsResponding(true);
    setResponseStartTime(Date.now());
    
    // Start recording audio
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.start();
    }
  };
  
  // End recording response
  const endResponse = async () => {
    setIsResponding(false);
    
    // Stop recording audio
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Analyze the response
    const success = await analyzeResponse();
    
    if (success) {
      // Response is now analyzed and feedback is available
    }
  };
  
  // Move to next question
  const nextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setCurrentQuestion(questions[questionIndex + 1].question);
      setUserResponse('');
      setFeedback(null);
      setPostureFeedback(null);
      setVoiceFeedback(null);
      displayHoloMessage('Neural matrix advancing to next question.');
    } else {
      // Interview complete
      setInterviewComplete(true);
      generateOverallFeedback();
      displayHoloMessage('Neural interview matrix complete. Generating evaluation.');
    }
  };
  
  // Format duration for display
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Get role name from ID
  const getRoleName = (roleId) => {
    const role = availableRoles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };
  
  // Get icon component based on type
  const getIcon = (type) => {
    switch(type) {
      case 'code':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case 'chart':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'design':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        );
      case 'tasks':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'server':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
        );
      case 'shield':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'brain':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'data':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };
  
  // Reset interview and return to configuration
  const resetInterview = () => {
    // Stop media streams
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Reset state
    setConfigStage(true);
    setInterviewActive(false);
    setInterviewComplete(false);
    setQuestions([]);
    setCurrentQuestion('');
    setQuestionIndex(0);
    setUserResponse('');
    setFeedback(null);
    setOverallFeedback(null);
    setPostureFeedback(null);
    setVoiceFeedback(null);
    setRecordedResponses([]);
    setSessionId(null);
    
    displayHoloMessage('Neural matrix reset complete. Ready for new configuration.');
  };
  
  // Function to save interview report
  const saveInterviewReport = async () => {
    try {
      if (!sessionId) {
        toast.error("Cannot save report: No active session found");
        return;
      }
      
      // In a real app, you would call a backend API to generate and download the report
      toast.success("Interview report download started");
      
      // Simulate downloading a report
      setTimeout(() => {
        // Create a dummy text file for demonstration
        const reportContent = `
Interview Report
---------------
Role: ${showCustomRole ? customRole : getRoleName(interviewConfig.role)}
Seniority: ${interviewConfig.seniority}
Type: ${interviewConfig.interviewType}
Date: ${new Date().toLocaleDateString()}

Technical Score: ${technicalScore}%
Communication Score: ${communicationScore}%
Confidence Score: ${Math.round(confidenceScore)}%
Voice Clarity Score: ${Math.round(clarityScore)}%

Overall Feedback:
${overallFeedback || "Not available"}
        `;
        
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'interview-report.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success("Interview report downloaded");
      }, 1500);
    } catch (error) {
      console.error("Error saving interview report:", error);
      toast.error("Failed to download interview report");
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gray-900 text-gray-100 p-4 overflow-hidden relative"
    >
      {/* Animated background elements */}
      {animatedBackground && (
        <>
          <div className="absolute inset-0 z-0">
            <div className="cyber-grid"></div>
          </div>
          
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full filter blur-[150px] bg-blue-900 opacity-20 animate-pulse-slow"
            style={{transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`}}
          ></div>
          <div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full filter blur-[150px] bg-cyan-900 opacity-20 animate-pulse-slow animation-delay-1000"
            style={{transform: `translate(${-mousePosition.x * 30}px, ${-mousePosition.y * 30}px)`}}
          ></div>
        </>
      )}
      
      {/* Hologram message */}
      {showHoloMessage && (
        <div className="cyber-system-message fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 opacity-100">
          <div className="bg-gray-900/80 backdrop-blur-sm text-cyan-400 border border-cyan-700 rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center">
              <div className="cyber-system-icon mr-2">
                <div className="cyber-system-icon-dot"></div>
              </div>
              <div className="cyber-system-text font-mono text-sm">
                {holoMessage}
              </div>
            </div>
          </div>
        </div>
      )}

      <InterviewNavigation />
      
      {/* Header */}
      <div className="mb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="h-8 w-8 text-cyan-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h1 className="text-xl font-medium text-white">
              Neural Interview Simulator
              <span className="cyber-blink">_</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="cyber-status-bar flex items-center space-x-3 bg-gray-900/60 rounded-lg px-3 py-1.5 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="text-xs font-medium text-gray-400">STATUS:</div>
                <div className="flex items-center text-green-400">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse mr-1.5"></div>
                  <span className="text-xs font-medium uppercase">
                    {interviewActive ? 'ACTIVE' : (interviewComplete ? 'COMPLETE' : 'READY')}
                  </span>
                </div>
              </div>
              
              <div className="w-px h-4 bg-gray-700"></div>
              
              <div className="flex items-center space-x-2">
                <div className="text-xs font-medium text-gray-400">
                  {configStage ? 'CONFIG:' : (interviewComplete ? 'RESULTS:' : 'QUESTION:')}
                </div>
                <div className="text-xs font-medium text-cyan-400">
                  {configStage ? 'ACTIVE' : 
                   (interviewComplete ? 'READY' : `${questionIndex + 1}/${questions.length}`)}
                </div>
              </div>
            </div>
            
            {!configStage && !interviewComplete && (
              <button 
                onClick={resetInterview}
                className="cyber-button-danger"
              >
                <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Exit Interview
              </button>
            )}
            
            {interviewComplete && (
              <button 
                onClick={resetInterview}
                className="cyber-button-primary"
              >
                <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Start New Interview
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      {configStage ? (
        /* Interview Configuration Panel */
        <div className="cyber-content-panel p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="cyber-section-title mb-6 text-xl">
                AI Interview Configuration
              </h2>
              
              {/* Interview Type Selection */}
              <div className="mb-6">
                <label className="cyber-form-label mb-2">Interview Type</label>
                <div className="cyber-option-group grid grid-cols-3 gap-3">
                  <button
                    className={`cyber-option ${interviewConfig.interviewType === 'technical' ? 'cyber-option-active' : ''}`}
                    onClick={() => setInterviewConfig({...interviewConfig, interviewType: 'technical'})}
                  >
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span>Technical</span>
                  </button>
                  
                  <button
                    className={`cyber-option ${interviewConfig.interviewType === 'behavioral' ? 'cyber-option-active' : ''}`}
                    onClick={() => setInterviewConfig({...interviewConfig, interviewType: 'behavioral'})}
                  >
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Behavioral</span>
                  </button>
                  
                  <button
                    className={`cyber-option ${interviewConfig.interviewType === 'mixed' ? 'cyber-option-active' : ''}`}
                    onClick={() => setInterviewConfig({...interviewConfig, interviewType: 'mixed'})}
                  >
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                    <span>Mixed</span>
                  </button>
                </div>
              </div>
              
              {/* Role Selection */}
              <div className="mb-6">
                <label className="cyber-form-label mb-2">Target Role</label>
                <div className="cyber-roles-grid grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableRoles.map(role => (
                    <button
                      key={role.id}
                      className={`cyber-role-option ${interviewConfig.role === role.id ? 'cyber-role-active' : ''}`}
                      onClick={() => {
                        setInterviewConfig({...interviewConfig, role: role.id});
                        setShowCustomRole(role.id === 'custom-role');
                      }}
                    >
                      <div className="cyber-role-icon">
                        {getIcon(role.icon)}
                      </div>
                      <span className="cyber-role-name">{role.name}</span>
                    </button>
                  ))}
                </div>
                
                {/* Custom Role Input */}
                {showCustomRole && (
                  <div className="mt-3">
                    <div className="cyber-input-container">
                      <input
                        type="text"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        placeholder="Enter custom role (e.g., 'ML Engineer')"
                        className="cyber-form-input"
                      />
                      <div className="cyber-input-focus-bar"></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Seniority Level */}
              <div className="mb-6">
                <label className="cyber-form-label mb-2">Seniority Level</label>
                <div className="cyber-option-group grid grid-cols-3 gap-3">
                  <button
                    className={`cyber-option ${interviewConfig.seniority === 'junior' ? 'cyber-option-active' : ''}`}
                    onClick={() => setInterviewConfig({...interviewConfig, seniority: 'junior'})}
                  >
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>Junior</span>
                  </button>
                  
                  <button
                    className={`cyber-option ${interviewConfig.seniority === 'mid' ? 'cyber-option-active' : ''}`}
                    onClick={() => setInterviewConfig({...interviewConfig, seniority: 'mid'})}
                  >
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Mid-Level</span>
                  </button>
                  
                  <button
                    className={`cyber-option ${interviewConfig.seniority === 'senior' ? 'cyber-option-active' : ''}`}
                    onClick={() => setInterviewConfig({...interviewConfig, seniority: 'senior'})}
                  >
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>Senior</span>
                  </button>
                </div>
              </div>
              
              {/* Difficulty Level */}
              <div className="mb-6">
                <label className="cyber-form-label mb-2">Difficulty Level</label>
                <div className="cyber-option-group grid grid-cols-3 gap-3">
                  <button
                    className={`cyber-option ${interviewConfig.difficulty === 'easy' ? 'cyber-option-active' : ''}`}
                    onClick={() => setInterviewConfig({...interviewConfig, difficulty: 'easy'})}
                  >
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Easy</span>
                  </button>
                  
                  <button
                    className={`cyber-option ${interviewConfig.difficulty === 'medium' ? 'cyber-option-active' : ''}`}
                    onClick={() => setInterviewConfig({...interviewConfig, difficulty: 'medium'})}
                  >
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Medium</span>
                  </button>
                  
                  <button
                    className={`cyber-option ${interviewConfig.difficulty === 'hard' ? 'cyber-option-active' : ''}`}
                    onClick={() => setInterviewConfig({...interviewConfig, difficulty: 'hard'})}
                  >
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Hard</span>
                  </button>
                </div>
              </div>
              
              {/* Duration Setting */}
              <div className="mb-6">
                <label className="cyber-form-label mb-2">Interview Duration (minutes)</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={interviewConfig.duration}
                    onChange={(e) => setInterviewConfig({...interviewConfig, duration: Number(e.target.value)})}
                    className="cyber-range-slider"
                  />
                  <span className="ml-4 text-cyan-400 font-mono">{interviewConfig.duration} min</span>
                </div>
              </div>
              
              {/* Feedback Detail Level */}
              <div className="mb-6">
                <label className="cyber-form-label mb-2">Feedback Detail</label>
                <div className="cyber-option-group grid grid-cols-3 gap-3">
                  <button
                    className={`cyber-option ${interviewConfig.feedbackDetail === 'brief' ? 'cyber-option-active' : ''}`}
                    onClick={() => setInterviewConfig({...interviewConfig, feedbackDetail: 'brief'})}
                  >
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h7" />
                    </svg>
                    <span>Brief</span>
                  </button>
                  
                  <button
                    className={`cyber-option ${interviewConfig.feedbackDetail === 'detailed' ? 'cyber-option-active' : ''}`}
                    onClick={() => setInterviewConfig({...interviewConfig, feedbackDetail: 'detailed'})}
                  >
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span>Detailed</span>
                  </button>
                  
                  <button
                    className={`cyber-option ${interviewConfig.feedbackDetail === 'comprehensive' ? 'cyber-option-active' : ''}`}
                    onClick={() => setInterviewConfig({...interviewConfig, feedbackDetail: 'comprehensive'})}
                  >
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Comprehensive</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Focus Areas Column */}
            <div>
              <h2 className="cyber-section-title mb-6 text-xl">
                Interview Focus Areas
                <span className="ml-3 text-sm text-gray-400 font-normal">(Select up to 3)</span>
              </h2>
              
              <div className="cyber-focus-container p-4 border border-cyan-800/50 rounded-lg bg-gray-900/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {focusAreas[interviewConfig.interviewType].map(focus => (
                    <div 
                      key={focus.id}
                      className={`cyber-focus-item ${interviewConfig.focus.includes(focus.id) ? 'cyber-focus-active' : ''}`}
                      onClick={() => toggleFocusArea(focus.id)}
                    >
                      <div className="cyber-focus-checkbox">
                        {interviewConfig.focus.includes(focus.id) && (
                          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span>{focus.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Interview Summary */}
              <div className="mt-8">
                <h3 className="cyber-section-subtitle mb-4">Interview Configuration Summary</h3>
                <div className="cyber-summary-panel">
                  <div className="cyber-summary-item">
                    <span className="cyber-summary-label">Type:</span>
                    <span className="cyber-summary-value">{interviewConfig.interviewType.charAt(0).toUpperCase() + interviewConfig.interviewType.slice(1)} Interview</span>
                  </div>
                  
                  <div className="cyber-summary-item">
                    <span className="cyber-summary-label">Role:</span>
                    <span className="cyber-summary-value">
                      {interviewConfig.role === 'custom-role' 
                        ? (customRole || 'Not specified') 
                        : getRoleName(interviewConfig.role)}
                    </span>
                  </div>
                  
                  <div className="cyber-summary-item">
                    <span className="cyber-summary-label">Level:</span>
                    <span className="cyber-summary-value">{interviewConfig.seniority.charAt(0).toUpperCase() + interviewConfig.seniority.slice(1)}</span>
                  </div>
                  
                  <div className="cyber-summary-item">
                    <span className="cyber-summary-label">Difficulty:</span>
                    <span className="cyber-summary-value">{interviewConfig.difficulty.charAt(0).toUpperCase() + interviewConfig.difficulty.slice(1)}</span>
                  </div>
                  
                  <div className="cyber-summary-item">
                    <span className="cyber-summary-label">Duration:</span>
                    <span className="cyber-summary-value">{interviewConfig.duration} minutes</span>
                  </div>
                  
                  <div className="cyber-summary-item">
                    <span className="cyber-summary-label">Focus:</span>
                    <div className="cyber-summary-value">
                      {interviewConfig.focus.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {interviewConfig.focus.map(focusId => {
                            const focusItem = focusAreas[interviewConfig.interviewType].find(f => f.id === focusId);
                            return focusItem ? (
                              <span key={focusId} className="cyber-focus-badge">
                                {focusItem.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <span className="text-gray-500">No focus areas selected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Start Interview Button */}
              <div className="mt-8 flex justify-center">
                <button 
                  className="cyber-button-start-interview"
                  onClick={startInterview}
                  disabled={interviewConfig.focus.length === 0 || (interviewConfig.role === 'custom-role' && !customRole.trim())}
                >
                  <div className="cyber-button-glow"></div>
                  <span className="relative z-10">Initialize Neural Interview</span>
                  <svg className="h-5 w-5 ml-2 relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : interviewComplete ? (
        /* Interview Results Panel */
        <div className="cyber-content-panel p-6">
          <h2 className="cyber-section-title mb-6 text-xl">
            Neural Interview Analysis - Complete
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Overall Stats and Feedback Column */}
            <div className="lg:col-span-2">
              {/* Score Summary */}
              <div className="cyber-score-summary mb-6">
                <h3 className="cyber-section-subtitle mb-4">Performance Metrics</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Technical Score */}
                  <div className="cyber-score-card">
                    <div className="cyber-score-header">
                      <svg className="h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <span>Technical Mastery</span>
                    </div>
                    
                    <div className="cyber-score-meter">
                      <div 
                        className={`cyber-score-fill ${
                          technicalScore >= 80 ? 'bg-green-500' : 
                          technicalScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${technicalScore}%` }}
                      ></div>
                    </div>
                    
                    <div className="cyber-score-value">
                      <span className="text-2xl font-bold">{technicalScore}%</span>
                      <span className="text-sm ml-2">
                        {technicalScore >= 80 ? 'Excellent' : 
                         technicalScore >= 60 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Communication Score */}
                  <div className="cyber-score-card">
                    <div className="cyber-score-header">
                      <svg className="h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Communication</span>
                    </div>
                    
                    <div className="cyber-score-meter">
                      <div 
                        className={`cyber-score-fill ${
                          communicationScore >= 80 ? 'bg-green-500' : 
                          communicationScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${communicationScore}%` }}
                      ></div>
                    </div>
                    
                    <div className="cyber-score-value">
                      <span className="text-2xl font-bold">{communicationScore}%</span>
                      <span className="text-sm ml-2">
                        {communicationScore >= 80 ? 'Excellent' : 
                         communicationScore >= 60 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Confidence Score */}
                  <div className="cyber-score-card">
                    <div className="cyber-score-header">
                      <svg className="h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Confidence</span>
                    </div>
                    
                    <div className="cyber-score-meter">
                      <div 
                        className={`cyber-score-fill ${
                          confidenceScore >= 80 ? 'bg-green-500' : 
                          confidenceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${confidenceScore}%` }}
                      ></div>
                    </div>
                    
                    <div className="cyber-score-value">
                      <span className="text-2xl font-bold">{Math.round(confidenceScore)}%</span>
                      <span className="text-sm ml-2">
                        {confidenceScore >= 80 ? 'Excellent' : 
                         confidenceScore >= 60 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Clarity Score */}
                  <div className="cyber-score-card">
                    <div className="cyber-score-header">
                      <svg className="h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      <span>Voice Clarity</span>
                    </div>
                    
                    <div className="cyber-score-meter">
                      <div 
                        className={`cyber-score-fill ${
                          clarityScore >= 80 ? 'bg-green-500' : 
                          clarityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${clarityScore}%` }}
                      ></div>
                    </div>
                    
                    <div className="cyber-score-value">
                      <span className="text-2xl font-bold">{Math.round(clarityScore)}%</span>
                      <span className="text-sm ml-2">
                        {clarityScore >= 80 ? 'Excellent' : 
                         clarityScore >= 60 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Overall Feedback */}
              <div className="cyber-overall-feedback mb-6">
                <h3 className="cyber-section-subtitle mb-4">Neural Interview Assessment</h3>
                
                {loadingFeedback ? (
                  <div className="cyber-loading-container py-8 text-center">
                    <div className="cyber-loading-spinner mx-auto mb-4">
                      <div className="cyber-spinner-ring"></div>
                      <div className="cyber-spinner-ring"></div>
                      <div className="cyber-spinner-ring"></div>
                    </div>
                    <p className="cyber-loading-text">Synthesizing comprehensive assessment...</p>
                  </div>
                ) : overallFeedback ? (
                  <div className="cyber-overall-feedback-content whitespace-pre-line">
                    {overallFeedback}
                  </div>
                ) : (
                  <div className="cyber-loading-container py-8 text-center">
                    <p className="cyber-loading-text">Generating interview assessment...</p>
                  </div>
                )}
              </div>
              
              {/* Question Responses Summary */}
              <div className="cyber-responses-summary">
                <h3 className="cyber-section-subtitle mb-4">Question Response Analysis</h3>
                
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={index} className="cyber-response-item">
                      <div className="cyber-response-question">
                        <span className="cyber-response-number">Q{index + 1}</span>
                        <span className="cyber-response-text">{question.question}</span>
                      </div>
                      <div className="cyber-response-metrics">
                        <div className="cyber-response-metric">
                          <span className="cyber-metric-label">Technical</span>
                          <div className="cyber-metric-bar">
                            <div 
                              className={`cyber-metric-fill ${
                                question.technicalScore >= 8 ? 'bg-green-500' : 
                                question.technicalScore >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${(question.technicalScore || Math.random() * 4 + 5) * 10}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="cyber-response-metric">
                          <span className="cyber-metric-label">Clarity</span>
                          <div className="cyber-metric-bar">
                            <div 
                              className={`cyber-metric-fill ${
                                question.clarityScore >= 8 ? 'bg-green-500' : 
                                question.clarityScore >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${(question.clarityScore || Math.random() * 3 + 6) * 10}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="cyber-response-metric">
                          <span className="cyber-metric-label">Confidence</span>
                          <div className="cyber-metric-bar">
                            <div 
                              className={`cyber-metric-fill ${
                                question.confidenceScore >= 8 ? 'bg-green-500' : 
                                question.confidenceScore >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${(question.confidenceScore || Math.random() * 3 + 5) * 10}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Improvement Recommendations Column */}
            <div>
              <h3 className="cyber-section-subtitle mb-4">Neural Enhancement Matrix</h3>
              
              <div className="space-y-6">
                {/* Technical Improvements */}
                <div className="cyber-improvement-category">
                  <div className="cyber-improvement-header">
                    <svg className="h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <h4>Technical Improvement Matrix</h4>
                  </div>
                  
                  <div className="cyber-improvement-content">
                    <ul className="cyber-improvement-list">
                      <li className="cyber-improvement-item">
                        <div className="cyber-improvement-bullet"></div>
                        <span>Deepen knowledge of system design patterns to strengthen architectural explanations</span>
                      </li>
                      <li className="cyber-improvement-item">
                        <div className="cyber-improvement-bullet"></div>
                        <span>Practice explaining algorithm time complexity analysis more concisely</span>
                      </li>
                      <li className="cyber-improvement-item">
                        <div className="cyber-improvement-bullet"></div>
                        <span>Expand real-world examples of implementing technical solutions</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {/* Communication Improvements */}
                <div className="cyber-improvement-category">
                  <div className="cyber-improvement-header">
                    <svg className="h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h4>Communication Enhancement</h4>
                  </div>
                  
                  <div className="cyber-improvement-content">
                    <ul className="cyber-improvement-list">
                      <li className="cyber-improvement-item">
                        <div className="cyber-improvement-bullet"></div>
                        <span>Structure responses with clear beginning, middle, and conclusion</span>
                      </li>
                      <li className="cyber-improvement-item">
                        <div className="cyber-improvement-bullet"></div>
                        <span>Reduce filler words ("um", "like") by practicing deliberate pauses</span>
                      </li>
                      <li className="cyber-improvement-item">
                        <div className="cyber-improvement-bullet"></div>
                        <span>Develop more concise explanations of complex technical concepts</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {/* Body Language Improvements */}
                <div className="cyber-improvement-category">
                  <div className="cyber-improvement-header">
                    <svg className="h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h4>Neural Interface Calibration</h4>
                  </div>
                  
                  <div className="cyber-improvement-content">
                    <ul className="cyber-improvement-list">
                      <li className="cyber-improvement-item">
                        <div className="cyber-improvement-bullet"></div>
                        <span>Maintain more consistent eye contact with the camera to project confidence</span>
                      </li>
                      <li className="cyber-improvement-item">
                        <div className="cyber-improvement-bullet"></div>
                        <span>Use more purposeful hand gestures to emphasize key points</span>
                      </li>
                      <li className="cyber-improvement-item">
                        <div className="cyber-improvement-bullet"></div>
                        <span>Improve posture by sitting upright to project more confidence and authority</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {/* Practice Recommendations */}
                <div className="cyber-improvement-category">
                  <div className="cyber-improvement-header">
                    <svg className="h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <h4>Optimization Protocols</h4>
                  </div>
                  
                  <div className="cyber-improvement-content">
                    <ul className="cyber-improvement-list">
                      <li className="cyber-improvement-item">
                        <div className="cyber-improvement-bullet"></div>
                        <span>Schedule 3 mock interviews focusing specifically on system design questions</span>
                      </li>
                      <li className="cyber-improvement-item">
                        <div className="cyber-improvement-bullet"></div>
                        <span>Record practice sessions to review and improve body language patterns</span>
                      </li>
                      <li className="cyber-improvement-item">
                        <div className="cyber-improvement-bullet"></div>
                        <span>Join toastmasters or similar group to practice communication skills weekly</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Actions Buttons */}
              <div className="mt-8 flex flex-col space-y-4">
                <button 
                  className="cyber-button-primary w-full"
                  onClick={saveInterviewReport}
                >
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download Neural Report</span>
                </button>
                
                <button 
                  className="cyber-button-secondary w-full"
                  onClick={resetInterview}
                >
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Start New Interview Simulation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Active Interview Panel */
        <div className="cyber-content-panel p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Video Feed and Question */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="cyber-section-title mb-4">
                  Neural Interview Simulation - {questionIndex + 1}/{questions.length}
                </h2>
                
                {/* Current Question Display */}
                <div className="cyber-question-display">
                  <div className="cyber-question-header">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-cyan-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Question {questionIndex + 1} of {questions.length}</span>
                    </div>
                    
                    {isResponding && (
                      <div className="cyber-response-timer">
                        <svg className="h-4 w-4 text-cyan-400 mr-1 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatDuration(responseTime)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="cyber-question-content">
                    {currentQuestion}
                  </div>
                </div>
              </div>
              
              {/* Video Feeds Grid */}
              <div className="mb-6">
                <div className="cyber-video-grid">
                  {/* Main Video */}
                  <div className="cyber-video-container">
                    <video 
                      ref={videoRef}
                      autoPlay 
                      muted 
                      playsInline
                      className="cyber-video-feed"
                    />
                    
                    {/* Overlay UI */}
                    <div className="cyber-video-overlay">
                      <div className="cyber-video-status-indicator">
                        {isResponding ? (
                          <div className="cyber-status-recording">
                            <div className="cyber-recording-dot"></div>
                            <span>Recording</span>
                          </div>
                        ) : (
                          <div className="cyber-status-ready">
                            <div className="cyber-ready-dot"></div>
                            <span>Ready</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Metrics Displays */}
                      {isResponding && (
                        <div className="cyber-metrics-display">
                          <div className="cyber-metric">
                            <span className="cyber-metric-name">Eye Contact</span>
                            <div className="cyber-metric-bar">
                              <div 
                                className={`cyber-metric-fill ${
                                  posture.eyeContact > 80 ? 'bg-green-500' : 
                                  posture.eyeContact > 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${posture.eyeContact}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="cyber-metric">
                            <span className="cyber-metric-name">Posture</span>
                            <div className="cyber-metric-bar">
                              <div 
                                className={`cyber-metric-fill ${
                                  posture.posture > 80 ? 'bg-green-500' : 
                                  posture.posture > 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${posture.posture}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="cyber-metric">
                            <span className="cyber-metric-name">Voice Clarity</span>
                            <div className="cyber-metric-bar">
                              <div 
                                className={`cyber-metric-fill ${
                                  voice.clarity > 80 ? 'bg-green-500' : 
                                  voice.clarity > 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${voice.clarity}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Hidden canvas for image processing */}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                </div>
              </div>
              
              {/* Response Input / Feedback Display */}
              <div>
                {feedback ? (
                  /* Feedback View */
                  <div className="cyber-feedback-container">
                    <h3 className="cyber-section-subtitle mb-4">Neural Analysis Results</h3>
                    
                    {/* Feedback Tabs */}
                    <div className="cyber-feedback-tabs mb-4">
                      <button 
                        className={`cyber-feedback-tab ${activeFeedbackTab === 'content' ? 'cyber-feedback-tab-active' : ''}`}
                        onClick={() => setActiveFeedbackTab('content')}
                      >
                        <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Content Analysis</span>
                      </button>
                      
                      <button 
                        className={`cyber-feedback-tab ${activeFeedbackTab === 'posture' ? 'cyber-feedback-tab-active' : ''}`}
                        onClick={() => setActiveFeedbackTab('posture')}
                      >
                        <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Posture & Body Language</span>
                      </button>
                      
                      <button 
                        className={`cyber-feedback-tab ${activeFeedbackTab === 'voice' ? 'cyber-feedback-tab-active' : ''}`}
                        onClick={() => setActiveFeedbackTab('voice')}
                      >
                        <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <span>Voice Analysis</span>
                      </button>
                    </div>
                    
                    {/* Feedback Content */}
                    <div className="cyber-feedback-content">
                      {activeFeedbackTab === 'content' && (
                        <div className="cyber-content-feedback">
                          <div className="whitespace-pre-line">
                            {feedback}
                          </div>
                          
                          {/* Keyword Matches */}
                          {keywordMatches.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-cyan-400 mb-2">Key Terms Detected:</h4>
                              <div className="flex flex-wrap gap-2">
                                {keywordMatches.map((keyword, index) => (
                                  <span key={index} className="cyber-keyword-badge">
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {activeFeedbackTab === 'posture' && (
                        <div className="cyber-posture-feedback">
                          <div className="whitespace-pre-line">
                            {postureFeedback}
                          </div>
                        </div>
                      )}
                      
                      {activeFeedbackTab === 'voice' && (
                        <div className="cyber-voice-feedback">
                          <div className="whitespace-pre-line">
                            {voiceFeedback}
                          </div>
                          
                          {/* Filler Words Analysis */}
                          {Object.keys(fillerWordsUsed).length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-cyan-400 mb-2">Filler Words Frequency:</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {Object.entries(fillerWordsUsed).map(([word, count]) => (
                                  <div key={word} className="cyber-filler-word-item">
                                    <span className="cyber-filler-word">{word}</span>
                                    <span className="cyber-filler-count">{count}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Next Question Button */}
                    <div className="mt-6 flex justify-end">
                      <button 
                        className="cyber-button-next"
                        onClick={nextQuestion}
                      >
                        <span>
                          {questionIndex < questions.length - 1 
                            ? 'Proceed to Next Question' 
                            : 'Complete Interview'}
                        </span>
                        <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Response Input View */
                  <div className="cyber-response-container">
                    <h3 className="cyber-section-subtitle mb-4">Your Response</h3>
                    
                    {!isResponding ? (
                      /* Start Response Button */
                      <div className="flex flex-col items-center justify-center py-8">
                        <p className="text-gray-400 mb-4 text-center max-w-md">
                          When ready, click the button below to begin recording your response to this question.
                        </p>
                        <button 
                          className="cyber-button-record"
                          onClick={startResponse}
                        >
                          <div className="cyber-button-glow"></div>
                          <svg className="h-5 w-5 mr-2 relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                          <span className="relative z-10">Start Response</span>
                        </button>
                      </div>
                    ) : (
                      /* Active Response UI */
                      <div>
                        <div className="cyber-response-textarea-container">
                          <textarea
                            value={userResponse}
                            onChange={(e) => setUserResponse(e.target.value)}
                            className="cyber-response-textarea"
                            placeholder="Type your response here..."
                            rows={6}
                          />
                          <div className="cyber-scan-line"></div>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <button 
                            className="cyber-button-finish"
                            onClick={endResponse}
                          >
                            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Complete Response</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Column - Interview Info and Metrics */}
            <div>
              {/* Interview Configuration Summary */}
              <div className="cyber-interview-summary mb-6">
                <h3 className="cyber-section-subtitle mb-4">Interview Parameters</h3>
                
                <div className="cyber-summary-content">
                  <div className="cyber-summary-item">
                    <span className="cyber-summary-label">Type:</span>
                    <span className="cyber-summary-value">{interviewConfig.interviewType.charAt(0).toUpperCase() + interviewConfig.interviewType.slice(1)}</span>
                  </div>
                  
                  <div className="cyber-summary-item">
                    <span className="cyber-summary-label">Role:</span>
                    <span className="cyber-summary-value">
                      {interviewConfig.role === 'custom-role' 
                        ? customRole 
                        : getRoleName(interviewConfig.role)}
                    </span>
                  </div>
                  
                  <div className="cyber-summary-item">
                    <span className="cyber-summary-label">Level:</span>
                    <span className="cyber-summary-value">{interviewConfig.seniority.charAt(0).toUpperCase() + interviewConfig.seniority.slice(1)}</span>
                  </div>
                  
                  <div className="cyber-summary-item">
                    <span className="cyber-summary-label">Focus:</span>
                    <div className="cyber-summary-value">
                      <div className="flex flex-wrap gap-1">
                        {interviewConfig.focus.map(focusId => {
                          const focusItem = focusAreas[interviewConfig.interviewType].find(f => f.id === focusId);
                          return focusItem ? (
                            <span key={focusId} className="cyber-focus-tag">
                              {focusItem.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="cyber-summary-item">
                    <span className="cyber-summary-label">Progress:</span>
                    <span className="cyber-summary-value">Question {questionIndex + 1} of {questions.length}</span>
                  </div>
                  
                  {sessionId && (
                    <div className="cyber-summary-item">
                      <span className="cyber-summary-label">Session ID:</span>
                      <span className="cyber-summary-value font-mono text-xs">{sessionId}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Neural Analysis Metrics */}
              {feedback && (
                <div className="cyber-metrics-panel mb-6">
                  <h3 className="cyber-section-subtitle mb-4">Neural Analysis Metrics</h3>
                  
                  <div className="space-y-4">
                    {/* Technical Score */}
                    <div className="cyber-metric-card">
                      <div className="cyber-metric-header">
                        <svg className="h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <span>Technical Content</span>
                        <span className="cyber-metric-score ml-auto">{technicalScore}%</span>
                      </div>
                      
                      <div className="cyber-metric-bar">
                        <div 
                          className={`cyber-metric-fill ${
                            technicalScore >= 80 ? 'bg-green-500' : 
                            technicalScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${technicalScore}%` }}
                        ></div>
                      </div>
                      
                      <div className="cyber-metric-assessment">
                        {technicalScore >= 80 
                          ? 'Excellent technical depth and accuracy'
                          : technicalScore >= 60
                          ? 'Good technical understanding with some areas to improve'
                          : 'Technical knowledge needs significant improvement'}
                      </div>
                    </div>
                    
                    {/* Communication Score */}
                    <div className="cyber-metric-card">
                      <div className="cyber-metric-header">
                        <svg className="h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Communication</span>
                        <span className="cyber-metric-score ml-auto">{communicationScore}%</span>
                      </div>
                      
                      <div className="cyber-metric-bar">
                        <div 
                          className={`cyber-metric-fill ${
                            communicationScore >= 80 ? 'bg-green-500' : 
                            communicationScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${communicationScore}%` }}
                        ></div>
                      </div>
                      
                      <div className="cyber-metric-assessment">
                        {communicationScore >= 80 
                          ? 'Excellent clarity and structured communication'
                          : communicationScore >= 60
                          ? 'Good communication with some areas to refine'
                          : 'Communication approach needs significant improvement'}
                      </div>
                    </div>
                    
                    {/* Confidence Score */}
                    <div className="cyber-metric-card">
                      <div className="cyber-metric-header">
                        <svg className="h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Confidence</span>
                        <span className="cyber-metric-score ml-auto">{Math.round(confidenceScore)}%</span>
                      </div>
                      
                      <div className="cyber-metric-bar">
                        <div 
                          className={`cyber-metric-fill ${
                            confidenceScore >= 80 ? 'bg-green-500' : 
                            confidenceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${confidenceScore}%` }}
                        ></div>
                      </div>
                      
                      <div className="cyber-metric-assessment">
                        {confidenceScore >= 80 
                          ? 'Excellent projection of confidence and authority'
                          : confidenceScore >= 60
                          ? 'Good confidence level with room for improvement'
                          : 'Focus on building confidence in delivery'}
                      </div>
                    </div>
                    
                    {/* Clarity Score */}
                    <div className="cyber-metric-card">
                      <div className="cyber-metric-header">
                        <svg className="h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <span>Voice Clarity</span>
                        <span className="cyber-metric-score ml-auto">{Math.round(clarityScore)}%</span>
                      </div>
                      
                      <div className="cyber-metric-bar">
                        <div 
                          className={`cyber-metric-fill ${
                            clarityScore >= 80 ? 'bg-green-500' : 
                            clarityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${clarityScore}%` }}
                        ></div>
                      </div>
                      
                      <div className="cyber-metric-assessment">
                        {clarityScore >= 80 
                          ? 'Excellent vocal clarity and articulation'
                          : clarityScore >= 60
                          ? 'Good vocal delivery with some areas to refine'
                          : 'Work on improving vocal clarity and articulation'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Interview Tips */}
              <div className="cyber-tips-panel">
                <h3 className="cyber-section-subtitle mb-4">Neural Interface Optimization Tips</h3>
                
                <ul className="cyber-tips-list">
                  <li className="cyber-tip-item">
                    <div className="cyber-tip-icon">
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span>Structure responses with a clear beginning, middle, and conclusion</span>
                  </li>
                  <li className="cyber-tip-item">
                    <div className="cyber-tip-icon">
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span>Use the STAR method (Situation, Task, Action, Result) for behavioral questions</span>
                  </li>
                  <li className="cyber-tip-item">
                    <div className="cyber-tip-icon">
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span>Maintain consistent eye contact with the camera</span>
                  </li>
                  <li className="cyber-tip-item">
                    <div className="cyber-tip-icon">
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span>When discussing technical topics, explain your thought process</span>
                  </li>
                  <li className="cyber-tip-item">
                    <div className="cyber-tip-icon">
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span>If unsure, clarify instead of guessing inaccurately</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Cyberpunk Styling */}
      <style jsx>{`
/* Cyber Grid */
.cyber-grid {
position: absolute;
inset: 0;
background-image: 
linear-gradient(to right, rgba(6, 182, 212, 0.05) 1px, transparent 1px),
linear-gradient(to bottom, rgba(6, 182, 212, 0.05) 1px, transparent 1px);
background-size: 50px 50px;
animation: grid-move 50s linear infinite;
}

@keyframes grid-move {
0% { background-position: 0 0; }
100% { background-position: 50px 50px; }
}

/* Content Panel */
.cyber-content-panel {
background: rgba(15, 23, 42, 0.7);
border: 1px solid rgba(6, 182, 212, 0.2);
border-radius: 0.5rem;
backdrop-filter: blur(10px);
box-shadow: 
0 4px 6px -1px rgba(0, 0, 0, 0.1),
0 2px 4px -1px rgba(0, 0, 0, 0.06),
0 0 0 1px rgba(6, 182, 212, 0.1) inset,
0 0 20px rgba(6, 182, 212, 0.1);
position: relative;
}

/* Section Titles */
.cyber-section-title {
font-size: 1.25rem;
font-weight: 600;
color: rgb(6, 182, 212);
letter-spacing: 0.025em;
}

.cyber-section-subtitle {
font-size: 1rem;
font-weight: 600;
color: rgb(6, 182, 212);
letter-spacing: 0.025em;
}

/* Form Controls */
.cyber-form-label {
display: block;
font-size: 0.875rem;
font-weight: 500;
color: rgb(6, 182, 212);
}

.cyber-input-container {
position: relative;
width: 100%;
}

.cyber-form-input {
width: 100%;
background: rgba(15, 23, 42, 0.6);
border: 1px solid rgba(6, 182, 212, 0.3);
border-radius: 0.375rem;
padding: 0.75rem 1rem;
color: rgba(226, 232, 240, 0.9);
font-size: 0.875rem;
transition: all 0.3s;
font-family: 'JetBrains Mono', monospace;
}

.cyber-form-input:focus {
outline: none;
border-color: rgba(6, 182, 212, 0.8);
box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.3);
}

.cyber-input-focus-bar {
position: absolute;
bottom: 0;
left: 50%;
transform: translateX(-50%) scaleX(0);
width: 100%;
height: 2px;
background: linear-gradient(90deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
transition: transform 0.3s;
transform-origin: center;
}

.cyber-form-input:focus + .cyber-input-focus-bar {
transform: translateX(-50%) scaleX(1);
}

/* Range slider */
.cyber-range-slider {
-webkit-appearance: none;
width: 100%;
height: 6px;
background: rgba(15, 23, 42, 0.8);
border-radius: 3px;
outline: none;
}

.cyber-range-slider::-webkit-slider-thumb {
-webkit-appearance: none;
appearance: none;
width: 18px;
height: 18px;
border-radius: 50%;
background: rgb(6, 182, 212);
cursor: pointer;
border: 2px solid rgba(15, 23, 42, 0.8);
box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
}

.cyber-range-slider::-moz-range-thumb {
width: 18px;
height: 18px;
border-radius: 50%;
background: rgb(6, 182, 212);
cursor: pointer;
border: 2px solid rgba(15, 23, 42, 0.8);
box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
}

/* Option groups */
.cyber-option {
display: flex;
align-items: center;
justify-content: center;
padding: 0.75rem;
background: rgba(15, 23, 42, 0.6);
border: 1px solid rgba(6, 182, 212, 0.2);
border-radius: 0.375rem;
color: rgba(226, 232, 240, 0.8);
font-size: 0.875rem;
font-weight: 500;
transition: all 0.3s;
cursor: pointer;
}

.cyber-option:hover {
background: rgba(15, 23, 42, 0.8);
border-color: rgba(6, 182, 212, 0.4);
transform: translateY(-2px);
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -1px rgba(0, 0, 0, 0.06),
  0 0 10px rgba(6, 182, 212, 0.2);
}

.cyber-option-active {
background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
border-color: rgba(6, 182, 212, 0.6);
color: rgb(6, 182, 212);
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -1px rgba(0, 0, 0, 0.06),
  0 0 10px rgba(6, 182, 212, 0.3);
}

/* Role options */
.cyber-roles-grid {
max-height: 300px;
overflow-y: auto;
scrollbar-width: thin;
scrollbar-color: rgba(6, 182, 212, 0.5) rgba(15, 23, 42, 0.3);
}

.cyber-roles-grid::-webkit-scrollbar {
width: 6px;
}

.cyber-roles-grid::-webkit-scrollbar-track {
background: rgba(15, 23, 42, 0.3);
border-radius: 3px;
}

.cyber-roles-grid::-webkit-scrollbar-thumb {
background-color: rgba(6, 182, 212, 0.5);
border-radius: 3px;
}

.cyber-role-option {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding: 1rem 0.5rem;
background: rgba(15, 23, 42, 0.6);
border: 1px solid rgba(6, 182, 212, 0.2);
border-radius: 0.375rem;
transition: all 0.3s;
cursor: pointer;
}

.cyber-role-option:hover {
background: rgba(15, 23, 42, 0.8);
border-color: rgba(6, 182, 212, 0.4);
transform: translateY(-2px);
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -1px rgba(0, 0, 0, 0.06),
  0 0 10px rgba(6, 182, 212, 0.2);
}

.cyber-role-active {
background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
border-color: rgba(6, 182, 212, 0.6);
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -1px rgba(0, 0, 0, 0.06),
  0 0 10px rgba(6, 182, 212, 0.3);
}

.cyber-role-icon {
width: 2.5rem;
height: 2.5rem;
display: flex;
align-items: center;
justify-content: center;
background: rgba(15, 23, 42, 0.8);
border-radius: 0.5rem;
margin-bottom: 0.75rem;
color: rgb(6, 182, 212);
transition: all 0.3s;
}

.cyber-role-option:hover .cyber-role-icon {
transform: scale(1.1);
color: rgb(6, 182, 212);
}

.cyber-role-active .cyber-role-icon {
background: linear-gradient(135deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
color: white;
}

.cyber-role-name {
font-size: 0.75rem;
font-weight: 500;
color: rgba(226, 232, 240, 0.9);
text-align: center;
transition: all 0.3s;
}

.cyber-role-active .cyber-role-name {
color: rgb(6, 182, 212);
}

/* Focus areas */
.cyber-focus-container {
max-height: 350px;
overflow-y: auto;
scrollbar-width: thin;
scrollbar-color: rgba(6, 182, 212, 0.5) rgba(15, 23, 42, 0.3);
}

.cyber-focus-container::-webkit-scrollbar {
width: 6px;
}

.cyber-focus-container::-webkit-scrollbar-track {
background: rgba(15, 23, 42, 0.3);
border-radius: 3px;
}

.cyber-focus-container::-webkit-scrollbar-thumb {
background-color: rgba(6, 182, 212, 0.5);
border-radius: 3px;
}

.cyber-focus-item {
display: flex;
align-items: center;
gap: 0.75rem;
padding: 0.75rem;
background: rgba(15, 23, 42, 0.6);
border: 1px solid rgba(6, 182, 212, 0.2);
border-radius: 0.375rem;
cursor: pointer;
transition: all 0.3s;
}

.cyber-focus-item:hover {
background: rgba(15, 23, 42, 0.8);
border-color: rgba(6, 182, 212, 0.4);
}

.cyber-focus-active {
background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
border-color: rgba(6, 182, 212, 0.6);
}

.cyber-focus-checkbox {
width: 1.25rem;
height: 1.25rem;
border: 1px solid rgba(6, 182, 212, 0.5);
border-radius: 0.25rem;
display: flex;
align-items: center;
justify-content: center;
background: rgba(15, 23, 42, 0.8);
color: rgb(6, 182, 212);
transition: all 0.3s;
flex-shrink: 0;
}

.cyber-focus-active .cyber-focus-checkbox {
background: linear-gradient(135deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
border-color: transparent;
color: white;
}

.cyber-focus-badge {
display: inline-block;
padding: 0.25rem 0.5rem;
background: rgba(6, 182, 212, 0.1);
border: 1px solid rgba(6, 182, 212, 0.3);
border-radius: 0.25rem;
font-size: 0.75rem;
color: rgb(6, 182, 212);
}

.cyber-focus-tag {
display: inline-block;
padding: 0.125rem 0.375rem;
background: rgba(6, 182, 212, 0.1);
border: 1px solid rgba(6, 182, 212, 0.3);
border-radius: 0.25rem;
font-size: 0.675rem;
color: rgb(6, 182, 212);
}

/* Summary Panel */
.cyber-summary-panel {
background: rgba(15, 23, 42, 0.4);
border: 1px solid rgba(6, 182, 212, 0.2);
border-radius: 0.375rem;
padding: 1rem;
}

.cyber-summary-item {
display: flex;
margin-bottom: 0.75rem;
}

.cyber-summary-label {
font-size: 0.75rem;
color: rgba(226, 232, 240, 0.7);
min-width: 5rem;
}

.cyber-summary-value {
font-size: 0.875rem;
color: rgba(226, 232, 240, 0.9);
flex: 1;
}

/* Buttons */
.cyber-button-start-interview {
display: inline-flex;
align-items: center;
justify-content: center;
padding: 0.75rem 1.5rem;
background: linear-gradient(90deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
border: none;
color: white;
font-weight: 500;
border-radius: 0.375rem;
position: relative;
overflow: hidden;
transition: all 0.3s;
}

.cyber-button-start-interview:disabled {
opacity: 0.6;
cursor: not-allowed;
}

.cyber-button-start-interview:not(:disabled):hover {
transform: translateY(-2px);
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
  0 4px 6px -2px rgba(0, 0, 0, 0.05),
  0 0 20px rgba(6, 182, 212, 0.3);
}

.cyber-button-glow {
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: radial-gradient(circle at center, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
opacity: 0;
transition: opacity 0.3s;
}

.cyber-button-start-interview:not(:disabled):hover .cyber-button-glow {
opacity: 0.3;
animation: button-pulse 2s infinite;
}

@keyframes button-pulse {
0% { transform: scale(0.95); opacity: 0.3; }
50% { transform: scale(1.05); opacity: 0.5; }
100% { transform: scale(0.95); opacity: 0.3; }
}

.cyber-button-record {
display: inline-flex;
align-items: center;
justify-content: center;
padding: 0.75rem 1.5rem;
background: linear-gradient(90deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
border: none;
color: white;
font-weight: 500;
border-radius: 0.375rem;
position: relative;
overflow: hidden;
transition: all 0.3s;
}

.cyber-button-record:hover {
transform: translateY(-2px);
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
  0 4px 6px -2px rgba(0, 0, 0, 0.05),
  0 0 20px rgba(6, 182, 212, 0.3);
}

.cyber-button-record:hover .cyber-button-glow {
opacity: 0.3;
animation: button-pulse 2s infinite;
}

.cyber-button-finish {
display: inline-flex;
align-items: center;
justify-content: center;
padding: 0.75rem 1.5rem;
background: linear-gradient(90deg, rgb(6, 182, 212) 0%, rgb(79, 70, 229) 100%);
border: none;
color: white;
font-weight: 500;
border-radius: 0.375rem;
transition: all 0.3s;
}

.cyber-button-finish:hover {
transform: translateY(-2px);
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
  0 4px 6px -2px rgba(0, 0, 0, 0.05),
  0 0 20px rgba(6, 182, 212, 0.3);
}

.cyber-button-next {
display: inline-flex;
align-items: center;
justify-content: center;
padding: 0.75rem 1.5rem;
background: linear-gradient(90deg, rgb(6, 182, 212) 0%, rgb(79, 70, 229) 100%);
border: none;
color: white;
font-weight: 500;
border-radius: 0.375rem;
transition: all 0.3s;
}

.cyber-button-next:hover {
transform: translateY(-2px);
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
  0 4px 6px -2px rgba(0, 0, 0, 0.05),
  0 0 20px rgba(6, 182, 212, 0.3);
}

.cyber-button-primary {
display: inline-flex;
align-items: center;
justify-content: center;
padding: 0.75rem 1.5rem;
background: linear-gradient(90deg, rgb(6, 182, 212) 0%, rgb(79, 70, 229) 100%);
border: none;
color: white;
font-weight: 500;
border-radius: 0.375rem;
transition: all 0.3s;
}

.cyber-button-primary:hover {
transform: translateY(-2px);
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
  0 4px 6px -2px rgba(0, 0, 0, 0.05),
  0 0 20px rgba(6, 182, 212, 0.3);
}

.cyber-button-secondary {
display: inline-flex;
align-items: center;
justify-content: center;
padding: 0.75rem 1.5rem;
background: rgba(15, 23, 42, 0.6);
border: 1px solid rgba(6, 182, 212, 0.3);
color: rgb(6, 182, 212);
font-weight: 500;
border-radius: 0.375rem;
transition: all 0.3s;
}

.cyber-button-secondary:hover {
background: rgba(15, 23, 42, 0.8);
border-color: rgba(6, 182, 212, 0.5);
transform: translateY(-2px);
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -1px rgba(0, 0, 0, 0.06),
  0 0 10px rgba(6, 182, 212, 0.2);
}

.cyber-button-danger {
display: inline-flex;
align-items: center;
justify-content: center;
padding: 0.75rem 1.5rem;
background: linear-gradient(90deg, #7f1d1d, #b91c1c);
border: none;
color: white;
font-weight: 500;
border-radius: 0.375rem;
position: relative;
overflow: hidden;
transition: all 0.3s;
}

.cyber-button-danger:hover {
background: linear-gradient(90deg, #b91c1c, #dc2626);
box-shadow: 0 0 15px rgba(220, 38, 38, 0.5);
transform: translateY(-1px);
}

/* Question display */
.cyber-question-display {
background: rgba(15, 23, 42, 0.4);
border: 1px solid rgba(6, 182, 212, 0.2);
border-radius: 0.375rem;
padding: 1rem;
position: relative;
}

.cyber-question-header {
display: flex;
align-items: center;
justify-content: space-between;
margin-bottom: 0.75rem;
padding-bottom: 0.5rem;
border-bottom: 1px solid rgba(6, 182, 212, 0.2);
font-size: 0.875rem;
color: rgb(6, 182, 212);
}

.cyber-response-timer {
display: flex;
align-items: center;
color: rgb(6, 182, 212);
font-family: 'JetBrains Mono', monospace;
}

.cyber-question-content {
font-size: 1rem;
color: rgba(226, 232, 240, 0.9);
line-height: 1.5;
}

/* Video Grid */
.cyber-video-grid {
position: relative;
height: 360px;
}

.cyber-video-container {
position: relative;
width: 100%;
height: 100%;
border-radius: 0.375rem;
overflow: hidden;
background: rgba(15, 23, 42, 0.6);
border: 1px solid rgba(6, 182, 212, 0.3);
}

.cyber-video-feed {
width: 100%;
height: 100%;
object-fit: cover;
}

.cyber-video-overlay {
position: absolute;
inset: 0;
display: flex;
flex-direction: column;
justify-content: space-between;
padding: 1rem;
pointer-events: none;
}

.cyber-video-status-indicator {
display: flex;
justify-content: flex-end;
}

.cyber-status-recording {
display: flex;
align-items: center;
background: rgba(220, 38, 38, 0.8);
padding: 0.25rem 0.75rem;
border-radius: 0.25rem;
color: white;
font-size: 0.75rem;
font-weight: 500;
}

.cyber-recording-dot {
width: 8px;
height: 8px;
border-radius: 50%;
background: white;
margin-right: 0.375rem;
animation: recording-blink 1.5s ease-in-out infinite;
}

@keyframes recording-blink {
0%, 100% { opacity: 1; }
50% { opacity: 0.3; }
}

.cyber-status-ready {
display: flex;
align-items: center;
background: rgba(16, 185, 129, 0.8);
padding: 0.25rem 0.75rem;
border-radius: 0.25rem;
color: white;
font-size: 0.75rem;
font-weight: 500;
}

.cyber-ready-dot {
width: 8px;
height: 8px;
border-radius: 50%;
background: white;
margin-right: 0.375rem;
}

.cyber-metrics-display {
display: flex;
flex-direction: column;
gap: 0.5rem;
}

.cyber-metric {
display: flex;
align-items: center;
gap: 0.5rem;
}

.cyber-metric-name {
font-size: 0.7rem;
color: rgba(226, 232, 240, 0.8);
width: 5rem;
flex-shrink: 0;
}

.cyber-metric-bar {
flex: 1;
height: 0.375rem;
background: rgba(15, 23, 42, 0.8);
border-radius: 0.25rem;
overflow: hidden;
}

.cyber-metric-fill {
height: 100%;
border-radius: 0.25rem;
width: 0;
transition: width 1s ease-in-out;
}

/* Response textarea */
.cyber-response-textarea-container {
position: relative;
overflow: hidden;
border-radius: 0.375rem;
border: 1px solid rgba(6, 182, 212, 0.3);
}

.cyber-response-textarea {
width: 100%;
background: rgba(15, 23, 42, 0.6);
color: rgba(226, 232, 240, 0.9);
padding: 1rem;
font-size: 0.875rem;
resize: none;
border: none;
font-family: inherit;
position: relative;
z-index: 1;
}

.cyber-response-textarea:focus {
outline: none;
}

.cyber-scan-line {
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 2px;
background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.8), transparent);
animation: scan-line 3s linear infinite;
opacity: 0.5;
z-index: 0;
}

@keyframes scan-line {
0% { top: 0; }
100% { top: 100%; }
}

/* Feedback section */
.cyber-feedback-tabs {
display: flex;
overflow-x: auto;
scrollbar-width: thin;
scrollbar-color: rgba(6, 182, 212, 0.5) rgba(15, 23, 42, 0.3);
gap: 0.5rem;
}

.cyber-feedback-tabs::-webkit-scrollbar {
height: 4px;
}

.cyber-feedback-tabs::-webkit-scrollbar-track {
background: rgba(15, 23, 42, 0.3);
border-radius: 2px;
}

.cyber-feedback-tabs::-webkit-scrollbar-thumb {
background-color: rgba(6, 182, 212, 0.5);
border-radius: 2px;
}

.cyber-feedback-tab {
display: flex;
align-items: center;
padding: 0.5rem 1rem;
background: rgba(15, 23, 42, 0.6);
border: 1px solid rgba(6, 182, 212, 0.2);
border-radius: 0.375rem;
color: rgba(226, 232, 240, 0.8);
font-size: 0.75rem;
font-weight: 500;
transition: all 0.3s;
white-space: nowrap;
}

.cyber-feedback-tab:hover {
background: rgba(15, 23, 42, 0.8);
border-color: rgba(6, 182, 212, 0.4);
}

.cyber-feedback-tab-active {
background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
border-color: rgba(6, 182, 212, 0.6);
color: rgb(6, 182, 212);
}

.cyber-feedback-content {
background: rgba(15, 23, 42, 0.4);
border: 1px solid rgba(6, 182, 212, 0.2);
border-radius: 0.375rem;
padding: 1rem;
max-height: 300px;
overflow-y: auto;
scrollbar-width: thin;
scrollbar-color: rgba(6, 182, 212, 0.5) rgba(15, 23, 42, 0.3);
font-size: 0.875rem;
color: rgba(226, 232, 240, 0.9);
line-height: 1.6;
}

.cyber-feedback-content::-webkit-scrollbar {
width: 6px;
}

.cyber-feedback-content::-webkit-scrollbar-track {
background: rgba(15, 23, 42, 0.3);
border-radius: 3px;
}

.cyber-feedback-content::-webkit-scrollbar-thumb {
background-color: rgba(6, 182, 212, 0.5);
border-radius: 3px;
}

.cyber-keyword-badge {
display: inline-block;
padding: 0.25rem 0.5rem;
background: rgba(6, 182, 212, 0.1);
border: 1px solid rgba(6, 182, 212, 0.3);
border-radius: 0.25rem;
font-size: 0.75rem;
color: rgb(6, 182, 212);
}

.cyber-filler-word-item {
display: flex;
align-items: center;
justify-content: space-between;
padding: 0.375rem 0.75rem;
background: rgba(15, 23, 42, 0.6);
border: 1px solid rgba(6, 182, 212, 0.2);
border-radius: 0.25rem;
}

.cyber-filler-word {
font-size: 0.75rem;
color: rgba(226, 232, 240, 0.9);
}

.cyber-filler-count {
font-size: 0.75rem;
font-weight: 500;
color: rgb(6, 182, 212);
background: rgba(6, 182, 212, 0.1);
padding: 0.125rem 0.375rem;
border-radius: 0.25rem;
}

/* Interview summary */
.cyber-interview-summary {
background: rgba(15, 23, 42, 0.4);
border: 1px solid rgba(6, 182, 212, 0.2);
border-radius: 0.375rem;
padding: 1rem;
}

.cyber-summary-content {
font-size: 0.875rem;
}

/* Metrics panel */
.cyber-metrics-panel {
background: rgba(15, 23, 42, 0.4);
border: 1px solid rgba(6, 182, 212, 0.2);
border-radius: 0.375rem;
padding: 1rem;
}

.cyber-metric-card {
background: rgba(15, 23, 42, 0.6);
border: 1px solid rgba(6, 182, 212, 0.2);
border-radius: 0.375rem;
padding: 0.75rem;
margin-bottom: 0.75rem;
}

.cyber-metric-header {
display: flex;
align-items: center;
gap: 0.5rem;
margin-bottom: 0.5rem;
font-size: 0.875rem;
color: rgb(6, 182, 212);
}

.cyber-metric-score {
font-family: 'JetBrains Mono', monospace;
font-weight: 500;
}

.cyber-metric-assessment {
font-size: 0.75rem;
color: rgba(226, 232, 240, 0.7);
margin-top: 0.5rem;
}

/* Tips panel */
.cyber-tips-panel {
background: rgba(15, 23, 42, 0.4);
border: 1px solid rgba(6, 182, 212, 0.2);
border-radius: 0.375rem;
padding: 1rem;
}

.cyber-tips-list {
list-style: none;
padding: 0;
margin: 0;
}

.cyber-tip-item {
display: flex;
align-items: flex-start;
gap: 0.5rem;
margin-bottom: 0.5rem;
font-size: 0.875rem;
color: rgba(226, 232, 240, 0.8);
}

.cyber-tip-icon {
display: flex;
align-items: center;
justify-content: center;
width: 1.25rem;
height: 1.25rem;
background: rgba(6, 182, 212, 0.1);
border-radius: 50%;
color: rgb(6, 182, 212);
flex-shrink: 0;
margin-top: 0.125rem;
}

/* System message */
.cyber-system-message {
font-family: 'JetBrains Mono', monospace;
}

.cyber-system-icon {
width: 12px;
height: 12px;
position: relative;
border: 1px solid rgba(6, 182, 212, 0.5);
border-radius: 50%;
}

.cyber-system-icon-dot {
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
width: 4px;
height: 4px;
background: rgb(6, 182, 212);
border-radius: 50%;
animation: pulse 2s infinite;
}

/* Loading animation */
.cyber-loading-container {
text-align: center;
}

.cyber-loading-spinner {
position: relative;
width: 4rem;
height: 4rem;
margin: 0 auto 1rem;
}

.cyber-spinner-ring {
position: absolute;
inset: 0;
border: 2px solid transparent;
border-radius: 50%;
}

.cyber-spinner-ring:nth-child(1) {
border-top-color: rgb(6, 182, 212);
animation: spin 1.5s linear infinite;
}

.cyber-spinner-ring:nth-child(2) {
border-right-color: rgb(79, 70, 229);
animation: spin 2s linear infinite;
}

.cyber-spinner-ring:nth-child(3) {
border-bottom-color: rgb(124, 58, 237);
animation: spin 2.5s linear infinite;
}

@keyframes spin {
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
}

.cyber-loading-text {
font-size: 0.875rem;
color: rgb(6, 182, 212);
font-family: 'JetBrains Mono', monospace;
}

/* Interview Results */
.cyber-score-summary {
background: rgba(15, 23, 42, 0.4);
border: 1px solid rgba(6, 182, 212, 0.2);
border-radius: 0.375rem;
padding: 1rem;
}

.cyber-score-card {
position: relative;
background: rgba(15, 23, 42, 0.6);
border: 1px solid rgba(6, 182, 212, 0.2);
border-radius: 0.375rem;
padding: 1rem;
overflow: hidden;
}

.cyber-score-header {
display: flex;
align-items: center;
gap: 0.5rem;
margin-bottom: 0.75rem;
font-size: 0.875rem;
color: rgb(6, 182, 212);
}

.cyber-score-meter {
width: 100%;
height: 0.5rem;
background: rgba(15, 23, 42, 0.8);
border-radius: 0.25rem;
overflow: hidden;
margin-bottom: 0.75rem;
}

.cyber-score-fill {
height: 100%;
border-radius: 0.25rem;
width: 0;
transition: width 1.5s ease-in-out;
}

.cyber-score-value {
display: flex;
align-items: baseline;
}

.cyber-overall-feedback {
background: rgba(15, 23, 42, 0.4);
border: 1px solid rgba(6, 182, 212, 0.2);
border-radius: 0.375rem;
padding: 1rem;
}

.cyber-overall-feedback-content {
font-size: 0.875rem;
color: rgba(226, 232, 240, 0.9);
line-height: 1.6;
}

.cyber-responses-summary {
background: rgba(15, 23, 42, 0.4);
border: 1px solid rgba(6, 182, 212, 0.2);
border-radius: 0.375rem;
padding: 1rem;
}

.cyber-response-item {
background: rgba(15, 23, 42, 0.6);
border: 1px solid rgba(6, 182, 212, 0.2);
border-radius: 0.375rem;
padding: 0.75rem;
margin-bottom: 0.75rem;
}

.cyber-response-question {
display: flex;
gap: 0.75rem;
margin-bottom: 0.5rem;
}

.cyber-response-number {
display: flex;
align-items: center;
justify-content: center;
width: 1.75rem;
height: 1.75rem;
background: rgba(6, 182, 212, 0.2);
color: rgb(6, 182, 212);
border-radius: 50%;
font-size: 0.75rem;
font-weight: 500;
flex-shrink: 0;
}

.cyber-response-text {
font-size: 0.875rem;
color: rgba(226, 232, 240, 0.9);
flex: 1;
}

.cyber-response-metrics {
display: flex;
flex-direction: column;
gap: 0.5rem;
margin-top: 0.75rem;
}

.cyber-response-metric {
display: flex;
align-items: center;
gap: 0.5rem;
}

.cyber-metric-label {
font-size: 0.75rem;
color: rgba(226, 232, 240, 0.7);
width: 3.5rem;
flex-shrink: 0;
}

/* Improvement sections */
.cyber-improvement-category {
background: rgba(15, 23, 42, 0.6);
border: 1px solid rgba(6, 182, 212, 0.2);
border-radius: 0.375rem;
overflow: hidden;
}

.cyber-improvement-header {
display: flex;
align-items: center;
gap: 0.5rem;
padding: 0.75rem 1rem;
background: rgba(15, 23, 42, 0.8);
border-bottom: 1px solid rgba(6, 182, 212, 0.2);
}

.cyber-improvement-header h4 {
font-size: 0.875rem;
font-weight: 500;
color: rgb(6, 182, 212);
margin: 0;
}

.cyber-improvement-content {
padding: 0.75rem 1rem;
}

.cyber-improvement-list {
list-style: none;
padding: 0;
margin: 0;
}

.cyber-improvement-item {
display: flex;
align-items: flex-start;
gap: 0.5rem;
margin-bottom: 0.5rem;
font-size: 0.875rem;
color: rgba(226, 232, 240, 0.8);
}

.cyber-improvement-bullet {
width: 6px;
height: 6px;
border-radius: 50%;
background: rgb(6, 182, 212);
margin-top: 0.5rem;
flex-shrink: 0;
}

/* Animations */
@keyframes pulse {
0%, 100% { transform: scale(1); opacity: 1; }
50% { transform: scale(1.3); opacity: 0.7; }
}

@keyframes blink {
0%, 100% { opacity: 1; }
50% { opacity: 0; }
}

.cyber-blink {
animation: blink 1s step-end infinite;
}

.animate-pulse-slow {
animation: animate-pulse-slow 3s infinite;
}

@keyframes animate-pulse-slow {
0%, 100% { opacity: 0.2; }
50% { opacity: 0.3; }
}

.animation-delay-1000 {
animation-delay: 1s;
}
`}</style>
    </div>
  );
};

export default InterviewSimulator;