// backend/src/controllers/mentorship.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { Mentor } from '../models/mentor.model.js';
import { MentorshipSession } from '../models/mentorship-session.model.js';
import { SavedMentor } from '../models/saved-mentor.model.js';
import { MentorshipProgram } from '../models/mentorship-program.model.js';
import { ProgramEnrollment } from '../models/program-enrollment.model.js';
import mongoose from 'mongoose';

/**
 * @route   GET /api/v1/mentorship/mentors
 * @desc    Get all mentors with optional filtering
 * @access  Public
 */
export const getMentors = asyncHandler(async (req, res) => {
  const { 
    search, 
    category, 
    subcategory,
    sort = 'rating',
    page = 1,
    limit = 20
  } = req.query;
  
  try {
    // Build query
    let query = {};
    
    // Apply filters if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    if (category) {
      query.category = category.toLowerCase();
    }
    
    if (subcategory) {
      query.subcategories = { $in: [subcategory] };
    }
    
    query.isActive = true;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Determine sort order
    let sortOption = {};
    switch (sort) {
      case 'rating':
        sortOption = { rating: -1 };
        break;
      case 'bookings':
        sortOption = { bookings: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { rating: -1 };
    }
    
    // Execute query with pagination
    const mentors = await Mentor.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get total count for pagination
    const total = await Mentor.countDocuments(query);
    
    return res.status(200).json({
      success: true,
      mentors,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch mentors"
    });
  }
});

/**
 * @route   GET /api/v1/mentorship/mentors/:id
 * @desc    Get mentor details by ID
 * @access  Public
 */
export const getMentorById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log("MENTOR ID DISPLAY")
  console.log(id)
  
  try {
    const mentor = await Mentor.findById(id).lean();
    
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      mentor
    });
  } catch (error) {
    console.error("Error fetching mentor details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch mentor details"
    });
  }
});

/**
 * @route   POST /api/v1/mentorship/sessions/book
 * @desc    Book a mentorship session
 * @access  Private
 */
export const bookSession = asyncHandler(async (req, res) => {
  const { mentorId, sessionDateTime, topic, duration = 60 } = req.body;
  const userId = req.user._id;
  console.log("MENTOR ID DISPLAYING BOOKING FN")
  console.log(mentorId)
  try {
    // Check if mentor exists
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found"
      });
    }
    
    // Parse the sessionDateTime
    const sessionDate = new Date(sessionDateTime);
    
    // Check if the session date is in the future
    if (sessionDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Session date must be in the future"
      });
    }
    
    // Create a new session
    const session = new MentorshipSession({
      mentorId,
      userId,
      sessionDateTime: sessionDate,
      duration,
      topic,
      status: 'scheduled'
    });
    
    // Save the session
    await session.save();
    
    // Increment the bookings count for the mentor
    await Mentor.findByIdAndUpdate(mentorId, { $inc: { bookings: 1 } });
    
    return res.status(201).json({
      success: true,
      message: "Session booked successfully",
      session
    });
  } catch (error) {
    console.error("Error booking session:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to book session"
    });
  }
});

/**
 * @route   GET /api/v1/mentorship/sessions
 * @desc    Get user's booked sessions
 * @access  Private
 */
export const getUserSessions = asyncHandler(async (req, res) => {

  console.log("I HAVE HOT getUserSessions")
  

  const currentUser = {
    id: '507f1f77bcf86cd799439011', // Valid ObjectId format
    _id: '507f1f77bcf86cd799439011',
    name: 'Demo User',
    email: 'demo@example.com'
  };


  const userId = currentUser._id;
  
  try {
    const sessions = await MentorshipSession.find({ userId })
      .populate('mentorId', 'name title imageUrl')
      .sort({ sessionDateTime: 1 })
      .lean();
    
    return res.status(200).json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error("Error fetching user sessions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sessions"
    });
  }
});

/**
 * @route   GET /api/v1/mentorship/sessions/:id
 * @desc    Get session details
 * @access  Private
 */
export const getSessionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUser = {
    id: '507f1f77bcf86cd799439011', // Valid ObjectId format
    _id: '507f1f77bcf86cd799439011',
    name: 'Demo User',
    email: 'demo@example.com'
  };


  const userId = currentUser._id;
  
  try {
    const session = await MentorshipSession.findOne({ 
      _id: id,
      userId
    })
    .populate('mentorId', 'name title imageUrl rating callInfo')
    .lean();
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    console.error("Error fetching session details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch session details"
    });
  }
});

/**
 * @route   PUT /api/v1/mentorship/sessions/:id
 * @desc    Update session (cancel, reschedule)
 * @access  Private
 */
export const updateSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, sessionDateTime, topic, notes } = req.body;
  const currentUser = {
    id: '507f1f77bcf86cd799439011', // Valid ObjectId format
    _id: '507f1f77bcf86cd799439011',
    name: 'Demo User',
    email: 'demo@example.com'
  };


  const userId = currentUser._id;
  
  try {
    // Find the session
    const session = await MentorshipSession.findOne({ _id: id, userId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }
    
    // Check if the session is already completed or cancelled
    if (session.status === 'completed' || session.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot update a ${session.status} session`
      });
    }
    
    // Update fields
    if (status) session.status = status;
    if (sessionDateTime) session.sessionDateTime = new Date(sessionDateTime);
    if (topic) session.topic = topic;
    if (notes) session.notes = notes;
    
    // Save the updated session
    await session.save();
    
    // If the session was cancelled, decrement the mentor's booking count
    if (status === 'cancelled' && session.status !== 'cancelled') {
      await Mentor.findByIdAndUpdate(session.mentorId, { $inc: { bookings: -1 } });
    }
    
    return res.status(200).json({
      success: true,
      message: "Session updated successfully",
      session
    });
  } catch (error) {
    console.error("Error updating session:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update session"
    });
  }
});

/**
 * @route   POST /api/v1/mentorship/saved/add
 * @desc    Save a mentor to favorites
 * @access  Private
 */
export const saveMentor = asyncHandler(async (req, res) => {
  const { mentorId, notes = "" } = req.body;
  const currentUser = {
    id: '507f1f77bcf86cd799439011', // Valid ObjectId format
    _id: '507f1f77bcf86cd799439011',
    name: 'Demo User',
    email: 'demo@example.com'
  };


  const userId = currentUser._id;
  
  try {
    // Check if mentor exists
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found"
      });
    }
    
    // Check if already saved
    const existingSaved = await SavedMentor.findOne({ userId, mentorId });
    if (existingSaved) {
      return res.status(400).json({
        success: false,
        message: "Mentor already saved"
      });
    }
    
    // Create new saved mentor entry
    const savedMentor = new SavedMentor({
      userId,
      mentorId,
      notes
    });
    
    // Save to database
    await savedMentor.save();
    
    return res.status(201).json({
      success: true,
      message: "Mentor saved successfully",
      savedMentor
    });
  } catch (error) {
    console.error("Error saving mentor:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save mentor"
    });
  }
});

/**
 * @route   GET /api/v1/mentorship/saved
 * @desc    Get user's saved mentors
 * @access  Private
 */
export const getSavedMentors = asyncHandler(async (req, res) => {
  const currentUser = {
    id: '507f1f77bcf86cd799439011', // Valid ObjectId format
    _id: '507f1f77bcf86cd799439011',
    name: 'Demo User',
    email: 'demo@example.com'
  };


  const userId = currentUser._id;
  
  try {
    const savedMentors = await SavedMentor.find({ userId })
      .populate('mentorId')
      .sort({ createdAt: -1 })
      .lean();
    
    return res.status(200).json({
      success: true,
      savedMentors
    });
  } catch (error) {
    console.error("Error fetching saved mentors:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch saved mentors"
    });
  }
});

/**
 * @route   DELETE /api/v1/mentorship/saved/:mentorId
 * @desc    Remove a mentor from saved list
 * @access  Private
 */
export const removeSavedMentor = asyncHandler(async (req, res) => {
  const { mentorId } = req.params;
  const currentUser = {
    id: '507f1f77bcf86cd799439011', // Valid ObjectId format
    _id: '507f1f77bcf86cd799439011',
    name: 'Demo User',
    email: 'demo@example.com'
  };


  const userId = currentUser._id;
  
  try {
    const result = await SavedMentor.findOneAndDelete({ userId, mentorId });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Saved mentor not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Mentor removed from saved list"
    });
  } catch (error) {
    console.error("Error removing saved mentor:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove saved mentor"
    });
  }
});

/**
 * @route   GET /api/v1/mentorship/programs
 * @desc    Get all mentorship programs with optional filtering
 * @access  Public
 */
export const getPrograms = asyncHandler(async (req, res) => {
  const { 
    search, 
    category,
    industry,
    page = 1,
    limit = 10
  } = req.query;
  
  try {
    // Build query
    let query = { isActive: true };
    
    // Apply filters if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    if (category) {
      query.category = category.toLowerCase();
    }
    
    if (industry) {
      query.industry = industry;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const programs = await MentorshipProgram.find(query)
      .populate('mentorId', 'name title imageUrl rating')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get total count for pagination
    const total = await MentorshipProgram.countDocuments(query);
    
    return res.status(200).json({
      success: true,
      programs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching programs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch programs"
    });
  }
});

/**
 * @route   POST /api/v1/mentorship/programs/enroll
 * @desc    Enroll in a mentorship program
 * @access  Private
 */
export const enrollInProgram = asyncHandler(async (req, res) => {
  const { programId } = req.body;
  const userId = req.user._id;
  
  try {
    // Check if program exists
    const program = await MentorshipProgram.findById(programId);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found"
      });
    }
    
    // Check if user is already enrolled
    const existingEnrollment = await ProgramEnrollment.findOne({ userId, programId });
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this program"
      });
    }
    
    // Check if program is full
    if (program.currentParticipants >= program.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: "Program is full"
      });
    }
    
    // Create new enrollment
    const enrollment = new ProgramEnrollment({
      programId,
      userId,
      status: 'active',
      progress: 0,
      nextSession: program.startDate,
      assignments: {
        completed: 0,
        total: program.syllabus?.length || 0
      }
    });
    
    // Save enrollment
    await enrollment.save();
    
    // Increment current participants
    await MentorshipProgram.findByIdAndUpdate(programId, { $inc: { currentParticipants: 1 } });
    
    return res.status(201).json({
      success: true,
      message: "Enrolled in program successfully",
      enrollment
    });
  } catch (error) {
    console.error("Error enrolling in program:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to enroll in program"
    });
  }
});

/**
 * @route   GET /api/v1/mentorship/enrollments
 * @desc    Get user's program enrollments
 * @access  Private
 */
export const getUserEnrollments = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  try {
    const enrollments = await ProgramEnrollment.find({ userId })
      .populate({
        path: 'programId',
        populate: {
          path: 'mentorId',
          select: 'name imageUrl'
        }
      })
      .sort({ createdAt: -1 })
      .lean();
    
    return res.status(200).json({
      success: true,
      enrollments
    });
  } catch (error) {
    console.error("Error fetching user enrollments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch enrollments"
    });
  }
});

/**
 * @route   GET /api/v1/mentorship/categories
 * @desc    Get all categories and subcategories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
  try {
    // Aggregate to get all unique categories and their subcategories
    const categories = await Mentor.aggregate([
      { $match: { isActive: true } },
      { 
        $group: {
          _id: "$category",
          subcategories: { $addToSet: "$subcategories" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Process the results to flatten the subcategories arrays
    const processedCategories = categories.map(category => {
      // Flatten the array of arrays for subcategories
      const flattenedSubcategories = category.subcategories
        .flat()
        .filter(Boolean); // Remove any null/empty values
      
      // Remove duplicates
      const uniqueSubcategories = [...new Set(flattenedSubcategories)];
      
      return {
        name: category._id,
        subcategories: uniqueSubcategories.sort()
      };
    });
    
    return res.status(200).json({
      success: true,
      categories: processedCategories
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories"
    });
  }
});


export const getMentorSessions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    // Find all sessions for this mentor
    const sessions = await MentorshipSession.find({ mentorId: id })
      .populate('userId', 'name email imageUrl')
      .sort({ sessionDateTime: 1 })
      .lean();
    
    return res.status(200).json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error("Error fetching mentor sessions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch mentor sessions"
    });
  }
});



export const getSessionDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    // Find the session
    const session = await MentorshipSession.findById(id)
      .populate('mentorId', 'name title imageUrl rating callInfo')
      .populate('userId', 'name email imageUrl')
      .lean();
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }
    
    // For demo/testing purposes, add mentor user ID to ensure consistency
    const sessionWithMentorUserId = {
      ...session,
      mentorId: {
        ...session.mentorId,
        userId: '507f1f77bcf86cd799439011' // Add userId to mentorId object
      }
    };
    
    return res.status(200).json({
      success: true,
      session: sessionWithMentorUserId
    });
  } catch (error) {
    console.error("Error fetching session details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch session details"
    });
  }
});