import React from 'react';

function Description({ problem }) {
    return (
        <div className="space-y-6">
            {/* Problem description */}
            <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{problem.description}</p>
            </div>
            
            {/* Input format */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-sm font-medium text-gray-700 flex items-center">
                        <svg className="mr-1.5 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                        </svg>
                        Input Format
                    </h2>
                </div>
                <div className="p-4 bg-white">
                    <p className="text-sm text-gray-700 whitespace-pre-line">{problem.input_format}</p>
                </div>
            </div>
            
            {/* Output format */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-sm font-medium text-gray-700 flex items-center">
                        <svg className="mr-1.5 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Output Format
                    </h2>
                </div>
                <div className="p-4 bg-white">
                    <p className="text-sm text-gray-700 whitespace-pre-line">{problem.output_format}</p>
                </div>
            </div>
            
            {/* Constraints */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-sm font-medium text-gray-700 flex items-center">
                        <svg className="mr-1.5 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        Constraints
                    </h2>
                </div>
                <div className="p-4 bg-white">
                    <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
                        {problem.constraints.map((constraint, index) => (
                            <li key={index}>{constraint}</li>
                        ))}
                    </ul>
                </div>
            </div>
            
            {/* Example cases */}
            <div className="space-y-4">
                <h2 className="text-sm font-medium text-gray-700">Examples</h2>
                {problem.example_cases && problem.example_cases.map((example, index) => (
                    <div key={index} className="rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-700">Example {index + 1}</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                            <div className="p-4 bg-white">
                                <p className="text-xs uppercase font-medium text-gray-500 mb-2">Input:</p>
                                <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded border border-gray-200">{example.input}</pre>
                            </div>
                            <div className="p-4 bg-white">
                                <p className="text-xs uppercase font-medium text-gray-500 mb-2">Output:</p>
                                <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded border border-gray-200">{example.output}</pre>
                            </div>
                        </div>
                        {example.explanation && (
                            <div className="p-4 bg-gray-50 border-t border-gray-200">
                                <p className="text-xs uppercase font-medium text-gray-500 mb-2">Explanation:</p>
                                <p className="text-sm text-gray-700 italic">{example.explanation}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Description;