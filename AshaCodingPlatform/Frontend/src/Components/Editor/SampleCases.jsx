import React, { useState } from 'react';

function SampleCases({ example_cases }) {
    const [visibleIndex, setVisibleIndex] = useState(0);
    
    return (
        <div className="cyber-sample-container">
            <div className="cyber-panel-header">
                <h3 className="cyber-panel-title">
                    <svg className="mr-2 h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Reference Test Vectors
                </h3>
                
                <div className="cyber-stats">
                    <div className="cyber-stats-badge">
                        <span className="cyber-stats-count">{example_cases.length}</span>
                        <span className="cyber-stats-label">{example_cases.length === 1 ? 'vector' : 'vectors'}</span>
                    </div>
                </div>
            </div>
            
            {/* Test case navigation */}
            <div className="cyber-tabs">
                {example_cases.map((x, index) => (
                    <button 
                        key={index} 
                        className={`cyber-tab ${visibleIndex === index ? 'cyber-tab-active' : ''}`}
                        onClick={() => setVisibleIndex(index)}
                    >
                        Vector {index + 1}
                    </button>
                ))}
            </div>
            
            {/* Test case details */}
            {example_cases.map((example, index) =>
                visibleIndex === index ? (
                    <div key={index} className="cyber-case">
                        <div className="cyber-case-header">
                            <h4 className="cyber-case-title">
                                <svg className="mr-1.5 h-4 w-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                                Reference Vector {index + 1}
                            </h4>
                        </div>
                        
                        <div className="cyber-case-body">
                            <div className="cyber-case-grid">
                                {/* Input */}
                                <div className="cyber-case-cell">
                                    <div className="cyber-data-label">
                                        <svg className="h-4 w-4 text-cyan-400 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>INPUT STREAM</span>
                                    </div>
                                    <pre className="cyber-data-content">
                                        {example.input}
                                    </pre>
                                </div>
                                
                                {/* Expected Output */}
                                <div className="cyber-case-cell">
                                    <div className="cyber-data-label">
                                        <svg className="h-4 w-4 text-cyan-400 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>EXPECTED RESPONSE</span>
                                    </div>
                                    <pre className="cyber-data-content">
                                        {example.output}
                                    </pre>
                                </div>
                            </div>
                            
                            {/* Explanation (if available) */}
                            {example.explanation && (
                                <div className="cyber-explanation">
                                    <div className="cyber-explanation-header">
                                        <svg className="h-4 w-4 text-cyan-400 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>ANALYTICAL NOTES</span>
                                    </div>
                                    <p className="cyber-explanation-content">
                                        {example.explanation}
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        {/* Decorative elements */}
                        <div className="cyber-corner cyber-corner-tl"></div>
                        <div className="cyber-corner cyber-corner-tr"></div>
                        <div className="cyber-corner cyber-corner-bl"></div>
                        <div className="cyber-corner cyber-corner-br"></div>
                        <div className="cyber-scan-line"></div>
                    </div>
                ) : null
            )}
            
            {/* Tips section */}
            <div className="cyber-tips">
                <h4 className="cyber-tips-header">
                    <svg className="h-5 w-5 text-yellow-500 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Strategic Protocol Guidelines
                </h4>
                <ul className="cyber-tips-list">
                    <li>Analyze input format specifications before initiating solution sequence</li>
                    <li>Utilize reference vectors for algorithmic validation</li>
                    <li>Account for edge case scenarios not represented in sample vectors</li>
                    <li>Consider generating additional test vectors to enhance solution resilience</li>
                </ul>
                
                {/* Decorative elements */}
                <div className="cyber-corner cyber-corner-tl"></div>
                <div className="cyber-corner cyber-corner-tr"></div>
                <div className="cyber-corner cyber-corner-bl"></div>
                <div className="cyber-corner cyber-corner-br"></div>
                <div className="cyber-scan-line"></div>
            </div>
            
            {/* CSS for cyberpunk styling */}
            <style jsx>{`
                .cyber-sample-container {
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .cyber-panel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                }
                
                .cyber-panel-title {
                    display: flex;
                    align-items: center;
                    color: rgb(6, 182, 212);
                    font-size: 0.9rem;
                    font-weight: 500;
                    letter-spacing: 0.05em;
                }
                
                .cyber-stats {
                    display: flex;
                    align-items: center;
                }
                
                .cyber-stats-badge {
                    display: flex;
                    align-items: center;
                    background: rgba(15, 23, 42, 0.7);
                    border: 1px solid rgba(6, 182, 212, 0.3);
                    border-radius: 0.25rem;
                    padding: 0.25rem 0.5rem;
                }
                
                .cyber-stats-count {
                    color: rgb(6, 182, 212);
                    font-weight: 600;
                    margin-right: 0.25rem;
                }
                
                .cyber-stats-label {
                    color: rgba(226, 232, 240, 0.7);
                    font-size: 0.75rem;
                }
                
                .cyber-tabs {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }
                
                .cyber-tab {
                    padding: 0.375rem 0.75rem;
                    background: rgba(15, 23, 42, 0.7);
                    border: 1px solid rgba(6, 182, 212, 0.3);
                    border-radius: 0.25rem;
                    color: rgba(226, 232, 240, 0.7);
                    font-size: 0.8rem;
                    transition: all 0.2s;
                }
                
                .cyber-tab:hover {
                    background: rgba(15, 23, 42, 0.9);
                    border-color: rgba(6, 182, 212, 0.5);
                    color: rgb(226, 232, 240);
                    box-shadow: 0 0 8px rgba(6, 182, 212, 0.3);
                }
                
                .cyber-tab-active {
                    background: rgba(6, 182, 212, 0.15);
                    border-color: rgba(6, 182, 212, 0.5);
                    color: rgb(6, 182, 212);
                    box-shadow: 0 0 8px rgba(6, 182, 212, 0.3);
                }
                
                .cyber-case {
                    position: relative;
                    background: rgba(15, 23, 42, 0.7);
                    border: 1px solid rgba(6, 182, 212, 0.3);
                    border-radius: 0.5rem;
                    padding: 1rem;
                    margin-bottom: 1rem;
                    backdrop-filter: blur(10px);
                    box-shadow: 
                        0 4px 6px -1px rgba(0, 0, 0, 0.1),
                        0 2px 4px -1px rgba(0, 0, 0, 0.06),
                        0 0 0 1px rgba(6, 182, 212, 0.1) inset,
                        0 0 20px rgba(6, 182, 212, 0.1);
                    overflow: hidden;
                }
                
                .cyber-case-header {
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid rgba(226, 232, 240, 0.1);
                    margin-bottom: 1rem;
                }
                
                .cyber-case-title {
                    display: flex;
                    align-items: center;
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: rgb(226, 232, 240);
                }
                
                .cyber-case-body {
                    padding: 0.5rem 0;
                }
                
                .cyber-case-grid {
                    display: grid;
                    grid-template-columns: repeat(1, minmax(0, 1fr));
                    gap: 1rem;
                }
                
                @media (min-width: 768px) {
                    .cyber-case-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }
                
                .cyber-case-cell {
                    display: flex;
                    flex-direction: column;
                }
                
                .cyber-data-label {
                    display: flex;
                    align-items: center;
                    margin-bottom: 0.25rem;
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    color: rgba(6, 182, 212, 0.8);
                }
                
                .cyber-data-content {
                    flex-grow: 1;
                    background: rgba(15, 23, 42, 0.5);
                    border: 1px solid rgba(6, 182, 212, 0.2);
                    border-radius: 0.25rem;
                    padding: 0.75rem;
                    color: rgb(226, 232, 240);
                    font-size: 0.8rem;
                    white-space: pre-wrap;
                    overflow: auto;
                    max-height: 12rem;
                }
                
                .cyber-explanation {
                    margin-top: 1rem;
                    padding: 0.75rem;
                    background: rgba(6, 182, 212, 0.1);
                    border: 1px solid rgba(6, 182, 212, 0.3);
                    border-radius: 0.25rem;
                }
                
                .cyber-explanation-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 0.5rem;
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    color: rgba(6, 182, 212, 0.8);
                }
                
                .cyber-explanation-content {
                    font-size: 0.8rem;
                    color: rgb(226, 232, 240);
                    font-style: italic;
                }
                
                .cyber-tips {
                    position: relative;
                    background: rgba(234, 179, 8, 0.1);
                    border: 1px solid rgba(234, 179, 8, 0.3);
                    border-radius: 0.5rem;
                    padding: 1rem;
                    overflow: hidden;
                }
                
                .cyber-tips-header {
                    display: flex;
                    align-items: center;
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: rgb(234, 179, 8);
                    margin-bottom: 0.75rem;
                }
                
                .cyber-tips-list {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    color: rgba(226, 232, 240, 0.8);
                    font-size: 0.8rem;
                }
                
                .cyber-tips-list li {
                    margin-bottom: 0.5rem;
                }
                
                /* Cyber corners */
                .cyber-corner {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    z-index: 1;
                }
                
                .cyber-corner-tl {
                    top: 2px;
                    left: 2px;
                    border-top: 1px solid rgb(6, 182, 212);
                    border-left: 1px solid rgb(6, 182, 212);
                }
                
                .cyber-corner-tr {
                    top: 2px;
                    right: 2px;
                    border-top: 1px solid rgb(6, 182, 212);
                    border-right: 1px solid rgb(6, 182, 212);
                }
                
                .cyber-corner-bl {
                    bottom: 2px;
                    left: 2px;
                    border-bottom: 1px solid rgb(6, 182, 212);
                    border-left: 1px solid rgb(6, 182, 212);
                }
                
                .cyber-corner-br {
                    bottom: 2px;
                    right: 2px;
                    border-bottom: 1px solid rgb(6, 182, 212);
                    border-right: 1px solid rgb(6, 182, 212);
                }
                
                .cyber-tips .cyber-corner-tl,
                .cyber-tips .cyber-corner-tr,
                .cyber-tips .cyber-corner-bl,
                .cyber-tips .cyber-corner-br {
                    border-color: rgb(234, 179, 8);
                }
                
                .cyber-scan-line {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.8), transparent);
                    animation: scan-line 3s linear infinite;
                    opacity: 0.5;
                }
                
                .cyber-tips .cyber-scan-line {
                    background: linear-gradient(90deg, transparent, rgba(234, 179, 8, 0.8), transparent);
                }
                
                @keyframes scan-line {
                    0% { top: 0; }
                    100% { top: 100%; }
                }
            `}</style>
        </div>
    );
}

export default SampleCases;