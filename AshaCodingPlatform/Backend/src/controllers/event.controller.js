// Backend/src/controllers/event.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { Event } from '../models/event.model.js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import chromaDBService from '../services/chromaDB.service.js';

// Perplexity API configuration (similar to what's used in other controllers)
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

/**
 * @route   GET /api/v1/events
 * @desc    Get events with search and filters
 * @access  Public
 */
export const getEvents = asyncHandler(async (req, res) => {
  try {
    // Extract query parameters
    const {
      search,
      location,
      category,
      forWomen,
      virtual,
      sort,
      page = 1,
      limit = 10
    } = req.query;

    // Initialize pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let events = [];
    let total = 0;
    let semanticSearch = false;

    // Check if we have a search query that should use semantic search
    if (search && search.trim().length > 2) {
      try {
        // Try a heartbeat to check if ChromaDB is available
        const heartbeat = await chromaDBService.getHeartbeat();
        
        if (heartbeat) {
          // Attempt semantic search via ChromaDB
          const filters = {
            location: location,
            category: category && category !== 'all' ? category : undefined,
            forWomen: forWomen === 'true',
            virtual: virtual === 'true'
          };
  
          const chromaResults = await chromaDBService.searchEventsBySimilarity(search, filters, parseInt(limit) * 2);
          
          if (chromaResults && chromaResults.length > 0) {
            semanticSearch = true;
            console.log(`Found ${chromaResults.length} results via semantic search`);
            
            // Get the IDs of events from ChromaDB results
            const chromaIds = chromaResults.map(result => result.id);
            
            // IMPORTANT FIX: Fetch by chromaId field, NOT by _id
            const semanticEvents = await Event.find({ chromaId: { $in: chromaIds } });
            
            if (semanticEvents.length > 0) {
              // Sort by the same order as ChromaDB results
              events = chromaIds.map(id => 
                semanticEvents.find(event => event.chromaId === id)
              ).filter(Boolean);
              
              // Apply standard sorting if needed
              if (sort === 'date') {
                events.sort((a, b) => new Date(a.date) - new Date(b.date));
              } else if (sort === 'popularity') {
                events.sort((a, b) => b.registrationCount - a.registrationCount);
              }
              
              // Paginate results
              total = events.length;
              events = events.slice(skip, skip + parseInt(limit));
            } else {
              semanticSearch = false;
              console.log('No matching events found in MongoDB with the chromaIds from ChromaDB');
            }
          }
        } else {
          console.log('ChromaDB not available, falling back to standard search');
        }
      } catch (error) {
        console.error('Error in semantic search, falling back to standard search:', error);
        semanticSearch = false;
      }
    }

    // If semantic search didn't work or wasn't used, fall back to standard MongoDB search
    if (!semanticSearch) {
      // Build MongoDB query
      const query = {};
      
      // Improved search approach to avoid MongoDB text search issues
      if (search) {
        // Use simple regex search instead of text + regex in OR
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ];
        
        // Only add text search if explicitly indexed fields are being searched
        // const textSearchQuery = { $text: { $search: search } };
        // query.$or.push(textSearchQuery);
      }

      // Location filter
      if (location) {
        query.location = { $regex: location, $options: 'i' };
      }

      // Category filter
      if (category && category !== 'all') {
        query.category = category;
      }

      // For women filter
      if (forWomen === 'true') {
        query.forWomen = true;
      }

      // Virtual filter
      if (virtual === 'true') {
        query.virtual = true;
      }

      // Determine sort order
      let sortOption = {};
      switch (sort) {
        case 'date':
          sortOption = { date: 1 }; // Ascending by date (upcoming first)
          break;
        case 'popularity': 
          sortOption = { registrationCount: -1, date: 1 };
          break;
        default:
          sortOption = { date: 1 }; // Default to date
      }

      // Execute query with pagination
      events = await Event.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count for pagination
      total = await Event.countDocuments(query);
    }

    // If no events found with either method, try fetching from Perplexity API
    if (events.length === 0 && PERPLEXITY_API_KEY) {
      const externalEvents = await fetchEventsFromPerplexity(search, location, category, forWomen === 'true');
      
      if (externalEvents.length > 0) {
        // Save events to database for future use
        const savedEvents = await Event.insertMany(externalEvents);
        
        // Also add these events to ChromaDB for future semantic search
        try {
          // Try a heartbeat to check if ChromaDB is available
          const heartbeat = await chromaDBService.getHeartbeat();
          
          if (heartbeat) {
            await chromaDBService.ingestEventsToChromaDB(savedEvents);
            console.log('Added Perplexity events to ChromaDB');
          }
        } catch (chromaError) {
          console.error('Error adding Perplexity events to ChromaDB:', chromaError);
          // Continue anyway, this is not a critical failure
        }
        
        return res.status(200).json({
          success: true,
          events: savedEvents,
          source: 'external',
          pagination: {
            total: savedEvents.length,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(savedEvents.length / parseInt(limit))
          }
        });
      }
    }

    // Return events
    return res.status(200).json({
      success: true,
      events,
      semanticSearch,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/v1/events/:id
 * @desc    Get event by ID
 * @access  Public
 */
export const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Increment view count
    event.viewCount += 1;
    await event.save();

    return res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/v1/events/save/:id
 * @desc    Save an event
 * @access  Private
 */
export const saveEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if already saved
    if (event.savedBy.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Event already saved'
      });
    }

    // Add user to savedBy array
    event.savedBy.push(userId);
    await event.save();

    return res.status(200).json({
      success: true,
      message: 'Event saved successfully'
    });
  } catch (error) {
    console.error('Error saving event:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save event',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/v1/events/save/:id
 * @desc    Unsave an event
 * @access  Private
 */
export const unsaveEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is saved
    if (!event.savedBy.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Event not saved'
      });
    }

    // Remove user from savedBy array
    event.savedBy = event.savedBy.filter(id => id.toString() !== userId.toString());
    await event.save();

    return res.status(200).json({
      success: true,
      message: 'Event unsaved successfully'
    });
  } catch (error) {
    console.error('Error unsaving event:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unsave event',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/v1/events/register/:id
 * @desc    Register for an event
 * @access  Private
 */
export const registerForEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if already registered
    const alreadyRegistered = event.attendees.some(
      attendee => attendee.userId.toString() === userId.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this event'
      });
    }

    // Add user to attendees array
    event.attendees.push({
      userId,
      status: 'Registered',
      registeredDate: new Date()
    });

    // Increment registration count
    event.registrationCount += 1;
    
    await event.save();

    return res.status(200).json({
      success: true,
      message: 'Event registration successful'
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register for event',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/v1/events/user/registered
 * @desc    Get user's registered events
 * @access  Private
 */
export const getRegisteredEvents = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const registeredEvents = await Event.find({
      'attendees.userId': userId
    });

    return res.status(200).json({
      success: true,
      events: registeredEvents
    });
  } catch (error) {
    console.error('Error fetching registered events:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch registered events',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/v1/events/user/saved
 * @desc    Get user's saved events
 * @access  Private
 */
export const getSavedEvents = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const savedEvents = await Event.find({
      savedBy: userId
    });

    return res.status(200).json({
      success: true,
      events: savedEvents
    });
  } catch (error) {
    console.error('Error fetching saved events:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch saved events',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/v1/events
 * @desc    Create a new event
 * @access  Private (Admin)
 */
export const createEvent = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      location,
      virtual,
      category,
      image,
      registrationUrl,
      price,
      speakers,
      organizer,
      forWomen
    } = req.body;

    const newEvent = new Event({
      title,
      description,
      date,
      location,
      virtual: virtual || false,
      category,
      image,
      registrationUrl,
      price: price || 'Free',
      speakers: speakers || [],
      organizer,
      forWomen: forWomen || false
    });

    // Save to MongoDB
    const savedEvent = await newEvent.save();

    // Add to ChromaDB for semantic search
    try {
      await chromaDBService.addEventToChromaDB(savedEvent);
    } catch (chromaError) {
      console.error('Error adding event to ChromaDB:', chromaError);
      // Continue anyway, this is not a critical failure
    }

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: savedEvent
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
});

/**
 * Fetch events from Perplexity API
 * 
 * @param {string} query - Search query
 * @param {string} location - Location query
 * @param {string} category - Event category
 * @param {boolean} forWomen - Filter for women-focused events
 * @returns {Promise<Array>} - Array of event objects
 */
const fetchEventsFromPerplexity = async (query, location = 'Bangalore', category = '', forWomen = false) => {
  try {
    if (!PERPLEXITY_API_KEY) {
      return [];
    }

    // Build prompt for Perplexity
    let prompt = `Find upcoming tech events`;
    
    if (location) {
      prompt += ` in ${location}`;
    }
    
    if (category) {
      prompt += ` in the category ${category}`;
    }
    
    if (forWomen) {
      prompt += ` that are focused on women in tech`;
    }
    
    if (query) {
      prompt += ` related to ${query}`;
    }
    
    prompt += `. Return the results as a JSON array with exactly this structure for each event:
    {
      "title": "Event title",
      "description": "Event description",
      "date": "YYYY-MM-DD",
      "location": "Event location",
      "virtual": boolean,
      "category": "Conference/Workshop/Hackathon/Webinar/Meetup",
      "image": "Image URL if available",
      "registrationUrl": "Registration URL",
      "price": "Free or price",
      "speakers": [{"name": "Speaker name", "role": "Speaker role"}],
      "organizer": "Event organizer"
    }
    
    Make sure to provide at least 5 real upcoming events. Events should be real and current.`;

    // Call Perplexity API
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'llama-3-sonar-large-32k',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 3000
      },
      {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Parse response to extract JSON array
    const content = response.data.choices[0].message.content;
    
    // Try to extract JSON array
    const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      try {
        const events = JSON.parse(jsonMatch[0]);
        
        // Add IDs and format dates
        return events.map(event => ({
          ...event,
          _id: uuidv4(),
          date: new Date(event.date),
          virtual: event.virtual || false,
          forWomen: forWomen
        }));
      } catch (e) {
        console.error('Error parsing JSON from Perplexity response:', e);
      }
    }

    return [];
  } catch (error) {
    console.error('Error fetching events from Perplexity API:', error);
    return [];
  }
};

