import React, { useCallback, useEffect, useState, useRef } from 'react';
import { isLoggedIn } from '../../Services/Auth.service.js';
import { Link, useNavigate } from 'react-router-dom';
import { useSocket } from '../../Features/useSocket.js';
import { generateRoomId } from './helper.js';

function HostInterview() {
    const socket = useSocket();
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [roomId, setRoomId] = useState("");
    const [showCopied, setShowCopied] = useState(false);
    const containerRef = useRef(null);
    const particlesRef = useRef([]);
    
    // Creating particles
    useEffect(() => {
        // Tracking mouse position for parallax effect
        const handleMouseMove = (e) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                setMousePosition({ x, y });
            }
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        
        // Generate particles
        if (containerRef.current && particlesRef.current.length === 0) {
            const particleCount = 50;
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'cyber-particle';
                particle.style.setProperty('--size', `${Math.random() * 4 + 1}px`);
                particle.style.setProperty('--x', `${Math.random() * 100}%`);
                particle.style.setProperty('--y', `${Math.random() * 100}%`);
                particle.style.setProperty('--duration', `${Math.random() * 20 + 10}s`);
                particle.style.setProperty('--delay', `${Math.random() * 5}s`);
                
                containerRef.current.appendChild(particle);
                particlesRef.current.push(particle);
            }
        }
        
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            particlesRef.current.forEach(particle => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            });
            particlesRef.current = [];
        };
    }, []);

    const handleJoinRoom = (data) => {
        const { user, room } = data;
        navigate(`/room/${room}`, { state: user });
    };

    useEffect(() => {
        socket.on('room:join', handleJoinRoom);
        return () => {
            socket.off('room:join', handleJoinRoom);
        };
    }, [socket, navigate]);

    const handleCreateRoom = (e) => {
        e.preventDefault();
        setIsCreating(true);
        
        // Small delay to show loading state
        setTimeout(() => {
            const nonparsedUser = localStorage.getItem('user');
            const user = JSON.parse(nonparsedUser);
            const newRoomId = generateRoomId();
            setRoomId(newRoomId);
            socket.emit('create-room', { room: newRoomId, user });
        }, 1000);
    };
    
    const copyRoomId = () => {
        if (roomId) {
            navigator.clipboard.writeText(roomId);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        }
    };

    return (
        <div 
            ref={containerRef}
            className="relative min-h-screen bg-gradient-to-b from-gray-900 via-blue-900/70 to-gray-900 py-8 px-4 sm:px-6 lg:px-8 overflow-hidden"
        >
            {/* Animated cyber grid background */}
            <div className="absolute inset-0 z-0">
                <div className="cyber-grid"></div>
            </div>
            
            {/* Glowing orbs */}
            <div 
                className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full filter blur-[120px] bg-indigo-500 opacity-20 animate-pulse-slow"
                style={{transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`}}
            ></div>
            <div 
                className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full filter blur-[120px] bg-blue-500 opacity-20 animate-pulse-slow animation-delay-1000"
                style={{transform: `translate(${-mousePosition.x * 30}px, ${-mousePosition.y * 30}px)`}}
            ></div>
            
            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 mb-2 drop-shadow-glow-blue animate-gradient-x">
                        Host Interview Session
                    </h1>
                    <p className="text-blue-200 max-w-2xl mx-auto text-lg tracking-wide">
                        Create a new interview room and invite candidates to join your coding interview
                    </p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 items-stretch">
                    {/* Left side - Features */}
                    <div className="w-full md:w-1/2">
                        <div className="glassmorphism-card h-full p-8 rounded-2xl relative overflow-hidden">
                            {/* Card corner accents */}
                            <div className="cyber-corner cyber-corner-tl"></div>
                            <div className="cyber-corner cyber-corner-tr"></div>
                            <div className="cyber-corner cyber-corner-bl"></div>
                            <div className="cyber-corner cyber-corner-br"></div>
                            
                            <h2 className="text-xl font-medium text-blue-300 mb-6 cyber-glitch-text">
                                <span className="cyber-glitch-text-glitch" aria-hidden="true">System Capabilities</span>
                                System Capabilities
                                <span className="cyber-glitch-text-glitch" aria-hidden="true">System Capabilities</span>
                            </h2>
                            
                            <div className="space-y-6">
                                {[
                                    {
                                        title: 'Create custom coding problems',
                                        description: 'Design your own problems or use from our library of pre-existing questions',
                                        icon: (
                                            <svg className="h-6 w-6 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        )
                                    },
                                    {
                                        title: 'Real-time code observation',
                                        description: 'Observe how candidates approach and solve problems as they type',
                                        icon: (
                                            <svg className="h-6 w-6 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )
                                    },
                                    {
                                        title: 'Automated test frameworks',
                                        description: 'Create and run test cases to verify candidate solutions',
                                        icon: (
                                            <svg className="h-6 w-6 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                            </svg>
                                        )
                                    },
                                    {
                                        title: 'Neural-link feedback system',
                                        description: 'Communicate with candidates via video and chat during the interview',
                                        icon: (
                                            <svg className="h-6 w-6 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                            </svg>
                                        )
                                    }
                                ].map((feature, index) => (
                                    <div key={index} className="cyber-feature-card">
                                        <div className="cyber-feature-icon">
                                            {feature.icon}
                                            <div className="cyber-feature-icon-glow"></div>
                                        </div>
                                        <div className="cyber-feature-content">
                                            <h3 className="text-lg font-medium text-blue-300 mb-1">{feature.title}</h3>
                                            <p className="text-blue-200/70">{feature.description}</p>
                                        </div>
                                        
                                        {/* Animated scanner line */}
                                        <div className="cyber-feature-scanner"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Right side - Create room */}
                    <div className="w-full md:w-1/2">
                        <div className="glassmorphism-card h-full rounded-2xl p-8 overflow-hidden relative">
                            {/* Card corner accents */}
                            <div className="cyber-corner cyber-corner-tl"></div>
                            <div className="cyber-corner cyber-corner-tr"></div>
                            <div className="cyber-corner cyber-corner-bl"></div>
                            <div className="cyber-corner cyber-corner-br"></div>
                            
                            {isLoggedIn() ? (
                                <div className="h-full flex flex-col justify-center">
                                    {roomId ? (
                                        <>
                                            <div className="text-center">
                                                <div className="cyber-success-icon">
                                                    <svg className="h-16 w-16 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                    <div className="cyber-success-glow"></div>
                                                </div>
                                                
                                                <h2 className="text-2xl font-bold text-blue-300 mb-4 mt-4">Room Created!</h2>
                                                <p className="text-blue-200 mb-6">
                                                    Share this ID with your candidate to start the interview
                                                </p>
                                                
                                                <div className="max-w-xs mx-auto mb-6">
                                                    <div className="cyber-room-id-card" onClick={copyRoomId}>
                                                        <div className="text-xl font-mono text-cyan-300">{roomId}</div>
                                                        <div className="cyber-room-id-scanner"></div>
                                                        <div className="cyber-room-id-border"></div>
                                                        <div className={`cyber-room-copied ${showCopied ? 'show' : ''}`}>Copied!</div>
                                                    </div>
                                                </div>
                                                
                                                <p className="text-blue-200/70 text-sm mb-8">
                                                    Click on the room ID to copy to clipboard
                                                </p>
                                                
                                                <button 
                                                    onClick={() => navigate(`/room/${roomId}`)}
                                                    className="cyber-button w-full py-3 px-4 text-blue-100 font-medium tracking-wider mx-auto max-w-xs"
                                                >
                                                    <svg className="inline mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                    </svg>
                                                    Access Room
                                                    <span className="cyber-button-glitch"></span>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="max-w-md mx-auto text-center">
                                            <div className="host-icon mb-6">
                                                <svg className="h-16 w-16 text-blue-400 cyber-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <div className="host-icon-rings">
                                                    <div className="host-icon-ring"></div>
                                                    <div className="host-icon-ring" style={{animationDelay: '0.5s'}}></div>
                                                </div>
                                            </div>
                                            
                                            <h2 className="text-2xl font-bold text-blue-300 mb-4">Initialize Interview</h2>
                                            <p className="text-blue-200 mb-8">
                                                Generate a unique room ID and share it with your candidate. You'll be connected in a secure, real-time coding environment.
                                            </p>
                                            
                                            <button
                                                onClick={handleCreateRoom}
                                                disabled={isCreating}
                                                className="cyber-button w-full py-3 px-4 text-blue-100 font-medium tracking-wider"
                                            >
                                                {isCreating ? (
                                                    <>
                                                        <svg className="animate-spin inline mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Generating Secure Channel...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="inline mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                                                        </svg>
                                                        Create Interview Room
                                                    </>
                                                )}
                                                <span className="cyber-button-glitch"></span>
                                            </button>
                                            
                                            <p className="mt-4 text-sm text-blue-200/60">
                                                Room ID will be generated automatically with military-grade encryption
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="max-w-md mx-auto text-center h-full flex flex-col justify-center">
                                    <div className="auth-required-icon mb-6">
                                        <svg className="mx-auto h-16 w-16 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <div className="auth-scan-effect"></div>
                                    </div>
                                    <h2 className="mt-2 text-xl font-medium text-blue-300">Authentication Required</h2>
                                    <p className="mt-2 text-blue-200/80 mb-8">
                                        Please log in to create or host an interview session
                                    </p>
                                    <div className="mt-6">
                                        <Link
                                            to="/login"
                                            className="cyber-button w-full py-3 px-4 text-blue-100 font-medium tracking-wider inline-flex items-center justify-center"
                                        >
                                            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Initialize Access
                                            <span className="cyber-button-glitch"></span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* How it works */}
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-blue-300 text-center mb-8">System Protocol</h2>
                    
                    <div className="relative">
                        {/* Connection timeline */}
                        <div className="hidden md:block absolute top-24 left-0 w-full h-0.5 bg-blue-900 z-0">
                            <div className="absolute top-0 left-0 h-full w-0 bg-gradient-to-r from-blue-400 to-cyan-400 cyber-progress-animation"></div>
                        </div>
                        
                        <div className="grid md:grid-cols-4 gap-8 relative z-10">
                            {[
                                {
                                    step: 1,
                                    title: 'Initialize Channel',
                                    description: 'Generate a secure interview room with quantum encryption',
                                    icon: (
                                        <svg className="h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    )
                                },
                                {
                                    step: 2,
                                    title: 'Dispatch Link',
                                    description: 'Share the room ID with your interview candidate',
                                    icon: (
                                        <svg className="h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    )
                                },
                                {
                                    step: 3,
                                    title: 'Neural Link',
                                    description: 'Establish video and code collaboration when they join',
                                    icon: (
                                        <svg className="h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )
                                },
                                {
                                    step: 4,
                                    title: 'Execute Session',
                                    description: 'Conduct the interview with advanced analytical tools',
                                    icon: (
                                        <svg className="h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )
                                }
                            ].map((step, index) => (
                                <div key={index} className="cyber-step-card text-center">
                                    <div className="cyber-step-icon-wrapper">
                                        <div className="cyber-step-icon">
                                            {step.icon}
                                        </div>
                                        <div className="cyber-step-number">{step.step}</div>
                                    </div>
                                    <h3 className="text-lg font-medium text-blue-300 mb-1 mt-4">{step.title}</h3>
                                    <p className="text-blue-200/70">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* CSS for futuristic elements */}
            <style jsx>{`
                /* Animated cyber grid background */
                .cyber-grid {
                    position: absolute;
                    inset: 0;
                    background-image: 
                        linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
                    background-size: 50px 50px;
                    animation: grid-move 50s linear infinite;
                }
                
                @keyframes grid-move {
                    0% { background-position: 0 0; }
                    100% { background-position: 50px 50px; }
                }
                
                /* Cyber particles */
                .cyber-particle {
                    position: absolute;
                    width: var(--size);
                    height: var(--size);
                    background: radial-gradient(circle, rgba(56, 189, 248, 0.8) 0%, transparent 70%);
                    border-radius: 50%;
                    top: var(--y);
                    left: var(--x);
                    pointer-events: none;
                    z-index: 1;
                    animation: cyber-float var(--duration) ease-in-out infinite;
                    animation-delay: var(--delay);
                    box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
                }
                
                @keyframes cyber-float {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(50px, -50px); }
                    50% { transform: translate(100px, 0); }
                    75% { transform: translate(50px, 50px); }
                }
                
                /* Gradient animation */
                @keyframes gradient-x {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                .animate-gradient-x {
                    background-size: 200% auto;
                    animation: gradient-x 10s ease infinite;
                }
                
                /* Glassmorphism card styling */
                .glassmorphism-card {
                    background: rgba(13, 23, 64, 0.7);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    box-shadow: 
                        0 4px 6px -1px rgba(0, 0, 0, 0.1),
                        0 2px 4px -1px rgba(0, 0, 0, 0.06),
                        0 0 0 1px rgba(59, 130, 246, 0.1) inset,
                        0 0 20px rgba(59, 130, 246, 0.2);
                    position: relative;
                    transition: all 0.3s ease;
                }
                
                .glassmorphism-card:hover {
                    border-color: rgba(59, 130, 246, 0.3);
                    box-shadow: 
                        0 4px 20px -1px rgba(0, 0, 0, 0.2),
                        0 2px 10px -1px rgba(0, 0, 0, 0.12),
                        0 0 0 1px rgba(59, 130, 246, 0.2) inset,
                        0 0 30px rgba(59, 130, 246, 0.3);
                }
                
                /* Cyber corners */
                .cyber-corner {
                    position: absolute;
                    width: 16px;
                    height: 16px;
                    z-index: 1;
                }
                
                .cyber-corner-tl {
                    top: -1px;
                    left: -1px;
                    border-top: 2px solid #38bdf8;
                    border-left: 2px solid #38bdf8;
                }
                
                .cyber-corner-tr {
                    top: -1px;
                    right: -1px;
                    border-top: 2px solid #38bdf8;
                    border-right: 2px solid #38bdf8;
                }
                
                .cyber-corner-bl {
                    bottom: -1px;
                    left: -1px;
                    border-bottom: 2px solid #38bdf8;
                    border-left: 2px solid #38bdf8;
                }
                
                .cyber-corner-br {
                    bottom: -1px;
                    right: -1px;
                    border-bottom: 2px solid #38bdf8;
                    border-right: 2px solid #38bdf8;
                }
                
                /* Cyberpunk button styling */
                .cyber-button {
                    display: inline-block;
                    position: relative;
                    background: linear-gradient(90deg, #0f3574, #3171d8);
                    color: #d6e5ff;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border: none;
                    border-radius: 4px;
                    overflow: hidden;
                    transition: 0.3s;
                    cursor: pointer;
                }
                
                .cyber-button:before, .cyber-button:after {
                    content: '';
                    position: absolute;
                    left: -2px;
                    top: -2px;
                    width: calc(100% + 4px);
                    height: calc(100% + 4px);
                    z-index: -1;
                    animation: cyber-button-border 6s linear infinite;
                    background: linear-gradient(45deg, #00ccff, #0e1538, #0e1538, #d400d4);
                    background-size: 400%;
                }
                
                .cyber-button:after {
                    filter: blur(18px);
                    opacity: 0.7;
                }
                
                .cyber-button:hover {
                    background: linear-gradient(90deg, #185fbe, #0093E9);
                    box-shadow: 0 0 20px rgba(0, 147, 233, 0.5);
                    transform: translateY(-2px);
                }
                
                .cyber-button-glitch {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(45deg, transparent 3%, #00E6F6 3%, #00E6F6 5%, transparent 5%);
                    opacity: 0;
                    z-index: -1;
                }
                
                .cyber-button:hover .cyber-button-glitch {
                    animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) forwards;
                }
                
                /* Cyber feature cards */
                .cyber-feature-card {
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    background: rgba(15, 23, 42, 0.6);
                    border-radius: 0.5rem;
                    border-left: 2px solid rgba(56, 189, 248, 0.5);
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                
                .cyber-feature-card:hover {
                    background: rgba(15, 23, 42, 0.8);
                    border-left: 2px solid rgba(56, 189, 248, 0.8);
                    transform: translateX(4px);
                }
                
                .cyber-feature-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(15, 23, 42, 0.8);
                    margin-right: 1rem;
                    position: relative;
                    border: 1px solid rgba(56, 189, 248, 0.3);
                }
                
                .cyber-feature-icon-glow {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(56, 189, 248, 0.5) 0%, transparent 70%);
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                
                .cyber-feature-card:hover .cyber-feature-icon-glow {
                    opacity: 1;
                    animation: pulse 2s infinite;
                }
                
                .cyber-feature-content {
                    flex: 1;
                }
                
                .cyber-feature-scanner {
                    position: absolute;
                    height: 1px;
                    width: 100%;
                    background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.8), transparent);
                    bottom: 0;
                    left: -100%;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                
                .cyber-feature-card:hover .cyber-feature-scanner {
                    opacity: 1;
                    animation: feature-scan 2s linear infinite;
                }
                
                /* Authentication required icon */
                .auth-required-icon {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .auth-scan-effect {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.7), transparent);
                    animation: auth-scan 2s linear infinite;
                    box-shadow: 0 0 10px rgba(56, 189, 248, 0.7);
                }
                
                @keyframes auth-scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(2000%); }
                }
                
                /* Host icon */
                .host-icon {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .host-icon-rings {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
                
                .host-icon-ring {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border: 1px solid rgba(56, 189, 248, 0.5);
                    border-radius: 50%;
                    animation: host-icon-pulse 2s ease-out infinite;
                }
                
                @keyframes host-icon-pulse {
                    0% { transform: scale(0.8); opacity: 0.8; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                
                /* Cyber room ID card */
                .cyber-room-id-card {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem 2rem;
                    background: rgba(15, 23, 42, 0.6);
                    border-radius: 0.5rem;
                    border: 1px solid rgba(56, 189, 248, 0.5);
                    position: relative;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .cyber-room-id-card:hover {
                    background: rgba(15, 23, 42, 0.8);
                    border-color: rgba(56, 189, 248, 0.8);
                    transform: translateY(-2px);
                }
                
                .cyber-room-id-scanner {
                    position: absolute;
                    height: 20px;
                    width: 2px;
                    background: rgba(56, 189, 248, 0.8);
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    box-shadow: 0 0 8px rgba(56, 189, 248, 0.8);
                    opacity: 0;
                }
                
                .cyber-room-id-card:hover .cyber-room-id-scanner {
                    opacity: 1;
                    animation: room-id-scan 1.5s linear infinite;
                }
                
                .cyber-room-id-border {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.8), transparent);
                    transition: width 0.5s ease;
                }
                
                .cyber-room-id-card:hover .cyber-room-id-border {
                    width: 100%;
                }
                
                .cyber-room-copied {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #38bdf8;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    transform: translateY(100%);
                    transition: transform 0.3s ease;
                }
                
                .cyber-room-copied.show {
                    transform: translateY(0);
                }
                
                /* Cyber success icon */
                .cyber-success-icon {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .cyber-success-glow {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(56, 189, 248, 0.5) 0%, transparent 70%);
                    animation: success-pulse 2s ease-out infinite;
                }
                
                @keyframes success-pulse {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 0.8; }
                    100% { transform: scale(0.8); opacity: 0.5; }
                }
                
                /* Cyber step cards */
                .cyber-step-card {
                    position: relative;
                    padding: 1.5rem;
                    background: rgba(15, 23, 42, 0.6);
                    border-radius: 0.5rem;
                    border: 1px solid rgba(56, 189, 248, 0.2);
                    transition: all 0.3s ease;
                }
                
                .cyber-step-card:hover {
                    background: rgba(15, 23, 42, 0.8);
                    border-color: rgba(56, 189, 248, 0.5);
                    transform: translateY(-4px);
                }
                
                .cyber-step-icon-wrapper {
                    position: relative;
                    width: 64px;
                    height: 64px;
                    margin: 0 auto;
                }
                
                .cyber-step-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: rgba(15, 23, 42, 0.8);
                    border: 1px solid rgba(56, 189, 248, 0.3);
                    box-shadow: 0 0 15px rgba(56, 189, 248, 0.3);
                    z-index: 10;
                    position: relative;
                }
                
                .cyber-step-number {
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #0f3574, #3171d8);
                    color: white;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid rgba(15, 23, 42, 0.8);
                    z-index: 20;
                }
                
                /* Timeline progress animation */
                .cyber-progress-animation {
                    animation: cyber-progress 4s ease-in-out forwards;
                }
                
                @keyframes cyber-progress {
                    0% { width: 0; }
                    100% { width: 100%; }
                }
                
                /* Cyber glitch text effect */
                .cyber-glitch-text {
                    position: relative;
                    display: inline-block;
                }
                
                .cyber-glitch-text-glitch {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    z-index: -1;
                }
                
                .cyber-glitch-text:hover .cyber-glitch-text-glitch:nth-child(1) {
                    animation: glitch-1 0.3s linear infinite;
                    color: #ff00ff;
                    opacity: 0.8;
                }
                
                .cyber-glitch-text:hover .cyber-glitch-text-glitch:nth-child(2) {
                    animation: glitch-2 0.3s linear infinite;
                    color: #00ffff;
                    opacity: 0.8;
                }
                
                /* Pulse animation for icon */
                .cyber-pulse {
                    animation: cyber-pulse 2s infinite;
                }
                
                @keyframes cyber-pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
                
                /* Animation keyframes */
                @keyframes feature-scan {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }
                
                @keyframes room-id-scan {
                    0% { top: 0; }
                    50% { top: 100%; }
                    50.1% { top: 0; }
                    100% { top: 0; }
                }
                
                @keyframes glitch-1 {
                    0% { clip-path: inset(20% 0 40% 0); transform: translate(-2px); }
                    20% { clip-path: inset(60% 0 20% 0); transform: translate(2px); }
                    40% { clip-path: inset(10% 0 70% 0); transform: translate(-1px); }
                    60% { clip-path: inset(50% 0 30% 0); transform: translate(1px); }
                    80% { clip-path: inset(30% 0 50% 0); transform: translate(-3px); }
                    100% { clip-path: inset(20% 0 40% 0); transform: translate(3px); }
                }
                
                @keyframes glitch-2 {
                    0% { clip-path: inset(40% 0 20% 0); transform: translate(2px); }
                    20% { clip-path: inset(20% 0 60% 0); transform: translate(-2px); }
                    40% { clip-path: inset(70% 0 10% 0); transform: translate(1px); }
                    60% { clip-path: inset(30% 0 50% 0); transform: translate(-1px); }
                    80% { clip-path: inset(50% 0 30% 0); transform: translate(3px); }
                    100% { clip-path: inset(40% 0 20% 0); transform: translate(-3px); }
                }
                
                @keyframes cyber-button-border {
                    0% { background-position: 0 0; }
                    100% { background-position: 400% 0; }
                }
                
                @keyframes glitch {
                    0% {
                        opacity: 0;
                        transform: translate(0);
                    }
                    20% {
                        opacity: 0.5;
                        transform: translate(-5px, 5px);
                    }
                    40% {
                        opacity: 0.5;
                        transform: translate(5px, -5px);
                    }
                    60% {
                        opacity: 0.5;
                        transform: translate(-3px, -3px);
                    }
                    80% {
                        opacity: 0.5;
                        transform: translate(3px, 3px);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(0);
                    }
                }
                
                /* Animation utilities */
                .animate-pulse-slow {
                    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                
                .animation-delay-1000 {
                    animation-delay: 1s;
                }
                
                /* Glow effects */
                .drop-shadow-glow-blue {
                    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
                }
            `}</style>
        </div>
    );
}

export default HostInterview;