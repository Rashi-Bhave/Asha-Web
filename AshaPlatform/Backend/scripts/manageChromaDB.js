// Backend/src/scripts/manageChromaDB.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { Chroma } from 'langchain/vectorstores/chroma';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { ChromaClient } from 'chromadb';
import { Event } from '../models/event.model.js';
import { initChromaDB, addEventToChromaDB } from '../services/chromaDB.service.js';

// Load environment variables
dotenv.config();

// MongoDB Connection URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/asha_platform';
const CHROMA_DB_PATH = process.env.CHROMA_DB_PATH || path.join(process.cwd(), 'chroma_db');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Collection name for event embeddings
const COLLECTION_NAME = 'events_embeddings';

// Create embeddings instance
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: OPENAI_API_KEY,
  modelName: 'text-embedding-ada-002'
});

/**
 * Display available commands
 */
const showHelp = () => {
  console.log(`
ChromaDB Management Utility

Usage: node manageChromaDB.js <command>

Commands:
  init              Initialize ChromaDB with the specified file path
  sync              Synchronize all MongoDB events to ChromaDB
  reset             Reset ChromaDB events collection (delete and recreate)
  stats             Display statistics about ChromaDB events collection
  help              Show this help message

Environment variables:
  CHROMA_DB_PATH    Path to ChromaDB directory (currently: ${CHROMA_DB_PATH})
  OPENAI_API_KEY    OpenAI API key for embeddings
  `);
};

/**
 * Initialize ChromaDB
 */
const initializeChroma = async () => {
  try {
    const result = await initChromaDB();
    
    if (result) {
      console.log('ChromaDB initialized successfully.');
    } else {
      console.error('ChromaDB initialization failed.');
    }
    
    return result;
  } catch (error) {
    console.error('Error initializing ChromaDB:', error);
    return false;
  }
};

/**
 * Reset ChromaDB collection
 */
const resetChromaCollection = async () => {
  try {
    console.log('Resetting ChromaDB collection...');
    
    // Check if directory exists
    if (!fs.existsSync(CHROMA_DB_PATH)) {
      console.log(`Creating ChromaDB directory at: ${CHROMA_DB_PATH}`);
      fs.mkdirSync(CHROMA_DB_PATH, { recursive: true });
    } else {
      // Delete the collection files
      const collectionPath = path.join(CHROMA_DB_PATH, COLLECTION_NAME);
      
      if (fs.existsSync(collectionPath)) {
        console.log(`Removing existing collection files from: ${collectionPath}`);
        fs.rmSync(collectionPath, { recursive: true, force: true });
      }
    }
    
    // Initialize ChromaDB with the clean directory
    return await initializeChroma();
  } catch (error) {
    console.error('Error resetting ChromaDB collection:', error);
    return false;
  }
};

/**
 * Synchronize MongoDB events to ChromaDB
 */
const syncMongoToChroma = async () => {
  try {
    console.log('Synchronizing MongoDB events to ChromaDB...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connection established');
    
    // Get all events from MongoDB
    const events = await Event.find({});
    console.log(`Found ${events.length} events in MongoDB`);
    
    if (events.length === 0) {
      console.log('No events to synchronize.');
      return true;
    }
    
    // Ensure ChromaDB is initialized
    const chromaInitialized = await initializeChroma();
    if (!chromaInitialized) {
      return false;
    }
    
    // Add each event to ChromaDB
    let successCount = 0;
    let errorCount = 0;
    
    for (const event of events) {
      try {
        await addEventToChromaDB(event);
        successCount++;
        
        // Update MongoDB record with ChromaDB ID if not already set
        if (!event.chromaId) {
          event.chromaId = event._id.toString();
          await event.save();
        }
      } catch (error) {
        console.error(`Error adding event "${event.title}" to ChromaDB:`, error);
        errorCount++;
      }
    }
    
    console.log(`Synchronization complete. ${successCount} events added successfully, ${errorCount} errors.`);
    return true;
  } catch (error) {
    console.error('Error during synchronization:', error);
    return false;
  } finally {
    // Disconnect from MongoDB
    try {
      await mongoose.disconnect();
      console.log('MongoDB connection closed');
    } catch (disconnectError) {
      console.error('Error disconnecting from MongoDB:', disconnectError);
    }
  }
};

/**
 * Display statistics about ChromaDB events collection
 */
const showStats = async () => {
  try {
    console.log('Fetching ChromaDB collection statistics...');
    
    // Initialize ChromaDB
    const chromaInitialized = await initializeChroma();
    if (!chromaInitialized) {
      return false;
    }
    
    // Create a temporary Chroma instance to get stats
    const vectorStore = await Chroma.fromExistingCollection(
      embeddings,
      { collectionName: COLLECTION_NAME, url: CHROMA_DB_PATH }
    );
    
    // Get collection info
    const client = new ChromaClient({
      path: CHROMA_DB_PATH
    });
    
    const collection = await client.getCollection({ name: COLLECTION_NAME });
    const count = await collection.count();
    
    console.log(`
ChromaDB Collection: ${COLLECTION_NAME}
--------------------------------------
Documents count: ${count}
Collection path: ${CHROMA_DB_PATH}
    `);
    
    return true;
  } catch (error) {
    console.error('Error fetching ChromaDB statistics:', error);
    return false;
  }
};

/**
 * Main function
 */
const main = async () => {
  const command = process.argv[2] || 'help';
  
  // Check if ChromaDB path and OpenAI API key are set
  if (command !== 'help' && !OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY environment variable is not set.');
    console.error('This is required for generating embeddings for ChromaDB.');
    process.exit(1);
  }
  
  switch (command) {
    case 'init':
      await initializeChroma();
      break;
    case 'sync':
      await syncMongoToChroma();
      break;
    case 'reset':
      await resetChromaCollection();
      break;
    case 'stats':
      await showStats();
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
  
  process.exit(0);
};

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});