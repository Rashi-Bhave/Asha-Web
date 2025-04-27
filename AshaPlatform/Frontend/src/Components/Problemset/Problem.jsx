import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { getProblemService } from '../../Services/Problem.service.js';
import { runExampleCasesService, submitCodeService } from '../../Services/CodeRun.service.js';
import { getdefaultlangtempService, updatedefaultlangService, updateTemplateService } from '../../Services/Problem.service.js';
import { isLoggedIn } from '../../Services/Auth.service.js';
import Loading from '../Loading/Loading.jsx';
import LoginToCode from '../Editor/LoginToCode.jsx';
import ExampleCasesOutput from '../Editor/ExampleCasesOutput.jsx';
import SampleCases from '../Editor/SampleCases.jsx';
import SubmissionResult from '../Editor/SubmissionResult.jsx';

function Problem() {
    // Problem and state data
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [activeTab, setActiveTab] = useState('description');
    const [isLoading, setIsLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [difficultyColor, setDifficultyColor] = useState('');
    const location = useLocation();
    const { solved } = location.state || {};
    const contentRef = useRef(null);
    
    // Editor state
    const defaultCodes = {
        cpp: `#include<bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your code here\n\n    return 0;\n}`,
        c: `#include<stdio.h>\n\nint main() {\n    // Your code here\n\n    return 0;\n}`,
        java: `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
        python: `def main():\n    # Your code here\n    pass\n\nif __name__ == "__main__":\n    main()`,
    };
    const [template, setTemplate] = useState(defaultCodes);
    const [language, setLanguage] = useState('cpp');
    const [code, setCode] = useState(defaultCodes.cpp);
    const [theme, setTheme] = useState('vs-light'); // Default light theme
    const [fontSize, setFontSize] = useState(14);
    const [executing, setExecuting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [exampleCasesExecution, setExampleCasesExecution] = useState(null);
    const [submissionStatus, setSubmissionStatus] = useState(null);
    
    // Layout state
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [splitView, setSplitView] = useState(50); // Percentage for the split view
    const [isResizing, setIsResizing] = useState(false);
    const [showEditorSettings, setShowEditorSettings] = useState(false);
    const [animatedBackground, setAnimatedBackground] = useState(true);
    
    // Animated elements
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [typingEffect, setTypingEffect] = useState('');
    const typingRef = useRef(null);
    
    // Difficulty configuration
    const difficultyConfig = {
        easy: { 
            badge: 'from-green-500 to-emerald-400',
            color: 'text-green-500',
            progressColor: 'bg-green-500',
            icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        },
        medium: { 
            badge: 'from-yellow-500 to-amber-400',
            color: 'text-yellow-500',
            progressColor: 'bg-yellow-500',
            icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'
        },
        hard: { 
            badge: 'from-red-500 to-pink-400',
            color: 'text-red-500',
            progressColor: 'bg-red-500',
            icon: 'M12 9v3.75m9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 12.75h.007v.008H12v-.008z'
        }
    };
    
    // Fetch problem data and user preferences
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            
            try {
                // Get problem data
                const problemData = await getProblemService(id);
                if (problemData) {
                    setProblem(problemData);
                    setDifficultyColor(difficultyConfig[problemData.difficulty].badge);
                }
                
                // Load user code templates
                const templateData = await getdefaultlangtempService();
                if (templateData) {
                    setTemplate(templateData.template);
                    setLanguage(templateData.default_language);
                    setCode(templateData.template[templateData.default_language]);
                }
                
                // Check for saved preferences
                const savedTheme = localStorage.getItem('editor-theme');
                if (savedTheme) {
                    setTheme(savedTheme);
                    setIsDarkMode(savedTheme.includes('dark'));
                }
                
                const savedFontSize = localStorage.getItem('editor-font-size');
                if (savedFontSize) {
                    setFontSize(parseInt(savedFontSize));
                }
                
                const savedSplitView = localStorage.getItem('editor-split-view');
                if (savedSplitView) {
                    setSplitView(parseInt(savedSplitView));
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchData();
        
        // Start typing animation
        if (!typingRef.current) {
            typingRef.current = setTimeout(() => {
                startTypingAnimation();
            }, 1000);
        }
        
        return () => {
            if (typingRef.current) {
                clearTimeout(typingRef.current);
            }
        };
    }, [id]);
    
    // Handle mouse movement for parallax effects
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (contentRef.current) {
                const rect = contentRef.current.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                setMousePosition({ x, y });
            }
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);
    
    // Handle resize events
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isResizing) {
                const container = document.getElementById('problem-editor-container');
                if (container) {
                    const containerRect = container.getBoundingClientRect();
                    const newSplit = ((e.clientX - containerRect.left) / containerRect.width) * 100;
                    
                    // Limit the split between 20% and 80%
                    if (newSplit >= 20 && newSplit <= 80) {
                        setSplitView(newSplit);
                        localStorage.setItem('editor-split-view', newSplit.toString());
                    }
                }
            }
        };
        
        const handleMouseUp = () => {
            setIsResizing(false);
        };
        
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);
    
    // Typing animation for problem title
    const startTypingAnimation = () => {
        if (!problem) return;
        
        const title = problem.title;
        let i = 0;
        
        const typeInterval = setInterval(() => {
            setTypingEffect(title.substring(0, i));
            i++;
            
            if (i > title.length) {
                clearInterval(typeInterval);
            }
        }, 50);
    };
    
    const handleLanguageChange = async (newLanguage) => {
        setLanguage(newLanguage);
        setCode(template[newLanguage]);
        await updatedefaultlangService(newLanguage);
    };
    
    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        setIsDarkMode(newTheme.includes('dark'));
        localStorage.setItem('editor-theme', newTheme);
    };
    
    const handleFontSizeChange = (newSize) => {
        setFontSize(newSize);
        localStorage.setItem('editor-font-size', newSize.toString());
    };
    
    const clickRun = async () => {
        setExampleCasesExecution(null);
        setSubmissionStatus(null);
        setExecuting(true);
        
        try {
            const response = await runExampleCasesService(language, code, problem.example_cases);
            if (response) {
                setExampleCasesExecution(response);
            }
        } catch (error) {
            console.error("Error running code:", error);
        } finally {
            setExecuting(false);
        }
    };
    
    const submitCode = async () => {
        setExampleCasesExecution(null);
        setSubmissionStatus(null);
        setSubmitting(true);
        
        try {
            const response = await submitCodeService(language, code, problem._id);
            if (response) {
                setSubmissionStatus(response);
            }
        } catch (error) {
            console.error("Error submitting code:", error);
        } finally {
            setSubmitting(false);
        }
    };
    
    const saveAsTemplate = async () => {
        await updateTemplateService(language, { code });
        const templateData = await getdefaultlangtempService();
        if (templateData) {
            setTemplate(templateData.template);
        }
    };
    
    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };
    
    if (isLoading) {
        return <Loading />;
    }
    
    return (
        <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Animated background */}
            {animatedBackground && (
                <>
                    <div className={`fixed inset-0 pointer-events-none z-0 ${isDarkMode ? 'opacity-20' : 'opacity-10'}`}>
                        <div className="grid-lines"></div>
                    </div>
                    
                    {/* Animated orbs */}
                    <div className="fixed top-1/4 left-1/4 w-64 h-64 rounded-full filter blur-[100px] animate-float opacity-20 pointer-events-none z-0"
                        style={{ 
                            background: `linear-gradient(to right, ${isDarkMode ? '#3b82f680' : '#60a5fa30'}, ${isDarkMode ? '#6366f180' : '#818cf830'})`,
                            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`
                        }}
                    ></div>
                    <div className="fixed bottom-1/3 right-1/4 w-72 h-72 rounded-full filter blur-[120px] animate-float-delayed opacity-15 pointer-events-none z-0"
                        style={{ 
                            background: `linear-gradient(to right, ${isDarkMode ? '#8b5cf680' : '#c084fc30'}, ${isDarkMode ? '#d946ef80' : '#e879f930'})`,
                            transform: `translate(${-mousePosition.x * 30}px, ${-mousePosition.y * 30}px)`
                        }}
                    ></div>
                </>
            )}
            
            <div className="container mx-auto px-4 py-6 relative z-10">
                {/* Problem header */}
                <div className={`mb-4 rounded-xl shadow-sm border transition-all duration-500 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                    <div className="p-4 sm:p-6 pb-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    {/* Problem difficulty badge */}
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${difficultyColor} text-white shadow-sm`}>
                                        <div className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d={difficultyConfig[problem.difficulty].icon} />
                                            </svg>
                                            {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                                        </div>
                                    </div>
                                    
                                    {/* Solved badge */}
                                    {solved && (
                                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-sm">
                                            <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                                Solved
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Problem number */}
                                    <span className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Problem #{id.slice(-3)}
                                    </span>
                                </div>
                                
                                {/* Problem title with typing effect */}
                                <h1 className={`text-2xl sm:text-3xl font-bold transition-colors duration-500 ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                } mb-1 code-cursor`}>
                                    {typingEffect || problem.title}
                                </h1>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex items-center space-x-3">
                                {/* Dark mode toggle */}
                                <button
                                    onClick={() => handleThemeChange(isDarkMode ? 'vs-light' : 'vs-dark')}
                                    className={`p-2 rounded-lg transition-all duration-300 ${
                                        isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                    aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                                >
                                    {isDarkMode ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                        </svg>
                                    )}
                                </button>
                                
                                {/* Toggle background animations */}
                                <button
                                    onClick={() => setAnimatedBackground(!animatedBackground)}
                                    className={`p-2 rounded-lg transition-all duration-300 ${
                                        isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                    aria-label={animatedBackground ? 'Disable animations' : 'Enable animations'}
                                >
                                    {animatedBackground ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </button>
                                
                                {/* Fullscreen toggle */}
                                <button
                                    onClick={toggleFullScreen}
                                    className={`p-2 rounded-lg transition-all duration-300 ${
                                        isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                    aria-label={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                                >
                                    {isFullScreen ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Problem tabs */}
                    <div className={`border-t transition-colors duration-500 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex overflow-x-auto hide-scrollbar">
                            {['description', 'solution', 'discuss', 'submissions'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`${
                                        activeTab === tab
                                            ? `border-b-2 text-blue-600 border-blue-600`
                                            : `text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent`
                                    } transition-all duration-300 px-4 py-3 text-sm font-medium focus:outline-none relative`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    <span className="capitalize">{tab}</span>
                                    
                                    {/* Glowing indicator for active tab */}
                                    {activeTab === tab && (
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 animate-pulse"></span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Main content container */}
                <div 
                    id="problem-editor-container"
                    className="flex flex-col lg:flex-row gap-4"
                    ref={contentRef}
                >
                    {/* Problem content section */}
                    <div 
                        className={`relative lg:w-[${splitView}%] transition-all duration-500 ${isFullScreen ? 'hidden' : ''}`}
                        style={{ width: `${splitView}%` }}
                    >
                        <div className={`rounded-xl shadow-sm border h-full transition-all duration-500 overflow-y-auto ${
                            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                            <div className="p-6 relative">
                                {/* Problem content based on active tab */}
                                {activeTab === 'description' && (
                                    <div className="relative space-y-6">
                                        {/* Problem description */}
                                        <div className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            <p className="whitespace-pre-line leading-relaxed">{problem.description}</p>
                                        </div>
                                        
                                        {/* Input format */}
                                        <div className={`rounded-lg border overflow-hidden transition-colors duration-500 ${
                                            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                                        }`}>
                                            <div className={`px-4 py-3 border-b transition-colors duration-500 ${
                                                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                                            }`}>
                                                <h2 className="text-sm font-medium flex items-center">
                                                    <svg className="mr-1.5 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Input Format
                                                </h2>
                                            </div>
                                            <div className="p-4">
                                                <p className={`text-sm whitespace-pre-line ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {problem.input_format}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Output format */}
                                        <div className={`rounded-lg border overflow-hidden transition-colors duration-500 ${
                                            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                                        }`}>
                                            <div className={`px-4 py-3 border-b transition-colors duration-500 ${
                                                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                                            }`}>
                                                <h2 className="text-sm font-medium flex items-center">
                                                    <svg className="mr-1.5 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    Output Format
                                                </h2>
                                            </div>
                                            <div className="p-4">
                                                <p className={`text-sm whitespace-pre-line ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {problem.output_format}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Constraints */}
                                        <div className={`rounded-lg border overflow-hidden transition-colors duration-500 ${
                                            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                                        }`}>
                                            <div className={`px-4 py-3 border-b transition-colors duration-500 ${
                                                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                                            }`}>
                                                <h2 className="text-sm font-medium flex items-center">
                                                    <svg className="mr-1.5 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                                    </svg>
                                                    Constraints
                                                </h2>
                                            </div>
                                            <div className="p-4">
                                                <ul className={`space-y-1 text-sm list-disc list-inside ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {problem.constraints.map((constraint, index) => (
                                                        <li key={index} className="inline-flex items-start">
                                                            <span className="text-blue-500 inline-block mr-2">•</span>
                                                            <span>{constraint}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                        
                                        {/* Example cases */}
                                        <div className="space-y-4">
                                            <h2 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Examples</h2>
                                            {problem.example_cases && problem.example_cases.map((example, index) => (
                                                <div key={index} className={`rounded-lg border overflow-hidden transition-colors duration-500 hover:shadow-md ${
                                                    isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                                                }`}>
                                                    <div className={`px-4 py-3 border-b transition-colors duration-500 ${
                                                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                                                    }`}>
                                                        <h3 className="text-sm font-medium flex items-center">
                                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-2 text-xs font-bold">
                                                                {index + 1}
                                                            </div>
                                                            Example {index + 1}
                                                        </h3>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-700">
                                                        <div className="p-4">
                                                            <p className="text-xs uppercase font-medium text-gray-500 dark:text-gray-400 mb-2">Input:</p>
                                                            <pre className={`text-sm whitespace-pre-wrap p-2 rounded border ${
                                                                isDarkMode 
                                                                    ? 'bg-gray-800 border-gray-700 text-gray-300' 
                                                                    : 'bg-gray-100 border-gray-200 text-gray-700'
                                                            }`}>{example.input}</pre>
                                                        </div>
                                                        <div className="p-4">
                                                            <p className="text-xs uppercase font-medium text-gray-500 dark:text-gray-400 mb-2">Output:</p>
                                                            <pre className={`text-sm whitespace-pre-wrap p-2 rounded border ${
                                                                isDarkMode 
                                                                    ? 'bg-gray-800 border-gray-700 text-gray-300' 
                                                                    : 'bg-gray-100 border-gray-200 text-gray-700'
                                                            }`}>{example.output}</pre>
                                                        </div>
                                                    </div>
                                                    {example.explanation && (
                                                        <div className={`p-4 border-t transition-colors duration-500 ${
                                                            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'
                                                        }`}>
                                                            <p className="text-xs uppercase font-medium text-gray-500 dark:text-gray-400 mb-2">Explanation:</p>
                                                            <p className={`text-sm italic ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                {example.explanation}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* Animated gradient divider */}
                                        <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 rounded animate-gradient"></div>
                                        
                                        {/* Tips card */}
                                        <div className={`rounded-lg border overflow-hidden transition-colors duration-500 ${
                                            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-blue-50 border-blue-200'
                                        }`}>
                                            <div className="p-4 flex items-start">
                                                <svg className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mt-0.5 mr-3 flex-shrink-0`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                <div>
                                                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-800'} mb-1`}>
                                                        Problem-Solving Tips
                                                    </h3>
                                                    <ul className={`ml-4 list-disc text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-blue-800'}`}>
                                                        <li>Carefully read the entire problem before starting to code</li>
                                                        <li>Consider edge cases in your solution</li>
                                                        <li>Think about time and space complexity</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Content for other tabs would go here */}
                            </div>
                        </div>
                        
                        {/* Resize handle */}
                        <div 
                            className="absolute top-0 right-0 w-4 h-full cursor-col-resize flex items-center justify-center"
                            onMouseDown={() => setIsResizing(true)}
                        >
                            <div className={`w-1 h-16 rounded-full transition-colors duration-500 ${
                                isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                            } hover:bg-blue-500`}></div>
                        </div>
                    </div>
                    
                    {/* Code editor section */}
                    <div 
                        className={`relative lg:flex-1 transition-all duration-500 ${
                            isFullScreen ? 'w-full' : ''
                        }`}
                        style={!isFullScreen ? { width: `${100 - splitView}%` } : undefined}
                    >
                        {!isLoggedIn() ? (<LoginToCode />) : (
                            <div className={`rounded-xl shadow-sm border h-full flex flex-col transition-all duration-500 ${
                                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}>
                                {/* Editor toolbar */}
                                <div className={`p-3 border-b relative transition-colors duration-500 ${
                                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                                }`}>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center space-x-2">
                                            {/* Run button */}
                                            <button
                                                onClick={clickRun}
                                                disabled={executing || submitting}
                                                className={`px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-300 ${
                                                    executing || submitting
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm hover:shadow-md hover:from-blue-600 hover:to-indigo-700 transform hover:translate-y-[-1px]'
                                                }`}
                                            >
                                                {executing ? (
                                                    <>
                                                        <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Running...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                        </svg>
                                                        Run
                                                    </>
                                                )}
                                            </button>
                                            
                                            {/* Submit button */}
                                            <button
                                                onClick={submitCode}
                                                disabled={executing || submitting}
                                                className={`px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-300 ${
                                                    executing || submitting
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm hover:shadow-md hover:from-green-600 hover:to-emerald-700 transform hover:translate-y-[-1px]'
                                                }`}
                                            >
                                                {submitting ? (
                                                    <>
                                                        <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        Submit
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        
                                        <div className="flex items-center">
                                            {/* Language selector */}
                                            <div className="relative group mr-2">
                                                <select
                                                    value={language}
                                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                                    className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-500 ${
                                                        isDarkMode
                                                            ? 'bg-gray-700 text-white border-gray-600'
                                                            : 'bg-gray-100 text-gray-800 border-gray-200'
                                                    }`}
                                                >
                                                    <option value="cpp">C++</option>
                                                    <option value="c">C</option>
                                                    <option value="java">Java</option>
                                                    <option value="python">Python</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                    <svg className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                
                                                {/* Language tooltip */}
                                                <div className="absolute left-0 -bottom-1 transform translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                                                    <div className="mt-1 bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                                        Select language
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Editor settings button */}
                                            <button
                                                onClick={() => setShowEditorSettings(!showEditorSettings)}
                                                className={`p-1.5 rounded-lg transition-colors duration-500 ${
                                                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </button>
                                            
                                            {/* Set as template button */}
                                            <button
                                                onClick={saveAsTemplate}
                                                className={`ml-2 p-1.5 rounded-lg transition-colors duration-500 ${
                                                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                                aria-label="Save as template"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Editor settings panel */}
                                    {showEditorSettings && (
                                        <div className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg z-10 transition-colors duration-500 ${
                                            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                                        }`}>
                                            <div className={`px-4 py-3 border-b transition-colors duration-500 ${
                                                isDarkMode ? 'border-gray-700' : 'border-gray-200'
                                            }`}>
                                                <h3 className="text-sm font-medium">Editor Settings</h3>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                {/* Theme selector */}
                                                <div>
                                                    <label className="block text-xs font-medium mb-1">
                                                        Theme
                                                    </label>
                                                    <select
                                                        value={theme}
                                                        onChange={(e) => handleThemeChange(e.target.value)}
                                                        className={`w-full appearance-none pl-3 pr-8 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-500 ${
                                                            isDarkMode
                                                                ? 'bg-gray-700 text-white border-gray-600'
                                                                : 'bg-gray-100 text-gray-800 border-gray-200'
                                                        }`}
                                                    >
                                                        <option value="vs-light">Light</option>
                                                        <option value="vs-dark">Dark</option>
                                                        <option value="hc-black">High Contrast</option>
                                                    </select>
                                                </div>
                                                
                                                {/* Font size slider */}
                                                <div>
                                                    <label className="block text-xs font-medium mb-1">
                                                        Font Size: {fontSize}px
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min="12"
                                                        max="24"
                                                        value={fontSize}
                                                        onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Code editor */}
                                <div className="flex-grow relative">
                                    <Editor
                                        height="100%"
                                        language={language}
                                        value={code}
                                        theme={theme}
                                        onChange={(value) => setCode(value)}
                                        options={{
                                            minimap: { enabled: false },
                                            scrollBeyondLastLine: false,
                                            fontSize: fontSize,
                                            padding: { top: 16 },
                                            lineNumbers: 'on',
                                            roundedSelection: true,
                                            autoIndent: 'full',
                                            formatOnPaste: true,
                                            formatOnType: true,
                                            renderLineHighlight: 'all'
                                        }}
                                        className="font-mono h-full"
                                    />
                                    
                                    {/* Code particles animation */}
                                    {animatedBackground && (
                                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                            <div className="code-particles"></div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Results section */}
                                <div className={`border-t transition-colors duration-500 ${
                                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                                }`}>
                                    <div className={`p-4 max-h-[30vh] overflow-y-auto ${
                                        isDarkMode ? 'scrollbar-dark' : 'scrollbar-light'
                                    }`}>
                                        {executing ? (
                                            <div className="flex items-center justify-center p-8">
                                                <div className="flex flex-col items-center">
                                                    <div className="relative w-16 h-16 mb-4">
                                                        {/* CPU/Processor animation */}
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className={`w-10 h-10 rounded-md border-2 ${
                                                                isDarkMode ? 'border-blue-500' : 'border-blue-300'
                                                            } flex items-center justify-center animate-pulse`}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Orbital circles animation */}
                                                        <div className="absolute inset-0">
                                                            <div className={`w-16 h-16 border-4 border-transparent ${
                                                                isDarkMode ? 'border-t-blue-500' : 'border-t-blue-500'
                                                            } rounded-full animate-spin`} style={{ animationDuration: '1.5s' }}></div>
                                                        </div>
                                                        <div className="absolute inset-0">
                                                            <div className={`w-16 h-16 border-4 border-transparent ${
                                                                isDarkMode ? 'border-b-indigo-500' : 'border-b-indigo-500'
                                                            } rounded-full animate-spin`} style={{ animationDuration: '2s' }}></div>
                                                        </div>
                                                    </div>
                                                    
                                                    <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        Executing
                                                        <span className="animate-pulse">.</span>
                                                        <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
                                                        <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
                                                    </p>
                                                    
                                                    <p className={`text-sm mt-2 max-w-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Compiling and running your code against test cases...
                                                    </p>
                                                </div>
                                            </div>
                                        ) : submitting ? (
                                            <div className="flex items-center justify-center p-8">
                                                <div className="flex flex-col items-center">
                                                    <div className="relative w-16 h-16 mb-4">
                                                        {/* Submission animation */}
                                                        <svg className="animate-spin h-16 w-16 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    </div>
                                                    
                                                    <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        Submitting
                                                        <span className="animate-pulse">.</span>
                                                        <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
                                                        <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
                                                    </p>
                                                    
                                                    <p className={`text-sm mt-2 max-w-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Evaluating your solution against all test cases...
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {submissionStatus ? (
                                                    <SubmissionResult submissionStatus={submissionStatus} />
                                                ) : (
                                                    <>
                                                        {exampleCasesExecution ? (
                                                            <ExampleCasesOutput exampleCasesExecution={exampleCasesExecution} />
                                                        ) : (
                                                            problem && <SampleCases example_cases={problem.example_cases} />
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* CSS styling for animations */}
            <style jsx>{`
                /* Animated grid lines */
                .grid-lines {
                    position: absolute;
                    inset: 0;
                    background-image: 
                        linear-gradient(to right, ${isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'} 1px, transparent 1px),
                        linear-gradient(to bottom, ${isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'} 1px, transparent 1px);
                    background-size: 40px 40px;
                    animation: grid-move 50s linear infinite;
                }
                
                @keyframes grid-move {
                    0% { background-position: 0 0; }
                    100% { background-position: 40px 40px; }
                }
                
                /* Floating animation */
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                    100% { transform: translateY(0px); }
                }
                
                .animate-float {
                    animation: float 15s ease-in-out infinite;
                }
                
                .animate-float-delayed {
                    animation: float 20s ease-in-out infinite;
                    animation-delay: 2s;
                }
                
                /* Gradient animation */
                @keyframes gradient-x {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                .animate-gradient {
                    background-size: 200% auto;
                    animation: gradient-x 15s ease infinite;
                }
                
                /* Typing cursor animation */
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                
                .code-cursor::after {
                    content: '|';
                    display: ${typingEffect === problem?.title ? 'none' : 'inline-block'};
                    animation: blink 1s step-end infinite;
                    margin-left: 2px;
                    color: ${isDarkMode ? '#60a5fa' : '#3b82f6'};
                }
                
                /* Code particles animation */
                .code-particles {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    overflow: hidden;
                }
                
                .code-particles::before,
                .code-particles::after {
                    content: '0101010010111001010101010001010101001111010101';
                    position: absolute;
                    top: -10%;
                    color: ${isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'};
                    font-family: monospace;
                    font-size: 12px;
                    white-space: nowrap;
                    letter-spacing: 2px;
                    user-select: none;
                    pointer-events: none;
                }
                
                .code-particles::before {
                    left: -5%;
                    animation: code-rain 30s linear infinite;
                }
                
                .code-particles::after {
                    left: 35%;
                    animation: code-rain 25s linear infinite;
                    animation-delay: 5s;
                }
                
                @keyframes code-rain {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(1000%); }
                }
                
                /* Custom scrollbars */
                .scrollbar-light::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                .scrollbar-light::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                }
                
                .scrollbar-light::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                
                .scrollbar-light::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                
                .scrollbar-dark::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                .scrollbar-dark::-webkit-scrollbar-track {
                    background: #1e293b;
                    border-radius: 4px;
                }
                
                .scrollbar-dark::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 4px;
                }
                
                .scrollbar-dark::-webkit-scrollbar-thumb:hover {
                    background: #475569;
                }
                
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}

export default Problem;