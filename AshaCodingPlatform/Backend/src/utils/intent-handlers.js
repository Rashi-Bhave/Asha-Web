// src/utils/intent-handlers.js
import axios from 'axios';

// Create a dedicated axios instance for Groq API calls
const groqClient = axios.create({
  baseURL: 'https://api.groq.com/openai/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
  },
  timeout: 30000 // Add timeout to prevent hanging requests
});

// Safe approach to get the API URL that works in both browser and Node.js
const getApiUrl = () => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';
  }
  // For browser environment
  return window.API_URL || 'http://localhost:8000/api/v1';
};

// Safe approach to get auth token that works in both environments
const getAuthToken = (userId) => {
  // If we have userId directly, no need for token
  if (userId) return null;
  
  // Try to get from localStorage in browser
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('token');
  }
  
  // No token available in this environment
  return null;
};

/**
 * Handler for Career_Trajectory_Switch intent with inclusivity focus
 * Redirects users to the Career Visualizer with contextual parameters
 */
const handleCareerTrajectoryIntent = async (message, userId) => {
  try {
    // Extract career parameters using LLM with inclusivity focus
    const careerParams = await extractCareerParametersWithLLM(message);
    
    // Build query parameters for URL
    const queryParams = new URLSearchParams();
    if (careerParams.career) queryParams.append('career', careerParams.career);
    if (careerParams.phase) queryParams.append('phase', careerParams.phase);
    if (careerParams.skills.length > 0) queryParams.append('skills', careerParams.skills.join(','));
    
    const queryString = queryParams.toString();
    const careerPageUrl = `/career${queryString ? '?' + queryString : ''}`;
    
    // Craft an inclusive and empowering response
    const careerText = careerParams.career ? ` in ${careerParams.career}` : '';
    const phaseText = careerParams.phase ? ` at the ${careerParams.phase} level` : '';
    const skillsText = careerParams.skills.length > 0 ? ` with skills in ${careerParams.skills.join(', ')}` : '';
    
    // Include diversity insights
    let diversityInsight = "";
    
    // Add specific women in tech insights based on career field
    if (careerParams.career && careerParams.career.toLowerCase().includes('data')) {
      diversityInsight = " Did you know that women like Joy Buolamwini, founder of the Algorithmic Justice League, are leading efforts to ensure data science and AI are more inclusive and equitable?";
    } else if (careerParams.career && careerParams.career.toLowerCase().includes('engineer')) {
      diversityInsight = " The field has benefited tremendously from women pioneers like Annie Easley at NASA and modern leaders like Marian Croak at Google who holds over 200 patents.";
    } else if (careerParams.career && careerParams.career.toLowerCase().includes('lead')) {
      diversityInsight = " Companies with gender-diverse leadership teams have been shown to outperform their peers by 25% according to McKinsey research.";
    } else {
      diversityInsight = " Our Career Visualizer highlights diverse role models across various career stages to inspire all professionals.";
    }
    
    return {
      text: `I understand you're interested in career development${careerText}${phaseText}${skillsText}. Our Career Visualizer can help you explore different paths, skills needed, and growth opportunities for professionals from all backgrounds.${diversityInsight} Would you like to visit our Career Visualizer now?`,
      attachment: {
        type: 'link',
        data: {
          url: careerPageUrl,
          label: 'Open Career Visualizer',
          description: 'Explore inclusive career paths and growth opportunities'
        }
      },
      intent: "Career_Trajectory_Switch"
    };
  } catch (error) {
    console.error("Error in career trajectory intent handler:", error);
    
    // Graceful fallback
    return {
      text: "I understand you're interested in career development. Our Career Visualizer can help you explore different paths, skills needed, and growth opportunities for professionals from all backgrounds.",
      attachment: {
        type: 'link',
        data: {
          url: '/career',
          label: 'Open Career Visualizer',
          description: 'Explore career paths and growth opportunities'
        }
      },
      intent: "Career_Trajectory_Switch"
    };
  }
};

/**
 * Handler for Job_Listing intent with inclusivity focus
 * Now uses LLM to extract job search parameters
 */
