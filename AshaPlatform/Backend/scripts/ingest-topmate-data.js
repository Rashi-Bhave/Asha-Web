import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Mentor } from '../src/models/mentor.model.js';
import { DB_NAME } from '../src/constants.js';
// Load environment variables
dotenv.config();

/**
 * Script to ingest topmate.json data into MongoDB's mentors collection
 */

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(`mongodb+srv://sunidhirhapsody:Ny7UQ16yE4n1vrrB@jayitsaha.ellpjty.mongodb.net/${DB_NAME}`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Transform topmate data to match our Mentor schema
 * @param {Object} topmateData - The parsed topmate.json data
 * @returns {Array} - Array of mentor objects matching our schema
 */
const transformTopmateData = (topmateData) => {
  const mentors = [];

  topmateData.categories.forEach(category => {
    const categorySlug = category.name.toLowerCase().replace(/\s+/g, '_');
    
    category.subcategories.forEach(subcategory => {
      if (subcategory.mentors && subcategory.mentors.length > 0) {
        subcategory.mentors.forEach(mentor => {
          // Skip mentors that don't have a name
          if (!mentor.name) return;
          
          // Use a consistent format for bookings (remove '+' and convert to number)
          const bookingsStr = mentor.bookings ? mentor.bookings.replace(/\+/, '') : "0";
          const bookings = parseInt(bookingsStr) || 0;
          
          // Parse rating to number or default to 0
          const rating = mentor.rating ? parseFloat(mentor.rating) : 0;
          
          // Create a mentor object matching our schema
          const mentorObj = {
            name: mentor.name,
            title: mentor.title || '',
            imageUrl: mentor.imageUrl && !mentor.imageUrl.startsWith('profile_image_') 
              ? mentor.imageUrl 
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=7B3FA9&color=fff&size=100`,
            rating: rating,
            bookings: bookings,
            callInfo: mentor.callInfo || "1:1 Call",
            category: categorySlug,
            subcategories: [subcategory.name],
            priorityDM: mentor.priorityDM || false,
            isNew: mentor.isNew || false,
            hourlyRate: Math.floor(Math.random() * 50) + 50, // Random rate between 50-100
            bio: `Experienced ${subcategory.name} mentor with expertise in ${category.name.toLowerCase()}`,
            isActive: true,
            skills: [subcategory.name, category.name, ...generateRandomSkills(category.name, subcategory.name)],
            createdAt: new Date()
          };
          
          // Add random availability
          mentorObj.availability = generateRandomAvailability();
          
          mentors.push(mentorObj);
        });
      }
    });
  });

  return mentors;
};

/**
 * Generate random skills based on category and subcategory
 */
const generateRandomSkills = (category, subcategory) => {
  const skills = [];
  
  // Add some generic skills
  const genericSkills = [
    'Communication', 'Mentoring', 'Problem Solving', 'Critical Thinking', 
    'Leadership', 'Collaboration', 'Time Management'
  ];
  
  // Add some category-specific skills
  const categorySkills = {
    'Data': ['Python', 'SQL', 'Data Analysis', 'Statistics', 'Machine Learning', 'Data Visualization'],
    'Software': ['JavaScript', 'HTML/CSS', 'React', 'Node.js', 'API Development', 'System Design'],
    'Mental Health': ['Active Listening', 'Empathy', 'CBT', 'Mindfulness', 'Emotional Intelligence'],
    'Travel': ['Trip Planning', 'Budget Travel', 'Digital Nomad', 'Remote Work', 'Cultural Navigation'],
    'Study Abroad': ['University Applications', 'Visa Process', 'Scholarship Hunting', 'International Education']
  };
  
  // Add 2-3 generic skills
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * genericSkills.length);
    if (!skills.includes(genericSkills[randomIndex])) {
      skills.push(genericSkills[randomIndex]);
    }
  }
  
  // Add 2-3 category-specific skills
  const specificSkills = categorySkills[category] || [];
  for (let i = 0; i < 3; i++) {
    if (specificSkills.length > 0) {
      const randomIndex = Math.floor(Math.random() * specificSkills.length);
      if (!skills.includes(specificSkills[randomIndex])) {
        skills.push(specificSkills[randomIndex]);
      }
    }
  }
  
  return skills;
};

/**
 * Generate random availability for a mentor
 */
const generateRandomAvailability = () => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const availability = [];
  
  // Randomly decide which days the mentor is available
  days.forEach(day => {
    // 70% chance the mentor is available on this day
    if (Math.random() < 0.7) {
      const slots = [];
      
      // Morning slots (9 AM - 12 PM)
      if (Math.random() < 0.8) {
        for (let hour = 9; hour < 12; hour++) {
          if (Math.random() < 0.7) {
            slots.push({
              startTime: `${hour}:00`,
              endTime: `${hour}:59`
            });
          }
        }
      }
      
      // Afternoon slots (1 PM - 5 PM)
      if (Math.random() < 0.7) {
        for (let hour = 13; hour < 17; hour++) {
          if (Math.random() < 0.6) {
            slots.push({
              startTime: `${hour}:00`,
              endTime: `${hour}:59`
            });
          }
        }
      }
      
      // Evening slots (6 PM - 9 PM)
      if (Math.random() < 0.6) {
        for (let hour = 18; hour < 21; hour++) {
          if (Math.random() < 0.5) {
            slots.push({
              startTime: `${hour}:00`,
              endTime: `${hour}:59`
            });
          }
        }
      }
      
      if (slots.length > 0) {
        availability.push({
          day,
          slots
        });
      }
    }
  });
  
  return availability;
};

/**
 * Drop existing indexes on the Mentor collection to avoid conflicts
 */
const dropExistingIndexes = async () => {
  try {
    console.log('Checking for existing text indexes...');
    
    // Get all indexes
    const indexes = await Mentor.collection.indexes();
    
    // Find text indexes
    const textIndexes = indexes.filter(index => 
      Object.values(index.key).some(val => val === 'text')
    );
    
    if (textIndexes.length > 0) {
      console.log(`Found ${textIndexes.length} text indexes. Dropping indexes...`);
      
      // Drop each text index
      for (const index of textIndexes) {
        await Mentor.collection.dropIndex(index.name);
        console.log(`Dropped index: ${index.name}`);
      }
    } else {
      console.log('No text indexes found.');
    }
  } catch (error) {
    console.error('Error dropping indexes:', error);
    throw error;
  }
};

/**
 * Insert mentors in batches to handle large datasets
 */
const insertMentorsInBatches = async (mentors, batchSize = 50) => {
  console.log(`Inserting ${mentors.length} mentors in batches of ${batchSize}...`);
  
  let insertedCount = 0;
  
  for (let i = 0; i < mentors.length; i += batchSize) {
    const batch = mentors.slice(i, i + batchSize);
    try {
      const result = await Mentor.insertMany(batch, { ordered: false });
      insertedCount += result.length;
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}: ${result.length} mentors`);
    } catch (error) {
      if (error.insertedDocs && error.insertedDocs.length > 0) {
        insertedCount += error.insertedDocs.length;
        console.warn(`Partial batch insert: ${error.insertedDocs.length} mentors inserted`);
      }
      console.error(`Batch ${Math.floor(i/batchSize) + 1} error:`, error.message);
    }
  }
  
  return insertedCount;
};

/**
 * Main function to run the script
 */
const main = async () => {
  let conn;
  
  try {
    // Read the JSON file
    const filePath = path.resolve('topmate.json');
    console.log(`Reading file from: ${filePath}`);
    
    const fileData = fs.readFileSync(filePath, 'utf8');
    const topmateData = JSON.parse(fileData);
    
    // Transform data to match our schema
    const mentors = transformTopmateData(topmateData);
    console.log(`Transformed ${mentors.length} mentors from topmate data`);
    
    // Connect to MongoDB
    conn = await connectDB();
    
    // Check if collection already has data
    const existingCount = await Mentor.countDocuments();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing mentors in the database`);
      
      // Ask for confirmation before proceeding
      const shouldProceed = await confirmAction(
        'Do you want to proceed and add new mentors? This will not delete existing data, just add new mentors. (y/n): '
      );
      
      if (!shouldProceed) {
        console.log('Operation cancelled.');
        await mongoose.disconnect();
        process.exit(0);
      }
    }
    
    // Drop existing text indexes to avoid conflicts
    await dropExistingIndexes();
    
    // Insert data into MongoDB in batches
    const insertedCount = await insertMentorsInBatches(mentors);
    console.log(`Successfully inserted ${insertedCount} mentors into MongoDB`);
    
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    // If connected to MongoDB, disconnect
    if (conn) {
      try {
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
      } catch (err) {
        console.error('Error disconnecting from MongoDB:', err);
      }
    }
  }
};

/**
 * Helper function to get user confirmation
 */
const confirmAction = (message) => {
  return new Promise((resolve) => {
    process.stdout.write(message);
    
    process.stdin.once('data', (data) => {
      const input = data.toString().trim().toLowerCase();
      resolve(input === 'y' || input === 'yes');
    });
  });
};

// Run the script
main();