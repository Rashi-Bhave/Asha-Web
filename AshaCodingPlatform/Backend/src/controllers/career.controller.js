// backend/src/controllers/career.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import axios from 'axios';

// Initialize Groq client with proper configuration
const groqClient = axios.create({
  baseURL: 'https://api.groq.com/openai/v1', // Updated to correct endpoint
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
  },
  timeout: 30000 // Add timeout to prevent hanging requests
});

/**
 * @route   GET /api/v1/career/paths
 * @desc    Get available career paths
 * @access  Public
 */
export const getCareerPaths = asyncHandler(async (req, res) => {
  try {
    // Using Groq LLM to generate career paths
    const messages = [
      {
        "role": "system",
        "content": `You are a career development expert specializing in tech careers for women. 
        Your task is to provide a list of tech career paths with their associated icons.
        
        Your response MUST be valid JSON following the structure in the example, with no extra text 
        before or after the JSON.`
      },
      {
        "role": "user",
        "content": `Please provide a list of tech career paths with associated icons.
        
        Return your response as JSON with exactly this structure:
        
        {
          "paths": [
            {
              "id": "career-id-in-kebab-case",
              "name": "Career Name",
              "icon": "icon-name"
            }
          ]
        }
        
        Include 6-8 career paths that would be relevant for women in tech.
        
        For the icon field, use one of the following values: "code", "chart", "design", "tasks", "server", "shield", "brain", "data".
        These values correspond to pre-defined SVG icons in our application.`
      }
    ];

    // Check if GROQ_API_KEY is configured
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GROQ_API_KEY is not configured in environment variables."
      });
    }

    // Updated model name to use one of Groq's supported models
    const response = await groqClient.post('/chat/completions', {
      messages,
      model: "llama3-70b-8192", // Updated model name
      temperature: 0.2,
      max_tokens: 1500
    });
    
    // Parse the JSON response
    const llmResponse = JSON.parse(response.data.choices[0].message.content);
    
    // Return the career paths
    return res.status(200).json({
      success: true,
      paths: llmResponse.paths
    });
  } catch (error) {
    console.error("Error calling Groq API:", error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Groq API response error:", {
        status: error.response.status,
        data: error.response.data
      });
      
      return res.status(500).json({
        success: false,
        message: `Groq API error: ${error.response.status}`,
        details: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from Groq API:", error.request);
      return res.status(500).json({
        success: false,
        message: "No response received from Groq API"
      });
    } else {
      // Something happened in setting up the request
      console.error("Error setting up Groq API request:", error.message);
      return res.status(500).json({
        success: false,
        message: `Error setting up Groq API request: ${error.message}`
      });
    }
  }
});

/**
 * @route   GET /api/v1/career/phases
 * @desc    Get career development phases
 * @access  Public
 */
export const getCareerPhases = asyncHandler(async (req, res) => {
  try {
    // Using Groq LLM to generate career phases
    const messages = [
      {
        "role": "system",
        "content": `You are a career development expert specializing in tech careers. 
        Your task is to provide descriptions of different career phases.
        
        Your response MUST be valid JSON following the structure in the example, with no extra text 
        before or after the JSON.`
      },
      {
        "role": "user",
        "content": `Please describe the typical phases of a tech career.
        
        Return your response as JSON with exactly this structure:
        
        {
          "phases": [
            {
              "id": "phase-id",
              "name": "Phase Name",
              "description": "Brief description of this career phase",
              "timeframe": "Typical years of experience range"
            }
          ]
        }
        
        Include exactly 3 phases: early career, mid-career, and senior level.`
      }
    ];

    const response = await groqClient.post('/chat/completions', {
      messages,
      model: "llama3-70b-8192", // Updated model name
      temperature: 0.2,
      max_tokens: 1000
    });
    
    // Parse the JSON response
    const llmResponse = JSON.parse(response.data.choices[0].message.content);
    
    // Return the career phases
    return res.status(200).json({
      success: true,
      phases: llmResponse.phases
    });
  } catch (error) {
    console.error("Error calling Groq API:", error);
    
    return res.status(500).json({
      success: false,
      message: "Error generating career phases from Groq API",
      error: error.response?.data || error.message
    });
  }
});