const handleJobListingIntent = async (message, userId) => {
  try {
    // Extract job search criteria using LLM with inclusivity focus
    const jobQuery = await extractJobParametersWithLLM(message);
    
    // Build query parameters for URL
    const queryParams = new URLSearchParams();
    if (jobQuery.search) queryParams.append('search', jobQuery.search);
    if (jobQuery.location) queryParams.append('location', jobQuery.location);
    if (jobQuery.experienceLevel) queryParams.append('experienceLevel', jobQuery.experienceLevel);
    if (jobQuery.jobType) queryParams.append('jobType', jobQuery.jobType);
    if (jobQuery.remote === true) queryParams.append('remote', 'true');
    if (jobQuery.skills && jobQuery.skills.length > 0) queryParams.append('skills', jobQuery.skills.join(','));
    
    // Add inclusive search parameter
    queryParams.append('inclusive', 'true');
    
    // Try direct API call if possible
    try {
      const API_URL = getApiUrl();
      const token = getAuthToken(userId);
      
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const response = await axios.get(`${API_URL}/jobs`, {
        params: {
          search: jobQuery.search,
          location: jobQuery.location,
          experienceLevel: jobQuery.experienceLevel,
          jobType: jobQuery.jobType,
          remote: jobQuery.remote === true ? 'true' : undefined,
          skills: jobQuery.skills && jobQuery.skills.length > 0 ? jobQuery.skills.join(',') : undefined,
          sort: 'relevance',
          limit: 3,
          inclusive: 'true'
        },
        headers
      });
      
      if (response.data.success && response.data.jobs && response.data.jobs.length > 0) {
        const topJobs = response.data.jobs.slice(0, 3);
        
        // Create an inclusive job response with diversity data
        const diversityNote = "Our job listings aim to surface opportunities at companies committed to diverse and inclusive workplaces. ";
        
        return {
          text: `${diversityNote}I found ${response.data.jobs.length} job listings that match your criteria. Here's the top match:`,
          attachment: {
            type: 'jobs',
            data: topJobs
          },
          intent: "Job_Listing"
        };
      }
    } catch (apiError) {
      console.log("API call failed, using fallback:", apiError.message);
      // Continue to fallback approach if API call fails
    }
    
    // Fallback: Link to jobs page with filters
    const queryString = queryParams.toString();
    const jobsPageUrl = `/jobs${queryString ? '?' + queryString : ''}`;
    
    const roleText = jobQuery.search ? ` for ${jobQuery.search} roles` : '';
    const locationText = jobQuery.location ? ` in ${jobQuery.location}` : '';
    const experienceText = jobQuery.experienceLevel ? ` at the ${jobQuery.experienceLevel} level` : '';
    const typeText = jobQuery.jobType ? ` for ${jobQuery.jobType} positions` : '';
    const remoteText = jobQuery.remote === true ? ' with remote work options' : '';
    
    // Add diversity insight
    const diversityInsight = "Our jobs platform highlights companies with strong diversity and inclusion initiatives, including those working to close gender gaps in tech and leadership roles.";
    
    return {
      text: `I can help you find job listings${roleText}${locationText}${experienceText}${typeText}${remoteText}. ${diversityInsight} Would you like to check out our curated job listings?`,
      attachment: {
        type: 'link',
        data: {
          url: jobsPageUrl,
          label: 'Browse Job Listings',
          description: 'Explore diverse job opportunities'
        }
      },
      intent: "Job_Listing"
    };
  } catch (error) {
    console.error("Error in job listing intent handler:", error);
    
    // Graceful fallback
    return {
      text: "I can help you find job listings. Our Jobs page has current openings at companies committed to diversity and inclusion in the workplace.",
      attachment: {
        type: 'link',
        data: {
          url: '/jobs?inclusive=true',
          label: 'Browse Job Listings',
          description: 'Explore inclusive job opportunities'
        }
      },
      intent: "Job_Listing"
    };
  }
};

/**
 * Handler for Mock_Interview intent with inclusivity focus
 * Uses LLM to extract interview parameters and create a room directly
 */
