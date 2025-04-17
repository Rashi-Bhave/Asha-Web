// Placeholder content for jobsApi.js
import api from './index';

/**
 * Fetches jobs from the API
 * 
 * @param {Object} filters - Optional filters to apply
 * @returns {Array} - Array of job objects
 */
export const fetchJobs = async (filters = {}) => {
  try {
    // In a real app, this would call the actual API with filters
    // const response = await api.get('/jobs', { params: filters });
    // return response.data;
    
    // For demo purposes, return mock data
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock job data
    const jobs = [
      {
        id: 1,
        title: 'Senior Software Engineer',
        company: 'TechCorp Solutions',
        location: 'Remote',
        type: 'Full-time',
        salary: '₹20L - ₹30L per annum',
        description: 'We are looking for an experienced software engineer to join our team. You will be responsible for developing high-quality applications, collaborating with cross-functional teams, and mentoring junior developers.',
        postedDate: new Date('2024-04-10').toISOString(),
        applyUrl: 'https://example.com/apply/1',
        logo: 'https://randomuser.me/api/portraits/men/1.jpg',
        skills: ['JavaScript', 'React', 'Node.js', 'AWS'],
        experienceLevel: 'Senior Level',
        industry: 'Technology',
      },
      {
        id: 2,
        title: 'Marketing Manager',
        company: 'Brand Innovators',
        location: 'Bangalore',
        type: 'Full-time',
        salary: '₹15L - ₹20L per annum',
        description: 'Join our dynamic marketing team to drive brand growth and engagement. You will develop marketing strategies, manage campaigns, analyze performance metrics, and collaborate with creative teams.',
        postedDate: new Date('2024-04-08').toISOString(),
        applyUrl: 'https://example.com/apply/2',
        logo: 'https://randomuser.me/api/portraits/women/2.jpg',
        skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics'],
        experienceLevel: 'Mid Level',
        industry: 'Marketing & Advertising',
      },
      {
        id: 3,
        title: 'UX/UI Designer',
        company: 'Creative Solutions Inc',
        location: 'Hybrid - Mumbai',
        type: 'Full-time',
        salary: '₹12L - ₹18L per annum',
        description: 'Create exceptional user experiences for our digital products. You will conduct user research, create wireframes, design visually appealing interfaces, and collaborate with developers to implement your designs.',
        postedDate: new Date('2024-04-05').toISOString(),
        applyUrl: 'https://example.com/apply/3',
        logo: 'https://randomuser.me/api/portraits/women/3.jpg',
        skills: ['UI Design', 'UX Research', 'Figma', 'Adobe Creative Suite'],
        experienceLevel: 'Mid Level',
        industry: 'Design',
      },
      {
        id: 4,
        title: 'Data Analyst',
        company: 'DataWise Analytics',
        location: 'Remote',
        type: 'Full-time',
        salary: '₹10L - ₹15L per annum',
        description: 'Turn data into actionable insights for our organization. You will collect, process, and analyze data, create visualizations, and present findings to stakeholders to drive business decisions.',
        postedDate: new Date('2024-04-12').toISOString(),
        applyUrl: 'https://example.com/apply/4',
        logo: 'https://randomuser.me/api/portraits/women/4.jpg',
        skills: ['SQL', 'Python', 'Data Visualization', 'Statistical Analysis'],
        experienceLevel: 'Entry Level',
        industry: 'Data & Analytics',
      },
      {
        id: 5,
        title: 'Product Manager',
        company: 'InnovateTech',
        location: 'Hybrid - Delhi',
        type: 'Full-time',
        salary: '₹18L - ₹25L per annum',
        description: 'Lead the development of innovative products that solve real customer problems. You will define product vision, create roadmaps, prioritize features, and work with engineering, design, and marketing teams.',
        postedDate: new Date('2024-04-07').toISOString(),
        applyUrl: 'https://example.com/apply/5',
        logo: 'https://randomuser.me/api/portraits/men/5.jpg',
        skills: ['Product Management', 'Agile', 'User Stories', 'Market Research'],
        experienceLevel: 'Mid Level',
        industry: 'Technology',
      }
    ];
    
    // Apply filters if provided
    let filteredJobs = [...jobs];
    
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filteredJobs = filteredJobs.filter((job) => 
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)
      );
    }
    
    if (filters.location) {
      filteredJobs = filteredJobs.filter((job) => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.type) {
      filteredJobs = filteredJobs.filter((job) => 
        job.type.toLowerCase() === filters.type.toLowerCase()
      );
    }
    
    if (filters.experienceLevel) {
      filteredJobs = filteredJobs.filter((job) => 
        job.experienceLevel.toLowerCase() === filters.experienceLevel.toLowerCase()
      );
    }
    
    return filteredJobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw new Error('Failed to fetch jobs. Please try again.');
  }
};