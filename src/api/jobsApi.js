// src/api/jobsApi.js
import axios from 'axios';

// RapidAPI credentials
const JSEARCH_API_KEY = 'd74d0dd574mshdff9d071b829b95p1201bcjsn0003797587f6';
const JSEARCH_API_HOST = 'jsearch.p.rapidapi.com';

/**
 * Fetches jobs from the JSearch API (RapidAPI)
 * 
 * @param {Object} filters - Optional filters to apply
 * @returns {Array} - Array of job objects
 */
export const fetchJobs = async (filters = {}) => {
  try {
    console.log('Fetching jobs with filters:', filters);
    
    // Set up RapidAPI request for the search endpoint
    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search',
      params: {
        query: (filters.search || 'all jobs') + (filters.location ? ` in ${filters.location}` : ' in Bangalore'),
        page: '1',
        num_pages: '1'
      },
      headers: {
        'X-RapidAPI-Key': JSEARCH_API_KEY,
        'X-RapidAPI-Host': JSEARCH_API_HOST
      }
    };

    console.log('Making API request with options:', options);
    
    const response = await axios.request(options);
    console.log('API response received:', response.data);
    
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // Transform the response data to match our job structure
      const jobs = response.data.data.map(job => transformJSearchJob(job));
      console.log('Transformed jobs:', jobs.length);
      return jobs;
    } else {
      console.warn('API returned unexpected format:', response.data);
      return fetchMockJobs(filters);
    }
  } catch (error) {
    console.error('Error fetching jobs from RapidAPI:', error.response || error);
    // Fallback to mock data if API call fails
    return fetchMockJobs(filters);
  }
};

/**
 * Transform JSearch job data to match our application's structure
 * 
 * @param {Object} jSearchJob - Job data from JSearch API
 * @returns {Object} - Transformed job object
 */
const transformJSearchJob = (jSearchJob) => {
  // Extract skills from job description
  const skillsList = extractSkillsFromDescription(jSearchJob.job_description || '');
  
  // Calculate posting date
  const postedDate = jSearchJob.job_posted_at_datetime_utc 
    ? new Date(jSearchJob.job_posted_at_datetime_utc).toISOString() 
    : new Date().toISOString();
  
  // Determine experience level
  let experienceLevel = 'Not specified';
  if (jSearchJob.job_required_experience) {
    const months = jSearchJob.job_required_experience.required_experience_in_months;
    experienceLevel = convertMonthsToExperienceLevel(months);
  } else if (jSearchJob.job_title) {
    experienceLevel = determineExperienceLevel(jSearchJob.job_title, jSearchJob.job_description || '');
  }

  // Format salary information
  let salary = 'Salary not specified';
  if (jSearchJob.job_min_salary && jSearchJob.job_max_salary) {
    const currency = jSearchJob.job_salary_currency || 'USD';
    const formattedMin = formatSalary(jSearchJob.job_min_salary, currency);
    const formattedMax = formatSalary(jSearchJob.job_max_salary, currency);
    salary = `${formattedMin} - ${formattedMax} ${getLocalCurrency(currency)}`;
  }

  return {
    id: jSearchJob.job_id || `job-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    title: jSearchJob.job_title || 'Job Title Not Available',
    company: jSearchJob.employer_name || 'Company Not Specified',
    location: formatLocation(jSearchJob),
    type: formatEmploymentType(jSearchJob.job_employment_type),
    salary: salary,
    description: jSearchJob.job_description || 'No description available',
    postedDate: postedDate,
    applyUrl: jSearchJob.job_apply_link || '#',
    logo: jSearchJob.employer_logo || 'https://via.placeholder.com/50',
    skills: skillsList,
    experienceLevel: experienceLevel,
    industry: jSearchJob.job_job_category || 'Not specified',
    remoteJob: jSearchJob.job_is_remote || false
  };
};

/**
 * Format the location from JSearch API response
 */
const formatLocation = (jSearchJob) => {
  let location = '';
  
  if (jSearchJob.job_city) {
    location = jSearchJob.job_city;
  }
  
  if (jSearchJob.job_state) {
    location += location ? `, ${jSearchJob.job_state}` : jSearchJob.job_state;
  }
  
  if (jSearchJob.job_country) {
    location += location ? `, ${jSearchJob.job_country}` : jSearchJob.job_country;
  }
  
  if (!location && jSearchJob.job_is_remote) {
    location = 'Remote';
  } else if (!location) {
    location = 'Location Not Specified';
  }
  
  return location;
};

/**
 * Format employment type from JSearch API
 */
const formatEmploymentType = (type) => {
  if (!type) return 'Full-time';
  
  // Map API types to our display types
  const typeMap = {
    'FULLTIME': 'Full-time',
    'PARTTIME': 'Part-time',
    'CONTRACTOR': 'Contract',
    'INTERN': 'Internship'
  };
  
  return typeMap[type.toUpperCase()] || type;
};

/**
 * Format salary number with appropriate formatting
 */
const formatSalary = (amount, currency) => {
  if (!amount) return '';
  
  // Format for INR (₹)
  if (currency === 'INR') {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  }
  
  // Default formatting (USD, etc)
  return Math.round(amount).toLocaleString();
};

/**
 * Get localized currency symbol
 */
const getLocalCurrency = (currency) => {
  const currencyMap = {
    'USD': '$',
    'INR': '₹',
    'EUR': '€',
    'GBP': '£',
  };
  
  return currencyMap[currency] || currency;
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
 * Convert months of experience to experience level
 * 
 * @param {number} months - Months of experience
 * @returns {string} - Experience level
 */
const convertMonthsToExperienceLevel = (months) => {
  if (!months || months < 0) return 'Not specified';
  
  if (months < 24) {
    return 'Entry Level';
  } else if (months < 60) {
    return 'Mid Level';
  } else {
    return 'Senior Level';
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
      title: 'Software Engineer',
      company: 'DataWise Analytics',
      location: 'Bangalore',
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
    }
  ];
  
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
  
  // Return filtered jobs
  return filteredJobs;
};

// Export the functions
export default {
  fetchJobs
};