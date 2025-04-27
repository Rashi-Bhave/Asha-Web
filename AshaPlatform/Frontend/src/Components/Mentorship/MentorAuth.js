
// MentorAuth.js - Utilities for mentor authentication and data

// Dummy mentor user for testing
export const DUMMY_MENTOR = {
  _id: "680b677731a8d253d825a34e",
  username: "sarahdev",
  fullname: "Sarah Johnson",
  email: "sarah@example.com",
  title: "Senior Software Engineer at Google",
  imageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
  bio: "Experienced full-stack developer specializing in React, Node.js, and cloud architecture. I've been mentoring junior developers for over 5 years and love helping others grow in their careers.",
  skills: ["React", "Node.js", "AWS", "System Design", "Career Development"],
  isMentor: true
};

// Check if the user is a mentor
export const isMentor = (user) => {
  return user?.isMentor === true;
};

// Get current user (returns dummy mentor for demo)
export const getCurrentMentor = () => {
  // In a real app, this would check localStorage or a context
  // For demo purposes, just return our dummy mentor
  return DUMMY_MENTOR;
};

// Mock upcoming mentorship sessions for the mentor
export const getMockMentorSessions = () => {
  const now = new Date();
  
  // Create dates for upcoming sessions
  const inTenMinutes = new Date(now.getTime() + 10 * 60000);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);
  
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(11, 30, 0, 0);
  
  // Past session
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  lastWeek.setHours(10, 0, 0, 0);
  
  return [
    {
      _id: "session1",
      mentorId: {
        _id: DUMMY_MENTOR._id,
        name: DUMMY_MENTOR.fullname,
        title: DUMMY_MENTOR.title,
        imageUrl: DUMMY_MENTOR.imageUrl,
        userId: DUMMY_MENTOR._id
      },
      userId: "user123",
      menteeInfo: {
        _id: "user123",
        name: "Alex Rivera",
        title: "Junior Developer",
        imageUrl: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      sessionDateTime: inTenMinutes.toISOString(),
      duration: 60,
      topic: "Career Transition to Full-Stack Development",
      status: 'scheduled',
      notes: "Alex wants to discuss transitioning from front-end to full-stack role",
      preparationComplete: true
    },
    {
      _id: "session2",
      mentorId: {
        _id: DUMMY_MENTOR._id,
        name: DUMMY_MENTOR.fullname,
        title: DUMMY_MENTOR.title,
        imageUrl: DUMMY_MENTOR.imageUrl,
        userId: DUMMY_MENTOR._id
      },
      userId: "user456",
      menteeInfo: {
        _id: "user456",
        name: "Jamie Chen",
        title: "CS Student",
        imageUrl: "https://randomuser.me/api/portraits/women/56.jpg"
      },
      sessionDateTime: tomorrow.toISOString(),
      duration: 45,
      topic: "Interview Preparation for Tech Roles",
      status: 'scheduled',
      notes: "Resume review and mock interview",
      preparationComplete: false
    },
    {
      _id: "session3",
      mentorId: {
        _id: DUMMY_MENTOR._id,
        name: DUMMY_MENTOR.fullname,
        title: DUMMY_MENTOR.title,
        imageUrl: DUMMY_MENTOR.imageUrl,
        userId: DUMMY_MENTOR._id
      },
      userId: "user789",
      menteeInfo: {
        _id: "user789",
        name: "Taylor Smith", 
        title: "Mid-level Engineer",
        imageUrl: "https://randomuser.me/api/portraits/men/87.jpg"
      },
      sessionDateTime: nextWeek.toISOString(),
      duration: 60,
      topic: "System Design Deep Dive",
      status: 'scheduled',
      notes: "Focus on scalable architecture patterns",
      preparationComplete: false
    },
    {
      _id: "session4",
      mentorId: {
        _id: DUMMY_MENTOR._id,
        name: DUMMY_MENTOR.fullname,
        title: DUMMY_MENTOR.title,
        imageUrl: DUMMY_MENTOR.imageUrl,
        userId: DUMMY_MENTOR._id
      },
      userId: "user321",
      menteeInfo: {
        _id: "user321",
        name: "Morgan Lee",
        title: "Frontend Developer",
        imageUrl: "https://randomuser.me/api/portraits/women/22.jpg"
      },
      sessionDateTime: lastWeek.toISOString(),
      duration: 60,
      topic: "React Performance Optimization",
      status: 'completed',
      notes: "Covered useCallback, useMemo, React.memo and code splitting",
      feedback: {
        rating: 5,
        comment: "Sarah was incredibly helpful! I learned so much about optimizing my React applications."
      }
    }
  ];
};