import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ChromaClient } from 'chromadb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { DB_NAME } from '../src/constants.js';
// Get dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Import models
import { Event } from '../src/models/event.model.js';

// MongoDB connection string
const MONGODB_URI = `mongodb+srv://sunidhirhapsody:Ny7UQ16yE4n1vrrB@jayitsaha.ellpjty.mongodb.net/${DB_NAME}`

// ChromaDB settings
const CHROMA_SERVER_HOST = process.env.CHROMA_SERVER_HOST || 'localhost';
const CHROMA_SERVER_PORT = process.env.CHROMA_SERVER_PORT || 8001;
const COLLECTION_NAME = 'events';

/**
 * Parse a date string safely
 * @param {string} dateStr - Date string to parse
 * @returns {Date} - Parsed date or default date if parsing fails
 */
const parseDate = (dateStr) => {
  // Default date (current date + 30 days)
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 30);
  
  if (!dateStr) {
    console.warn('Missing date, using default (current date + 30 days)');
    return defaultDate;
  }
  
  try {
    // Try to parse the date string
    const date = new Date(dateStr);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: "${dateStr}", using default date`);
      return defaultDate;
    }
    
    // If date is in the past, set it to a future date
    if (date < new Date()) {
      console.warn(`Date in the past: "${dateStr}", using default date`);
      return defaultDate;
    }
    
    return date;
  } catch (error) {
    console.warn(`Error parsing date "${dateStr}": ${error.message}`);
    return defaultDate;
  }
};

/**
 * Extract date from document text if metadata doesn't have a valid date
 * @param {string} document - Document text from ChromaDB
 * @returns {string|null} - Date string or null if not found
 */
const extractDateFromDocument = (document) => {
  if (!document) return null;
  
  // Look for a date line in the document
  const dateMatch = document.match(/Date:\s*([^\n]+)/);
  if (dateMatch && dateMatch[1]) {
    return dateMatch[1].trim();
  }
  
  return null;
};

/**
 * Parse JSON safely
 * @param {string} jsonStr - JSON string to parse
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any} - Parsed JSON or default value
 */
const parseJSON = (jsonStr, defaultValue = []) => {
  if (!jsonStr) return defaultValue;
  
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    console.warn(`Failed to parse JSON: ${error.message}`);
    return defaultValue;
  }
};

/**
 * Convert ChromaDB metadata to MongoDB event object
 * @param {Object} metadata - ChromaDB metadata
 * @param {string} document - ChromaDB document text
 * @returns {Object} - MongoDB event object
 */
const formatEventForMongoDB = (metadata, document) => {
  if (!metadata) {
    metadata = {};
  }
  
  // Extract data from metadata
  const {
    id,
    title,
    description,
    date: metadataDate,
    location,
    virtual,
    category,
    price,
    speakers,
    organizer,
    forWomen
  } = metadata;

  // Try to get date from metadata first, then from document if not valid
  let eventDate;
  if (metadataDate) {
    eventDate = parseDate(metadataDate);
  } else {
    const docDate = extractDateFromDocument(document);
    eventDate = parseDate(docDate);
  }
  
  // Format data for MongoDB
  return {
    // Use ChromaDB ID as a reference
    chromaId: id || `unknown-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    title: title || 'Untitled Event',
    description: description || (document ? document.slice(0, 500) : 'No description available'),
    date: eventDate,
    location: location || 'Unknown Location',
    virtual: virtual === true || virtual === 'true',
    category: category || 'Event',
    image: metadata.image || null,
    registrationUrl: metadata.registrationUrl || null,
    price: price || 'Free',
    // Handle different speaker formats
    speakers: Array.isArray(speakers) ? speakers : 
             (typeof speakers === 'string' ? parseJSON(speakers, []) : []),
    organizer: organizer || 'Unknown Organizer',
    forWomen: forWomen === true || forWomen === 'true',
    viewCount: 0,
    registrationCount: 0,
    savedBy: [],
    attendees: [],
    source: 'ChromaDB Import'
  };
};

/**
 * Main function to import from ChromaDB to MongoDB
 */