const handleMockInterviewIntent = async (message, userId) => {
  try {
    // Extract interview parameters using LLM with inclusivity focus
    const interviewParams = await extractInterviewParametersWithLLM(message);
    
    // Determine intent based on LLM extraction
    const intent = interviewParams.intent || analyzeMockInterviewIntent(message);
    const roomCode = interviewParams.roomCode || extractRoomCode(message);
    const role = interviewParams.role || "Software Developer"; // Default role
    
    if (intent === 'host') {
      // Generate a unique room ID
      const roomId = generateUniqueRoomId();
      
      // Build query parameters for role specification
      const queryParams = new URLSearchParams();
      if (role) queryParams.append('role', role);
      if (interviewParams.difficulty) queryParams.append('difficulty', interviewParams.difficulty);
      if (interviewParams.duration) queryParams.append('duration', interviewParams.duration);
      if (interviewParams.focus && interviewParams.focus.length > 0) {
        queryParams.append('focus', interviewParams.focus.join(','));
      }
      
      // Add inclusivity parameter for diverse interview questions
      queryParams.append('inclusive', 'true');
      
      // Create an inclusive response
      const diverseTip = getRandomDiverseTip();
      
      return {
        text: `Great! I've created an interview room for a ${role} position${interviewParams.difficulty ? ` at ${interviewParams.difficulty} difficulty` : ''}. You can now share this room code (${roomId}) with others or join directly.\n\n${diverseTip}`,
        attachment: {
          type: 'link',
          data: {
            url: `/room/${roomId}?${queryParams.toString()}`,
            label: 'Join Your Interview Room',
            description: `Room code: ${roomId} | Role: ${role}`
          }
        },
        intent: "Mock_Interview"
      };
    } else if (intent === 'join' && roomCode) {
      return {
        text: `I see you want to join interview room ${roomCode}. I can take you directly to that room.`,
        attachment: {
          type: 'link',
          data: {
            url: `/room/${roomCode}`,
            label: 'Join Interview Room',
            description: `Connect to room ${roomCode}`
          }
        },
        intent: "Mock_Interview"
      };
    } else if (intent === 'practice') {
      // For solo interview practice with inclusive questions
      const queryParams = new URLSearchParams();
      if (role) queryParams.append('role', role);
      if (interviewParams.difficulty) queryParams.append('difficulty', interviewParams.difficulty);
      if (interviewParams.interviewType) queryParams.append('type', interviewParams.interviewType);
      
      // Add inclusivity parameter
      queryParams.append('inclusive', 'true');
      
      const queryString = queryParams.toString();
      const simulatorUrl = `/interview-simulator${queryString ? '?' + queryString : ''}`;
      
      const roleText = role ? ` for a ${role} position` : '';
      const difficultyText = interviewParams.difficulty ? ` at ${interviewParams.difficulty} difficulty` : '';
      const typeText = interviewParams.interviewType ? ` focusing on ${interviewParams.interviewType} questions` : '';
      
      return {
        text: `It sounds like you're interested in solo interview practice${roleText}${typeText}${difficultyText}. Our Interview Simulator can help you prepare with realistic questions and feedback tailored to your needs. The simulator includes questions designed to be inclusive and fair to candidates from all backgrounds.`,
        attachment: {
          type: 'link',
          data: {
            url: simulatorUrl,
            label: 'Open Interview Simulator',
            description: 'Practice with our inclusive AI interviewer'
          }
        },
        intent: "Mock_Interview"
      };
    } else {
      // Generic interview practice - show all options
      return {
        text: "It sounds like you're interested in interview practice. We have several options: you can use our Interview Simulator for solo practice, join an existing interview room, or host your own interview. Our platform is designed to provide fair and inclusive interview experiences for all candidates. What would you prefer?",
        attachment: {
          type: 'options',
          data: [
            {
              label: 'Solo Practice',
              url: '/interview-simulator?inclusive=true',
              description: 'Practice with our inclusive AI interviewer'
            },
            {
              label: 'Join Interview',
              url: '/join-interview',
              description: 'Join an existing interview room'
            },
            {
              label: 'Host Interview',
              url: '/host-interview?inclusive=true',
              description: 'Create your own inclusive interview room'
            }
          ]
        },
        intent: "Mock_Interview"
      };
    }
  } catch (error) {
    console.error("Error in mock interview intent handler:", error);
    
    // Graceful fallback
    return {
      text: "I can help you with interview practice. Would you like to try our interview simulator? It's designed to provide a fair and inclusive experience for all candidates.",
      attachment: {
        type: 'link',
        data: {
          url: '/interview-simulator?inclusive=true',
          label: 'Open Interview Simulator',
          description: 'Practice with our inclusive AI interviewer'
        }
      },
      intent: "Mock_Interview"
    };
  }
};

/**
 * Handler for Coding_Platform intent with inclusivity focus
 * Uses LLM to extract coding problem parameters
 */
