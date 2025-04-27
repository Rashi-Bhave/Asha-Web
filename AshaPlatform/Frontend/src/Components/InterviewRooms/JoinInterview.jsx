import React, { useCallback, useEffect, useState, useRef } from 'react'
import { isLoggedIn } from '../../Services/Auth.service.js'
import { Link, useNavigate } from 'react-router-dom'
import { useSocket } from '../../Features/useSocket.js';
import Executing from '../Editor/Executing.jsx';

function JoinInterview() {
    const socket = useSocket();
    const navigate = useNavigate();
    const [room, setRoom] = useState('');
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState('');
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    // For the typing animation
    const [typedRoom, setTypedRoom] = useState('');
    const [showCursor, setShowCursor] = useState(true);
    
    // For particle animation
    const particlesRef = useRef([]);
    const particleCount = 50;
    
    useEffect(() => {
        // Create particles
        if (containerRef.current && particlesRef.current.length === 0) {
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.setProperty('--size', `${Math.random() * 3 + 1}px`);
                particle.style.setProperty('--x', `${Math.random() * 100}%`);
                particle.style.setProperty('--y', `${Math.random() * 100}%`);
                particle.style.setProperty('--duration', `${Math.random() * 20 + 10}s`);
                particle.style.setProperty('--delay', `${Math.random() * 5}s`);
                particle.style.setProperty('--opacity', `${Math.random() * 0.5 + 0.2}`);
                
                containerRef.current.appendChild(particle);
                particlesRef.current.push(particle);
            }
        }
        
        // Track mouse movement for parallax effect
        const handleMouseMove = (e) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                setMousePosition({ x, y });
            }
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            particlesRef.current = [];
        };
    }, []);

    const handleJoinRoom = (data) => {
        const { ta, room, id, requser_id } = data;
        if (room === '') return;
        setJoining(false);
        navigate(`/room/${room}`, { state: ta });
    }

    useEffect(() => {
        socket.on('room:join', handleJoinRoom);
        return () => {
            socket.off('room:join', handleJoinRoom);
        }
    }, [socket]);

    // Animated typing effect for the input
    useEffect(() => {
        if (room !== typedRoom) {
            const timeout = setTimeout(() => {
                setTypedRoom(room.substring(0, typedRoom.length + 1));
            }, 50);
            return () => clearTimeout(timeout);
        }
    }, [room, typedRoom]);
    
    // Blinking cursor effect
    useEffect(() => {
        const interval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!room.trim()) {
            setError('Please enter a room ID');
            return;
        }
        
        setError('');
        const nonparsedUser = localStorage.getItem('user');
        const user = JSON.parse(nonparsedUser);
        setJoining(true);
        socket.emit('room:join_request', { room, user, id: socket.id });
    }

    return (
        <div 
            ref={containerRef} 
            className="relative min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 py-8 px-4 sm:px-6 lg:px-8 overflow-hidden"
        >
            {/* Animated background grid */}
            <div className="absolute inset-0 z-0">
                <div className="cyber-grid"></div>
            </div>
            
            {/* Animated particles */}
            <div className="particles-container absolute inset-0 z-0"></div>
            
            {/* Glowing orbs */}
            <div 
                className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full filter blur-[100px] bg-blue-500 opacity-20 animate-pulse-slow"
                style={{transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`}}
            ></div>
            <div 
                className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full filter blur-[100px] bg-indigo-500 opacity-20 animate-pulse-slow animation-delay-1000"
                style={{transform: `translate(${-mousePosition.x * 30}px, ${-mousePosition.y * 30}px)`}}
            ></div>
            
            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 mb-4 drop-shadow-glow-blue animate-gradient-x">
                        Join Interview Session
                    </h1>
                    <p className="text-blue-200 max-w-2xl mx-auto text-lg tracking-wide">
                        Enter the portal to your virtual interview space
                    </p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    {/* Left side - Illustration */}
                    <div className="w-full md:w-1/2 p-6 flex justify-center items-center relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl animated-border overflow-hidden">
                            <div className="absolute inset-0.5 backdrop-blur-sm bg-black/40 rounded-2xl z-10"></div>
                        </div>
                        
                        <div className="relative w-72 h-72 flex items-center justify-center z-20 group">
                            <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse-slow"></div>
                            <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full animate-spin-slow"></div>
                            
                            <div className="hologram-container">
                                <img 
                                    src="https://res.cloudinary.com/dyfmlusbc/image/upload/v1745748838/ashaverse_logo-removebg-preview_1_-modified_ldw3kv.png" 
                                    alt="AshaVerse Interview" 
                                    className="hologram-image object-contain filter drop-shadow-glow-blue transition-all duration-500 group-hover:scale-110"
                                    style={{height: "height: 17.4rem"}}
                                />
                                <div className="hologram-ring"></div>
                                <div className="hologram-ring" style={{animationDelay: '0.5s'}}></div>
                                <div className="hologram-scan"></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right side - Join form */}
                    <div className="w-full md:w-1/2">
                        <div className="glassmorphism-card p-8 rounded-2xl relative overflow-hidden">
                            {/* Card corner accents */}
                            <div className="cyber-corner cyber-corner-tl"></div>
                            <div className="cyber-corner cyber-corner-tr"></div>
                            <div className="cyber-corner cyber-corner-bl"></div>
                            <div className="cyber-corner cyber-corner-br"></div>
                            
                            {isLoggedIn() ? (
                                <div className="max-w-md mx-auto">
                                    <h2 className="text-2xl font-bold text-blue-300 mb-6 tracking-wider">Enter Interview Room</h2>
                                    
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="relative">
                                            <label htmlFor="roomId" className="block text-sm font-medium text-blue-200 mb-1 flex items-center">
                                                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                </svg>
                                                Room ID
                                            </label>
                                            <div className="cyber-input-wrapper">
                                                <input 
                                                    type="text" 
                                                    id="roomId" 
                                                    value={room} 
                                                    onChange={(e) => setRoom(e.target.value)}
                                                    disabled={joining}
                                                    className="cyber-input w-full text-lg text-cyan-300 bg-transparent border-0 focus:ring-0 placeholder-blue-500/50"
                                                    placeholder="Enter the room ID (e.g. ABC123)"
                                                />
                                                <div className="cyber-input-border"></div>
                                                
                                                {/* Scan line animation */}
                                                <div className="cyber-input-scanner"></div>
                                            </div>
                                            
                                            {error && (
                                                <p className="mt-2 text-sm text-red-400 flex items-center">
                                                    <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {error}
                                                </p>
                                            )}
                                        </div>
                                        
                                        <button
                                            type="submit"
                                            disabled={joining}
                                            className="cyber-button w-full py-3 px-4 text-blue-100 font-medium tracking-wider"
                                        >
                                            {joining ? (
                                                <>
                                                    <svg className="animate-spin inline mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Joining room...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="inline mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                    </svg>
                                                    Join Interview
                                                </>
                                            )}
                                            <span className="cyber-button-glitch"></span>
                                        </button>
                                    </form>
                                    
                                    <div className="mt-8">
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-blue-500/30"></div>
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="px-2 bg-gradient-to-b from-blue-900/80 to-indigo-900/80 text-blue-300">or</span>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6">
                                            <Link
                                                to="/host-interview"
                                                className="cyber-button-secondary w-full flex items-center justify-center py-3 px-4 text-blue-200 font-medium tracking-wider"
                                            >
                                                <svg className="mr-2 h-5 w-5 text-blue-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                                </svg>
                                                Host an Interview
                                                <span className="cyber-button-glitch-secondary"></span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-md mx-auto text-center">
                                    <div className="auth-required-icon mb-6">
                                        <svg className="mx-auto h-16 w-16 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <div className="auth-scan-effect"></div>
                                    </div>
                                    <h2 className="mt-2 text-xl font-medium text-blue-300">Authentication Required</h2>
                                    <p className="mt-2 text-blue-200/80">
                                        Please log in to join or host an interview session
                                    </p>
                                    <div className="mt-8">
                                        <Link
                                            to="/login"
                                            className="cyber-button w-full flex items-center justify-center py-3 px-4 text-blue-100 font-medium tracking-wider"
                                        >
                                            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Access Terminal
                                            <span className="cyber-button-glitch"></span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Features section */}
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-center text-blue-300 mb-8">Interview System Features</h2>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: 'Live Coding Environment',
                                description: 'Collaborate in real-time with a fully-featured code editor supporting multiple programming languages.',
                                icon: (
                                    <svg className="h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                )
                            },
                            {
                                title: 'Neural Connection',
                                description: 'Connect face-to-face with built-in video calls to communicate effectively during interviews.',
                                icon: (
                                    <svg className="h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )
                            },
                            {
                                title: 'Quantum Processing',
                                description: 'Test your code with custom inputs and see the results immediately during the interview.',
                                icon: (
                                    <svg className="h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                )
                            }
                        ].map((feature, index) => (
                            <div key={index} className="feature-card glassmorphism-card p-6 rounded-xl group">
                                <div className="feature-icon-wrapper mb-5 relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300 animate-pulse-slow"></div>
                                    {feature.icon}
                                    <div className="feature-glow"></div>
                                </div>
                                <h3 className="text-lg font-medium text-blue-300 mb-2 group-hover:text-cyan-300 transition-colors duration-300">
                                    {feature.title}
                                </h3>
                                <p className="text-blue-200/70 group-hover:text-blue-200/90 transition-colors duration-300">
                                    {feature.description}
                                </p>
                                
                                {/* Animated border */}
                                <div className="feature-card-border"></div>
                            </div>
                        ))}
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
                
                /* Particle animation */
                .particle {
                    position: absolute;
                    width: var(--size);
                    height: var(--size);
                    background: radial-gradient(circle, #60a5fa 0%, transparent 70%);
                    border-radius: 50%;
                    top: var(--y);
                    left: var(--x);
                    opacity: var(--opacity);
                    pointer-events: none;
                    animation: float var(--duration) ease-in-out infinite;
                    animation-delay: var(--delay);
                }
                
                @keyframes float {
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
                
                .cyber-button-secondary {
                    display: inline-block;
                    position: relative;
                    background: linear-gradient(90deg, #1a2e4b, #2e4b73);
                    color: #d6e5ff;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    border-radius: 4px;
                    overflow: hidden;
                    transition: 0.3s;
                    cursor: pointer;
                }
                
                .cyber-button-secondary:hover {
                    background: linear-gradient(90deg, #243b5e, #3b5e8a);
                    box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
                    transform: translateY(-2px);
                }
                
                /* Cyberpunk input styling */
                .cyber-input-wrapper {
                    position: relative;
                    margin-top: 8px;
                }
                
                .cyber-input {
                    border: none;
                    outline: none;
                    background: transparent;
                    padding: 12px 16px;
                    width: 100%;
                    border-radius: 4px;
                    color: #60a5fa;
                    font-family: monospace;
                    letter-spacing: 1px;
                    z-index: 10;
                    position: relative;
                }
                
                .cyber-input-border {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    border-radius: 4px;
                    overflow: hidden;
                    z-index: 0;
                }
                
                .cyber-input-border:before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 200%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
                    animation: cyber-input-scan 4s linear infinite;
                }
                
                .cyber-input-scanner {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 2px;
                    width: 100%;
                    background: linear-gradient(90deg, transparent, #60a5fa, transparent);
                    animation: cyber-input-scan 2s linear infinite;
                    opacity: 0;
                    z-index: 5;
                }
                
                .cyber-input-wrapper:hover .cyber-input-scanner,
                .cyber-input:focus ~ .cyber-input-scanner {
                    opacity: 1;
                }
                
                @keyframes cyber-input-scan {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                /* Hologram effect */
                .hologram-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                }
                
                .hologram-image {
                    position: relative;
                    z-index: 10;
                    filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.7));
                }
                
                .hologram-ring {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border: 2px solid rgba(59, 130, 246, 0.5);
                    border-radius: 50%;
                    animation: hologram-scan 4s linear infinite;
                }
                
                .hologram-scan {
                    position: absolute;
                    width: 100%;
                    height: 0;
                    border-top: 1px solid rgba(59, 130, 246, 0.8);
                    animation: hologram-scan 3s linear infinite;
                    filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.8));
                }
                
                @keyframes hologram-scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
                
                /* Feature card styling */
                .feature-card {
                    transition: all 0.3s ease;
                    overflow: hidden;
                }
                
                .feature-icon-wrapper {
                    position: relative;
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: rgba(13, 23, 64, 0.7);
                    box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
                    transition: all 0.3s ease;
                    z-index: 1;
                }
                
                .feature-card:hover .feature-icon-wrapper {
                    transform: scale(1.1);
                    box-shadow: 0 0 25px rgba(59, 130, 246, 0.6);
                }
                
                .feature-glow {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .feature-card:hover .feature-glow {
                    opacity: 1;
                    animation: pulse 2s infinite;
                }
                
                .feature-card-border {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #60a5fa, transparent);
                    transition: width 0.5s ease;
                }
                
                .feature-card:hover .feature-card-border {
                    width: 100%;
                    animation: feature-border-scan 1.5s linear;
                }
                
                @keyframes feature-border-scan {
                    0% { left: -100%; width: 100%; }
                    100% { left: 100%; width: 100%; }
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
                    height: 4px;
                    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.7), transparent);
                    animation: auth-scan 2s linear infinite;
                    box-shadow: 0 0 10px rgba(59, 130, 246, 0.7);
                }
                
                @keyframes auth-scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(2000%); }
                }
                
                /* Animated border */
                .animated-border {
                    position: relative;
                    z-index: 0;
                }
                
                .animated-border:before {
                    content: '';
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    width: calc(100% + 4px);
                    height: calc(100% + 4px);
                    background: linear-gradient(45deg, #60a5fa, #3b82f6, #1d4ed8, #3b82f6, #60a5fa);
                    border-radius: 2xl;
                    background-size: 400% 400%;
                    z-index: -1;
                    animation: border-animation 10s ease infinite;
                }
                
                @keyframes border-animation {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                /* Glow effects */
                .drop-shadow-glow-blue {
                    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
                }
                
                /* Slow animation utilities */
                .animate-pulse-slow {
                    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                
                .animate-spin-slow {
                    animation: spin 10s linear infinite;
                }
                
                .animation-delay-1000 {
                    animation-delay: 1s;
                }
                
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
                
                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.7;
                    }
                    50% {
                        opacity: 0.3;
                    }
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
            `}</style>
        </div>
    );
}

export default JoinInterview;