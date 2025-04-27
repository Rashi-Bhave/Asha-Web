// Backend/src/services/chromaDB.service.js
import { ChromaClient } from 'chromadb';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { Event } from '../models/event.model.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

// For importing non-ESM modules in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Load environment variables
dotenv.config();

// Status flag to track if ChromaDB is available
let isChromaDBAvailable = false;

// Dynamic import for SentenceTransformer
import('@xenova/transformers').then(({ pipeline }) => {
  // Initialize the embedding model once it's imported
  initEmbeddingModel(pipeline);
}).catch(err => {
  console.error('Error loading transformers library:', err);
});

// Embedding model instance
let embeddingModel;

/**
 * Initialize the embedding model
 * @param {Function} pipeline - Transformers pipeline function
 */
const initEmbeddingModel = async (pipeline) => {
  try {
    console.log('Initializing SentenceTransformer embedding model...');
    // Create feature-extraction pipeline with the same model as in create_db.py
    embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('SentenceTransformer model initialized successfully');
  } catch (error) {
    console.error('Error initializing embedding model:', error);
  }
};

// ChromaDB configuration
const CHROMA_DB_PATH = process.env.CHROMA_DB_PATH || path.join(process.cwd(), 'events_chroma_db');
const COLLECTION_NAME = 'events';

// ChromaDB client - use HTTP client
let client;

/**
 * Create embeddings for documents using SentenceTransformer
 * @param {Array<string>} documents - List of document texts to embed
 * @returns {Promise<Array<Array<number>>>} - List of embedding vectors
 */
const createEmbeddings = async (documents) => {
  try {
    if (!embeddingModel) {
      throw new Error('Embedding model not initialized yet');
    }
    
    console.log(`Creating embeddings for ${documents.length} documents`);
    
    // Process in batches to avoid memory issues
    const batchSize = 16;
    const embeddings = [];
    
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      console.log(`Processing batch ${i / batchSize + 1}/${Math.ceil(documents.length / batchSize)}`);
      
      // Create embeddings for each document in the batch
      const batchEmbeddings = await Promise.all(batch.map(async (doc) => {
        const result = await embeddingModel(doc, { pooling: 'mean', normalize: true });
        return Array.from(result.data);
      }));
      
      embeddings.push(...batchEmbeddings);
    }
    
    console.log(`Created ${embeddings.length} embeddings`);
    return embeddings;
  } catch (error) {
    console.error('Error creating embeddings:', error);
    throw error;
  }
};

/**
 * Get ChromaDB heartbeat to check if server is available
 * @returns {Promise<string>} Heartbeat timestamp or null if not available
 */
export const getHeartbeat = async () => {
  try {
    if (!client) {
      initializeClient();
    }
    
    const heartbeat = await client.heartbeat();
    isChromaDBAvailable = true;
    return heartbeat;
  } catch (error) {
    isChromaDBAvailable = false;
    console.error('ChromaDB heartbeat failed:', error);
    return null;
  }
};

/**
 * Initialize the ChromaDB client
 */
const initializeClient = () => {
  const host = process.env.CHROMA_SERVER_HOST || 'localhost';
  const port = process.env.CHROMA_SERVER_PORT || 8001;
  
  const chromaClient = new ChromaClient({
        path: `http://localhost:8001`
      });
  
  console.log(`ChromaDB client initialized to connect to ${host}:${port}`);
};

/**
 * Initialize ChromaDB connection
 */
export const initChromaDB = async () => {
  try {
    console.log('Initializing ChromaDB connection...');
    
    // Initialize client if not already done
    // if (!client) {
    //   initializeClient();
    // }

    console.log("TRYING TO CONNECT")

    client = new ChromaClient({
        path: `http://192.168.107.82:8001`
      });

    isChromaDBAvailable = true;
    
    // Try to connect to the server
    // try {
    //   const heartbeat = await client.heartbeat();
    //   console.log(`ChromaDB server heartbeat: ${heartbeat}`);
    //   isChromaDBAvailable = true;
    // } catch (heartbeatError) {
    //   console.error('ChromaDB server not reachable:', heartbeatError);
    //   console.log('Please start the ChromaDB server with:');
    //   console.log('CHROMA_SERVER_CORS_ALLOW_ORIGINS="*" chroma run --path ./events_chroma_db --host 0.0.0.0 --port 8001');
    //   isChromaDBAvailable = false;
    //   return false;
    // }
    
    // Check if the collection exists, if not create it
    try {
      const collections = await client.listCollections();
      console.log("COLLECTIONS")
      console.log(collections)
      const collectionExists = true

      console.log("collectionExists")
      console.log(collectionExists)
      
      let collection;
      if (!collectionExists) {
        console.log(`Creating new collection: ${COLLECTION_NAME}`);
        collection = await client.createCollection({
          name: COLLECTION_NAME,
          metadata: { description: 'Event descriptions and metadata for semantic search' }
        });
      } else {
        console.log(`Using existing collection: ${COLLECTION_NAME}`);
        collection = await client.getCollection({ name: COLLECTION_NAME });
      }
      
      console.log('ChromaDB connection established successfully');
      return true;
    } catch (error) {
      console.error('Error with ChromaDB collection:', error);
      isChromaDBAvailable = false;
      return false;
    }
  } catch (error) {
    console.error('Error initializing ChromaDB:', error);
    isChromaDBAvailable = false;
    return false;
  }
};