/**
 * @route   GET /api/v1/career/progression
 * @desc    Get career progression data for a specific role and phase
 * @access  Public
 */
export const getCareerProgressionData = asyncHandler(async (req, res) => {
  const { career, phase } = req.query;
  
  // Validate input
  if (!career || !phase) {
    return res.status(400).json({
      success: false,
      message: "Career path and phase are required"
    });
  }
  
  try {
    // Using Groq LLM to generate career progression data
    const messages = [
      {
        "role": "system",
        "content": `You are a career development expert specializing in tech careers for women. 
        Your task is to provide detailed career progression information for a specific tech role and career phase.
        
        Your response MUST be valid JSON following the structure in the example, with no extra text 
        before or after the JSON.`
      },
      {
        "role": "user",
        "content": `Please provide detailed career progression information for a ${career.replace('-', ' ')} at the ${phase} career phase.
        
        Return your response as JSON with exactly this structure:
        
        {
          "progression": {
            "skills": ["Essential skill 1", "Essential skill 2", "Essential skill 3", "Essential skill 4", "Essential skill 5"],
            "learning": ["Learning path item 1", "Learning path item 2", "Learning path item 3", "Learning path item 4"],
            "stories": [
              {
                "name": "Woman's name",
                "story": "Her career journey and challenges",
                "advice": "Key advice for others in similar positions"
              },
              {
                "name": "Another woman's name",
                "story": "Her career journey and challenges",
                "advice": "Key advice for others in similar positions"
              }
            ],
            "nextSteps": [
              {
                "title": "Step title 1",
                "description": "Step description 1"
              },
              {
                "title": "Step title 2",
                "description": "Step description 2"
              },
              {
                "title": "Step title 3",
                "description": "Step description 3"
              },
              {
                "title": "Step title 4",
                "description": "Step description 4"
              }
            ]
          }
        }
        
        Ensure the information is tailored for ${career.replace('-', ' ')} professionals at the ${phase} career phase.
        Include realistic skills, learning paths, and next steps that would be valuable for women in this role.
        For the stories section, create realistic but fictional examples of women who have succeeded in this role at this career phase.
        Provide diverse backgrounds and journeys in the stories section.`
      }
    ];

    const response = await groqClient.post('/chat/completions', {
      messages,
      model: "llama3-70b-8192", // Updated model name
      temperature: 0.7,
      max_tokens: 2000
    });
    
    // Parse the JSON response
    const llmResponse = JSON.parse(response.data.choices[0].message.content);
    
    // Return the career progression data
    return res.status(200).json({
      success: true,
      progression: llmResponse.progression
    });
  } catch (error) {
    console.error(`Error generating progression data for ${career} at ${phase} phase:`, error);
    
    return res.status(500).json({
      success: false,
      message: "Error generating career progression data from Groq API",
      error: error.response?.data || error.message
    });
  }
});

/**
 * @route   GET /api/v1/career/notable-women
 * @desc    Get notable women in a specific career field
 * @access  Public
 */
