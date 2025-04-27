import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import BiasAnalyticsDashboard from './BiasAnalyticsDashboard'

const AnalyticsModal = ({ isOpen, onClose, mousePosition }) => {
  const modalRef = useRef(null);
  
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // 3D rotation on mouse move
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!modalRef.current) return;
      
      const modal = modalRef.current;
      const rect = modal.getBoundingClientRect();
      const modalCenterX = rect.left + rect.width / 2;
      const modalCenterY = rect.top + rect.height / 2;
      
      const rotateY = (e.clientX - modalCenterX) / 80;
      const rotateX = (modalCenterY - e.clientY) / 80;
      
      modal.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
    
    if (isOpen) {
      document.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="nova-modal-overlay">
      <div className="neural-connectivity-map">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} 
            className="neural-node" 
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`
            }}
          >
            <div className="neural-pulse"></div>
          </div>
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} 
            className="neural-connection" 
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${(Math.random() * 30) + 10}%`,
              rotate: `${Math.random() * 360}deg`,
              animationDelay: `${Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>
      
      <div ref={modalRef} className="nova-modal">
        <div className="nova-modal-header">
          <div className="nova-header-left">
            <div className="nova-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className="nova-icon-pulse"></div>
            </div>
            <div className="nova-header-text">
              <h2 className="shimmer-text">Neural Analytics Interface <span className="typing-cursor">_</span></h2>
              <div className="nova-system-info">
                <span className="nova-system-status online">System Online</span>
                <span className="nova-system-version">v3.7.6</span>
                <span className="nova-system-ping">Latency: 12ms</span>
              </div>
            </div>
          </div>
          
          <div className="nova-header-controls">
            <div className="nova-modal-badge">Quantum Encrypted</div>
            <button className="nova-modal-control" onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div className="nova-control-tooltip">Disconnect</div>
            </button>
          </div>
        </div>
        
        <div className="nova-modal-content">
          <BiasAnalyticsDashboard />
        </div>
        
        <div className="nova-modal-footer">
          <div className="nova-footer-info">
            <div className="nova-processing-status">
              <div className="nova-status-indicator"></div>
              <span>Neural Processing Active</span>
            </div>
            <div className="nova-data-stats">
              <span>Data points: 1.56M</span>
              <span>Processing cores: 24</span>
              <span>Last sync: 3m ago</span>
            </div>
          </div>
          <div className="nova-ai-signature shimmer-text">Powered by Asha Neural Network</div>
        </div>
        
        {/* Decorative elements */}
        <div className="nova-corner nova-corner-tl"></div>
        <div className="nova-corner nova-corner-tr"></div>
        <div className="nova-corner nova-corner-bl"></div>
        <div className="nova-corner nova-corner-br"></div>
        <div className="nova-modal-scanline"></div>
        
        {/* Circuit decorations */}
        <div className="nova-circuit-decoration nova-circuit-1"></div>
        <div className="nova-circuit-decoration nova-circuit-2"></div>
        <div className="nova-circuit-decoration nova-circuit-3"></div>
        <div className="nova-circuit-node nova-node-1"></div>
        <div className="nova-circuit-node nova-node-2"></div>
        <div className="nova-circuit-node nova-node-3"></div>
      </div>
      <style jsx="true">{`
      /* Global Styles */
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        background-color: #0f172a;
        color: #e2e8f0;
        font-family: 'JetBrains Mono', monospace;
        overflow-x: hidden;
      }
      
      /* App Container */
      .app-container {
        background-color: rgba(15, 23, 42, 0.95);
        min-height: 100vh;
        font-family: 'JetBrains Mono', monospace;
        position: relative;
        overflow: hidden;
      }

      /* Cyberpunk Grid */
      .cyber-grid {
        position: absolute;
        inset: 0;
        background-image: 
            linear-gradient(to right, rgba(6, 182, 212, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.05) 1px, transparent 1px);
        background-size: 50px 50px;
        animation: grid-move 50s linear infinite;
      }
      
      @keyframes grid-move {
        0% { background-position: 0 0; }
        100% { background-position: 50px 50px; }
      }
      
      /* Matrix Data Shower */
      .hacker-text-container {
        position: fixed;
        inset: 0;
        z-index: 10;
        pointer-events: none;
        overflow: hidden;
      }
      
      .hacker-text-line {
        position: absolute;
        top: -30px;
        color: rgba(6, 182, 212, 0.7);
        font-family: 'Courier New', monospace;
        font-size: 14px;
        white-space: nowrap;
        text-shadow: 0 0 5px rgba(6, 182, 212, 0.5);
        animation: falling-text linear forwards;
      }
      
      @keyframes falling-text {
        0% { transform: translateY(0); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(105vh); opacity: 0; }
      }
      
      /* Glitch Effect */
      .cyber-glitch {
        animation: glitch 0.3s linear;
      }
      
      @keyframes glitch {
        0% { transform: translate(0); }
        20% { transform: translate(-5px, 5px); }
        40% { transform: translate(-5px, -5px); }
        60% { transform: translate(5px, 5px); }
        80% { transform: translate(5px, -5px); }
        100% { transform: translate(0); }
      }
      
      /* Holographic Elements */
      .holographic-container {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 1;
      }
      
      .holographic-circle {
        position: absolute;
        border-radius: 50%;
        border: 1px solid rgba(6, 182, 212, 0.3);
        box-shadow: 0 0 20px rgba(6, 182, 212, 0.1) inset;
        animation: rotate-3d 20s linear infinite;
      }
      
      .h-circle-1 {
        top: 20%;
        left: 30%;
        width: 200px;
        height: 200px;
        animation-duration: 15s;
      }
      
      .h-circle-2 {
        bottom: 15%;
        right: 25%;
        width: 250px;
        height: 250px;
        animation-duration: 25s;
        animation-direction: reverse;
      }
      
      .h-circle-3 {
        top: 50%;
        left: 50%;
        width: 400px;
        height: 400px;
        animation-duration: 30s;
        transform: translate(-50%, -50%);
      }
      
      @keyframes rotate-3d {
        0% { transform: rotate3d(1, 1, 1, 0deg); }
        100% { transform: rotate3d(1, 1, 1, 360deg); }
      }
      
      /* Floating Code Fragments */
      .code-fragments {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 2;
      }
      
      .code-fragment {
        position: absolute;
        padding: 10px;
        background: rgba(17, 24, 39, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 5px;
        animation: float-code 15s ease-in-out infinite;
      }
      
      .code-text {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: rgba(6, 182, 212, 0.8);
        margin: 0;
      }
      
      @keyframes float-code {
        0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
        50% { transform: translateY(-20px) rotate(2deg); opacity: 0.6; }
      }
      
      /* Holographic Logo */
      .logo-glitch-container {
        position: relative;
        width: 250px;
        height: 80px;
        transform-style: preserve-3d;
      }
      
      .logo-base {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'JetBrains Mono', monospace;
        font-size: 28px;
        font-weight: 700;
        color: rgb(6, 182, 212);
        text-shadow: 0 0 10px rgba(6, 182, 212, 0.6);
        letter-spacing: 2px;
      }
      
      .logo-glitch {
        position: absolute;
        inset: 0;
        background: linear-gradient(45deg, rgba(6, 182, 212, 0.2), rgba(124, 58, 237, 0.2));
        border-radius: 10px;
        filter: blur(10px);
        animation: logo-pulse 3s ease-in-out infinite alternate;
      }
      
      .logo-scan {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 5px;
        background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.8), transparent);
        filter: blur(2px);
        animation: logo-scan 3s linear infinite;
      }
      
      .logo-glow {
        position: absolute;
        inset: -10px;
        border-radius: 20px;
        border: 1px solid rgba(6, 182, 212, 0.3);
        box-shadow: 0 0 15px rgba(6, 182, 212, 0.4) inset,
                    0 0 5px rgba(6, 182, 212, 0.2);
        animation: logo-rotate 10s linear infinite;
        opacity: 0.7;
      }
      
      @keyframes logo-pulse {
        0% { transform: scale(0.9); opacity: 0.5; }
        100% { transform: scale(1.1); opacity: 0.8; }
      }
      
      @keyframes logo-scan {
        0% { transform: translateY(0); opacity: 0.8; }
        70% { opacity: 0.5; }
        100% { transform: translateY(80px); opacity: 0; }
      }
      
      @keyframes logo-rotate {
        0% { transform: rotate(0); }
        100% { transform: rotate(360deg); }
      }
      
      /* Text Effects */
      .cyber-text-glitch {
        position: relative;
      }
      
      .cyber-text-glitch::before,
      .cyber-text-glitch::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, rgb(6, 182, 212) 0%, rgb(124, 58, 237) 50%, rgb(14, 165, 233) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        color: transparent;
      }
      
      .cyber-text-glitch::before {
        left: 2px;
        text-shadow: -1px 0 rgba(124, 58, 237, 0.5);
        animation: text-glitch-1 3s infinite linear alternate-reverse;
      }
      
      .cyber-text-glitch::after {
        left: -2px;
        text-shadow: 1px 0 rgba(14, 165, 233, 0.5);
        animation: text-glitch-2 2s infinite linear alternate-reverse;
      }
      
      @keyframes text-glitch-1 {
        0%, 100% { clip-path: inset(0 0 98% 0); }
        20% { clip-path: inset(33% 0 33% 0); }
        40% { clip-path: inset(50% 0 0 0); }
        60% { clip-path: inset(25% 0 75% 0); }
        80% { clip-path: inset(75% 0 25% 0); }
      }
      
      @keyframes text-glitch-2 {
        0%, 100% { clip-path: inset(0 0 98% 0); }
        25% { clip-path: inset(35% 0 65% 0); }
        50% { clip-path: inset(50% 0 50% 0); }
        75% { clip-path: inset(40% 0 60% 0); }
      }
      
      .cyber-text-scramble {
        position: relative;
        overflow: hidden;
      }
      
      .cyber-text-scramble::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(17, 24, 39, 0.8), transparent);
        animation: text-scramble 3s ease-in-out infinite;
      }
      
      @keyframes text-scramble {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      /* Neural Button */
      .nova-neural-button {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.875rem 1.75rem;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(6, 182, 212, 0.4);
        border-radius: 0.5rem;
        color: rgb(6, 182, 212);
        font-size: 1rem;
        font-weight: 500;
        letter-spacing: 0.025em;
        cursor: pointer;
        overflow: hidden;
        transition: all 0.3s;
        box-shadow: 
          0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 2px 4px -1px rgba(0, 0, 0, 0.06),
          0 0 0 1px rgba(6, 182, 212, 0.1) inset,
          0 0 20px rgba(6, 182, 212, 0.1);
        z-index: 1;
      }
      
      .nova-neural-button:hover {
        transform: translateY(-5px);
        box-shadow: 
          0 10px 25px -5px rgba(0, 0, 0, 0.2),
          0 10px 10px -5px rgba(0, 0, 0, 0.1),
          0 0 0 1px rgba(6, 182, 212, 0.3) inset,
          0 0 30px rgba(6, 182, 212, 0.2);
      }
      
      .nova-neural-button-content {
        display: flex;
        align-items: center;
        position: relative;
        z-index: 2;
      }
      
      .nova-neural-button-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 0.75rem;
        color: rgb(6, 182, 212);
      }
      
      .nova-neural-button-text {
        position: relative;
      }
      
      .nova-button-glow {
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle at center, rgba(6, 182, 212, 0.3) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      .nova-neural-button:hover .nova-button-glow {
        opacity: 0.5;
        animation: glow-pulse 2s infinite;
      }
      
      @keyframes glow-pulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.1); }
      }
      
      .nova-button-grid {
        position: absolute;
        inset: 0;
        opacity: 0.1;
        background-image: 
          linear-gradient(to right, rgba(6, 182, 212, 0.3) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(6, 182, 212, 0.3) 1px, transparent 1px);
        background-size: 10px 10px;
        z-index: 1;
      }
      
      .nova-button-particles {
        position: absolute;
        inset: 0;
        z-index: 1;
        overflow: hidden;
      }
      
      .nova-button-particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(6, 182, 212, 0.7);
        border-radius: 50%;
        opacity: 0;
      }
      
      .nova-neural-button:hover .nova-button-particle {
        animation: particle-burst 0.8s ease-out forwards;
      }
      
      @keyframes particle-burst {
        0% {
          opacity: 0.8;
          transform: translate(calc(var(--x, 0) * 1px), calc(var(--y, 0) * 1px)) scale(0);
        }
        100% {
          opacity: 0;
          transform: translate(
            calc(var(--x, 0) * 1px + var(--dx, 0) * 60px),
            calc(var(--y, 0) * 1px + var(--dy, 0) * 60px)
          ) scale(1);
        }
      }
      
      /* Modal Styles */
      .nova-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(10px);
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        overflow: hidden;
      }
      
      .nova-modal {
        width: 92%;
        height: 92%;
        max-width: 1800px;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 0.75rem;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(6, 182, 212, 0.2);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: modalAppear 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        transform-style: preserve-3d;
        perspective: 1000px;
      }
      
      @keyframes modalAppear {
        0% { opacity: 0; transform: scale(0.95) translateY(30px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      
      .nova-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.75rem;
        background: rgba(15, 23, 42, 0.9);
        border-bottom: 1px solid rgba(6, 182, 212, 0.3);
        position: relative;
      }
      
      .nova-header-left {
        display: flex;
        align-items: center;
      }
      
      .nova-header-icon {
        position: relative;
        width: 40px;
        height: 40px;
        background: rgba(6, 182, 212, 0.1);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgb(6, 182, 212);
        margin-right: 1rem;
      }
      
      .nova-icon-pulse {
        position: absolute;
        inset: 0;
        border-radius: 0.5rem;
        border: 1px solid rgba(6, 182, 212, 0.5);
        opacity: 0;
        animation: icon-pulse 2s infinite;
      }
      
      @keyframes icon-pulse {
        0% { transform: scale(1); opacity: 0.5; }
        100% { transform: scale(1.5); opacity: 0; }
      }
      
      .nova-header-text {
        display: flex;
        flex-direction: column;
      }
      
      .nova-system-info {
        display: flex;
        gap: 1rem;
        margin-top: 0.25rem;
      }
      
      .nova-system-status {
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }
      
      .nova-system-status.online::before {
        content: '';
        display: block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgb(16, 185, 129);
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        animation: pulse 2s infinite;
      }
      
      .nova-system-version,
      .nova-system-ping {
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-header-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      
      .nova-modal-badge {
        font-size: 0.75rem;
        background: rgba(6, 182, 212, 0.1);
        color: rgba(6, 182, 212, 0.9);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 1rem;
        padding: 0.25rem 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }
      
      .nova-modal-control {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 0.375rem;
        color: rgba(226, 232, 240, 0.8);
        cursor: pointer;
        transition: all 0.3s;
        position: relative;
      }
      
      .nova-modal-control:hover {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.5);
        color: rgb(239, 68, 68);
        transform: rotate(90deg);
      }
      
      .nova-control-tooltip {
        position: absolute;
        bottom: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 0.25rem;
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.9);
        white-space: nowrap;
        opacity: 0;
        transition: all 0.2s;
        pointer-events: none;
        z-index: 10;
      }
      
      .nova-modal-control:hover .nova-control-tooltip {
        opacity: 1;
        bottom: -40px;
      }
      
      .nova-modal-content {
        flex: 1;
        overflow-y: auto;
        padding: 0;
      }
      
      .nova-modal-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1.75rem;
        background: rgba(15, 23, 42, 0.9);
        border-top: 1px solid rgba(6, 182, 212, 0.3);
        position: relative;
      }
      
      .nova-footer-info {
        display: flex;
        align-items: center;
        gap: 2rem;
      }
      
      .nova-processing-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.9);
      }
      
      .nova-status-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgb(16, 185, 129);
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        position: relative;
      }
      
      .nova-status-indicator::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: rgb(16, 185, 129);
        opacity: 0.5;
        animation: pulse 2s infinite;
      }
      
      .nova-data-stats {
        display: flex;
        gap: 1.5rem;
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-ai-signature {
        font-size: 0.75rem;
        color: rgba(6, 182, 212, 0.9);
      }
      
      /* Typing Cursor Animation */
      .typing-cursor {
        animation: cursor-blink 1s step-end infinite;
      }
      
      @keyframes cursor-blink {
        from, to { opacity: 1; }
        50% { opacity: 0; }
      }
      
      /* Shimmer Text Effect */
      .shimmer-text {
        background: linear-gradient(
          90deg,
          rgba(226, 232, 240, 0.8) 0%,
          rgba(6, 182, 212, 0.8) 50%,
          rgba(226, 232, 240, 0.8) 100%
        );
        background-size: 200% auto;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: shimmer 3s linear infinite;
      }
      
      @keyframes shimmer {
        to { background-position: 200% center; }
      }
      
      /* Corner Decorations */
      .nova-corner {
        position: absolute;
        width: 1rem;
        height: 1rem;
        border-color: rgba(6, 182, 212, 0.5);
        z-index: 5;
      }
      
      .nova-corner-tl {
        top: 0;
        left: 0;
        border-top: 2px solid;
        border-left: 2px solid;
      }
      
      .nova-corner-tr {
        top: 0;
        right: 0;
        border-top: 2px solid;
        border-right: 2px solid;
      }
      
      .nova-corner-bl {
        bottom: 0;
        left: 0;
        border-bottom: 2px solid;
        border-left: 2px solid;
      }
      
      .nova-corner-br {
        bottom: 0;
        right: 0;
        border-bottom: 2px solid;
        border-right: 2px solid;
      }
      
      .nova-modal-scanline {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          to bottom,
          transparent 0%,
          rgba(6, 182, 212, 0.05) 50%,
          transparent 100%
        );
        opacity: 0.5;
        pointer-events: none;
        animation: scanline 8s linear infinite;
      }
      
      @keyframes scanline {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100%); }
      }
      
      /* Circuit Decorations */
      .nova-circuit-decoration {
        position: absolute;
        background: rgba(6, 182, 212, 0.2);
        pointer-events: none;
      }
      
      .nova-circuit-1 {
        top: 80px;
        left: 20px;
        width: 3px;
        height: 100px;
      }
      
      .nova-circuit-2 {
        top: 180px;
        left: 20px;
        width: 40px;
        height: 3px;
      }
      
      .nova-circuit-3 {
        bottom: 60px;
        right: 30px;
        width: 60px;
        height: 3px;
      }
      
      .nova-circuit-node {
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(6, 182, 212, 0.5);
        box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
      }
      
      .nova-node-1 {
        top: 80px;
        left: 20px;
        animation: node-pulse 2s infinite alternate;
      }
      
      .nova-node-2 {
        top: 180px;
        left: 60px;
        animation: node-pulse 2s infinite alternate 0.5s;
      }
      
      .nova-node-3 {
        bottom: 60px;
        right: 30px;
        animation: node-pulse 2s infinite alternate 1s;
      }
      
      @keyframes node-pulse {
        0% { transform: scale(1); opacity: 0.5; }
        100% { transform: scale(1.5); opacity: 1; }
      }
      
      /* Neural Connectivity Map */
      .neural-connectivity-map {
        position: absolute;
        inset: 0;
        z-index: -1;
        overflow: hidden;
        opacity: 0.2;
        pointer-events: none;
      }
      
      .neural-node {
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(6, 182, 212, 0.8);
        border-radius: 50%;
        animation: neural-pulse 3s infinite alternate;
      }
      
      .neural-pulse {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 1px solid rgba(6, 182, 212, 0.5);
        opacity: 0;
        animation: neural-wave 2s infinite;
      }
      
      .neural-connection {
        position: absolute;
        height: 2px;
        background: linear-gradient(90deg, rgba(6, 182, 212, 0) 0%, rgba(6, 182, 212, 0.5) 50%, rgba(6, 182, 212, 0) 100%);
        animation: connection-pulse 3s infinite alternate;
      }
      
      @keyframes neural-pulse {
        0% { transform: scale(1); opacity: 0.3; }
        100% { transform: scale(1.5); opacity: 0.8; }
      }
      
      @keyframes neural-wave {
        0% { transform: scale(1); opacity: 0.5; }
        100% { transform: scale(3); opacity: 0; }
      }
      
      @keyframes connection-pulse {
        0% { opacity: 0.3; }
        100% { opacity: 0.7; }
      }
      
      /* Analytics Dashboard Styles */
      .nova-analytics-dashboard {
        padding: 1.75rem;
        background: rgba(15, 23, 42, 0.95);
        font-family: 'JetBrains Mono', monospace;
        color: #e2e8f0;
        position: relative;
        height: 100%;
        overflow-y: auto;
      }
      
      /* Dashboard Header */
      .nova-dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.75rem;
        flex-wrap: wrap;
        gap: 1.5rem;
      }
      
      .nova-header-content {
        display: flex;
        flex-direction: column;
      }
      
      .nova-dashboard-header h1 {
        font-size: 1.75rem;
        font-weight: 700;
        background: linear-gradient(90deg, rgb(6, 182, 212) 0%, rgb(79, 70, 229) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        color: transparent;
        margin: 0;
      }
      
      .nova-header-subtitle {
        font-size: 0.875rem;
        color: rgba(226, 232, 240, 0.7);
        margin-top: 0.5rem;
      }
      
      .nova-date-filters {
        display: flex;
        gap: 1rem;
        align-items: center;
        flex-wrap: wrap;
      }
      
      .nova-date-range {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .nova-date-range label {
        font-size: 0.875rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-date-input {
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 0.375rem;
        padding: 0.5rem;
        color: rgba(226, 232, 240, 0.9);
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.875rem;
      }
      
      .nova-refresh-button {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 1rem;
        background: rgba(6, 182, 212, 0.1);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 0.375rem;
        color: rgb(6, 182, 212);
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;
        overflow: hidden;
      }
      
      .nova-refresh-button:hover {
        background: rgba(6, 182, 212, 0.2);
        border-color: rgba(6, 182, 212, 0.5);
        transform: translateY(-2px);
      }
      
      .nova-btn-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .nova-btn-pulse {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at center, rgba(6, 182, 212, 0.3) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      .nova-refresh-button:hover .nova-btn-pulse {
        opacity: 1;
        animation: btn-pulse 2s infinite;
      }
      
      @keyframes btn-pulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.2); }
      }
      
      /* Timeframe Selector */
      .nova-timeframe-selector {
        display: flex;
        align-items: center;
        margin-bottom: 1.75rem;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.5rem;
        padding: 0.5rem;
      }
      
      .nova-timeframe-button {
        padding: 0.5rem 1rem;
        background: transparent;
        border: none;
        color: rgba(226, 232, 240, 0.7);
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s;
        border-radius: 0.375rem;
      }
      
      .nova-timeframe-button:hover {
        color: rgba(226, 232, 240, 0.9);
        background: rgba(15, 23, 42, 0.8);
      }
      
      .nova-active-timeframe {
        background: rgba(6, 182, 212, 0.2);
        color: rgb(6, 182, 212);
        box-shadow: 0 0 10px rgba(6, 182, 212, 0.1);
      }
      
      .nova-timeframe-divider {
        width: 1px;
        height: 2rem;
        background: rgba(6, 182, 212, 0.2);
        margin: 0 0.5rem;
      }
      
      .nova-view-selector {
        margin-left: auto;
      }
      
      .nova-view-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 0.375rem;
        color: rgba(226, 232, 240, 0.8);
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .nova-view-button:hover {
        background: rgba(15, 23, 42, 0.9);
        border-color: rgba(6, 182, 212, 0.5);
        color: rgb(6, 182, 212);
      }
      
      .nova-active-view {
        background: rgba(6, 182, 212, 0.2);
        border-color: rgba(6, 182, 212, 0.5);
        color: rgb(6, 182, 212);
      }
      
      /* Tools Navigation */
      .nova-analytics-tools {
        margin-bottom: 2rem;
      }
      
      .nova-tools-primary {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        border-bottom: 1px solid rgba(6, 182, 212, 0.2);
        padding-bottom: 1rem;
      }
      
      .nova-tool-button {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1.25rem;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 0.375rem;
        color: rgba(226, 232, 240, 0.8);
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .nova-tool-button:hover {
        background: rgba(15, 23, 42, 0.9);
        border-color: rgba(6, 182, 212, 0.5);
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1),
                  0 0 10px rgba(6, 182, 212, 0.2);
      }
      
      .nova-active-tool {
        background: rgba(6, 182, 212, 0.15);
        border-color: rgba(6, 182, 212, 0.5);
        color: rgb(6, 182, 212);
        box-shadow: 0 0 15px rgba(6, 182, 212, 0.1);
      }
      
      .nova-tool-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        background: rgba(15, 23, 42, 0.8);
        border-radius: 0.375rem;
        transition: all 0.3s;
      }
      
      .nova-active-tool .nova-tool-icon {
        background: rgba(6, 182, 212, 0.2);
      }
      
      .nova-tools-secondary {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        padding-left: 0.5rem;
      }
      
      .nova-tab-button {
        padding: 0.5rem 1rem;
        background: transparent;
        border: none;
        color: rgba(226, 232, 240, 0.7);
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s;
        border-radius: 0.375rem;
        border-bottom: 2px solid transparent;
      }
      
      .nova-tab-button:hover {
        color: rgba(226, 232, 240, 0.9);
      }
      
      .nova-active-tab {
        color: rgb(6, 182, 212);
        border-bottom: 2px solid rgb(6, 182, 212);
      }
      
      /* Loading and Error States */
      .nova-analytics-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 60vh;
        gap: 2rem;
      }
      
      .nova-neural-loader {
        position: relative;
        width: 120px;
        height: 120px;
      }
      
      .nova-loader-brain {
        position: relative;
        width: 100%;
        height: 100%;
      }
      
      .nova-brain-hemisphere {
        position: absolute;
        width: 50px;
        height: 80px;
        top: 20px;
        border-radius: 50px 50px 0 0;
        border: 2px solid rgba(6, 182, 212, 0.7);
      }
      
      .nova-brain-hemisphere.left {
        left: 10px;
        transform: rotate(-30deg);
        border-right: none;
        animation: brain-pulse 2s infinite alternate;
      }
      
      .nova-brain-hemisphere.right {
        right: 10px;
        transform: rotate(30deg);
        border-left: none;
        animation: brain-pulse 2s infinite alternate 0.5s;
      }
      
      .nova-synapse {
        position: absolute;
        width: 6px;
        height: 6px;
        background: rgba(6, 182, 212, 0.8);
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
      }
      
      .nova-synapse.s1 {
        top: 30px;
        left: 40px;
        animation: synapse-pulse 1.2s infinite;
      }
      
      .nova-synapse.s2 {
        top: 45px;
        left: 60px;
        animation: synapse-pulse 1.2s infinite 0.2s;
      }
      
      .nova-synapse.s3 {
        top: 60px;
        left: 50px;
        animation: synapse-pulse 1.2s infinite 0.4s;
      }
      
      .nova-synapse.s4 {
        top: 40px;
        right: 35px;
        animation: synapse-pulse 1.2s infinite 0.6s;
      }
      
      .nova-synapse.s5 {
        top: 55px;
        right: 45px;
        animation: synapse-pulse 1.2s infinite 0.8s;
      }
      
      @keyframes brain-pulse {
        0% { opacity: 0.5; }
        100% { opacity: 1; }
      }
      
      @keyframes synapse-pulse {
        0% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.5); opacity: 1; }
        100% { transform: scale(1); opacity: 0.5; }
      }
      
      .nova-loader-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: rgba(15, 23, 42, 0.7);
        border-radius: 2px;
        overflow: hidden;
      }
      
      .nova-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
        width: 0;
        border-radius: 2px;
        animation: progress 2s ease-in-out infinite;
      }
      
      @keyframes progress {
        0% { width: 0; }
        50% { width: 70%; }
        70% { width: 90%; }
        100% { width: 100%; }
      }
      
      .nova-loading-text {
        font-size: 1.25rem;
        color: rgba(226, 232, 240, 0.9);
        text-align: center;
      }
      
      .nova-loading-stats {
        display: flex;
        gap: 1.5rem;
        margin-top: 1rem;
      }
      
      .nova-loading-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
      }
      
      .nova-stat-label {
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-stat-value {
        font-size: 0.875rem;
        color: rgb(6, 182, 212);
      }
      
      .nova-analytics-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 60vh;
        gap: 1.5rem;
        text-align: center;
      }
      
      .nova-error-icon {
        font-size: 4rem;
        color: rgb(239, 68, 68);
      }
      
      .nova-error-text {
        font-size: 1.5rem;
        color: rgba(226, 232, 240, 0.9);
        font-weight: 600;
      }
      
      .nova-error-subtext {
        font-size: 1rem;
        color: rgba(226, 232, 240, 0.7);
        max-width: 30rem;
        margin: 0 auto;
      }
      
      .nova-error-retry-button {
        display: flex;
        align-items: center;
        padding: 0.75rem 1.5rem;
        background: rgba(6, 182, 212, 0.1);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 0.375rem;
        color: rgb(6, 182, 212);
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s;
        margin-top: 1rem;
      }
      
      .nova-error-retry-button:hover {
        background: rgba(6, 182, 212, 0.2);
        border-color: rgba(6, 182, 212, 0.5);
        transform: translateY(-2px);
      }
      
      /* Overview Panel */
      .nova-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }
      
      .nova-stat-card {
        position: relative;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        padding: 1.5rem;
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        opacity: 0;
        transform: translateY(20px);
      }
      
      .nova-stat-card.stats-appear {
        opacity: 1;
        transform: translateY(0);
      }
      
      .nova-stat-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2), 0 0 15px rgba(6, 182, 212, 0.2);
        border-color: rgba(6, 182, 212, 0.4);
      }
      
      .nova-stat-header {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
      }
      
      .nova-stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        background: rgba(6, 182, 212, 0.1);
        border-radius: 0.5rem;
        color: rgb(6, 182, 212);
        margin-right: 1rem;
      }
      
      .nova-stat-icon.warning {
        background: rgba(239, 68, 68, 0.1);
        color: rgb(239, 68, 68);
      }
      
      .nova-stat-icon.success {
        background: rgba(16, 185, 129, 0.1);
        color: rgb(16, 185, 129);
      }
      
      .nova-stat-icon.info {
        background: rgba(79, 70, 229, 0.1);
        color: rgb(79, 70, 229);
      }
      
      .nova-stat-name {
        font-size: 0.875rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: rgba(226, 232, 240, 0.9);
        margin: 0.5rem 0 1rem;
      }
      
      .nova-stat-chart {
        margin-bottom: 0.75rem;
      }
      
      .nova-mini-chart {
        display: flex;
        align-items: flex-end;
        height: 40px;
        gap: 4px;
      }
      
      .nova-chart-bar {
        flex: 1;
        background: rgba(6, 182, 212, 0.1);
        border-radius: 2px 2px 0 0;
        transition: height 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      
      .nova-chart-bar.highlight {
        background: rgba(6, 182, 212, 0.4);
      }
      
      .nova-stat-trend {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        font-weight: 500;
      }
      
      .nova-stat-trend.positive {
        color: rgb(16, 185, 129);
      }
      
      .nova-stat-trend.negative {
        color: rgb(239, 68, 68);
      }
      
      /* Advanced Metrics */
      .nova-advanced-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2.5rem;
      }
      
      .nova-metric-card {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        padding: 1.5rem;
        position: relative;
        transition: all 0.3s;
      }
      
      .nova-metric-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1), 0 0 15px rgba(6, 182, 212, 0.1);
        border-color: rgba(6, 182, 212, 0.3);
      }
      
      .nova-metric-card.wider {
        grid-column: span 2;
      }
      
      .nova-metric-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }
      
      .nova-metric-header h3 {
        font-size: 1rem;
        font-weight: 600;
        color: rgba(226, 232, 240, 0.9);
        margin: 0;
      }
      
      .nova-metric-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem 0.75rem;
        background: rgba(6, 182, 212, 0.1);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 1rem;
        font-size: 0.75rem;
        font-weight: 500;
        color: rgb(6, 182, 212);
      }
      
      .nova-metric-badge.success {
        background: rgba(16, 185, 129, 0.1);
        border-color: rgba(16, 185, 129, 0.3);
        color: rgb(16, 185, 129);
      }
      
      .nova-metric-badge.warning {
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.3);
        color: rgb(239, 68, 68);
      }
      
      .nova-circle-progress {
        display: flex;
        justify-content: center;
        margin: 0 auto 1.5rem;
        width: 120px;
        height: 120px;
        position: relative;
      }
      
      .nova-circle-progress.large {
        width: 160px;
        height: 160px;
      }
      
      .nova-progress-ring {
        transform: rotate(-90deg);
        width: 100%;
        height: 100%;
      }
      
      .nova-progress-ring-bg {
        fill: none;
        stroke: rgba(15, 23, 42, 0.6);
        stroke-width: 4;
      }
      
      .nova-progress-ring-circle {
        fill: none;
        stroke: url(#progressGradient);
        stroke-width: 4;
        stroke-linecap: round;
        transition: stroke-dashoffset 1s ease-in-out;
      }
      
      .nova-progress-ring-circle.success {
        stroke: rgb(16, 185, 129);
      }
      
      .nova-progress-ring-circle.warning {
        stroke: rgb(239, 68, 68);
      }
      
      .nova-progress-text {
        fill: rgba(226, 232, 240, 0.9);
        font-size: 16px;
        font-weight: 600;
        dominant-baseline: middle;
        text-anchor: middle;
      }
      
      .nova-progress-text.large {
        font-size: 22px;
      }
      
      .nova-progress-subtext {
        fill: rgba(226, 232, 240, 0.7);
        font-size: 10px;
        dominant-baseline: middle;
        text-anchor: middle;
      }
      
      .nova-metric-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-trend-indicator {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        font-weight: 500;
      }
      
      .nova-trend-indicator.positive {
        color: rgb(16, 185, 129);
      }
      
      .nova-trend-indicator.negative {
        color: rgb(239, 68, 68);
      }
      
      /* Horizontal Progress Bar */
      .nova-horizontal-progress {
        margin-bottom: 1rem;
      }
      
      .nova-horizontal-bar {
        height: 8px;
        background: rgba(15, 23, 42, 0.6);
        border-radius: 4px;
        overflow: hidden;
      }
      
      .nova-horizontal-fill {
        height: 100%;
        background: linear-gradient(90deg, rgba(6, 182, 212, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%);
        border-radius: 4px;
        width: 0;
        transition: width 1s ease-in-out;
      }
      
      .nova-horizontal-fill.success {
        background: linear-gradient(90deg, rgba(16, 185, 129, 0.8) 0%, rgba(5, 150, 105, 0.8) 100%);
      }
      
      .nova-metric-detail {
        display: flex;
        flex-direction: column;
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-stat-values {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 0.5rem;
      }
      
      .nova-detail-numbers {
        font-weight: 600;
        color: rgba(226, 232, 240, 0.9);
      }
      
      .nova-detail-percent {
        color: rgb(6, 182, 212);
      }
      
      .nova-metric-details {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-top: 1.5rem;
      }
      
      .nova-detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;
      }
      
      .nova-detail-label {
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-detail-value {
        font-weight: 600;
        color: rgba(226, 232, 240, 0.9);
      }
      
      /* Chart Grid */
      .nova-chart-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }
      
      .nova-chart-container {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        overflow: hidden;
        transition: all 0.3s;
      }
      
      .nova-chart-container:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1), 0 0 15px rgba(6, 182, 212, 0.1);
        border-color: rgba(6, 182, 212, 0.3);
      }
      
      .nova-chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(6, 182, 212, 0.1);
      }
      
      .nova-chart-header.full {
        margin-bottom: 0;
        border-bottom: 1px solid rgba(6, 182, 212, 0.2);
      }
      
      .nova-chart-header.small {
        padding: 1rem;
      }
      
      .nova-chart-header h3 {
        font-size: 1rem;
        font-weight: 600;
        color: rgba(226, 232, 240, 0.9);
        margin: 0;
      }
      
      .nova-chart-controls {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .nova-chart-badge {
        font-size: 0.75rem;
        background: rgba(6, 182, 212, 0.1);
        color: rgba(6, 182, 212, 0.9);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 1rem;
        padding: 0.25rem 0.75rem;
      }
      
      .nova-chart-badge.pulse {
        position: relative;
      }
      
      .nova-chart-badge.pulse::after {
        content: '';
        position: absolute;
        top: 50%;
        right: 0.5rem;
        transform: translateY(-50%);
        width: 6px;
        height: 6px;
        background: rgb(6, 182, 212);
        border-radius: 50%;
        animation: badge-pulse 2s infinite;
      }
      
      .nova-chart-badge.info {
        background: rgba(79, 70, 229, 0.1);
        color: rgba(79, 70, 229, 0.9);
        border-color: rgba(79, 70, 229, 0.3);
      }
      
      @keyframes badge-pulse {
        0%, 100% { opacity: 1; transform: translateY(-50%) scale(1); }
        50% { opacity: 0.5; transform: translateY(-50%) scale(1.5); }
      }
      
      .nova-chart-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.375rem;
        color: rgba(226, 232, 240, 0.7);
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .nova-chart-button:hover {
        background: rgba(15, 23, 42, 0.9);
        border-color: rgba(6, 182, 212, 0.4);
        color: rgb(6, 182, 212);
      }
      
      .nova-chart-content {
        padding: 1.5rem;
      }
      
      /* Panel Specific Styling */
      .nova-trend-panel {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        overflow: hidden;
        margin-top: 2rem;
      }
      
      .nova-chart-markers {
        display: flex;
        gap: 1.5rem;
        padding: 0 1.5rem 1.5rem;
      }
      
      .nova-chart-marker {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.75rem;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.375rem;
      }
      
      .nova-marker-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        background: rgba(6, 182, 212, 0.1);
        border-radius: 0.25rem;
        color: rgb(6, 182, 212);
      }
      
      .nova-marker-icon.warning {
        background: rgba(239, 68, 68, 0.1);
        color: rgb(239, 68, 68);
      }
      
      .nova-marker-icon.success {
        background: rgba(16, 185, 129, 0.1);
        color: rgb(16, 185, 129);
      }
      
      .nova-marker-content {
        display: flex;
        flex-direction: column;
      }
      
      .nova-marker-date {
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-marker-text {
        font-size: 0.875rem;
        color: rgba(226, 232, 240, 0.9);
      }
      
      /* Overview Panel Expanded State */
      .nova-overview-panel.expanded .nova-stats-grid {
        grid-template-columns: repeat(8, 1fr);
      }
      
      .nova-overview-panel.expanded .nova-stat-card {
        grid-column: span 2;
      }
      
      .nova-overview-panel.expanded .nova-advanced-metrics {
        grid-template-columns: repeat(8, 1fr);
      }
      
      .nova-overview-panel.expanded .nova-metric-card {
        grid-column: span 2;
      }
      
      .nova-overview-panel.expanded .nova-chart-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      /* Neural Network Visualization */
      .nova-network-diagram {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        padding: 1.5rem;
        height: 350px;
        display: flex;
        position: relative;
      }
      
      .nova-layers-container {
        display: flex;
        width: 100%;
        height: 100%;
        position: relative;
      }
      
      .nova-network-labels {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.7);
        padding: 1rem 0;
        width: 100px;
      }
      
      .nova-network-vis {
        display: flex;
        flex: 1;
        position: relative;
        height: 100%;
      }
      
      .nova-layer {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        padding: 1rem 0;
        z-index: 2;
        position: relative;
      }
      
      .nova-neuron {
        width: 12px;
        height: 12px;
        background: rgba(6, 182, 212, 0.3);
        border: 1px solid rgba(6, 182, 212, 0.5);
        border-radius: 50%;
        margin: 4px 0;
        position: relative;
      }
      
      .nova-neuron.active {
        background: rgba(6, 182, 212, 0.7);
        box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        animation: neuron-pulse 2s infinite;
      }
      
      .nova-neuron.active-output {
        background: rgba(16, 185, 129, 0.7);
        border-color: rgba(16, 185, 129, 0.9);
        box-shadow: 0 0 15px rgba(16, 185, 129, 0.6);
        animation: neuron-pulse 2s infinite;
      }
      
      @keyframes neuron-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.3); }
      }
      
      .nova-layer-connections {
        flex: 1;
        position: relative;
        z-index: 1;
      }
      
      .nova-connections {
        width: 100%;
        height: 100%;
      }
      
      .nova-metrics-labels {
        position: absolute;
        bottom: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.5rem;
        padding: 0.75rem;
      }
      
      .nova-metric-row {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        font-size: 0.75rem;
      }
      
      .nova-metric-name {
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-metric-value {
        color: rgb(6, 182, 212);
        font-weight: 500;
      }
      
      /* Neural Stats */
      .nova-neural-metrics {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        padding: 1.5rem;
      }
      
      .nova-neural-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }
      
      .nova-neural-header h3 {
        font-size: 1rem;
        font-weight: 600;
        color: rgba(226, 232, 240, 0.9);
        margin: 0;
      }
      
      .nova-neural-header.full {
        margin-bottom: 0;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(6, 182, 212, 0.2);
      }
      
      .nova-neural-badge {
        font-size: 0.75rem;
        background: rgba(6, 182, 212, 0.1);
        color: rgba(6, 182, 212, 0.9);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 1rem;
        padding: 0.25rem 0.75rem;
      }
      
      .nova-neural-badge.pulse {
        position: relative;
      }
      
      .nova-neural-badge.pulse::after {
        content: '';
        position: absolute;
        top: 50%;
        right: 0.5rem;
        transform: translateY(-50%);
        width: 6px;
        height: 6px;
        background: rgb(6, 182, 212);
        border-radius: 50%;
        animation: badge-pulse 2s infinite;
      }
      
      .nova-neural-controls {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .nova-neural-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.375rem;
        color: rgba(226, 232, 240, 0.7);
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .nova-neural-button:hover {
        background: rgba(15, 23, 42, 0.9);
        border-color: rgba(6, 182, 212, 0.4);
        color: rgb(6, 182, 212);
      }
      
      .nova-neural-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-top: 1.5rem;
      }
      
      .nova-neural-stat {
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.5rem;
        padding: 1.25rem;
        transition: all 0.3s;
      }
      
      .nova-neural-stat:hover {
        transform: translateY(-5px);
        border-color: rgba(6, 182, 212, 0.4);
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
      }
      
      .nova-neural-stat-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
      
      .nova-neural-stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        background: rgba(6, 182, 212, 0.1);
        border-radius: 0.375rem;
        color: rgb(6, 182, 212);
      }
      
      .nova-neural-stat-label {
        font-size: 0.875rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-neural-stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: rgb(6, 182, 212);
        margin-bottom: 1rem;
      }
      
      .nova-neural-stat-bar {
        height: 0.5rem;
        background: rgba(15, 23, 42, 0.5);
        border-radius: 0.25rem;
        overflow: hidden;
      }
      
      .nova-neural-stat-fill {
        height: 100%;
        background: linear-gradient(90deg, rgba(6, 182, 212, 0.7) 0%, rgba(79, 70, 229, 0.7) 100%);
        border-radius: 0.25rem;
        width: 0;
        transition: width 1s ease-in-out;
      }
      
      /* Neural Grid Layout */
      .nova-neural-grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 1.5rem;
        margin-bottom: 2.5rem;
      }
      
      .nova-neural-metrics {
        grid-column: span 5;
      }
      
      .nova-neural-chart {
        grid-column: span 7;
      }
      
      /* Neural Processing Panel */
      .nova-neural-processing {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 1.5rem;
      }
      
      .nova-processing-charts {
        grid-column: span 12;
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 1.5rem;
        margin-bottom: 2.5rem;
      }
      
      .nova-chart-container {
        grid-column: span 8;
      }
      
      .nova-processing-metrics {
        grid-column: span 4;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      
      .nova-cpu-gpu-metrics,
      .nova-processing-stats {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        overflow: hidden;
      }
      
      .nova-resource-grid {
        padding: 1.25rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1.25rem;
      }
      
      .nova-resource-meter {
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.5rem;
        padding: 1rem;
        transition: all 0.3s;
      }
      
      .nova-resource-meter:hover {
        background: rgba(15, 23, 42, 0.7);
        border-color: rgba(6, 182, 212, 0.4);
      }
      
      .nova-resource-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }
      
      .nova-resource-label {
        font-size: 0.875rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-resource-value {
        font-size: 0.875rem;
        font-weight: 600;
        color: rgb(6, 182, 212);
      }
      
      .nova-resource-bar {
        height: 0.5rem;
        background: rgba(15, 23, 42, 0.7);
        border-radius: 0.25rem;
        overflow: hidden;
        margin-bottom: 0.75rem;
      }
      
      .nova-resource-fill {
        height: 100%;
        background: linear-gradient(90deg, rgba(6, 182, 212, 0.7) 0%, rgba(79, 70, 229, 0.7) 100%);
        border-radius: 0.25rem;
        width: 0;
        transition: width 1s ease-in-out;
      }
      
      .nova-resource-details {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.6);
      }
      
      .nova-stats-list {
        padding: 1.25rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1.25rem;
      }
      
      .nova-stats-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      
      .nova-stats-label {
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.7);
        margin-bottom: 0.5rem;
      }
      
      .nova-stats-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: rgb(6, 182, 212);
      }
      
      .nova-stats-unit {
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.6);
        margin-top: 0.25rem;
      }
      
      .nova-embedding-visualization {
        grid-column: span 12;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        overflow: hidden;
      }
      
      .nova-embedding-map {
        padding: 1.5rem;
        display: flex;
      }
      
      .nova-embedding-container {
        flex: 1;
        height: 400px;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.5rem;
        position: relative;
        overflow: hidden;
      }
      
      .nova-embedding-clusters {
        position: absolute;
        inset: 0;
        z-index: 1;
      }
      
      .nova-cluster {
        position: absolute;
        border-radius: 50%;
        animation: cluster-pulse 3s infinite alternate;
      }
      
      @keyframes cluster-pulse {
        0% { transform: scale(1); }
        100% { transform: scale(1.1); }
      }
      
      .nova-cluster-label {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 0.875rem;
        font-weight: 600;
        text-shadow: 0 0 5px rgba(15, 23, 42, 0.9);
      }
      
      .nova-embedding-points {
        position: absolute;
        inset: 0;
        z-index: 2;
      }
      
      .nova-point {
        position: absolute;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: point-pulse 2s infinite alternate;
      }
      
      @keyframes point-pulse {
        0% { opacity: 0.5; }
        100% { opacity: 1; }
      }
      
      .nova-embedding-axis {
        position: absolute;
        background: rgba(226, 232, 240, 0.2);
      }
      
      .nova-embedding-axis.x-axis {
        bottom: 40px;
        left: 40px;
        right: 40px;
        height: 1px;
      }
      
      .nova-embedding-axis.y-axis {
        top: 40px;
        bottom: 40px;
        left: 40px;
        width: 1px;
      }
      
      .nova-axis-label {
        position: absolute;
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-axis-label.x-label {
        bottom: 15px;
        left: 50%;
        transform: translateX(-50%);
      }
      
      .nova-axis-label.y-label {
        top: 50%;
        left: 15px;
        transform: translateY(-50%) rotate(-90deg);
        transform-origin: left center;
      }
      
      .nova-embedding-legend {
        width: 200px;
        margin-left: 1.5rem;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.5rem;
        padding: 1rem;
      }
      
      .nova-legend-header {
        font-size: 0.875rem;
        font-weight: 600;
        color: rgba(226, 232, 240, 0.9);
        margin-bottom: 1rem;
        text-align: center;
      }
      
      .nova-legend-items {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      
      .nova-legend-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .nova-legend-color {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }
      
      .nova-legend-label {
        font-size: 0.875rem;
        color: rgba(226, 232, 240, 0.8);
      }
      
      /* Neural Prediction Panel */
      .nova-prediction-panel {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 1.5rem;
      }
      
      .nova-prediction-metrics {
        grid-column: span 12;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        overflow: hidden;
        margin-bottom: 1.5rem;
      }
      
      .nova-correlation-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1.5rem;
        padding: 1.5rem;
      }
      
      .nova-correlation-card {
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.5rem;
        padding: 1.25rem;
        transition: all 0.3s;
      }
      
      .nova-correlation-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        border-color: rgba(6, 182, 212, 0.4);
      }
      
      .nova-correlation-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.25rem;
      }
      
      .nova-correlation-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 0.5rem;
        color: white;
      }
      
      .nova-correlation-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: rgba(226, 232, 240, 0.9);
      }
      
      .nova-correlation-meter {
        margin-bottom: 1rem;
      }
      
      .nova-correlation-bar {
        height: 0.5rem;
        background: rgba(15, 23, 42, 0.5);
        border-radius: 0.25rem;
        overflow: hidden;
        margin-bottom: 0.5rem;
      }
      
      .nova-correlation-fill {
        height: 100%;
        border-radius: 0.25rem;
        width: 0;
        transition: width 1s ease-in-out;
      }
      
      .nova-correlation-value {
        font-size: 0.875rem;
        font-weight: 600;
        color: rgba(226, 232, 240, 0.9);
        text-align: right;
      }
      
      .nova-correlation-detail {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
      }
      
      .nova-detail-label {
        color: rgba(226, 232, 240, 0.7);
      }
      
      .nova-detail-value {
        color: rgb(6, 182, 212);
        font-weight: 500;
      }
      
      .nova-prediction-system {
        grid-column: span 12;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        overflow: hidden;
        margin-bottom: 1.5rem;
      }
      
      .nova-prediction-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(6, 182, 212, 0.2);
      }
      
      .nova-prediction-title {
        display: flex;
        flex-direction: column;
      }
      
      .nova-prediction-subtitle {
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.7);
        margin-top: 0.25rem
    }

    `}</style>
    </div>
  );
};

export default AnalyticsModal;