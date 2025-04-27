import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../Loading/Loading.jsx';
import ChatBubble from '../ChatBubble/ChatBubble.jsx';

function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [activeSection, setActiveSection] = useState('learn');
    const heroRef = useRef(null);
    const testimonialsRef = useRef(null);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    
    // Features with icons and descriptions - updated for women in tech focus
    const features = [
        { 
            title: 'Algorithm Mastery', 
            description: 'Solve challenges designed by women engineers to build your technical skills and confidence.',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            ),
            link: '/problems',
            color: 'from-rose-400 to-purple-600',
            animation: 'fade-right'
        },
        { 
            title: 'Supportive Community', 
            description: 'Connect with fellow women in tech to share experiences, get advice, and build your network.',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
            ),
            link: '/discuss',
            color: 'from-fuchsia-400 to-indigo-600',
            animation: 'fade-up'
        },
        { 
            title: 'Interview Confidence', 
            description: 'Practice technical interviews in a safe space and receive feedback from other women professionals.',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            link: '/join-interview',
            color: 'from-cyan-400 to-blue-600',
            animation: 'fade-left'
        },
        { 
            title: 'Career Pathfinder', 
            description: 'Explore careers in tech with insights from successful women who have broken barriers.',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 017.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            ),
            link: '/career',
            color: 'from-teal-400 to-emerald-600',
            animation: 'fade-left-slow'
        }
    ];
    
    // Impact stats with animated counters - updated for women focus
    const stats = [
        { label: 'Women Engineers', value: 5000, icon: 'users', suffix: '+' },
        { label: 'Challenges Solved', value: 780000, icon: 'puzzle', suffix: '+' },
        { label: 'Career Advancements', value: 1200, icon: 'career', suffix: '+' },
        { label: 'Mentorship Hours', value: 8500, icon: 'mentorship', suffix: '+' }
    ];
    
    // New: Added community pillars section
    const communityPillars = [
        {
            title: "Learn",
            id: "learn",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13c-1.168-.776-2.754-1.253-4.5-1.253-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            description: "Master coding skills through our comprehensive problem sets designed by women engineers to address real-world challenges.",
            points: [
                "Structured learning paths for all skill levels",
                "Challenges focused on practical applications",
                "Interactive tutorials with visual explanations"
            ],
            image: "https://res.cloudinary.com/dyfmlusbc/image/upload/v1745403491/learn_mtywlj.jpg",
            color: "from-purple-600 to-indigo-600"
        },
        {
            title: "Connect",
            id: "connect",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            description: "Join a vibrant community of women supporting each other through the unique challenges of tech careers.",
            points: [
                "Peer mentorship and discussion forums",
                "Group projects and pair programming",
                "Regional meetups and virtual events"
            ],
            image: "https://res.cloudinary.com/dyfmlusbc/image/upload/v1745401706/connect_mwdlez.png",
            color: "from-fuchsia-500 to-pink-600"
        },
        {
            title: "Grow",
            id: "grow",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            ),
            description: "Advance your career with resources specifically designed to help women overcome barriers in the tech industry.",
            points: [
                "Career pathing and progression tools",
                "Negotiation and leadership training",
                "Interview preparation with industry experts"
            ],
            image: "https://res.cloudinary.com/dyfmlusbc/image/upload/v1745401700/grow_xcklno.png",
            color: "from-cyan-500 to-blue-600"
        },
        {
            title: "Inspire",
            id: "inspire",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            ),
            description: "Become a role model and inspire the next generation of women in technology through mentorship and visibility.",
            points: [
                "Mentorship programs for early-career women",
                "Speaker opportunities at tech events",
                "Contribute to open-source projects led by women"
            ],
            image: "https://res.cloudinary.com/dyfmlusbc/image/upload/v1745401707/inspire_btcbjj.png",
            color: "from-rose-500 to-red-600"
        }
    ];
    
    // New: Testimonials from women in the community
    const testimonials = [
        {
            name: "Sophia Chen",
            role: "Senior Software Engineer",
            company: "TechVision Inc.",
            quote: "This platform gave me the confidence to ace technical interviews after a career break. The supportive community and practice interviews made all the difference in my career journey.",
            image: "https://res.cloudinary.com/dyfmlusbc/image/upload/v1745404297/sophia_ean8pt.jpg"
        },
        {
            name: "Aisha Johnson",
            role: "Full Stack Developer",
            company: "InnovateTech",
            quote: "Finding other women who understand the unique challenges I face in tech has been invaluable. The career visualization tools helped me map my path from junior to senior developer.",
            image: "https://res.cloudinary.com/dyfmlusbc/image/upload/v1745404298/aisha_qpls7k.jpg"
        },
        {
            name: "Maya Patel",
            role: "Data Scientist",
            company: "AnalyticsPro",
            quote: "The algorithm challenges here are practical and relevant to real work. I went from struggling with impostor syndrome to leading a team of data scientists in just 18 months.",
            image: "https://res.cloudinary.com/dyfmlusbc/image/upload/v1745404297/maya_nivbyl.jpg"
        }
    ];
    
    // New: Upcoming events in the community
    const upcomingEvents = [
        {
            title: "Women in AI Conference",
            date: "June 15-17, 2025",
            description: "Join industry leaders for a three-day virtual conference on the latest in artificial intelligence.",
            link: "#"
        },
        {
            title: "Code Together: Pair Programming Session",
            date: "May 5, 2025",
            description: "Partner with another community member to solve challenges and build your collaboration skills.",
            link: "#"
        },
        {
            title: "Tech Leadership Workshop",
            date: "May 23, 2025",
            description: "Learn strategies for leadership in tech environments from successful women CTOs and VPs.",
            link: "#"
        }
    ];
    
    useEffect(() => {
        // Simulated loading
        const timer = setTimeout(() => {
            setIsLoading(false);
            
            // Start entry animations after loading
            setTimeout(() => {
                setAnimationComplete(true);
            }, 500);
        }, 1000);
        
        // Mouse movement effect for hero section
        const handleMouseMove = (e) => {
            if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                setMousePosition({ x, y });
            }
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        
        // Create animated particles
        const createParticles = () => {
            const container = document.querySelector('.nova-particles-container');
            if (container) {
                // Remove any existing particles
                const existingParticles = container.querySelectorAll('.nova-particle');
                existingParticles.forEach(p => p.remove());
                
                // Create new particles
                for (let i = 0; i < 50; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'nova-particle';
                    
                    // Randomize properties
                    const size = Math.random() * 6 + 1;
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
                    
                    container.appendChild(particle);
                }
            }
        };
        
        // Testimonial auto-rotation
        const testimonialInterval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 8000);
        
        if (!isLoading) {
            createParticles();
            
            // Intersection Observer for scroll animations
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('animate-in');
                        }
                    });
                },
                { threshold: 0.1 }
            );
            
            document.querySelectorAll('.scroll-animate').forEach(el => {
                observer.observe(el);
            });
        }
        
        // Clean up
        return () => {
            clearTimeout(timer);
            clearInterval(testimonialInterval);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isLoading, testimonials.length]);
    
    // Animated counter hook
    const AnimatedCounter = ({ targetValue, suffix = '' }) => {
        const [count, setCount] = useState(0);
        const countRef = useRef(null);
        
        useEffect(() => {
            let start = 0;
            const end = parseInt(targetValue);
            
            // Don't run if already at target
            if (start === end) return;
            
            // Calculate increment step based on target value
            let step = Math.max(1, Math.floor(end / 100));
            
            // Start counter animation
            let intervalId = setInterval(() => {
                start += step;
                if (start > end) {
                    start = end;
                    clearInterval(intervalId);
                }
                setCount(start);
            }, 20);
            
            // Clean up
            return () => clearInterval(intervalId);
        }, [targetValue]);
        
        return <span>{count.toLocaleString()}{suffix}</span>;
    };
    
    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="nova-home">
            {/* Background particle animation container */}
            <div className="nova-particles-container"></div>
            
            {/* Hero Section */}
            <section 
                ref={heroRef}
                className="nova-hero-section"
                style={{
                    backgroundPosition: `${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%`,
                }}
            >
                {/* Animated grid lines */}
                <div className="nova-grid-lines"></div>
                
                {/* Glowing orbs */}
                <div className="nova-glow-orb nova-glow-orb-1"></div>
                <div className="nova-glow-orb nova-glow-orb-2"></div>
                <div className="nova-glow-orb nova-glow-orb-3"></div>
                
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        {/* Left content */}
                        <div className="md:w-1/2 md:pr-12 mb-10 md:mb-0 nova-hero-content" 
                            style={{
                                opacity: animationComplete ? 1 : 0,
                                transform: animationComplete ? 'translateX(0)' : 'translateX(-50px)'
                            }}
                        >
                            <h1 className="nova-hero-title">
                                <span className="nova-title-line">Empowering Women</span>
                                <span className="nova-title-line">in Technology</span>
                                <span className="nova-blink">_</span>
                            </h1>
                            
                            <div className="relative">
                                <p className="nova-hero-text">
                                    Join a community that's redefining the future of tech. 
                                    <span className="nova-highlight nova-highlight-1">Learn</span>, 
                                    <span className="nova-highlight nova-highlight-2">connect</span>, and 
                                    <span className="nova-highlight nova-highlight-3">grow</span> 
                                    with women who code, build, and innovate together.
                                </p>
                            </div>
                            
                            <div className="nova-hero-buttons">
                                <Link 
                                    to="/register" 
                                    className="nova-primary-button"
                                >
                                    <span className="relative z-10 flex items-center">
                                        <span>Join the Community</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                    
                                    {/* Animated gradient overlay */}
                                    <span className="nova-button-overlay"></span>
                                </Link>
                                
                                <Link 
                                    to="/problems" 
                                    className="nova-secondary-button"
                                >
                                    <span className="flex items-center">
                                        <span>Start Coding</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-all duration-300 group-hover:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                    </span>
                                </Link>
                            </div>
                            
                            {/* New: Quick stats in hero */}
                            <div className="nova-quick-stats">
                                <div className="nova-stat-item">
                                    <span className="nova-stat-value"><AnimatedCounter targetValue={5000} suffix="+" /></span>
                                    <span className="nova-stat-label">Women in Tech</span>
                                </div>
                                <div className="nova-stat-item">
                                    <span className="nova-stat-value"><AnimatedCounter targetValue={120} suffix="+" /></span>
                                    <span className="nova-stat-label">Countries</span>
                                </div>
                                <div className="nova-stat-item">
                                    <span className="nova-stat-value"><AnimatedCounter targetValue={100} suffix="%" /></span>
                                    <span className="nova-stat-label">Women-Led</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Right content - Hero illustration */}
                        <div className="md:w-1/2 flex justify-center nova-illustration-container"
                            style={{
                                opacity: animationComplete ? 1 : 0,
                                transform: animationComplete ? 'translateX(0)' : 'translateX(50px)'
                            }}
                        >
                            <div className="nova-illustration">
                                {/* SVG illustration would go here - using placeholder */}
                                <img 
                                    src="https://res.cloudinary.com/dyfmlusbc/image/upload/v1745401706/hero-illustration_x9yq48.gif" 
                                    alt="Women coding together" 
                                    className="w-full h-auto" 
                                />
                                
                                {/* Animated elements around illustration */}
                                <div className="nova-orbiting-element nova-element-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                </div>
                                <div className="nova-orbiting-element nova-element-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div className="nova-orbiting-element nova-element-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 017.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <div className="nova-orbiting-element nova-element-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Animated down arrow */}
                <div className="nova-scroll-indicator">
                    <div className="nova-mouse">
                        <div className="nova-mouse-wheel"></div>
                    </div>
                    <div className="nova-arrow-container">
                        <svg className="nova-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </div>
                
                {/* Status ticker */}
                <div className="nova-status-ticker">
                    <p className="nova-ticker-text">
                        Join thousands of women breaking barriers in tech • Solving challenges together • Building the future • Community-driven learning • Supportive mentorship
                    </p>
                </div>
            </section>
            
            {/* Features Section */}
            <section className="nova-features-section">
                <div className="container mx-auto px-6">
                    <div className="nova-section-header scroll-animate" data-animation="fade-up">
                        <h2 className="nova-section-title">
                            Our Platform Features
                        </h2>
                        <p className="nova-section-subtitle">
                            Tools and resources designed specifically to support women on their journey in technology
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className={`nova-feature-panel scroll-animate`} data-animation={feature.animation}>
                                {/* Top gradient accent */}
                                <div className={`nova-feature-accent bg-gradient-to-r ${feature.color}`}></div>
                                
                                <div className="nova-feature-content">
                                    <div className={`nova-feature-icon bg-gradient-to-br ${feature.color}`}>
                                        {feature.icon}
                                    </div>
                                    
                                    <h3 className="nova-feature-title">
                                        {feature.title}
                                    </h3>
                                    
                                    <p className="nova-feature-description">
                                        {feature.description}
                                    </p>
                                    
                                    <Link to={feature.link} className="nova-feature-link">
                                        <span>Explore</span>
                                        <svg className="nova-feature-link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </Link>
                                </div>
                                
                                {/* Decorative elements */}
                                <div className="nova-corner nova-corner-tl"></div>
                                <div className="nova-corner nova-corner-tr"></div>
                                <div className="nova-corner nova-corner-bl"></div>
                                <div className="nova-corner nova-corner-br"></div>
                                <div className="nova-scan-line"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Community Pillars Section */}
            <section className="nova-community-section">
                <div className="container mx-auto px-6">
                    <div className="nova-section-header scroll-animate" data-animation="fade-up">
                        <h2 className="nova-section-title">
                            Our Community Pillars
                        </h2>
                        <p className="nova-section-subtitle">
                            Four foundational elements that support our mission to empower women in technology
                        </p>
                    </div>
                    
                    {/* Pillar Navigation */}
                    <div className="nova-pillar-nav scroll-animate" data-animation="fade-up">
                        {communityPillars.map(pillar => (
                            <button 
                                key={pillar.id}
                                className={`nova-pillar-button ${activeSection === pillar.id ? 'nova-pillar-active' : ''}`}
                                onClick={() => setActiveSection(pillar.id)}
                            >
                                <div className="nova-pillar-icon">
                                    {pillar.icon}
                                </div>
                                <span>{pillar.title}</span>
                            </button>
                        ))}
                    </div>
                    
                    {/* Pillar Content */}
                    <div className="nova-pillar-content scroll-animate" data-animation="fade-up">
                        {communityPillars.map(pillar => (
                            <div 
                                key={pillar.id} 
                                className={`nova-pillar-panel ${activeSection === pillar.id ? 'nova-pillar-panel-active' : ''}`}
                            >
                                <div className="flex flex-col md:flex-row items-center">
                                    <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0">
                                        <h3 className={`nova-pillar-title bg-gradient-to-r ${pillar.color} bg-clip-text text-transparent`}>
                                            {pillar.title}
                                        </h3>
                                        <p className="nova-pillar-description">
                                            {pillar.description}
                                        </p>
                                        <ul className="nova-pillar-list">
                                            {pillar.points.map((point, idx) => (
                                                <li key={idx} className="nova-pillar-list-item">
                                                    <svg className="nova-list-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="md:w-1/2 flex justify-center">
                                        <div className="nova-pillar-image-container">
                                            <img 
                                                src={pillar.image} 
                                                alt={pillar.title} 
                                                className="nova-pillar-image"
                                            />
                                            
                                            {/* Decorative elements */}
                                            <div className={`nova-pillar-image-glow bg-gradient-to-r ${pillar.color}`}></div>
                                            <div className="nova-pillar-image-frame"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Stats Section */}
            <section className="nova-stats-section">
                {/* Background animation */}
                <div className="nova-stats-background"></div>
                
                <div className="container mx-auto px-6 relative z-10">
                    <div className="nova-section-header scroll-animate" data-animation="fade-up">
                        <h2 className="nova-section-title">
                            Our Community Impact
                        </h2>
                        <p className="nova-section-subtitle">
                            Together, we're changing the landscape of technology for women around the world
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                        {stats.map((stat, index) => (
                            <div key={index} className="nova-stat-panel scroll-animate" data-animation={`fade-in-${index + 1}`}>
                                <div className="relative">
                                    {/* Decorative dots */}
                                    <div className="nova-stat-dot nova-stat-dot-1"></div>
                                    <div className="nova-stat-dot nova-stat-dot-2" style={{ animationDelay: '0.5s' }}></div>
                                    
                                    <div className="nova-stat-header">
                                        <div className="nova-stat-icon">
                                            {stat.icon === 'users' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            )}
                                            {stat.icon === 'puzzle' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                                                </svg>
                                            )}
                                            {stat.icon === 'career' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                </svg>
                                            )}
                                            {stat.icon === 'mentorship' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0zM13 13a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            )}
                                        </div>
                                        <h3 className="nova-stat-label">{stat.label}</h3>
                                    </div>
                                    
                                    <p className="nova-stat-value">
                                        <AnimatedCounter targetValue={stat.value} suffix={stat.suffix} />
                                    </p>
                                </div>
                                
                                {/* Decorative elements */}
                                <div className="nova-corner nova-corner-tl"></div>
                                <div className="nova-corner nova-corner-tr"></div>
                                <div className="nova-corner nova-corner-bl"></div>
                                <div className="nova-corner nova-corner-br"></div>
                                <div className="nova-scan-line"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Testimonials Section */}
            <section className="nova-testimonials-section" ref={testimonialsRef}>
                <div className="container mx-auto px-6">
                    <div className="nova-section-header scroll-animate" data-animation="fade-up">
                        <h2 className="nova-section-title">
                            Success Stories
                        </h2>
                        <p className="nova-section-subtitle">
                            Hear from women who've transformed their careers through our community
                        </p>
                    </div>
                    
                    <div className="nova-testimonials-container">
                        <div className="nova-testimonials-track" style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}>
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="nova-testimonial-card scroll-animate" data-animation="fade-up">
                                    <div className="nova-testimonial-content">
                                        <div className="nova-testimonial-quote">
                                            <svg className="nova-quote-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                            </svg>
                                            <p className="nova-quote-text">{testimonial.quote}</p>
                                        </div>
                                        
                                        <div className="nova-testimonial-author">
                                            <div className="nova-author-image">
                                                <img src={testimonial.image} alt={testimonial.name} />
                                            </div>
                                            <div className="nova-author-info">
                                                <h4 className="nova-author-name">{testimonial.name}</h4>
                                                <p className="nova-author-role">{testimonial.role}</p>
                                                <p className="nova-author-company">{testimonial.company}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Decorative elements */}
                                    <div className="nova-corner nova-corner-tl"></div>
                                    <div className="nova-corner nova-corner-tr"></div>
                                    <div className="nova-corner nova-corner-bl"></div>
                                    <div className="nova-corner nova-corner-br"></div>
                                    <div className="nova-scan-line"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Testimonial navigation */}
                    <div className="nova-testimonial-nav">
                        {testimonials.map((_, index) => (
                            <button 
                                key={index} 
                                className={`nova-nav-dot ${currentTestimonial === index ? 'nova-nav-dot-active' : ''}`}
                                onClick={() => setCurrentTestimonial(index)}
                            ></button>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Upcoming Events Section */}
            <section className="nova-events-section">
                <div className="container mx-auto px-6">
                    <div className="nova-section-header scroll-animate" data-animation="fade-up">
                        <h2 className="nova-section-title">
                            Upcoming Events
                        </h2>
                        <p className="nova-section-subtitle">
                            Connect, learn, and grow with these exclusive opportunities for our community
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                        {upcomingEvents.map((event, index) => (
                            <div key={index} className="nova-event-card scroll-animate" data-animation={`fade-up-${index + 1}`}>
                                <div className="nova-event-date">{event.date}</div>
                                <h3 className="nova-event-title">{event.title}</h3>
                                <p className="nova-event-description">{event.description}</p>
                                <a href={event.link} className="nova-event-link">
                                    <span>Learn More</span>
                                    <svg className="nova-event-link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </a>
                                
                                {/* Decorative elements */}
                                <div className="nova-corner nova-corner-tl"></div>
                                <div className="nova-corner nova-corner-tr"></div>
                                <div className="nova-corner nova-corner-bl"></div>
                                <div className="nova-corner nova-corner-br"></div>
                                <div className="nova-scan-line"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Call to Action */}
            <section className="nova-cta-section">
                {/* Decorative circuit lines background */}
                <div className="nova-circuit-pattern"></div>
                
                {/* Light beams */}
                <div className="nova-light-beam"></div>
                
                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="nova-cta-content scroll-animate" data-animation="fade-up">
                        <h2 className="nova-cta-title">
                            Ready to join our community of women in tech?
                        </h2>
                        
                        <p className="nova-cta-text">
                            Connect with thousands of women who are breaking barriers, building careers, and supporting each other in the world of technology.
                        </p>
                        
                        <Link to="/register" className="nova-cta-button">
                            <span className="relative z-10 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                Join Now - It's Free
                            </span>
                            
                            {/* Slide animation */}
                            <span className="nova-button-slide"></span>
                        </Link>
                        
                        <div className="nova-cta-features">
                            <div className="nova-cta-feature">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span>Safe, supportive community</span>
                            </div>
                            <div className="nova-cta-feature">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Learn at your own pace</span>
                            </div>
                            <div className="nova-cta-feature">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Connect with mentors</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Decorative elements */}
                <div className="nova-corner nova-corner-tl"></div>
                <div className="nova-corner nova-corner-tr"></div>
                <div className="nova-corner nova-corner-bl"></div>
                <div className="nova-corner nova-corner-br"></div>
                <div className="nova-scan-line"></div>
            </section>

            <ChatBubble />
            
            {/* Custom styling */}
            <style jsx>{`
                /* Core styling with women-focused color palette */
                .nova-home {
                    min-height: 100vh;
                    background-color: rgba(15, 23, 42, 0.95);
                    font-family: 'JetBrains Mono', monospace;
                    position: relative;
                    overflow: hidden;
                    color: rgb(226, 232, 240);
                }
                
                /* Hero Section */
                .nova-hero-section {
                    position: relative;
                    min-height: 80vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    overflow: hidden;
                    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(37, 24, 51, 0.98) 100%);
                    isolation: isolate;
                    padding-top: 3rem;
                    padding-bottom: 5rem;
                }
                
                .nova-grid-lines {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    background-image: 
                        linear-gradient(to right, rgba(219, 39, 119, 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(219, 39, 119, 0.1) 1px, transparent 1px);
                    background-size: 40px 40px;
                    animation: grid-move 30s linear infinite;
                    opacity: 0.2;
                }
                
                @keyframes grid-move {
                    0% { background-position: 0 0; }
                    100% { background-position: 40px 40px; }
                }
                
                .nova-glow-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.2;
                }
                
                .nova-glow-orb-1 {
                    top: 15%;
                    left: 15%;
                    width: 16rem;
                    height: 16rem;
                    background: rgb(219, 39, 119);
                    animation: float 8s ease-in-out infinite;
                }
                
                .nova-glow-orb-2 {
                    bottom: 25%;
                    right: 25%;
                    width: 18rem;
                    height: 18rem;
                    background: rgb(124, 58, 237);
                    animation: float 10s ease-in-out infinite;
                    animation-delay: 1s;
                }
                
                .nova-glow-orb-3 {
                    top: 40%;
                    right: 15%;
                    width: 12rem;
                    height: 12rem;
                    background: rgb(14, 165, 233);
                    animation: float 9s ease-in-out infinite;
                    animation-delay: 2s;
                }
                
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }
                
                .nova-hero-content {
                    transition: all 1s cubic-bezier(0.33, 1, 0.68, 1);
                    transition-delay: 300ms;
                }
                
                .nova-hero-title {
                    font-size: 3rem;
                    font-weight: 700;
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 1.5rem;
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
                
                @media (min-width: 768px) {
                    .nova-hero-title {
                        font-size: 3.75rem;
                    }
                }
                
                .nova-blink {
                    animation: blink 1s step-end infinite;
                }
                
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                
                .nova-hero-text {
                    font-size: 1.125rem;
                    color: rgba(226, 232, 240, 0.8);
                    margin-bottom: 2rem;
                    line-height: 1.5;
                    max-width: 32rem;
                    position: relative;
                    z-index: 10;
                }
                
                .nova-highlight {
                    position: relative;
                    display: inline-block;
                    z-index: 10;
                }
                
                .nova-highlight::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 0.75rem;
                    opacity: 0.3;
                    transform: skewX(-12deg);
                    z-index: -1;
                }
                
                .nova-highlight-1::after {
                    background: rgba(219, 39, 119, 0.5);
                }
                
                .nova-highlight-2::after {
                    background: rgba(124, 58, 237, 0.5);
                }
                
                .nova-highlight-3::after {
                    background: rgba(14, 165, 233, 0.5);
                }
                
                .nova-hero-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                
                .nova-primary-button {
                    position: relative;
                    overflow: hidden;
                    display: inline-flex;
                    align-items: center;
                    padding: 0.75rem 1.5rem;
                    background: linear-gradient(90deg, rgb(219, 39, 119) 0%, rgb(124, 58, 237) 100%);
                    color: rgb(226, 232, 240);
                    font-weight: 500;
                    border-radius: 0.375rem;
                    box-shadow: 0 10px 15px -3px rgba(219, 39, 119, 0.2), 0 4px 6px -4px rgba(219, 39, 119, 0.2);
                    transition: all 0.3s;
                }
                
                .nova-primary-button:hover {
                    transform: translateY(-2px) scale(1.05);
                    box-shadow: 0 20px 25px -5px rgba(219, 39, 119, 0.3), 0 8px 10px -6px rgba(219, 39, 119, 0.3);
                }
                
                .nova-button-overlay {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    transform: translateX(-100%) scaleX(0);
                    opacity: 0.2;
                    transition: transform 1s;
                }
                
                .nova-primary-button:hover .nova-button-overlay {
                    transform: translateX(0) scaleX(1);
                }
                
                .nova-secondary-button {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.75rem 1.5rem;
                    background: rgba(17, 24, 39, 0.8);
                    border: 1px solid rgba(219, 39, 119, 0.3);
                    color: rgb(219, 39, 119);
                    font-weight: 500;
                    border-radius: 0.375rem;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    transition: all 0.3s;
                }
                
                .nova-secondary-button:hover {
                    background: rgba(17, 24, 39, 1);
                    border-color: rgba(219, 39, 119, 0.5);
                    box-shadow: 0 0 10px rgba(219, 39, 119, 0.3);
                }
                
                /* Quick Stats in Hero */
                .nova-quick-stats {
                    display: flex;
                    gap: 2rem;
                    flex-wrap: wrap;
                    margin-top: 2rem;
                }
                
                .nova-stat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                .nova-stat-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    background: linear-gradient(90deg, rgb(219, 39, 119) 0%, rgb(124, 58, 237) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    color: transparent;
                }
                
                .nova-stat-label {
                    font-size: 0.875rem;
                    color: rgba(226, 232, 240, 0.7);
                    margin-top: 0.25rem;
                }
                
                /* Hero Illustration */
                .nova-illustration-container {
                    transition: all 1s cubic-bezier(0.33, 1, 0.68, 1);
                    transition-delay: 500ms;
                }
                
                .nova-illustration {
                    position: relative;
                    width: 100%;
                    max-width: 500px;
                }
                
                .nova-orbiting-element {
                    position: absolute;
                    width: 2.5rem;
                    height: 2.5rem;
                    background: rgba(17, 24, 39, 0.8);
                    border: 1px solid rgba(219, 39, 119, 0.5);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgb(219, 39, 119);
                    box-shadow: 0 0 15px rgba(219, 39, 119, 0.3);
                    animation: orbit 15s infinite linear;
                }
                
                .nova-element-1 {
                    top: 10%;
                    right: 5%;
                    animation-duration: 12s;
                }
                
                .nova-element-2 {
                    top: 70%;
                    right: 15%;
                    animation-duration: 16s;
                    animation-delay: 1s;
                }
                
                .nova-element-3 {
                    top: 40%;
                    right: -5%;
                    animation-duration: 14s;
                    animation-delay: 2s;
                }
                
                .nova-element-4 {
                    top: 80%;
                    right: 40%;
                    animation-duration: 18s;
                    animation-delay: 3s;
                }
                
                @keyframes orbit {
                    0% { transform: rotate(0deg) translateX(30px) rotate(0deg); }
                    100% { transform: rotate(360deg) translateX(30px) rotate(-360deg); }
                }
                
                /* Scroll Indicator */
                .nova-scroll-indicator {
                    position: absolute;
                    bottom: 2rem;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    opacity: 0.7;
                    transition: opacity 0.3s;
                }
                
                .nova-scroll-indicator:hover {
                    opacity: 1;
                }
                
                .nova-mouse {
                    width: 2rem;
                    height: 3rem;
                    border: 2px solid rgba(219, 39, 119, 0.7);
                    border-radius: 1rem;
                    position: relative;
                }
                
                .nova-mouse-wheel {
                    width: 0.375rem;
                    height: 0.375rem;
                    background: rgba(219, 39, 119, 0.7);
                    border-radius: 50%;
                    position: absolute;
                    top: 0.5rem;
                    left: 50%;
                    transform: translateX(-50%);
                    animation: mouse-wheel 2s infinite;
                }
                
                @keyframes mouse-wheel {
                    0%, 100% { top: 0.5rem; opacity: 1; }
                    50% { top: 1.5rem; opacity: 0.3; }
                }
                
                .nova-arrow-container {
                    animation: bounce 2s infinite;
                }
                
                .nova-arrow {
                    width: 1.5rem;
                    height: 1.5rem;
                    color: rgba(219, 39, 119, 0.7);
                }
                
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(10px); }
                }
                
                .nova-status-ticker {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(90deg, rgba(219, 39, 119, 0.8) 0%, rgba(124, 58, 237, 0.8) 50%, rgba(219, 39, 119, 0.8) 100%);
                    color: rgb(15, 23, 42);
                    padding: 0.5rem 0;
                    text-align: center;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transform: translateY(0);
                    transition: transform 0.5s;
                    overflow: hidden;
                }
                
                .nova-status-ticker:hover {
                    transform: translateY(-5px);
                }
                
                .nova-ticker-text {
                    display: inline-block;
                    white-space: nowrap;
                    animation: scroll-x 20s linear infinite;
                }
                
                @keyframes scroll-x {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                
                /* Features Section */
                .nova-features-section {
                    padding: 5rem 0;
                    background: rgba(17, 24, 39, 1);
                    position: relative;
                }
                
                .nova-section-header {
                    text-align: center;
                    max-width: 48rem;
                    margin: 0 auto 4rem;
                }
                
                .nova-section-title {
                    font-size: 1.875rem;
                    font-weight: 700;
                    background: linear-gradient(90deg, rgb(219, 39, 119) 0%, rgb(124, 58, 237) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    color: transparent;
                    margin-bottom: 1rem;
                }
                
                .nova-section-subtitle {
                    color: rgba(226, 232, 240, 0.7);
                    font-size: 1rem;
                }
                
                .nova-feature-panel {
                    position: relative;
                    background: rgba(15, 23, 42, 0.7);
                    border: 1px solid rgba(219, 39, 119, 0.3);
                    border-radius: 0.5rem;
                    overflow: hidden;
                    transition: all 0.3s;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                                0 2px 4px -1px rgba(0, 0, 0, 0.06),
                                0 0 0 1px rgba(219, 39, 119, 0.1) inset,
                                0 0 20px rgba(219, 39, 119, 0.1);
                    backdrop-filter: blur(10px);
                }
                
                .nova-feature-panel:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                                0 4px 6px -2px rgba(0, 0, 0, 0.05),
                                0 0 0 1px rgba(219, 39, 119, 0.2) inset,
                                0 0 30px rgba(219, 39, 119, 0.2);
                    border-color: rgba(219, 39, 119, 0.5);
                }
                
                .nova-feature-accent {
                    height: 0.5rem;
                    width: 100%;
                }
                
                .nova-feature-content {
                    padding: 1.5rem;
                }
                
                .nova-feature-icon {
                    width: 3rem;
                    height: 3rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 0.375rem;
                    color: rgb(255, 255, 255);
                    margin-bottom: 1rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                                0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    transition: transform 0.3s;
                }
                
                .nova-feature-panel:hover .nova-feature-icon {
                    transform: scale(1.1);
                }
                
                .nova-feature-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: rgb(226, 232, 240);
                    margin-bottom: 0.5rem;
                    transition: color 0.3s;
                }
                
                .nova-feature-panel:hover .nova-feature-title {
                    color: rgb(219, 39, 119);
                }
                
                .nova-feature-description {
                    color: rgba(226, 232, 240, 0.7);
                    font-size: 0.875rem;
                    margin-bottom: 1rem;
                    line-height: 1.5;
                }
                
                .nova-feature-link {
                    display: inline-flex;
                    align-items: center;
                    color: rgb(219, 39, 119);
                    font-weight: 500;
                    font-size: 0.875rem;
                    transition: color 0.3s;
                }
                
                .nova-feature-link:hover {
                    color: rgb(236, 72, 153);
                }
                
                .nova-feature-link-icon {
                    height: 1rem;
                    width: 1rem;
                    margin-left: 0.25rem;
                    transition: transform 0.3s;
                }
                
                .nova-feature-panel:hover .nova-feature-link-icon {
                    transform: translateX(4px);
                }
                
                /* Community Pillars Section */
                .nova-community-section {
                    padding: 5rem 0;
                    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(37, 24, 51, 0.98) 100%);
                    position: relative;
                    overflow: hidden;
                }
                
                .nova-pillar-nav {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 1rem;
                    margin-bottom: 3rem;
                }
                
                .nova-pillar-button {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 1.25rem 1.5rem;
                    background: rgba(15, 23, 42, 0.7);
                    border: 1px solid rgba(219, 39, 119, 0.3);
                    border-radius: 0.5rem;
                    transition: all 0.3s;
                    flex: 1;
                    min-width: 150px;
                    max-width: 200px;
                }
                
                .nova-pillar-button:hover {
                    background: rgba(15, 23, 42, 0.9);
                    border-color: rgba(219, 39, 119, 0.5);
                    transform: translateY(-5px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                                0 4px 6px -2px rgba(0, 0, 0, 0.05),
                                0 0 10px rgba(219, 39, 119, 0.3);
                }
                
                .nova-pillar-active {
                    background: linear-gradient(135deg, rgba(219, 39, 119, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
                    border-color: rgba(219, 39, 119, 0.5);
                    transform: translateY(-5px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                                0 4px 6px -2px rgba(0, 0, 0, 0.05),
                                0 0 10px rgba(219, 39, 119, 0.3);
                }
                
                .nova-pillar-icon {
                    margin-bottom: 0.75rem;
                    color: rgb(219, 39, 119);
                    transition: transform 0.3s;
                }
                
                .nova-pillar-active .nova-pillar-icon {
                    transform: scale(1.1);
                }
                
                .nova-pillar-button span {
                    font-weight: 500;
                    color: rgba(226, 232, 240, 0.8);
                }
                
                .nova-pillar-active span {
                    color: rgb(219, 39, 119);
                }
                
                .nova-pillar-content {
                    position: relative;
                    min-height: 24rem;
                }
                
                .nova-pillar-panel {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.5s ease-in-out;
                    pointer-events: none;
                    visibility: hidden;
                }
                
                .nova-pillar-panel-active {
                    opacity: 1;
                    transform: translateY(0);
                    pointer-events: auto;
                    visibility: visible;
                }
                
                .nova-pillar-title {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                }
                
                .nova-pillar-description {
                    font-size: 1rem;
                    color: rgba(226, 232, 240, 0.8);
                    margin-bottom: 1.5rem;
                    line-height: 1.6;
                }
                
                .nova-pillar-list {
                    margin-bottom: 2rem;
                }
                
                .nova-pillar-list-item {
                    display: flex;
                    align-items: center;
                    font-size: 0.875rem;
                    color: rgba(226, 232, 240, 0.7);
                    margin-bottom: 0.75rem;
                }
                
                .nova-list-icon {
                    width: 1.25rem;
                    height: 1.25rem;
                    margin-right: 0.75rem;
                    color: rgb(219, 39, 119);
                    flex-shrink: 0;
                }
                
                .nova-pillar-image-container {
                    position: relative;
                    width: 100%;
                    max-width: 400px;
                    height: auto;
                    aspect-ratio: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .nova-pillar-image {
                    width: 100%;
                    height: auto;
                    position: relative;
                    z-index: 1;
                }
                
                .nova-pillar-image-glow {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 70%;
                    height: 70%;
                    transform: translate(-50%, -50%);
                    filter: blur(50px);
                    opacity: 0.3;
                    z-index: 0;
                }
                
                .nova-pillar-image-frame {
                    position: absolute;
                    top: -1rem;
                    left: -1rem;
                    right: -1rem;
                    bottom: -1rem;
                    border: 2px solid rgba(219, 39, 119, 0.3);
                    border-radius: 0.5rem;
                    z-index: 2;
                    pointer-events: none;
                }
                
                /* Stats section */
                .nova-stats-section {
                    padding: 5rem 0;
                    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(17, 24, 39, 0.98) 100%);
                    position: relative;
                    overflow: hidden;
                }
                
                .nova-stats-background {
                    position: absolute;
                    inset: 0;
                    opacity: 0.1;
                    background-image: radial-gradient(circle at 20% 30%, rgba(219, 39, 119, 0.3) 0%, transparent 70%),
                                      radial-gradient(circle at 80% 60%, rgba(124, 58, 237, 0.3) 0%, transparent 70%);
                    animation: pulse-bg 10s ease-in-out infinite alternate;
                }
                
                @keyframes pulse-bg {
                    0% { opacity: 0.05; }
                    50% { opacity: 0.15; }
                    100% { opacity: 0.05; }
                }
                
                .nova-stat-panel {
                    position: relative;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(219, 39, 119, 0.3);
                    border-radius: 0.5rem;
                    padding: 1.5rem;
                    backdrop-filter: blur(8px);
                    transition: all 0.3s;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                                0 2px 4px -1px rgba(0, 0, 0, 0.06),
                                0 0 0 1px rgba(219, 39, 119, 0.1) inset,
                                0 0 20px rgba(219, 39, 119, 0.1);
                    overflow: hidden;
                }
                
                .nova-stat-panel:hover {
                    transform: scale(1.05);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                                0 4px 6px -2px rgba(0, 0, 0, 0.05),
                                0 0 0 1px rgba(219, 39, 119, 0.2) inset,
                                0 0 30px rgba(219, 39, 119, 0.2);
                }
                
                .nova-stat-dot {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
                
                .nova-stat-dot-1 {
                    top: 0;
                    right: 0;
                    background-color: rgb(219, 39, 119);
                }
                
                .nova-stat-dot-2 {
                    top: 8px;
                    right: 8px;
                    background-color: rgb(124, 58, 237);
                }
                
                @keyframes ping {
                    75%, 100% {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
                
                .nova-stat-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                
                .nova-stat-icon {
                    margin-right: 0.75rem;
                    color: rgb(219, 39, 119);
                }
                
                .nova-stat-label {
                    font-size: 1rem;
                    font-weight: 500;
                    color: rgba(226, 232, 240, 0.9);
                }
                
                .nova-stat-value {
                    font-size: 1.875rem;
                    font-weight: 700;
                    background: linear-gradient(90deg, rgb(219, 39, 119) 0%, rgb(124, 58, 237) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    color: transparent;
                }
                
                /* Testimonials Section */
                .nova-testimonials-section {
                    padding: 5rem 0;
                    background: rgba(17, 24, 39, 1);
                    position: relative;
                }
                
                .nova-testimonials-container {
                    overflow: hidden;
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 0 1rem;
                }
                
                .nova-testimonials-track {
                    display: flex;
                    transition: transform 0.5s ease-in-out;
                }
                
                .nova-testimonial-card {
                    flex: 0 0 100%;
                    padding: 2rem;
                    background: rgba(15, 23, 42, 0.7);
                    border: 1px solid rgba(219, 39, 119, 0.3);
                    border-radius: 0.5rem;
                    position: relative;
                    overflow: hidden;
                }
                
                .nova-testimonial-content {
                    display: flex;
                    flex-direction: column;
                }
                
                .nova-testimonial-quote {
                    margin-bottom: 2rem;
                    position: relative;
                }
                
                .nova-quote-icon {
                    position: absolute;
                    width: 2.5rem;
                    height: 2.5rem;
                    color: rgba(219, 39, 119, 0.2);
                    top: -0.75rem;
                    left: -0.75rem;
                    transform: scale(-1, 1);
                }
                
                .nova-quote-text {
                    font-size: 1.125rem;
                    color: rgba(226, 232, 240, 0.8);
                    line-height: 1.6;
                    font-style: italic;
                }
                
                .nova-testimonial-author {
                    display: flex;
                    align-items: center;
                }
                
                .nova-author-image {
                    width: 4rem;
                    height: 4rem;
                    border-radius: 50%;
                    overflow: hidden;
                    margin-right: 1rem;
                    border: 2px solid rgba(219, 39, 119, 0.5);
                }
                
                .nova-author-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .nova-author-info {
                    display: flex;
                    flex-direction: column;
                }
                
                .nova-author-name {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: rgba(226, 232, 240, 0.9);
                    margin-bottom: 0.25rem;
                }
                
                .nova-author-role {
                    font-size: 0.875rem;
                    color: rgb(219, 39, 119);
                    margin-bottom: 0.125rem;
                }
                
                .nova-author-company {
                    font-size: 0.875rem;
                    color: rgba(226, 232, 240, 0.7);
                }
                
                .nova-testimonial-nav {
                    display: flex;
                    justify-content: center;
                    gap: 0.75rem;
                    margin-top: 2rem;
                }
                
                .nova-nav-dot {
                    width: 0.75rem;
                    height: 0.75rem;
                    border-radius: 50%;
                    background: rgba(219, 39, 119, 0.3);
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .nova-nav-dot:hover {
                    background: rgba(219, 39, 119, 0.5);
                }
                
                .nova-nav-dot-active {
                    background: rgb(219, 39, 119);
                    transform: scale(1.2);
                }
                
                /* Events Section */
                .nova-events-section {
                    padding: 5rem 0;
                    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(37, 24, 51, 0.98) 100%);
                    position: relative;
                }
                
                .nova-event-card {
                    background: rgba(15, 23, 42, 0.7);
                    border: 1px solid rgba(219, 39, 119, 0.3);
                    border-radius: 0.5rem;
                    padding: 1.5rem;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                
                .nova-event-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                                0 4px 6px -2px rgba(0, 0, 0, 0.05),
                                0 0 0 1px rgba(219, 39, 119, 0.2) inset,
                                0 0 30px rgba(219, 39, 119, 0.2);
                    border-color: rgba(219, 39, 119, 0.5);
                }
                
                .nova-event-date {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: rgb(219, 39, 119);
                    margin-bottom: 0.5rem;
                    display: inline-block;
                    background: rgba(219, 39, 119, 0.1);
                    padding: 0.25rem 0.75rem;
                    border-radius: 1rem;
                }
                
                .nova-event-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: rgba(226, 232, 240, 0.9);
                    margin-bottom: 0.75rem;
                }
                
                .nova-event-description {
                    font-size: 0.875rem;
                    color: rgba(226, 232, 240, 0.7);
                    line-height: 1.5;
                    margin-bottom: 1.5rem;
                    flex-grow: 1;
                }
                
                .nova-event-link {
                    display: inline-flex;
                    align-items: center;
                    color: rgb(219, 39, 119);
                    font-weight: 500;
                    font-size: 0.875rem;
                    transition: all 0.3s;
                    margin-top: auto;
                }
                
                .nova-event-link:hover {
                    color: rgb(236, 72, 153);
                    transform: translateX(5px);
                }
                
                .nova-event-link-icon {
                    width: 1rem;
                    height: 1rem;
                    margin-left: 0.375rem;
                    transition: transform 0.3s;
                }
                
                .nova-event-link:hover .nova-event-link-icon {
                    transform: translateX(2px);
                }
                
                /* CTA Section */
                .nova-cta-section {
                    position: relative;
                    padding: 5rem 0;
                    background: linear-gradient(90deg, rgba(219, 39, 119, 0.8) 0%, rgba(124, 58, 237, 0.9) 50%, rgba(219, 39, 119, 0.8) 100%);
                    color: rgb(226, 232, 240);
                    overflow: hidden;
                }
                
                .nova-circuit-pattern {
    position: absolute;
    inset: 0;
    opacity: 0.1;
    background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
        radial-gradient(circle at 50px 50px, rgba(255, 255, 255, 0.2) 2px, transparent 2px),
        radial-gradient(circle at 150px 150px, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
        radial-gradient(circle at 250px 250px, rgba(255, 255, 255, 0.2) 3px, transparent 3px);
    background-size: 100px 100px, 100px 100px, 200px 200px, 200px 200px, 300px 300px;
}

.nova-light-beam {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    filter: blur(30px);
    animation: light-beam 8s ease-in-out infinite alternate;
}

@keyframes light-beam {
    0% { 
        transform: translateX(-50%) rotate(-5deg); 
        opacity: 0.1;
    }
    50% { 
        transform: translateX(-30%) rotate(0deg); 
        opacity: 0.2;
    }
    100% { 
        transform: translateX(-50%) rotate(5deg); 
        opacity: 0.1;
    }
}

.nova-cta-content {
    position: relative;
    padding: 3rem;
    background: rgba(15, 23, 42, 0.7);
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    max-width: 800px;
    margin: 0 auto;
}

.nova-cta-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.nova-cta-text {
    font-size: 1.125rem;
    margin-bottom: 2rem;
    color: rgba(255, 255, 255, 0.9);
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.nova-cta-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 0.875rem 2rem;
    background: rgba(15, 23, 42, 0.9);
    color: rgb(255, 255, 255);
    font-weight: 500;
    border-radius: 0.375rem;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 
                0 4px 6px -4px rgba(0, 0, 0, 0.2);
    margin-bottom: 2rem;
}

.nova-cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 
                0 8px 10px -6px rgba(0, 0, 0, 0.3);
}

.nova-button-slide {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
}

.nova-cta-button:hover .nova-button-slide {
    left: 100%;
}

.nova-cta-features {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.5rem;
}

.nova-cta-feature {
    display: flex;
    align-items: center;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.875rem;
    background: rgba(15, 23, 42, 0.5);
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Corner decorations - used across multiple components */
.nova-corner {
    position: absolute;
    width: 8px;
    height: 8px;
    border: 1px solid rgba(219, 39, 119, 0.5);
    z-index: 5;
}

.nova-corner-tl {
    top: 0;
    left: 0;
    border-right: none;
    border-bottom: none;
}

.nova-corner-tr {
    top: 0;
    right: 0;
    border-left: none;
    border-bottom: none;
}

.nova-corner-bl {
    bottom: 0;
    left: 0;
    border-right: none;
    border-top: none;
}

.nova-corner-br {
    bottom: 0;
    right: 0;
    border-left: none;
    border-top: none;
}

.nova-scan-line {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(219, 39, 119, 0.7), transparent);
    opacity: 0.5;
    animation: scan-line 3s infinite linear;
}

@keyframes scan-line {
    0% { transform: translateY(0); }
    100% { transform: translateY(100%); }
}

/* Particles animations */
.nova-particles-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
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

/* Animation classes for scrolling effects */
.scroll-animate {
    opacity: 0;
    transition: all 0.7s cubic-bezier(0.33, 1, 0.68, 1);
}

.scroll-animate.animate-in {
    opacity: 1;
}

[data-animation="fade-up"] {
    transform: translateY(30px);
}

[data-animation="fade-up"].animate-in {
    transform: translateY(0);
}

[data-animation="fade-up-1"] {
    transform: translateY(30px);
    transition-delay: 0.1s;
}

[data-animation="fade-up-2"] {
    transform: translateY(30px);
    transition-delay: 0.2s;
}

[data-animation="fade-up-3"] {
    transform: translateY(30px);
    transition-delay: 0.3s;
}

[data-animation="fade-right"] {
    transform: translateX(-30px);
}

[data-animation="fade-right"].animate-in {
    transform: translateX(0);
}

[data-animation="fade-left"] {
    transform: translateX(30px);
}

[data-animation="fade-left"].animate-in {
    transform: translateX(0);
}

[data-animation="fade-left-slow"] {
    transform: translateX(30px);
    transition-delay: 0.2s;
}

[data-animation="fade-left-slow"].animate-in {
    transform: translateX(0);
}

[data-animation="fade-in-1"] {
    transition-delay: 0.1s;
}

[data-animation="fade-in-2"] {
    transition-delay: 0.2s;
}

[data-animation="fade-in-3"] {
    transition-delay: 0.3s;
}

[data-animation="fade-in-4"] {
    transition-delay: 0.4s;
}

/* Media queries for responsiveness */
@media (max-width: 768px) {
    .nova-hero-title {
        font-size: 2.5rem;
    }
    
    .nova-hero-buttons {
        flex-direction: column;
        align-items: stretch;
    }
    
    .nova-hero-buttons a {
        width: 100%;
        justify-content: center;
        margin-bottom: 0.75rem;
    }
    
    .nova-quick-stats {
        justify-content: space-around;
    }
    
    .nova-cta-content {
        padding: 1.5rem;
    }
    
    .nova-cta-title {
        font-size: 1.5rem;
    }
    
    .nova-pillar-title {
        font-size: 1.5rem;
    }
}

@media (max-width: 640px) {
    .nova-stat-panel {
        padding: 1rem;
    }
    
    .nova-stat-value {
        font-size: 1.5rem;
    }
    
    .nova-section-title {
        font-size: 1.5rem;
    }
    
    .nova-pillar-button {
        min-width: 120px;
        padding: 1rem;
    }
}
            `}</style>
        </div>
    );
}

export default Home;