export const getNotableWomen = asyncHandler(async (req, res) => {
  const { career } = req.query;
  
  // Validate input
  if (!career) {
    return res.status(400).json({
      success: false,
      message: "Career path is required"
    });
  }
  
  try {
    // Using Groq LLM to generate notable women data
    const messages = [
      {
        "role": "system",
        "content": `You are a career development expert specializing in tech careers for women. 
        Your task is to provide information about notable women in a specific tech field.
        
        Your response MUST be valid JSON following the structure in the example, with no extra text 
        before or after the JSON.`
      },
      {
        "role": "user",
        "content": `Please provide information about notable women in the field of ${career.replace('-', ' ')}.
        
        Return your response as JSON with exactly this structure:
        
        {
          "women": [
            {
              "name": "Woman's full name",
              "role": "Professional role or title",
              "achievements": "Summary of key achievements and contributions",
              "quote": "Inspirational quote from this person"
            }
          ]
        }
        
        Include exactly 3 notable women in the field of ${career.replace('-', ' ')}.
        Focus on diverse women from different backgrounds and time periods who have made significant contributions.
        Include both historical and contemporary figures where relevant.
        For each woman, provide her real full name, accurate role, factual achievements, and an authentic quote.`
      }
    ];

    const response = await groqClient.post('/chat/completions', {
      messages,
      model: "llama3-70b-8192", // Updated model name
      temperature: 0.5,
      max_tokens: 1500
    });
    
    // Parse the JSON response
    const llmResponse = JSON.parse(response.data.choices[0].message.content);
    
    // Return the notable women data
    return res.status(200).json({
      success: true,
      women: llmResponse.women
    });
  } catch (error) {
    console.error(`Error generating notable women for ${career}:`, error);
    
    return res.status(500).json({
      success: false,
      message: "Error generating notable women data from Groq API",
      error: error.response?.data || error.message
    });
  }
});

/**
 * @route   POST /api/v1/career/recommendations
 * @desc    Get personalized career recommendations
 * @access  Private
 */
export const getCareerRecommendations = asyncHandler(async (req, res) => {
  const { currentRole, yearsExperience, skills, interests, goals } = req.body;
  
  // Validate input
  if (!currentRole) {
    return res.status(400).json({
      success: false,
      message: "Current role is required"
    });
  }
  
  try {
    // Using Groq LLM to generate personalized recommendations
    const messages = [
      {
        "role": "system",
        "content": `You are a career development expert specializing in tech careers for women. 
        Your task is to create personalized career advancement recommendations based on the user's 
        current role, years of experience, skills, interests, and goals. Provide specific, actionable advice 
        that will help them advance to the next level in their career.
        
        Your response MUST be valid JSON following the structure in the example, with no extra text 
        before or after the JSON.`
      },
      {
        "role": "user",
        "content": `Please create personalized career recommendations based on these details:
        
        Current Role: ${currentRole}
        Years of Experience: ${yearsExperience || 'Not specified'}
        Current Skills: ${skills?.join(', ') || 'Not specified'}
        Interests: ${interests?.join(', ') || 'Not specified'}
        Career Goals: ${goals?.join(', ') || 'Not specified'}
        
        Return your response as JSON with exactly this structure:
        
        {
          "personalRecommendations": {
            "learningPath": [
              {
                "name": "Path name",
                "resources": [
                  {
                    "type": "Course/Book/Community/Other",
                    "title": "Resource title",
                    "provider": "Resource provider (if applicable)",
                    "link": "#",
                    "duration": "Duration (if applicable)",
                    "author": "Author name (if applicable)",
                    "description": "Brief description (if applicable)"
                  }
                ]
              }
            ],
            "nextSteps": [
              "Actionable step 1",
              "Actionable step 2",
              "Actionable step 3",
              "Actionable step 4"
            ],
            "personalization": "Personalized note reflecting the user's specific situation and goals"
          }
        }
        
        Focus on recommendations that are particularly valuable for women in tech, including 
        communities, mentorship opportunities, and strategies for navigating challenges that women commonly 
        face in the industry.
        
        Include at least 3 resources in the learning path and 4 specific next steps.
        Ensure the personalization note references their specific role, experience level, and goals.`
      }
    ];

    const response = await groqClient.post('/chat/completions', {
      messages,
      model: "llama3-70b-8192", // Updated model name
      temperature: 0.7,
      max_tokens: 2000
    });
    
    // Parse the JSON response
    const llmResponse = JSON.parse(response.data.choices[0].message.content);
    
    // Return the personalized recommendations
    return res.status(200).json({
      success: true,
      recommendations: llmResponse
    });
  } catch (error) {
    console.error("Error generating personalized recommendations:", error);
    
    return res.status(500).json({
      success: false,
      message: "Error generating personalized recommendations from Groq API",
      error: error.response?.data || error.message
    });
  }
});


