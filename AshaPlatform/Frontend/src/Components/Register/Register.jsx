import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../Services/Auth.service.js';
import { toast } from 'react-hot-toast';
import ChatBubble from '../ChatBubble/ChatBubble.jsx';

const Register = () => {
const [formData, setFormData] = useState({
fullName: '',
username: '',
email: '',
password: '',
confirmPassword: ''
});
const [errors, setErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);
const navigate = useNavigate();
const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
const [animationComplete, setAnimationComplete] = useState(false);
const [glitchEffect, setGlitchEffect] = useState(false);
const [showCodeSnippet, setShowCodeSnippet] = useState(false);
const [passwordStrength, setPasswordStrength] = useState(0);
const [formStep, setFormStep] = useState(1);
const [bioScanActive, setBioScanActive] = useState(false);
const [bioScanComplete, setBioScanComplete] = useState(false);
const [activeField, setActiveField] = useState(null);

const canvasRef = useRef(null);
const circuitCanvasRef = useRef(null);
const neuronsCanvasRef = useRef(null);
const formRef = useRef(null);

// Neural canvas animation
useEffect(() => {
const canvas = neuronsCanvasRef.current;
if (!canvas) return;

const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Neural network visualization
class Neuron {
constructor(x, y) {
  this.x = x;
  this.y = y;
  this.radius = Math.random() * 2 + 2;
  this.connections = [];
  this.pulseRadius = 0;
  this.pulseOpacity = 0;
  this.activationTime = Math.random() * 5000;
  this.lastActivation = 0;
}

connect(neuron) {
  if (!this.connections.includes(neuron)) {
    this.connections.push(neuron);
  }
}

activate(time) {
  if (time - this.lastActivation > this.activationTime) {
    this.pulseRadius = 0;
    this.pulseOpacity = 1;
    this.lastActivation = time;
    
    // Propagate activation to connected neurons after delay
    for (const connection of this.connections) {
      setTimeout(() => {
        connection.activate(time + Math.random() * 200);
      }, Math.random() * 200 + 100);
    }
  }
}

update() {
  if (this.pulseOpacity > 0) {
    this.pulseRadius += 0.5;
    this.pulseOpacity -= 0.02;
  }
}

draw(ctx) {
  // Draw neuron
  ctx.fillStyle = `rgba(219, 39, 119, ${0.5 + Math.sin(Date.now() / 1000) * 0.2})`;
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw connections
  for (const neuron of this.connections) {
    ctx.strokeStyle = 'rgba(219, 39, 119, 0.2)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(neuron.x, neuron.y);
    ctx.stroke();
  }
  
  // Draw activation pulse
  if (this.pulseOpacity > 0) {
    ctx.strokeStyle = `rgba(219, 39, 119, ${this.pulseOpacity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.pulseRadius, 0, Math.PI * 2);
    ctx.stroke();
  }
}
}

// Create neurons
const neurons = [];
for (let i = 0; i < 100; i++) {
neurons.push(new Neuron(
  Math.random() * canvas.width,
  Math.random() * canvas.height
));
}

// Create connections
for (const neuron of neurons) {
// Find nearby neurons
for (const otherNeuron of neurons) {
  if (neuron !== otherNeuron) {
    const distance = Math.sqrt(
      Math.pow(neuron.x - otherNeuron.x, 2) +
      Math.pow(neuron.y - otherNeuron.y, 2)
    );
    
    if (distance < 150) {
      neuron.connect(otherNeuron);
    }
  }
}
}

// Randomly activate neurons
setInterval(() => {
const randomNeuron = neurons[Math.floor(Math.random() * neurons.length)];
randomNeuron.activate(Date.now());
}, 200);

// Animation loop
function animate() {
ctx.clearRect(0, 0, canvas.width, canvas.height);

// Update and draw all neurons
for (const neuron of neurons) {
  neuron.update();
  neuron.draw(ctx);
}

requestAnimationFrame(animate);
}

animate();

const handleResize = () => {
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
};

window.addEventListener('resize', handleResize);

return () => {
window.removeEventListener('resize', handleResize);
};
}, []);

// Matrix code rain effect
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

// Circuit background animation
useEffect(() => {
const canvas = circuitCanvasRef.current;
if (!canvas) return;

const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const circuit = {
nodeCount: 40,
nodes: [],
connections: [],
pulses: []
};

// Create nodes
for (let i = 0; i < circuit.nodeCount; i++) {
circuit.nodes.push({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  size: Math.random() * 3 + 1
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
ctx.lineWidth = 0.5;

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
  ctx.fillStyle = 'rgba(219, 39, 119, 0.5)';
  ctx.beginPath();
  ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
  ctx.fill();
}

// Draw pulses
ctx.lineWidth = 1.5;

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
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Add glow
  ctx.beginPath();
  const gradient = ctx.createRadialGradient(x, y, 1, x, y, 6);
  gradient.addColorStop(0, 'rgba(219, 39, 119, 0.6)');
  gradient.addColorStop(1, 'rgba(219, 39, 119, 0)');
  ctx.fillStyle = gradient;
  ctx.arc(x, y, 6, 0, Math.PI * 2);
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

const handleChange = (e) => {
const { name, value } = e.target;
setFormData(prev => ({ ...prev, [name]: value }));

// Clear error when user starts typing again
if (errors[name]) {
setErrors(prev => ({ ...prev, [name]: null }));
}

// Set active field for animations
setActiveField(name);

// Update password strength meter
if (name === 'password') {
setPasswordStrength(checkPasswordStrength(value));
}

// Add glitch effect occasionally
if (Math.random() > 0.8) {
setGlitchEffect(true);
setTimeout(() => setGlitchEffect(false), 100);
}
};

// Simulate biometric scan
const startBioScan = () => {
if (!bioScanActive) {
setBioScanActive(true);

// Simulate scanning process
setTimeout(() => {
  setBioScanComplete(true);
  setTimeout(() => {
    setBioScanActive(false);
    setBioScanComplete(false);
    setFormStep(3); // Move to final step after scan
  }, 1000);
}, 3000);
}
};

const validateForm = () => {
const newErrors = {};

// Validate full name
if (!formData.fullName.trim()) {
newErrors.fullName = 'Full name is required';
}

// Validate username
if (!formData.username.trim()) {
newErrors.username = 'Username is required';
} else if (formData.username.length < 3) {
newErrors.username = 'Username must be at least 3 characters';
}

// Validate email
if (!formData.email.trim()) {
newErrors.email = 'Email is required';
} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
newErrors.email = 'Email address is invalid';
}

// Validate password
if (!formData.password) {
newErrors.password = 'Password is required';
} else if (formData.password.length < 6) {
newErrors.password = 'Password must be at least 6 characters';
}

// Validate password confirmation
if (formData.password !== formData.confirmPassword) {
newErrors.confirmPassword = 'Passwords do not match';
}

return newErrors;
};

const handleSubmit = async (e) => {
e.preventDefault();

// For multi-step form
if (formStep < 3) {
// Validate current step
const formErrors = validateForm();
const currentFieldErrors = {};

if (formStep === 1) {
  // Check only username and email in step 1
  if (formErrors.username) currentFieldErrors.username = formErrors.username;
  if (formErrors.email) currentFieldErrors.email = formErrors.email;
  
  if (Object.keys(currentFieldErrors).length > 0) {
    setErrors(currentFieldErrors);
    return;
  }
  
  // Proceed to step 2
  setFormStep(2);
  return;
}

if (formStep === 2) {
  // Check password fields in step 2
  if (formErrors.password) currentFieldErrors.password = formErrors.password;
  if (formErrors.confirmPassword) currentFieldErrors.confirmPassword = formErrors.confirmPassword;
  
  if (Object.keys(currentFieldErrors).length > 0) {
    setErrors(currentFieldErrors);
    return;
  }
  
  // Start biometric scan
  startBioScan();
  return;
}
}

// Final form submission
setIsSubmitting(true);

// Add submission effects
setGlitchEffect(true);
setTimeout(() => setGlitchEffect(false), 300);

// Create spinning DNA helix animation for submission
const formElement = e.target;
const dnaOverlay = document.createElement('div');
dnaOverlay.className = 'dna-overlay';
formElement.appendChild(dnaOverlay);

// Add the DNA helix
const dnaHelix = document.createElement('div');
dnaHelix.className = 'dna-helix';
dnaOverlay.appendChild(dnaHelix);

// Add DNA rungs
for (let i = 0; i < 20; i++) {
const rung = document.createElement('div');
rung.className = 'dna-rung';
rung.style.animationDelay = `${i * 0.1}s`;
dnaHelix.appendChild(rung);
}

// Add animated text elements
const registrationTexts = [
'Initializing neural profile...',
'Generating quantum encryption keys...',
'Establishing biometric signature...',
'Creating secure blockchain identity...',
'Calibrating neural network nodes...',
'Syncing with central hub...',
'Profile creation in progress...'
];

// Animate through registration sequence
for (let i = 0; i < registrationTexts.length; i++) {
await new Promise(resolve => {
  setTimeout(() => {
    const textElement = document.createElement('div');
    textElement.className = 'registration-sequence-text';
    textElement.innerText = registrationTexts[i];
    dnaOverlay.appendChild(textElement);
    
    setTimeout(() => {
      textElement.style.opacity = '0';
      resolve();
    }, 800);
  }, i * 600);
});
}

try {
const userData = { 
  fullname: formData.fullName, 
  username: formData.username, 
  email: formData.email, 
  password: formData.password 
};

const status = await registerUser(userData);
if (status) {
  dnaOverlay.innerHTML = '<div class="registration-sequence-text success-text">Neural profile created successfully.</div>';
  
  setTimeout(() => {
    toast.success('Registration successful!');
    navigate('/');
  }, 1500);
}
} catch (error) {
console.error(error);
dnaOverlay.innerHTML = '<div class="registration-sequence-text error-text">Neural profile creation failed.</div>';

setTimeout(() => {
  toast.error('Registration failed. Please try again.');
  dnaOverlay.remove();
  setIsSubmitting(false);
}, 1500);
}
};

return (
<div className={`min-h-screen flex flex-col md:flex-row bg-gray-900 text-gray-100 overflow-hidden relative ${glitchEffect ? 'cyber-glitch' : ''}`}>
{/* Neural network canvas */}
<canvas ref={neuronsCanvasRef} className="fixed inset-0 z-0 opacity-30"></canvas>

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

{/* Code snippet overlays */}
{showCodeSnippet && (
  <div className="code-snippets-container">
    <div className="code-snippet">
      <pre className="code-text">
        {`function createNeuralProfile(userData) {
return encryptCredentials(
userData,
generateQuantumKey()
).then(profile => {
blockchainRegistry.add(profile);
return profile.id;
});
}`}
      </pre>
    </div>
  </div>
)}

{/* Background particle animation container */}
<div className="nova-particles-container"></div>

{/* Holographic elements */}
<div className="holographic-container">
  <div className="holographic-hexagon h-hex-1"></div>
  <div className="holographic-hexagon h-hex-2"></div>
  <div className="holographic-ring h-ring-1"></div>
</div>

{/* Animated background elements */}
<div className="absolute inset-0 z-0">
  <div className="cyber-grid"></div>
</div>

<div 
  className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full filter blur-[150px] bg-pink-900 opacity-20 animate-pulse-slow"
  style={{transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`}}
></div>
<div 
  className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full filter blur-[150px] bg-purple-900 opacity-20 animate-pulse-slow animation-delay-1000"
  style={{transform: `translate(${-mousePosition.x * 30}px, ${-mousePosition.y * 30}px)`}}
></div>
<div 
  className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full filter blur-[150px] bg-cyan-900 opacity-15 animate-pulse-slow animation-delay-2000"
  style={{transform: `translate(${mousePosition.y * 20}px, ${-mousePosition.x * 20}px)`}}
></div>

{/* Digital rain effect */}
<div className="digital-rain">
  {Array.from({length: 10}).map((_, i) => (
    <div 
      key={i} 
      className="rain-column"
      style={{ 
        left: `${i * 10}%`, 
        animationDelay: `${i * 0.2}s`,
        animationDuration: `${3 + Math.random() * 4}s`
      }}
    >
      {Array.from({length: 20}).map((_, j) => (
        <span 
          key={j} 
          className="rain-char"
          style={{ 
            animationDelay: `${j * 0.1}s`,
            opacity: Math.max(0.1, 1 - (j / 20))
          }}
        >
          {String.fromCharCode(33 + Math.floor(Math.random() * 94))}
        </span>
      ))}
    </div>
  ))}
</div>

{/* Left side - Form */}
<div className="w-full md:w-1/2 flex justify-center items-center p-8 md:p-12 relative z-10" 
     style={{
       opacity: animationComplete ? 1 : 0,
       transform: animationComplete ? 'translateX(0)' : 'translateX(-20px)',
       transition: 'all 0.8s cubic-bezier(0.33, 1, 0.68, 1)'
     }}>
  <div className="max-w-md w-full">
    <div className="cyber-content-panel p-8 relative">
      <div className="text-center md:text-left mb-8">
        <h2 className="cyber-section-title text-xl mb-2">Neural Network Registration</h2>
        <p className="text-gray-400">
          Create your digital identity to join our network
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div className="cyber-form-group">
          <label htmlFor="fullName" className="cyber-form-label">
            Full Name
          </label>
          <div className="cyber-input-container">
            <input 
              type="text" 
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`cyber-input ${errors.fullName ? 'cyber-input-error' : ''}`}
              placeholder="Enter your full name"
            />
            <div className="cyber-input-focus-bar"></div>
            {errors.fullName && (
              <p className="cyber-error-message">{errors.fullName}</p>
            )}
          </div>
        </div>
        
        {/* Username */}
        <div className="cyber-form-group">
          <label htmlFor="username" className="cyber-form-label">
            Username
          </label>
          <div className="cyber-input-container">
            <input 
              type="text" 
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`cyber-input ${errors.username ? 'cyber-input-error' : ''}`}
              placeholder="Choose a username"
            />
            <div className="cyber-input-focus-bar"></div>
            {errors.username && (
              <p className="cyber-error-message">{errors.username}</p>
            )}
          </div>
        </div>
        
        {/* Email */}
        <div className="cyber-form-group">
          <label htmlFor="email" className="cyber-form-label">
            Email Address
          </label>
          <div className="cyber-input-container">
            <input 
              type="email" 
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`cyber-input ${errors.email ? 'cyber-input-error' : ''}`}
              placeholder="you@example.com"
            />
            <div className="cyber-input-focus-bar"></div>
            {errors.email && (
              <p className="cyber-error-message">{errors.email}</p>
            )}
          </div>
        </div>
        
        {/* Password */}
        <div className="cyber-form-group">
          <label htmlFor="password" className="cyber-form-label">
            Password
          </label>
          <div className="cyber-input-container">
            <input 
              type="password" 
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`cyber-input ${errors.password ? 'cyber-input-error' : ''}`}
              placeholder="Create a password"
            />
            <div className="cyber-input-focus-bar"></div>
            {errors.password && (
              <p className="cyber-error-message">{errors.password}</p>
            )}
          </div>
        </div>
        
        {/* Confirm Password */}
        <div className="cyber-form-group">
          <label htmlFor="confirmPassword" className="cyber-form-label">
            Confirm Password
          </label>
          <div className="cyber-input-container">
            <input 
              type="password" 
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`cyber-input ${errors.confirmPassword ? 'cyber-input-error' : ''}`}
              placeholder="Confirm your password"
            />
            <div className="cyber-input-focus-bar"></div>
            {errors.confirmPassword && (
              <p className="cyber-error-message">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`cyber-button-primary w-full ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <div className="cyber-spinner mr-2">
                  <div className="cyber-spinner-ring"></div>
                  <div className="cyber-spinner-ring"></div>
                </div>
                Creating neural profile...
              </>
            ) : (
              <>
                <span className="relative z-10">Create Neural Profile</span>
                <span className="cyber-button-glow"></span>
              </>
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-8 text-center md:text-left">
        <p className="text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="cyber-text-link">
            Neural Authentication
          </Link>
        </p>
      </div>
      
      <div className="mt-8 text-center md:text-left">
        <Link 
          to="/" 
          className="cyber-link-button inline-flex items-center"
        >
          <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Central Hub
        </Link>
      </div>
      
      {/* Decorative elements */}
      <div className="cyber-corner cyber-corner-tl"></div>
      <div className="cyber-corner cyber-corner-tr"></div>
      <div className="cyber-corner cyber-corner-bl"></div>
      <div className="cyber-corner cyber-corner-br"></div>
      <div className="cyber-scan-line"></div>
    </div>
  </div>
</div>

{/* Right side - Benefits */}
<div className="hidden md:block w-1/2 relative z-10" 
     style={{
       opacity: animationComplete ? 1 : 0,
       transform: animationComplete ? 'translateX(0)' : 'translateX(20px)',
       transition: 'all 0.8s cubic-bezier(0.33, 1, 0.68, 1)',
       transitionDelay: '0.2s'
     }}>
  <div className="flex flex-col justify-center h-full max-w-md mx-auto px-8 text-white" style={{alignItems: "center"}}>
    <div 
      className="cyber-content-panel p-8 relative floating-panel"
      style={{
        transform: `translateY(${Math.sin(Date.now() / 1500) * 10}px) rotateX(${mousePosition.y * 5}deg) rotateY(${-mousePosition.x * 5}deg)`,
        transition: "transform 0.1s ease-out"
      }}
    >
      <div className="interactive-bg"></div>
      <div className="parallax-bg" style={{ 
        transform: `translate(${-mousePosition.x * 20}px, ${-mousePosition.y * 20}px)`
      }}></div>
      
      <h2 className="nova-hero-title mb-6">
        <span className="nova-title-line cyber-3d-text">Neural Network </span>
        <span className="nova-title-line cyber-3d-text" style={{marginLeft: 6}}> Integration</span>
        <span className="nova-blink">_</span>
      </h2>
      
      <div className="cyber-subtitle-container">
        <p className="text-gray-300 mb-6 leading-relaxed cyber-text-flicker">
          Join our advanced neural collective to enhance your coding capabilities, connect with our quantum processing network & evolve.
        </p>
      </div>
      
      {/* Interactive DNA visualization */}
      {/* <div className="dna-visualization">
        <div className="dna-strand">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="dna-segment">
              <div className="dna-rung left"></div>
              <div className="dna-backbone"></div>
              <div className="dna-rung right"></div>
              <div className="dna-data-point" style={{ animationDelay: `${i * 0.2}s` }}></div>
            </div>
          ))}
        </div>
      </div> */}
      
      <div className="benefits-container">
        {[
          {
            title: 'Neural Algorithm Training',
            description: 'Sharpen your coding skills with our advanced algorithm challenges designed for all skill levels',
            icon: (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            )
          },
          {
            title: 'Cognitive Enhancement Tracking',
            description: 'Monitor your neural pathway improvements with detailed performance analytics',
            icon: (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )
          },
          {
            title: 'Synthetic Interview Simulation',
            description: 'Practice technical interviews with our advanced AI simulation system',
            icon: (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 017.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            )
          },
          {
            title: 'Neural Network Collective',
            description: 'Connect with our community of developers to collaborate and grow together',
            icon: (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )
          }
        ].map((benefit, index) => (
          <div key={index} className="cyber-benefit-card" style={{ animationDelay: `${index * 0.2}s` }}>
            <div className="cyber-benefit-icon">
              {benefit.icon}
              <div className="icon-particles">
                <div className="icon-particle"></div>
                <div className="icon-particle"></div>
                <div className="icon-particle"></div>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="cyber-benefit-title glitch-text" data-text={benefit.title}>{benefit.title}</h3>
              <p className="cyber-benefit-description">{benefit.description}</p>
            </div>
            
            <div className="benefit-highlight"></div>
            
            {/* Decorative corners */}
            <div className="cyber-mini-corner cyber-mini-corner-tl"></div>
            <div className="cyber-mini-corner cyber-mini-corner-tr"></div>
            <div className="cyber-mini-corner cyber-mini-corner-bl"></div>
            <div className="cyber-mini-corner cyber-mini-corner-br"></div>
          </div>
        ))}
      </div>
      
      {/* Network stats */}
      <div className="network-stats">
        <div className="stats-header">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Network Statistics</span>
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value counter-animation">5,784</div>
            <div className="stat-label">Neural Profiles</div>
            <div className="stat-bar"><div className="stat-fill" style={{width: '78%'}}></div></div>
          </div>
          <div className="stat-item">
            <div className="stat-value counter-animation">142</div>
            <div className="stat-label">Countries</div>
            <div className="stat-bar"><div className="stat-fill" style={{width: '68%'}}></div></div>
          </div>
          <div className="stat-item">
            <div className="stat-value counter-animation">24.7M</div>
            <div className="stat-label">Code Lines</div>
            <div className="stat-bar"><div className="stat-fill" style={{width: '85%'}}></div></div>
          </div>
          <div className="stat-item">
            <div className="stat-value counter-animation">98.2%</div>
            <div className="stat-label">Uptime</div>
            <div className="stat-bar"><div className="stat-fill" style={{width: '98%'}}></div></div>
          </div>
        </div>
      </div>
      
      {/* Animated binary data stream */}
      <div className="binary-circuit-container">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i} 
            className="binary-circuit"
            style={{
              top: `${15 + i * 15}%`,
              right: `${i * 5}%`,
              width: `${120 - i * 20}px`,
              animationDelay: `${i * 0.3}s`
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
</div>

{/* Chat Bubble */}
{/* Chat Bubble */}
<ChatBubble />
      
{/* Custom styling - All the cool animations and effects */}
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
  
  /* Matrix Data Animation */
  .code-snippets-container {
    position: fixed;
    inset: 0;
    z-index: 10;
    pointer-events: none;
    overflow: hidden;
  }
  
  .code-snippet {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 15px;
    background: rgba(17, 24, 39, 0.85);
    border: 1px solid rgba(219, 39, 119, 0.5);
    border-radius: 5px;
    animation: snippet-appear 0.5s ease-out forwards;
    opacity: 0;
    max-width: 80%;
  }
  
  @keyframes snippet-appear {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
  
  .code-text {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: rgba(219, 39, 119, 0.9);
    margin: 0;
    white-space: pre-wrap;
    text-shadow: 0 0 5px rgba(219, 39, 119, 0.5);
  }
  
  /* Digital Rain Effect */
  .digital-rain {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 5;
    overflow: hidden;
  }
  
  .rain-column {
    position: absolute;
    top: -100px;
    display: flex;
    flex-direction: column;
    animation: rain-fall linear infinite;
  }
  
  .rain-char {
    font-family: monospace;
    font-size: 14px;
    color: rgba(219, 39, 119, 0.7);
    text-shadow: 0 0 5px rgba(219, 39, 119, 0.5);
    animation: char-fade 2s infinite;
  }
  
  @keyframes rain-fall {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  
  @keyframes char-fade {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
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
  
  .holographic-hexagon {
    position: absolute;
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    border: 1px solid rgba(219, 39, 119, 0.3);
    box-shadow: 0 0 20px rgba(219, 39, 119, 0.1) inset;
    animation: rotate-3d 20s linear infinite;
  }
  
  .holographic-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(219, 39, 119, 0.3);
    box-shadow: 0 0 20px rgba(219, 39, 119, 0.1) inset;
    animation: rotate-3d 15s linear infinite;
  }
  
  .h-hex-1 {
    top: 20%;
    left: 30%;
    width: 150px;
    height: 150px;
    animation-duration: 25s;
  }
  
  .h-hex-2 {
    bottom: 15%;
    right: 25%;
    width: 200px;
    height: 200px;
    animation-duration: 30s;
    animation-direction: reverse;
  }
  
  .h-ring-1 {
    top: 50%;
    left: 70%;
    width: 180px;
    height: 180px;
    animation-duration: 20s;
  }
  
  @keyframes rotate-3d {
    0% { transform: rotate3d(1, 1, 1, 0deg); }
    100% { transform: rotate3d(1, 1, 1, 360deg); }
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
    width: 600px;
    top: 40px;
    bottom: 100px;

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
    will-change: transform, box-shadow;
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
  
  /* Interactive Backgrounds */
  .interactive-bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
      rgba(219, 39, 119, 0.15) 0%, 
      rgba(124, 58, 237, 0.1) 35%, 
      transparent 70%);
    opacity: 0.3;
    border-radius: 0.5rem;
    pointer-events: none;
    transition: opacity 0.3s;
    z-index: -1;
  }
  
  .parallax-bg {
    position: absolute;
    inset: 0;
    background-image: 
      radial-gradient(circle at 20% 30%, rgba(219, 39, 119, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(124, 58, 237, 0.15) 0%, transparent 50%);
    border-radius: 0.5rem;
    pointer-events: none;
    z-index: -2;
    transition: transform 0.1s ease-out;
  }
  
  /* Form Step Indicators */
  .step-indicators {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 2rem 0 1rem;
  }
  
  .step-dot {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .step-dot-inner {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: rgba(17, 24, 39, 0.8);
    border: 1px solid rgba(219, 39, 119, 0.5);
    margin-bottom: 8px;
    position: relative;
    z-index: 2;
    transition: all 0.3s;
  }
  
  .step-dot.active .step-dot-inner {
    background: rgb(219, 39, 119);
    box-shadow: 0 0 10px rgba(219, 39, 119, 0.7);
    transform: scale(1.2);
  }
  
  .step-connector {
    flex: 1;
    height: 2px;
    background: rgba(219, 39, 119, 0.3);
    margin: 0 5px;
    transform: translateY(-12px);
    position: relative;
    z-index: 1;
    overflow: hidden;
  }
  
  .step-connector.active::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgb(219, 39, 119);
    animation: connector-fill 0.5s forwards;
    transform-origin: left;
  }
  
  @keyframes connector-fill {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
  
  .step-label {
    font-size: 11px;
    color: rgba(219, 39, 119, 0.8);
    font-weight: 500;
    transition: all 0.3s;
  }
  
  .step-dot.active .step-label {
    color: rgb(219, 39, 119);
    text-shadow: 0 0 5px rgba(219, 39, 119, 0.3);
  }
  
  /* Form Steps Animation */
  .form-step {
    opacity: 0;
    height: 0;
    overflow: hidden;
    transition: opacity 0.5s, height 0.5s;
  }
  
  .form-step.active-step {
    opacity: 1;
    height: auto;
    animation: step-appear 0.5s forwards;
  }
  
  @keyframes step-appear {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* Enhanced Form Fields */
  .cyber-form-group {
    position: relative;
    margin-bottom: 1.5rem;
    transition: all 0.3s;
  }
  
  .cyber-form-group.interactive {
    border-left: 0px solid transparent;
    padding-left: 0;
    transition: all 0.3s ease;
  }
  
  .cyber-form-group.field-active {
    border-left: 3px solid rgb(219, 39, 119);
    padding-left: 10px;
  }
  
  .cyber-form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(226, 232, 240, 0.8);
    margin-bottom: 0.5rem;
    transition: all 0.3s;
  }
  
  .cyber-form-group.field-active .cyber-form-label {
    color: rgb(219, 39, 119);
    text-shadow: 0 0 5px rgba(219, 39, 119, 0.3);
  }
  
  .cyber-input-container {
    position: relative;
  }
  
  .input-icon {
    position: absolute;
    top: 50%;
    left: 12px;
    transform: translateY(-50%);
    color: rgba(219, 39, 119, 0.7);
    z-index: 1;
    transition: all 0.3s;
  }
  
  .cyber-form-group.field-active .input-icon {
    color: rgb(219, 39, 119);
    transform: translateY(-50%) scale(1.1);
    filter: drop-shadow(0 0 3px rgba(219, 39, 119, 0.5));
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
    position: relative;
    z-index: 0;
  }
  
  .retro-input {
    padding-left: 40px !important;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
  }
  
  .retro-input:focus, .cyber-form-group.field-active .retro-input {
    box-shadow: 0 0 0 2px rgba(219, 39, 119, 0.5) !important;
    background: rgba(17, 24, 39, 0.95) !important;
    border-color: rgb(219, 39, 119) !important;
  }
  
  .cyber-input-error {
    border-color: rgba(239, 68, 68, 0.5) !important;
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.2) !important;
  }
  
  .cyber-error-message {
    position: absolute;
    font-size: 0.75rem;
    color: rgb(239, 68, 68);
    margin-top: 0.25rem;
    animation: error-pulse 2s infinite;
  }
  
  @keyframes error-pulse {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; text-shadow: 0 0 5px rgba(239, 68, 68, 0.5); }
  }
  
  .cyber-input-focus-bar {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, rgba(219, 39, 119, 0) 0%, rgba(219, 39, 119, 1) 50%, rgba(219, 39, 119, 0) 100%);
    transform: translateX(-50%);
    transition: width 0.3s;
    pointer-events: none;
    z-index: 1;
  }
  
  .cyber-input:focus ~ .cyber-input-focus-bar,
  .cyber-form-group.field-active .cyber-input-focus-bar {
    width: 100%;
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
  
  .cyber-input:focus ~ .input-analyzer,
  .cyber-form-group.field-active .input-analyzer {
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
  
  @keyframes analyzer-pulse {
    from { transform: scale(1); }
    to { transform: scale(1.5); }
  }
  
  /* Password Strength Meter */
  .password-strength-meter {
    display: flex;
    flex-wrap: wrap;
    margin-top: 10px;
    gap: 5px;
  }
  
  .strength-bar {
    flex: 1;
    height: 4px;
    background: rgba(17, 24, 39, 0.5);
    border-radius: 2px;
    position: relative;
    overflow: hidden;
  }
  
  .strength-bar.active {
    animation: strength-appear 0.5s ease-out forwards;
  }
  
  .strength-bar:nth-child(1).active { background: rgb(239, 68, 68); }
  .strength-bar:nth-child(2).active { background: rgb(245, 158, 11); }
  .strength-bar:nth-child(3).active { background: rgb(16, 185, 129); }
  .strength-bar:nth-child(4).active { background: rgb(6, 182, 212); }
  
  .strength-label {
    width: 100%;
    font-size: 11px;
    color: rgba(219, 39, 119, 0.8);
    margin-top: 5px;
    text-align: center;
  }
  
  @keyframes strength-appear {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
  
  /* Form Navigation */
  .form-navigation {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
  }
  
  .dual-buttons {
    display: flex;
    justify-content: space-between;
  }
  
  .cyber-next-button, .cyber-back-button {
    display: flex;
    align-items: center;
    padding: 0.6rem 1.2rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
  }
  
  .cyber-next-button {
    background: rgba(219, 39, 119, 0.2);
    border: 1px solid rgba(219, 39, 119, 0.4);
    color: rgb(219, 39, 119);
  }
  
  .cyber-back-button {
    background: rgba(17, 24, 39, 0.6);
    border: 1px solid rgba(219, 39, 119, 0.2);
    color: rgba(226, 232, 240, 0.8);
  }
  
  .cyber-next-button:hover {
    background: rgba(219, 39, 119, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1),
                0 0 10px rgba(219, 39, 119, 0.3);
  }
  
  .cyber-back-button:hover {
    background: rgba(17, 24, 39, 0.8);
    border-color: rgba(219, 39, 119, 0.4);
    transform: translateY(-2px);
  }
  
  .next-button-icon, .back-button-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
    position: relative;
  }
  
  .icon-pulse {
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
  
  /* Biometric Scanner */
  .biometric-option {
    margin: 1.5rem 0;
    background: rgba(17, 24, 39, 0.6);
    border: 1px solid rgba(219, 39, 119, 0.2);
    border-radius: 0.5rem;
    padding: 1rem;
  }
  
  .biometric-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .biometric-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: rgba(219, 39, 119, 0.1);
    border-radius: 50%;
    margin-right: 10px;
    color: rgb(219, 39, 119);
  }
  
  .biometric-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(226, 232, 240, 0.9);
  }
  
  .biometric-scanner {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    transition: all 0.3s;
  }
  
  .scanner-container {
    text-align: center;
    cursor: pointer;
  }
  
  .scanner-image {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(17, 24, 39, 0.8);
    border: 2px solid rgba(219, 39, 119, 0.3);
    margin: 0 auto 10px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
  }
  
  .biometric-scanner.active .scanner-image {
    border-color: rgba(219, 39, 119, 0.8);
    box-shadow: 0 0 15px rgba(219, 39, 119, 0.5);
  }
  
  .biometric-scanner.complete .scanner-image {
    border-color: rgba(16, 185, 129, 0.8);
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
  }
  
  .scanner-lines {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0%,
      transparent 48%,
      rgba(219, 39, 119, 0.5) 48%,
      rgba(219, 39, 119, 0.5) 52%,
      transparent 52%,
      transparent 100%
    );
    background-size: 100% 20px;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .biometric-scanner.active .scanner-lines {
    opacity: 1;
    animation: scan-move 3s linear;
  }
  
  @keyframes scan-move {
    0% { background-position: 0 -100px; }
    100% { background-position: 0 200px; }
  }
  
  .fingerprint-pattern {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
  }
  
  .fingerprint-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: 1px solid rgba(219, 39, 119, 0.5);
    border-radius: 50%;
    opacity: 0.5;
  }
  
  .fingerprint-ring:nth-child(1) { width: 20px; height: 20px; }
  .fingerprint-ring:nth-child(2) { width: 30px; height: 30px; }
  .fingerprint-ring:nth-child(3) { width: 40px; height: 40px; }
  .fingerprint-ring:nth-child(4) { width: 50px; height: 50px; }
  .fingerprint-ring:nth-child(5) { width: 60px; height: 60px; }
  
  .biometric-scanner.active .fingerprint-ring {
    animation: fingerprint-pulse 1s infinite alternate;
  }
  
  @keyframes fingerprint-pulse {
    0% { border-color: rgba(219, 39, 119, 0.5); opacity: 0.5; }
    100% { border-color: rgba(219, 39, 119, 0.9); opacity: 0.9; }
  }
  
  .scanner-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(219, 39, 119, 0.4) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .biometric-scanner.active .scanner-glow {
    opacity: 1;
    animation: glow-pulse 1s infinite alternate;
  }
  
  .biometric-scanner.complete .scanner-glow {
    background: radial-gradient(circle at center, rgba(16, 185, 129, 0.4) 0%, transparent 70%);
    opacity: 1;
  }
  
  @keyframes glow-pulse {
    0% { opacity: 0.3; }
    100% { opacity: 0.7; }
  }
  
  .scanning-status {
    font-size: 0.75rem;
    color: rgba(219, 39, 119, 0.7);
    transition: all 0.3s;
  }
  
  .biometric-scanner.active .scanning-status {
    color: rgb(219, 39, 119);
    animation: text-blink 1s infinite;
  }
  
  .biometric-scanner.complete .scanning-status {
    color: rgb(16, 185, 129);
  }
  
  @keyframes text-blink {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }
  
  /* Profile Summary */
  .profile-summary {
    margin-bottom: 2rem;
  }
  
  .summary-title {
    font-size: 1.125rem;
    font-weight: 500;
    color: rgb(219, 39, 119);
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .summary-container {
    display: flex;
    flex-direction: column;
    background: rgba(17, 24, 39, 0.6);
    border: 1px solid rgba(219, 39, 119, 0.2);
    border-radius: 0.5rem;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
  }
  
  .summary-hologram {
    display: flex;
    justify-content: center;
    position: relative;
    margin-bottom: 1.5rem;
  }
  
  .user-avatar {
    position: relative;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(17, 24, 39, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .avatar-ring {
    position: absolute;
    inset: -5px;
    border: 1px solid rgba(219, 39, 119, 0.5);
    border-radius: 50%;
    animation: avatar-ring-rotate 10s linear infinite;
  }
  
  @keyframes avatar-ring-rotate {
    0% { transform: rotate(0); }
    100% { transform: rotate(360deg); }
  }
  
  .avatar-initial {
    font-size: 24px;
    font-weight: 600;
    color: rgb(219, 39, 119);
    text-shadow: 0 0 10px rgba(219, 39, 119, 0.7);
  }
  
  .avatar-glow {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(circle at center, rgba(219, 39, 119, 0.2) 0%, transparent 70%);
    animation: avatar-glow 2s infinite alternate;
  }
  
  @keyframes avatar-glow {
    0% { opacity: 0.5; transform: scale(1); }
    100% { opacity: 0.8; transform: scale(1.2); }
  }
  
  .data-connections {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  
  .data-connection-line {
    position: absolute;
    background: rgba(219, 39, 119, 0.3);
    animation: connection-pulse 2s infinite alternate;
  }
  
  .data-connection-line:nth-child(1) {
    top: 50%;
    left: 60px;
    width: calc(100% - 60px);
    height: 1px;
    transform-origin: left;
    animation-delay: 0.2s;
  }
  
  .data-connection-line:nth-child(2) {
    top: 30%;
    right: 0;
    width: 50%;
    height: 1px;
    transform-origin: right;
    animation-delay: 0.4s;
  }
  
  .data-connection-line:nth-child(3) {
    top: 70%;
    right: 0;
    width: 70%;
    height: 1px;
    transform-origin: right;
    animation-delay: 0.6s;
  }
  
  @keyframes connection-pulse {
    0% { transform: scaleX(0.5); opacity: 0.3; }
    100% { transform: scaleX(1); opacity: 0.6; }
  }
  
  .summary-details {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .summary-item {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .summary-label {
    font-size: 0.875rem;
    color: rgba(219, 39, 119, 0.8);
    min-width: 120px;
  }
  
  .summary-value {
    font-size: 0.875rem;
    color: rgba(226, 232, 240, 0.9);
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .biometric-status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgb(239, 68, 68);
  }
  
  .biometric-status-indicator.verified {
    background: rgb(16, 185, 129);
    box-shadow: 0 0 5px rgba(16, 185, 129, 0.5);
  }
  
  /* Terms Agreement */
  .terms-agreement {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }
  
  .terms-checkbox {
    position: relative;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
  
  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    z-index: 2;
  }
  
  .custom-checkbox {
    position: absolute;
    inset: 0;
    background: rgba(17, 24, 39, 0.8);
    border: 1px solid rgba(219, 39, 119, 0.5);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
    transition: all 0.3s;
  }
  
  input[type="checkbox"]:checked + .custom-checkbox {
    background: rgba(219, 39, 119, 0.2);
    color: rgb(219, 39, 119);
  }
  
  .terms-label {
    font-size: 0.75rem;
    color: rgba(226, 232, 240, 0.7);
    line-height: 1.4;
  }
  
  /* Tech Icons */
  .floating-tech-icons {
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
  }
  
  .tech-icon {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(17, 24, 39, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: monospace;
    font-size: 10px;
    color: rgba(219, 39, 119, 0.8);
    animation: tech-float 5s ease-in-out infinite alternate;
  }
  
  .tech-icon::before {
    content: attr(class);
    content: attr(class);
    content: 'A'; /* Default icon */
  }
  
  .tech-icon.html5::before { content: 'H5'; }
  .tech-icon.js::before { content: 'JS'; }
  .tech-icon.python::before { content: 'PY'; }
  .tech-icon.react::before { content: 'R'; }
  .tech-icon.node::before { content: 'N'; }
  
  .tech-icon-pulse {
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    border: 1px solid rgba(219, 39, 119, 0.5);
    animation: tech-pulse 2s infinite;
  }
  
  @keyframes tech-float {
    0% { transform: translateY(0); }
    100% { transform: translateY(-10px); }
  }
  
  @keyframes tech-pulse {
    0% { transform: scale(1); opacity: 0.5; }
    100% { transform: scale(1.5); opacity: 0; }
  }
  
  /* Cyber Form Header */
  .cyber-form-header {
    position: relative;
    margin-bottom: 1rem;
  }
  
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
  
  /* DNA Visualization */
  .dna-visualization {
    margin: 2rem 0;
    height: 80px;
    display: flex;
    justify-content: center;
    perspective: 1000px;
  }
  
  .dna-strand {
    transform-style: preserve-3d;
    animation: dna-rotate 10s linear infinite;
  }
  
  @keyframes dna-rotate {
    0% { transform: rotateY(0); }
    100% { transform: rotateY(360deg); }
  }
  
  .dna-segment {
    position: relative;
    height: 8px;
    width: 100px;
  }
  
  .dna-backbone {
    position: absolute;
    top: 3px;
    width: 100%;
    height: 2px;
    background: rgba(219, 39, 119, 0.5);
  }
  
  .dna-rung {
    position: absolute;
    width: 15px;
    height: 2px;
    top: 3px;
    background: rgba(124, 58, 237, 0.5);
  }
  
  .dna-rung.left {
    left: 0;
    transform-origin: left;
    animation: dna-left-twist 10s linear infinite;
  }
  
  .dna-rung.right {
    right: 0;
    transform-origin: right;
    animation: dna-right-twist 10s linear infinite;
  }
  
  @keyframes dna-left-twist {
    0%, 100% { transform: rotateY(0); }
    50% { transform: rotateY(180deg); }
  }
  
  @keyframes dna-right-twist {
    0%, 100% { transform: rotateY(0); }
    50% { transform: rotateY(-180deg); }
  }
  
  .dna-data-point {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgb(219, 39, 119);
    border-radius: 50%;
    top: 2px;
    left: 50%;
    transform: translateX(-50%);
    box-shadow: 0 0 5px rgba(219, 39, 119, 0.7);
    animation: data-pulse 2s infinite alternate;
  }
  
  @keyframes data-pulse {
    0% { opacity: 0.3; }
    100% { opacity: 1; }
  }
  
  /* Benefits Enhanced Styles */
  .benefits-container {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .cyber-benefit-card {
    display: flex;
    background: rgba(17, 24, 39, 0.6);
    border: 1px solid rgba(219, 39, 119, 0.2);
    border-radius: 0.5rem;
    padding: 1.25rem;
    position: relative;
    transition: all 0.3s;
    overflow: hidden;
    animation: benefit-appear 0.5s forwards;
    opacity: 0;
    transform: translateY(20px);
  }
  
  @keyframes benefit-appear {
    to { opacity: 1; transform: translateY(0); }
  }
  
  .cyber-benefit-card:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05),
              0 0 20px rgba(219, 39, 119, 0.2);
    border-color: rgba(219, 39, 119, 0.4);
  }
  
  .cyber-benefit-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    background: rgba(219, 39, 119, 0.2);
    border-radius: 0.5rem;
    color: rgb(219, 39, 119);
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
  }
  
  .cyber-benefit-card:hover .cyber-benefit-icon {
    background: rgba(219, 39, 119, 0.3);
    transform: scale(1.1);
    box-shadow: 0 0 15px rgba(219, 39, 119, 0.3);
  }
  
  .benefit-highlight {
    position: absolute;
    top: 0;
    left: -100%;
    width: 50px;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(219, 39, 119, 0.3) 50%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }
  
  .cyber-benefit-card:hover .benefit-highlight {
    opacity: 1;
    animation: highlight-sweep 1.5s infinite;
  }
  
  @keyframes highlight-sweep {
    0% { left: -100%; }
    100% { left: 100%; }
  }
  
  .icon-particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  
  .icon-particle {
    position: absolute;
    width: 3px;
    height: 3px;
    background: rgba(219, 39, 119, 0.8);
    border-radius: 50%;
    opacity: 0;
  }
  
  .cyber-benefit-card:hover .icon-particle {
    animation: particle-float 2s ease-out forwards;
  }
  
  .icon-particle:nth-child(1) { top: 30%; left: 30%; animation-delay: 0.2s; }
  .icon-particle:nth-child(2) { top: 50%; left: 70%; animation-delay: 0.4s; }
  .icon-particle:nth-child(3) { top: 70%; left: 40%; animation-delay: 0.6s; }
  
  @keyframes particle-float {
    0% { 
      opacity: 0.8; 
      transform: translate(0, 0) scale(1); 
    }
    100% { 
      opacity: 0; 
      transform: translate(
        calc(var(--random-x, 20) * 1px),
        calc(var(--random-y, -20) * 1px)
      ) scale(2); 
    }
  }
  
  .cyber-benefit-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: rgba(226, 232, 240, 0.9);
    margin-bottom: 0.5rem;
    position: relative;
  }
  
  .glitch-text {
    position: relative;
  }
  
  .glitch-text::before,
  .glitch-text::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
  }
  
  .cyber-benefit-card:hover .glitch-text::before {
    animation: glitch-anim-1 0.3s linear infinite alternate-reverse;
    opacity: 0.7;
    left: 2px;
    color: rgb(219, 39, 119);
  }
  
  .cyber-benefit-card:hover .glitch-text::after {
    animation: glitch-anim-2 0.2s linear infinite alternate-reverse;
    opacity: 0.7;
    left: -2px;
    color: rgb(124, 58, 237);
  }
  
  @keyframes glitch-anim-1 {
    0%, 100% { clip-path: inset(0 0 98% 0); }
    20% { clip-path: inset(33% 0 33% 0); }
    40% { clip-path: inset(50% 0 0 0); }
    60% { clip-path: inset(25% 0 75% 0); }
    80% { clip-path: inset(75% 0 25% 0); }
  }
  
  @keyframes glitch-anim-2 {
    0%, 100% { clip-path: inset(0 0 98% 0); }
    25% { clip-path: inset(35% 0 65% 0); }
    50% { clip-path: inset(50% 0 50% 0); }
    75% { clip-path: inset(40% 0 60% 0); }
  }
  
  .cyber-benefit-description {
    font-size: 0.875rem;
    color: rgba(226, 232, 240, 0.7);
    line-height: 1.5;
  }
  
  .cyber-mini-corner {
    position: absolute;
    width: 6px;
    height: 6px;
    border-color: rgba(219, 39, 119, 0.5);
    transition: all 0.3s;
  }
  
  .cyber-mini-corner-tl {
    top: 0;
    left: 0;
    border-top: 1px solid;
    border-left: 1px solid;
  }
  
  .cyber-mini-corner-tr {
    top: 0;
    right: 0;
    border-top: 1px solid;
    border-right: 1px solid;
  }
  
  .cyber-mini-corner-bl {
    bottom: 0;
    left: 0;
    border-bottom: 1px solid;
    border-left: 1px solid;
  }
  
  .cyber-mini-corner-br {
    bottom: 0;
    right: 0;
    border-bottom: 1px solid;
    border-right: 1px solid;
  }
  
  .cyber-benefit-card:hover .cyber-mini-corner {
    border-color: rgba(219, 39, 119, 0.8);
    box-shadow: 0 0 5px rgba(219, 39, 119, 0.3);
  }
  
  /* Network Stats */
  .network-stats {
    margin-top: 2rem;
    padding: 1.5rem;
    background: rgba(17, 24, 39, 0.6);
    border: 1px solid rgba(219, 39, 119, 0.2);
    border-radius: 0.5rem;
  }
  
  .stats-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    color: rgb(219, 39, 119);
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .stat-item {
    padding: 0.75rem;
    background: rgba(17, 24, 39, 0.4);
    border-radius: 0.375rem;
    border: 1px solid rgba(219, 39, 119, 0.1);
  }
  
  .stat-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: rgb(219, 39, 119);
    margin-bottom: 0.25rem;
  }
  
  .counter-animation {
    animation: count-up 2s ease-out forwards;
  }
  
  @keyframes count-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .stat-label {
    font-size: 0.75rem;
    color: rgba(226, 232, 240, 0.7);
    margin-bottom: 0.5rem;
  }
  
  .stat-bar {
    height: 3px;
    background: rgba(17, 24, 39, 0.8);
    border-radius: 1.5px;
    overflow: hidden;
  }
  
  .stat-fill {
    height: 100%;
    background: rgb(219, 39, 119);
    border-radius: 1.5px;
    width: 0;
    animation: stat-fill 2s ease-out forwards;
  }
  
  @keyframes stat-fill {
    from { width: 0; }
    to { width: var(--width, 50%); }
  }
  
  /* Binary Circuit */
  .binary-circuit-container {
    position: absolute;
    top: 0;
    right: 0;
    width: 40%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
    opacity: 0.5;
  }
  
  .binary-circuit {
    position: absolute;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(219, 39, 119, 0.5) 20%,
      rgba(219, 39, 119, 0.8) 50%,
      rgba(219, 39, 119, 0.5) 80%,
      transparent 100%
    );
    animation: circuit-flow 3s linear infinite;
  }
  
  @keyframes circuit-flow {
    0% { transform: translateX(-100%); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateX(100%); opacity: 0; }
  }
  
  /* 3D Text Effect */
  .cyber-3d-text {
    position: relative;
    text-shadow: 
      0 1px 0 rgba(219, 39, 119, 0.8), 
      0 2px 0 rgba(219, 39, 119, 0.7),
      0 3px 0 rgba(219, 39, 119, 0.6),
      0 4px 0 rgba(219, 39, 119, 0.5),
      0 5px 0 rgba(219, 39, 119, 0.4),
      0 6px 0 rgba(219, 39, 119, 0.3),
      0 7px 0 rgba(219, 39, 119, 0.2),
      0 8px 0 rgba(219, 39, 119, 0.1),
      0 9px 10px rgba(0, 0, 0, 0.8);
    transform: perspective(500px) rotateX(5deg);
    animation: cyber-text-float 5s ease-in-out infinite alternate;
  }
  
  @keyframes cyber-text-float {
    0% { transform: perspective(500px) rotateX(5deg) translateY(0); }
    100% { transform: perspective(500px) rotateX(8deg) translateY(-10px); }
  }
  
  /* Text Flicker Effect */
  .cyber-text-flicker {
    position: relative;
    animation: text-flicker 5s linear infinite;
  }
  
  @keyframes text-flicker {
    0%, 100% { opacity: 1; }
    92% { opacity: 1; }
    92.5% { opacity: 0; }
    93% { opacity: 1; }
    95% { opacity: 1; }
    95.5% { opacity: 0; }
    96% { opacity: 1; }
    98% { opacity: 1; }
    98.5% { opacity: 0; }
    99% { opacity: 1; }
  }
  
  /* DNA Overlay Animation for Submission */
  .dna-overlay {
    position: absolute;
    inset: 0;
    background: rgba(17, 24, 39, 0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 100;
    backdrop-filter: blur(5px);
    border-radius: 0.5rem;
    animation: overlay-appear 0.5s forwards;
  }
  
  @keyframes overlay-appear {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .dna-helix {
    position: relative;
    width: 60px;
    height: 120px;
    margin-bottom: 30px;
    perspective: 800px;
    transform-style: preserve-3d;
    animation: helix-rotate 3s linear infinite;
  }
  
  @keyframes helix-rotate {
    from { transform: rotateY(0); }
    to { transform: rotateY(360deg); }
  }
  
  .dna-rung {
    position: absolute;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, rgba(219, 39, 119, 0.7) 0%, rgba(124, 58, 237, 0.7) 100%);
    border-radius: 2px;
    transform-style: preserve-3d;
    opacity: 0;
    animation: rung-appear 0.5s forwards, rung-twist 3s linear infinite;
  }
  
  @keyframes rung-appear {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes rung-twist {
    0%, 100% { transform: rotateX(0); }
    50% { transform: rotateX(180deg); }
  }
  
  .registration-sequence-text {
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
  
  .success-text {
    color: rgb(16, 185, 129);
    font-size: 1.25rem;
    font-weight: 600;
    text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
  }
  
  .error-text {
    color: rgb(239, 68, 68);
    font-size: 1.25rem;
    font-weight: 600;
    text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
  }


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
  }
  
  /* Section Titles */
  .cyber-section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: rgb(219, 39, 119);
    letter-spacing: 0.025em;
  }
  
  /* Form Styling */
  .cyber-form-group {
    position: relative;
    margin-bottom: 1.5rem;
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
  
  .cyber-input-error {
    border-color: rgba(239, 68, 68, 0.5);
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
  }
  
  .cyber-error-message {
    position: absolute;
    font-size: 0.75rem;
    color: rgb(239, 68, 68);
    margin-top: 0.25rem;
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
  
  /* Benefit Cards */
  .cyber-benefit-card {
    display: flex;
    background: rgba(17, 24, 39, 0.6);
    border: 1px solid rgba(219, 39, 119, 0.2);
    border-radius: 0.5rem;
    padding: 1.25rem;
    position: relative;
    transition: all 0.3s;
  }
  
  .cyber-benefit-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05),
              0 0 20px rgba(219, 39, 119, 0.2);
    border-color: rgba(219, 39, 119, 0.4);
  }
  
  .cyber-benefit-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    background: rgba(219, 39, 119, 0.2);
    border-radius: 0.5rem;
    color: rgb(219, 39, 119);
    flex-shrink: 0;
  }
  
  .cyber-benefit-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: rgba(226, 232, 240, 0.9);
    margin-bottom: 0.5rem;
  }
  
  .cyber-benefit-description {
    font-size: 0.875rem;
    color: rgba(226, 232, 240, 0.7);
    line-height: 1.5;
  }
  
  /* Buttons */
  .cyber-button-primary {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(90deg, rgba(219, 39, 119, 0.8) 0%, rgba(124, 58, 237, 0.8) 100%);
    border: none;
    border-radius: 0.375rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    overflow: hidden;
    transition: all 0.3s;
  }
  
  .cyber-button-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05),
              0 0 20px rgba(219, 39, 119, 0.3);
  }
  
  .cyber-button-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .cyber-button-primary:hover .cyber-button-glow {
    opacity: 0.3;
    animation: button-pulse 2s infinite;
  }
  
  @keyframes button-pulse {
    0% { transform: scale(0.95); opacity: 0.3; }
    50% { transform: scale(1.05); opacity: 0.5; }
    100% { transform: scale(0.95); opacity: 0.3; }
  }
  
  .cyber-text-link {
    color: rgb(219, 39, 119);
    font-weight: 500;
    transition: all 0.3s;
  }
  
  .cyber-text-link:hover {
    color: rgb(236, 72, 153);
    text-shadow: 0 0 8px rgba(219, 39, 119, 0.5);
  }
  
  .cyber-link-button {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background: rgba(17, 24, 39, 0.8);
    border: 1px solid rgba(219, 39, 119, 0.3);
    border-radius: 0.375rem;
    color: rgba(226, 232, 240, 0.8);
    font-size: 0.875rem;
    transition: all 0.3s;
  }
  
  .cyber-link-button:hover {
    background: rgba(17, 24, 39, 1);
    border-color: rgba(219, 39, 119, 0.5);
    color: rgba(226, 232, 240, 1);
    transform: translateY(-2px);
  }
  
  /* Corners and Scan Line */
  .cyber-corner {
    position: absolute;
    width: 8px;
    height: 8px;
    border-color: rgb(219, 39, 119);
  }
  
  .cyber-corner-tl {
    top: 0;
    left: 0;
    border-top: 1px solid;
    border-left: 1px solid;
  }
  
  .cyber-corner-tr {
    top: 0;
    right: 0;
    border-top: 1px solid;
    border-right: 1px solid;
  }
  
  .cyber-corner-bl {
    bottom: 0;
    left: 0;
    border-bottom: 1px solid;
    border-left: 1px solid;
  }
  
  .cyber-corner-br {
    bottom: 0;
    right: 0;
    border-bottom: 1px solid;
    border-right: 1px solid;
  }
  
  .cyber-scan-line {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(219, 39, 119, 0.7), transparent);
    opacity: 0.5;
    animation: scan-line 3s linear infinite;
  }
  
  @keyframes scan-line {
    0% { transform: translateY(0); }
    100% { transform: translateY(100%); }
  }
  
  /* Spinner */
  .cyber-spinner {
    position: relative;
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .cyber-spinner-ring {
    position: absolute;
    inset: 0;
    border: 2px solid transparent;
    border-radius: 50%;
  }
  
  .cyber-spinner-ring:nth-child(1) {
    border-top-color: rgba(255, 255, 255, 0.9);
    animation: spin 1s linear infinite;
  }
  
  .cyber-spinner-ring:nth-child(2) {
    border-right-color: rgba(255, 255, 255, 0.6);
    animation: spin 1.5s linear infinite reverse;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Nova Hero Title */
  .nova-hero-title {
    font-size: 2.5rem;
    font-weight: 700;
    display: flex;
    flex-direction: row;
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
    border-radius: 50%;
    background: rgba(219, 39, 119, 0.3);
    box-shadow: 0 0 5px rgba(219, 39, 119, 0.5);
    animation: float-particle 15s infinite linear;
  }
  
  @keyframes float-particle {
    0% {
      transform: translateY(0) translateX(0);
    }
    25% {
      transform: translateY(-20px) translateX(20px);
    }
    50% {
      transform: translateY(0) translateX(40px);
    }
    75% {
      transform: translateY(20px) translateX(20px);
    }
    100% {
      transform: translateY(0) translateX(0);
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
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
`}</style>
</div>
);
};

export default Register;