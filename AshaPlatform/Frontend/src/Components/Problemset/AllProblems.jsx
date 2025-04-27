import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProblemsService } from '../../Services/Problem.service';
import { getSolvedProblemService } from '../../Services/Submissions.service.js';
import Loading from '../Loading/Loading.jsx';

const AllProblems = () => {
    const [solvedProblems, setSolvedProblems] = useState(new Set());
    const [problems, setProblems] = useState(null);
    const [filteredProblems, setFilteredProblems] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('asc');
    const [sortField, setSortField] = useState('id');
    const [isLoading, setIsLoading] = useState(true);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    
    // Refs for animation elements
    const containerRef = useRef(null);
    const navigate = useNavigate();

    // Config for difficulty levels
    const difficultyConfig = {
        easy: {
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            borderColor: 'border-green-200',
            gradientFrom: 'from-green-500',
            gradientTo: 'to-emerald-400',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        medium: {
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
            borderColor: 'border-yellow-200',
            gradientFrom: 'from-yellow-500',
            gradientTo: 'to-amber-400',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        hard: {
            color: 'text-red-600',
            bgColor: 'bg-red-100',
            borderColor: 'border-red-200',
            gradientFrom: 'from-red-500',
            gradientTo: 'to-rose-400',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const response1 = await getAllProblemsService();
            const response2 = await getSolvedProblemService();
            
            if (response1) {
                // Add a numeric ID for sorting
                const problemsWithId = response1.map((problem, index) => ({
                    ...problem,
                    id: index + 1
                }));
                setProblems(problemsWithId);
            }
            
            if (response2) setSolvedProblems(response2);
            
            // Add delay for loading animation
            setTimeout(() => {
                setIsLoading(false);
                
                // Start entry animations after loading
                setTimeout(() => {
                    setAnimationComplete(true);
                }, 300);
            }, 800);
        };
        
        fetchData();
        
        // Create animated background elements
        const createBackgroundElements = () => {
            if (containerRef.current) {
                // Remove any existing elements first
                const existingElements = containerRef.current.querySelectorAll('.bg-particle');
                existingElements.forEach(el => el.remove());
                
                // Create new elements
                for (let i = 0; i < 8; i++) {
                    const element = document.createElement('div');
                    element.className = 'bg-particle';
                    
                    // Randomize size, position, and animation duration
                    const size = Math.random() * 300 + 100;
                    element.style.width = `${size}px`;
                    element.style.height = `${size}px`;
                    element.style.left = `${Math.random() * 100}%`;
                    element.style.top = `${Math.random() * 100}%`;
                    element.style.animationDuration = `${Math.random() * 50 + 30}s`;
                    element.style.animationDelay = `${Math.random() * 5}s`;
                    
                    containerRef.current.appendChild(element);
                }
            }
        };
        
        if (!isLoading) {
            createBackgroundElements();
        }
        
    }, []);

    useEffect(() => {
        if (!problems) return;
        
        let result = [...problems];
        
        // Apply search filter
        if (searchTerm) {
            result = result.filter(problem => 
                problem.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Apply difficulty filter
        if (difficultyFilter !== 'all') {
            result = result.filter(problem => problem.difficulty === difficultyFilter);
        }
        
        // Apply status filter
        if (statusFilter === 'solved') {
            result = result.filter(problem => solvedProblems.has(problem._id));
        } else if (statusFilter === 'unsolved') {
            result = result.filter(problem => !solvedProblems.has(problem._id));
        }
        
        // Apply sorting
        result.sort((a, b) => {
            if (sortField === 'id') {
                return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
            } else if (sortField === 'title') {
                return sortOrder === 'asc' 
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            } else if (sortField === 'difficulty') {
                const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
                return sortOrder === 'asc' 
                    ? difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
                    : difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
            }
            return 0;
        });
        
        setFilteredProblems(result);
    }, [problems, searchTerm, difficultyFilter, statusFilter, sortOrder, sortField, solvedProblems]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleRowClick = (problem, index) => {
        setSelectedRow(index);
        
        // Delay navigation to allow for animation
        setTimeout(() => {
            navigate(`/problems/${problem._id}`, { state: { solved: solvedProblems.has(problem._id) } });
        }, 300);
    };

    if (isLoading) return <Loading />;

    return (
        <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background particles */}
            
            {/* Header section with title and stats */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="text-center mb-6 relative overflow-hidden">
                    <h1 className="inline-block text-3xl font-bold relative">
                        <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                            Problem Set
                        </span>
                        {/* Underline animation */}
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 transform origin-left scale-x-100"></span>
                    </h1>
                    
                    <p className="mt-3 max-w-2xl mx-auto text-gray-600 relative z-10">
                        Enhance your coding skills with our curated collection of algorithmic challenges.
                        Track your progress and improve your problem-solving abilities.
                    </p>
                </div>
                
                {/* Stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-blue-100 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 flex items-center">
                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Total Problems</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {problems ? problems.length : 0}
                                </div>
                            </div>
                        </div>
                        
                        {/* Animated dots */}
                        <div className="absolute top-0 right-0 w-1 h-1 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
                        <div className="absolute bottom-0 left-0 w-1 h-1 rounded-full bg-indigo-400 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300 delay-150"></div>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-green-100 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 flex items-center">
                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 text-green-600 mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Solved Problems</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {solvedProblems.size}
                                </div>
                            </div>
                        </div>
                        
                        {/* Animated dots */}
                        <div className="absolute top-0 right-0 w-1 h-1 rounded-full bg-green-400 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
                        <div className="absolute bottom-0 left-0 w-1 h-1 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300 delay-150"></div>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 flex items-center">
                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 text-purple-600 mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Progress</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {problems ? Math.round((solvedProblems.size / problems.length) * 100) : 0}%
                                </div>
                            </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                style={{ width: `${problems ? (solvedProblems.size / problems.length) * 100 : 0}%` }}
                            ></div>
                        </div>
                        
                        {/* Animated dots */}
                        <div className="absolute top-0 right-0 w-1 h-1 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
                        <div className="absolute bottom-0 left-0 w-1 h-1 rounded-full bg-pink-400 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300 delay-150"></div>
                    </div>
                </div>
                
                {/* Filters */}
                <div 
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-200 mb-6 transform transition-all duration-700 ease-out-cubic"
                    style={{
                        opacity: animationComplete ? 1 : 0,
                        transform: animationComplete ? 'translateY(0)' : 'translateY(-20px)'
                    }}
                >
                    <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                        <div className="relative flex-grow max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search problems..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            
                            {/* Search animation */}
                            {searchTerm && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button 
                                        onClick={() => setSearchTerm('')}
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                    >
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                            <select
                                className="block px-3 py-2 border border-gray-200 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                value={difficultyFilter}
                                onChange={(e) => setDifficultyFilter(e.target.value)}
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                    backgroundPosition: `right 0.5rem center`,
                                    backgroundRepeat: `no-repeat`,
                                    backgroundSize: `1.5em 1.5em`,
                                    paddingRight: `2.5rem`
                                }}
                            >
                                <option value="all">All Difficulties</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                            
                            <select
                                className="block px-3 py-2 border border-gray-200 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                    backgroundPosition: `right 0.5rem center`,
                                    backgroundRepeat: `no-repeat`,
                                    backgroundSize: `1.5em 1.5em`,
                                    paddingRight: `2.5rem`
                                }}
                            >
                                <option value="all">All Status</option>
                                <option value="solved">Solved</option>
                                <option value="unsolved">Unsolved</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                {/* Problem table */}
                <div 
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 overflow-hidden transform transition-all duration-1000 ease-out-cubic"
                    style={{
                        opacity: animationComplete ? 1 : 0,
                        transform: animationComplete ? 'translateY(0)' : 'translateY(20px)'
                    }}
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/80">
                                <tr>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                        onClick={() => handleSort('id')}
                                    >
                                        <div className="flex items-center group">
                                            #
                                            <span className="ml-1 text-gray-400 group-hover:text-gray-500">
                                                {sortField === 'id' && (
                                                    sortOrder === 'asc' ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    )
                                                )}
                                            </span>
                                        </div>
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                        onClick={() => handleSort('title')}
                                    >
                                        <div className="flex items-center group">
                                            Title
                                            <span className="ml-1 text-gray-400 group-hover:text-gray-500">
                                                {sortField === 'title' && (
                                                    sortOrder === 'asc' ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    )
                                                )}
                                            </span>
                                        </div>
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                        onClick={() => handleSort('difficulty')}
                                    >
                                        <div className="flex items-center group">
                                            Difficulty
                                            <span className="ml-1 text-gray-400 group-hover:text-gray-500">
                                                {sortField === 'difficulty' && (
                                                    sortOrder === 'asc' ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    )
                                                )}
                                            </span>
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredProblems && filteredProblems.length > 0 ? (
                                    filteredProblems.map((problem, index) => (
                                        <tr 
                                            key={problem._id} 
                                            className={`transition-all duration-300 hover:bg-blue-50 cursor-pointer ${
                                                selectedRow === index ? 'bg-blue-50 scale-98 opacity-80' : ''
                                            }`}
                                            onClick={() => handleRowClick(problem, index)}
                                            style={{
                                                animationDelay: `${index * 0.05}s`,
                                                opacity: animationComplete ? 1 : 0,
                                                transform: animationComplete 
                                                    ? 'translateY(0)' 
                                                    : `translateY(${20 + index * 5}px)`
                                            }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <div className="flex items-center">
                                                    <span className="bg-gray-100 text-gray-700 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold">
                                                        {problem.id}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200">
                                                    {problem.title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                    difficultyConfig[problem.difficulty].bgColor
                                                } ${difficultyConfig[problem.difficulty].borderColor} ${
                                                    difficultyConfig[problem.difficulty].color
                                                }`}>
                                                    <span className="mr-1.5">{difficultyConfig[problem.difficulty].icon}</span>
                                                    {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {solvedProblems.has(problem._id) ? (
                                                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600 relative group">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        
                                                        {/* Tooltip */}
                                                        <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-24 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                            Solved
                                                            <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                                                        </div>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-400 relative group">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        
                                                        {/* Tooltip */}
                                                        <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-24 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                            Not solved yet
                                                            <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                                                        </div>
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center">
                                            <div className="flex flex-col items-center">
                                                <svg className="h-12 w-12 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <h3 className="text-lg font-medium text-gray-900 mb-1">No problems found</h3>
                                                <p className="text-gray-500 max-w-md">
                                                    {searchTerm 
                                                        ? `No problems match your search "${searchTerm}". Try a different search term or remove filters.`
                                                        : "No problems match your current filters. Try adjusting your filter criteria."
                                                    }
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {/* CSS for animated elements */}
            <style jsx>{`
                /* Background particles */
                .bg-particle {
                    position: absolute;
                    border-radius: 50%;
                    background: linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(79, 70, 229, 0.05));
                    filter: blur(40px);
                    z-index: 0;
                    animation: float-around linear infinite;
                }
                
                @keyframes float-around {
                    0% {
                        transform: translate(0, 0) rotate(0deg);
                    }
                    25% {
                        transform: translate(5%, -5%) rotate(90deg);
                    }
                    50% {
                        transform: translate(0, -10%) rotate(180deg);
                    }
                    75% {
                        transform: translate(-5%, -5%) rotate(270deg);
                    }
                    100% {
                        transform: translate(0, 0) rotate(360deg);
                    }
                }
                
                /* Row hover scale animation */
                .scale-98 {
                    transform: scale(0.98);
                }
                
                /* Smooth ease cubic for animations */
                .ease-out-cubic {
                    transition-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
                }
            `}</style>
        </div>
    );
};

export default AllProblems;