const handleCodingPlatformIntent = async (message, userId) => {
  try {
    // Extract coding parameters using LLM with inclusivity focus
    const codingParams = await extractCodingParametersWithLLM(message);
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (codingParams.topics && codingParams.topics.length > 0) {
      queryParams.append('topics', codingParams.topics.join(','));
    }
    if (codingParams.difficulty) {
      queryParams.append('difficulty', codingParams.difficulty);
    }
    if (codingParams.dataStructures && codingParams.dataStructures.length > 0) {
      queryParams.append('dataStructures', codingParams.dataStructures.join(','));
    }
    if (codingParams.algorithms && codingParams.algorithms.length > 0) {
      queryParams.append('algorithms', codingParams.algorithms.join(','));
    }
    
    // Add inclusivity parameter
    queryParams.append('inclusive', 'true');
    
    // If specific problem is mentioned, try to find it directly
    if (codingParams.specificProblem) {
      try {
        const API_URL = getApiUrl();
        const token = getAuthToken(userId);
        
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        // Search for the specific problem by name
        const response = await axios.get(`${API_URL}/problems`, {
          params: {
            search: codingParams.specificProblem,
            limit: 1,
            inclusive: 'true'
          },
          headers
        });
        
        if (response.data.success && response.data.problems && response.data.problems.length > 0) {
          const problem = response.data.problems[0];
          
          // Add diversity insight
          const diversityNote = "Our coding problems are periodically reviewed to ensure inclusive language and examples that reflect diverse perspectives.";
          
          return {
            text: `${diversityNote} I found the problem "${problem.title}" that you're looking for. Would you like to try solving it?`,
            attachment: {
              type: 'link',
              data: {
                url: `/problems/${problem.id}?inclusive=true`,
                label: problem.title,
                description: `${problem.difficulty} | ${problem.topics.join(', ')}`
              }
            },
            intent: "Coding_Platform"
          };
        }
      } catch (apiError) {
        console.log("Problem search API call failed, using fallback:", apiError.message);
        // Continue to general search if specific problem can't be found
      }
    }
    
    // Try to find matching problems
    try {
      const API_URL = getApiUrl();
      const token = getAuthToken(userId);
      
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const params = {};
      if (codingParams.topics && codingParams.topics.length > 0) {
        params.topics = codingParams.topics.join(',');
      }
      if (codingParams.difficulty) {
        params.difficulty = codingParams.difficulty;
      }
      if (codingParams.dataStructures && codingParams.dataStructures.length > 0) {
        params.dataStructures = codingParams.dataStructures.join(',');
      }
      if (codingParams.algorithms && codingParams.algorithms.length > 0) {
        params.algorithms = codingParams.algorithms.join(',');
      }
      params.limit = 3;
      params.inclusive = 'true';
      
      const response = await axios.get(`${API_URL}/problems`, {
        params,
        headers
      });
      
      if (response.data.success && response.data.problems && response.data.problems.length > 0) {
        const problems = response.data.problems;
        
        // Create options for each problem
        const options = problems.map(problem => ({
          label: problem.title,
          url: `/problems/${problem.id}?inclusive=true`,
          description: `${problem.difficulty} | ${problem.topics.join(', ')}`
        }));
        
        // Add diversity note
        const diversityNote = "Our platform uses inclusive language and diverse examples in our coding problems, and credits contributions from coders of all backgrounds.";
        
        return {
          text: `${diversityNote} I found ${problems.length} coding problems that match your criteria:`,
          attachment: {
            type: 'options',
            data: options
          },
          intent: "Coding_Platform"
        };
      }
    } catch (apiError) {
      console.log("API call failed, using fallback:", apiError.message);
      // Continue to fallback approach if API call fails
    }
    
    // Fallback: Link to problems page with filters
    const queryString = queryParams.toString();
    const problemsPageUrl = `/problems${queryString ? '?' + queryString : ''}`;
    
    const topicsText = codingParams.topics && codingParams.topics.length > 0 
      ? ` on ${codingParams.topics.join(', ')}` 
      : '';
    
    const difficultyText = codingParams.difficulty 
      ? ` at ${codingParams.difficulty} difficulty` 
      : '';
    
    const specificText = codingParams.specificProblem 
      ? ` like "${codingParams.specificProblem}"` 
      : '';
    
    // Include a diverse historical note
    const diversityInsight = "Did you know that women like Ada Lovelace, Grace Hopper, and Katherine Johnson made foundational contributions to computer programming? Our platform celebrates this diverse history of computing.";
    
    return {
      text: `I see you're looking for coding practice${topicsText}${difficultyText}${specificText}. ${diversityInsight} Would you like to explore our problem set?`,
      attachment: {
        type: 'link',
        data: {
          url: problemsPageUrl,
          label: 'Browse Coding Problems',
          description: 'Practice with our inclusive coding challenges'
        }
      },
      intent: "Coding_Platform"
    };
  } catch (error) {
    console.error("Error in coding platform intent handler:", error);
    
    // Graceful fallback
    return {
      text: "I can help you find coding problems to practice with. Our platform celebrates diverse contributions to computer science and provides inclusive problem statements and examples.",
      attachment: {
        type: 'link',
        data: {
          url: '/problems?inclusive=true',
          label: 'Browse Coding Problems',
          description: 'Practice with our inclusive coding challenges'
        }
      },
      intent: "Coding_Platform"
    };
  }
};

