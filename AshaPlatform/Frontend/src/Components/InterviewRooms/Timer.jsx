import React, { useState, useEffect } from 'react';
import { useSocket } from '../../Features/useSocket';

const Timer = ({ previlige, remoteSocketId }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [inputTime, setInputTime] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const socket = useSocket();

  const help1 = ({ tm }) => {
    setTime(tm);
  };

  useEffect(() => {
    socket.on('change:time', help1);
    return () => {
      socket.off('change:time', help1);
    };
  }, [socket]);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(timer);
            setIsRunning(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    if (previlige) {
      socket.emit('time:change', { remoteSocketId, tm: time });
    }
  }, [time, previlige, remoteSocketId, socket]);

  const handleStart = () => {
    if (inputTime > 0) {
      setTime(60 * inputTime);
      setIsRunning(true);
      setInputTime('');
    }
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setInputTime('');
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value) && value >= 0) {
      setInputTime(Number(value));
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculate progress percentage for the circular timer
  const calculateProgress = () => {
    // We'll use a default time of 30 minutes if nothing is set
    const maxTime = inputTime > 0 ? inputTime * 60 : 30 * 60;
    if (time === 0 && !isRunning) return 100;
    return Math.max(0, (time / maxTime) * 100);
  };

  // Calculate color based on remaining time
  const getTimerColor = () => {
    if (time === 0) return 'text-gray-400';
    if (time <= 60) return 'text-red-500'; // Last minute
    if (time <= 300) return 'text-yellow-500'; // Last 5 minutes
    return 'text-blue-400';
  };

  return (
    <div className="cyber-timer-panel relative">
      <div className="flex flex-col items-center">
        {/* Timer display */}
        <div 
          className="relative mb-4 cursor-pointer"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="cyber-timer-display">
            {/* Circular progress indicator */}
            <svg className="absolute w-24 h-24" viewBox="0 0 100 100">
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="rgba(6, 182, 212, 0.1)" 
                strokeWidth="8"
              />
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke={time <= 60 ? '#ef4444' : time <= 300 ? '#eab308' : 'rgb(6, 182, 212)'} 
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * calculateProgress() / 100)}
                transform="rotate(-90 50 50)"
                style={{transition: 'stroke-dashoffset 0.5s ease', filter: 'drop-shadow(0 0 3px currentColor)'}}
              />
            </svg>
            <span className={`cyber-timer-text ${getTimerColor()}`}>
              {formatTime(time)}
            </span>
            
            {/* Decorative elements */}
            <div className="cyber-corner cyber-corner-tl"></div>
            <div className="cyber-corner cyber-corner-tr"></div>
            <div className="cyber-corner cyber-corner-bl"></div>
            <div className="cyber-corner cyber-corner-br"></div>
          </div>
          
          {/* Status indicator */}
          {time > 0 && isRunning && (
            <div className="cyber-timer-status">
              <div className="cyber-timer-status-dot"></div>
            </div>
          )}
          
          {/* Information tooltip */}
          {isHovering && (
            <div className="cyber-timer-tooltip">
              {isRunning 
                ? 'Quantum countdown in progress' 
                : time > 0 
                  ? 'Temporal suspension active'
                  : 'Chronometer inactive'}
            </div>
          )}
        </div>
        
        {/* Timer controls (visible only to privileged users) */}
        {previlige && (
          <div className="w-full space-y-3">
            <div className="flex space-x-2">
              <button 
                onClick={handleStart} 
                disabled={isRunning}
                className={`cyber-control-button ${
                  isRunning ? 'cyber-control-button-disabled' : 'cyber-control-button-primary'
                }`}
              >
                <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Initiate
              </button>
              
              <button 
                onClick={handleStop} 
                disabled={!isRunning}
                className={`cyber-control-button ${
                  !isRunning ? 'cyber-control-button-disabled' : ''
                }`}
              >
                <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Suspend
              </button>
              
              <button 
                onClick={handleReset}
                className="cyber-control-button cyber-control-button-danger"
              >
                <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Reset
              </button>
            </div>
            
            <div className="flex items-center">
              <div className="relative flex-1">
                <input 
                  type="number" 
                  min="0" 
                  value={inputTime} 
                  onChange={handleInputChange} 
                  placeholder="Set temporal units"
                  className="cyber-timer-input"
                />
                <div className="cyber-timer-input-suffix">
                  <span>min</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* CSS for cyberpunk styling */}
      <style jsx>{`
        .cyber-timer-panel {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          padding: 1rem;
          backdrop-filter: blur(10px);
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 0 0 1px rgba(6, 182, 212, 0.1) inset,
            0 0 20px rgba(6, 182, 212, 0.1);
        }
        
        .cyber-timer-display {
          position: relative;
          width: 6rem;
          height: 6rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.1);
          overflow: hidden;
        }
        
        .cyber-timer-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.25rem;
          font-weight: bold;
          letter-spacing: 0.05em;
          z-index: 1;
        }
        
        .cyber-timer-status {
          position: absolute;
          top: -0.25rem;
          right: -0.25rem;
          width: 1.25rem;
          height: 1.25rem;
          background: rgba(16, 185, 129, 0.2);
          border: 2px solid rgba(16, 185, 129, 0.6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
          z-index: 2;
        }
        
        .cyber-timer-status-dot {
          width: 0.25rem;
          height: 0.25rem;
          background: rgb(16, 185, 129);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        .cyber-timer-tooltip {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.25rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: rgb(6, 182, 212);
          white-space: nowrap;
          z-index: 10;
          backdrop-filter: blur(4px);
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        }
        
        .cyber-timer-input {
          width: 100%;
          padding: 0.5rem 2.5rem 0.5rem 0.75rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.25rem;
          color: rgb(226, 232, 240);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        
        .cyber-timer-input:focus {
          outline: none;
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.3);
        }
        
        .cyber-timer-input-suffix {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          padding-right: 0.75rem;
          color: rgba(6, 182, 212, 0.7);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          pointer-events: none;
        }
        
        .cyber-control-button {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          padding: 0.375rem 0.75rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.25rem;
          color: rgb(6, 182, 212);
          font-size: 0.85rem;
          font-family: 'JetBrains Mono', monospace;
          transition: all 0.2s;
        }
        
        .cyber-control-button:hover:not(:disabled) {
          background: rgba(15, 23, 42, 1);
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
        }
        
        .cyber-control-button-primary {
          background: linear-gradient(90deg, #0369a1, #0891b2);
          border: none;
          color: white;
        }
        
        .cyber-control-button-primary:hover:not(:disabled) {
          background: linear-gradient(90deg, #0891b2, #0ea5e9);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
        }
        
        .cyber-control-button-danger {
          background: linear-gradient(90deg, #7f1d1d, #b91c1c);
          border: none;
          color: white;
        }
        
        .cyber-control-button-danger:hover {
          background: linear-gradient(90deg, #b91c1c, #dc2626);
          box-shadow: 0 0 15px rgba(220, 38, 38, 0.5);
        }
        
        .cyber-control-button-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Cyber corners */
        .cyber-corner {
          position: absolute;
          width: 8px;
          height: 8px;
          z-index: 1;
        }
        
        .cyber-corner-tl {
          top: 3px;
          left: 3px;
          border-top: 1px solid rgb(6, 182, 212);
          border-left: 1px solid rgb(6, 182, 212);
        }
        
        .cyber-corner-tr {
          top: 3px;
          right: 3px;
          border-top: 1px solid rgb(6, 182, 212);
          border-right: 1px solid rgb(6, 182, 212);
        }
        
        .cyber-corner-bl {
          bottom: 3px;
          left: 3px;
          border-bottom: 1px solid rgb(6, 182, 212);
          border-left: 1px solid rgb(6, 182, 212);
        }
        
        .cyber-corner-br {
          bottom: 3px;
          right: 3px;
          border-bottom: 1px solid rgb(6, 182, 212);
          border-right: 1px solid rgb(6, 182, 212);
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.5); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default Timer;