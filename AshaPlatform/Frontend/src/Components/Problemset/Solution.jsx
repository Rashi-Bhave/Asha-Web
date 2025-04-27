import React, { useState } from 'react';

function Solution({ solution }) {
    const [openSolution, setOpenSolution] = useState(null);
    
    const toggleSolution = (lang) => {
        setOpenSolution((prev) => (prev === lang ? null : lang));
    };
    
    // Language display names and icons
    const languageConfig = {
        cpp: { name: 'C++', icon: '⚙️' },
        c: { name: 'C', icon: '🔧' },
        java: { name: 'Java', icon: '☕' },
        python: { name: 'Python', icon: '🐍' },
        javascript: { name: 'JavaScript', icon: '🟨' }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Solution Approaches</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Select a language to view the solution code
                    </p>
                </div>
                
                <div className="divide-y divide-gray-200">
                    {Object.keys(solution).map((lang, index) => (
                        <div key={index} className="transition-colors duration-200">
                            <button 
                                onClick={() => toggleSolution(lang)}
                                className={`w-full px-6 py-4 flex items-center justify-between text-left transition-colors duration-200 ${
                                    openSolution === lang ? 'bg-blue-50' : 'hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center">
                                    <span className="text-xl mr-3">{languageConfig[lang]?.icon || '📄'}</span>
                                    <span className="font-medium text-gray-900">
                                        {languageConfig[lang]?.name || lang.toUpperCase()} Solution
                                    </span>
                                </div>
                                <svg 
                                    className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                                        openSolution === lang ? 'transform rotate-180' : ''
                                    }`}
                                    xmlns="http://www.w3.org/2000/svg" 
                                    viewBox="0 0 20 20" 
                                    fill="currentColor"
                                >
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            
                            {openSolution === lang && (
                                <div className="px-6 py-4 bg-gray-50">
                                    <div className="relative">
                                        <div className="absolute top-0 right-0 p-2 flex space-x-2">
                                            <button 
                                                className="p-1.5 rounded-md bg-white text-gray-500 hover:text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                                                onClick={() => navigator.clipboard.writeText(solution[lang])}
                                                title="Copy code"
                                            >
                                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                        </div>
                                        <pre className="mt-2 p-4 bg-gray-900 text-gray-100 rounded-md overflow-auto text-sm font-mono whitespace-pre leading-6 max-h-[600px]">
                                            {solution[lang]}
                                        </pre>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Key Insights</h3>
                                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                            <li>Pay attention to the approach used to solve this problem efficiently</li>
                                            <li>Notice how the code handles edge cases</li>
                                            <li>Study the time and space complexity of this solution</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                {Object.keys(solution).length === 0 && (
                    <div className="px-6 py-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No solutions available</h3>
                        <p className="mt-1 text-sm text-gray-500">Try solving this problem on your own first!</p>
                    </div>
                )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Learning Tip</h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <p>
                                Try to understand the solution before implementing it yourself. Think about why certain approaches were chosen and how you might optimize them further.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Solution;