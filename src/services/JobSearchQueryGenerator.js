import axios from 'axios';

/**
 * Service for generating optimized job search queries using LLM
 */
class JobSearchQueryGenerator {
  // Groq API Key (in a real app, use environment variables)
  static GROQ_API_KEY = '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';
  
  /**
   * Generates an optimized job search query using LLM
   * 
   * @param {string} basicQuery - User's basic search query (e.g., "Software Engineer")
   * @param {Object} userProfile - User's profile data for context
   * @returns {Promise<string>} - Enhanced search query
   */
  static async generateQuery(basicQuery, userProfile = {}) {
    try {
      // Extract useful information from user profile
      const {
        experience = '',
        skills = [],
        education = '',
        location = '',
        preferredWorkType = '', // 'remote', 'hybrid', 'on-site'
        preferredIndustries = [],
        jobTitle = '',
        previousRoles = []
      } = userProfile;
      
      console.log('Generating search query with LLM for:', basicQuery);
      console.log('User profile context:', { 
        experience, 
        skills: skills.length, 
        location, 
        preferredWorkType 
      });
      
      // Create prompt for the LLM
      const messages = [
        {
          "role": "system",
          "content": `You are an expert job search assistant that creates optimized Google search queries. 
          Your task is to generate a detailed search query that will help users find relevant job listings.
          The query should incorporate their job search terms, experience level, skills, and preferences to ensure 
          highly relevant results appear in Google's job search results.`
        },
        {
          "role": "user",
          "content": `Create an optimized Google search query for job listings based on this information:
          
          Basic job search: ${basicQuery}
          Years of experience: ${experience}
          Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}
          Current/previous job titles: ${jobTitle || previousRoles.join(', ') || 'Not specified'}
          Education: ${education || 'Not specified'}
          Location preference: ${location || 'Any'}
          Work type preference: ${preferredWorkType || 'Any'}
          Preferred industries: ${Array.isArray(preferredIndustries) ? preferredIndustries.join(', ') : preferredIndustries || 'Any'}
          
          Return ONLY the search query text with no explanations, quotation marks, or additional text. 
          Make sure to include terms like "job", "career", "hiring" to ensure job listings show up.
          Limit the query to a reasonable length that would work well in a Google search.`
        }
      ];
      
      // Make the API call to Groq's LLM
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          messages,
          model: "llama-3.1-8b-instant", // Using a smaller, faster model for query generation
          temperature: 0.4, // Lower temperature for more focused outputs
          max_tokens: 150, // Limiting token count since we only need a search query
        },
        {
          headers: {
            'Authorization': `Bearer ${this.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Extract and clean the generated query
      let generatedQuery = response.data.choices[0].message.content.trim();
      
      // Remove any quotation marks or unnecessary formatting
      generatedQuery = generatedQuery.replace(/^["']|["']$/g, '');
      
      console.log('LLM generated query:', generatedQuery);
      
      // If the LLM failed to generate a query, fallback to a basic enhanced query
      if (!generatedQuery) {
        generatedQuery = this.createBasicEnhancedQuery(basicQuery, userProfile);
      }
      
      return generatedQuery;
    } catch (error) {
      console.error('Error generating search query with LLM:', error);
      
      // Fallback to a basic enhanced query if LLM fails
      return this.createBasicEnhancedQuery(basicQuery, userProfile);
    }
  }
  
  /**
   * Creates a basic enhanced query without using LLM (fallback)
   * 
   * @param {string} basicQuery - User's basic search query
   * @param {Object} userProfile - User's profile data
   * @returns {string} - Basic enhanced query
   */
  static createBasicEnhancedQuery(basicQuery, userProfile = {}) {
    const {
      experience = '',
      location = '',
      preferredWorkType = ''
    } = userProfile;
    
    let enhancedQuery = basicQuery;
    
    // Add "jobs" if not already in the query
    if (!enhancedQuery.toLowerCase().includes('job') && 
        !enhancedQuery.toLowerCase().includes('career') &&
        !enhancedQuery.toLowerCase().includes('hiring')) {
      enhancedQuery += ' jobs';
    }
    
    // Add experience level if available
    if (experience) {
      let experienceLevel = '';
      const expYears = parseInt(experience);
      
      if (expYears >= 0 && expYears <= 2) {
        experienceLevel = 'entry level';
      } else if (expYears >= 3 && expYears <= 5) {
        experienceLevel = 'mid level';
      } else if (expYears > 5) {
        experienceLevel = 'senior';
      }
      
      if (experienceLevel && !enhancedQuery.toLowerCase().includes(experienceLevel)) {
        enhancedQuery += ` ${experienceLevel}`;
      }
    }
    
    // Add location if available
    if (location && !enhancedQuery.toLowerCase().includes(location.toLowerCase())) {
      enhancedQuery += ` in ${location}`;
    }
    
    // Add work type preference if available
    if (preferredWorkType && 
        !enhancedQuery.toLowerCase().includes(preferredWorkType.toLowerCase())) {
      enhancedQuery += ` ${preferredWorkType}`;
    }
    
    console.log('Generated basic enhanced query:', enhancedQuery);
    return enhancedQuery;
  }
}

export default JobSearchQueryGenerator;