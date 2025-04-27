import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSocket } from '../../Features/useSocket.js';
import Editor from '@monaco-editor/react';
import Timer from './Timer.jsx';
import { runExampleCasesService } from '../../Services/CodeRun.service.js';
import Executing from '../Editor/Executing.jsx';
import ExampleCasesOutput from '../Editor/ExampleCasesOutput.jsx';
import ReactPlayer from 'react-player';
import { defaultCodes, enterFullScreen } from './helper.js';
import { toast } from 'react-hot-toast';
import peer from '../../Services/peer.js';

function Room() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const location = useLocation();
  const socket = useSocket();
  
  // Code editor state
  const [code, setCode] = useState(defaultCodes.cpp);
  const [language, setLanguage] = useState('cpp');
  const [theme, setTheme] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'vs-dark' : 'light');
  
  // Test cases state
  const [cases, setCases] = useState([
    { id: 1, input: '', output: '' },
    { id: 2, input: '', output: '' }
  ]);
  const [exampleCasesExecution, setExampleCasesExecution] = useState(null);
  const [executing, setExecuting] = useState(false);
  
  // Room and participants state
  const [remoteUser, setRemoteUser] = useState(null);
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [requestedUsers, setRequestedUsers] = useState([]);
  const [connectionReady, setConnectionReady] = useState(false);
  const [privilege, setPrivilege] = useState(false);
  
  // Video/audio state
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioOn, setAudioOn] = useState(true);
  const [isVideoOn, setVideoOn] = useState(true);
  
  // UI state
  const [layout, setLayout] = useState('default'); // 'default', 'codeOnly', 'videoOnly'
  const [copySuccess, setCopySuccess] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [networkQuality, setNetworkQuality] = useState(100); // 0-100
  const [systemStatus, setSystemStatus] = useState('optimal'); // 'optimal', 'degraded', 'unstable'
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showSystemMessage, setShowSystemMessage] = useState(false);
  const [systemMessage, setSystemMessage] = useState('');
  const [animatedBackground, setAnimatedBackground] = useState(true);
  
  // Refs
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const videoContainerRef = useRef(null);
  
  // Extra info from location state
  const extraInfo = location.state;

  useEffect(() => {
    const nonparsedUser = localStorage.getItem('user');
    const user = JSON.parse(nonparsedUser);
    
    if (extraInfo && extraInfo._id === user._id) {
      setPrivilege(true);
      displaySystemMessage('Host access granted. System initializing...');
    } else if (extraInfo) {
      enterFullScreen();
      setRemoteSocketId(extraInfo);
      setConnectionReady(true);
      displaySystemMessage('Interview environment secured. Connection established.');
    }
    
    // Simulate network quality fluctuations for visual effects
    const networkInterval = setInterval(() => {
      const randomQuality = Math.floor(85 + Math.random() * 15);
      setNetworkQuality(randomQuality);
      
      // Occasionally update system status
      if (Math.random() > 0.8) {
        const statuses = ['optimal', 'optimal', 'optimal', 'degraded', 'unstable'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        setSystemStatus(randomStatus);
      }
    }, 5000);
    
    return () => clearInterval(networkInterval);
  }, [extraInfo]);

  // Display system message
  const displaySystemMessage = (message) => {
    setSystemMessage(message);
    setShowSystemMessage(true);
    setTimeout(() => {
      setShowSystemMessage(false);
    }, 5000);
  };

  // Initialize webcam and microphone
  useEffect(() => {
    const setupStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setMyStream(stream);
        displaySystemMessage('Neural link established. Video feed online.');
      } catch (err) {
        console.error("Error accessing media devices:", err);
        toast.error("Could not access camera or microphone");
        displaySystemMessage('Neural link failed. Check hardware permissions.');
      }
    };
    setupStream();
    
    return () => {
      if (myStream) {
        const tracks = myStream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);
  
  // Track mouse movement
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

  // Set up socket event listeners
  useEffect(() => {
    // Join request handler
    const handleJoinRequest = ({ user, id, requser_id }) => {
      setRequestedUsers(prev => [...prev, { user, id, requser_id }]);
      displaySystemMessage(`Access request from user: ${user.username}`);
    };
    
    // Host leaving handler
    const handleHostLeft = () => {
      stopMediaTracks();
      exitFullscreen();
      toast.error('Host ended the call');
      displaySystemMessage('Connection terminated by host. Shutting down environment.');
      navigate('/join-interview');
    };
    
    // Interviewee leaving handler
    const handleIntervieweeLeft = ({ msg }) => {
      stopMediaTracks();
      toast.error(msg || "Interviewee left");
      displaySystemMessage('Remote connection lost. Participant disconnected.');
      setConnectionReady(false);
      setRemoteSocketId(null);
      setRemoteStream(null);
    };
    
    // Code synchronization handlers
    const handleCodeChange = ({ code }) => setCode(code);
    const handleLanguageChange = ({ language }) => {
      setLanguage(language);
      setCode(defaultCodes[language]);
      displaySystemMessage(`Compiler reconfigured: ${language.toUpperCase()} syntax active`);
    };
    const handleCasesChange = ({ cases }) => setCases(cases);
    const handleCodeRun = ({ exampleCasesExecution }) => setExampleCasesExecution(exampleCasesExecution);
    
    // WebRTC handlers
    const handleIncomingCall = async ({ from, offer }) => {
      const answer = await peer.getAnswer(offer);
      setRemoteSocketId(from);
      socket.emit('call:accepted', { to: from, answer });
      displaySystemMessage('Quantum handshake complete. Secure channel established.');
    };
    
    const handleCallAccepted = async ({ from, answer }) => {
      await peer.setLocalDescription(answer);
      sendStreams();
      displaySystemMessage('Remote system authenticated. Streaming encrypted data.');
    };
    
    const handleNegotiationIncoming = async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit('peer:nego:done', { to: from, ans });
    };
    
    const handleFinalNego = async ({ ans }) => {
      await peer.setLocalDescription(ans);
    };
    
    // Register all socket event listeners
    socket.on('user:requested_to_join', handleJoinRequest);
    socket.on('host:hasleft', handleHostLeft);
    socket.on('interviewee:hasleft', handleIntervieweeLeft);
    socket.on('change:code', handleCodeChange);
    socket.on('change:language', handleLanguageChange);
    socket.on('change:cases', handleCasesChange);
    socket.on('run:code', handleCodeRun);
    socket.on('incomming:call', handleIncomingCall);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('peer:nego:needed', handleNegotiationIncoming);
    socket.on('peer:nego:final', handleFinalNego);
    
    // Clean up event listeners
    return () => {
      socket.off('user:requested_to_join', handleJoinRequest);
      socket.off('host:hasleft', handleHostLeft);
      socket.off('interviewee:hasleft', handleIntervieweeLeft);
      socket.off('change:code', handleCodeChange);
      socket.off('change:language', handleLanguageChange);
      socket.off('change:cases', handleCasesChange);
      socket.off('run:code', handleCodeRun);
      socket.off('incomming:call', handleIncomingCall);
      socket.off('call:accepted', handleCallAccepted);
      socket.off('peer:nego:needed', handleNegotiationIncoming);
      socket.off('peer:nego:final', handleFinalNego);
    };
  }, [socket, navigate]);

  // Set up peer connection and tracks
  useEffect(() => {
    peer.peer.addEventListener('track', async ev => {
      const streams = ev.streams;
      setRemoteStream(streams[0]);
      displaySystemMessage('Remote data stream connected. Decrypting feed...');
    });
    
    return () => {
      peer.peer.removeEventListener('track', () => {});
    };
  }, []);
  
  // Handle negotiation needed events
  useEffect(() => {
    const handleNegotiation = async () => {
      const offer = await peer.getOffer();
      socket.emit('peer:nego:needed', { offer, to: remoteSocketId });
    };
    
    peer.peer.addEventListener('negotiationneeded', handleNegotiation);
    return () => {
      peer.peer.removeEventListener('negotiationneeded', handleNegotiation);
    };
  }, [socket, remoteSocketId]);
  
  // Handle fullscreen and visibility change
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !privilege) {
        toast.error("Tried to exit Fullscreen");
        displaySystemMessage('WARNING: Integrity violation. Full-screen mode enforced.');
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !privilege) {
        toast.error("Tab switching detected");
        displaySystemMessage('ALERT: Security breach attempt. External navigation restricted.');
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [privilege]);

  // Helper functions
  const stopMediaTracks = () => {
    if (myStream) {
      const tracks = myStream.getTracks();
      tracks.forEach(track => track.stop());
      setMyStream(null);
    }
  };
  
  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.error("Error exiting fullscreen:", err);
      });
    }
  };
  
  const acceptRequest = (index) => {
    const setupStreamAndCall = async () => {
      const offer = await peer.getOffer();
      socket.emit("user:call", { remoteSocketId, offer });
      displaySystemMessage('Quantum handshake initiated. Establishing encrypted link...');
    };
    
    setupStreamAndCall();
    setConnectionReady(true);
    setRemoteUser(requestedUsers[index].user);
    setRemoteSocketId(requestedUsers[index].id);
    setRequestedUsers([]);
    socket.emit('host:req_accepted', {
      ta: socket.id,
      user: requestedUsers[index].user,
      room: roomId,
      id: requestedUsers[index].id,
      requser_id: requestedUsers[index].requser_id
    });
    displaySystemMessage(`Access granted to user: ${requestedUsers[index].user.username}`);
  };
  
  const sendStreams = () => {
    if (myStream) {
      const tracks = myStream.getTracks();
      tracks.forEach(track => {
        peer.peer.addTrack(track, myStream);
      });
      displaySystemMessage('Neural link active. Broadcasting encrypted stream.');
    }
  };
  
  const toggleAudio = () => {
    if (myStream) {
      const audioTrack = myStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioOn(audioTrack.enabled);
        displaySystemMessage(audioTrack.enabled ? 'Audio transmission enabled' : 'Audio transmission muted');
      }
    }
  };
  
  const toggleVideo = () => {
    if (myStream) {
      const videoTrack = myStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoOn(videoTrack.enabled);
        displaySystemMessage(videoTrack.enabled ? 'Visual feed activated' : 'Visual feed suspended');
      }
    }
  };
  
  const handleLanguageChange = async (newLanguage) => {
    setLanguage(newLanguage);
    setCode(defaultCodes[newLanguage]);
    socket.emit('language:change', { remoteSocketId, language: newLanguage });
    displaySystemMessage(`Compiler reconfigured: ${newLanguage.toUpperCase()} syntax active`);
  };
  
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    displaySystemMessage(`Interface mode changed: ${newTheme.includes('dark') ? 'Night vision' : 'Daylight'} mode`);
  };
  
  const handleInputChange = (index, field, value) => {
    if (!privilege) return;
    
    const newCases = [...cases];
    newCases[index][field] = value;
    setCases(newCases);
    socket.emit('cases:change', { remoteSocketId, cases: newCases });
  };
  
  const clickRun = async () => {
    setExampleCasesExecution(null);
    setExecuting(true);
    displaySystemMessage('Quantum processing engaged. Code compilation in progress...');
    
    const response = await runExampleCasesService(language, code, cases);
    if (response) {
      setExampleCasesExecution(response);
      
      if (!privilege) {
        socket.emit('code:run', { remoteSocketId, exampleCasesExecution: response });
      }
    }
    
    setExecuting(false);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(roomId)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        displaySystemMessage('Room ID copied to clipboard. Ready for distribution.');
      })
      .catch(() => {
        setCopySuccess(false);
        toast.error("Failed to copy room ID");
        displaySystemMessage('Clipboard operation failed. Security restrictions may apply.');
      });
  };
  
  const exitRoom = ({ msg } = {}) => {
    stopMediaTracks();
    
    if (privilege) {
      socket.emit('host:leave', { remoteSocketId, room: roomId });
      displaySystemMessage('Terminating session. Shutting down all connections...');
      navigate('/host-interview');
    } else {
      if (!msg) msg = "Interviewee left";
      socket.emit('interviewee:leave', { remoteSocketId, room: roomId, msg });
      exitFullscreen();
      displaySystemMessage('Disconnecting from neural network. Closing secure channel...');
      navigate('/join-interview');
    }
  };
  
  const changeCode = (newCode) => {
    setCode(newCode);
    socket.emit('code:change', { remoteSocketId, code: newCode });
  };

  // UI components
  const renderStatusIndicator = () => (
    <div className="cyber-status-bar flex items-center space-x-3 bg-gray-900/60 rounded-lg px-3 py-1.5 backdrop-blur-sm">
      <div className="flex items-center space-x-2">
        <div className="text-xs font-medium text-gray-400">STATUS:</div>
        <div className={`flex items-center ${
          systemStatus === 'optimal' ? 'text-green-400' : 
          systemStatus === 'degraded' ? 'text-yellow-400' : 'text-red-400'
        }`}>
          <div className={`h-2 w-2 rounded-full ${
            systemStatus === 'optimal' ? 'bg-green-400 animate-pulse' : 
            systemStatus === 'degraded' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400 animate-pulse'
          } mr-1.5`}></div>
          <span className="text-xs font-medium uppercase">
            {systemStatus === 'optimal' ? 'SECURE' : systemStatus === 'degraded' ? 'DEGRADED' : 'UNSTABLE'}
          </span>
        </div>
      </div>
      
      <div className="w-px h-4 bg-gray-700"></div>
      
      <div className="flex items-center space-x-2">
        <div className="text-xs font-medium text-gray-400">SIGNAL:</div>
        <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              networkQuality > 80 ? 'bg-green-500' : 
              networkQuality > 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${networkQuality}%` }}
          ></div>
        </div>
      </div>
      
      <div className="w-px h-4 bg-gray-700"></div>
      
      <div className="flex items-center space-x-2">
        <div className="text-xs font-medium text-gray-400">ROOM:</div>
        <div className="text-xs font-mono text-blue-400">{roomId}</div>
        <button 
          onClick={handleCopy}
          className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
        >
          {copySuccess ? (
            <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
              <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
  
  const renderSystemMessage = () => (
    <div className={`cyber-system-message fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
      showSystemMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <div className="bg-gray-900/80 backdrop-blur-sm text-cyan-400 border border-cyan-700 rounded-lg px-4 py-2 shadow-lg">
        <div className="flex items-center">
          <div className="cyber-system-icon mr-2">
            <div className="cyber-system-icon-dot"></div>
          </div>
          <div className="cyber-system-text font-mono text-sm">
            {systemMessage}
          </div>
        </div>
      </div>
    </div>
  );

  const renderVideoSection = () => (
    <div ref={videoContainerRef} className={`cyber-panel h-full flex flex-col ${layout === 'videoOnly' ? 'col-span-3' : ''}`}>
      <div className="cyber-panel-header flex items-center justify-between mb-3">
        <div className="cyber-panel-title flex items-center space-x-2">
          <svg className="w-5 h-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="font-medium text-white tracking-wide">Neural Link</span>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setLayout(layout === 'videoOnly' ? 'default' : 'videoOnly')}
            className="cyber-button-sm"
            title={layout === 'videoOnly' ? "Normal view" : "Expand video"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={layout === 'videoOnly' ? "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" : "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"} />
            </svg>
          </button>
        </div>
      </div>
      
      <div className={`flex-grow grid ${layout === 'videoOnly' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
        {/* Remote participant */}
        <div className="cyber-video-container relative">
          <div className="absolute top-3 left-3 z-10">
            <div className="cyber-badge">
              <span>{remoteUser?.fullname || 'Remote User'}</span>
            </div>
          </div>
          
          <div className="cyber-video-frame">
            {remoteStream ? (
              <video
                ref={videoRef => {
                  if (videoRef && remoteStream) {
                    videoRef.srcObject = remoteStream;
                    videoRef.muted = false;
                  }
                }}
                autoPlay
                playsInline
                className="cyber-video"
              />
            ) : (
              <div className="cyber-video-placeholder">
                <div className="cyber-video-placeholder-icon">
                  <svg className="h-12 w-12 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="mt-4 text-sm text-blue-300">
                  {connectionReady ? "Awaiting neural link..." : "Establishing connection..."}
                </div>
                <div className="cyber-loading-indicator">
                  <div className="cyber-loading-dot"></div>
                  <div className="cyber-loading-dot"></div>
                  <div className="cyber-loading-dot"></div>
                </div>
              </div>
            )}
            
            {/* Decorative elements */}
            <div className="cyber-corner cyber-corner-tl"></div>
            <div className="cyber-corner cyber-corner-tr"></div>
            <div className="cyber-corner cyber-corner-bl"></div>
            <div className="cyber-corner cyber-corner-br"></div>
            <div className="cyber-scan-line"></div>
          </div>
        </div>
        
        {/* Local participant */}
        <div className="cyber-video-container relative">
          <div className="absolute top-3 left-3 z-10">
            <div className="cyber-badge">
              <span>You</span>
            </div>
          </div>
          
          <div className="cyber-video-frame">
            {myStream && isVideoOn ? (
              <ReactPlayer
                playing={isVideoOn}
                muted={true}
                height="100%"
                width="100%"
                url={myStream}
                className="cyber-video"
              />
            ) : (
              <div className="cyber-video-placeholder">
                <div className="cyber-video-placeholder-icon">
                  <svg className="h-12 w-12 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <div className="mt-4 text-sm text-blue-300">
                  {isVideoOn ? "Neural link offline" : "Visual feed disabled"}
                </div>
              </div>
            )}
            
            {/* Decorative elements */}
            <div className="cyber-corner cyber-corner-tl"></div>
            <div className="cyber-corner cyber-corner-tr"></div>
            <div className="cyber-corner cyber-corner-bl"></div>
            <div className="cyber-corner cyber-corner-br"></div>
            <div className="cyber-scan-line"></div>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="cyber-controls mt-4 flex items-center justify-center space-x-4">
        <button 
          onClick={toggleAudio}
          className={`cyber-control-button ${isAudioOn ? '' : 'cyber-control-button-disabled'}`}
          title={isAudioOn ? "Mute audio" : "Unmute audio"}
        >
          <svg className={`h-5 w-5`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isAudioOn ? "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" : "M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"} />
          </svg>
        </button>
        
        <button 
          onClick={toggleVideo}
          className={`cyber-control-button ${isVideoOn ? '' : 'cyber-control-button-disabled'}`}
          title={isVideoOn ? "Disable video" : "Enable video"}
        >
          <svg className={`h-5 w-5`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isVideoOn ? "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" : "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"} />
          </svg>
        </button>
        
        <button 
          onClick={exitRoom}
          className="cyber-control-button-danger"
          title="End call"
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
          </svg>
        </button>
        
        <button 
          onClick={sendStreams}
          className="cyber-control-button-primary"
          title="Reconnect neural link"
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
          </svg>
        </button>
      </div>
    </div>
  );
  
  const renderCodeSection = () => (
    <div className={`cyber-panel h-full flex flex-col ${layout === 'codeOnly' ? 'col-span-3' : ''}`}>
      <div className="cyber-panel-header flex items-center justify-between mb-3">
        <div className="cyber-panel-title flex items-center space-x-2">
          <svg className="w-5 h-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span className="font-medium text-white tracking-wide">Quantum Compiler</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setLayout(layout === 'codeOnly' ? 'default' : 'codeOnly')}
            className="cyber-button-sm"
            title={layout === 'codeOnly' ? "Normal view" : "Expand editor"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={layout === 'codeOnly' ? "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" : "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"} />
            </svg>
          </button>
          
          <button
            onClick={clickRun}
            className="cyber-button-primary"
          >
            <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Execute
          </button>
          
          <div className="cyber-select-container">
            <select
              onChange={(e) => handleLanguageChange(e.target.value)}
              value={language}
              className="cyber-select"
            >
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
            </select>
            <div className="cyber-select-arrow"></div>
          </div>
          
          <div className="cyber-select-container">
            <select
              onChange={(e) => handleThemeChange(e.target.value)}
              value={theme}
              className="cyber-select"
            >
              <option value="light">Light</option>
              <option value="vs-dark">Dark</option>
              <option value="hc-black">High Contrast</option>
            </select>
            <div className="cyber-select-arrow"></div>
          </div>
        </div>
      </div>
      
      <div className="flex-grow cyber-editor-container">
        <Editor
          height="100%"
          width="100%"
          language={language}
          value={code}
          theme={theme}
          onChange={(e) => changeCode(e)}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: "on",
            padding: { top: 16, bottom: 16 },
            lineNumbers: 'on',
            roundedSelection: true,
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
          }}
          className="cyber-editor"
          onMount={(editor) => {
            editorRef.current = editor;
            displaySystemMessage('Editor initialized. Quantum compiler ready.');
          }}
        />
        
        {/* Code visualization particles */}
        {animatedBackground && (
          <div className="cyber-code-particles"></div>
        )}
        
        {/* Language badge */}
        <div className="cyber-language-badge">
          {language.toUpperCase()}
        </div>
      </div>
      
      {/* Results section */}
      <div className="cyber-results mt-4">
        {executing ? (
          <Executing text="Neural Processing" />
        ) : (
          <>
            {exampleCasesExecution ? (
              <ExampleCasesOutput exampleCasesExecution={exampleCasesExecution} />
            ) : (
              <div className="space-y-4">
                <h3 className="cyber-section-title flex items-center">
                  <svg className="mr-1.5 h-4 w-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Test Vector Parameters
                </h3>
                
                {cases.map((testCase, index) => (
                  <div key={testCase.id} className="cyber-test-case">
                    <div className="cyber-test-case-header">Test Vector {index + 1}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="cyber-label">Input Data Stream</label>
                        <textarea
                          value={testCase.input}
                          onChange={(e) => handleInputChange(index, 'input', e.target.value)}
                          className="cyber-textarea"
                          rows={3}
                          readOnly={!privilege}
                        />
                      </div>
                      <div>
                        <label className="cyber-label">Expected Output Matrix</label>
                        <textarea
                          value={testCase.output}
                          onChange={(e) => handleInputChange(index, 'output', e.target.value)}
                          className="cyber-textarea"
                          rows={3}
                          readOnly={!privilege}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
  
  const renderInfoSection = () => (
    <div className="cyber-panel h-full flex flex-col">
      <div className="cyber-panel-header flex items-center justify-between mb-3">
        <div className="cyber-panel-title flex items-center space-x-2">
          <svg className="w-5 h-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-white tracking-wide">System Data</span>
        </div>
      </div>
      
      {connectionReady ? (
        <>
          <div className="mb-4">
            <div className="cyber-info-section">
              <div className="cyber-info-section-title">Channel Status</div>
              <div className="cyber-info-item">
                <span className="cyber-info-label">Node ID:</span>
                <span className="cyber-info-value cyber-font-mono">{roomId}</span>
                <button 
                  onClick={handleCopy} 
                  className="cyber-copy-button"
                  title="Copy Room ID"
                >
                  {copySuccess ? (
                    <svg className="h-4 w-4 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                      <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <Timer previlige={privilege} remoteSocketId={remoteSocketId} />
          </div>
          
          <div className="cyber-info-section">
            <div className="cyber-info-section-title">Neural Interface Guidelines</div>
            <ul className="cyber-info-list">
              {privilege ? (
                <>
                  <li className="cyber-info-list-item">
                    <span className="cyber-info-list-icon">●</span>
                    Modify test vectors to evaluate cognitive processing
                  </li>
                  <li className="cyber-info-list-item">
                    <span className="cyber-info-list-icon">●</span>
                    Monitor quantum time metrics for efficiency analysis
                  </li>
                  <li className="cyber-info-list-item">
                    <span className="cyber-info-list-icon">●</span>
                    Probe subject response to algorithmic challenges
                  </li>
                </>
              ) : (
                <>
                  <li className="cyber-info-list-item">
                    <span className="cyber-info-list-icon">●</span>
                    Verbalize cognitive processes during problem solving
                  </li>
                  <li className="cyber-info-list-item">
                    <span className="cyber-info-list-icon">●</span>
                    Test algorithm with provided vector parameters
                  </li>
                  <li className="cyber-info-list-item">
                    <span className="cyber-info-list-icon">●</span>
                    Analyze computational complexity of your solution
                  </li>
                </>
              )}
            </ul>
          </div>
        </>
      ) : (
        // Room management (for host only)
        <>
          <div className="mb-4">
            <div className="cyber-system-alert">
              <div className="cyber-system-alert-icon">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <div className="cyber-system-alert-title">Secure Node Established</div>
                <div className="cyber-system-alert-message">Interview environment initialized: <span className="text-cyan-400 font-mono">{roomId}</span></div>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="cyber-info-section">
              <div className="cyber-info-section-title">Share Access Token</div>
              <div className="cyber-token-display">
                <div className="cyber-token-id font-mono text-center">{roomId}</div>
                <div className="cyber-token-scan-line"></div>
                <button 
                  onClick={handleCopy}
                  className="cyber-token-copy-button"
                >
                  {copySuccess ? 'Copied' : 'Copy Token'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-grow overflow-auto">
            <div className="cyber-info-section">
              <div className="cyber-info-section-title flex items-center">
                <svg className="mr-1.5 h-4 w-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Access Requests
              </div>
              
              {requestedUsers.length > 0 ? (
                <div className="space-y-3 mt-2">
                  {requestedUsers.map((user, index) => (
                    <div key={index} className="cyber-access-request">
                      <div className="cyber-access-request-user">
                        <div className="cyber-access-request-avatar">
                          {user.user.avatar ? (
                            <img 
                              src={user.user.avatar} 
                              alt={user.user.username}
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-blue-900 text-blue-200 text-xs">
                              {user.user.username.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="cyber-access-request-details">
                          <div className="cyber-access-request-name">{user.user.fullname}</div>
                          <div className="cyber-access-request-username">@{user.user.username}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => acceptRequest(index)}
                        className="cyber-access-grant-button"
                      >
                        Grant Access
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cyber-empty-state">
                  <div className="cyber-empty-icon">
                    <svg className="h-12 w-12 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="cyber-empty-title">Awaiting Connection</h3>
                  <p className="cyber-empty-message">Share access token with candidate to initialize neural link</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

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
      
      {/* System message alert */}
      {renderSystemMessage()}
      
      {/* Header */}
      <div className="mb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="h-8 w-8 text-cyan-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <h1 className="text-xl font-medium text-white">
              {privilege ? 'Neural Network Host Terminal' : 'Quantum Interview Environment'}
              <span className="cyber-blink">_</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {renderStatusIndicator()}
            
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="cyber-button-sm"
              title="System settings"
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            
            <button 
              onClick={exitRoom}
              className="cyber-button-danger"
            >
              <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Terminate
            </button>
          </div>
        </div>
        
        {/* Settings panel */}
        {showSettings && (
          <div className="mt-4 cyber-settings-panel">
            <h2 className="cyber-settings-title">System Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="cyber-settings-label">Interface Layout</label>
                <select
                  value={layout}
                  onChange={(e) => setLayout(e.target.value)}
                  className="cyber-settings-select"
                >
                  <option value="default">Standard Configuration</option>
                  <option value="codeOnly">Compiler Focus</option>
                  <option value="videoOnly">Neural Link Focus</option>
                </select>
              </div>
              
              <div>
                <label className="cyber-settings-label">Visual Theme</label>
                <select
                  value={theme}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  className="cyber-settings-select"
                >
                  <option value="vs-light">Daylight Mode</option>
                  <option value="vs-dark">Night Vision</option>
                  <option value="hc-black">High Contrast</option>
                </select>
              </div>
              
              <div>
                <label className="cyber-settings-label">Compiler Language</label>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="cyber-settings-select"
                >
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                </select>
              </div>
            </div>
            
            <div className="cyber-settings-toggle mt-4">
              <label className="cyber-toggle">
                <input
                  type="checkbox"
                  checked={animatedBackground}
                  onChange={() => setAnimatedBackground(!animatedBackground)}
                />
                <span className="cyber-toggle-slider"></span>
              </label>
              <span className="ml-2 text-sm font-medium text-cyan-300">
                Quantum Visualization Effects
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ height: 'calc(100vh - 120px)' }}>
        {layout === 'default' && (
          <>
            {renderVideoSection()}
            {renderCodeSection()}
            {renderInfoSection()}
          </>
        )}
        
        {layout === 'codeOnly' && (
          <>
            {renderCodeSection()}
          </>
        )}
        
        {layout === 'videoOnly' && (
          <>
            {renderVideoSection()}
          </>
        )}
      </div>
      
      {/* CSS styling for cyberpunk futuristic elements */}
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
        
        /* Cyber Panels */
        .cyber-panel {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          padding: 1rem;
          backdrop-filter: blur(10px);
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 0 0 1px rgba(6, 182, 212, 0.1) inset,
            0 0 20px rgba(6, 182, 212, 0.1);
          position: relative;
        }
        
        .cyber-panel-title {
          color: #e2e8f0;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
        }
        
        .cyber-panel-header {
          border-bottom: 1px solid rgba(6, 182, 212, 0.2);
          padding-bottom: 0.75rem;
        }
        
        /* Cyber UI Elements */
        .cyber-button-sm {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.375rem;
          background: rgba(17, 24, 39, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          color: rgb(6, 182, 212);
          transition: all 0.2s;
        }
        
        .cyber-button-sm:hover {
          background: rgba(17, 24, 39, 1);
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
        }
        
        .cyber-button-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          background: linear-gradient(90deg, #0369a1, #0891b2);
          border: none;
          color: white;
          font-weight: 500;
          border-radius: 0.375rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .cyber-button-primary:hover {
          background: linear-gradient(90deg, #0891b2, #0ea5e9);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
          transform: translateY(-1px);
        }
        
        .cyber-button-primary:before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: all 0.6s;
        }
        
        .cyber-button-primary:hover:before {
          left: 100%;
        }
        
        .cyber-button-danger {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
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
        
        /* Cyber Editor */
        .cyber-editor-container {
          position: relative;
          border-radius: 0.375rem;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(6, 182, 212, 0.2);
        }
        
        .cyber-editor {
          font-family: 'JetBrains Mono', monospace;
        }
        
        .cyber-language-badge {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          padding: 0.25rem 0.5rem;
          background: rgba(6, 182, 212, 0.2);
          border: 1px solid rgba(6, 182, 212, 0.4);
          border-radius: 0.25rem;
          color: rgb(6, 182, 212);
          font-size: 0.7rem;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.05em;
          z-index: 10;
        }
        
        .cyber-code-particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          opacity: 0.2;
          z-index: 5;
        }
        
        .cyber-code-particles:before {
          content: '01010111010101110101011101';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          font-family: monospace;
          color: rgb(6, 182, 212);
          white-space: nowrap;
          font-size: 12px;
          animation: code-rain 20s linear infinite;
        }
        
        .cyber-code-particles:after {
          content: '10101000101010001010100010';
          position: absolute;
          top: 0;
          left: 30%;
          transform: translateX(-50%);
          font-family: monospace;
          color: rgb(6, 182, 212);
          white-space: nowrap;
          font-size: 12px;
          animation: code-rain 15s linear infinite;
          animation-delay: 2s;
        }
        
        @keyframes code-rain {
          0% { top: -100px; }
          100% { top: 100%; }
        }
        
        /* Cyber Selects */
        .cyber-select-container {
          position: relative;
        }
        
        .cyber-select {
          appearance: none;
          background: rgba(17, 24, 39, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          color: rgb(6, 182, 212);
          padding: 0.5rem 2rem 0.5rem 0.75rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          transition: all 0.2s;
        }
        
        .cyber-select:hover, .cyber-select:focus {
          background: rgba(17, 24, 39, 1);
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
        }
        
        .cyber-select-arrow {
          position: absolute;
          top: 50%;
          right: 0.75rem;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 4px solid rgb(6, 182, 212);
          pointer-events: none;
        }
        
        /* Cyber Video */
        .cyber-video-container {
          position: relative;
          height: 100%;
        }
        
        .cyber-video-frame {
          position: relative;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .cyber-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 0.375rem;
        }
        
        .cyber-video-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: rgb(6, 182, 212);
        }
        
        .cyber-video-placeholder-icon {
          margin-bottom: 1rem;
          animation: pulse 2s infinite;
        }
        
        .cyber-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.25rem;
          color: rgb(6, 182, 212);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        
        /* Cyber corners */
        .cyber-corner {
          position: absolute;
          width: 12px;
          height: 12px;
          z-index: 1;
        }
        
        .cyber-corner-tl {
          top: 0;
          left: 0;
          border-top: 2px solid rgb(6, 182, 212);
          border-left: 2px solid rgb(6, 182, 212);
        }
        
        .cyber-corner-tr {
          top: 0;
          right: 0;
          border-top: 2px solid rgb(6, 182, 212);
          border-right: 2px solid rgb(6, 182, 212);
        }
        
        .cyber-corner-bl {
          bottom: 0;
          left: 0;
          border-bottom: 2px solid rgb(6, 182, 212);
          border-left: 2px solid rgb(6, 182, 212);
        }
        
        .cyber-corner-br {
          bottom: 0;
          right: 0;
          border-bottom: 2px solid rgb(6, 182, 212);
          border-right: 2px solid rgb(6, 182, 212);
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
        }
        
        @keyframes scan-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
        
        /* Control buttons */
        .cyber-control-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: rgba(17, 24, 39, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 50%;
          color: rgb(6, 182, 212);
          transition: all 0.2s;
        }
        
        .cyber-control-button:hover {
          background: rgba(17, 24, 39, 1);
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 12px rgba(6, 182, 212, 0.5);
          transform: translateY(-2px);
        }
        
        .cyber-control-button-disabled {
          color: rgba(6, 182, 212, 0.5);
          border-color: rgba(6, 182, 212, 0.2);
          background: rgba(17, 24, 39, 0.6);
        }
        
        .cyber-control-button-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: linear-gradient(135deg, #0369a1, #0891b2);
          border: none;
          border-radius: 50%;
          color: white;
          transition: all 0.2s;
        }
        
        .cyber-control-button-primary:hover {
          background: linear-gradient(135deg, #0891b2, #0ea5e9);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.6);
          transform: translateY(-2px);
        }
        
        .cyber-control-button-danger {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: linear-gradient(135deg, #7f1d1d, #b91c1c);
          border: none;
          border-radius: 50%;
          color: white;
          transition: all 0.2s;
        }
        
        .cyber-control-button-danger:hover {
          background: linear-gradient(135deg, #b91c1c, #dc2626);
          box-shadow: 0 0 15px rgba(220, 38, 38, 0.6);
          transform: translateY(-2px);
        }
        
        /* Cyber status bar */
        .cyber-status-bar {
          font-family: 'JetBrains Mono', monospace;
        }
        
        /* Cyber system message */
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
        
        /* Test cases */
        .cyber-section-title {
          font-size: 0.9rem;
          font-weight: 500;
          color: rgb(6, 182, 212);
          margin-bottom: 0.75rem;
        }
        
        .cyber-test-case {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          padding: 1rem;
          margin-bottom: 1rem;
        }
        
        .cyber-test-case-header {
          color: rgb(6, 182, 212);
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 0.75rem;
          font-family: 'JetBrains Mono', monospace;
        }
        
        .cyber-label {
          display: block;
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
          margin-bottom: 0.5rem;
        }
        
        .cyber-textarea {
          width: 100%;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.25rem;
          color: rgb(226, 232, 240);
          padding: 0.5rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          resize: none;
          transition: all 0.2s;
        }
        
        .cyber-textarea:focus {
          outline: none;
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.3);
        }
        
        /* Info sections */
        .cyber-info-section {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          padding: 1rem;
          margin-bottom: 1rem;
        }
        
        .cyber-info-section-title {
          color: rgb(6, 182, 212);
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 0.75rem;
        }
        
        .cyber-info-item {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .cyber-info-label {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
          margin-right: 0.5rem;
        }
        
        .cyber-info-value {
          font-size: 0.85rem;
          color: rgb(226, 232, 240);
        }
        
        .cyber-font-mono {
          font-family: 'JetBrains Mono', monospace;
        }
        
        .cyber-copy-button {
          margin-left: 0.5rem;
          color: rgba(6, 182, 212, 0.7);
          transition: color 0.2s;
        }
        
        .cyber-copy-button:hover {
          color: rgb(6, 182, 212);
        }
        
        .cyber-info-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .cyber-info-list-item {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
          color: rgb(226, 232, 240);
        }
        
        .cyber-info-list-icon {
          color: rgb(6, 182, 212);
          margin-right: 0.5rem;
          font-size: 0.7rem;
        }
        
        /* System alert */
        .cyber-system-alert {
          display: flex;
          align-items: center;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          padding: 0.75rem;
        }
        
        .cyber-system-alert-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .cyber-system-alert-title {
          font-size: 0.85rem;
          font-weight: 500;
          color: rgb(6, 182, 212);
          margin-bottom: 0.25rem;
        }
        
        .cyber-system-alert-message {
          font-size: 0.8rem;
          color: rgba(226, 232, 240, 0.8);
        }
        
        /* Room token */
        .cyber-token-display {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          padding: 1rem;
          position: relative;
          overflow: hidden;
        }
        
        .cyber-token-id {
          font-size: 1.5rem;
          color: rgb(6, 182, 212);
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
        }
        
        .cyber-token-scan-line {
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.8), transparent);
          animation: token-scan 2s linear infinite;
        }
        
        @keyframes token-scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        
        .cyber-token-copy-button {
          padding: 0.5rem 1rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.4);
          border-radius: 0.25rem;
          color: rgb(6, 182, 212);
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s;
          text-align: center;
          width: 100%;
          margin-top: 0.5rem;
        }
        
        .cyber-token-copy-button:hover {
          background: rgba(15, 23, 42, 1);
          border-color: rgba(6, 182, 212, 0.6);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.4);
        }
        
        /* Access requests */
        .cyber-access-request {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          padding: 0.75rem;
        }
        
        .cyber-access-request-user {
          display: flex;
          align-items: center;
        }
        
        .cyber-access-request-avatar {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.3);
          margin-right: 0.75rem;
        }
        
        .cyber-access-request-details {
          display: flex;
          flex-direction: column;
        }
        
        .cyber-access-request-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: rgb(226, 232, 240);
        }
        
        .cyber-access-request-username {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
        }
        
        .cyber-access-grant-button {
          padding: 0.5rem 0.75rem;
          background: linear-gradient(135deg, #065f46, #10b981);
          border: none;
          border-radius: 0.25rem;
          color: white;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .cyber-access-grant-button:hover {
          background: linear-gradient(135deg, #10b981, #34d399);
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
          transform: translateY(-1px);
        }
        
        /* Empty state */
        .cyber-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          text-align: center;
        }
        
        .cyber-empty-icon {
          margin-bottom: 1rem;
          position: relative;
        }
        
        .cyber-empty-icon:after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%);
          animation: pulse 2s infinite;
        }
        
        .cyber-empty-title {
          font-size: 0.9rem;
          font-weight: 500;
          color: rgb(6, 182, 212);
          margin-bottom: 0.5rem;
        }
        
        .cyber-empty-message {
          font-size: 0.8rem;
          color: rgba(226, 232, 240, 0.7);
          max-width: 16rem;
        }
        
        /* Loading indicator */
        .cyber-loading-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1rem;
        }
        
        .cyber-loading-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgb(6, 182, 212);
          margin: 0 0.25rem;
          animation: dot-pulse 1.5s infinite;
        }
        
        .cyber-loading-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .cyber-loading-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes dot-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        
        /* Settings panel */
        .cyber-settings-panel {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.375rem;
          padding: 1rem;
          backdrop-filter: blur(10px);
        }
        
        .cyber-settings-title {
          color: rgb(6, 182, 212);
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }
        
        .cyber-settings-label {
          display: block;
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.7);
          margin-bottom: 0.5rem;
        }
        
        .cyber-settings-select {
          width: 100%;
          background: rgba(17, 24, 39, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.25rem;
          color: rgb(226, 232, 240);
          padding: 0.5rem;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        
        .cyber-settings-select:focus {
          outline: none;
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.3);
        }
        
        /* Toggle switch */
        .cyber-settings-toggle {
          display: flex;
          align-items: center;
        }
        
        .cyber-toggle {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 22px;
        }
        
        .cyber-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .cyber-toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.3);
  transition: .4s;
  border-radius: 34px;
}

.cyber-toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 2px;
  background-color: rgba(255, 255, 255, 0.9);
  transition: .4s;
  border-radius: 50%;
}

.cyber-toggle input:checked + .cyber-toggle-slider {
  background-color: rgba(6, 182, 212, 0.3);
}

.cyber-toggle input:checked + .cyber-toggle-slider:before {
  transform: translateX(18px);
  background-color: rgb(6, 182, 212);
}

/* Animation keyframes */
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.cyber-blink {
  animation: blink 1s step-end infinite;
}

/* Additional animations */
@keyframes token-scan {
  0% { top: 0; }
  100% { top: 100%; }
}

@keyframes animate-pulse-slow {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.3; }
}
      `}</style>
    </div>
  );
}

export default Room;