/**
 * Get a random diversity tip for interviews
 */
function getRandomDiverseTip() {
  const tips = [
    "Tip: Our interview simulator includes questions based on research about inclusive hiring practices to help candidates from all backgrounds succeed.",
    "Tip: Studies show diverse interview panels help reduce bias. Consider inviting peers with different backgrounds to your mock interview sessions.",
    "Tip: Research by Harvard Business Review shows that women often face different interview expectations than men. Our system is designed to provide fair and balanced feedback.",
    "Tip: Did you know? Companies with inclusive interview processes are 70% more likely to capture new markets, according to research by Josh Bersin.",
    "Tip: Our interview questions are regularly audited for bias to ensure they're fair to candidates from all backgrounds."
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
}

// ---- LLM-POWERED PARAMETER EXTRACTION FUNCTIONS ----

/**
 * Extract career parameters from message using LLM with inclusivity focus
 */
async function extractCareerParametersWithLLM(message) {
  try {
    const messages = [
      {
        "role": "system",
        "content": `You are a career development expert specializing in inclusive tech careers. 
        Your task is to extract career parameters from a user's message.
        
        Be aware of and avoid gender bias in your extraction. Do not assume gender based on career roles,
        skill sets, or leadership positions. Extract information exactly as presented by the user 
        without adding gendered assumptions.
        
        Your response MUST be valid JSON following the structure in the example, with no extra text 
        before or after the JSON.`
      },
      {
        "role": "user",
        "content": `Extract career parameters from this message: "${message}"
        
        Return your response as JSON with exactly this structure:
        
        {
          "career": "specific career path mentioned",
          "phase": "early-career|mid-career|senior|manager|executive",
          "skills": ["skill1", "skill2"],
          "interests": ["interest1", "interest2"],
          "goals": ["goal1", "goal2"]
        }
        
        If a parameter is not mentioned, provide an empty string or empty array as appropriate.`
      }
    ];

    // Make request to Groq
    const response = await groqClient.post('/chat/completions', {
      messages,
      model: "llama3-70b-8192",
      temperature: 0.3,
      max_tokens: 800
    });
    
    // Parse the JSON response
    const llmResponse = JSON.parse(response.data.choices[0].message.content);
    return llmResponse;
  } catch (error) {
    console.error("Error extracting career parameters with LLM:", error);
    
    // Return default structure on error
    return {
      career: "",
      phase: "",
      skills: extractSkillsFromMessage(message),
      interests: [],
      goals: []
    };
  }
}

/**
 * Extract job search parameters from message using LLM with inclusivity focus
 */
async function extractJobParametersWithLLM(message) {
  try {
    const messages = [
      {
        "role": "system",
        "content": `You are a job search assistant specializing in inclusive tech careers. 
        Your task is to extract job search parameters from a user's message.
        
        Be aware of and avoid gender bias in your extraction. Do not assume gender based on job roles,
        skill sets, or leadership positions. Extract information exactly as presented by the user 
        without adding gendered assumptions.
        
        Your response MUST be valid JSON following the structure in the example, with no extra text 
        before or after the JSON.`
      },
      {
        "role": "user",
        "content": `Extract job search parameters from this message: "${message}"
        
        Return your response as JSON with exactly this structure:
        
        {
          "search": "job title or keywords",
          "location": "location mentioned",
          "experienceLevel": "Entry Level|Mid Level|Senior Level|Executive",
          "jobType": "Full-time|Part-time|Contract|Internship",
          "remote": true|false,
          "skills": ["skill1", "skill2"]
        }
        
        For experience level, map "junior", "beginner", "fresher" to "Entry Level".
        Map "intermediate", "associate" to "Mid Level".
        Map "senior", "lead", "experienced" to "Senior Level".
        Map "manager", "director", "head", "chief" to "Executive".
        
        If a parameter is not mentioned, provide an empty string, false, or empty array as appropriate.`
      }
    ];

    // Make request to Groq
    const response = await groqClient.post('/chat/completions', {
      messages,
      model: "llama3-70b-8192",
      temperature: 0.3,
      max_tokens: 800
    });
    
    // Parse the JSON response
    const llmResponse = JSON.parse(response.data.choices[0].message.content);
    return llmResponse;
  } catch (error) {
    console.error("Error extracting job parameters with LLM:", error);
    
    // Fall back to regex-based extraction on error
    return extractJobSearchQuery(message);
  }
}

/**
 * Extract interview parameters from message using LLM with inclusivity focus
 */
async function extractInterviewParametersWithLLM(message) {
  try {
    const messages = [
      {
        "role": "system",
        "content": `You are an interview preparation expert specializing in inclusive tech interviews. 
        Your task is to extract interview parameters from a user's message.
        
        Be aware of and avoid gender bias in your extraction. Do not assume gender based on job roles,
        skill sets, or leadership positions. Extract information exactly as presented by the user 
        without adding gendered assumptions.
        
        Your response MUST be valid JSON following the structure in the example, with no extra text 
        before or after the JSON.`
      },
      {
        "role": "user",
        "content": `Extract interview parameters from this message: "${message}"
        
        Return your response as JSON with exactly this structure:
        
        {
          "intent": "host|join|practice",
          "role": "specific job role mentioned",
          "interviewType": "technical|behavioral|system-design|general",
          "difficulty": "easy|medium|hard",
          "duration": "short|medium|long",
          "roomCode": "room code if mentioned",
          "focus": ["specific focus area1", "focus area2"]
        }
        
        For intent:
        - "host" if user wants to create/host/start an interview
        - "join" if user wants to join/enter/connect to an existing interview
        - "practice" if user wants solo practice or using an interview simulator
        
        If a parameter is not mentioned, provide an empty string or empty array as appropriate.
        Room code should be alphanumeric, usually 6-10 characters.`
      }
    ];

    // Make request to Groq
    const response = await groqClient.post('/chat/completions', {
      messages,
      model: "llama3-70b-8192",
      temperature: 0.3,
      max_tokens: 800
    });
    
    // Parse the JSON response
    const llmResponse = JSON.parse(response.data.choices[0].message.content);
    return llmResponse;
  } catch (error) {
    console.error("Error extracting interview parameters with LLM:", error);
    
    // Return default structure on error
    return {
      intent: analyzeMockInterviewIntent(message),
      role: extractRoleFromMessage(message),
      interviewType: "",
      difficulty: "",
      duration: "",
      roomCode: extractRoomCode(message),
      focus: []
    };
  }
}

/**
 * Extract coding problem parameters from message using LLM with inclusivity focus
 */
async function extractCodingParametersWithLLM(message) {
  try {
    const messages = [
      {
        "role": "system",
        "content": `You are a coding problems expert specializing in inclusive algorithm challenges. 
        Your task is to extract coding problem parameters from a user's message.
        
        Be aware of and avoid gender bias in your extraction. Do not assume gender based on coding skills,
        problem-solving abilities, or technical expertise. Extract information exactly as presented by the user 
        without adding gendered assumptions.
        
        Your response MUST be valid JSON following the structure in the example, with no extra text 
        before or after the JSON.`
      },
      {
        "role": "user",
        "content": `Extract coding problem parameters from this message: "${message}"
        
        Return your response as JSON with exactly this structure:
        
        {
          "topics": ["array", "string", "tree", "etc"],
          "difficulty": "easy|medium|hard",
          "specificProblem": "exact problem name if mentioned",
          "dataStructures": ["specific data structures mentioned"],
          "algorithms": ["specific algorithms mentioned"]
        }
        
        Common topics to look for:
        arrays, strings, linked lists, trees, graphs, dynamic programming, sorting, searching, recursion, backtracking, greedy, binary search, hash tables, heaps, stacks, queues, bit manipulation, math, design
        
        For data structures specifically look for:
        array, string, linked list, doubly linked list, stack, queue, hash table, tree, binary tree, binary search tree, heap, graph, trie, segment tree, union find
        
        For algorithms specifically look for:
        bfs, dfs, binary search, two pointers, sliding window, dynamic programming, recursion, backtracking, greedy, divide and conquer, topological sort, dijkstra's algorithm
        
        If a parameter is not mentioned, provide an empty string or empty array as appropriate.`
      }
    ];

    // Make request to Groq
    const response = await groqClient.post('/chat/completions', {
      messages,
      model: "llama3-70b-8192",
      temperature: 0.3,
      max_tokens: 800
    });
    
    // Parse the JSON response
    const llmResponse = JSON.parse(response.data.choices[0].message.content);
    return llmResponse;
  } catch (error) {
    console.error("Error extracting coding parameters with LLM:", error);
    
    // Return default structure on error
    return {
      topics: extractCodingTopics(message),
      difficulty: extractDifficultyFromMessage(message),
      specificProblem: "",
      dataStructures: [],
      algorithms: []
    };
  }
}

// ---- FALLBACK HELPER FUNCTIONS ----

/**
 * Extract job search parameters using regex (fallback)
 */
const extractJobSearchQuery = (message) => {
  // Default query parameters
  const query = {
    search: '',
    location: '',
    experienceLevel: '',
    jobType: '',
    remote: false,
    skills: []
  };
  
  // Extract search terms
  const lowerMessage = message.toLowerCase();
  
  // Extract job title/search
  const jobTitlePatterns = [
    /(?:jobs?|positions?|roles?|opportunities?) (?:for|as|in) ([a-z\s]+)/i,
    /(?:looking for|searching for|find|seeking) ([a-z\s]+) jobs?/i,
    /([a-z\s]+) jobs?/i
  ];
  
  for (const pattern of jobTitlePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      query.search = match[1].trim();
      break;
    }
  }
  
  // Extract location
  const locationPatterns = [
    /(?:in|at|near|around) ([a-z\s,]+)(?:area|city|region)?/i,
    /(?:jobs?|positions?) (?:in|at|near) ([a-z\s,]+)/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      // Filter out common words that are not locations
      const location = match[1].trim();
      if (!['the', 'a', 'an', 'my', 'your', 'this', 'that', 'these', 'those'].includes(location.toLowerCase())) {
        query.location = location;
        break;
      }
    }
  }
  
  // Extract experience level
  if (lowerMessage.includes('entry') || lowerMessage.includes('junior') || lowerMessage.includes('fresher')) {
    query.experienceLevel = 'Entry Level';
  } else if (lowerMessage.includes('senior') || lowerMessage.includes('experienced') || lowerMessage.includes('lead')) {
    query.experienceLevel = 'Senior Level';
  } else if (lowerMessage.includes('mid') || lowerMessage.includes('intermediate')) {
    query.experienceLevel = 'Mid Level';
  }
  
  // Extract job type
  if (lowerMessage.includes('full-time') || lowerMessage.includes('full time')) {
    query.jobType = 'Full-time';
  } else if (lowerMessage.includes('part-time') || lowerMessage.includes('part time')) {
    query.jobType = 'Part-time';
  } else if (lowerMessage.includes('contract')) {
    query.jobType = 'Contract';
  } else if (lowerMessage.includes('intern') || lowerMessage.includes('internship')) {
    query.jobType = 'Internship';
  }
  
  // Check for remote work preference
  if (lowerMessage.includes('remote') || lowerMessage.includes('work from home') || lowerMessage.includes('wfh')) {
    query.remote = true;
  }
  
  // If no search term was extracted but the message has keywords, use the whole message
  if (!query.search && (lowerMessage.includes('job') || lowerMessage.includes('position') || lowerMessage.includes('work'))) {
    // Remove common words and use the rest as search
    query.search = message.replace(/(?:find|get|show|me|looking for|searching for|interested in|jobs?|positions?|roles?|opportunities?|the|in|at|near|around|please)/gi, '').trim();
  }
  
  // Extract skills - basic implementation
  query.skills = extractSkillsFromMessage(message);
  
  return query;
};

/**
 * Extract career interests from message (fallback)
 */
const extractCareerInterests = (message) => {
  const lowerMessage = message.toLowerCase();
  const careerKeywords = [
    'software', 'development', 'data science', 'machine learning', 'ml', 'ai',
    'frontend', 'backend', 'full stack', 'devops', 'cloud', 'security', 
    'product management', 'pm', 'ux', 'ui', 'design'
  ];
  
  return careerKeywords.filter(keyword => lowerMessage.includes(keyword));
};

/**
 * Analyze mock interview intent (fallback)
 */
const analyzeMockInterviewIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Host interview patterns
  if (lowerMessage.includes('host') || 
      lowerMessage.includes('create') || 
      lowerMessage.includes('start an interview') ||
      lowerMessage.includes('set up an interview') ||
      lowerMessage.includes('initiate an interview') ||
      lowerMessage.includes('my own interview')) {
    return 'host';
  }
  
  // Join interview patterns
  if (lowerMessage.includes('join') || 
      lowerMessage.includes('enter') || 
      lowerMessage.includes('connect to') ||
      lowerMessage.includes('participate in') ||
      lowerMessage.includes('room code')) {
    return 'join';
  }
  
  // Solo practice patterns
  if (lowerMessage.includes('practice interview') ||
      lowerMessage.includes('solo interview') ||
      lowerMessage.includes('practice alone') ||
      lowerMessage.includes('practice by myself') ||
      lowerMessage.includes('interview simulator') ||
      lowerMessage.includes('ai interview')) {
    return 'practice';
  }
  
  return 'general';
};

/**
 * Extract room code from message (fallback)
 */
const extractRoomCode = (message) => {
  // Look for common room code formats (6-10 alphanumeric characters)
  const roomCodeRegex = /\b([A-Za-z0-9]{6,10})\b/;
  const match = message.match(roomCodeRegex);
  
  if (match) return match[1];
  
  // Look for phrases like "room code is ABC123" or "with code ABC123"
  const phraseRegex = /(?:room|code|join code|interview code)[:\s]+([A-Za-z0-9]{6,10})/i;
  const phraseMatch = message.match(phraseRegex);
  
  if (phraseMatch) return phraseMatch[1];
  
  return null;
};

/**
 * Generate a unique room ID
 */
const generateUniqueRoomId = () => {
  // Generate a random alphanumeric string
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Extract coding topics from message (fallback)
 */
const extractCodingTopics = (message) => {
  const lowerMessage = message.toLowerCase();
  const topics = [
    'arrays', 'strings', 'linked lists', 'trees', 'graphs', 'dynamic programming',
    'sorting', 'searching', 'recursion', 'backtracking', 'greedy', 'binary search',
    'hash tables', 'heaps', 'stacks', 'queues', 'algorithms', 'data structures'
  ];
  
  return topics.filter(topic => lowerMessage.includes(topic));
};

/**
 * Extract difficulty from message (fallback)
 */
const extractDifficultyFromMessage = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('easy') || lowerMessage.includes('simple') || lowerMessage.includes('beginner')) {
    return 'easy';
  } else if (lowerMessage.includes('medium')) {
    return 'medium';
  } else if (lowerMessage.includes('hard') || lowerMessage.includes('difficult') || lowerMessage.includes('advanced')) {
    return 'hard';
  }
  
  return '';
};

/**
 * Extract role from message (fallback)
 */
const extractRoleFromMessage = (message) => {
  const rolePatterns = [
    /(?:for|as|about)\s+(?:a|an)?\s*([a-zA-Z\s]+)(?:role|position|interview)/i,
    /([a-zA-Z\s]+)(?:role|position|job)\s+interview/i
  ];
  
  for (const pattern of rolePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return '';
};

/**
 * Extract skills from message (fallback)
 */
const extractSkillsFromMessage = (message) => {
  const lowerMessage = message.toLowerCase();
  const commonSkills = [
    'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'swift',
    'react', 'angular', 'vue', 'node', 'express', 'django', 'spring', 'flask',
    'html', 'css', 'sql', 'nosql', 'mongodb', 'mysql', 'postgresql', 'oracle',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'ci/cd',
    'machine learning', 'deep learning', 'ai', 'data science', 'data analysis',
    'product management', 'agile', 'scrum', 'devops', 'cloud', 'blockchain'
  ];
  
  return commonSkills.filter(skill => lowerMessage.includes(skill.toLowerCase()));
};

// Export all functions
export {
  handleCareerTrajectoryIntent,
  handleJobListingIntent,
  handleMockInterviewIntent,
  handleCodingPlatformIntent,
  extractCareerInterests,
  extractJobSearchQuery,
  analyzeMockInterviewIntent,
  extractRoomCode,
  extractCodingTopics,
  generateUniqueRoomId,
  extractDifficultyFromMessage,
  extractRoleFromMessage,
  extractSkillsFromMessage
};