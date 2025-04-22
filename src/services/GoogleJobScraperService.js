import axios from 'axios';
import * as cheerio from 'cheerio';
/**
 * Service for scraping job listings from Google search results
 */
class GoogleJobScraperService {
  /**
   * Scrapes job listings from Google search results
   * 
   * @param {string} searchQuery - Search query for jobs
   * @returns {Promise<Array>} - Array of job objects
   */
  static async scrapeJobs(searchQuery) {
    try {
      const formattedQuery = encodeURIComponent(searchQuery);
      const url = `https://www.google.com/search?q=${formattedQuery}&ibp=htl;jobs`;
      
      console.log(`Scraping jobs with query: ${searchQuery}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Referer': 'https://www.google.com/',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0'
        }
      });
      
      return this.parseJobsFromHTML(response.data);
    } catch (error) {
      console.error('Error scraping Google jobs:', error);
      throw new Error('Failed to scrape job listings');
    }
  }
  
  /**
   * Parses job listings from HTML content
   * 
   * @param {string} html - HTML content to parse
   * @returns {Array} - Array of parsed job objects
   */
  static parseJobsFromHTML(html) {
    try {
      const $ = cheerio.load(html);
      const jobs = [];
      
      // Google job listing selectors (may need updating if Google changes their HTML structure)
      const jobCards = $('.iFjolb');
      
      console.log(`Found ${jobCards.length} job cards`);
      
      jobCards.each((index, element) => {
        try {
          // Basic job details
          const title = $(element).find('.BjJfJf').text().trim() || 'Unknown Position';
          const company = $(element).find('.vNEEBe').text().trim() || 'Unknown Company';
          const location = $(element).find('.Qk80Jf').text().trim() || 'Location not specified';
          
          // Job details that may not always be present
          let salary = '';
          let jobType = '';
          let postedTime = '';
          
          // Extract additional details
          $(element).find('.KKh3md').each((i, el) => {
            const text = $(el).text().trim();
            
            // Try to identify the type of detail
            if (text.includes('$') || text.includes('₹') || text.includes('per') || 
                text.includes('annum') || text.includes('month')) {
              salary = text;
            } else if (text.includes('Full-time') || text.includes('Part-time') || 
                      text.includes('Contract') || text.includes('Internship')) {
              jobType = text;
            } else if (text.includes('ago') || text.includes('hour') || 
                      text.includes('day') || text.includes('week') || text.includes('month')) {
              postedTime = text;
            }
          });
          
          // Extract description snippet
          const description = $(element).find('.HBvzbc').text().trim() || '';
          
          // Try to extract apply URL
          let applyUrl = '';
          $(element).find('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && (href.includes('apply') || href.includes('job') || href.includes('career'))) {
              applyUrl = href.startsWith('http') ? href : `https://www.google.com${href}`;
            }
          });
          
          // Create job object with consistent structure
          const job = {
            id: `google-${Date.now()}-${index}`,
            title,
            company,
            location,
            type: jobType || 'Not specified',
            salary: salary || 'Not specified',
            description: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
            postedDate: postedTime || 'Recently',
            applyUrl: applyUrl || '#',
            logo: `https://logo.clearbit.com/${company.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')}.com`,
            skills: this.extractSkillsFromDescription(description),
            experienceLevel: this.extractExperienceLevel(title, description),
            industry: this.extractIndustry(title, company, description),
            source: 'Google Jobs'
          };
          
          jobs.push(job);
        } catch (parseError) {
          console.error('Error parsing job card:', parseError);
          // Continue with next job card
        }
      });
      
      return jobs;
    } catch (error) {
      console.error('Error parsing HTML:', error);
      return [];
    }
  }
  
  /**
   * Extracts potential skills from job description
   * 
   * @param {string} description - Job description text
   * @returns {Array} - Array of extracted skills
   */
  static extractSkillsFromDescription(description) {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'React', 'Angular', 'Vue', 
      'Node.js', 'Express', 'Django', 'Flask', 'Spring', '.NET', 'AWS', 'Azure', 'GCP',
      'Docker', 'Kubernetes', 'DevOps', 'CI/CD', 'Git', 'SQL', 'NoSQL', 'MongoDB',
      'MySQL', 'PostgreSQL', 'Redis', 'Kafka', 'REST', 'GraphQL', 'Microservices',
      'Agile', 'Scrum', 'Product Management', 'Digital Marketing', 'SEO', 'SEM',
      'Content Strategy', 'Data Analysis', 'Machine Learning', 'AI', 'UI/UX',
      'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator'
    ];
    
    const extractedSkills = [];
    
    commonSkills.forEach(skill => {
      // Check if the skill is mentioned in the description
      if (description.toLowerCase().includes(skill.toLowerCase())) {
        extractedSkills.push(skill);
      }
    });
    
    // Limit to a reasonable number of skills
    return extractedSkills.slice(0, 5);
  }
  
  /**
   * Extracts experience level from job title and description
   * 
   * @param {string} title - Job title
   * @param {string} description - Job description
   * @returns {string} - Experience level
   */
  static extractExperienceLevel(title, description) {
    const combinedText = `${title} ${description}`.toLowerCase();
    
    if (combinedText.includes('senior') || combinedText.includes('sr.') || 
        combinedText.includes('lead') || combinedText.includes('principal') ||
        combinedText.includes('5+ years') || combinedText.includes('7+ years') ||
        combinedText.includes('10+ years')) {
      return 'Senior Level';
    } else if (combinedText.includes('junior') || combinedText.includes('jr.') ||
              combinedText.includes('entry') || combinedText.includes('graduate') ||
              combinedText.includes('0-2 years') || combinedText.includes('1-2 years')) {
      return 'Entry Level';
    } else if (combinedText.includes('mid') || combinedText.includes('intermediate') ||
              combinedText.includes('2-5 years') || combinedText.includes('3-5 years')) {
      return 'Mid Level';
    } else if (combinedText.includes('director') || combinedText.includes('executive') ||
              combinedText.includes('chief') || combinedText.includes('head of')) {
      return 'Executive';
    }
    
    return 'Not specified';
  }
  
  /**
   * Extracts industry from job information
   * 
   * @param {string} title - Job title
   * @param {string} company - Company name
   * @param {string} description - Job description
   * @returns {string} - Industry
   */
  static extractIndustry(title, company, description) {
    const combinedText = `${title} ${company} ${description}`.toLowerCase();
    
    const industryKeywords = [
      { keywords: ['software', 'development', 'coding', 'programming', 'tech'], industry: 'Technology' },
      { keywords: ['marketing', 'advertising', 'brand', 'social media', 'seo'], industry: 'Marketing & Advertising' },
      { keywords: ['finance', 'banking', 'investment', 'accounting'], industry: 'Finance' },
      { keywords: ['healthcare', 'medical', 'hospital', 'clinical'], industry: 'Healthcare' },
      { keywords: ['education', 'teaching', 'academic', 'school', 'university'], industry: 'Education' },
      { keywords: ['retail', 'e-commerce', 'sales', 'store'], industry: 'Retail & E-commerce' },
      { keywords: ['manufacturing', 'production', 'factory'], industry: 'Manufacturing' },
      { keywords: ['consulting', 'consultant'], industry: 'Consulting' },
      { keywords: ['design', 'creative', 'ui', 'ux'], industry: 'Design & Creative' },
      { keywords: ['legal', 'law', 'attorney'], industry: 'Legal' }
    ];
    
    for (const { keywords, industry } of industryKeywords) {
      if (keywords.some(keyword => combinedText.includes(keyword))) {
        return industry;
      }
    }
    
    return 'Other';
  }
}

export default GoogleJobScraperService;