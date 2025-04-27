import React from 'react';

const SubmissionResult = ({ submissionStatus }) => {
    if (!submissionStatus) {
        return null;
    }

    // Handling successful submission
    if (submissionStatus.statusCode === 200) {
        const isCorrect = !submissionStatus.data;
        
        if (isCorrect) {
            return (
                <div className="rounded-lg border border-green-200 bg-green-50 overflow-hidden">
                    <div className="px-4 py-3 bg-green-100 border-b border-green-200">
                        <div className="flex items-center">
                            <svg className="h-6 w-6 text-green-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-lg font-semibold text-green-800">All Test Cases Passed!</h2>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4">
                                    <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 mb-1">Great job!</h3>
                                <p className="text-gray-600">Your solution passed all the test cases.</p>
                            </div>
                        </div>
                        
                        <div className="mt-4 bg-white rounded-md border border-green-200 p-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">What's next?</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Try optimizing your solution for better time and space complexity
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Check out other problems to continue improving your skills
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Review the solution approaches to learn different methods
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        } else {
            // Incorrect submission with test case data
            return (
                <div className="rounded-lg border border-red-200 bg-red-50 overflow-hidden">
                    <div className="px-4 py-3 bg-red-100 border-b border-red-200">
                        <div className="flex items-center">
                            <svg className="h-6 w-6 text-red-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-lg font-semibold text-red-800">Test Case Failed</h2>
                        </div>
                    </div>
                    <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Your solution failed on the following test case:</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Input */}
                            <div>
                                <div className="flex items-center mb-1">
                                    <svg className="h-4 w-4 text-gray-500 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-xs font-medium uppercase text-gray-600">Input</span>
                                </div>
                                <pre className="bg-white border border-gray-200 text-gray-800 p-3 rounded-md text-sm whitespace-pre-wrap overflow-auto h-24">
                                    {submissionStatus.data.input}
                                </pre>
                            </div>

                            {/* Expected Output */}
                            <div>
                                <div className="flex items-center mb-1">
                                    <svg className="h-4 w-4 text-gray-500 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-xs font-medium uppercase text-gray-600">Expected Output</span>
                                </div>
                                <pre className="bg-white border border-gray-200 text-gray-800 p-3 rounded-md text-sm whitespace-pre-wrap overflow-auto h-24">
                                    {submissionStatus.data.expectedOutput}
                                </pre>
                            </div>

                            {/* Your Output */}
                            <div>
                                <div className="flex items-center mb-1">
                                    <svg className="h-4 w-4 text-gray-500 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    <span className="text-xs font-medium uppercase text-gray-600">Your Output</span>
                                </div>
                                <pre className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm whitespace-pre-wrap overflow-auto h-24">
                                    {submissionStatus.data.output}
                                </pre>
                            </div>
                        </div>
                        
                        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                            <h3 className="flex items-center text-sm font-medium text-yellow-800 mb-2">
                                <svg className="h-5 w-5 text-yellow-600 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Debugging Tips
                            </h3>
                            <ul className="ml-6 list-disc text-sm text-yellow-800 space-y-1">
                                <li>Check for edge cases in your solution</li>
                                <li>Ensure proper handling of different input formats</li>
                                <li>Verify your algorithm logic for this specific scenario</li>
                                <li>Look for off-by-one errors in loops or calculations</li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }
    } else {
        // Handling error cases (compilation error, runtime error, etc.)
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 overflow-hidden">
                <div className="px-4 py-3 bg-red-100 border-b border-red-200">
                    <div className="flex items-center">
                        <svg className="h-6 w-6 text-red-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h2 className="text-lg font-semibold text-red-800">
                            {submissionStatus.data === "Time Limit Exceeded" ? "Time Limit Exceeded" : "Compilation Error"}
                        </h2>
                    </div>
                </div>
                <div className="p-4">
                    <pre className="bg-white border border-red-200 text-red-800 p-4 rounded-md font-mono text-sm whitespace-pre-wrap overflow-auto max-h-96">
                        {typeof submissionStatus.data === 'string' ? submissionStatus.data : 'An error occurred during execution.'}
                    </pre>
                    
                    {submissionStatus.data === "Time Limit Exceeded" && (
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                            <h3 className="flex items-center text-sm font-medium text-yellow-800 mb-2">
                                <svg className="h-5 w-5 text-yellow-600 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                Tips for Optimizing
                            </h3>
                            <ul className="ml-6 list-disc text-sm text-yellow-800 space-y-1">
                                <li>Consider a more efficient algorithm with better time complexity</li>
                                <li>Check for unnecessary nested loops or redundant calculations</li>
                                <li>Use appropriate data structures (e.g., hash maps for O(1) lookups)</li>
                                <li>Avoid inefficient operations within loops</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }
};

export default SubmissionResult;