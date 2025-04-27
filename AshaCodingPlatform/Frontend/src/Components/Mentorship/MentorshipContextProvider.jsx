import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

// Create context
const MentorshipContext = createContext();

// Custom hook to use the mentorship context
export const useMentorship = () => {
  const context = useContext(MentorshipContext);
  if (!context) {
    throw new Error('useMentorship must be used within a MentorshipProvider');
  }
  return context;
};

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Provider component
export const MentorshipProvider = ({ children }) => {
  // State for mentors, programs, and user data
  const [mentors, setMentors] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);
  const [bookedSessions, setBookedSessions] = useState([]);
  const [savedMentors, setSavedMentors] = useState([]);
  const [savedPrograms, setSavedPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get(`${API_URL}/auth/check`, { withCredentials: true });
          setIsAuthenticated(response.data.authenticated);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log('User not authenticated');
        setIsAuthenticated(true);
      }
    };
    
    checkAuth();
  }, []);
  
  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch mentors
        const mentorsResponse = await axios.get(`${API_URL}/mentorship/mentors`);
        setMentors(mentorsResponse.data.mentors);
        
        // Fetch programs
        const programsResponse = await axios.get(`${API_URL}/mentorship/programs`);
        setPrograms(programsResponse.data.programs);
        
        // Fetch categories
        const categoriesResponse = await axios.get(`${API_URL}/mentorship/categories`);
        setCategories(categoriesResponse.data.categories);
        
        // If authenticated, fetch user-specific data
        if (isAuthenticated) {
          // Fetch enrolled programs
          const enrolledResponse = await axios.get(`${API_URL}/mentorship/enrollments`);
          setEnrolledPrograms(enrolledResponse.data.enrollments);
          
          // Fetch booked sessions
          const sessionsResponse = await axios.get(`${API_URL}/mentorship/sessions`);
          setBookedSessions(sessionsResponse.data.sessions);
          
          // Fetch saved mentors
          const savedMentorsResponse = await axios.get(`${API_URL}/mentorship/saved`);
          setSavedMentors(savedMentorsResponse.data.savedMentors.map(item => item.mentorId._id));
        }
        
        // Get saved items from localStorage as fallback
        else {
          const savedMentorsData = localStorage.getItem('savedMentors');
          if (savedMentorsData) {
            setSavedMentors(JSON.parse(savedMentorsData));
          }
          
          const savedProgramsData = localStorage.getItem('savedPrograms');
          if (savedProgramsData) {
            setSavedPrograms(JSON.parse(savedProgramsData));
          }
        }
        
      } catch (err) {
        console.error('Error fetching mentorship data:', err);
        setError('Failed to load mentorship data. Please try again later.');
        toast.error('Failed to load mentorship data');
        
        // Load fallback data if we can't connect to the server
        await loadFallbackData();
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated]);

  // Fallback data loading in case the API is not available
  const loadFallbackData = async () => {
    try {
      // Try to load from a static JSON file hosted somewhere
      const fallbackResponse = await fetch('https://res.cloudinary.com/dyfmlusbc/raw/upload/v1745566011/topmate_iba3d0.json');
      const topmateData = await fallbackResponse.json();
      
      // Format the data for our needs
      const formattedMentors = formatTopmateDataForMentorship(topmateData);
      setMentors(formattedMentors);
      
      // Create categories from the data
      const categoryMap = {};
      formattedMentors.forEach(mentor => {
        if (!categoryMap[mentor.category]) {
          categoryMap[mentor.category] = {
            name: mentor.category.charAt(0).toUpperCase() + mentor.category.slice(1).replace('_', ' '),
            subcategories: []
          };
        }
        
        mentor.subcategories.forEach(sub => {
          if (!categoryMap[mentor.category].subcategories.includes(sub)) {
            categoryMap[mentor.category].subcategories.push(sub);
          }
        });
      });
      
      setCategories(Object.values(categoryMap));
      
      // Create mock programs
      setPrograms(createMockPrograms(formattedMentors));
      
    } catch (error) {
      console.error("Error loading fallback data:", error);
      // As a last resort, use hard-coded data
      setMentors(fetchMockMentorDataFallback());
      setCategories([
        {
          name: 'Data',
          subcategories: ['Data Science', 'AI/ML', 'Data Engineering']
        },
        {
          name: 'Software',
          subcategories: ['Frontend', 'Backend', 'Mobile']
        }
      ]);
    }
  };

  function formatTopmateDataForMentorship(topmateData) {
    let mentorId = 1;
    const mentors = [];
    
    topmateData.categories.forEach(category => {
      const categorySlug = category.name.toLowerCase().replace(/\s+/g, '_');
      
      category.subcategories.forEach(subcategory => {
        if (subcategory.mentors && subcategory.mentors.length > 0) {
          subcategory.mentors.forEach(mentor => {
            mentors.push({
              id: mentorId++,
              _id: `mock_${mentorId}`, // Add _id field for MongoDB compatibility
              name: mentor.name,
              title: mentor.title,
              rating: mentor.rating !== null ? mentor.rating.toString() : "N/A",
              bookings: mentor.bookings || "0+",
              callInfo: mentor.callInfo || "1:1 Call",
              priorityDM: mentor.priorityDM || false,
              isNew: mentor.isNew || false,
              imageUrl: mentor.imageUrl,
              category: categorySlug,
              subcategories: [subcategory.name]
            });
          });
        }
      });
    });
    
    return mentors;
  }

  // Create mock programs from mentor data
  const createMockPrograms = (mentors) => {
    const programs = [];
    const categories = [...new Set(mentors.map(m => m.category))];
    
    // Create 2 programs per category
    categories.forEach((category, index) => {
      const categoryMentors = mentors.filter(m => m.category === category);
      
      if (categoryMentors.length >= 2) {
        // Create 2 programs for this category if we have at least 2 mentors
        for (let i = 0; i < 2; i++) {
          const mentor = categoryMentors[i];
          const programId = index * 2 + i + 1;
          
          programs.push({
            id: programId,
            _id: `mock_program_${programId}`,
            title: `${mentor.subcategories[0]} Mastery Program`,
            mentorId: {
              _id: mentor._id,
              name: mentor.name,
              imageUrl: mentor.imageUrl,
              rating: mentor.rating
            },
            description: `A comprehensive program to master ${mentor.subcategories[0]} skills with expert guidance.`,
            category: category,
            format: `${4 + i * 4}-week program`,
            startDate: new Date(Date.now() + (7 + i * 14) * 24 * 60 * 60 * 1000),
            duration: `${4 + i * 4} weeks`,
            industry: mentor.subcategories[0],
            image: `https://picsum.photos/seed/${category}${i}/400/200`,
            requiredSkills: ["Basic programming", "Problem-solving skills"],
            applicationUrl: "#"
          });
        }
      }
    });
    
    return programs;
  };

  const fetchMockMentorDataFallback = () => {
    return [
      {
        id: 1,
        _id: "mock_1",
        name: "Rahul Singh",
        title: "Senior Software Engineer at Amazon",
        rating: "5.0",
        bookings: "71+",
        callInfo: "1:1 Call",
        priorityDM: true,
        category: "data",
        subcategories: ["Data Science", "AI/ML"]
      },
      {
        id: 2,
        _id: "mock_2",
        name: "Priya Sharma",
        title: "Engineering Manager at Microsoft",
        rating: "4.9",
        bookings: "56+",
        callInfo: "1:1 Call",
        priorityDM: true,
        category: "software",
        subcategories: ["Backend Development", "System Design"]
      },
      {
        id: 3,
        _id: "mock_3",
        name: "Aakash Patel",
        title: "Machine Learning Engineer at Google",
        rating: "4.8",
        bookings: "42+",
        callInfo: "1:1 Call",
        priorityDM: false,
        category: "data",
        subcategories: ["AI/ML", "Deep Learning"]
      }
    ];
  };
  
  // Save a mentor to favorites
  const saveMentor = async (mentorId) => {
    try {
      // Check if already saved
      if (savedMentors.includes(mentorId)) {
        toast.error('This mentor is already saved to your favorites');
        return;
      }
      
      // If user is authenticated, save to backend
      if (isAuthenticated) {
        await axios.post(`${API_URL}/mentorship/saved/add`, { mentorId });
      }
      
      const newSavedMentors = [...savedMentors, mentorId];
      setSavedMentors(newSavedMentors);
      
      // Save to localStorage as fallback
      localStorage.setItem('savedMentors', JSON.stringify(newSavedMentors));
      toast.success('Mentor saved to your favorites');
    } catch (error) {
      console.error('Error saving mentor:', error);
      toast.error('Failed to save mentor');
    }
  };
  
  // Remove a mentor from favorites
  const removeSavedMentor = async (mentorId) => {
    try {
      // If user is authenticated, remove from backend
      if (isAuthenticated) {
        await axios.delete(`${API_URL}/mentorship/saved/${mentorId}`);
      }
      
      const newSavedMentors = savedMentors.filter(id => id !== mentorId);
      setSavedMentors(newSavedMentors);
      
      // Save to localStorage as fallback
      localStorage.setItem('savedMentors', JSON.stringify(newSavedMentors));
      toast.success('Mentor removed from your favorites');
    } catch (error) {
      console.error('Error removing mentor:', error);
      toast.error('Failed to remove mentor');
    }
  };
  
  // Book a session with a mentor
  const bookMentorSession = async (mentorId, date, topic) => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        toast.error('Please login to book a session');
        // Redirect to login page
        window.location.href = '/login';
        return null;
      }
      
      setLoading(true);
      
      // Call the backend API
      const response = await axios.post(`${API_URL}/mentorship/sessions/book`, {
        mentorId,
        sessionDateTime: date,
        topic,
        duration: 60 // Default duration of 60 minutes
      });
      
      // Get the session data from the response
      const newSession = response.data.session;
      
      // Add to booked sessions
      setBookedSessions([...bookedSessions, newSession]);
      
      toast.success(`Session booked with ${mentors.find(m => m._id === mentorId)?.name || 'Mentor'}`);
      return newSession;
    } catch (err) {
      console.error('Error booking session:', err);
      toast.error(err.response?.data?.message || 'Failed to book session. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Apply to a program
  const applyToProgram = async (programId) => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        toast.error('Please login to apply to a program');
        // Redirect to login page
        window.location.href = '/login';
        return null;
      }
      
      setLoading(true);
      
      // Call the backend API
      const response = await axios.post(`${API_URL}/mentorship/programs/enroll`, {
        programId
      });
      
      // Find the program
      const program = programs.find(p => p._id === programId);
      
      toast.success(`Successfully enrolled in ${program?.title || 'program'}`);
      
      // Reload enrollments
      const enrollmentsResponse = await axios.get(`${API_URL}/mentorship/enrollments`);
      setEnrolledPrograms(enrollmentsResponse.data.enrollments);
      
      return program;
    } catch (err) {
      console.error('Error applying to program:', err);
      toast.error(err.response?.data?.message || 'Failed to apply to program. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'Soon';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format date with time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not scheduled';
    
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Check if a mentor is saved
  const isMentorSaved = (mentorId) => {
    return savedMentors.includes(mentorId);
  };
  
  // Check if a program is saved
  const isProgramSaved = (programId) => {
    return savedPrograms.includes(programId);
  };
  
  // Save a program to favorites
  const saveProgram = async (programId) => {
    try {
      // Check if already saved
      if (savedPrograms.includes(programId)) {
        toast.error('This program is already saved to your favorites');
        return;
      }
      
      // If user is authenticated, save to backend
      if (isAuthenticated) {
        // This endpoint would need to be implemented on the backend
        // await axios.post(`${API_URL}/mentorship/programs/save`, { programId });
      }
      
      const newSavedPrograms = [...savedPrograms, programId];
      setSavedPrograms(newSavedPrograms);
      
      // Save to localStorage as fallback
      localStorage.setItem('savedPrograms', JSON.stringify(newSavedPrograms));
      toast.success('Program saved to your favorites');
    } catch (error) {
      console.error('Error saving program:', error);
      toast.error('Failed to save program');
    }
  };
  
  // Remove a program from favorites
  const removeSavedProgram = async (programId) => {
    try {
      // If user is authenticated, remove from backend
      if (isAuthenticated) {
        // This endpoint would need to be implemented on the backend
        // await axios.delete(`${API_URL}/mentorship/programs/saved/${programId}`);
      }
      
      const newSavedPrograms = savedPrograms.filter(id => id !== programId);
      setSavedPrograms(newSavedPrograms);
      
      // Save to localStorage as fallback
      localStorage.setItem('savedPrograms', JSON.stringify(newSavedPrograms));
      toast.success('Program removed from your favorites');
    } catch (error) {
      console.error('Error removing program:', error);
      toast.error('Failed to remove program');
    }
  };
  
  // Get all categories
  const getCategories = () => {
    return categories;
  };
  
  // Provide the context value
  const contextValue = {
    mentors,
    programs,
    enrolledPrograms,
    bookedSessions,
    savedMentors,
    savedPrograms,
    loading,
    error,
    isAuthenticated,
    saveMentor,
    saveProgram,
    removeSavedMentor,
    removeSavedProgram,
    bookMentorSession,
    applyToProgram,
    getCategories,
    formatDate,
    formatDateTime,
    isMentorSaved,
    isProgramSaved
  };
  
  return (
    <MentorshipContext.Provider value={contextValue}>
      {children}
    </MentorshipContext.Provider>
  );
};

export default MentorshipProvider;