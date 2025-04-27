import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { isLoggedIn } from '../../Services/Auth.service';
import Loading from '../Loading/Loading';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';

function CreateProblem() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [problemData, setProblemData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    constraints: [''],
    example_cases: [{ input: '', output: '', explanation: '' }],
    test_cases: [{ input: '', output: '' }],
    solution: {
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your solution here\n    return 0;\n}',
      c: '#include<stdio.h>\n\nint main() {\n    // Your solution here\n    return 0;\n}',
      java: 'public class Main {\n    public static void main(String[] args) {\n        // Your solution here\n    }\n}',
      python: 'def main():\n    # Your solution here\n    pass\n\nif __name__ == "__main__":\n    main()'
    },
    input_format: '',
    output_format: ''
  });

  // Active language for code editor
  const [activeLanguage, setActiveLanguage] = useState('cpp');
  const languageMap = {
    cpp: 'cpp',
    c: 'c',
    java: 'java',
    python: 'python'
  };

  // Handler for updating nested objects and arrays
  const handleChange = (name, value) => {
    setProblemData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle constraint changes
  const handleConstraintChange = (index, value) => {
    const newConstraints = [...problemData.constraints];
    newConstraints[index] = value;
    handleChange('constraints', newConstraints);
  };

  const addConstraint = () => {
    handleChange('constraints', [...problemData.constraints, '']);
  };

  const removeConstraint = (index) => {
    const newConstraints = problemData.constraints.filter((_, i) => i !== index);
    handleChange('constraints', newConstraints);
  };

  // Handle example case changes
  const handleExampleCaseChange = (index, field, value) => {
    const newExampleCases = [...problemData.example_cases];
    newExampleCases[index] = {
      ...newExampleCases[index],
      [field]: value
    };
    handleChange('example_cases', newExampleCases);
  };

  const addExampleCase = () => {
    handleChange('example_cases', [
      ...problemData.example_cases, 
      { input: '', output: '', explanation: '' }
    ]);
  };

  const removeExampleCase = (index) => {
    const newExampleCases = problemData.example_cases.filter((_, i) => i !== index);
    handleChange('example_cases', newExampleCases);
  };

  // Handle test case changes
  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...problemData.test_cases];
    newTestCases[index] = {
      ...newTestCases[index],
      [field]: value
    };
    handleChange('test_cases', newTestCases);
  };

  const addTestCase = () => {
    handleChange('test_cases', [
      ...problemData.test_cases, 
      { input: '', output: '' }
    ]);
  };

  const removeTestCase = (index) => {
    const newTestCases = problemData.test_cases.filter((_, i) => i !== index);
    handleChange('test_cases', newTestCases);
  };

  // Handle solution code changes
  const handleSolutionChange = (language, code) => {
    setProblemData(prev => ({
      ...prev,
      solution: {
        ...prev.solution,
        [language]: code || ''
      }
    }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Form validation
      if (!problemData.title.trim()) {
        throw new Error('Problem title is required');
      }
      if (!problemData.description.trim()) {
        throw new Error('Problem description is required');
      }
      if (!problemData.input_format.trim()) {
        throw new Error('Input format is required');
      }
      if (!problemData.output_format.trim()) {
        throw new Error('Output format is required');
      }
      
      // Filter out any empty constraints
      const filteredConstraints = problemData.constraints.filter(c => c.trim() !== '');
      if (filteredConstraints.length === 0) {
        throw new Error('At least one constraint is required');
      }
      
      // Validate example cases
      const validExampleCases = problemData.example_cases.filter(
        ec => ec.input.trim() !== '' && ec.output.trim() !== ''
      );
      if (validExampleCases.length === 0) {
        throw new Error('At least one complete example case is required');
      }
      
      // Validate test cases
      const validTestCases = problemData.test_cases.filter(
        tc => tc.input.trim() !== '' && tc.output.trim() !== ''
      );
      if (validTestCases.length === 0) {
        throw new Error('At least one complete test case is required');
      }
      
      // Prepare data with filtered arrays
      const submissionData = {
        title: problemData.title.trim(),
        description: problemData.description.trim(),
        difficulty: problemData.difficulty,
        constraints: filteredConstraints,
        example_cases: validExampleCases.map(ec => ({
          input: ec.input.trim(),
          output: ec.output.trim(),
          explanation: ec.explanation.trim()
        })),
        test_cases: validTestCases.map(tc => ({
          input: tc.input.trim(),
          output: tc.output.trim()
        })),
        solution: problemData.solution,
        input_format: problemData.input_format.trim(),
        output_format: problemData.output_format.trim()
      };

      const backendURL = import.meta.env.VITE_BACKEND_URL;

      
      console.log("Submitting problem data:", submissionData);
      
      // Direct API call with better error handling
      try {
        // Get the API URL - make sure this is correct
        // const apiUrl = `${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/problem/createproblem`;
        console.log("API URL:", backendURL);

        const token = localStorage.getItem('accessToken');
        
        // Make the request with proper error handling
        const response = await fetch(`http://localhost:8000/api/v1/problem/createproblem`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            },
          body: JSON.stringify(submissionData),
        });
        
        console.log("API Response:", response);

        toast.success('Problem created successfully!');
          
          // Navigate to the problem page after a delay
        setTimeout(() => {
          navigate(`/problems/${response.data.data._id}`);
        }, 2000);
        
        
      } catch (apiError) {
        console.error("API Error Details:", apiError);
        
        // Check if we received HTML instead of JSON (common for 404/500 errors)
        if (apiError.response?.data && typeof apiError.response.data === 'string' && 
            apiError.response.data.includes('<!DOCTYPE')) {
          console.error("Received HTML response instead of JSON. Check your API URL and server configuration.");
          throw new Error(`Server error: ${apiError.response.status}. Check that your API URL is correct and the server is running.`);
        }
        
        throw new Error(apiError.response?.data?.message || apiError.message || "Failed to create problem");
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn()) {
    toast.error('Please login to create problems');
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 border-b border-gray-700">
            <h1 className="text-xl font-bold text-white">Create New Problem</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-medium text-white border-b border-gray-700 pb-2">Basic Information</h2>
              <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                    Problem Title
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="title"
                      value={problemData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="shadow-sm bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-md"
                      placeholder="Two Sum"
                      required
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-300">
                    Difficulty
                  </label>
                  <div className="mt-1">
                    <select
                      id="difficulty"
                      value={problemData.difficulty}
                      onChange={(e) => handleChange('difficulty', e.target.value)}
                      className="shadow-sm bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-md"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                    Problem Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      rows={4}
                      value={problemData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="shadow-sm bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-md"
                      placeholder="Describe the problem in detail..."
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="inputFormat" className="block text-sm font-medium text-gray-300">
                    Input Format
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="inputFormat"
                      rows={3}
                      value={problemData.input_format}
                      onChange={(e) => handleChange('input_format', e.target.value)}
                      className="shadow-sm bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-md"
                      placeholder="First line contains n, the size of array..."
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="outputFormat" className="block text-sm font-medium text-gray-300">
                    Output Format
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="outputFormat"
                      rows={3}
                      value={problemData.output_format}
                      onChange={(e) => handleChange('output_format', e.target.value)}
                      className="shadow-sm bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-md"
                      placeholder="Print a single integer representing..."
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Constraints */}
            <div>
              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <h2 className="text-lg font-medium text-white">Constraints</h2>
                <button
                  type="button"
                  onClick={addConstraint}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-300 bg-indigo-900 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-0.5 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Constraint
                </button>
              </div>
              <div className="mt-4 space-y-4">
                {problemData.constraints.map((constraint, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-grow">
                      <input
                        type="text"
                        value={constraint}
                        onChange={(e) => handleConstraintChange(index, e.target.value)}
                        className="shadow-sm bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-md"
                        placeholder="1 <= n <= 10^5"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeConstraint(index)}
                      className="ml-2 flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-red-500 focus:outline-none focus:bg-gray-700 focus:text-gray-300"
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Example Cases */}
            <div>
              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <h2 className="text-lg font-medium text-white">Example Cases</h2>
                <button
                  type="button"
                  onClick={addExampleCase}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-300 bg-indigo-900 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-0.5 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Example
                </button>
              </div>
              <div className="mt-4 space-y-6">
                {problemData.example_cases.map((example, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-md border border-gray-600">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-md font-medium text-gray-200">Example {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeExampleCase(index)}
                        className="text-gray-400 hover:text-red-500 focus:outline-none"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Input</label>
                        <textarea
                          rows={3}
                          value={example.input}
                          onChange={(e) => handleExampleCaseChange(index, 'input', e.target.value)}
                          className="shadow-sm bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-700 rounded-md font-mono"
                          placeholder="4&#10;1 2 3 4"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Output</label>
                        <textarea
                          rows={3}
                          value={example.output}
                          onChange={(e) => handleExampleCaseChange(index, 'output', e.target.value)}
                          className="shadow-sm bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-700 rounded-md font-mono"
                          placeholder="10"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Explanation (Optional)</label>
                        <textarea
                          rows={2}
                          value={example.explanation}
                          onChange={(e) => handleExampleCaseChange(index, 'explanation', e.target.value)}
                          className="shadow-sm bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-700 rounded-md"
                          placeholder="Sum of all elements is 10"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Cases */}
            <div>
              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <h2 className="text-lg font-medium text-white">Test Cases</h2>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-300 bg-indigo-900 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-0.5 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Test Case
                </button>
              </div>
              <div className="mt-4 space-y-6">
                {problemData.test_cases.map((testCase, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-md border border-gray-600">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-md font-medium text-gray-200">Test Case {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeTestCase(index)}
                        className="text-gray-400 hover:text-red-500 focus:outline-none"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Input</label>
                        <textarea
                          rows={3}
                          value={testCase.input}
                          onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                          className="shadow-sm bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-700 rounded-md font-mono"
                          placeholder="5&#10;1 2 3 4 5"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Expected Output</label>
                        <textarea
                          rows={3}
                          value={testCase.output}
                          onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                          className="shadow-sm bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-700 rounded-md font-mono"
                          placeholder="15"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Solutions */}
            <div>
              <h2 className="text-lg font-medium text-white border-b border-gray-700 pb-2">Solutions</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex justify-between items-center">
                    <div className="flex border-b border-gray-700 w-full">
                      {Object.keys(languageMap).map(lang => (
                        <button
                          key={lang}
                          type="button"
                          className={`py-2 px-4 text-sm font-medium focus:outline-none ${
                            activeLanguage === lang
                              ? 'border-b-2 border-indigo-500 text-indigo-400'
                              : 'text-gray-400 hover:text-gray-300 hover:border-gray-600'
                          }`}
                          onClick={() => setActiveLanguage(lang)}
                        >
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 h-72 border border-gray-700 rounded-md overflow-hidden">
                    <Editor
                      height="100%"
                      language={languageMap[activeLanguage]}
                      value={problemData.solution[activeLanguage]}
                      onChange={(value) => handleSolutionChange(activeLanguage, value || '')}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        wrappingIndent: 'indent',
                        automaticLayout: true
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Debug Info (only in development) */}
            {import.meta.env.DEV && (
              <div className="bg-gray-900 border border-gray-700 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-300 mb-2">API Debug Info</h3>
                <p className="text-xs text-gray-400">Backend URL: {import.meta.env.VITE_BACKEND_URL || "Not set (will use relative URL)"}</p>
                <p className="text-xs text-gray-400 mt-1">Full API Path: {`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/problem/createproblem`}</p>
              </div>
            )}

            {/* Submit button */}
            <div className="pt-5 border-t border-gray-700 flex justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-700 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  isSubmitting
                    ? 'bg-indigo-700 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Problem'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateProblem;