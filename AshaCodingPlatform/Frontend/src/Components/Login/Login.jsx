import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../Services/Auth.service.js';
import ChatBubble from '../ChatBubble/ChatBubbleLogin.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isTyping, setIsTyping] = useState(false);
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [showHackerText, setShowHackerText] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [activeParticle, setActiveParticle] = useState(null);
  
  const canvasRef = useRef(null);
  const circuitCanvasRef = useRef(null);
  const navigate = useNavigate();
  
  // Matrix canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = [];
    
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -100);
    }
    
    const matrix = () => {
      context.fillStyle = 'rgba(17, 24, 39, 0.05)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      context.fillStyle = '#db2777';
      context.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        const text = String.fromCharCode(Math.floor(Math.random() * 128));
        context.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        drops[i]++;
      }
    };
    
    const matrixInterval = setInterval(matrix, 50);
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    // Start entry animations
    setTimeout(() => {
      setAnimationComplete(true);
    }, 1000);
    
    return () => {
      clearInterval(matrixInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Circuit animation
  useEffect(() => {
    const canvas = circuitCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const circuit = {
      nodeCount: 50,
      nodes: [],
      connections: [],
      pulses: []
    };
    
    // Create nodes
    for (let i = 0; i < circuit.nodeCount; i++) {
      circuit.nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 1
      });
    }
    
    // Create connections between close nodes
    for (let i = 0; i < circuit.nodes.length; i++) {
      for (let j = i + 1; j < circuit.nodes.length; j++) {
        const nodeA = circuit.nodes[i];
        const nodeB = circuit.nodes[j];
        
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200) {
          circuit.connections.push({
            from: i,
            to: j,
            distance
          });
        }
      }
    }
    
    // Create random pulses
    const createPulse = () => {
      if (circuit.connections.length > 0) {
        const randomConnection = circuit.connections[Math.floor(Math.random() * circuit.connections.length)];
        circuit.pulses.push({
          connection: randomConnection,
          progress: 0,
          speed: Math.random() * 0.01 + 0.005
        });
      }
    };
    
    // Setup pulse interval
    setInterval(createPulse, 500);
    
    // Draw function
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections
      ctx.strokeStyle = 'rgba(219, 39, 119, 0.15)';
      ctx.lineWidth = 1;
      
      for (const connection of circuit.connections) {
        const nodeA = circuit.nodes[connection.from];
        const nodeB = circuit.nodes[connection.to];
        
        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);
        ctx.stroke();
      }
      
      // Draw nodes
      for (const node of circuit.nodes) {
        ctx.fillStyle = 'rgba(219, 39, 119, 0.6)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw pulses
      ctx.lineWidth = 2;
      
      for (let i = circuit.pulses.length - 1; i >= 0; i--) {
        const pulse = circuit.pulses[i];
        const connection = pulse.connection;
        const nodeA = circuit.nodes[connection.from];
        const nodeB = circuit.nodes[connection.to];
        
        // Calculate position along the connection
        const x = nodeA.x + (nodeB.x - nodeA.x) * pulse.progress;
        const y = nodeA.y + (nodeB.y - nodeA.y) * pulse.progress;
        
        // Draw pulse
        ctx.fillStyle = 'rgba(219, 39, 119, 0.8)';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(x, y, 1, x, y, 8);
        gradient.addColorStop(0, 'rgba(219, 39, 119, 0.6)');
        gradient.addColorStop(1, 'rgba(219, 39, 119, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Update pulse progress
        pulse.progress += pulse.speed;
        
        // Remove completed pulses
        if (pulse.progress > 1) {
          circuit.pulses.splice(i, 1);
        }
      }
      
      requestAnimationFrame(draw);
    };
    
    draw();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Track mouse movement for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePosition({ x, y });
      setCursorPosition({ x: e.clientX, y: e.clientY });
      
      // Check if mouse is over a particle and activate it
      const particles = document.querySelectorAll('.nova-particle');
      let activated = false;
      
      particles.forEach((particle, index) => {
        const rect = particle.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
          Math.pow(e.clientX - centerX, 2) + 
          Math.pow(e.clientY - centerY, 2)
        );
        
        if (distance < 50 && !activated) {
          setActiveParticle(index);
          activated = true;
        }
      });
      
      if (!activated && activeParticle !== null) {
        setActiveParticle(null);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    // Random glitch effect
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        setGlitchEffect(true);
        setTimeout(() => setGlitchEffect(false), 200);
      }
    }, 3000);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearInterval(glitchInterval);
    };
  }, [activeParticle]);

  // Create animated particles with more variety
  useEffect(() => {
    const createParticles = () => {
      const container = document.querySelector('.nova-particles-container');
      if (container) {
        // Remove any existing particles
        const existingParticles = container.querySelectorAll('.nova-particle');
        existingParticles.forEach(p => p.remove());
        
        // Create new particles with different shapes and behaviors
        for (let i = 0; i < 70; i++) {
          const particle = document.createElement('div');
          particle.className = 'nova-particle';
          
          // Randomize properties
          const shapeType = Math.floor(Math.random() * 4); // 0: circle, 1: square, 2: triangle, 3: diamond
          const size = Math.random() * 10 + 2;
          const posX = Math.random() * 100;
          const posY = Math.random() * 100;
          const animationDuration = Math.random() * 20 + 10;
          const animationDelay = Math.random() * 5;
          const opacity = Math.random() * 0.5 + 0.1;
          
          // Apply styles
          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          particle.style.left = `${posX}%`;
          particle.style.top = `${posY}%`;
          particle.style.opacity = opacity;
          particle.style.animationDuration = `${animationDuration}s`;
          particle.style.animationDelay = `${animationDelay}s`;
          
          // Add data attributes for interactive effects
          particle.dataset.originalSize = size;
          
          // Apply different shapes
          if (shapeType === 0) { // Circle (default)
            particle.style.borderRadius = '50%';
          } else if (shapeType === 1) { // Square
            particle.style.borderRadius = '2px';
          } else if (shapeType === 2) { // Triangle
            particle.style.width = '0';
            particle.style.height = '0';
            particle.style.borderLeft = `${size/2}px solid transparent`;
            particle.style.borderRight = `${size/2}px solid transparent`;
            particle.style.borderBottom = `${size}px solid rgba(219, 39, 119, 0.3)`;
            particle.style.background = 'transparent';
          } else if (shapeType === 3) { // Diamond
            particle.style.transform = 'rotate(45deg)';
          }
          
          // Different colors
          if (Math.random() > 0.7) {
            particle.style.background = 'rgba(124, 58, 237, 0.3)';
            particle.style.boxShadow = '0 0 5px rgba(124, 58, 237, 0.5)';
          } else if (Math.random() > 0.4) {
            particle.style.background = 'rgba(219, 39, 119, 0.3)';
            particle.style.boxShadow = '0 0 5px rgba(219, 39, 119, 0.5)';
          } else {
            particle.style.background = 'rgba(14, 165, 233, 0.3)';
            particle.style.boxShadow = '0 0 5px rgba(14, 165, 233, 0.5)';
          }
          
          container.appendChild(particle);
        }
      }
    };
    
    createParticles();
    
    // Add periodic "data shower" effect
    const dataShowerInterval = setInterval(() => {
      setShowHackerText(true);
      setTimeout(() => setShowHackerText(false), 2000);
    }, 10000);
    
    return () => clearInterval(dataShowerInterval);
  }, []);

  // Typing simulation for form fields
  const simulateTyping = (input, value) => {
    setIsTyping(true);
    let index = 0;
    input.value = '';
    
    const typeChar = () => {
      if (index < value.length) {
        input.value += value[index];
        index++;
        setTimeout(typeChar, 50 + Math.random() * 50);
      } else {
        setIsTyping(false);
      }
    };
    
    typeChar();
  };
  
  const handleAutofill = () => {
    const demoEmail = 'neo@matrix.com';
    const demoPassword = 'followthewhiterabbit';
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    simulateTyping(emailInput, demoEmail);
    setTimeout(() => {
      setEmail(demoEmail);
      simulateTyping(passwordInput, demoPassword);
      setTimeout(() => {
        setPassword(demoPassword);
      }, 1000);
    }, 1200);
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Virtual authentication sequence animation
    setGlitchEffect(true);
    setTimeout(() => setGlitchEffect(false), 300);
    
    // Create custom animated elements for the authentication effect
    const formElement = e.target;
    const authOverlay = document.createElement('div');
    authOverlay.className = 'auth-sequence-overlay';
    formElement.appendChild(authOverlay);
    
    // Add animated text elements
    const authTexts = [
      'Initializing neural sync...',
      'Verifying digital signature...',
      'Establishing secure connection...',
      'Authenticating credentials...',
      'Requesting network access...',
      'Encryption protocols enabled...',
      'Quantum handshake complete...'
    ];
    
    // Animate through authentication sequence
    for (let i = 0; i < authTexts.length; i++) {
      await new Promise(resolve => {
        setTimeout(() => {
          const textElement = document.createElement('div');
          textElement.className = 'auth-sequence-text';
          textElement.innerText = authTexts[i];
          authOverlay.appendChild(textElement);
          
          setTimeout(() => {
            textElement.style.opacity = '0';
            resolve();
          }, 500);
        }, i * 450);
      });
    }
    
    // After sequence completes, call login service
    const userData = { email, password };
    try {
      const response = await loginUser(userData); 
      if(response) {
        authOverlay.innerHTML = '<div class="auth-sequence-text auth-success">Neural connection established.</div>';
        setTimeout(() => {
          navigate('/');
        }, 800);
      }
    } catch (error) {
      console.error(error);
      authOverlay.innerHTML = '<div class="auth-sequence-text auth-error">Neural authentication failed.</div>';
    } finally {
      setTimeout(() => {
        authOverlay.remove();
        setIsLoading(false);
      }, 800);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-gray-900 text-gray-100 overflow-hidden relative ${glitchEffect ? 'cyber-glitch' : ''}`}>
      {/* Matrix canvas background */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-40"></canvas>
      
      {/* Circuit board animation */}
      <canvas ref={circuitCanvasRef} className="fixed inset-0 z-0 opacity-30"></canvas>
      
      {/* Cursor follower */}
      <div 
        className="cyber-cursor-follower" 
        style={{
          left: `${cursorPosition.x}px`,
          top: `${cursorPosition.y}px`
        }}
      >
        <div className="cyber-cursor-ring"></div>
        <div className="cyber-cursor-dot"></div>
      </div>
      
      {/* Data shower effect */}
      {showHackerText && (
        <div className="hacker-text-container">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className="hacker-text-line"
              style={{ 
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            >
              {Array.from({ length: 12 }).map((_, j) => (
                String.fromCharCode(33 + Math.floor(Math.random() * 94))
              ))}
            </div>
          ))}
        </div>
      )}
      
      {/* Background particle animation container */}
      <div className="nova-particles-container"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="cyber-grid"></div>
      </div>
      
      {/* Holographic circles */}
      <div className="holographic-container">
        <div className="holographic-circle h-circle-1"></div>
        <div className="holographic-circle h-circle-2"></div>
        <div className="holographic-circle h-circle-3"></div>
      </div>
      
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full filter blur-[150px] bg-pink-900 opacity-20 animate-pulse-slow"
        style={{transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`}}
      ></div>
      <div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full filter blur-[150px] bg-cyan-900 opacity-20 animate-pulse-slow animation-delay-1000"
        style={{transform: `translate(${-mousePosition.x * 30}px, ${-mousePosition.y * 30}px)`}}
      ></div>
      
      {/* Floating code fragments */}
      <div className="code-fragments">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i}
            className="code-fragment"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 18}%`,
              animationDelay: `${i * 0.5}s`
            }}
          >
            <pre className="code-text">{`function auth() {
  return encrypt(
    credentials,
    quantumKey
  );
}`}</pre>
          </div>
        ))}
      </div>

      {/* Left side - Brand */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-pink-900/60 to-indigo-900/60 flex flex-col justify-center items-center p-8 md:p-12 relative z-10 backdrop-blur-sm">
        <div 
          className="max-w-md w-full cyber-content-panel p-8 relative floating-panel"
          style={{
            transform: `translateY(${Math.sin(Date.now() / 2000) * 10}px) rotateX(${mousePosition.y * 5}deg) rotateY(${-mousePosition.x * 5}deg)`,
            transition: "transform 0.1s ease-out"
          }}
        >
          {/* Holographic logo */}
          <div className="holographic-logo">
            <div className="logo-glitch-container mb-8 mx-auto">
              <div className="logo-glitch"></div>
              <div className="logo-base">ASHA</div>
              <div className="logo-scan"></div>
              <div className="logo-glow"></div>
            </div>
          </div>
          
          <h1 className="nova-hero-title mb-6 text-center">
            <span className="nova-title-line cyber-text-glitch" data-text="Welcome to Asha">Welcome to Asha</span>
            <span className="nova-blink">_</span>
          </h1>
          
          <div className="cyber-text-scramble mb-8 text-center">
            <p className="text-gray-300 leading-relaxed">
              Your journey to becoming a better programmer starts here. Practice, learn, and grow with our comprehensive neural coding platform.
            </p>
          </div>
          
          <div className="cyber-feature-card backdrop-blur-sm position-relative hover-expand">
            <div className="card-noise"></div>
            <div className="card-overlay"></div>
            <h2 className="cyber-section-title mb-3">Why join Asha?</h2>
            <ul className="space-y-3 text-gray-300">
              {[
                'Practice with hundreds of coding problems',
                'Prepare for technical interviews',
                'Connect with other developers',
                'Track your progress'
              ].map((item, index) => (
                <li key={index} className="flex items-start cyber-feature-list-item">
                  <div className="cyber-list-bullet pulse-animation"></div>
                  <span className="hover-highlight">{item}</span>
                  <div className="feature-icon-container">
                    <div className="feature-icon-circle"></div>
                    <div className="feature-icon-pulse"></div>
                  </div>
                </li>
              ))}
            </ul>
            
            {/* Demo login button */}
            <button 
              onClick={handleAutofill}
              className="cyber-demo-button mt-6"
              disabled={isTyping}
            >
              <span className="demo-button-text">Use Demo Credentials</span>
              <div className="demo-button-circuit"></div>
              <div className="demo-button-glow"></div>
              {isTyping && <div className="demo-typing-indicator">Auto-filling...</div>}
            </button>
          </div>
          
          {/* Animated binary data stream */}
          <div className="binary-stream-container">
            {Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={i} 
                className="binary-stream"
                style={{
                  left: `${i * 10}%`,
                  animationDelay: `${i * 0.2}s`
                }}
              ></div>
            ))}
          </div>
          
          {/* Decorative elements */}
          <div className="cyber-corner cyber-corner-tl"></div>
          <div className="cyber-corner cyber-corner-tr"></div>
          <div className="cyber-corner cyber-corner-bl"></div>
          <div className="cyber-corner cyber-corner-br"></div>
          <div className="cyber-scan-line"></div>
          
          {/* Decorative circuit lines */}
          <div className="circuit-lines">
            <div className="circuit-line circuit-line-1"></div>
            <div className="circuit-line circuit-line-2"></div>
            <div className="circuit-line circuit-line-3"></div>
            <div className="circuit-line circuit-line-4"></div>
            <div className="circuit-node circuit-node-1"></div>
            <div className="circuit-node circuit-node-2"></div>
            <div className="circuit-node circuit-node-3"></div>
          </div>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-8 md:p-12 relative z-10">
        <div className="max-w-md w-full">
          <div 
            className="cyber-content-panel p-8 relative hover-reactive"
            style={{
              transform: `rotateX(${mousePosition.y * 2}deg) rotateY(${mousePosition.x * 2}deg)`,
              transition: "transform 0.1s ease-out"
            }}
          >
            <div className="reactive-bg"></div>
            <div className="energy-field"></div>
            
            <div className="digital-nodes">
              {Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={i} 
                  className="digital-node"
                  style={{
                    top: `${10 + Math.random() * 80}%`,
                    left: `${10 + Math.random() * 80}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                ></div>
              ))}
            </div>
            
            <div className="mb-8 relative">
              <div className="cyber-hologram">
                <div className="hologram-ring"></div>
                <div className="hologram-ring"></div>
                <div className="hologram-ring"></div>
              </div>
              
              <h2 className="cyber-section-title text-xl mb-2 scanner-text" data-text="Neural Network Authentication">
                Neural Network Authentication
              </h2>
              <p className="text-gray-400 typing-animation">
                Enter your credentials to continue your coding journey
              </p>
              
              <div className="cyber-badges">
                <span className="cyber-badge">Encrypted</span>
                <span className="cyber-badge pulse-badge">Secure</span>
                <span className="cyber-badge">v3.7.6</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6 auth-form">
              <div className="cyber-form-group interactive">
                <label htmlFor="email" className="cyber-form-label shimmer-text">
                  Email Address
                </label>
                <div className="cyber-input-container">
                  <div className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input 
                    type="email" 
                    id="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="Enter your email"
                    className="cyber-input retro-input"
                  />
                  <div className="cyber-input-focus-bar"></div>
                  <div className="input-analyzer">
                    <div className="analyzer-dot"></div>
                    <div className="analyzer-dot"></div>
                    <div className="analyzer-dot"></div>
                    <div className="analyzer-line"></div>
                  </div>
                </div>
              </div>
              
              <div className="cyber-form-group interactive">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="cyber-form-label shimmer-text">
                    Secure Password
                  </label>
                  <a href="#" className="cyber-form-link text-sm pulse-text">
                    Reset biometric key?
                  </a>
                </div>
                <div className="cyber-input-container">
                  <div className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input 
                    type="password" 
                    id="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="Enter your password"
                    className="cyber-input retro-input"
                  />
                  <div className="cyber-input-focus-bar"></div>
                  <div className="input-analyzer">
                    <div className="analyzer-dot"></div>
                    <div className="analyzer-dot"></div>
                    <div className="analyzer-dot"></div>
                    <div className="analyzer-line"></div>
                  </div>
                  <div className="password-strength">
                    <div className="strength-bar"></div>
                    <div className="strength-bar"></div>
                    <div className="strength-bar"></div>
                    <div className="strength-bar"></div>
                  </div>
                </div>
              </div>
              
              <div className="biometric-option">
                <div className="biometric-icon">
                  <div className="fingerprint-scanner">
                    <div className="scanner-light"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                  </div>
                </div>
                <span className="biometric-label">Biometric Authentication</span>
                <span className="biometric-status">Unavailable</span>
              </div>
              
              <button 
                type="submit"
                className={`cyber-button-primary w-full ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="cyber-spinner mr-2">
                      <div className="cyber-spinner-ring"></div>
                      <div className="cyber-spinner-ring"></div>
                    </div>
                    <span className="loading-text">Authenticating</span>
                    <span className="loading-dots">
                      <span className="dot dot1">.</span>
                      <span className="dot dot2">.</span>
                      <span className="dot dot3">.</span>
                    </span>
                  </>
                ) : (
                  <>
                    <div className="button-content">
                      <div className="button-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                      <span className="relative z-10">Neural Authentication</span>
                    </div>
                    <span className="cyber-button-glow"></span>
                    <div className="button-particles">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <span key={i} className="button-particle"></span>
                      ))}
                    </div>
                    <div className="button-lines">
                      <span className="button-line"></span>
                      <span className="button-line"></span>
                    </div>
                  </>
                )}
              </button>
            </form>
            
            <div className="verification-code-container">
              <div className="verification-code-digits">
                <div className="digit-container">
                  <div className="digit-placeholder"></div>
                </div>
                <div className="digit-container">
                  <div className="digit-placeholder"></div>
                </div>
                <div className="digit-container">
                  <div className="digit-placeholder"></div>
                </div>
                <div className="digit-container">
                  <div className="digit-placeholder"></div>
                </div>
                <div className="digit-container">
                  <div className="digit-placeholder"></div>
                </div>
                <div className="digit-container">
                  <div className="digit-placeholder"></div>
                </div>
              </div>
              <div className="verification-text">
                <span>2FA Ready</span>
              </div>
            </div>
            
            <div className="mt-8 text-center neon-text-container">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="cyber-text-link neon-text">
                  Create Neural Profile
                  <span className="neon-underline"></span>
                </Link>
              </p>
            </div>
            
            <div className="mt-8 text-center">
              <Link 
                to="/" 
                className="cyber-link-button inline-flex items-center hover-transform-button"
              >
                <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span className="text-gradient">Return to Central Hub</span>
                <div className="link-button-glow"></div>
              </Link>
            </div>
            
            {/* Decorative elements */}
            <div className="cyber-corner cyber-corner-tl animated-corner"></div>
            <div className="cyber-corner cyber-corner-tr animated-corner"></div>
            <div className="cyber-corner cyber-corner-bl animated-corner"></div>
            <div className="cyber-corner cyber-corner-br animated-corner"></div>
            <div className="cyber-scan-line animated-scan"></div>
            
            {/* Frequency waves */}
            <div className="frequency-container">
              <div className="frequency-wave wave1"></div>
              <div className="frequency-wave wave2"></div>
              <div className="frequency-wave wave3"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Bubble */}
      <ChatBubble />
      
      {/* Custom styling */}
      <style jsx>{`
        /* Cyberpunk Grid */
        .cyber-grid {
          position: absolute;
          inset: 0;
          background-image: 
              linear-gradient(to right, rgba(219, 39, 119, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(219, 39, 119, 0.05) 1px, transparent 1px);
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
          color: rgba(219, 39, 119, 0.7);
          font-family: 'Courier New', monospace;
          font-size: 14px;
          white-space: nowrap;
          text-shadow: 0 0 5px rgba(219, 39, 119, 0.5);
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
        
        /* Cursor Follower */
        .cyber-cursor-follower {
          position: fixed;
          width: 40px;
          height: 40px;
          pointer-events: none;
          z-index: 100;
          transform: translate(-50%, -50%);
          transition: transform 0.1s;
        }
        
        .cyber-cursor-ring {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(219, 39, 119, 0.5);
          border-radius: 50%;
          opacity: 0.5;
          animation: cursor-pulse 2s infinite;
        }
        
        .cyber-cursor-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 5px;
          height: 5px;
          background: rgb(219, 39, 119);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 10px rgba(219, 39, 119, 0.8);
        }
        
        @keyframes cursor-pulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.5; }
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
          border: 1px solid rgba(219, 39, 119, 0.3);
          box-shadow: 0 0 20px rgba(219, 39, 119, 0.1) inset;
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
          border: 1px solid rgba(219, 39, 119, 0.3);
          border-radius: 5px;
          animation: float-code 15s ease-in-out infinite;
        }
        
        .code-text {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: rgba(219, 39, 119, 0.8);
          margin: 0;
        }
        
        @keyframes float-code {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(2deg); opacity: 0.6; }
        }
        
        /* Content Panel */
        .cyber-content-panel {
          background: rgba(17, 24, 39, 0.7);
          border: 1px solid rgba(219, 39, 119, 0.2);
          border-radius: 0.5rem;
          backdrop-filter: blur(10px);
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 0 0 1px rgba(219, 39, 119, 0.1) inset,
            0 0 20px rgba(219, 39, 119, 0.1);
          position: relative;
          transition: transform 0.5s ease-out;
        }
        
        /* Floating Animation */
        .floating-panel {
          animation: float-panel 6s ease-in-out infinite;
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        
        @keyframes float-panel {
          0%, 100% { transform: translateY(0) rotateX(0) rotateY(0); }
          50% { transform: translateY(-10px) rotateX(2deg) rotateY(-2deg); }
        }
        
        /* Hover Reactive */
        .hover-reactive {
          transition: all 0.3s ease;
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        
        .hover-reactive:hover {
          box-shadow: 
            0 10px 25px -5px rgba(0, 0, 0, 0.2),
            0 10px 10px -5px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(219, 39, 119, 0.3) inset,
            0 0 30px rgba(219, 39, 119, 0.2);
          transform: scale(1.02) translateY(-5px);
        }
        
        .reactive-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(219, 39, 119, 0.15) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        
        .hover-reactive:hover .reactive-bg {
          opacity: 1;
        }
        
        .energy-field {
          position: absolute;
          inset: -2px;
          border-radius: 0.65rem;
          background: linear-gradient(90deg, rgba(219, 39, 119, 0) 0%, rgba(219, 39, 119, 0.3) 50%, rgba(219, 39, 119, 0) 100%);
          opacity: 0;
          filter: blur(5px);
          transition: opacity 0.3s;
          pointer-events: none;
          z-index: -1;
          animation: rotate-gradient 5s linear infinite;
        }
        
        .hover-reactive:hover .energy-field {
          opacity: 0.7;
        }
        
        @keyframes rotate-gradient {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Digital Nodes */
        .digital-nodes {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        
        .digital-node {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(219, 39, 119, 0.7);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(219, 39, 119, 0.8);
          animation: pulse-node 3s infinite;
        }
        
        @keyframes pulse-node {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.5); opacity: 0.8; }
        }
        
        /* Holographic Logo */
        .holographic-logo {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;
          perspective: 800px;
        }
        
        .logo-glitch-container {
          position: relative;
          width: 120px;
          height: 120px;
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
          color: rgb(219, 39, 119);
          text-shadow: 0 0 10px rgba(219, 39, 119, 0.6);
          letter-spacing: 2px;
        }
        
        .logo-glitch {
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, rgba(219, 39, 119, 0.2), rgba(124, 58, 237, 0.2));
          border-radius: 50%;
          filter: blur(10px);
          animation: logo-pulse 3s ease-in-out infinite alternate;
        }
        
        .logo-scan {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 5px;
          background: linear-gradient(90deg, transparent, rgba(219, 39, 119, 0.8), transparent);
          filter: blur(2px);
          animation: logo-scan 3s linear infinite;
        }
        
        .logo-glow {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          border: 1px solid rgba(219, 39, 119, 0.3);
          box-shadow: 0 0 15px rgba(219, 39, 119, 0.4) inset,
                      0 0 5px rgba(219, 39, 119, 0.2);
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
          100% { transform: translateY(120px); opacity: 0; }
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
          background: linear-gradient(90deg, rgb(219, 39, 119) 0%, rgb(124, 58, 237) 50%, rgb(14, 165, 233) 100%);
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
        
        /* Binary Stream */
        .binary-stream-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: -1;
        }
        
        .binary-stream {
          position: absolute;
          top: 0;
          width: 1px;
          height: 100%;
          background: repeating-linear-gradient(
            to bottom,
            rgba(219, 39, 119, 0.3) 0%,
            rgba(219, 39, 119, 0.3) 5%,
            transparent 5%,
            transparent 10%
          );
          animation: binary-flow 3s linear infinite;
        }
        
        @keyframes binary-flow {
          0% { background-position: 0 -200%; }
          100% { background-position: 0 200%; }
        }
        
        /* Circuit Lines */
        .circuit-lines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        
        .circuit-line {
          position: absolute;
          background: rgba(219, 39, 119, 0.3);
        }
        
        .circuit-line-1 {
          top: 30%;
          left: 0;
          width: 100%;
          height: 1px;
        }
        
        .circuit-line-2 {
          top: 0;
          left: 40%;
          width: 1px;
          height: 100%;
        }
        
        .circuit-line-3 {
          top: 65%;
          left: 0;
          width: 100%;
          height: 1px;
        }
        
        .circuit-line-4 {
          top: 0;
          left: 80%;
          width: 1px;
          height: 100%;
        }
        
        .circuit-node {
          position: absolute;
          width: 6px;
          height: 6px;
          background: rgba(219, 39, 119, 0.6);
          border-radius: 50%;
          box-shadow: 0 0 5px rgba(219, 39, 119, 0.7);
          animation: circuit-pulse 2s ease-in-out infinite alternate;
        }
        
        .circuit-node-1 {
          top: 30%;
          left: 40%;
          animation-delay: 0s;
        }
        
        .circuit-node-2 {
          top: 65%;
          left: 40%;
          animation-delay: 0.5s;
        }
        
        .circuit-node-3 {
          top: 65%;
          left: 80%;
          animation-delay: 1s;
        }
        
        @keyframes circuit-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 1; }
        }
        
        /* Card Hover Effects */
        .hover-expand {
          transition: all 0.3s ease;
        }
        
        .hover-expand:hover {
          transform: scale(1.02);
          box-shadow: 0 0 20px rgba(219, 39, 119, 0.3);
        }
        
        .card-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.05;
          mix-blend-mode: overlay;
          pointer-events: none;
        }
        
        .card-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 0%, rgba(17, 24, 39, 0.8) 100%);
          opacity: 0.8;
          pointer-events: none;
        }
        
        /* Hover Highlight Effect */
        .hover-highlight {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .hover-highlight:hover {
          color: rgb(219, 39, 119);
          text-shadow: 0 0 5px rgba(219, 39, 119, 0.5);
          transform: translateX(5px);
        }
        
        /* Pulse Animation for Bullets */
        .pulse-animation {
          animation: bullet-pulse 2s infinite;
        }
        
        @keyframes bullet-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.7; }
        }
        
        /* Feature Icon Animations */
        .feature-icon-container {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .cyber-feature-list-item:hover .feature-icon-container {
          opacity: 1;
        }
        
        .feature-icon-circle {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(219, 39, 119, 0.5);
          border-radius: 50%;
        }
        
        .feature-icon-pulse {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(219, 39, 119, 0.3);
          animation: icon-pulse 1.5s infinite;
        }
        
        @keyframes icon-pulse {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        /* Demo Button */
        .cyber-demo-button {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.25rem;
          background: rgba(17, 24, 39, 0.7);
          border: 1px solid rgba(219, 39, 119, 0.4);
          border-radius: 0.375rem;
          color: rgba(219, 39, 119, 0.9);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .cyber-demo-button:hover {
          background: rgba(17, 24, 39, 0.9);
          border-color: rgba(219, 39, 119, 0.6);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1),
                    0 0 10px rgba(219, 39, 119, 0.3);
        }
        
        .cyber-demo-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .demo-button-text {
          position: relative;
          z-index: 1;
        }
        
        .demo-button-circuit {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(90deg, rgba(219, 39, 119, 0) 0%, rgba(219, 39, 119, 0.3) 50%, rgba(219, 39, 119, 0) 100%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .cyber-demo-button:hover .demo-button-circuit {
          opacity: 1;
          animation: circuit-shift 3s infinite linear;
        }
        
        @keyframes circuit-shift {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .demo-button-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(219, 39, 119, 0.5) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .cyber-demo-button:hover .demo-button-glow {
          opacity: 0.3;
        }
        
        .demo-typing-indicator {
          position: absolute;
          bottom: -20px;
          left: 0;
          width: 100%;
          text-align: center;
          font-size: 12px;
          color: rgba(219, 39, 119, 0.8);
          animation: typing-blink 0.8s infinite;
        }
        
        @keyframes typing-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        /* Cyber Hologram */
        .cyber-hologram {
          position: absolute;
          top: -15px;
          left: -15px;
          width: 30px;
          height: 30px;
          z-index: 1;
        }
        
        .hologram-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px solid rgba(219, 39, 119, 0.5);
          animation: hologram-rotate 10s linear infinite;
        }
        
        .hologram-ring:nth-child(1) {
          animation-duration: 7s;
        }
        
        .hologram-ring:nth-child(2) {
          inset: 5px;
          animation-duration: 14s;
          animation-direction: reverse;
        }
        
        .hologram-ring:nth-child(3) {
          inset: 10px;
          animation-duration: 10s;
        }
        
        @keyframes hologram-rotate {
          0% { transform: rotate(0); }
          100% { transform: rotate(360deg); }
        }
        
        /* Scanner Text */
        .scanner-text {
          position: relative;
          overflow: hidden;
        }
        
        .scanner-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgb(219, 39, 119) 50%,
            transparent 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: text-scan 3s ease-in-out infinite;
        }
        
        @keyframes text-scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        /* Typing Animation */
        .typing-animation {
          overflow: hidden;
          border-right: 2px solid rgb(219, 39, 119);
          white-space: nowrap;
          animation: typing 4s steps(40) 1s 1 normal both, blink-caret 1s steps(1) infinite;
        }
        
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
        
        @keyframes blink-caret {
          from, to { border-color: transparent; }
          50% { border-color: rgb(219, 39, 119); }
        }
        
        /* Cyber Badges */
        .cyber-badges {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        
        .cyber-badge {
          display: inline-block;
          padding: 3px 8px;
          font-size: 10px;
          font-weight: 500;
          color: rgba(219, 39, 119, 0.9);
          background: rgba(219, 39, 119, 0.1);
          border: 1px solid rgba(219, 39, 119, 0.3);
          border-radius: 100px;
        }
        
        .pulse-badge {
          animation: badge-pulse 2s infinite;
        }
        
        @keyframes badge-pulse {
          0%, 100% { 
            opacity: 1; 
            background: rgba(219, 39, 119, 0.1);
          }
          50% { 
            opacity: 0.8; 
            background: rgba(219, 39, 119, 0.2);
          }
        }
        
        /* Interactive Form Elements */
        .cyber-form-group.interactive {
          position: relative;
        }
        
        .input-icon {
          position: absolute;
          top: 50%;
          left: 12px;
          transform: translateY(-50%);
          color: rgba(219, 39, 119, 0.7);
          z-index: 1;
        }
        
        .retro-input {
          padding-left: 40px !important;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
        }
        
        .retro-input:focus {
          box-shadow: 0 0 0 2px rgba(219, 39, 119, 0.5) !important;
          background: rgba(17, 24, 39, 0.95) !important;
        }
        
        /* Shimmer Text */
        .shimmer-text {
          background: linear-gradient(
            90deg,
            rgba(226, 232, 240, 0.8) 0%,
            rgba(219, 39, 119, 0.8) 50%,
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
        
        /* Input Analyzer */
        .input-analyzer {
          position: absolute;
          top: 0;
          right: 0;
          height: 100%;
          width: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .cyber-input:focus ~ .input-analyzer {
          opacity: 1;
        }
        
        .analyzer-dot {
          width: 3px;
          height: 3px;
          background: rgba(219, 39, 119, 0.7);
          border-radius: 50%;
          margin: 2px 0;
          animation: analyzer-pulse 1s infinite alternate;
        }
        
        .analyzer-dot:nth-child(2) {
          animation-delay: 0.3s;
        }
        
        .analyzer-dot:nth-child(3) {
          animation-delay: 0.6s;
        }
        
        .analyzer-line {
          width: 15px;
          height: 1px;
          background: rgba(219, 39, 119, 0.5);
          margin-top: 5px;
        }
        
        @keyframes analyzer-pulse {
          from { transform: scale(1); }
          to { transform: scale(1.5); }
        }
        
        /* Password Strength */
        .password-strength {
          position: absolute;
          bottom: -10px;
          left: 0;
          width: 100%;
          height: 3px;
          display: flex;
          gap: 4px;
          padding: 0 12px;
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        #password:focus ~ .password-strength {
          opacity: 1;
        }
        
        .strength-bar {
          flex: 1;
          height: 100%;
          background: rgba(239, 68, 68, 0.5);
          animation: strength-appear 0.5s ease-out forwards;
          transform-origin: left;
          transform: scaleX(0);
        }
        
        .strength-bar:nth-child(2) {
          animation-delay: 0.1s;
          background: rgba(245, 158, 11, 0.5);
        }
        
        .strength-bar:nth-child(3) {
          animation-delay: 0.2s;
          background: rgba(16, 185, 129, 0.5);
        }
        
        .strength-bar:nth-child(4) {
          animation-delay: 0.3s;
          background: rgba(6, 182, 212, 0.5);
        }
        
        @keyframes strength-appear {
          to { transform: scaleX(1); }
        }
        
        /* Biometric Option */
        .biometric-option {
          display: flex;
          align-items: center;
          padding: 12px;
          background: rgba(17, 24, 39, 0.8);
          border: 1px solid rgba(219, 39, 119, 0.2);
          border-radius: 8px;
          margin-bottom: 16px;
        }
        
        .biometric-icon {
          flex-shrink: 0;
          margin-right: 12px;
          color: rgba(219, 39, 119, 0.7);
        }
        
        .fingerprint-scanner {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .scanner-light {
          position: absolute;
          inset: 0;
          background: rgba(219, 39, 119, 0.1);
          border-radius: 50%;
          animation: scanner-light 2s infinite;
        }
        
        @keyframes scanner-light {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        
        .biometric-label {
          font-size: 14px;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
          margin-right: auto;
        }
        
        .biometric-status {
          font-size: 12px;
          color: rgba(226, 232, 240, 0.6);
          background: rgba(239, 68, 68, 0.2);
          padding: 3px 8px;
          border-radius: 100px;
        }
        
        /* Animated Button Effects */
        .button-content {
          display: flex;
          align-items: center;
          position: relative;
          z-index: 2;
        }
        
        .button-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
        }
        
        .button-particles {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }
        
        .button-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          opacity: 0;
          pointer-events: none;
        }
        
        .cyber-button-primary:hover .button-particle {
          animation: particle-appear 0.6s ease-out forwards;
        }
        
        @keyframes particle-appear {
          0% {
            opacity: 0.8;
            transform: translate(calc(var(--x, 0) * 1px), calc(var(--y, 0) * 1px)) scale(0);
          }
          100% {
            opacity: 0;
            transform: translate(
              calc(var(--x, 0) * 1px + var(--dx, 0) * 50px),
              calc(var(--y, 0) * 1px + var(--dy, 0) * 50px)
            ) scale(1);
          }
        }
        
        .button-lines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent 30%, black 50%, transparent 70%);
          z-index: 1;
        }
        
        .button-line {
          position: absolute;
          top: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
          transform: translateX(-100%);
        }
        
        .cyber-button-primary:hover .button-line:nth-child(1) {
          animation: button-line 2s infinite;
        }
        
        .cyber-button-primary:hover .button-line:nth-child(2) {
          animation: button-line 2s 1s infinite;
        }
        
        @keyframes button-line {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        /* Loading Animation Enhanced */
        .loading-text {
          letter-spacing: 1px;
        }
        
        .loading-dots {
          display: inline-block;
          width: 20px;
          text-align: left;
          margin-left: 5px;
        }
        
        .dot {
          display: inline-block;
          animation: dot-bounce 1s infinite;
          opacity: 0;
        }
        
        .dot1 {
          animation-delay: 0s;
        }
        
        .dot2 {
          animation-delay: 0.2s;
        }
        
        .dot3 {
          animation-delay: 0.4s;
        }
        
        @keyframes dot-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
        
        /* Pulse Text Animation */
        .pulse-text {
          animation: text-color-pulse 2s infinite;
        }
        
        @keyframes text-color-pulse {
          0%, 100% { color: rgba(219, 39, 119, 0.8); }
          50% { color: rgba(236, 72, 153, 1); }
        }
        
        /* Verification Code Animation */
        .verification-code-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 24px;
          margin-bottom: 24px;
          opacity: 0.7;
          transition: opacity 0.3s;
        }
        
        .verification-code-container:hover {
          opacity: 1;
        }
        
        .verification-code-digits {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .digit-container {
          width: 20px;
          height: 30px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .digit-placeholder {
          width: 100%;
          height: 2px;
          background: rgba(219, 39, 119, 0.3);
          position: absolute;
          bottom: 0;
        }
        
        .verification-text {
          font-size: 12px;
          color: rgba(219, 39, 119, 0.7);
        }
        
        /* Neon Text and Link */
        .neon-text-container {
          position: relative;
        }
        
        .neon-text {
          position: relative;
          color: rgb(219, 39, 119) !important;
          text-shadow: 0 0 5px rgba(219, 39, 119, 0.7) !important;
        }
        
        .neon-underline {
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 0;
          height: 1px;
          background: rgb(219, 39, 119);
          box-shadow: 0 0 5px rgba(219, 39, 119, 0.7);
          transition: width 0.3s;
        }
        
        .neon-text:hover .neon-underline {
          width: 100%;
        }
        
        /* Hover Transform Button */
        .hover-transform-button {
          transition: all 0.3s;
        }
        
        .hover-transform-button:hover {
          transform: scale(1.05) translateY(-3px) !important;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1),
                    0 0 10px rgba(219, 39, 119, 0.3);
        }
        
        .text-gradient {
          background: linear-gradient(90deg, rgb(219, 39, 119) 0%, rgb(124, 58, 237) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }
        
        .link-button-glow {
          position: absolute;
          inset: 0;
          border-radius: 0.375rem;
          opacity: 0;
          z-index: -1;
          background: radial-gradient(circle at center, rgba(219, 39, 119, 0.5) 0%, transparent 70%);
          transition: opacity 0.3s;
        }
        
        .hover-transform-button:hover .link-button-glow {
          opacity: 0.5;
        }
        
        /* Animated Corners */
        .animated-corner {
          animation: corner-pulse 2s infinite alternate;
        }
        
        @keyframes corner-pulse {
          from { border-color: rgba(219, 39, 119, 0.5); }
          to { border-color: rgba(219, 39, 119, 1); box-shadow: 0 0 5px rgba(219, 39, 119, 0.5); }
        }
        
        .animated-scan {
          background: linear-gradient(90deg, transparent, rgba(219, 39, 119, 0.9), transparent);
          opacity: 0.7;
          animation: scan-line 1.5s linear infinite;
        }
        
        /* Frequency Waves */
        .frequency-container {
          position: absolute;
          bottom: 10px;
          right: 10px;
          width: 40px;
          height: 20px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }
        
        .frequency-wave {
          width: 2px;
          background: rgba(219, 39, 119, 0.7);
          animation: wave-pulse infinite;
        }
        
        .wave1 {
          height: 100%;
          animation-duration: 0.8s;
        }
        
        .wave2 {
          height: 70%;
          animation-duration: 1.1s;
        }
        
        .wave3 {
          height: 40%;
          animation-duration: 0.7s;
        }
        
        @keyframes wave-pulse {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }
        
        /* Auth Sequence Styling */
        .auth-sequence-overlay {
          position: absolute;
          inset: 0;
          background: rgba(17, 24, 39, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 100;
          backdrop-filter: blur(5px);
          border-radius: 0.5rem;
        }
        
        .auth-sequence-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1rem;
          color: rgb(219, 39, 119);
          margin: 5px 0;
          opacity: 0;
          transform: translateY(10px);
          animation: sequence-fade-in 0.5s forwards;
        }
        
        @keyframes sequence-fade-in {
          to { opacity: 1; transform: translateY(0); }
        }
        
        .auth-success {
          color: rgb(16, 185, 129);
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .auth-error {
          color: rgb(239, 68, 68);
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        /* Section Titles */
        .cyber-section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: rgb(219, 39, 119);
          letter-spacing: 0.025em;
        }
        
        /* Nova Hero Title */
        .nova-hero-title {
          font-size: 2.5rem;
          font-weight: 700;
          display: flex;
          flex-direction: column;
          line-height: 1.2;
          letter-spacing: 0.5px;
        }
        
        .nova-title-line {
          background: linear-gradient(90deg, rgb(219, 39, 119) 0%, rgb(124, 58, 237) 50%, rgb(14, 165, 233) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 10px rgba(219, 39, 119, 0.5);
          margin-bottom: 0.25rem;
        }
        
        .nova-blink {
          animation: blink 1s step-end infinite;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        /* Particles */
        .nova-particles-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        
        .nova-particle {
          position: absolute;
          animation: float-particle 15s infinite linear;
          transition: transform 0.5s, box-shadow 0.5s, opacity 0.5s;
        }
        
        @keyframes float-particle {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) translateX(20px) rotate(90deg);
          }
          50% {
            transform: translateY(0) translateX(40px) rotate(180deg);
          }
          75% {
            transform: translateY(20px) translateX(20px) rotate(270deg);
          }
          100% {
            transform: translateY(0) translateX(0) rotate(360deg);
          }
        }
        
        /* Pulse Animation */
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .cyber-form-group {
          position: relative;
        }
        
        .cyber-form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.8);
          margin-bottom: 0.5rem;
        }
        
        .cyber-input-container {
          position: relative;
        }
        
        .cyber-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(17, 24, 39, 0.8);
          border: 1px solid rgba(219, 39, 119, 0.3);
          border-radius: 0.375rem;
          color: rgba(226, 232, 240, 0.9);
          font-size: 0.875rem;
          transition: all 0.3s;
        }
        
        .cyber-input:focus {
          outline: none;
          border-color: rgba(219, 39, 119, 0.5);
          box-shadow: 0 0 10px rgba(219, 39, 119, 0.2);
        }
        
        .cyber-input-focus-bar {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 1px;
          background: linear-gradient(90deg, rgba(219, 39, 119, 0) 0%, rgba(219, 39, 119, 1) 50%, rgba(219, 39, 119, 0) 100%);
          transform: translateX(-50%);
          transition: width 0.3s;
          pointer-events: none;
        }
        
        .cyber-input:focus ~ .cyber-input-focus-bar {
          width: 100%;
        }
        
        .cyber-form-link {
          color: rgb(219, 39, 119);
          transition: color 0.3s;
        }
        
        .cyber-form-link:hover {
          color: rgb(236, 72, 153);
          text-shadow: 0 0 8px rgba(219, 39, 119, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Login;