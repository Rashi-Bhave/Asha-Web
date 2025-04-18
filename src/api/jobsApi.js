// src/api/jobsApi.js
import axios from 'axios';
import api from './index';

// Adzuna API credentials
// Note: In a production environment, these should be environment variables
const ADZUNA_APP_ID = '0fe0ceef'; 
const ADZUNA_API_KEY = '57c6062c92b59ed17b32aec4e2e83b8f'; 

// Base URL for Adzuna API
const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api';

/**
 * Fetches jobs from the Adzuna API
 * 
 * @param {Object} filters - Optional filters to apply
 * @returns {Array} - Array of job objects
 */
export const fetchJobs = async (filters = {}) => {
  try {
    // If API keys are not set, use mock data (for development/demo)
    if (!ADZUNA_APP_ID || ADZUNA_APP_ID === 'YOUR_APP_ID' || !ADZUNA_API_KEY || ADZUNA_API_KEY === 'YOUR_API_KEY') {
      console.warn('Adzuna API credentials not set. Using mock data instead.');
      return fetchMockJobs(filters);
    }

    console.log('Fetching jobs from Adzuna API with filters:', filters);

    // Set up query parameters for the API call
    const params = {
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_API_KEY,
      results_per_page: 10, // Number of results to return per page
      content_type: 'application/json' // Explicitly request JSON response
    };

    // Add search query if provided
    if (filters.search) {
      params.what = filters.search; // Job title, keywords, or company name
    }

    // Add location if provided
    if (filters.location) {
      params.where = filters.location;
    }

    // Add job type filters if provided
    if (filters.type) {
      if (filters.type === 'Full-time') params.full_time = 1;
      if (filters.type === 'Part-time') params.part_time = 1;
      if (filters.type === 'Contract') params.contract = 1;
    }

    // Use 'gb' (Great Britain) as the default country code
    // In a production app, this could be configurable or based on user's location
    const countryCode = 'gb';
    
    console.log(`Calling Adzuna API: ${ADZUNA_BASE_URL}/jobs/${countryCode}/search/1`);

    // Make the API call to Adzuna with the correct URL format
    const response = await axios.get(`${ADZUNA_BASE_URL}/jobs/${countryCode}/search/1`, { 
      params,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('Adzuna API response received:', response.status);
    
    if (response.data && response.data.results) {
      // Transform the response data to match our job structure
      const jobs = response.data.results.map(job => transformAdzunaJob(job));
      return jobs;
    } else {
      console.warn('Unexpected response format from Adzuna API, falling back to mock data');
      return fetchMockJobs(filters);
    }
  } catch (error) {
    console.error('Error fetching jobs from Adzuna:', error);
    // Show more detailed error information
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    // Fallback to mock data if API call fails
    return fetchMockJobs(filters);
  }
};

/**
 * Transform Adzuna job data to match our application's structure
 * 
 * @param {Object} adzunaJob - Job data from Adzuna API
 * @returns {Object} - Transformed job object
 */
const transformAdzunaJob = (adzunaJob) => {
  return {
    id: adzunaJob.id,
    title: adzunaJob.title || 'No Title Available',
    company: adzunaJob.company?.display_name || 'Company Not Specified',
    location: adzunaJob.location?.display_name || 'Location Not Specified',
    type: adzunaJob.contract_time || 'Full-time',
    salary: (adzunaJob.salary_min && adzunaJob.salary_max) 
      ? `${adzunaJob.salary_min} - ${adzunaJob.salary_max} ${adzunaJob.salary_currency || ''}`
      : 'Salary not specified',
    description: adzunaJob.description || 'No description available',
    postedDate: adzunaJob.created ? new Date(adzunaJob.created).toISOString() : new Date().toISOString(),
    applyUrl: adzunaJob.redirect_url || '#',
    logo: 'https://via.placeholder.com/50', // Adzuna doesn't provide company logos
    skills: extractSkillsFromDescription(adzunaJob.description || ''),
    experienceLevel: determineExperienceLevel(adzunaJob.title || '', adzunaJob.description || ''),
    industry: adzunaJob.category?.label || 'Not specified',
  };
};

/**
 * Extract skills from job description using keyword matching
 * 
 * @param {string} description - Job description
 * @returns {Array} - Array of skills
 */
const extractSkillsFromDescription = (description) => {
  if (!description) return [];
  
  // Common technology skills to look for
  const skillKeywords = [
    'JavaScript', 'React', 'Vue', 'Angular', 'Node.js', 'Express', 'MongoDB', 'SQL',
    'Python', 'Java', 'C#', 'PHP', 'Ruby', 'C++', 'Swift', 'Kotlin', 'Go', 'Rust',
    'HTML', 'CSS', 'SASS', 'LESS', 'Bootstrap', 'Tailwind', 'jQuery', 'TypeScript',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git',
    'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence', 'Slack', 'Trello',
    'Data Analysis', 'Machine Learning', 'AI', 'Deep Learning', 'TensorFlow', 'PyTorch',
    'Leadership', 'Communication', 'Project Management', 'Team Management', 'Critical Thinking',
    'Marketing', 'SEO', 'SEM', 'Content Marketing', 'Social Media Marketing',
    'Sales', 'Business Development', 'Account Management', 'Customer Service',
    'Finance', 'Accounting', 'Budgeting', 'Financial Analysis', 'Excel', 'PowerPoint', 'Word'
  ];
  
  // Extract skills from description
  const foundSkills = [];
  skillKeywords.forEach(skill => {
    if (description.toLowerCase().includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  
  // Limit to 5 skills
  return foundSkills.slice(0, 5);
};

/**
 * Determine experience level from job title and description
 * 
 * @param {string} title - Job title
 * @param {string} description - Job description
 * @returns {string} - Experience level
 */
const determineExperienceLevel = (title, description) => {
  const combinedText = `${title} ${description}`.toLowerCase();
  
  // Check for keywords indicating experience level
  if (combinedText.includes('senior') || combinedText.includes('sr.') || 
      combinedText.includes('lead') || combinedText.includes('principal') ||
      combinedText.includes('manager') || combinedText.includes('head') ||
      combinedText.includes('director') || combinedText.includes('chief') ||
      combinedText.includes('vp') || combinedText.includes('vice president')) {
    return 'Senior Level';
  } else if (combinedText.includes('junior') || combinedText.includes('jr.') ||
            combinedText.includes('entry') || combinedText.includes('graduate') ||
            combinedText.includes('trainee') || combinedText.includes('intern')) {
    return 'Entry Level';
  } else {
    return 'Mid Level';
  }
};

/**
 * Fetch mock job data (fallback when API is not available)
 * 
 * @param {Object} filters - Optional filters to apply
 * @returns {Array} - Array of job objects
 */
const fetchMockJobs = async (filters = {}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Get current date for relative date calculations
  const currentDate = new Date();
  
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
      postedDate: new Date(currentDate.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
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
      postedDate: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
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
      postedDate: new Date(currentDate.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
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
      postedDate: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
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
      postedDate: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      applyUrl: 'https://example.com/apply/5',
      logo: 'https://randomuser.me/api/portraits/men/5.jpg',
      skills: ['Product Management', 'Agile', 'User Stories', 'Market Research'],
      experienceLevel: 'Mid Level',
      industry: 'Technology',
    },
    {
      id: 6,
      title: 'Frontend Developer',
      company: 'WebTech Solutions',
      location: 'Remote',
      type: 'Full-time',
      salary: '₹12L - ₹18L per annum',
      description: 'Join our team to build stunning web interfaces. You will work with design teams to implement responsive, accessible, and performant user interfaces using modern frontend technologies.',
      postedDate: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      applyUrl: 'https://example.com/apply/6',
      logo: 'https://randomuser.me/api/portraits/men/6.jpg',
      skills: ['React', 'JavaScript', 'CSS', 'HTML', 'Redux'],
      experienceLevel: 'Mid Level',
      industry: 'Technology',
    },
    {
      id: 7,
      title: 'Human Resources Manager',
      company: 'Global Enterprises',
      location: 'Mumbai',
      type: 'Full-time',
      salary: '₹15L - ₹20L per annum',
      description: 'Oversee all aspects of human resources management. You will develop HR strategies, manage recruitment, handle employee relations, implement training programs, and ensure compliance with labor laws.',
      postedDate: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      applyUrl: 'https://example.com/apply/7',
      logo: 'https://randomuser.me/api/portraits/women/7.jpg',
      skills: ['Recruitment', 'Employee Relations', 'Training', 'Labor Laws'],
      experienceLevel: 'Senior Level',
      industry: 'Human Resources',
    },
    {
      id: 8,
      title: 'Financial Analyst',
      company: 'Financial Insights Ltd',
      location: 'Bangalore',
      type: 'Full-time',
      salary: '₹12L - ₹18L per annum',
      description: 'Analyze financial data to guide business decisions. You will prepare financial reports, create forecasts, analyze market trends, and make recommendations to improve financial performance.',
      postedDate: new Date(currentDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      applyUrl: 'https://example.com/apply/8',
      logo: 'https://randomuser.me/api/portraits/men/8.jpg',
      skills: ['Financial Modeling', 'Excel', 'Data Analysis', 'Reporting'],
      experienceLevel: 'Mid Level',
      industry: 'Finance',
    },
    {
      id: 9,
      title: 'DevOps Engineer',
      company: 'Cloud Solutions Inc',
      location: 'Remote',
      type: 'Full-time',
      salary: '₹18L - ₹25L per annum',
      description: 'Streamline our development and operations processes. You will implement CI/CD pipelines, manage cloud infrastructure, optimize system performance, and ensure high availability of our applications.',
      postedDate: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      applyUrl: 'https://example.com/apply/9',
      logo: 'https://randomuser.me/api/portraits/men/9.jpg',
      skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
      experienceLevel: 'Mid Level',
      industry: 'Technology',
    },
    {
      id: 10,
      title: 'Content Writer',
      company: 'Digital Media Hub',
      location: 'Remote',
      type: 'Contract',
      salary: '₹50K - ₹70K per month',
      description: 'Create engaging content for our digital platforms. You will research topics, write articles, blog posts, and social media content, and collaborate with editors to ensure high-quality publications.',
      postedDate: new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
      applyUrl: 'https://example.com/apply/10',
      logo: 'https://randomuser.me/api/portraits/women/10.jpg',
      skills: ['Content Writing', 'SEO', 'Research', 'Editing'],
      experienceLevel: 'Entry Level',
      industry: 'Media & Communications',
    }
  ];
  
  console.log('Using mock job data with filters:', filters);
  
  // Apply filters if provided
  let filteredJobs = [...jobs];
  
  if (filters.search) {
    const query = filters.search.toLowerCase();
    filteredJobs = filteredJobs.filter((job) => 
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.skills.some(skill => skill.toLowerCase().includes(query))
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

  if (filters.industry) {
    filteredJobs = filteredJobs.filter((job) => 
      job.industry.toLowerCase().includes(filters.industry.toLowerCase())
    );
  }
  
  return filteredJobs;
};

// Export the functions
export default {
  fetchJobs
};