/**
 * Mock events for testing
 * @returns {Array} - Array of event objects
 */
export const getMockEvents = () => {
  const currentDate = new Date();
  
  return [
    {
      _id: '1',
      title: 'Women in Tech Leadership Summit',
      description: 'Join industry leaders for a day of inspiration, learning, and networking. This summit features keynote speakers, panel discussions, and workshops focused on advancing women in technology leadership roles.',
      date: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      location: 'Taj Bangalore, MG Road',
      virtual: false,
      category: 'Conference',
      image: 'https://picsum.photos/id/3/400/200',
      registrationUrl: 'https://example.com/events/register/1',
      price: '₹2,000',
      speakers: [
        { name: 'Priya Sharma', role: 'CTO, TechInnovate', image: 'https://randomuser.me/api/portraits/women/11.jpg' },
        { name: 'Anita Desai', role: 'VP Engineering, GlobalTech', image: 'https://randomuser.me/api/portraits/women/12.jpg' }
      ],
      organizer: 'Women in Tech Foundation',
      forWomen: true,
      viewCount: 245,
      registrationCount: 120,
      savedBy: [],
      attendees: []
    },
    {
      _id: '2',
      title: 'Returning to Work: Strategies for Success',
      description: 'This virtual workshop is designed for women returning to the workforce after a career break. Learn practical strategies for updating your skills, rebuilding confidence, navigating the job market, and successfully transitioning back to professional life.',
      date: new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      location: 'Online',
      virtual: true,
      category: 'Workshop',
      image: 'https://picsum.photos/id/96/400/200',
      registrationUrl: 'https://example.com/events/register/2',
      price: 'Free',
      speakers: [
        { name: 'Meera Kapoor', role: 'Career Coach', image: 'https://randomuser.me/api/portraits/women/13.jpg' }
      ],
      organizer: 'Tech Moms Network',
      forWomen: true,
      viewCount: 189,
      registrationCount: 85,
      savedBy: [],
      attendees: []
    },
    {
      _id: '3',
      title: 'Hackathon: Build for Social Impact',
      description: 'A 48-hour hackathon focused on creating tech solutions for social good. Open to all skill levels, with mentors available throughout the event to help teams develop their ideas.',
      date: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      location: 'Tech Park, Electronic City',
      virtual: false,
      category: 'Hackathon',
      image: 'https://picsum.photos/id/20/400/200',
      registrationUrl: 'https://example.com/events/register/3',
      price: 'Free',
      speakers: [],
      organizer: 'Code for Change',
      forWomen: false,
      viewCount: 310,
      registrationCount: 175,
      savedBy: [],
      attendees: []
    },
    {
      _id: '4',
      title: 'Advanced React and Redux Workshop',
      description: 'Deep dive into advanced React patterns, Redux state management, and performance optimization techniques. This hands-on workshop will cover real-world examples and best practices.',
      date: new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      location: 'Developer Hub, Indiranagar',
      virtual: false,
      category: 'Workshop',
      image: 'https://picsum.photos/id/48/400/200',
      registrationUrl: 'https://example.com/events/register/4',
      price: '₹1,500',
      speakers: [
        { name: 'Amit Verma', role: 'Senior Frontend Engineer, TechStack', image: 'https://randomuser.me/api/portraits/men/32.jpg' }
      ],
      organizer: 'Frontend Developers Bangalore',
      forWomen: false,
      viewCount: 278,
      registrationCount: 95,
      savedBy: [],
      attendees: []
    },
    {
      _id: '5',
      title: 'Women in AI and ML Conference',
      description: 'A conference dedicated to celebrating and promoting women in artificial intelligence and machine learning. Features technical talks, research presentations, and career development sessions.',
      date: new Date(currentDate.getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      location: 'Sheraton Grand, Brigade Gateway',
      virtual: false,
      category: 'Conference',
      image: 'https://picsum.photos/id/68/400/200',
      registrationUrl: 'https://example.com/events/register/5',
      price: '₹2,500',
      speakers: [
        { name: 'Dr. Lakshmi Rao', role: 'Research Director, AI Institute', image: 'https://randomuser.me/api/portraits/women/15.jpg' },
        { name: 'Sameera Khan', role: 'ML Engineer, DataTech', image: 'https://randomuser.me/api/portraits/women/16.jpg' }
      ],
      organizer: 'Women in AI India',
      forWomen: true,
      viewCount: 405,
      registrationCount: 215,
      savedBy: [],
      attendees: []
    }
  ];
};

// export { getEventById, saveEvent, unsaveEvent, registerForEvent, getRegisteredEvents, getSavedEvents } from '../controllers/event.controller.js';