/**
 * Get ChromaDB collection with availability check
 * @returns {Promise<Collection|null>} ChromaDB collection or null if not available
 */
export const getCollection = async () => {
  if (!isChromaDBAvailable) {
    // Try to initialize again if not available
    const initialized = await initChromaDB();
    if (!initialized) {
      return null;
    }
  }
  
  if (!client) {
    await initChromaDB();
  }
  
  try {
    return await client.getCollection({ name: COLLECTION_NAME });
  } catch (error) {
    console.error('Error getting ChromaDB collection:', error);
    isChromaDBAvailable = false;
    return null;
  }
};

/**
 * Prepare event data for ChromaDB
 * @param {Object} event - Event object
 * @returns {Object} Formatted event for ChromaDB
 */
const prepareEventForChromaDB = (event) => {
  // Create document text (similar to create_db.py)
  const document = `Event: ${event.title}\n` +
    `Type: ${event.category}\n` +
    `Location: ${event.location}\n` +
    `Date: ${event.date.toISOString()}\n` +
    `Organizer: ${event.organizer || 'Unknown'}\n` +
    `Description: ${event.description}`;
    
  // Prepare metadata (converting any complex objects to strings)
  const metadata = {
    id: event._id.toString(),
    title: event.title,
    description: event.description,
    date: event.date.toISOString(),
    location: event.location,
    virtual: event.virtual,
    category: event.category,
    price: event.price,
    speakers: JSON.stringify(event.speakers || []),
    organizer: event.organizer || '',
    forWomen: event.forWomen || false
  };
  
  return { document, metadata, id: event._id.toString() };
};

/**
 * Ingest events from MongoDB to ChromaDB
 * @param {Array} events - Optional array of events to ingest
 * @returns {Promise<number>} Number of events ingested
 */
