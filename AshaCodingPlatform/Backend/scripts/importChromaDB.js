// Backend/src/scripts/importChromaDB.js
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

// Load environment variables
dotenv.config();

// ChromaDB paths
const CHROMA_DB_PATH = process.env.CHROMA_DB_PATH || path.join(process.cwd(), 'chroma_db');
const COLLECTION_NAME = 'events';

/**
 * Import a ChromaDB file into the configured location
 */
const importChromaDB = () => {
  try {
    // Get source path from command line arguments
    const sourcePath = process.argv[2];
    
    if (!sourcePath) {
      console.error('Error: Source path not provided');
      console.log('Usage: node importChromaDB.js <path_to_chroma_file>');
      process.exit(1);
    }
    
    console.log(`Importing ChromaDB from: ${sourcePath}`);
    console.log(`To destination: ${CHROMA_DB_PATH}`);
    
    // Check if source exists
    if (!fs.existsSync(sourcePath)) {
      console.error(`Error: Source file/directory does not exist: ${sourcePath}`);
      process.exit(1);
    }
    
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(CHROMA_DB_PATH)) {
      console.log(`Creating destination directory: ${CHROMA_DB_PATH}`);
      fs.mkdirSync(CHROMA_DB_PATH, { recursive: true });
    }
    
    // Check if the source is a file or directory
    const sourceStats = fs.statSync(sourcePath);
    
    if (sourceStats.isDirectory()) {
      // It's a directory, copy all contents
      console.log('Source is a directory, copying all contents...');
      
      // Use system commands for directory copy since fs methods can be complex for recursive copies
      if (process.platform === 'win32') {
        // Windows
        execSync(`xcopy "${sourcePath}" "${CHROMA_DB_PATH}" /E /I /Y`);
      } else {
        // Unix-like systems
        execSync(`cp -R "${sourcePath}/"* "${CHROMA_DB_PATH}/"`);
      }
    } else {
      // It's a file, check if it's a zip or tar file
      const ext = path.extname(sourcePath).toLowerCase();
      
      if (ext === '.zip') {
        console.log('Source is a zip file, extracting...');
        
        // Extract zip file
        if (process.platform === 'win32') {
          // Windows - Use PowerShell to extract
          execSync(`powershell Expand-Archive -Path "${sourcePath}" -DestinationPath "${CHROMA_DB_PATH}" -Force`);
        } else {
          // Unix-like systems
          execSync(`unzip -o "${sourcePath}" -d "${CHROMA_DB_PATH}"`);
        }
      } else if (ext === '.tar' || ext === '.gz') {
        console.log('Source is a tar/gz file, extracting...');
        
        // Extract tar/gz file
        execSync(`tar -xf "${sourcePath}" -C "${CHROMA_DB_PATH}"`);
      } else {
        // It's a regular file, just copy it
        console.log('Source is a regular file, copying...');
        fs.copyFileSync(sourcePath, path.join(CHROMA_DB_PATH, path.basename(sourcePath)));
      }
    }
    
    console.log('Import complete!');
    console.log(`You can now run 'node manageChromaDB.js stats' to verify the import.`);
    
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
};

// Execute the import
importChromaDB();