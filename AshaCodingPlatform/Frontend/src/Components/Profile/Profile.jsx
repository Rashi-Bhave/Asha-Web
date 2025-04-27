import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile } from '../../Services/Auth.service';
import Loading from '../Loading/Loading.jsx';
import ProblemStats from './ProblemStats.jsx';
import Submissions from '../Submission/Submissions.jsx';
import LogoutButton from './LogoutButton';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('submissions');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      const response = await getMyProfile(); 
      setUser(response);
      
    };
    fetchUserProfile();
  }, [navigate]);

  if (!user) return <Loading />;

  const difficultyCount = {
    easy: user.easyCount || 0,
    medium: user.mediumCount || 0,
    hard: user.hardCount || 0,
    total: (user.easyCount || 0) + (user.mediumCount || 0) + (user.hardCount || 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="md:flex">
            <div className="md:flex-shrink-0 bg-gradient-to-r from-blue-500 to-indigo-600 md:w-48 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="relative inline-block">
                  <img 
                    src={user.avatar || '/public/defaultuser.png'} 
                    alt={user.fullname} 
                    className="h-32 w-32 rounded-full border-4 border-white object-cover"
                  />
                  <button 
                    onClick={() => navigate('/editprofile')}
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transition-colors duration-200"
                  >
                    <svg className="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-8 md:p-6 md:flex-1">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.fullname}</h1>
                  <p className="text-gray-500">@{user.username}</p>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <LogoutButton />
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
                <div className="col-span-2 md:col-span-3">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-green-600">{difficultyCount.easy}</div>
                      <div className="text-sm text-gray-500">Easy Problems</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-yellow-600">{difficultyCount.medium}</div>
                      <div className="text-sm text-gray-500">Medium Problems</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-red-600">{difficultyCount.hard}</div>
                      <div className="text-sm text-gray-500">Hard Problems</div>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <div className="bg-gray-50 rounded-lg p-4 h-full flex flex-col justify-center items-center">
                    <div className="text-3xl font-bold text-blue-600">{difficultyCount.total}</div>
                    <div className="text-sm text-gray-500">Total Solved</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="h-4 w-4 mr-1.5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span>{user.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Solving Progress</h2>
          <ProblemStats user={user} />
        </div>
        
        {/* Tabs & Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('submissions')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'submissions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center">
                  <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                  Solved Problems
                </span>
              </button>
              <button
                onClick={() => setActiveTab('tweets')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'tweets'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center">
                  <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  My Discussions
                </span>
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'submissions' ? (
              <Submissions displayproblem={true} />
            ) : (
              <div className="space-y-4">
                {user.mytweets && user.mytweets.length > 0 ? (
                  user.mytweets.map((tweet, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <img 
                            src={user.avatar || '/public/defaultuser.png'} 
                            alt={user.username} 
                            className="h-10 w-10 rounded-full mr-3"
                          />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{user.username}</h3>
                            <p className="text-xs text-gray-500">{new Date(tweet.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-gray-700">{tweet.content}</p>
                        {tweet.image && (
                          <img src={tweet.image} alt="Tweet" className="mt-3 rounded-lg max-w-full h-auto" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No discussions yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new discussion.</p>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => navigate('/discuss')}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Join Discussion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;