export const ingestEventsToChromaDB = async (events = null) => {
  try {
    console.log('Starting event ingestion to ChromaDB...');
    
    // Check if ChromaDB is available
    if (!isChromaDBAvailable) {
      const initialized = await initChromaDB();
      if (!initialized) {
        throw new Error('ChromaDB is not available. Please start the ChromaDB server.');
      }
    }
    
    // Get the collection
    const collection = await getCollection();
    if (!collection) {
      throw new Error('Failed to get ChromaDB collection');
    }
    
    // Fetch events from MongoDB if not provided
    const eventsToIngest = events || await Event.find({});
    
    if (!eventsToIngest || eventsToIngest.length === 0) {
      console.log('No events to ingest.');
      return 0;
    }
    
    console.log(`Preparing to ingest ${eventsToIngest.length} events`);
    
    // Process in batches to avoid memory issues
    const batchSize = 50;
    let ingestedCount = 0;
    
    for (let i = 0; i < eventsToIngest.length; i += batchSize) {
      const batch = eventsToIngest.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(eventsToIngest.length / batchSize)}`);
      
      // Prepare events for ChromaDB
      const formattedEvents = batch.map(prepareEventForChromaDB);
      
      // Extract data for ChromaDB
      const ids = formattedEvents.map(e => e.id);
      const documents = formattedEvents.map(e => e.document);
      const metadatas = formattedEvents.map(e => e.metadata);
      
      // Create embeddings
      const embeddings = await createEmbeddings(documents);
      
      // Get all existing IDs to avoid duplicates
      let existingIdSet = new Set();
      try {
        const existingIds = await collection.get({ ids });
        existingIdSet = new Set(existingIds.ids);
      } catch (error) {
        console.warn('Error checking existing IDs, proceeding with ingest:', error);
      }
      
      // Filter out events that already exist in ChromaDB
      const newIds = [];
      const newDocuments = [];
      const newMetadatas = [];
      const newEmbeddings = [];
      
      for (let j = 0; j < ids.length; j++) {
        if (!existingIdSet.has(ids[j])) {
          newIds.push(ids[j]);
          newDocuments.push(documents[j]);
          newMetadatas.push(metadatas[j]);
          newEmbeddings.push(embeddings[j]);
        }
      }
      
      // Only add if we have new events
      if (newIds.length > 0) {
        try {
          // Add to ChromaDB with pre-computed embeddings
          await collection.add({
            ids: newIds,
            documents: newDocuments,
            metadatas: newMetadatas,
            embeddings: newEmbeddings
          });
          
          ingestedCount += newIds.length;
          console.log(`Added ${newIds.length} new events to ChromaDB`);
        } catch (addError) {
          console.error('Error adding batch to ChromaDB:', addError);
          // Continue with next batch
        }
      } else {
        console.log('No new events to add in this batch');
      }
    }
    
    console.log(`Successfully ingested ${ingestedCount} events to ChromaDB`);
    return ingestedCount;
  } catch (error) {
    console.error('Error ingesting events to ChromaDB:', error);
    isChromaDBAvailable = false;
    throw error;
  }
};

/**
 * Perform a similarity search on events
 * @param {string} query - The search query
 * @param {Object} filters - Additional filters to apply
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} Matching events with scores
 */
export const searchEventsBySimilarity = async (query, filters = {}, limit = 10) => {
  try {
    if (!query || query.trim() === '') {
      return [];
    }
    
    // Check if ChromaDB is available
    if (!isChromaDBAvailable) {
      const initialized = await initChromaDB();
      if (!initialized) {
        throw new Error('ChromaDB is not available for semantic search');
      }
    }
    
    console.log(`Performing similarity search for query: "${query}"`);
    console.log("Filters received:", JSON.stringify(filters));
    
    // Get the collection
    const collection = await getCollection();
    if (!collection) {
      throw new Error('Failed to get ChromaDB collection for search');
    }
    
    // Create embedding for the query
    const queryEmbeddings = await createEmbeddings([query]);
    if (!queryEmbeddings || queryEmbeddings.length === 0) {
      throw new Error('Failed to create embedding for query');
    }
    
    // SIMPLIFY: Try performing search without any filters first
    try {
      console.log("Attempting search without filters");
      
      // Make query without any where clause
      const searchResults = await collection.query({
        queryEmbeddings: [queryEmbeddings[0]], 
        nResults: limit
      });
      
      if (!searchResults || !searchResults.ids || searchResults.ids.length === 0 || searchResults.ids[0].length === 0) {
        console.log("No results found from search");
        return [];
      }
      
      // Format results
      const results = [];
      for (let i = 0; i < searchResults.ids[0].length; i++) {
        results.push({
          id: searchResults.ids[0][i],
          score: 1 - (i / searchResults.ids[0].length)
        });
      }
      
      console.log(`Found ${results.length} matching events (without filters)`);
      
      // If we have filters, we can try to filter the results manually in memory
      if (filters && Object.keys(filters).some(k => filters[k])) {
        console.log("Performing post-processing filtering in memory");
        
        // Get full data for all results
        const fullResults = await collection.get({
          ids: results.map(r => r.id)
        });
        
        // Apply filters manually
        const filteredIndices = [];
        
        for (let i = 0; i < fullResults.ids.length; i++) {
          const metadata = fullResults.metadatas[i];
          let match = true;
          
          // Location filter
          if (filters.location && !metadata.location?.toLowerCase().includes(filters.location.toLowerCase())) {
            match = false;
          }
          
          // Category filter
          if (filters.category && metadata.category?.toLowerCase() !== filters.category.toLowerCase()) {
            match = false;
          }
          
          // For women filter
          if (filters.forWomen === true && metadata.forWomen !== true && metadata.forWomen !== 'true') {
            match = false;
          }
          
          // Virtual filter
          if (filters.virtual === true && metadata.virtual !== true && metadata.virtual !== 'true') {
            match = false;
          }
          
          if (match) {
            filteredIndices.push(i);
          }
        }
        
        // Create filtered results
        const filteredResults = filteredIndices.map(i => ({
          id: fullResults.ids[i],
          score: results.find(r => r.id === fullResults.ids[i])?.score || 0.5
        }));
        
        console.log(`Filtered to ${filteredResults.length} events matching criteria`);
        return filteredResults;
      }
      
      return results;
    } catch (error) {
      console.error("Error during search:", error);
      return [];
    }
  } catch (error) {
    console.error('Error searching events by similarity:', error);
    isChromaDBAvailable = false;
    return [];
  }
};

/**
 * Add a new event to ChromaDB
 * @param {Object} event - The event to add
 * @returns {Promise<string|null>} The ID of the added event or null if failed
 */
export const addEventToChromaDB = async (event) => {
  try {
    // Check if ChromaDB is available
    if (!isChromaDBAvailable) {
      const initialized = await initChromaDB();
      if (!initialized) {
        console.log('ChromaDB not available, skipping event addition');
        return null;
      }
    }
    
    // Get the collection
    const collection = await getCollection();
    if (!collection) {
      return null;
    }
    
    // Prepare event for ChromaDB
    const { document, metadata, id } = prepareEventForChromaDB(event);
    
    // Create embedding for the document
    const embeddings = await createEmbeddings([document]);
    if (!embeddings || embeddings.length === 0) {
      throw new Error('Failed to create embedding for event');
    }
    
    // Add to ChromaDB with pre-computed embedding
    await collection.add({
      ids: [id],
      documents: [document],
      metadatas: [metadata],
      embeddings: [embeddings[0]]
    });
    
    console.log(`Added event ${id} to ChromaDB`);
    return id;
  } catch (error) {
    console.error('Error adding event to ChromaDB:', error);
    return null;
  }
};

export default {
  initChromaDB,
  getCollection,
  ingestEventsToChromaDB,
  searchEventsBySimilarity,
  addEventToChromaDB,
  getHeartbeat
};