import React, { useEffect, useState } from 'react';

const Executing = ({ text = "Executing" }) => {
    const [dots, setDots] = useState('');
    const [progress, setProgress] = useState(0);
    const [animationPhase, setAnimationPhase] = useState(0);
    const [randomLines, setRandomLines] = useState([]);
    
    // Animation phases:
    // 0: Initial animations
    // 1: Code compilation animation
    // 2: Final phase with progress bar completion
    
    useEffect(() => {
        // Dots animation
        const dotsInterval = setInterval(() => {
            setDots(prev => prev.length < 3 ? prev + '.' : '');
        }, 400);
        
        // Progress animation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                // Slow down progress near the end to create anticipation
                if (prev >= 90) {
                    return prev + 0.3;
                } else {
                    return prev + Math.random() * 1.5 + 0.5;
                }
            });
        }, 100);
        
        // Phase transitions
        const phaseTimeout = setTimeout(() => {
            setAnimationPhase(1);
            
            // Transition to final phase
            setTimeout(() => {
                setAnimationPhase(2);
            }, 2000);
        }, 1500);
        
        // Generate random code-like lines for the animation
        const codeLines = [
            'Initializing compiler...',
            'Loading dependencies...',
            'Parsing syntax...',
            'Checking types...',
            'Optimizing code...',
            'Allocating memory...',
            'Compiling to bytecode...',
            'Running tests...',
            'Evaluating output...',
            'Verifying results...',
            'Processing input data...',
            'Generating output...',
            'Validating constraints...',
        ];
        
        // Randomly select and display code execution messages
        let lineIndex = 0;
        const linesInterval = setInterval(() => {
            if (lineIndex < 5) {
                const randomLine = codeLines[Math.floor(Math.random() * codeLines.length)];
                setRandomLines(prev => [...prev, randomLine]);
                lineIndex++;
            } else {
                clearInterval(linesInterval);
            }
        }, 500);
        
        // Cleanup intervals and timeouts
        return () => {
            clearInterval(dotsInterval);
            clearInterval(progressInterval);
            clearInterval(linesInterval);
            clearTimeout(phaseTimeout);
        };
    }, []);

    // Reset progress when it reaches 100%
    useEffect(() => {
        if (progress >= 100) {
            setProgress(100);
        }
    }, [progress]);

    return (
        <div className="relative overflow-hidden">
            {/* Main content */}
            <div className="p-8 flex flex-col items-center justify-center relative z-10">
                {/* CPU/Processing Animation */}
                <div className="relative mb-6">
                    {/* Rotating rings */}
                    <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-l-indigo-500 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                    <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-b-purple-500 rounded-full animate-spin" style={{ animationDuration: '4s' }}></div>
                    
                    {/* Inner content - changes based on animation phase */}
                    <div className="w-24 h-24 flex items-center justify-center relative">
                        {animationPhase === 0 && (
                            <div className="text-blue-600 pulse-fade">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                        
                        {animationPhase === 1 && (
                            <div className="code-compilation">
                                <div className="relative flex items-center justify-center">
                                    <div className="h-8 w-8 bg-blue-600 pulse-scale"></div>
                                    <div className="absolute h-8 w-8 border-2 border-indigo-400 rotate-45 animate-pulse"></div>
                                </div>
                            </div>
                        )}
                        
                        {animationPhase === 2 && (
                            <div className="processing-complete text-green-500 pulse-fade-in">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Text with dots animation */}
                <div className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                    <span className="mr-1">{text}</span>
                    <span className="w-6 text-left">{dots}</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-200 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                
                {/* Status text */}
                <div className="text-sm text-gray-500 mb-6">
                    {progress < 100 ? `${Math.floor(progress)}% complete` : 'Process completed'}
                </div>
                
                {/* Console output simulation */}
                <div className="w-full max-w-md bg-gray-900 text-gray-200 rounded-lg p-4 font-mono text-xs h-32 overflow-hidden relative">
                    <div className="flex items-center mb-2 border-b border-gray-700 pb-1">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="ml-2 text-gray-400 text-xs">console</span>
                    </div>
                    
                    <div className="console-text">
                        <div className="line">
                            <span className="text-green-400">● </span>
                            <span className="text-blue-400">{text} process started</span>
                        </div>
                        
                        {randomLines.map((line, index) => (
                            <div key={index} className="line" style={{ animationDelay: `${index * 0.2}s` }}>
                                <span className="text-yellow-400">→ </span>
                                <span>{line}</span>
                            </div>
                        ))}
                        
                        {progress >= 95 && (
                            <div className="line success">
                                <span className="text-green-400">✓ </span>
                                <span>Process completed successfully</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Blinking cursor */}
                    <div className="absolute bottom-4 left-[76px] w-2 h-4 bg-gray-400 opacity-70 cursor-blink"></div>
                </div>
            </div>
            
            {/* Background effects */}
            <div className="absolute inset-0 z-0">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white opacity-70"></div>
                
                {/* Circuit board pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="circuit-pattern"></div>
                </div>
                
                {/* Animated particles */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                <div className="absolute top-3/4 left-2/3 w-2 h-2 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-indigo-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            </div>
            
            {/* CSS animations */}
            <style jsx>{`
                /* Pulse animation for initial icon */
                .pulse-fade {
                    animation: pulse-fade 2s ease-in-out infinite;
                }
                
                @keyframes pulse-fade {
                    0%, 100% { opacity: 0.8; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.1); }
                }
                
                /* Scaling animation for compiling phase */
                .pulse-scale {
                    animation: pulse-scale 1.5s ease-in-out infinite;
                }
                
                @keyframes pulse-scale {
                    0%, 100% { transform: scale(1) rotate(0deg); }
                    50% { transform: scale(0.8) rotate(45deg); }
                }
                
                /* Fade in animation for completion */
                .pulse-fade-in {
                    animation: pulse-fade-in 0.5s ease-out forwards;
                    opacity: 0;
                }
                
                @keyframes pulse-fade-in {
                    0% { opacity: 0; transform: scale(0.8); }
                    70% { opacity: 1; transform: scale(1.1); }
                    100% { opacity: 1; transform: scale(1); }
                }
                
                /* Console text animation */
                .console-text .line {
                    opacity: 0;
                    transform: translateY(10px);
                    animation: fade-in-up 0.5s ease-out forwards;
                    white-space: nowrap;
                }
                
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                
                .console-text .success {
                    animation: highlight 1s ease-out forwards;
                }
                
                @keyframes highlight {
                    0% { background-color: rgba(16, 185, 129, 0.2); }
                    70% { background-color: rgba(16, 185, 129, 0.2); }
                    100% { background-color: transparent; }
                }
                
                /* Blinking cursor */
                .cursor-blink {
                    animation: cursor-blink 1s step-end infinite;
                }
                
                @keyframes cursor-blink {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 1; }
                }
                
                /* Circuit board pattern */
                .circuit-pattern {
                    position: absolute;
                    inset: 0;
                    background-image: 
                        linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                        radial-gradient(circle at 30px 30px, rgba(59, 130, 246, 0.1) 2px, transparent 3px),
                        radial-gradient(circle at 90px 90px, rgba(99, 102, 241, 0.1) 2px, transparent 3px),
                        radial-gradient(circle at 150px 150px, rgba(139, 92, 246, 0.1) 2px, transparent 3px);
                    background-size: 30px 30px, 30px 30px, 90px 90px, 90px 90px, 90px 90px;
                }
            `}</style>
        </div>
    );
};

export default Executing;