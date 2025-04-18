// src/components/ApiTester.jsx
import React, { useState } from 'react';

const ApiTester = () => {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  
  // Adzuna API credentials
  const ADZUNA_APP_ID = '0fe0ceef';
  const ADZUNA_API_KEY = '57c6062c92b59ed17b32aec4e2e83b8f';
  
  const handleTestApi = async () => {
    setTesting(true);
    setTestResults(null);
    
    try {
      // Test the Adzuna API connection
      const baseUrl = 'https://api.adzuna.com/v1/api/jobs/gb/search/1';
      const params = {
        app_id: ADZUNA_APP_ID,
        app_key: ADZUNA_API_KEY,
        results_per_page: 1,
        what: 'developer'
      };
      
      // Build the query string
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      
      const fullUrl = `${baseUrl}?${queryString}`;
      console.log(`Testing API URL: ${fullUrl}`);
      
      // Make the fetch request
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      console.log("API Test Response:", response.status, data);
      
      setTestResults({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
        data,
        contentType
      });
    } catch (error) {
      console.error('API test failed:', error);
      setTestResults({
        success: false,
        error: error.message,
        details: error
      });
    } finally {
      setTesting(false);
    }
  };
  
  return (
    <div className="filter-section" style={{ marginBottom: '20px' }}>
      <h3 className="filter-title">API Connection Tester</h3>
      <p>
        Test the connection to the Adzuna API to diagnose any issues with job listings.
      </p>
      
      <div style={{ marginTop: '10px', marginBottom: '10px' }}>
        <button
          className="primary-button"
          onClick={handleTestApi}
          disabled={testing}
          style={{ marginRight: '10px' }}
        >
          {testing ? 'Testing...' : 'Test API Connection'}
        </button>
        
        {testResults && (
          <button
            className="secondary-button"
            onClick={() => setTestResults(null)}
          >
            Clear Results
          </button>
        )}
      </div>
      
      {testResults && (
        <div style={{ 
          border: `1px solid ${testResults.success ? '#4CAF50' : '#F44336'}`,
          padding: '10px',
          borderRadius: '4px',
          backgroundColor: testResults.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'
        }}>
          <h4 style={{ marginTop: '0' }}>
            {testResults.success ? '✅ Connection Successful' : '❌ Connection Failed'}
          </h4>
          
          {testResults.success ? (
            <div>
              <p>Status: {testResults.status} {testResults.statusText}</p>
              <p>Content Type: {testResults.contentType}</p>
              
              <div>
                <h5>Response Preview:</h5>
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '10px', 
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflow: 'auto',
                  fontSize: '12px'
                }}>
                  {typeof testResults.data === 'object' 
                    ? JSON.stringify(testResults.data, null, 2)
                    : testResults.data}
                </pre>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: '#d32f2f' }}>{testResults.error}</p>
              {testResults.status && (
                <p>Status: {testResults.status} {testResults.statusText}</p>
              )}
              
              <div>
                <h5>Troubleshooting Suggestions:</h5>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Check API credentials (app_id and app_key)</li>
                  <li>Verify API endpoint URL format</li>
                  <li>Check for CORS issues (try using a proxy server)</li>
                  <li>Confirm your network connection</li>
                  <li>Verify API rate limits haven't been exceeded</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiTester;