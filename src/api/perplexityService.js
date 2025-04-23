// src/api/perplexityService.js
import axios from 'axios';

/**
 * Service for interacting with the Perplexity API
 */
class PerplexityService {
  // This would be in an environment variable in a real application
  static API_KEY = "YOUR_PERPLEXITY_API_KEY";
  static BASE_URL = "https://api.perplexity.ai/chat/completions";

  /**
   * Searches for events using the Perplexity API
   *
   * @param {Object} options - Search options
   * @param {string} options.location - Location to search in
   * @param {Array} options.eventTypes - Types of events to search for
   * @param {boolean} options.forWomen - Whether to search for women-specific events
   * @param {string} options.profile - Profile or topic of interest
   * @returns {Promise<Array>} - Array of event objects
   */
  static async searchEvents({
    location = "Bangalore",
    eventTypes = ["Meetups", "Hackathons"],
    forWomen = true,
    profile = ""
  } = {}) {
    try {
      // Construct the prompt based on filters
      const eventTypesText = eventTypes.length > 0 
        ? eventTypes.join(" and ") 
        : "Meetups, Webinars, Hackathons, and Community Connects";

      const womenSpecific = forWomen ? " for women" : "";
      
      const profileText = profile ? ` related to ${profile}` : "";
      
      const prompt = `Search upcoming ${eventTypesText} in ${location}${womenSpecific}${profileText}`;
      
      console.log("Searching with prompt:", prompt);

      // Prepare the request to Perplexity API
      const response = await axios.post(
        this.BASE_URL,
        {
          model: "sonar-pro",
          messages: [
            {
              role: "system",
              content: "You are an AI assistant tasked with retrieving information about upcoming events, meetups, and hackathons. Format your response as a JSON array with the following structure for each event: {title, description, date, location, type, website, organizer, isVirtual, price, imageUrl}. Ensure all events are current and have not already passed. Include at least 5-10 results if available."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.2
        },
        {
          headers: {
            "Authorization": `Bearer ${this.API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      // Parse the response
      const content = response.data.choices[0].message.content;
      return this.parseEventsFromResponse(content);
    } catch (error) {
      console.error("Error searching events with Perplexity:", error);
      throw new Error("Failed to search for events. Please try again later.");
    }
  }

  /**
   * Parses events from the Perplexity response
   *
   * @param {string} content - Response content
   * @returns {Array} - Array of parsed event objects
   */
  static parseEventsFromResponse(content) {
    try {
      // Import the parser utility
      const { parsePerplexityResponse } = require('../utils/perplexityResponseParser');
      return parsePerplexityResponse(content);
    } catch (error) {
      console.error("Error parsing events from Perplexity response:", error);
      console.log("Raw content:", content);
      return [];
    }
  }

  /**
   * Fallback method to get mock events when API fails
   *
   * @param {Object} options - Search options
   * @returns {Array} - Array of mock event objects
   */
  static getMockEvents(options = {}) {
    const currentDate = new Date();
    
    return [
      {
        id: 1,
        title: `Women in Tech ${options.profile || 'Leadership'} Summit`,
        description: `Join industry leaders for a day of inspiration, learning, and networking. This summit features keynote speakers, panel discussions, and workshops focused on advancing women in ${options.profile || 'technology'} roles.`,
        date: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: `Taj ${options.location || 'Bangalore'}, MG Road`,
        virtual: false,
        category: 'Conference',
        image: 'https://picsum.photos/id/3/400/200',
        registrationUrl: 'https://example.com/events/register/1',
        price: '₹2,000',
        organizer: 'Women in Tech Foundation'
      },
      {
        id: 2,
        title: `${options.profile || 'Tech'} Workshop for Women Professionals`,
        description: `This virtual workshop is designed for women returning to the workforce after a career break. Learn practical strategies for updating your skills, rebuilding confidence, navigating the job market, and successfully transitioning back to professional life.`,
        date: new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Online',
        virtual: true,
        category: 'Workshop',
        image: 'https://picsum.photos/id/96/400/200',
        registrationUrl: 'https://example.com/events/register/2',
        price: 'Free',
        organizer: 'Career Restart Initiative'
      },
      {
        id: 3,
        title: `Women's Hackathon: Building for ${options.profile || 'Social Impact'}`,
        description: `A 48-hour hackathon where women developers, designers, and product managers come together to build solutions for ${options.profile || 'social impact'}. Network with peers, learn new skills, and win exciting prizes!`,
        date: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        location: options.location || 'Bangalore',
        virtual: false,
        category: 'Hackathon',
        image: 'https://picsum.photos/id/20/400/200',
        registrationUrl: 'https://example.com/events/register/3',
        price: 'Free',
        organizer: 'TechWomen Community'
      }
    ];
  }
}

export default PerplexityService;