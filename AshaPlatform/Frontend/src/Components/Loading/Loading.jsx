import React from 'react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="relative">
        {/* Animated circles with gradient colors */}
        <div className="flex items-center justify-center">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className={`absolute w-16 h-16 rounded-full border-4 border-transparent border-t-blue-600 border-r-indigo-500 animate-spin`}
              style={{ 
                animationDuration: `${1.5 + i * 0.2}s`,
                width: `${4 + i * 1}rem`, 
                height: `${4 + i * 1}rem`,
                opacity: 1 - i * 0.2
              }}
            />
          ))}
        </div>
        
        {/* AshaVerse text */}
        <div className="mt-20 text-center">
          <span className="text-xl font-medium text-gray-600">
            <span className="text-blue-600">Asha</span>
            <span className="text-indigo-600">Verse</span>
          </span>
          <div className="flex justify-center mt-2">
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" 
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;