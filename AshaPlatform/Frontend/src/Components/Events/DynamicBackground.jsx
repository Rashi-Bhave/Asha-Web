import { useRef, useEffect, useState } from 'react';

/**
 * DynamicBackground - An animated cyberpunk background with interactive elements
 * 
 * Features:
 * - Animated grid with mouse parallax
 * - Particle system with customizable density
 * - Pulsing glow orbs that follow mouse movement
 * - Scanner line effect
 * 
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.particleDensity - Number of particles (default: 30)
 * @param {boolean} props.showGrid - Whether to show the grid (default: true)
 * @param {boolean} props.showScannerLine - Whether to show the scanner line effect (default: true)
 * @param {boolean} props.interactive - Whether background reacts to mouse (default: true)
 */
const DynamicBackground = ({
  className = '',
  particleDensity = 30,
  showGrid = true,
  showScannerLine = true,
  interactive = true
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const bgRef = useRef(null);
  const gridRef = useRef(null);
  const particlesRef = useRef(null);
  
  // Create particles for background effect
  useEffect(() => {
    if (particlesRef.current) {
      // Clear any existing particles
      particlesRef.current.innerHTML = '';
      
      // Create particles
      for (let i = 0; i < particleDensity; i++) {
        const particle = document.createElement('div');
        particle.className = 'cyber-particle';
        
        // Random position and animation delay
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        particle.style.animationDuration = `${5 + Math.random() * 10}s`;
        
        particlesRef.current.appendChild(particle);
      }
    }
  }, [particleDensity]);

  // Track mouse movement for parallax effects
  useEffect(() => {
    if (!interactive) return;
    
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePosition({ x, y });
      
      // Subtle parallax effect for grid
      if (gridRef.current) {
        gridRef.current.style.transform = `rotateX(80deg) translateZ(-100px) translate(${-x * 10}px, ${-y * 10}px)`;
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  return (
    <div className={`cyber-background ${className}`} ref={bgRef}>
      {showGrid && <div className="cyber-grid" ref={gridRef}></div>}
      <div className="cyber-particles" ref={particlesRef}></div>
      {showScannerLine && <div className="cyber-scanner-line"></div>}
      
      <div 
        className="cyber-glow-orb cyber-glow-orb-1"
        style={interactive ? {
          transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`
        } : {}}
      ></div>
      <div 
        className="cyber-glow-orb cyber-glow-orb-2"
        style={interactive ? {
          transform: `translate(${-mousePosition.x * 30}px, ${-mousePosition.y * 30}px)`
        } : {}}
      ></div>
      <div 
        className="cyber-glow-orb cyber-glow-orb-3"
        style={interactive ? {
          transform: `translate(${mousePosition.x * 15}px, ${-mousePosition.y * 15}px)`
        } : {}}
      ></div>
    </div>
  );
};

export default DynamicBackground;