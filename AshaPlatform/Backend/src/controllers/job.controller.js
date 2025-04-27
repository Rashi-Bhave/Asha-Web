// Backend/src/controllers/job.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { Job } from '../models/job.model.js';
import axios from 'axios';

// External job APIs (optional - for enriching job search)
const JSEARCH_API_KEY = '7ebe5ad130msh6e086d42d72073fp1cdb1ejsncebf68f16f6f';
const JSEARCH_API_HOST = 'jsearch.p.rapidapi.com';

/**
 * @route   GET /api/v1/jobs
 * @desc    Get jobs with search and filters
 * @access  Public
 */
export const getJobs = asyncHandler(async (req, res) => {
  try {
    // Extract query parameters
    const {
      search,
      location,
      experienceLevel,
      jobType,
      remote,
      skills,
      sort,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = {};

    // Text search (title, company, description, skills)
    if (search) {
      query.$or = [
        { $text: { $search: search } }, // Uses text index
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Experience level filter
    if (experienceLevel) {
      const levels = experienceLevel.split(',');
      query.experienceLevel = { $in: levels };
    }

    // Job type filter
    if (jobType) {
      const types = jobType.split(',');
      query.type = { $in: types };
    }

    // Remote filter
    if (remote === 'true') {
      query.remoteJob = true;
    }

    // Skills filter
    if (skills) {
      const skillList = skills.split(',');
      query.skills = { $in: skillList.map(skill => new RegExp(skill, 'i')) };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Determine sort order
    let sortOption = {};
    switch (sort) {
      case 'date':
        sortOption = { postedDate: -1 };
        break;
      case 'salary': 
        // This is a simplification - in reality, salary might need preprocessing
        sortOption = { searchScore: -1, postedDate: -1 };
        break;
      case 'relevance':
      default:
        sortOption = { searchScore: -1, postedDate: -1 };
    }

    // Execute query with pagination
    // const jobs = await Job.find(query)
    //   .sort(sortOption)
    //   .skip(skip)
    //   .limit(parseInt(limit));

    // If no jobs found in database, try external API if key is configured
    if (JSEARCH_API_KEY) {
      const externalJobs = await fetchExternalJobs(search, location);
      
      if (externalJobs.length > 0) {
        // Save jobs to database for future use
        // await Job.insertMany(externalJobs);
        
        return res.status(200).json({
          success: true,
          jobs: externalJobs,
          source: 'external'
        });
      }
    }

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    // Return jobs
    return res.status(200).json({
      success: true,
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/v1/jobs/:id
 * @desc    Get job by ID
 * @access  Public
 */
export const getJobById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    job.viewCount += 1;
    await job.save();

    return res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/v1/jobs/save/:id
 * @desc    Save a job
 * @access  Private
 */
export const saveJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if already saved
    if (job.savedBy.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Job already saved'
      });
    }

    // Add user to savedBy array
    job.savedBy.push(userId);
    await job.save();

    return res.status(200).json({
      success: true,
      message: 'Job saved successfully'
    });
  } catch (error) {
    console.error('Error saving job:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save job',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/v1/jobs/save/:id
 * @desc    Unsave a job
 * @access  Private
 */
export const unsaveJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if job is saved
    if (!job.savedBy.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Job not saved'
      });
    }

    // Remove user from savedBy array
    job.savedBy = job.savedBy.filter(id => id.toString() !== userId.toString());
    await job.save();

    return res.status(200).json({
      success: true,
      message: 'Job unsaved successfully'
    });
  } catch (error) {
    console.error('Error unsaving job:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unsave job',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/v1/jobs/apply/:id
 * @desc    Apply for a job
 * @access  Private
 */
export const applyForJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if already applied
    const alreadyApplied = job.applicants.some(
      applicant => applicant.userId.toString() === userId.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'Already applied to this job'
      });
    }

    // Add user to applicants array
    job.applicants.push({
      userId,
      status: 'Applied',
      appliedDate: new Date(),
      notes: req.body.notes || ''
    });

    // Increment apply count
    job.applyCount += 1;
    
    await job.save();

    return res.status(200).json({
      success: true,
      message: 'Job application recorded successfully'
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to apply for job',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/v1/jobs/user/applied
 * @desc    Get user's applied jobs
 * @access  Private
 */
export const getAppliedJobs = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const appliedJobs = await Job.find({
      'applicants.userId': userId
    });

    return res.status(200).json({
      success: true,
      jobs: appliedJobs
    });
  } catch (error) {
    console.error('Error fetching applied jobs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch applied jobs',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/v1/jobs/user/saved
 * @desc    Get user's saved jobs
 * @access  Private
 */
export const getSavedJobs = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const savedJobs = await Job.find({
      savedBy: userId
    });

    return res.status(200).json({
      success: true,
      jobs: savedJobs
    });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch saved jobs',
      error: error.message
    });
  }
});

/**
 * Fetch jobs from external API
 * 
 * @param {string} query - Search query
 * @param {string} location - Location query
 * @returns {Promise<Array>} - Array of job objects
 */
const fetchExternalJobs = async (query, location = 'Bangalore') => {
  try {
    if (!JSEARCH_API_KEY) {
      return [];
    }

    // Set up request options
    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search',
      params: {
        query: `${query} in ${location}`,
        page: '1',
        num_pages: '1'
      },
      headers: {
        'X-RapidAPI-Key': JSEARCH_API_KEY,
        'X-RapidAPI-Host': JSEARCH_API_HOST
      }
    };

    const response = await axios.request(options);

    // Transform API response to our job model format
    if (response.data && response.data.data) {
      return response.data.data.map(job => ({
        title: job.job_title || 'Unknown Position',
        company: job.employer_name || 'Unknown Company',
        location: job.job_city ? `${job.job_city}, ${job.job_country || ''}` : (job.job_country || 'Remote'),
        type: job.job_employment_type || 'Full-time',
        salary: job.job_min_salary && job.job_max_salary ? 
          `${job.job_min_salary}-${job.job_max_salary} ${job.job_salary_currency || 'USD'}` : 'Not specified',
        description: job.job_description || 'No description available',
        postedDate: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc) : new Date(),
        applyUrl: job.job_apply_link || '#',
        logo: job.employer_logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.employer_name || 'Job')}&background=random`,
        skills: extractSkillsFromDescription(job.job_description || ''),
        experienceLevel: extractExperienceLevel(job.job_title || '', job.job_description || ''),
        industry: job.job_category || 'Technology',
        remoteJob: job.job_is_remote || false,
        source: 'JSearch API',
        viewCount: 0,
        applyCount: 0,
        savedBy: [],
        applicants: []
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching jobs from external API:', error);
    return [];
  }
};

/**
 * Extract skills from job description
 * 
 * @param {string} description - Job description
 * @returns {Array} - Array of skills
 */
const extractSkillsFromDescription = (description) => {
  const commonSkills = [
    'JavaScript', 'React', 'Angular', 'Vue', 'Node.js', 'Express', 'MongoDB', 'SQL',
    'Python', 'Java', 'C#', 'C++', 'Ruby', 'Go', 'PHP', 'Swift', 'Kotlin',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git',
    'AI', 'Machine Learning', 'Data Science', 'Data Analysis', 'TensorFlow', 'PyTorch',
    'UI/UX', 'Product Management', 'Agile', 'Scrum', 'JIRA', 'DevOps'
  ];

  const foundSkills = [];
  const descLower = description.toLowerCase();

  commonSkills.forEach(skill => {
    if (descLower.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  return foundSkills.slice(0, 5);
};

/**
 * Extract experience level from job title and description
 * 
 * @param {string} title - Job title
 * @param {string} description - Job description
 * @returns {string} - Experience level
 */
const extractExperienceLevel = (title, description) => {
  const combinedText = `${title} ${description}`.toLowerCase();
  
  if (combinedText.includes('senior') || 
      combinedText.includes('sr.') || 
      combinedText.includes('lead') || 
      combinedText.includes('principal') ||
      combinedText.includes('5+ years') ||
      combinedText.includes('7+ years')) {
    return 'Senior Level';
  } else if (combinedText.includes('junior') || 
             combinedText.includes('jr.') || 
             combinedText.includes('entry') || 
             combinedText.includes('graduate') ||
             combinedText.includes('0-2 years') ||
             combinedText.includes('1-2 years')) {
    return 'Entry Level';
  } else if (combinedText.includes('manager') || 
             combinedText.includes('director') || 
             combinedText.includes('head') || 
             combinedText.includes('chief')) {
    return 'Executive';
  } else {
    return 'Mid Level';
  }
};