async function importFromChromaDB() {
  console.log('Starting ChromaDB to MongoDB import script...');
  
  let mongoConnection = null;
  
  try {
    // Connect to MongoDB
    console.log(`Connecting to MongoDB at ${MONGODB_URI}`);
    mongoConnection = await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    
    // Connect to ChromaDB
    console.log(`Connecting to ChromaDB at http://${CHROMA_SERVER_HOST}:${CHROMA_SERVER_PORT}`);
    const chromaClient = new ChromaClient({
      path: `http://${CHROMA_SERVER_HOST}:${CHROMA_SERVER_PORT}`
    });
    
    // Test connection
    try {
      const heartbeat = await chromaClient.heartbeat();
      console.log(`ChromaDB server heartbeat: ${heartbeat}`);
    } catch (error) {
      throw new Error(`ChromaDB server not reachable: ${error.message}`);
    }
    
    // Get collection
    const collections = await chromaClient.listCollections();
    console.log("COLLECTION LIST");
    console.log(collections);
    // if (!collections.some(c => c.name === COLLECTION_NAME)) {
    //   throw new Error(`Collection '${COLLECTION_NAME}' not found in ChromaDB`);
    // }
    
    const collection = await chromaClient.getCollection({ name: COLLECTION_NAME });
    console.log(`Retrieved '${COLLECTION_NAME}' collection from ChromaDB`);
    
    // Get all documents from ChromaDB
    console.log('Fetching all events from ChromaDB...');
    const result = await collection.get();
    
    if (!result.ids || result.ids.length === 0) {
      console.log('No events found in ChromaDB. Exiting.');
      process.exit(0);
    }
    
    console.log(`Retrieved ${result.ids.length} events from ChromaDB`);
    
    // Process events in batches
    const batchSize = 20; // Smaller batch size for better error tracking
    let importedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < result.ids.length; i += batchSize) {
      const batchIds = result.ids.slice(i, i + batchSize);
      const batchMetadatas = result.metadatas ? result.metadatas.slice(i, i + batchSize) : Array(batchIds.length).fill({});
      const batchDocuments = result.documents ? result.documents.slice(i, i + batchSize) : Array(batchIds.length).fill('');
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(result.ids.length / batchSize)}`);
      
      // Check which ChromaDB IDs already exist in MongoDB
      const existingEvents = await Event.find({ chromaId: { $in: batchIds } });
      const existingChromaIds = new Set(existingEvents.map(e => e.chromaId));
      
      // Process each event individually to isolate errors
      for (let j = 0; j < batchIds.length; j++) {
        try {
          const chromaId = batchIds[j];
          const metadata = batchMetadatas[j] || {};
          const document = batchDocuments[j] || '';
          
          // Add ID to metadata if not present
          if (!metadata.id) {
            metadata.id = chromaId;
          }
          
          // Format event for MongoDB
          const formattedEvent = formatEventForMongoDB(metadata, document);
          
          if (existingChromaIds.has(chromaId)) {
            // Update existing event
            const existingEvent = existingEvents.find(e => e.chromaId === chromaId);
            
            await Event.findByIdAndUpdate(
              existingEvent._id,
              { $set: { 
                title: formattedEvent.title,
                description: formattedEvent.description,
                date: formattedEvent.date,
                location: formattedEvent.location,
                virtual: formattedEvent.virtual,
                category: formattedEvent.category,
                organizer: formattedEvent.organizer,
                forWomen: formattedEvent.forWomen
              }},
              { new: true }
            );
            updatedCount++;
          } else {
            // Create new event
            const newEvent = new Event(formattedEvent);
            await newEvent.save();
            importedCount++;
          }
        } catch (error) {
          console.error(`Error processing event ${batchIds[j]}: ${error.message}`);
          errorCount++;
          skippedCount++;
          // Continue with the next event
        }
      }
      
      console.log(`Batch completed: ${importedCount} imported, ${updatedCount} updated, ${skippedCount} skipped`);
    }
    
    console.log('\nImport Summary:');
    console.log(`Total events in ChromaDB: ${result.ids.length}`);
    console.log(`Events imported (new): ${importedCount}`);
    console.log(`Events updated: ${updatedCount}`);
    console.log(`Events skipped/errors: ${skippedCount}`);
    console.log(`Total errors: ${errorCount}`);
    
    console.log('\nChromaDB to MongoDB import completed!');
  } catch (error) {
    console.error('Error importing from ChromaDB to MongoDB:', error);
  } finally {
    // Close MongoDB connection
    if (mongoConnection) {
      await mongoose.disconnect();
      console.log('MongoDB connection closed');
    }
    process.exit(0);
  }
}

// Run the main function
importFromChromaDB();