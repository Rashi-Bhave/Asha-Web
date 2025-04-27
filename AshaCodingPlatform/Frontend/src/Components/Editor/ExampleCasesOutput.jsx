import React, { useState } from 'react';

function ExampleCasesOutput({ exampleCasesExecution }) {
  const [visibleIndex, setVisibleIndex] = useState(0);

  if (exampleCasesExecution.statusCode === 403) {
    return (
      <div className="cyber-error-panel">
        <div className="cyber-error-header">
          <svg className="h-6 w-6 text-red-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="cyber-error-title">Execution Failure</h2>
        </div>
        <div className="cyber-error-content">
          {exampleCasesExecution.data}
        </div>
        
        {/* Decorative elements */}
        <div className="cyber-corner cyber-corner-tl"></div>
        <div className="cyber-corner cyber-corner-tr"></div>
        <div className="cyber-corner cyber-corner-bl"></div>
        <div className="cyber-corner cyber-corner-br"></div>
        <div className="cyber-scan-line"></div>
      </div>
    );
  }

  return (
    <div className="cyber-results-container">
      <h3 className="cyber-section-title">
        <svg className="mr-2 h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Quantum Execution Results
      </h3>
      
      {/* Test case tabs */}
      <div className="cyber-tabs-container">
        {exampleCasesExecution.data.map((execution, index) => (
          <button
            key={index}
            className={`cyber-tab ${
              visibleIndex === index
                ? execution.isMatch 
                  ? 'cyber-tab-success' 
                  : 'cyber-tab-error'
                : ''
            }`}
            onClick={() => setVisibleIndex(index)}
          >
            {execution.isMatch ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            Vector {index + 1}
          </button>
        ))}
      </div>

      {/* Test case details */}
      {exampleCasesExecution.data.map((execution, index) =>
        visibleIndex === index ? (
          <div
            key={index}
            className={`cyber-test-result ${
              execution.isMatch ? 'cyber-test-success' : 'cyber-test-error'
            }`}
          >
            <div className="cyber-test-header">
              <h4 className="cyber-test-title">
                {execution.isMatch ? (
                  <svg className="h-5 w-5 mr-1.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 mr-1.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                Test Vector {index + 1} - {execution.isMatch ? 'VALIDATED' : 'ANOMALY DETECTED'}
              </h4>
            </div>

            <div className="cyber-test-body">
              <div className="cyber-test-grid">
                {/* Input */}
                <div className="cyber-test-cell">
                  <div className="cyber-data-label">
                    <svg className="h-4 w-4 text-cyan-500 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>INPUT STREAM</span>
                  </div>
                  <pre className="cyber-data-content">
                    {execution.input}
                  </pre>
                </div>

                {/* Expected Output */}
                <div className="cyber-test-cell">
                  <div className="cyber-data-label">
                    <svg className="h-4 w-4 text-cyan-500 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>EXPECTED RESPONSE</span>
                  </div>
                  <pre className="cyber-data-content">
                    {execution.expectedOutput}
                  </pre>
                </div>

                {/* Actual Output */}
                <div className="cyber-test-cell">
                  <div className="cyber-data-label">
                    <svg className="h-4 w-4 text-cyan-500 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <span>ACTUAL OUTPUT</span>
                  </div>
                  <pre className={`cyber-data-content ${
                    execution.isMatch
                      ? 'cyber-data-success'
                      : 'cyber-data-error'
                  }`}>
                    {execution.actualOutput}
                  </pre>
                </div>
              </div>
              
              {!execution.isMatch && (
                <div className="cyber-debug-tips">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="cyber-debug-content">
                      <p className="cyber-debug-title">DEBUG PROTOCOL</p>
                      <ul className="cyber-debug-list">
                        <li>Check for whitespace or formatting anomalies</li>
                        <li>Verify boundary condition handling</li>
                        <li>Review algorithm logic path</li>
                      </ul>
                    </div>
                  </div>
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
      
      {/* CSS for cyberpunk styling */}
      <style jsx>{`
        .cyber-results-container {
          margin-top: 1rem;
        }
        
        .cyber-section-title {
          display: flex;
          align-items: center;
          font-size: 0.9rem;
          font-weight: 500;
          color: rgb(6, 182, 212);
          margin-bottom: 1rem;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.05em;
        }
        
        .cyber-tabs-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .cyber-tab {
          display: flex;
          align-items: center;
          padding: 0.5rem 0.75rem;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          color: rgb(226, 232, 240);
          font-size: 0.85rem;
          font-family: 'JetBrains Mono', monospace;
          transition: all 0.2s;
        }
        
        .cyber-tab:hover {
          background: rgba(15, 23, 42, 0.9);
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.3);
        }
        
        .cyber-tab-success {
          background: rgba(22, 101, 52, 0.3);
          border-color: rgba(34, 197, 94, 0.4);
          color: rgb(74, 222, 128);
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.2);
        }
        
        .cyber-tab-error {
          background: rgba(127, 29, 29, 0.3);
          border-color: rgba(220, 38, 38, 0.4);
          color: rgb(248, 113, 113);
          box-shadow: 0 0 8px rgba(220, 38, 38, 0.2);
        }
        
        .cyber-test-result {
          position: relative;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          overflow: hidden;
          backdrop-filter: blur(10px);
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 0 0 1px rgba(6, 182, 212, 0.1) inset,
            0 0 20px rgba(6, 182, 212, 0.1);
          padding: 1rem;
        }
        
        .cyber-test-success {
          border-color: rgba(34, 197, 94, 0.3);
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 0 0 1px rgba(34, 197, 94, 0.1) inset,
            0 0 20px rgba(34, 197, 94, 0.1);
        }
        
        .cyber-test-error {
          border-color: rgba(220, 38, 38, 0.3);
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 0 0 1px rgba(220, 38, 38, 0.1) inset,
            0 0 20px rgba(220, 38, 38, 0.1);
        }
        
        .cyber-test-header {
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(226, 232, 240, 0.1);
          margin-bottom: 1rem;
        }
        
        .cyber-test-title {
          display: flex;
          align-items: center;
          font-size: 0.9rem;
          font-weight: 500;
          color: rgb(226, 232, 240);
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.05em;
        }
        
        .cyber-test-body {
          padding: 0.5rem 0;
        }
        
        .cyber-test-grid {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 1rem;
        }
        
        @media (min-width: 768px) {
          .cyber-test-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        
        .cyber-test-cell {
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
          font-family: 'JetBrains Mono', monospace;
        }
        
        .cyber-data-content {
          flex-grow: 1;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.25rem;
          padding: 0.75rem;
          color: rgb(226, 232, 240);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          white-space: pre-wrap;
          overflow: auto;
          height: 6rem;
        }
        
        .cyber-data-success {
          border-color: rgba(34, 197, 94, 0.3);
          background: rgba(22, 101, 52, 0.1);
          color: rgb(134, 239, 172);
        }
        
        .cyber-data-error {
          border-color: rgba(220, 38, 38, 0.3);
          background: rgba(127, 29, 29, 0.1);
          color: rgb(248, 113, 113);
        }
        
        .cyber-debug-tips {
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(234, 179, 8, 0.1);
          border: 1px solid rgba(234, 179, 8, 0.3);
          border-radius: 0.25rem;
        }
        
        .cyber-debug-title {
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: rgb(234, 179, 8);
          margin-bottom: 0.5rem;
          font-family: 'JetBrains Mono', monospace;
        }
        
        .cyber-debug-content {
          color: rgba(234, 179, 8, 0.9);
        }
        
        .cyber-debug-list {
          margin-left: 1.5rem;
          list-style-type: disc;
          font-size: 0.8rem;
        }
        
        .cyber-debug-list li {
          margin-bottom: 0.25rem;
        }
        
        .cyber-error-panel {
          position: relative;
          background: rgba(127, 29, 29, 0.2);
          border: 1px solid rgba(220, 38, 38, 0.4);
          border-radius: 0.5rem;
          padding: 1rem;
          overflow: hidden;
          backdrop-filter: blur(10px);
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 0 0 1px rgba(220, 38, 38, 0.1) inset,
            0 0 20px rgba(220, 38, 38, 0.1);
        }
        
        .cyber-error-header {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(220, 38, 38, 0.3);
        }
        
        .cyber-error-title {
          font-size: 1rem;
          font-weight: 600;
          color: rgb(220, 38, 38);
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.05em;
        }
        
        .cyber-error-content {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 0.25rem;
          padding: 0.75rem;
          color: rgb(248, 113, 113);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          white-space: pre-wrap;
          overflow: auto;
          max-height: 12rem;
        }
        
        /* Cyber corners */
        .cyber-corner {
          position: absolute;
          width: 12px;
          height: 12px;
          z-index: 1;
        }
        
        .cyber-corner-tl {
          top: 0;
          left: 0;
          border-top: 2px solid rgb(6, 182, 212);
          border-left: 2px solid rgb(6, 182, 212);
        }
        
        .cyber-corner-tr {
          top: 0;
          right: 0;
          border-top: 2px solid rgb(6, 182, 212);
          border-right: 2px solid rgb(6, 182, 212);
        }
        
        .cyber-corner-bl {
          bottom: 0;
          left: 0;
          border-bottom: 2px solid rgb(6, 182, 212);
          border-left: 2px solid rgb(6, 182, 212);
        }
        
        .cyber-corner-br {
          bottom: 0;
          right: 0;
          border-bottom: 2px solid rgb(6, 182, 212);
          border-right: 2px solid rgb(6, 182, 212);
        }
        
        .cyber-test-success .cyber-corner-tl,
        .cyber-test-success .cyber-corner-tr,
        .cyber-test-success .cyber-corner-bl,
        .cyber-test-success .cyber-corner-br {
          border-color: rgb(34, 197, 94);
        }
        
        .cyber-test-error .cyber-corner-tl,
        .cyber-test-error .cyber-corner-tr,
        .cyber-test-error .cyber-corner-bl,
        .cyber-test-error .cyber-corner-br,
        .cyber-error-panel .cyber-corner-tl,
        .cyber-error-panel .cyber-corner-tr,
        .cyber-error-panel .cyber-corner-bl,
        .cyber-error-panel .cyber-corner-br {
          border-color: rgb(220, 38, 38);
        }
        
        .cyber-scan-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.8), transparent);
          animation: scan-line 3s linear infinite;
          opacity: 0.5;
        }
        
        .cyber-test-success .cyber-scan-line {
          background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.8), transparent);
        }
        
        .cyber-test-error .cyber-scan-line,
        .cyber-error-panel .cyber-scan-line {
          background: linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.8), transparent);
        }
        
        @keyframes scan-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}

export default ExampleCasesOutput;