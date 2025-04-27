import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSocket } from '../../Features/useSocket.js';
import ReactPlayer from 'react-player';
import { enterFullScreen } from '../InterviewRooms/helper.js';
import { toast } from 'react-hot-toast';
import peer from '../../Services/peer.js';
import axios from 'axios';
import { FIXED_MENTOR_ID, FIXED_MENTEE_ID } from './MentorshipUtils.js';

// API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

function MentorshipMeeting() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const location = useLocation();
  const socket = useSocket();
  
  // Video/audio state
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioOn, setAudioOn] = useState(true);
  const [isVideoOn, setVideoOn] = useState(true);
  
  // Room and participants state
  const [remoteUser, setRemoteUser] = useState(null);
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [connectionReady, setConnectionReady] = useState(false);
  const [isHost, setIsHost] = useState(false);
  
  // UI state
  const [networkQuality, setNetworkQuality] = useState(100);
  const [systemStatus, setSystemStatus] = useState('optimal');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showSystemMessage, setShowSystemMessage] = useState(false);
  const [systemMessage, setSystemMessage] = useState('');
  const [sessionDetails, setSessionDetails] = useState(null);
  const [peerConnectionStatus, setPeerConnectionStatus] = useState('Not connected');
  
  // Refs
  const containerRef = useRef(null);
  const videoContainerRef = useRef(null);
  
  // Get session info from location state
  const sessionInfo = location.state?.sessionInfo;

  // Reset peer connection when component loads/unloads
  // useEffect(() => {
  //   // Reset peer connection when new session starts
  //   if (peer && peer.peer) {
  //     peer.resetConnection();
  //   }
    
  //   // Clean up function to close peer connection when component unmounts
  //   return () => {
  //     if (peer && peer.peer) {
  //       peer.peer.close();
  //     }
  //   };
  // }, []);

  // Monitor peer connection status changes
  const monitorPeerConnection = () => {
    if (!peer || !peer.peer) return;
    
    peer.peer.oniceconnectionstatechange = () => {
      console.log("ICE Connection State:", peer.peer.iceConnectionState);
      setPeerConnectionStatus(peer.peer.iceConnectionState);
      
      // Show status message to user
      if (peer.peer.iceConnectionState === 'connected') {
        displaySystemMessage('Connection established successfully!');
      } else if (peer.peer.iceConnectionState === 'disconnected') {
        displaySystemMessage('Connection lost. Trying to reconnect...');
      } else if (peer.peer.iceConnectionState === 'failed') {
        displaySystemMessage('Connection failed. Please try reconnecting.');
      }
    };
    
    peer.peer.onicecandidate = (event) => {
      console.log("ICE Candidate:", event.candidate);
      if (event.candidate) {
        // In a production app, you would send this candidate to the remote peer
        console.log("Generated ICE candidate:", event.candidate);
      }
    };
    
    peer.peer.ontrack = (event) => {
      console.log("Track received:", event.track.kind);
      setRemoteStream(event.streams[0]);
      displaySystemMessage(`Received ${event.track.kind} stream from remote peer`);
    };
    
    peer.peer.onnegotiationneeded = () => {
      console.log("Negotiation needed event triggered");
    };
  };

  // Set up peer connection monitoring
  useEffect(() => {
    if (!peer || !peer.peer) return;
    
    console.log("Setting up peer connection monitoring");
    monitorPeerConnection();
    
    return () => {
      // Clean up event listeners
      if (peer && peer.peer) {
        peer.peer.oniceconnectionstatechange = null;
        peer.peer.onicecandidate = null;
        peer.peer.ontrack = null;
        peer.peer.onnegotiationneeded = null;
      }
    };
  }, [peer]);

  // Check if ICE servers are configured properly
  const checkIceConfiguration = () => {
    if (!peer || !peer.peer) {
      console.warn("Peer not initialized, cannot check ICE config");
      return;
    }
    
    const config = peer.peer.getConfiguration();
    console.log("Current ICE configuration:", config);
    
    // Check if there are any ICE servers configured
    if (!config.iceServers || config.iceServers.length === 0) {
      console.warn("No ICE servers configured!");
      displaySystemMessage('Warning: No ICE servers configured');
    } else {
      console.log(`${config.iceServers.length} ICE servers configured`);
    }
  };

  // Function to fetch session details if not provided
  const fetchSessionDetails = async (sessionId) => {
    try {
      displaySystemMessage('Retrieving session details...');
      const response = await axios.get(`${API_URL}/mentorship/sessions/${sessionId}/details`);
      
      if (response.data.success) {
        const sessionData = response.data.session;
        console.log("Fetched session data:", sessionData);
        
        // Check if current user is the mentor
        const isMentor = sessionData.mentorId?._id === FIXED_MENTOR_ID || 
                       sessionData.mentorId?.userId === FIXED_MENTOR_ID;
        
        setIsHost(isMentor);
        setSessionDetails(sessionData);
        displaySystemMessage('Mentorship session interface initializing...');
        
        return sessionData;
      } else {
        toast.error("Session not found");
        displaySystemMessage('Error: Unable to load session details');
        return null;
      }
    } catch (error) {
      console.error("Error fetching session details:", error);
      toast.error("Failed to load session details");
      displaySystemMessage('Error: Unable to load session details');
      
      // Create a basic mock session for testing if API fails
      const mockSession = {
        _id: sessionId,
        topic: "Mentorship Session",
        duration: 60,
        sessionDateTime: new Date(),
        mentorId: {
          _id: FIXED_MENTOR_ID,
          userId: FIXED_MENTOR_ID,
          name: "Jane Smith",
          title: "Senior Mentor"
        },
        userId: FIXED_MENTEE_ID
      };
      
      setIsHost(false); // Default to mentee view in case of error
      setSessionDetails(mockSession);
      return mockSession;
    }
  };

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

  // Process session info and determine role
  useEffect(() => {
    // Determine if user is host (mentor) or participant (mentee)
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser?._id || '';
    
    // Check URL parameters to see if a role is specified (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const urlRole = urlParams.get('role');
    
    // Role determination logic
    const determineIsHost = (sessionData) => {
      // If role is explicitly specified in URL, use that (for testing)
      if (urlRole === 'mentor') return true;
      if (urlRole === 'mentee') return false;
      
      // Check if specific mentee ID has been specified in the URL
      if (urlParams.get('mentee_id') === currentUserId) return false;
      
      // For all other cases, check against the fixed mentor ID
      return currentUserId === FIXED_MENTOR_ID;
    };
    
    if (sessionInfo) {
      console.log("Using session info from location state:", sessionInfo);
      setSessionDetails(sessionInfo);
      
      // Use the role determination function
      const isMentor = determineIsHost(sessionInfo);
      console.log("Role determined:", isMentor ? "Mentor" : "Mentee");
      
      setIsHost(isMentor);
      displaySystemMessage(`Initializing as ${isMentor ? 'Mentor' : 'Mentee'}...`);
    } else {
      // Fetch session details from API if not provided in location state
      fetchSessionDetails(sessionId).then(sessionData => {
        if (sessionData) {
          // Use the role determination function
          const isMentor = determineIsHost(sessionData);
          console.log("Role determined:", isMentor ? "Mentor" : "Mentee");
          
          setIsHost(isMentor);
          displaySystemMessage(`Initializing as ${isMentor ? 'Mentor' : 'Mentee'}...`);
        }
      });
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
  }, [sessionInfo, sessionId]);

  // Display system message
  const displaySystemMessage = (message) => {
    setSystemMessage(message);
    setShowSystemMessage(true);
    setTimeout(() => {
      setShowSystemMessage(false);
    }, 5000);
  };

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;
    
    // Join request handler for host
    const handleJoinRequest = ({ user, id, requser_id }) => {
      console.log("Join request received from:", user);
      // Verify this is definitely a mentee if we're a mentor
      if (isHost && user.role === 'mentee') {
        setRemoteUser({
          ...user,
          isMentee: true, // Mark explicitly as mentee
          role: 'mentee'
        });
        setRemoteSocketId(id);
        displaySystemMessage(`Access request from ${user.username || 'participant'}`);
      } else if (!isHost && user.role === 'mentor') {
        // If we're a mentee and this is from a mentor, handle appropriately
        setRemoteUser({
          ...user,
          isMentor: true,  // Mark explicitly as mentor
          role: 'mentor'
        });
        setRemoteSocketId(id);
      } else {
        console.warn("Received join request with incorrect role mapping", {
          localIsHost: isHost,
          remoteUserRole: user.role
        });
      }
    };
    
    // Participant leaving handler
    const handleParticipantLeft = ({ msg }) => {
      stopMediaTracks();
      toast.error(msg || "Participant left");
      displaySystemMessage('Remote connection lost. Neural link terminated.');
      setConnectionReady(false);
      setRemoteSocketId(null);
      setRemoteStream(null);
    };
    
    // Host leaving handler
    const handleHostLeft = () => {
      stopMediaTracks();
      toast.error('Host ended the call');
      displaySystemMessage('Connection terminated by host. Neural link closed.');
      navigate('/mentorship-sessions');
    };
    
    // WebRTC handlers with improved logging
    const handleIncomingCall = async ({ from, offer }) => {
      console.log("Received incoming call from:", from);
      console.log("Offer:", offer);
      
      try {
        const answer = await peer.getAnswer(offer);
        console.log("Created answer:", answer);
        
        setRemoteSocketId(from);
        socket.emit('call:accepted', { to: from, answer });
        displaySystemMessage('Quantum handshake complete. Secure channel established.');
      } catch (error) {
        console.error("Error generating answer:", error);
        displaySystemMessage('Error accepting call. Please try again.');
      }
    };
    
    const handleCallAccepted = async ({ from, answer }) => {
      console.log("Call accepted by:", from);
      console.log("Answer:", answer);
      
      try {
        await peer.setLocalDescription(answer);
        console.log("Set local description from answer");
        
        // Add a slight delay before sending streams
        setTimeout(() => {
          sendStreams();
        }, 1000);
        
        displaySystemMessage('Remote system authenticated. Streaming encrypted data.');
      } catch (error) {
        console.error("Error handling accepted call:", error);
        displaySystemMessage('Connection error. Try reconnecting.');
      }
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
    socket.on('participant:hasleft', handleParticipantLeft);
    socket.on('host:hasleft', handleHostLeft);
    socket.on('incomming:call', handleIncomingCall);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('peer:nego:needed', handleNegotiationIncoming);
    socket.on('peer:nego:final', handleFinalNego);
    
    // Clean up event listeners
    return () => {
      socket.off('user:requested_to_join', handleJoinRequest);
      socket.off('participant:hasleft', handleParticipantLeft);
      socket.off('host:hasleft', handleHostLeft);
      socket.off('incomming:call', handleIncomingCall);
      socket.off('call:accepted', handleCallAccepted);
      socket.off('peer:nego:needed', handleNegotiationIncoming);
      socket.off('peer:nego:final', handleFinalNego);
    };
  }, [socket, navigate, isHost, sessionId]);

  // Handle negotiation needed events
  useEffect(() => {
    if (!peer || !peer.peer || !socket || !remoteSocketId) return;
    
    const handleNegotiation = async () => {
      const offer = await peer.getOffer();
      socket.emit('peer:nego:needed', { offer, to: remoteSocketId });
    };
    
    peer.peer.addEventListener('negotiationneeded', handleNegotiation);
    return () => {
      peer.peer.removeEventListener('negotiationneeded', handleNegotiation);
    };
  }, [socket, remoteSocketId]);

  // Helper functions
  const stopMediaTracks = () => {
    if (myStream) {
      const tracks = myStream.getTracks();
      tracks.forEach(track => track.stop());
      setMyStream(null);
    }
  };
  
  const sendStreams = () => {
    console.log("Attempting to send streams...");
    
    if (!myStream) {
      console.warn("No local stream to send");
      return;
    }
    
    try {
      const tracks = myStream.getTracks();
      
      // Log the tracks we're trying to add
      console.log("Tracks to add:", tracks.map(t => t.kind));
      
      // First remove any existing senders
      const senders = peer.peer.getSenders();
      senders.forEach(sender => {
        peer.peer.removeTrack(sender);
      });
      
      // Then add the tracks
      tracks.forEach(track => {
        console.log(`Adding ${track.kind} track to peer connection`);
        peer.peer.addTrack(track, myStream);
      });
      
      displaySystemMessage('Neural link active. Broadcasting encrypted stream.');
    } catch (error) {
      console.error("Error sending streams:", error);
      displaySystemMessage('Error connecting streams. Please try reconnecting.');
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
  
  const acceptRequest = (requestData) => {
    // Only accept if we're the host and the requester is a mentee
    if (!isHost) {
      console.warn("Non-host tried to accept a request");
      return;
    }
    
    console.log("Accepting request from:", requestData);
    
    const setupStreamAndCall = async () => {
      try {
        // Make sure we have a stream before proceeding
        if (!myStream) {
          console.warn("No local stream available when accepting request");
          displaySystemMessage('Please enable your camera and microphone first');
          return;
        }
        
        // Create an offer to send to the remote peer
        const offer = await peer.getOffer();
        console.log("Created offer:", offer);
        
        // Send the offer to the remote peer
        socket.emit("user:call", { 
          remoteSocketId: requestData.id,
          offer,
          fromRole: 'mentor'
        });
        
        displaySystemMessage('Quantum handshake initiated. Establishing encrypted link...');
      } catch (error) {
        console.error("Error setting up call:", error);
        displaySystemMessage('Error establishing connection. Please try again.');
      }
    };
    
    // Set up remote user first
    setRemoteUser({
      ...requestData.user,
      isMentee: true,
      role: 'mentee'
    });
    setRemoteSocketId(requestData.id);
    setConnectionReady(true);
    
    // Then set up the stream and call
    setupStreamAndCall();
    
    // Notify server that request was accepted
    socket.emit('host:req_accepted', {
      ta: socket.id,
      user: {
        ...requestData.user,
        role: 'mentee'
      },
      room: sessionId,
      id: requestData.id,
      requser_id: requestData.requser_id,
      hostRole: 'mentor'
    });
    
    displaySystemMessage(`Access granted to ${requestData.user.username || 'participant'}`);
  };
  
  const exitMeeting = () => {
    stopMediaTracks();
    
    if (isHost) {
      socket.emit('host:leave', { remoteSocketId, room: sessionId });
      displaySystemMessage('Terminating session. Closing all neural links...');
    } else {
      socket.emit('participant:leave', { remoteSocketId, room: sessionId, msg: "Participant left the session" });
      displaySystemMessage('Disconnecting from neural network. Ending session...');
    }
    
    navigate('/mentorship-sessions');
  };

  const initiateMeeting = () => {
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    
    // If host, create a room
    if (isHost) {
      socket.emit('create-room', { 
        room: sessionId, 
        user: {
          ...userInfo,
          _id: FIXED_MENTOR_ID,
          isMentor: true, // Explicitly mark as mentor
          role: 'mentor'  // Add a role property
        }
      });
      displaySystemMessage('Neural link channel established. Awaiting participant connection...');
    } 
    // If participant, request to join
    else {
      socket.emit('room:join_request', { 
        room: sessionId, 
        user: {
          ...userInfo,
          _id: FIXED_MENTEE_ID, // Use mentee ID
          isMentor: false,      // Explicitly mark as NOT a mentor
          role: 'mentee'        // Add a role property
        },
        id: socket.id 
      });
      displaySystemMessage('Requesting neural link access. Awaiting authorization...');
    }
  };

  // Reconnect function to reset and reestablish connection
  const reconnectPeer = () => {
    displaySystemMessage('Attempting to reconnect...');
    
    // Check ICE configuration
    checkIceConfiguration();
    
    // Reset peer connection
    peer.resetConnection();
    
    // If we're the host, initiate a new call
    if (isHost && remoteSocketId) {
      const setupNewCall = async () => {
        try {
          const offer = await peer.getOffer();
          socket.emit("user:call", { 
            remoteSocketId, 
            offer,
            fromRole: 'mentor'
          });
          displaySystemMessage('Reinitializing connection...');
        } catch (error) {
          console.error("Error reconnecting:", error);
          displaySystemMessage('Reconnection failed. Please try again.');
        }
      };
      
      setupNewCall();
    } 
    // If we're the mentee, request to join again
    else {
      initiateMeeting();
    }
  };

  // Role debugger component to help diagnose role issues
  const RoleDebugger = ({ isHost, sessionDetails, remoteUser }) => {
    const [showDebugger, setShowDebugger] = useState(false);
    
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlRole = urlParams.get('role');
    const menteeId = urlParams.get('mentee_id');
    
    if (!showDebugger) {
      return (
        <button 
          onClick={() => setShowDebugger(true)}
          className="absolute top-2 right-2 bg-gray-800 p-1 rounded-md text-xs text-gray-400 hover:bg-gray-700 z-50"
        >
          Debug
        </button>
      );
    }
    
    return (
      <div className="absolute top-0 right-0 z-50 bg-gray-800/90 backdrop-blur-sm p-4 border border-gray-600 rounded-lg text-xs w-72 max-h-96 overflow-auto">
        <div className="flex justify-between mb-3">
          <h4 className="font-semibold text-blue-400">Role Debugger</h4>
          <button 
            onClick={() => setShowDebugger(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-gray-400 mb-1">URL Parameters:</p>
            <div className="bg-gray-900 p-2 rounded">
              <p className="text-cyan-400">role: <span className="text-white">{urlRole || 'none'}</span></p>
              <p className="text-cyan-400">mentee_id: <span className="text-white">{menteeId || 'none'}</span></p>
            </div>
          </div>
          
          <div>
            <p className="text-gray-400 mb-1">Local Role:</p>
            <div className="bg-gray-900 p-2 rounded">
              <p className="text-cyan-400">isHost: <span className="text-white">{isHost ? 'true (mentor)' : 'false (mentee)'}</span></p>
            </div>
          </div>
          
          <div>
            <p className="text-gray-400 mb-1">Session Details:</p>
            <div className="bg-gray-900 p-2 rounded">
              <p className="text-cyan-400">mentorId: <span className="text-white">{sessionDetails?.mentorId?._id || 'unknown'}</span></p>
              <p className="text-cyan-400">userId: <span className="text-white">{sessionDetails?.userId || 'unknown'}</span></p>
              <p className="text-cyan-400">role: <span className="text-white">{sessionDetails?.role || 'unknown'}</span></p>
            </div>
          </div>
          
          <div>
            <p className="text-gray-400 mb-1">Connection Status:</p>
            <div className="bg-gray-900 p-2 rounded">
              <p className="text-cyan-400">Peer: <span className="text-white">{peerConnectionStatus}</span></p>
              <p className="text-cyan-400">Remote User: <span className="text-white">{remoteUser ? 'Set' : 'Not Set'}</span></p>
              <p className="text-cyan-400">Socket ID: <span className="text-white">{remoteSocketId || 'None'}</span></p>
            </div>
          </div>
          
          {remoteUser && (
            <div>
              <p className="text-gray-400 mb-1">Remote User:</p>
              <div className="bg-gray-900 p-2 rounded">
                <p className="text-cyan-400">id: <span className="text-white">{remoteUser?._id || 'unknown'}</span></p>
                <p className="text-cyan-400">role: <span className="text-white">{remoteUser?.role || 'unknown'}</span></p>
                <p className="text-cyan-400">isMentor: <span className="text-white">{remoteUser?.isMentor ? 'true' : 'false'}</span></p>
                <p className="text-cyan-400">isMentee: <span className="text-white">{remoteUser?.isMentee ? 'true' : 'false'}</span></p>
              </div>
            </div>
          )}
          
          <div className="text-center pt-2">
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
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
        <div className="text-xs font-medium text-gray-400">SESSION:</div>
        <div className="text-xs font-mono text-blue-400">{sessionId}</div>
      </div>
      
      <div className="w-px h-4 bg-gray-700"></div>
      
      <div className="flex items-center space-x-2">
        <div className="text-xs font-medium text-gray-400">PEER:</div>
        <div className={`text-xs font-mono ${
          peerConnectionStatus === 'connected' ? 'text-green-400' :
          peerConnectionStatus === 'connecting' ? 'text-blue-400' :
          peerConnectionStatus === 'disconnected' ? 'text-yellow-400' :
          peerConnectionStatus === 'failed' ? 'text-red-400' :
          'text-gray-400'
        }`}>{peerConnectionStatus}</div>
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
    <div className="flex flex-col h-full">
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Remote participant */}
        <div className="cyber-video-container relative">
          <div className="absolute top-3 left-3 z-10">
            <div className="cyber-badge">
              <span>{remoteUser?.fullname || (isHost ? 'Mentee' : 'Mentor')}</span>
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
              <span>You ({isHost ? 'Mentor' : 'Mentee'})</span>
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
      
      {/* Session Info */}
      {sessionDetails && (
        <div className="cyber-session-info-panel mt-4 p-4 bg-gray-900/60 rounded-lg border border-cyan-900/30">
          <h3 className="text-lg font-medium text-blue-300 mb-2">Session Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Topic</p>
              <p className="text-white">{sessionDetails.topic || "Mentorship Session"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Duration</p>
              <p className="text-white">{sessionDetails.duration || 60} minutes</p>
            </div>
            {connectionReady && (
              <div className="col-span-2">
                <p className="text-sm text-white bg-blue-900/30 p-2 rounded">
                  <span className="text-cyan-400">Tip:</span> Remember to discuss your goals clearly and take notes during the session.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
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
        
        {connectionReady && (
          <button 
            onClick={reconnectPeer}
            className="cyber-control-button-warning"
            title="Reconnect if video fails"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
        
        <button 
          onClick={exitMeeting}
          className="cyber-control-button-danger"
          title="End call"
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
          </svg>
        </button>
        
        {!connectionReady && (
          <button 
            onClick={initiateMeeting}
            className="cyber-control-button-primary"
            title={isHost ? "Start Session" : "Join Session"}
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isHost ? "Start Session" : "Join Session"}
          </button>
        )}
        
        {connectionReady && (
          <button 
            onClick={sendStreams}
            className="cyber-control-button-primary"
            title="Reconnect neural link"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
  
  // If we're the host and there are join requests, render request panel
  const renderHostPanel = () => {
    if (!isHost || !remoteUser || connectionReady) return null;
    
    return (
      <div className="cyber-host-panel mt-4 p-4 bg-gray-900/60 rounded-lg border border-cyan-900/30">
        <h3 className="text-lg font-medium text-blue-300 mb-2">Participant Request</h3>
        <div className="cyber-access-request mb-4">
          <div className="cyber-access-request-user">
            <div className="cyber-access-request-avatar">
              {remoteUser.avatar ? (
                <img 
                  src={remoteUser.avatar} 
                  alt={remoteUser.username}
                  className="h-full w-full object-cover" 
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-blue-900 text-blue-200 text-xs">
                  {remoteUser.username?.substring(0, 2).toUpperCase() || 'ME'}
                </div>
              )}
            </div>
            <div className="cyber-access-request-details">
              <div className="cyber-access-request-name">{remoteUser.fullname || remoteUser.username || 'Participant'}</div>
              <div className="cyber-access-request-username">@{remoteUser.username || 'mentee'}</div>
            </div>
          </div>
          <button 
            onClick={() => acceptRequest({
              user: remoteUser, 
              id: remoteSocketId,
              requser_id: remoteUser._id
            })}
            className="cyber-access-grant-button"
          >
            <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
            Accept Request
          </button>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gray-900 text-gray-100 p-4 overflow-hidden relative"
    >
      {/* Role Debugger */}
      <RoleDebugger 
        isHost={isHost} 
        sessionDetails={sessionDetails} 
        remoteUser={remoteUser} 
      />
      
      {/* Animated background elements */}
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
              Mentorship <span className="text-cyan-400">Meeting</span>
              <span className="cyber-blink">_</span>
            </h1>
          </div>
          
          {renderStatusIndicator()}
        </div>
      </div>
      
      {/* Main container */}
      <div className="cyber-panel h-full p-6 relative z-10">
        <div className="cyber-panel-header flex items-center justify-between mb-6">
          <div className="cyber-panel-title flex items-center space-x-2">
            <svg className="w-5 h-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="font-medium text-white tracking-wide">Neural Link | Mentorship Session</span>
          </div>
        </div>
        
        {renderVideoSection()}
        {renderHostPanel()}
      </div>
      
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
        
        /* Cyber Panel */
        .cyber-panel {
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
        
        .cyber-panel-title {
          color: #e2e8f0;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
        }
        
        .cyber-panel-header {
          border-bottom: 1px solid rgba(6, 182, 212, 0.2);
          padding-bottom: 0.75rem;
        }
        
        /* Cyber Video */
        .cyber-video-container {
          position: relative;
          height: 100%;
          min-height: 300px;
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
        .cyber-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
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
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #0369a1, #0891b2);
          border: none;
          border-radius: 0.375rem;
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
        
        .cyber-control-button-warning {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: linear-gradient(135deg, #92400e, #d97706);
          border: none;
          border-radius: 50%;
          color: white;
          transition: all 0.2s;
        }

        .cyber-control-button-warning:hover {
          background: linear-gradient(135deg, #b45309, #f59e0b);
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.6);
          transform: translateY(-2px);
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
        
        /* Access request panel */
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
          display: flex;
          align-items: center;
          justify-content: center;
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
          display: flex;
          align-items: center;
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
        
        /* Responsive styles */
        @media (max-width: 640px) {
          .cyber-controls {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}

export default MentorshipMeeting;