import connectDB from "./db/index.js";
import dotenv from 'dotenv'
import { createSocketServer } from "./SocketIo/SocketIo.js";
import chromaDBService from "./services/chromaDB.service.js";

dotenv.config({
    path:'.env'
})

const server = createSocketServer();

connectDB()
.then(async () => {
    console.log("MongoDB Connected Successfully");
    
    // Initialize ChromaDB after MongoDB connection is established
    try {
        await chromaDBService.initChromaDB();
        console.log("ChromaDB initialized successfully");
        
        // Optional: Sync events from MongoDB to ChromaDB
        // This ensures new events are available for vector search
        // Comment out if you want to run this manually or through a separate process
        try {
            const ingestedCount = await chromaDBService.ingestEventsToChromaDB();
            console.log(`Synchronized ${ingestedCount} events to ChromaDB`);
        } catch (syncError) {
            console.error("Error synchronizing events to ChromaDB:", syncError);
            // Continue server startup even if sync fails
        }
    } catch (chromaError) {
        console.error("Error initializing ChromaDB:", chromaError);
        // Continue server startup even if ChromaDB initialization fails
    }
    
    server.listen(process.env.PORT || 8000, () => {
        console.log(`APP IS LISTENING ON PORT ${process.env.PORT || 8000}`);
    });
})
.catch((err) => {
    console.log("MongoDB Connection Failed", err);
});