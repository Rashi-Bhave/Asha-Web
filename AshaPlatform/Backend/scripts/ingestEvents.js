// Backend/src/scripts/ingestEvents.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ingestEventsFromChromaDB, initChromaDB } from '../services/chromaDB.service.js';
import path from 'path';
import fs from 'fs';
import { DB_NAME } from '../src/constants.js';
// Load environment variables
dotenv.config();

// MongoDB Connection URL
const MONGODB_URI = `mongodb+srv://sunidhirhapsody:Ny7UQ16yE4n1vrrB@jayitsaha.ellpjty.mongodb.net/${DB_NAME}` || 'mongodb://localhost:27017/asha_platform';
const CHROMA_DB_PATH = process.env.CHROMA_DB_PATH || path.join(process.cwd(), 'chroma_db');

/**
 * Main function to ingest events from ChromaDB to MongoDB
 */
const ingestEvents = async () => {
  try {
    console.log('Starting event ingestion process...');
    
    // Check if ChromaDB file exists
    if (!fs.existsSync(CHROMA_DB_PATH)) {
      console.error(`ChromaDB file not found at: ${CHROMA_DB_PATH}`);
      console.log('Please ensure the CHROMA_DB_PATH environment variable points to your ChromaDB file');
      process.exit(1);
    }
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connection established');
    
    // Initialize ChromaDB
    console.log('Initializing ChromaDB...');
    const chromaInitialized = await initChromaDB();
    
    if (!chromaInitialized) {
      console.error('Failed to initialize ChromaDB. Aborting ingestion process.');
      await mongoose.disconnect();
      process.exit(1);
    }
    
    // Start ingestion
    console.log('Starting data ingestion...');
    const count = await ingestEventsFromChromaDB();
    
    console.log(`Ingestion complete. ${count} events were successfully ingested.`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error during ingestion process:', error);
    
    // Ensure MongoDB connection is closed
    try {
      await mongoose.disconnect();
      console.log('MongoDB connection closed');
    } catch (disconnectError) {
      console.error('Error disconnecting from MongoDB:', disconnectError);
    }
    
    process.exit(1);
  }
};

// Execute the ingestion process
ingestEvents();