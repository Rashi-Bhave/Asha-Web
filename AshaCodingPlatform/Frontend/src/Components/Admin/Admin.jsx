import React from 'react';
import { Link } from 'react-router-dom';
import { isLoggedIn } from '../../Services/Auth.service';
import LoginToCode from '../Loading/Loading';
import toast from 'react-hot-toast';

function Admin() {
  // Check if user is logged in
  React.useEffect(() => {
    if (!isLoggedIn()) {
      toast.error('Please login to access admin features');
    }
  }, []);

  if (!isLoggedIn()) {
    return <LoginToCode />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 border-b border-gray-700">
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Problem Management Card */}
              <div className="bg-gray-700 overflow-hidden shadow rounded-lg border border-gray-600">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-900 rounded-md p-3">
                      <svg className="h-6 w-6 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-300 truncate">
                          Problem Management
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-white">
                            Manage Problems
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 px-5 py-3">
                  <div className="text-sm">
                    <Link to="/admin/problems/create" className="font-medium text-blue-400 hover:text-blue-200 mr-4">
                      Create New Problem
                    </Link>
                    <Link to="/problems" className="font-medium text-blue-400 hover:text-blue-200">
                      View All Problems
                    </Link>
                  </div>
                </div>
              </div>

              {/* Coding Room Management Card */}
              <div className="bg-gray-700 overflow-hidden shadow rounded-lg border border-gray-600">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-900 rounded-md p-3">
                      <svg className="h-6 w-6 text-purple-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-300 truncate">
                          Interview Rooms
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-white">
                            Manage Interview Rooms
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 px-5 py-3">
                  <div className="text-sm">
                    <Link to="/host-interview" className="font-medium text-blue-400 hover:text-blue-200 mr-4">
                      Host Interview
                    </Link>
                    <Link to="/join-interview" className="font-medium text-blue-400 hover:text-blue-200">
                      Join Interview
                    </Link>
                  </div>
                </div>
              </div>

              {/* Statistics Card */}
              <div className="bg-gray-700 overflow-hidden shadow rounded-lg border border-gray-600">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-900 rounded-md p-3">
                      <svg className="h-6 w-6 text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-300 truncate">
                          Platform Statistics
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-white">
                            View Stats
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 px-5 py-3">
                  <div className="text-sm">
                    <span className="font-medium text-gray-400">Coming soon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;