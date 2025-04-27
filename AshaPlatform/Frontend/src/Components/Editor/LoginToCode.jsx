import React from 'react';
import { Link } from 'react-router-dom';

function LoginToCode() {
    return (
        <div className="flex items-center justify-center h-full bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center">
                <div className="bg-white shadow-sm rounded-lg p-8 border border-gray-200">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                        <svg className="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-gray-600 mb-8">Please log in to access the code editor and start coding.</p>
                    
                    <div className="space-y-4">
                        <Link 
                            to="/login"
                            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1v-2a1 1 0 00-2 0v1H4V5h8v1a1 1 0 002 0V4a1 1 0 00-1-1H3z" clipRule="evenodd" />
                                <path d="M13 7h5v2h-5V7z" />
                            </svg>
                            Login Now
                        </Link>
                        
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">or</span>
                            </div>
                        </div>
                        
                        <Link 
                            to="/register"
                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                            </svg>
                            Create Account
                        </Link>
                    </div>
                </div>
                
                <div className="mt-6">
                    <Link to="/" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center">
                        <svg className="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Home
                    </Link>
                </div>
                
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3 text-left">
                            <h3 className="text-sm font-medium text-blue-800">Why login?</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>
                                    Logging in allows you to save your progress, submit your solutions, and track your performance across the platform.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginToCode;