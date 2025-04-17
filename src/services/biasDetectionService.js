// services/biasDetectionService.js

/**
 * Simple bias detection service
 * In a real app, this would use a more sophisticated algorithm or API
 * to detect and correct various forms of bias
 */

/**
 * List of gender-biased terms paired with their neutral alternatives
 */
const BIASED_TERMS = {
    // Gender-biased job titles
    'businessman': 'business person',
    'businesswoman': 'business person',
    'chairman': 'chairperson',
    'chairwoman': 'chairperson',
    'fireman': 'firefighter',
    'policeman': 'police officer',
    'policewoman': 'police officer',
    'stewardess': 'flight attendant',
    'mailman': 'mail carrier',
    'salesman': 'salesperson',
    'saleswoman': 'salesperson',
    'workman': 'worker',
    
    // Gender-biased pronouns in professional context
    'he is the best for the job': 'they are the best for the job',
    'she is the best for the job': 'they are the best for the job',
    'he would be perfect': 'they would be perfect',
    'she would be perfect': 'they would be perfect',
    
    // Gender-specific career preferences
    'jobs for women': 'jobs',
    'careers for women': 'careers',
    'male-dominated': 'traditionally gender-imbalanced',
    'female-dominated': 'traditionally gender-imbalanced',
  };
  
  /**
   * Detects potential gender bias in user input
   * 
   * @param {string} text - User input text
   * @returns {Object} - Result with bias detection and corrected text
   */
  export const detectBias = async (text) => {
    if (!text) {
      return { hasBias: false, correctedText: text };
    }
    
    let correctedText = text;
    let hasBias = false;
    
    // Check for biased terms and replace them with neutral alternatives
    const lowerText = text.toLowerCase();
    
    // Check each biased term
    for (const [biasedTerm, neutralTerm] of Object.entries(BIASED_TERMS)) {
      if (lowerText.includes(biasedTerm)) {
        hasBias = true;
        
        // Replace the term while preserving case
        // This is a simplified approach; a real implementation would be more sophisticated
        const regex = new RegExp(biasedTerm, 'gi');
        correctedText = correctedText.replace(regex, neutralTerm);
      }
    }
    
    // Simulate async operation (in a real app, this might call an API)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      hasBias,
      correctedText
    };
  };
  
  export default {
    detectBias
  };