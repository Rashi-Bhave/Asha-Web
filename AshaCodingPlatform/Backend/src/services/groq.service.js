import axios from 'axios';

// Create a dedicated axios instance for Groq API calls
const groqClient = axios.create({
  baseURL: 'https://api.groq.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
  }
});

/**
 * Get career recommendations from Groq LLM
 * @param {Object} userData - User data for personalized recommendations
 * @param {string} userData.career - User's current or desired career path
 * @param {string} userData.phase - Career phase (early, mid, senior)
 * @param {Array} userData.skills - User's current skills
 * @param {Array} userData.interests - User's career interests
 * @param {Array} userData.goals - User's career goals
 * @returns {Promise<Object>} - Personalized career recommendations
 */
export const getCareerRecommendations = async (userData) => {
  try {
    const messages = [
      {
        "role": "system",
        "content": `You are a career development expert specializing in tech careers for women. 
        Your task is to create personalized career advancement recommendations based on the user's 
        career path, current phase, skills, interests, and goals. Provide specific, actionable advice 
        that will help them advance to the next level in their career.
        
        Your response MUST be valid JSON following the structure in the example, with no extra text 
        before or after the JSON.`
      },
      {
        "role": "user",
        "content": `Please create personalized career recommendations based on these details:
        
        Career: ${userData.career}
        Career Phase: ${userData.phase}
        Current Skills: ${userData.skills.join(', ')}
        Interests: ${userData.interests.join(', ')}
        Career Goals: ${userData.goals.join(', ')}
        
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
                    "link": "Resource link",
                    "duration": "Duration (if applicable)"
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
        
        Focus on recommendations that are particularly valuable for women in tech, potentially including 
        communities, mentorship opportunities, and strategies for navigating challenges that women commonly 
        face in the industry.`
      }
    ];

    // Make request to Groq
    const response = await groqClient.post('/chat/completions', {
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1500
    });
    
    // Parse the JSON response
    const llmResponse = JSON.parse(response.data.choices[0].message.content);
    return llmResponse;
    
  } catch (error) {
    console.error("Error getting career recommendations from Groq:", error);
    throw error;
  }
};

/**
 * Get similar career stories from Groq LLM
 * @param {Object} userData - User data for finding similar stories
 * @returns {Promise<Object>} - Similar career stories and advice
 */
export const getCareerStories = async (userData) => {
  try {
    const messages = [
      {
        "role": "system",
        "content": `You are a career development expert specializing in tech careers for women. 
        Your task is to provide inspiring stories of women with similar career paths to the user.
        
        Your response MUST be valid JSON following the structure in the example, with no extra text 
        before or after the JSON.`
      },
      {
        "role": "user",
        "content": `Please provide stories of women with similar career paths based on these details:
        
        Career: ${userData.career}
        Career Phase: ${userData.phase}
        
        Return your response as JSON with exactly this structure:
        
        {
          "careerStories": [
            {
              "name": "Woman's name",
              "story": "Her career journey and challenges",
              "advice": "Key advice for others in similar positions"
            }
          ]
        }
        
        Provide realistic, detailed stories that highlight both challenges and strategies used to overcome them.
        Focus on diverse backgrounds and experiences, and include practical advice that readers can apply to their
        own careers.`
      }
    ];

    // Make request to Groq
    const response = await groqClient.post('/chat/completions', {
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1500
    });
    
    // Parse the JSON response
    const llmResponse = JSON.parse(response.data.choices[0].message.content);
    return llmResponse;
    
  } catch (error) {
    console.error("Error getting career stories from Groq:", error);
    throw error;
  }
};