export const generateCareerRoadmap = asyncHandler(async (req, res) => {
  const { 
    currentRole, 
    targetRole, 
    yearsExperience, 
    currentSkills, 
    interests, 
    timeframe, 
    challenges,
    workStyle
  } = req.body;
  
  // Validate input
  if (!currentRole || !targetRole) {
    return res.status(400).json({
      success: false,
      message: "Current role and target role are required"
    });
  }
  
  try {
    // Using Groq LLM to generate a personalized career roadmap
    const messages = [
      {
        "role": "system",
        "content": `You are a career development expert specializing in tech careers for women. 
        Your task is to create a detailed, personalized career roadmap to help the user progress from their 
        current role to their target role within their specified timeframe. This should include milestones, 
        skill development, and strategies tailored to their situation.
        
        Your response MUST be valid JSON following the structure in the example, with no extra text 
        before or after the JSON.`
      },
      {
        "role": "user",
        "content": `Please create a personalized career roadmap based on these details:
        
        Current Role: ${currentRole}
        Target Role: ${targetRole}
        Years of Experience: ${yearsExperience || 'Not specified'}
        Current Skills: ${currentSkills?.join(', ') || 'Not specified'}
        Interests: ${interests?.join(', ') || 'Not specified'}
        Challenges: ${challenges || 'Not specified'}
        Preferred Work Style: ${workStyle || 'Not specified'}
        Timeframe for Target Role: ${timeframe || '3-5 years'}
        
        Return your response as JSON with exactly this structure:
        
        {
          "roadmap": {
            "overview": "Brief overview of the career path from current to target role",
            "milestones": [
              {
                "title": "Milestone 1 Title",
                "timeframe": "Expected timeframe (e.g., '0-6 months')",
                "description": "Description of this career milestone",
                "skills": ["Skill 1", "Skill 2", "Skill 3"],
                "actions": ["Specific action 1", "Specific action 2", "Specific action 3"],
                "resources": [
                  {
                    "type": "Course/Book/Community/Other",
                    "title": "Resource title",
                    "description": "Brief description"
                  }
                ]
              }
            ],
            "challenges": [
              {
                "challenge": "Potential challenge description",
                "strategies": ["Strategy 1", "Strategy 2"]
              }
            ],
            "keyAdvice": ["Key piece of advice 1", "Key piece of advice 2", "Key piece of advice 3"]
          }
        }
        
        Include 4-6 detailed milestones that represent a progressive journey from the current role to the target role.
        Make each milestone specific, actionable, and achievable within the given timeframe segment.
        Focus on strategies that have proven particularly effective for women in tech.
        For each milestone, include 3-5 concrete skills to develop and 2-4 specific actions to take.
        Address 2-3 common challenges women might face on this specific career path with practical strategies.
        Provide 3-5 key pieces of advice specifically tailored to their transition.`
      }
    ];

    const response = await groqClient.post('/chat/completions', {
      messages,
      model: "llama3-70b-8192",
      temperature: 0.7,
      max_tokens: 3000
    });
    
    // Parse the JSON response
    const llmResponse = JSON.parse(response.data.choices[0].message.content);
    
    // Return the personalized career roadmap
    return res.status(200).json({
      success: true,
      roadmap: llmResponse.roadmap
    });
  } catch (error) {
    console.error("Error generating personalized career roadmap:", error);
    
    return res.status(500).json({
      success: false,
      message: "Error generating personalized career roadmap from Groq API",
      error: error.response?.data || error.message
    });
  }
});