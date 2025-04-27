import React, { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { getdefaultlangtempService, updatedefaultlangService, updateTemplateService } from '../../Services/Problem.service.js';
import { isLoggedIn } from '../../Services/Auth.service.js';
import Loading from '../Loading/Loading.jsx';
import { runExampleCasesService, submitCodeService } from '../../Services/CodeRun.service.js';
import Executing from './Executing.jsx';
import LoginToCode from './LoginToCode.jsx';
import ExampleCasesOutput from './ExampleCasesOutput.jsx';
import SampleCases from './SampleCases.jsx';
import SubmissionResult from './SubmissionResult.jsx';

function EditorBox({ problem }) {
    const defaultCodes = {
        cpp: `#include<bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your code here\n\n    return 0;\n}`,
        c: `#include<stdio.h>\n\nint main() {\n    // Your code here\n\n    return 0;\n}`,
        java: `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
        python: `def main():\n    # Your code here\n    pass\n\nif __name__ == "__main__":\n    main()`,
    };

    // State variables
    const [isLoading, setIsLoading] = useState(true);
    const [template, setTemplate] = useState(defaultCodes);
    const [language, setLanguage] = useState('cpp');
    const [code, setCode] = useState(defaultCodes.cpp);
    const [theme, setTheme] = useState('light');
    const [exampleCasesExecution, setExampleCasesExecution] = useState(null);
    const [executing, setExecuting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [editorReady, setEditorReady] = useState(false);
    const [isSaved, setIsSaved] = useState(true);
    const [saveTimestamp, setSaveTimestamp] = useState(null);
    const [editorOptions, setEditorOptions] = useState({
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
        cursorSmoothCaretAnimation: true,
        smoothScrolling: true,
    });
    
    // Refs
    const editorRef = useRef(null);
    const containerRef = useRef(null);
    const saveTimeoutRef = useRef(null);
    
    // Language config with icons and syntax highlighting info
    const languageConfig = {
        cpp: { 
            name: 'C++', 
            icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                    <path d="M10.5 15.97L10.91 18.41C10.65 18.55 10.23 18.68 9.67 18.8C9.1 18.93 8.43 19 7.66 19C5.45 18.96 3.79 18.3 2.68 17.04C1.56 15.77 1 14.16 1 12.21C1.05 9.9 1.72 8.13 3 6.89C4.32 5.64 5.96 5 7.94 5C8.69 5 9.34 5.07 9.88 5.19C10.42 5.31 10.82 5.44 11.08 5.59L10.5 8.08L9.44 7.74C9.04 7.64 8.58 7.59 8.05 7.59C6.89 7.58 5.93 7.95 5.18 8.69C4.42 9.42 4.03 10.54 4 12.03C4 13.39 4.37 14.45 5.08 15.23C5.79 16 6.79 16.4 8.07 16.41L9.4 16.29C9.83 16.21 10.19 16.1 10.5 15.97M11 11H13V9H15V11H17V13H15V15H13V13H11V11M18 11H20V9H22V11H24V13H22V15H20V13H18V11Z" />
                </svg>
            ),
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            hoverBgColor: 'hover:bg-blue-200',
            gradientFrom: 'from-blue-500',
            gradientTo: 'to-indigo-500'
        },
        c: { 
            name: 'C', 
            icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                    <path d="M15.45,15.97L15.87,18.41C15.61,18.55 15.19,18.68 14.63,18.8C14.06,18.93 13.39,19 12.62,19C10.41,18.96 8.75,18.3 7.64,17.04C6.5,15.77 5.96,14.16 5.96,12.21C6,9.9 6.68,8.13 7.96,6.89C9.28,5.64 10.92,5 12.9,5C13.65,5 14.3,5.07 14.84,5.19C15.38,5.31 15.78,5.44 16.04,5.59L15.44,8.08L14.4,7.74C14,7.64 13.53,7.59 13,7.59C11.85,7.58 10.89,7.95 10.14,8.69C9.38,9.42 9,10.54 8.96,12.03C8.97,13.39 9.33,14.45 10.04,15.23C10.75,16 11.74,16.4 13.03,16.41L14.36,16.29C14.79,16.21 15.15,16.1 15.45,15.97Z" />
                </svg>
            ),
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-100',
            hoverBgColor: 'hover:bg-cyan-200',
            gradientFrom: 'from-cyan-500',
            gradientTo: 'to-blue-500'
        },
        java: { 
            name: 'Java', 
            icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                    <path d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.93.828-.093-0.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s0.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0 0 .553.457 3.393.639" />
                </svg>
            ),
            color: 'text-amber-600',
            bgColor: 'bg-amber-100',
            hoverBgColor: 'hover:bg-amber-200',
            gradientFrom: 'from-amber-500',
            gradientTo: 'to-orange-500'
        },
        python: { 
            name: 'Python', 
            icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                    <path d="M12,0C5.41,0 5.37,2.39 5.37,2.39L5.38,4.86H12.13V5.88H3.5C3.5,5.88 0,5.51 0,12.03C0,18.55 3.06,18.36 3.06,18.36H4.9V15.82C4.9,15.82 4.75,12.76 7.92,12.76H12.03C12.03,12.76 14.93,12.84 14.93,9.97V3.62C14.93,3.62 15.37,0 12,0M7.92,1.45C8.44,1.45 8.85,1.86 8.85,2.38C8.85,2.89 8.44,3.3 7.92,3.3C7.4,3.3 6.99,2.89 6.99,2.38C6.99,1.86 7.4,1.45 7.92,1.45M12,24C18.59,24 18.63,21.61 18.63,21.61L18.62,19.14H11.87V18.12H20.5C20.5,18.12 24,18.49 24,11.97C24,5.45 20.94,5.64 20.94,5.64H19.1V8.18C19.1,8.18 19.25,11.24 16.08,11.24H11.97C11.97,11.24 9.07,11.16 9.07,14.03V20.38C9.07,20.38 8.63,24 12,24M16.08,22.55C15.56,22.55 15.15,22.14 15.15,21.62C15.15,21.11 15.56,20.7 16.08,20.7C16.6,20.7 17.01,21.11 17.01,21.62C17.01,22.14 16.6,22.55 16.08,22.55Z" />
                </svg>
            ),
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            hoverBgColor: 'hover:bg-blue-200',
            gradientFrom: 'from-blue-500',
            gradientTo: 'to-cyan-500'
        }
    };
    
    // Theme config
    const themeConfig = {
        light: {
            name: 'Light',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        },
        'vs-dark': {
            name: 'Dark',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )
        },
        'hc-black': {
            name: 'High Contrast',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
            )
        }
    };

    const loadTemplateAndLanguage = async () => {
        try {
            const data = await getdefaultlangtempService();
            if (data) {
                setTemplate(data.template);
                setLanguage(data.default_language);
                setCode(data.template[data.default_language]);
            }
            setIsLoading(false);
        } catch (error) {
            console.error("Error loading template:", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTemplateAndLanguage();
        
        // Create typing animation
        const createTypingAnimation = () => {
            if (containerRef.current) {
                // Create typing dots
                const typingContainer = document.createElement('div');
                typingContainer.className = 'typing-animation';
                containerRef.current.appendChild(typingContainer);
            }
        };
        
        if (!isLoading) {
            setTimeout(() => {
                createTypingAnimation();
                setEditorReady(true);
            }, 500);
        }
        
        // Clean up
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [isLoading]);
    
    // Effect for auto-save indication
    useEffect(() => {
        if (editorReady && code !== template[language]) {
            setIsSaved(false);
            
            // Auto-save after 2 seconds of inactivity
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            
            saveTimeoutRef.current = setTimeout(() => {
                setIsSaved(true);
                setSaveTimestamp(new Date().toLocaleTimeString());
            }, 2000);
        }
        
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [code, language, template, editorReady]);

    const handleLanguageChange = async (newLanguage) => {
        setLanguage(newLanguage);
        setCode(template[newLanguage]);
        await updatedefaultlangService(newLanguage);
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
    };
    
    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        
        // Add resize listener
        window.addEventListener('resize', () => {
            editor.layout();
        });
        
        // Add font size control with key bindings
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Equal, () => {
            const newFontSize = Math.min(editorOptions.fontSize + 2, 28);
            setEditorOptions({...editorOptions, fontSize: newFontSize});
        });
        
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Minus, () => {
            const newFontSize = Math.max(editorOptions.fontSize - 2, 10);
            setEditorOptions({...editorOptions, fontSize: newFontSize});
        });
    };

    const toggleFullScreen = () => {
        if (!isFullScreen) {
            const element = containerRef.current;
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
        setIsFullScreen(!isFullScreen);
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
    
    const setAsTemplate = async () => {
        try {
            await updateTemplateService(language, { code });
            setIsLoading(true);
            await loadTemplateAndLanguage();
        } catch (error) {
            console.error("Error setting template:", error);
        }
    };

    // Full screen change event handler
    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(
                document.fullscreenElement || 
                document.mozFullScreenElement || 
                document.webkitFullscreenElement || 
                document.msFullscreenElement
            );
        };
        
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
        document.addEventListener('mozfullscreenchange', handleFullScreenChange);
        document.addEventListener('MSFullscreenChange', handleFullScreenChange);
        
        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
        };
    }, []);

    if (isLoading) return <Loading />;

    return (
        <div 
            ref={containerRef}
            className={`h-full flex flex-col relative overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-gray-50 ${
                isFullScreen ? 'fullscreen-mode' : ''
            }`}
        >
            {!isLoggedIn() ? (
                <LoginToCode />
            ) : (
                <>
                    {/* Code Editor Header */}
                    <div className="relative z-10 bg-white border-b border-gray-200 px-4 py-2 flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={clickRun}
                                className="group relative overflow-hidden px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-md hover:shadow-md transition-all duration-300 flex items-center"
                            >
                                <span className="relative z-10 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Run
                                </span>
                                
                                {/* Animated gradient overlay */}
                                <span 
                                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent scale-x-0 opacity-20 transform -translate-x-full group-hover:scale-x-100 group-hover:translate-x-0 transition-transform duration-1000"
                                    style={{
                                        backgroundSize: '200% 100%',
                                    }}
                                ></span>
                            </button>
                            
                            {problem && (
                                <button
                                    onClick={submitCode}
                                    className="group relative overflow-hidden px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-md hover:shadow-md transition-all duration-300 flex items-center"
                                >
                                    <span className="relative z-10 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Submit
                                    </span>
                                    
                                    {/* Animated gradient overlay */}
                                    <span 
                                        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent scale-x-0 opacity-20 transform -translate-x-full group-hover:scale-x-100 group-hover:translate-x-0 transition-transform duration-1000"
                                        style={{
                                            backgroundSize: '200% 100%',
                                        }}
                                    ></span>
                                </button>
                            )}
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            {/* Language selector */}
                            <div className="relative">
                                <select
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    value={language}
                                    className="appearance-none px-3 pl-9 py-2 pr-10 bg-white border border-gray-200 rounded-md text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm hover:border-gray-300 transition-colors duration-200"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                        backgroundPosition: `right 0.5rem center`,
                                        backgroundRepeat: `no-repeat`,
                                        backgroundSize: `1.5em 1.5em`,
                                    }}
                                >
                                    {Object.keys(defaultCodes).map((lang) => (
                                        <option key={lang} value={lang}>{languageConfig[lang].name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    {languageConfig[language].icon}
                                </div>
                            </div>
                            
                            {/* Theme selector */}
                            <div className="relative">
                                <select
                                    onChange={(e) => handleThemeChange(e.target.value)}
                                    value={theme}
                                    className="appearance-none px-3 pl-9 py-2 pr-10 bg-white border border-gray-200 rounded-md text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm hover:border-gray-300 transition-colors duration-200"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                        backgroundPosition: `right 0.5rem center`,
                                        backgroundRepeat: `no-repeat`,
                                        backgroundSize: `1.5em 1.5em`,
                                    }}
                                >
                                    {Object.keys(themeConfig).map((t) => (
                                        <option key={t} value={t}>{themeConfig[t].name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    {themeConfig[theme].icon}
                                </div>
                            </div>
                            
                            {/* Font size control */}
                            <div className="flex items-center bg-white border border-gray-200 rounded-md overflow-hidden">
                                <button 
                                    onClick={() => {
                                        const newFontSize = Math.max(editorOptions.fontSize - 2, 10);
                                        setEditorOptions({...editorOptions, fontSize: newFontSize});
                                    }}
                                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                    title="Decrease font size"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                                    </svg>
                                </button>
                                <span className="px-2 text-xs font-medium text-gray-600 border-l border-r border-gray-200">
                                    {editorOptions.fontSize}px
                                </span>
                                <button 
                                    onClick={() => {
                                        const newFontSize = Math.min(editorOptions.fontSize + 2, 28);
                                        setEditorOptions({...editorOptions, fontSize: newFontSize});
                                    }}
                                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                    title="Increase font size"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Action buttons */}
                            <button
                                onClick={setAsTemplate}
                                className="p-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center text-sm"
                                title="Set as template"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                </svg>
                            </button>
                            
                            <button
                                onClick={toggleFullScreen}
                                className="p-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                                title={isFullScreen ? "Exit full screen" : "Full screen"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isFullScreen ? "M9 9L4 4m0 0l5 0m-5 0l0 5M9 15l-5 5m0 0l5 0m-5 0l0 -5M15 9l5-5m0 0l-5 0m5 0l0 5M15 15l5 5m0 0l-5 0m5 0l0 -5" : "M3 8V4m0 0h4M3 4l4 4m8 0V4m0 0h-4m4 0l-4 4m-8 4v4m0 0h4m-4 0l4-4m8 4l-4-4m4 4v-4m0 4h-4"} />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    {/* Coding activity indicator */}
                    <div className="absolute top-0 right-0 p-2 z-20 flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full transition-colors duration-300 ${isSaved ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                        <span className="text-xs text-gray-500">
                            {isSaved ? (saveTimestamp ? `Auto-saved at ${saveTimestamp}` : 'Saved') : 'Editing...'}
                        </span>
                    </div>

                    {/* Background elements */}
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                        {/* Grid pattern */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="code-grid-pattern"></div>
                        </div>
                        
                        {/* Glowing orbs */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-400 rounded-full filter blur-3xl opacity-5"></div>
                        <div className="absolute top-1/4 right-0 w-32 h-32 bg-purple-400 rounded-full filter blur-3xl opacity-5"></div>
                    </div>

                    {/* Editor */}
                    <div className="flex-grow relative z-10 transition-all duration-300 transform">
                        <div className={`h-full transition-opacity duration-500 ${editorReady ? 'opacity-100' : 'opacity-0'}`}>
                            <Editor
                                height="100%"
                                width="100%"
                                language={language}
                                value={code}
                                theme={theme}
                                onChange={(e) => setCode(e)}
                                options={editorOptions}
                                onMount={handleEditorDidMount}
                                className={`transition-all duration-300 ${editorReady ? 'scale-100' : 'scale-95'}`}
                            />
                        </div>
                        
                        {/* Language syntax label */}
                        <div className={`absolute bottom-4 right-4 z-10 px-2 py-1 rounded text-xs font-medium ${languageConfig[language].bgColor} ${languageConfig[language].color} border border-gray-200 shadow-sm opacity-50 hover:opacity-100 transition-opacity duration-200`}>
                            {languageConfig[language].name}
                        </div>
                    </div>
                    
                    {/* Syntax hints
                    <div className="absolute bottom-4 left-4 z-10">
                        <div className="bg-white/70 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-500 border border-gray-200 shadow-sm">
                            Press <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-sm">Tab</kbd> for autocomplete
                        </div>
                    </div> */}

                    {/* Results Panel */}
                    <div className="border-t border-gray-200 bg-white overflow-y-auto" style={{ maxHeight: '40vh' }}>
                        {submitting ? (
                            <Executing text="Submitting" />
                        ) : (
                            <>
                                {submissionStatus ? (
                                    <SubmissionResult submissionStatus={submissionStatus} />
                                ) : (
                                    <>
                                        {executing ? (
                                            <Executing text="Executing" />
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
                            </>
                        )}
                    </div>
                </>
            )}
            
            {/* CSS for animations and effects */}
            <style jsx>{`
                /* Full screen styling */
                .fullscreen-mode {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw !important;
                    height: 100vh !important;
                    z-index: 9999;
                }
                
                /* Code grid pattern for background */
                .code-grid-pattern {
                    position: absolute;
                    inset: 0;
                    background-image: 
                        linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
                
                /* Typing animation */
                .typing-animation {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                    z-index: 20;
                    opacity: 0;
                    animation: fade-in-out 2s ease-in-out forwards;
                }
                
                .typing-animation::before {
                    content: "Initializing editor";
                    font-size: 1rem;
                    color: rgba(59, 130, 246, 0.7);
                    margin-right: 0.5rem;
                }
                
                .typing-animation::after {
                    content: "";
                    display: inline-block;
                    width: 6px;
                    height: 6px;
                    background-color: rgba(59, 130, 246, 0.7);
                    border-radius: 50%;
                    animation: typing-dots 1.4s infinite both;
                }
                
                @keyframes typing-dots {
                    0%, 100% {
                        box-shadow: 
                            12px 0 0 0 rgba(59, 130, 246, 0.2),
                            24px 0 0 0 rgba(59, 130, 246, 0.2);
                    }
                    25% {
                        box-shadow: 
                            12px 0 0 0 rgba(59, 130, 246, 0.7),
                            24px 0 0 0 rgba(59, 130, 246, 0.2);
                    }
                    50% {
                        box-shadow: 
                            12px 0 0 0 rgba(59, 130, 246, 0.2),
                            24px 0 0 0 rgba(59, 130, 246, 0.7);
                    }
                }
                
                @keyframes fade-in-out {
                    0% { opacity: 0; }
                    30% { opacity: 1; }
                    70% { opacity: 1; }
                    100% { opacity: 0; }
                }
                
                /* Animation for scale transitions */
                .scale-95 {
                    transform: scale(0.95);
                }
                
                .scale-100 {
                    transform: scale(1);
                }
            `}</style>
        </div>
    );
}

export default EditorBox;