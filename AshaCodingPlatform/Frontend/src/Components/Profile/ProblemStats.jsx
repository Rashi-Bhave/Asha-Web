import React from 'react';

function ProblemStats({ user }) {
    // Total problems in each category (this could be fetched from the backend)
    const problems = {
        easy: 2,
        medium: 2,
        hard: 2,
    };
    
    // Calculate percentages
    const percentages = {
        easy: Math.round((user.easyCount / problems.easy) * 100) || 0,
        medium: Math.round((user.mediumCount / problems.medium) * 100) || 0,
        hard: Math.round((user.hardCount / problems.hard) * 100) || 0,
        total: Math.round(((user.easyCount + user.mediumCount + user.hardCount) / 
                          (problems.easy + problems.medium + problems.hard)) * 100) || 0
    };

    return (
        <div className="space-y-6">
            {/* Overall progress */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-700">Total Progress</h3>
                    <span className="text-sm font-medium text-gray-700">{percentages.total}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percentages.total}%` }}
                    ></div>
                </div>
            </div>

            {/* Difficulty breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Easy problems */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-700 flex items-center">
                            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                            Easy
                        </h3>
                        <span className="text-sm font-medium text-gray-700">{user.easyCount} / {problems.easy}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${percentages.easy}%` }}
                        ></div>
                    </div>
                </div>

                {/* Medium problems */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-700 flex items-center">
                            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                            Medium
                        </h3>
                        <span className="text-sm font-medium text-gray-700">{user.mediumCount} / {problems.medium}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className="bg-yellow-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${percentages.medium}%` }}
                        ></div>
                    </div>
                </div>

                {/* Hard problems */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-700 flex items-center">
                            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                            Hard
                        </h3>
                        <span className="text-sm font-medium text-gray-700">{user.hardCount} / {problems.hard}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className="bg-red-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${percentages.hard}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Problem solving radar chart - would be better with a real chart library */}
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <div className="text-center mb-4">
                    <h3 className="text-sm font-medium text-gray-700">Skill Distribution</h3>
                </div>
                <div className="flex justify-center">
                    <div className="relative w-48 h-48">
                        {/* Base hexagon shape */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-36 h-36 border-2 border-gray-200 rounded-full"></div>
                            <div className="absolute w-24 h-24 border-2 border-gray-200 rounded-full"></div>
                            <div className="absolute w-12 h-12 border-2 border-gray-200 rounded-full"></div>
                        </div>
                        
                        {/* Skill points */}
                        <div className="absolute inset-0">
                            {/* Easy */}
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="relative">
                                    <div 
                                        className="absolute h-[72px] w-1 bg-green-500 origin-bottom transform rotate-0"
                                        style={{ height: `${(percentages.easy / 100) * 72}px` }}
                                    ></div>
                                    <div className="absolute top-0 -translate-x-1/2 transform -translate-y-8 text-xs font-medium text-gray-700">Easy</div>
                                </div>
                            </div>
                            
                            {/* Medium */}
                            <div className="absolute bottom-1/4 right-0 transform translate-x-1/2">
                                <div className="relative">
                                    <div 
                                        className="absolute h-[72px] w-1 bg-yellow-500 origin-bottom transform rotate-120"
                                        style={{ height: `${(percentages.medium / 100) * 72}px` }}
                                    ></div>
                                    <div className="absolute right-0 transform translate-x-8 -translate-y-2 text-xs font-medium text-gray-700">Medium</div>
                                </div>
                            </div>
                            
                            {/* Hard */}
                            <div className="absolute bottom-1/4 left-0 transform -translate-x-1/2">
                                <div className="relative">
                                    <div 
                                        className="absolute h-[72px] w-1 bg-red-500 origin-bottom transform -rotate-120"
                                        style={{ height: `${(percentages.hard / 100) * 72}px` }}
                                    ></div>
                                    <div className="absolute left-0 transform -translate-x-8 -translate-y-2 text-xs font-medium text-gray-700">Hard</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProblemStats;