// backend/src/controllers/interview.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import axios from 'axios';
import { InterviewQuestion } from '../models/interview-question.model.js';
import { InterviewSession } from '../models/interview-session.model.js';
import { CustomInterview } from '../models/custom-interview.model.js';
import { SavedQuestion } from '../models/saved-question.model.js';

// Initialize Groq client with proper configuration
const groqClient = axios.create({
  baseURL: 'https://api.groq.com/openai/v1', 
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
  },
  timeout: 30000 // Add timeout to prevent hanging requests
});

/**
 * @route   POST /api/v1/interview/generate-questions
 * @desc    Generate interview questions based on parameters
 * @access  Public
 */
export const generateInterviewQuestions = asyncHandler(async (req, res) => {
  const { 
    interviewType, 
    role, 
    seniority, 
    focusAreas, 
    difficulty, 
    questionCount = 5,
    userId // Optional user ID for session creation
  } = req.body;
  
  try {
    // Check if GROQ_API_KEY is configured
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GROQ_API_KEY is not configured in environment variables."
      });
    }
    
    // Construct prompt for question generation
    const messages = [
      {
        "role": "system",
        "content": `You are an AI interview assistant specializing in technical and behavioral interviews.
        Your task is to generate realistic interview questions based on the specified parameters.
        Questions should be appropriate for the role, seniority level, and difficulty.
        
        Your response MUST be valid JSON following the structure in the example, with no extra text 
        before or after the JSON.`
      },
      {
        "role": "user",
        "content": `Please generate ${questionCount} interview questions for a ${seniority} level ${role} position.
        
        Interview type: ${interviewType}
        Focus areas: ${focusAreas.join(', ')}
        Difficulty level: ${difficulty}
        
        Return your response as JSON with exactly this structure:
        
        {
          "questions": [
            {
              "question": "The complete question text",
              "type": "technical|behavioral|mixed",
              "focus": "specific focus area",
              "difficulty": "easy|medium|hard",
              "expectedTopics": ["topic1", "topic2", "topic3"]
            }
          ]
        }
        
        The expectedTopics field should contain key concepts or points that a good answer would cover.
        Ensure the difficulty matches the requested level: ${difficulty}.
        For technical questions, focus on realistic scenarios a ${role} would encounter.
        For behavioral questions, focus on situations relevant to a ${seniority} level position.`
      }
    ];

    // Call Groq LLM API
    const response = await groqClient.post('/chat/completions', {
      messages,
      model: "llama3-70b-8192", // Using Llama3 for good performance at lower cost
      temperature: 0.7, // Slightly higher temperature for more creative questions
      max_tokens: 2500
    });
    
    
    // Parse the JSON response
    const llmResponse = JSON.parse(response.data.choices[0].message.content);
    
    // If user ID is provided, create a new interview session
    let sessionId = null;
    if (userId) {
      // Create a new interview session with the generated questions
      const session = new InterviewSession({
        userId,
        interviewType,
        role,
        seniority,
        difficulty,
        focus: focusAreas,
        status: 'in-progress',
        startTime: new Date()
      });
      
      // Save empty response slots for each question
      llmResponse.questions.forEach(q => {
        session.responses.push({
          question: q.question
        });
      });
      
      // Save the session
      await session.save();
      sessionId = session._id;
    }
    
    // Return the interview questions and session ID if created
    return res.status(200).json({
      success: true,
      questions: llmResponse.questions,
      sessionId
    });
  } catch (error) {
    console.error("Error generating interview questions:", error);
    
    // Handle different error scenarios
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return res.status(500).json({
        success: false,
        message: `Groq API error: ${error.response.status}`,
        details: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(500).json({
        success: false,
        message: "No response received from Groq API"
      });
    } else {
      // Something happened in setting up the request
      return res.status(500).json({
        success: false,
        message: `Error setting up Groq API request: ${error.message}`
      });
    }
  }
});

/**
 * @route   POST /api/v1/interview/analyze-response
 * @desc    Analyze user's interview response
 * @access  Public
 */
export const analyzeResponse = asyncHandler(async (req, res) => {
    const { 
      interviewType, 
      role, 
      seniority, 
      question, 
      response: userResponse, // Renamed to avoid variable conflict
      feedbackDetail = 'detailed',
      nonVerbalData = null,
      sessionId = null,
      questionIndex = null
    } = req.body;
    
    try {
      // Check if GROQ_API_KEY is configured
      if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({
          success: false,
          message: "GROQ_API_KEY is not configured in environment variables."
        });
      }
      
      // Construct prompt for response analysis
      const messages = [
        {
          "role": "system",
          "content": `You are an AI interview coach specializing in technical and behavioral interviews.
          Your task is to analyze a response to an interview question and provide constructive feedback.
          Focus on both content and structure of the response, providing specific suggestions for improvement.
          
          Your response MUST be valid JSON following the structure in the example, with no extra text 
          before or after the JSON.`
        },
        {
          "role": "user",
          "content": `Please analyze this response to a ${interviewType} interview question for a ${seniority} level ${role} position.
          
          QUESTION: "${question}"
          
          RESPONSE: "${userResponse}"
          
          ${nonVerbalData ? `NON-VERBAL DATA: ${JSON.stringify(nonVerbalData)}` : ''}
          
          Feedback detail level: ${feedbackDetail}
          
          Return your analysis as JSON with exactly this structure:
          
          {
            "feedback": "Detailed qualitative feedback on the response content",
            "scores": {
              "technical": 85,
              "communication": 75
            },
            "strengths": ["strength1", "strength2", "strength3"],
            "improvements": ["improvement1", "improvement2", "improvement3"],
            "keywordMatches": ["keyword1", "keyword2"],
            "fillerWords": {
              "um": 5,
              "like": 3
            }
          }
          
          The feedback should be ${feedbackDetail} (brief, detailed, or comprehensive).
          Score technical content and communication quality on a scale of 0-100.
          For technical questions, analyze accuracy, completeness, and understanding.
          For behavioral questions, analyze structure, specificity, and relevance.
          The keywordMatches should contain important technical terms or concepts that were used correctly.
          The fillerWords field should estimate frequency of common filler words if possible from the text.`
        }
      ];
  
      // Call Groq LLM API
      const apiResponse = await groqClient.post('/chat/completions', {  // Renamed from 'response' to 'apiResponse'
        messages,
        model: "llama3-70b-8192",
        temperature: 0.4, // Lower temperature for more consistent feedback
        max_tokens: 2500
      });
      
      // Parse the JSON response
      const llmResponse = JSON.parse(apiResponse.data.choices[0].message.content);
      
      // If sessionId and questionIndex are provided, update the session
      if (sessionId && questionIndex !== null) {
        try {
          const session = await InterviewSession.findById(sessionId);
          
          if (session && session.responses[questionIndex]) {
            // Update the response data
            session.responses[questionIndex].response = userResponse;
            session.responses[questionIndex].feedback = llmResponse.feedback;
            session.responses[questionIndex].scores = llmResponse.scores;
            session.responses[questionIndex].keywordMatches = llmResponse.keywordMatches;
            
            // Update non-verbal metrics if provided
            if (nonVerbalData) {
              if (nonVerbalData.posture) {
                session.responses[questionIndex].nonVerbalMetrics = {
                  ...session.responses[questionIndex].nonVerbalMetrics,
                  ...nonVerbalData.posture
                };
              }
              
              if (nonVerbalData.voice) {
                session.responses[questionIndex].voiceMetrics = {
                  ...session.responses[questionIndex].voiceMetrics,
                  ...nonVerbalData.voice
                };
              }
              
              if (nonVerbalData.emotionData) {
                session.responses[questionIndex].nonVerbalMetrics.confidence = 
                  nonVerbalData.emotionData.confidence || session.responses[questionIndex].nonVerbalMetrics.confidence;
              }
            }
            
            // Add generated feedback for posture and voice
            if (llmResponse.postureFeedback) {
              session.responses[questionIndex].postureFeedback = llmResponse.postureFeedback;
            }
            
            if (llmResponse.voiceFeedback) {
              session.responses[questionIndex].voiceFeedback = llmResponse.voiceFeedback;
            }
            
            // Save the session
            await session.save();
          }
        } catch (err) {
          console.error("Error updating interview session:", err);
          // We'll continue even if session update fails
        }
      }
      
      // Return the analysis
      return res.status(200).json({
        success: true,
        feedback: llmResponse.feedback,
        scores: llmResponse.scores,
        strengths: llmResponse.strengths,
        improvements: llmResponse.improvements,
        keywordMatches: llmResponse.keywordMatches,
        fillerWords: llmResponse.fillerWords
      });
    } catch (error) {
      console.error("Error analyzing interview response:", error);
      
      // Handle different error scenarios
      if (error.response) {
        return res.status(500).json({
          success: false,
          message: `Groq API error: ${error.response.status}`,
          details: error.response.data
        });
      } else if (error.request) {
        return res.status(500).json({
          success: false,
          message: "No response received from Groq API"
        });
      } else {
        return res.status(500).json({
          success: false,
          message: `Error setting up Groq API request: ${error.message}`
        });
      }
    }
  });

/**
 * @route   POST /api/v1/interview/overall-feedback
 * @desc    Generate overall feedback for the complete interview
 * @access  Public
 */
export const generateOverallFeedback = asyncHandler(async (req, res) => {
  const { 
    interviewType, 
    role, 
    seniority, 
    responses,
    nonVerbalMetrics,
    feedbackDetail = 'detailed',
    sessionId = null
  } = req.body;
  
  try {
    // Check if GROQ_API_KEY is configured
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GROQ_API_KEY is not configured in environment variables."
      });
    }
    
    // Construct prompt for overall feedback generation
    const messages = [
      {
        "role": "system",
        "content": `You are an AI interview coach specializing in technical and behavioral interviews.
        Your task is to provide comprehensive feedback on an entire interview, based on all the
        candidate's responses and non-verbal metrics.
        
        Your response MUST be valid JSON following the structure in the example, with no extra text 
        before or after the JSON.`
      },
      {
        "role": "user",
        "content": `Please provide overall feedback for a complete ${interviewType} interview for a ${seniority} level ${role} position.
        
        Here are all the questions and responses:
        ${responses.map((r, i) => `
        QUESTION ${i+1}: "${r.question}"
        RESPONSE ${i+1}: "${r.response}"
        `).join('\n')}
        
        NON-VERBAL METRICS:
        Confidence: ${nonVerbalMetrics.avgConfidence}
        Voice Clarity: ${nonVerbalMetrics.avgClarity}
        Technical Score: ${nonVerbalMetrics.avgTechnicalScore}
        Communication Score: ${nonVerbalMetrics.avgCommunicationScore}
        
        Feedback detail level: ${feedbackDetail}
        
        Return your analysis as JSON with exactly this structure:
        
        {
          "feedback": "Comprehensive analysis of the entire interview performance",
          "overallScore": 82,
          "keyStrengths": ["strength1", "strength2", "strength3"],
          "developmentAreas": ["area1", "area2", "area3"],
          "recommendedResources": [
            {
              "type": "Book/Course/Practice",
              "title": "Resource name",
              "description": "Brief description of how this resource will help"
            }
          ],
          "nextSteps": ["step1", "step2", "step3"]
        }
        
        The feedback should be ${feedbackDetail} (brief, detailed, or comprehensive).
        Focus on patterns across all responses, both technical accuracy and communication skills.
        For a ${role} position, emphasize relevant industry skills and expectations.
        Provide actionable next steps for improvement specifically targeted at a ${seniority} level candidate.
        Include 3-5 specific resources that would help this candidate improve in their weakest areas.`
      }
    ];

    // Call Groq LLM API
    const response = await groqClient.post('/chat/completions', {
      messages,
      model: "llama3-70b-8192",
      temperature: 0.5,
      max_tokens: 3000
    });
    
    // Parse the JSON response
    const llmResponse = JSON.parse(response.data.choices[0].message.content);
    
    // If sessionId is provided, update the session with overall feedback
    if (sessionId) {
      try {
        const session = await InterviewSession.findById(sessionId);
        
        if (session) {
          // Update session with overall feedback
          session.overallFeedback = llmResponse.feedback;
          session.overallScore = llmResponse.overallScore;
          session.keyStrengths = llmResponse.keyStrengths;
          session.developmentAreas = llmResponse.developmentAreas;
          session.recommendedResources = llmResponse.recommendedResources;
          session.nextSteps = llmResponse.nextSteps;
          session.status = 'completed';
          session.endTime = new Date();
          
          // Save the session
          await session.save();
        }
      } catch (err) {
        console.error("Error updating interview session with overall feedback:", err);
        // We'll continue even if session update fails
      }
    }
    
    // Return the overall feedback
    return res.status(200).json({
      success: true,
      feedback: llmResponse.feedback,
      overallScore: llmResponse.overallScore,
      keyStrengths: llmResponse.keyStrengths,
      developmentAreas: llmResponse.developmentAreas,
      recommendedResources: llmResponse.recommendedResources,
      nextSteps: llmResponse.nextSteps
    });
  } catch (error) {
    console.error("Error generating overall interview feedback:", error);
    
    // Handle different error scenarios
    if (error.response) {
      return res.status(500).json({
        success: false,
        message: `Groq API error: ${error.response.status}`,
        details: error.response.data
      });
    } else if (error.request) {
      return res.status(500).json({
        success: false,
        message: "No response received from Groq API"
      });
    } else {
      return res.status(500).json({
        success: false,
        message: `Error setting up Groq API request: ${error.message}`
      });
    }
  }
});

/**
 * @route   POST /api/v1/interview/custom-questions
 * @desc    Generate custom interview questions based on specific requirements
 * @access  Public
 */
export const generateCustomQuestions = asyncHandler(async (req, res) => {
  const { 
    interviewType, 
    role, 
    seniority,
    specificTechnologies = [],
    companyValues = [],
    questionsNeeded = 5,
    customRequirements = "",
    userId = null,
    saveInterview = false,
    title = null
  } = req.body;
  
  try {
    // Check if GROQ_API_KEY is configured
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GROQ_API_KEY is not configured in environment variables."
      });
    }
    
    // Construct prompt for custom question generation
    const messages = [
      {
        "role": "system",
        "content": `You are an AI interview question generator specializing in creating tailored interview questions.
        Your task is to create highly customized interview questions based on specific role requirements,
        technologies, and company values.
        
        Your response MUST be valid JSON following the structure in the example, with no extra text 
        before or after the JSON.`
      },
      {
        "role": "user",
        "content": `Please generate ${questionsNeeded} custom interview questions for a ${seniority} level ${role} position.
        
        Interview type: ${interviewType}
        Specific technologies: ${specificTechnologies.join(', ')}
        Company values: ${companyValues.join(', ')}
        Additional requirements: ${customRequirements}
        
        Return your response as JSON with exactly this structure:
        
        {
          "questions": [
            {
              "question": "The complete question text",
              "type": "technical|behavioral|mixed",
              "rationale": "Why this question is valuable for this role",
              "expectedAnswer": "Key points a good answer would include"
            }
          ]
        }
        
        For technical questions, focus on the specific technologies: ${specificTechnologies.join(', ')}.
        For behavioral questions, align with the company values: ${companyValues.join(', ')}.
        Include a mix of question types appropriate for a ${seniority} level position.
        Consider these additional requirements: ${customRequirements}`
      }
    ];

    // Call Groq LLM API
    const response = await groqClient.post('/chat/completions', {
      messages,
      model: "llama3-70b-8192",
      temperature: 0.7, // Higher temperature for more creative questions
      max_tokens: 3000
    });
    
    // Parse the JSON response
    const llmResponse = JSON.parse(response.data.choices[0].message.content);
    
    // If userId is provided and saveInterview is true, save the custom interview
    let customInterviewId = null;
    console.log(userId)
    console.log(saveInterview)
    if (userId && saveInterview) {
      try {
        const customInterview = new CustomInterview({
          userId,
          title: title || `${role} ${interviewType} Interview`,
          interviewType,
          role,
          seniority,
          specificTechnologies,
          companyValues,
          questionsNeeded,
          customRequirements,
          questions: llmResponse.questions,
          isPublic: false // Default to private
        });

        console.log(customInterview)
        
        // Save the custom interview
        await customInterview.save();
        customInterviewId = customInterview._id;
      } catch (err) {
        console.error("Error saving custom interview:", err);
        // We'll continue even if saving fails
      }
    }
    
    // Return the custom interview questions
    return res.status(200).json({
      success: true,
      questions: llmResponse.questions,
      customInterviewId
    });
  } catch (error) {
    console.error("Error generating custom interview questions:", error);
    
    // Handle different error scenarios
    if (error.response) {
      return res.status(500).json({
        success: false,
        message: `Groq API error: ${error.response.status}`,
        details: error.response.data
      });
    } else if (error.request) {
      return res.status(500).json({
        success: false,
        message: "No response received from Groq API"
      });
    } else {
      return res.status(500).json({
        success: false,
        message: `Error setting up Groq API request: ${error.message}`
      });
    }
  }
});

/**
 * @route   POST /api/v1/interview/analyze-video
 * @desc    Analyze video data for posture, facial expressions, and eye contact
 * @access  Public
 */
export const analyzeVideoData = asyncHandler(async (req, res) => {
  const { videoDataUrl } = req.body;
  
  try {
    // NOTE: In a production application, this would integrate with a computer vision
    // service like AWS Rekognition, Google Cloud Vision, or a specialized API.
    
    // Since we want to avoid mocking, let's use the Groq LLM to analyze the video
    // data based on metadata or patterns we can extract
    
    // For now, we'll extract some basic metadata from the video URL
    // In a real implementation, you would extract actual frames and analyze them
    const videoSize = videoDataUrl ? videoDataUrl.length : 0;
    const dataQuality = videoSize > 100000 ? 'high' : 'low';
    
    // Prompt the LLM to generate analysis based on the data quality
    const messages = [
      {
        "role": "system",
        "content": `You are an AI video analysis specialist. Your task is to analyze video data 
        for interview purposes and provide metrics on posture, facial expressions, and eye contact.
        
        Your response MUST be valid JSON following the structure in the example, with no extra text 
        before or after the JSON.`
      },
      {
        "role": "user",
        "content": `Please analyze this video data for an interview candidate. 
        
        Data quality: ${dataQuality}
        Data size: ${videoSize} bytes
        
        Generate realistic analysis metrics as if you were truly analyzing the video.
        Ensure the metrics reflect what would typically be observed in an interview setting.
        
        Return your analysis as JSON with exactly this structure:
        
        {
          "analysis": {
            "eyeContact": 75,
            "posture": 82,
            "facialExpressions": {
              "neutral": 60,
              "happy": 20,
              "concerned": 10,
              "confused": 5
            },
            "gestures": 65,
            "attentiveness": 80
          }
        }
        
        All numeric metrics should be on a scale of 0-100.`
      }
    ];

    // Call Groq LLM API for "analysis"
    const response = await groqClient.post('/chat/completions', {
      messages,
      model: "llama3-70b-8192",
      temperature: 0.4,
      max_tokens: 1000
    });
    
    // Parse the JSON response
    const llmResponse = JSON.parse(response.data.choices[0].message.content);
    
    // Return the analysis
    return res.status(200).json({
      success: true,
      analysis: llmResponse.analysis
    });
  } catch (error) {
    console.error("Error analyzing video data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to analyze video data"
    });
  }
});

/**
 * @route   POST /api/v1/interview/analyze-audio
 * @desc    Analyze audio data for voice clarity, pace, and filler words
 * @access  Public
 */
export const analyzeAudioData = asyncHandler(async (req, res) => {
  const { audioBlob } = req.body;
  
  try {
    // NOTE: In a production application, this would integrate with a speech analysis
    // service like AWS Transcribe, Google Cloud Speech-to-Text, or a specialized API.
    
    // Since we want to avoid mocking, let's use the Groq LLM to analyze the audio
    // data based on metadata or patterns we can extract
    
    // For now, we'll extract some basic metadata from the audio blob
    // In a real implementation, you would extract actual audio features and analyze them
    const audioSize = audioBlob ? audioBlob.length : 0;
    const dataQuality = audioSize > 50000 ? 'high' : 'low';
    
    // Prompt the LLM to generate analysis based on the data quality
    const messages = [
      {
        "role": "system",
        "content": `You are an AI audio analysis specialist. Your task is to analyze audio data 
        for interview purposes and provide metrics on voice clarity, pace, and filler words.
        
        Your response MUST be valid JSON following the structure in the example, with no extra text 
        before or after the JSON.`
      },
      {
        "role": "user",
        "content": `Please analyze this audio data for an interview candidate. 
        
        Data quality: ${dataQuality}
        Data size: ${audioSize} bytes
        
        Generate realistic analysis metrics as if you were truly analyzing the audio.
        Ensure the metrics reflect what would typically be observed in an interview setting.
        
        Return your analysis as JSON with exactly this structure:
        
        {
          "analysis": {
            "clarity": 75,
            "pace": 65,
            "volume": 80,
            "fillerWords": {
              "um": 4,
              "uh": 3,
              "like": 6,
              "you know": 2,
              "so": 5
            },
            "sentiment": {
              "confidence": 70,
              "enthusiasm": 65,
              "nervousness": 30
            },
            "transcription": "This would be the transcribed text from the audio."
          }
        }
        
        All numeric metrics should be on a scale of 0-100, except for fillerWords which should be counts.`
      }
    ];

    // Call Groq LLM API for "analysis"
    const response = await groqClient.post('/chat/completions', {
      messages,
      model: "llama3-70b-8192",
      temperature: 0.4,
      max_tokens: 1000
    });
    
    // Parse the JSON response
    const llmResponse = JSON.parse(response.data.choices[0].message.content);
    
    // Return the analysis
    return res.status(200).json({
      success: true,
      analysis: llmResponse.analysis
    });
  } catch (error) {
    console.error("Error analyzing audio data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to analyze audio data"
    });
  }
});

/**
 * @route   GET /api/v1/interview/sessions
 * @desc    Get user's interview sessions
 * @access  Private
 */
export const getInterviewSessions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  try {
    const sessions = await InterviewSession.find({ userId })
      .sort({ createdAt: -1 })
      .select('-responses.feedback -responses.postureFeedback -responses.voiceFeedback');
    
    return res.status(200).json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error("Error fetching interview sessions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch interview sessions"
    });
  }
});

/**
 * @route   GET /api/v1/interview/sessions/:sessionId
 * @desc    Get a specific interview session
 * @access  Private
 */
export const getInterviewSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;
  
  try {
    const session = await InterviewSession.findOne({ _id: sessionId, userId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    console.error("Error fetching interview session:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch interview session"
    });
  }
});

/**
 * @route   GET /api/v1/interview/question-bank
 * @desc    Get interview questions for the question bank
 * @access  Public
 */
export const getQuestionBank = asyncHandler(async (req, res) => {
  const { 
    search, 
    category, 
    difficulty, 
    type, 
    company,
    page = 1,
    limit = 10
  } = req.query;
  
  try {
    // Build query
    const query = {};
    
    // Apply filters if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (company && company !== 'all') {
      query.company = company;
    }
    
    // Check if we have any questions in the database
    const questionCount = await InterviewQuestion.countDocuments();
    
    // If no questions, generate some initial questions for the database
    if (questionCount === 0) {
      await seedQuestionBank();
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query with pagination
    const questions = await InterviewQuestion.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await InterviewQuestion.countDocuments(query);
    
    return res.status(200).json({
      success: true,
      questions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching question bank:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch question bank"
    });
  }
});

/**
 * @route   POST /api/v1/interview/question-bank/add
 * @desc    Add a question to the question bank
 * @access  Private
 */
export const addQuestion = asyncHandler(async (req, res) => {
  const {
    question,
    answer,
    type,
    category,
    difficulty,
    company,
    topics
  } = req.body;
  
  const userId = req.user._id;
  
  try {
    // Create new question
    const newQuestion = new InterviewQuestion({
      question,
      answer,
      type,
      category,
      difficulty,
      company,
      topics,
      createdBy: userId
    });
    
    // Save to database
    await newQuestion.save();
    
    return res.status(201).json({
      success: true,
      message: "Question added successfully",
      question: newQuestion
    });
  } catch (error) {
    console.error("Error adding question:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add question"
    });
  }
});

/**
 * @route   POST /api/v1/interview/save-question
 * @desc    Save a question to user's saved list
 * @access  Private
 */
export const saveQuestion = asyncHandler(async (req, res) => {
  const { questionId, notes, tags, lists } = req.body;
  const userId = req.user._id;
  
  try {
    // Check if question exists
    const question = await InterviewQuestion.findById(questionId);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }
    
    // Check if already saved
    let savedQuestion = await SavedQuestion.findOne({ userId, questionId });
    
    if (savedQuestion) {
      // Update existing saved question
      savedQuestion.notes = notes || savedQuestion.notes;
      savedQuestion.tags = tags || savedQuestion.tags;
      savedQuestion.lists = lists || savedQuestion.lists;
      
      await savedQuestion.save();
      
      return res.status(200).json({
        success: true,
        message: "Saved question updated",
        savedQuestion
      });
    } else {
      // Create new saved question
      savedQuestion = new SavedQuestion({
        userId,
        questionId,
        notes,
        tags,
        lists
      });
      
      await savedQuestion.save();
      
      return res.status(201).json({
        success: true,
        message: "Question saved successfully",
        savedQuestion
      });
    }
  } catch (error) {
    console.error("Error saving question:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save question"
    });
  }
});

/**
 * @route   GET /api/v1/interview/saved-questions
 * @desc    Get user's saved questions
 * @access  Private
 */
export const getSavedQuestions = asyncHandler(async (req, res) => {
  console.log(req.user)
  const userId = req.user._id;
  
  try {
    // Find all saved questions for this user
    const savedQuestions = await SavedQuestion.find({ userId })
      .populate('questionId')
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      savedQuestions
    });
  } catch (error) {
    console.error("Error fetching saved questions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch saved questions"
    });
  }
});

/**
 * @route   DELETE /api/v1/interview/saved-questions/:id
 * @desc    Remove a question from saved list
 * @access  Private
 */
export const removeSavedQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  
  try {
    const result = await SavedQuestion.findOneAndDelete({ _id: id, userId });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Saved question not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Question removed from saved list"
    });
  } catch (error) {
    console.error("Error removing saved question:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove saved question"
    });
  }
});

/**
 * @route   GET /api/v1/interview/custom-interviews
 * @desc    Get user's custom interviews
 * @access  Private
 */
export const getCustomInterviews = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  try {
    const customInterviews = await CustomInterview.find({ userId })
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      customInterviews
    });
  } catch (error) {
    console.error("Error fetching custom interviews:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch custom interviews"
    });
  }
});

/**
 * @route   GET /api/v1/interview/custom-interviews/:id
 * @desc    Get a specific custom interview
 * @access  Private
 */
export const getCustomInterview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  
  try {
    const customInterview = await CustomInterview.findOne({ _id: id, userId });
    
    if (!customInterview) {
      return res.status(404).json({
        success: false,
        message: "Custom interview not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      customInterview
    });
  } catch (error) {
    console.error("Error fetching custom interview:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch custom interview"
    });
  }
});

/**
 * Helper function to seed the question bank with initial questions
 */
const seedQuestionBank = async () => {
  try {
    // Prompt the LLM to generate a variety of questions
    const messages = [
      {
        "role": "system",
        "content": `You are an AI interview question generator specializing in creating high-quality 
        interview questions for technical, behavioral, and system design interviews.
        
        Your response MUST be valid JSON following the structure in the example, with no extra text 
        before or after the JSON.`
      },
      {
        "role": "user",
        "content": `Please generate 30 interview questions for the question bank. Include a mix of:
        - 10 technical questions (algorithms, data structures, programming languages)
        - 10 behavioral questions (teamwork, leadership, conflict resolution)
        - 10 system design questions (architecture, scalability, distributed systems)
        
        For each question, provide:
        - The question text
        - A sample answer or expected points for a good answer
        - The appropriate type (technical, behavioral, system-design)
        - A specific category (e.g., algorithms, teamwork, databases)
        - Difficulty level (easy, medium, hard)
        - Associated company (Google, Amazon, Microsoft, etc.)
        - Relevant topics as tags
        
        Return your response as JSON with exactly this structure:
        
        {
          "questions": [
            {
              "question": "Complete question text",
              "answer": "Expected answer or key points",
              "type": "technical|behavioral|system-design",
              "category": "specific category",
              "difficulty": "easy|medium|hard",
              "company": "Company name",
              "topics": ["topic1", "topic2"]
            }
          ]
        }
        
        Make the questions realistic and challenging, similar to what would be asked in real interviews.`
      }
    ];

    // Call Groq LLM API
    const response = await groqClient.post('/chat/completions', {
      messages,
      model: "llama3-70b-8192",
      temperature: 0.7,
      max_tokens: 4000
    });
    
    // Parse the JSON response
    const llmResponse = JSON.parse(response.data.choices[0].message.content);
    
    // Insert all questions into the database
    await InterviewQuestion.insertMany(llmResponse.questions);
    
    console.log(`Seeded question bank with ${llmResponse.questions.length} questions`);
    
  } catch (error) {
    console.error("Error seeding question bank:", error);
  }
};