
// api/eventsApi.js
import api from './index';

/**
 * Fetches events from the API
 * 
 * @param {Object} filters - Optional filters to apply
 * @returns {Array} - Array of event objects
 */
export const fetchEvents = async (filters = {}) => {
  try {
    // In a real app, this would call the actual API with filters
    // const response = await api.get('/events', { params: filters });
    // return response.data;
    
    // For demo purposes, return mock data
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Current date for relative date calculations
    const currentDate = new Date();
    
    // Mock event data
    const events = [
      {
        id: 1,
        title: 'Women in Tech Leadership Summit',
        description: 'Join industry leaders for a day of inspiration, learning, and networking. This summit features keynote speakers, panel discussions, and workshops focused on advancing women in technology leadership roles.',
        date: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        location: 'Taj Bangalore, MG Road',
        virtual: false,
        category: 'Conference',
        image: 'https://picsum.photos/id/3/400/200',
        registrationUrl: 'https://example.com/events/register/1',
        price: '₹2,000',
        speakers: [
          { name: 'Priya Sharma', role: 'CTO, TechInnovate', image: 'https://randomuser.me/api/portraits/women/11.jpg' },
          { name: 'Anita Desai', role: 'VP Engineering, GlobalTech', image: 'https://randomuser.me/api/portraits/women/12.jpg' }
        ]
      },
      {
        id: 2,
        title: 'Returning to Work: Strategies for Success',
        description: 'This virtual workshop is designed for women returning to the workforce after a career break. Learn practical strategies for updating your skills, rebuilding confidence, navigating the job market, and successfully transitioning back to professional life.',
        date: new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        location: 'Online',
        virtual: true,
        category: 'Workshop',
        image: 'https://picsum.photos/id/96/400/200',
        registrationUrl: 'https://example.com/events/register/2',
        price: 'Free',
        speakers: [
          { name: 'Meera Kapoor', role: 'Career Coach', image: 'https://randomuser.me/api/portraits/women/13.jpg' }
        ]
      },
      {
        id: 3,
        title: 'Financial Planning for Career Transitions',
        description: 'Learn essential financial planning strategies to support your career transitions, whether you\'re changing industries, starting a business, or taking time off. This webinar covers budgeting, saving, investing, and managing financial risks.',
        date: new Date(currentDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        location: 'Online',
        virtual: true,
        category: 'Webinar',
        image: 'https://picsum.photos/id/20/400/200',
        registrationUrl: 'https://example.com/events/register/3',
        price: 'Free',
        speakers: [
          { name: 'Neha Singh', role: 'Financial Advisor', image: 'https://randomuser.me/api/portraits/women/14.jpg' }
        ]
      }
    ];
    
    // Apply filters if provided
    let filteredEvents = [...events];
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filteredEvents = filteredEvents.filter(event => 
        event.title.toLowerCase().includes(search) ||
        event.description.toLowerCase().includes(search)
      );
    }
    
    if (filters.category) {
      filteredEvents = filteredEvents.filter(event => 
        event.category.toLowerCase() === filters.category.toLowerCase()
      );
    }
    
    if (filters.virtual !== undefined) {
      filteredEvents = filteredEvents.filter(event => 
        event.virtual === filters.virtual
      );
    }
    
    // Sort by date (closest first)
    filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return filteredEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events. Please try again.');
  }
};