import chromadb
import json
import logging
import os
import sys
import uuid
import time
from typing import List, Dict, Tuple, Any, Optional
from sentence_transformers import SentenceTransformer
import numpy as np

# ============= CONFIGURATION =============
# Path to store the ChromaDB database
CHROMA_DB_PATH = "./events_chroma_db"

# Path to the JSON file with events data
EVENTS_JSON_PATH = "events_final_20250425_194902.json"

# Whether to recreate the collection even if it already exists
RECREATE_COLLECTION = True

# Batch size for processing events
BATCH_SIZE = 100

# Maximum number of retries for failed batches
MAX_RETRIES = 3

# Sentence Transformer model to use for embeddings
# Options: all-MiniLM-L6-v2, all-mpnet-base-v2, paraphrase-multilingual-MiniLM-L12-v2, etc.
SENTENCE_TRANSFORMER_MODEL = "all-MiniLM-L6-v2"
# ========================================

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("chroma_events_loader.log")
    ]
)
logger = logging.getLogger("chroma_events_loader")

def load_events_from_json(json_path: str) -> List[Dict[str, Any]]:
    """
    Load events from the JSON file.
    
    Args:
        json_path: Path to the JSON file containing events
        
    Returns:
        List of event dictionaries
        
    Raises:
        FileNotFoundError: If the JSON file doesn't exist
        json.JSONDecodeError: If the JSON is malformed
    """
    try:
        if not os.path.exists(json_path):
            raise FileNotFoundError(f"JSON file not found: {json_path}")
            
        with open(json_path, "r", encoding="utf-8") as f:
            events = json.load(f)
            
        if not isinstance(events, list):
            raise ValueError("JSON file must contain a list of events")
            
        logger.info(f"Loaded {len(events)} events from {json_path}")
        return events
    except json.JSONDecodeError as e:
        logger.error(f"Failed to decode JSON: {e}")
        raise
    except Exception as e:
        logger.error(f"Error loading events from JSON: {e}")
        raise

def create_events_collection(chroma_client: chromadb.PersistentClient, recreate: bool = True) -> Optional[chromadb.Collection]:
    """
    Create or get the events collection.
    
    Args:
        chroma_client: ChromaDB client instance
        recreate: Whether to recreate the collection if it exists
        
    Returns:
        ChromaDB collection object or None if creation failed
    """
    try:
        if recreate:
            # Delete collection if it exists
            try:
                chroma_client.delete_collection(name="events")
                logger.info("Deleted existing events collection")
            except Exception as e:
                logger.debug(f"No existing collection to delete: {e}")
                
            # Create new collection with custom embedding function
            # Instead of providing an embedding function, we'll pass embeddings directly when adding documents
            events_collection = chroma_client.create_collection(
                name="events",
                embedding_function=None  # Using None since we'll provide embeddings directly
            )
            logger.info("Created new events collection (without default embedding function)")
        else:
            try:
                # Try to get existing collection
                events_collection = chroma_client.get_collection(
                    name="events",
                    embedding_function=None
                )
                logger.info("Retrieved existing events collection")
            except Exception as e:
                logger.debug(f"Failed to retrieve collection: {e}")
                # Create new collection if it doesn't exist
                events_collection = chroma_client.create_collection(
                    name="events",
                    embedding_function=None
                )
                logger.info("Created new events collection (without default embedding function)")
        
        return events_collection
    except Exception as e:
        logger.error(f"Error creating ChromaDB collection: {e}")
        return None

def fix_duplicate_ids(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Ensure all event IDs are unique by generating new UUIDs for duplicates.
    
    Args:
        events: List of event dictionaries
        
    Returns:
        List of events with unique IDs
    """
    seen_ids = set()
    id_mapping = {}
    
    for event in events:
        original_id = event.get("id", "")
        
        # If no ID or duplicate ID, generate a new one
        if not original_id or original_id in seen_ids:
            new_id = str(uuid.uuid4())
            
            # Ensure the generated UUID is also not a duplicate
            while new_id in seen_ids:
                new_id = str(uuid.uuid4())
                
            if original_id:
                id_mapping[original_id] = new_id
                logger.debug(f"Replacing duplicate ID: {original_id} → {new_id}")
            else:
                logger.debug(f"Added missing ID: {new_id}")
                
            event["id"] = new_id
        
        seen_ids.add(event["id"])
    
    if id_mapping:
        logger.info(f"Fixed {len(id_mapping)} duplicate IDs")
        
    return events

def prepare_events_for_chromadb(events: List[Dict[str, Any]]) -> Tuple[List[str], List[str], List[Dict[str, Any]]]:
    """
    Prepare event data for ChromaDB storage.
    
    Args:
        events: List of event dictionaries
        
    Returns:
        Tuple of (event_ids, event_documents, event_metadatas)
    """
    event_ids = []
    event_documents = []
    event_metadatas = []
    
    for event in events:
        event_id = event.get("id")
        
        # Create document text (this is what gets embedded)
        document = f"Event: {event['title']}\n"
        
        # Add category/type if available
        category = event.get('category', event.get('searchEventType', 'Unknown'))
        document += f"Type: {category}\n"
        
        # Add location and date
        document += f"Location: {event['location']}\n"
        document += f"Date: {event.get('date', 'Unknown')}\n"
        
        # Add organizer if available
        organizer = event.get('organizer', 'Unknown')
        document += f"Organizer: {organizer}\n"
        
        # Add description
        document += f"Description: {event['description']}"
        
        # Convert any list fields to strings to avoid ChromaDB error
        processed_event = {}
        for key, value in event.items():
            if isinstance(value, list):
                # For lists containing dictionaries (like speakers), 
                # we use JSON serialization to preserve structure
                if value and isinstance(value[0], dict):
                    processed_event[key] = json.dumps(value)
                else:
                    processed_event[key] = ", ".join(map(str, value))
            elif value is None:  # Replace None values with empty strings
                processed_event[key] = ""
            else:
                processed_event[key] = value
        
        event_ids.append(event_id)
        event_documents.append(document)
        event_metadatas.append(processed_event)
    
    return event_ids, event_documents, event_metadatas

def create_embeddings(documents: List[str], model_name: str) -> List[List[float]]:
    """
    Create embeddings for documents using Sentence Transformers.
    
    Args:
        documents: List of document strings to embed
        model_name: Name of the Sentence Transformers model to use
        
    Returns:
        List of embedding vectors
    """
    logger.info(f"Creating embeddings using SentenceTransformer model: {model_name}")
    
    try:
        # Load the model
        model = SentenceTransformer(model_name)
        logger.info(f"Loaded SentenceTransformer model: {model_name}")
        
        # Create embeddings in batches to avoid memory issues with large datasets
        batch_size = 64  # Adjust based on available memory
        all_embeddings = []
        
        for i in range(0, len(documents), batch_size):
            batch = documents[i:i+batch_size]
            logger.debug(f"Embedding batch {i//batch_size + 1}/{len(documents)//batch_size + 1}")
            
            # Create embeddings
            batch_embeddings = model.encode(batch, show_progress_bar=True)
            all_embeddings.extend(batch_embeddings.tolist())
            
        logger.info(f"Created {len(all_embeddings)} embeddings")
        return all_embeddings
    except Exception as e:
        logger.error(f"Error creating embeddings: {e}")
        raise

def store_events_in_batches(
    collection: chromadb.Collection, 
    events: List[Dict[str, Any]], 
    model_name: str,
    batch_size: int = 100,
    max_retries: int = 3
) -> int:
    """
    Store events in ChromaDB in batches with retry mechanism.
    
    Args:
        collection: ChromaDB collection
        events: List of event dictionaries
        model_name: Name of the Sentence Transformers model to use
        batch_size: Number of events to process in each batch
        max_retries: Maximum number of retry attempts for failed batches
        
    Returns:
        Number of successfully added events
    """
    event_ids, event_documents, event_metadatas = prepare_events_for_chromadb(events)
    
    total_events = len(event_ids)
    logger.info(f"Preparing to add {total_events} events to ChromaDB in batches of {batch_size}")
    
    success_count = 0
    
    for i in range(0, total_events, batch_size):
        end_idx = min(i + batch_size, total_events)
        batch_ids = event_ids[i:end_idx]
        batch_documents = event_documents[i:end_idx]
        batch_metadatas = event_metadatas[i:end_idx]
        
        batch_num = i//batch_size + 1
        total_batches = (total_events + batch_size - 1)//batch_size
        
        logger.info(f"Processing batch {batch_num}/{total_batches} with {len(batch_documents)} documents")
        
        # Create embeddings for this batch
        try:
            batch_embeddings = create_embeddings(batch_documents, model_name)
        except Exception as e:
            logger.error(f"Failed to create embeddings for batch {batch_num}: {e}")
            continue
        
        retries = 0
        batch_success = False
        
        while not batch_success and retries < max_retries:
            try:
                collection.add(
                    documents=batch_documents,
                    metadatas=batch_metadatas,
                    ids=batch_ids,
                    embeddings=batch_embeddings  # Provide pre-computed embeddings
                )
                success_count += len(batch_ids)
                batch_success = True
                logger.info(f"Added batch {batch_num}/{total_batches}: {len(batch_ids)} events")
            except Exception as e:
                retries += 1
                logger.warning(f"Error adding batch {batch_num} (attempt {retries}/{max_retries}): {e}")
                
                if retries < max_retries:
                    # Exponential backoff
                    wait_time = 2 ** retries
                    logger.info(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    logger.error(f"Failed to add batch {batch_num} after {max_retries} attempts")
    
    logger.info(f"Successfully added {success_count}/{total_events} events to ChromaDB")
    return success_count

def test_event_queries(collection: chromadb.Collection, model: SentenceTransformer) -> bool:
    """
    Test querying the events collection.
    
    Args:
        collection: ChromaDB collection
        model: SentenceTransformer model for creating query embeddings
        
    Returns:
        True if queries were successful, False otherwise
    """
    if not collection or collection.count() == 0:
        logger.warning("No events data to query")
        return False
    
    try:
        # Queries to test
        queries = [
            "AI/ML events in Bangalore",
            "Hackathons for Software Engineers"
        ]
        
        for query_text in queries:
            # Create embedding for query
            query_embedding = model.encode([query_text])[0].tolist()
            
            # Query using the embedding
            query_results = collection.query(
                query_embeddings=[query_embedding],
                n_results=3
            )
            
            logger.info(f"\nSample event search results for '{query_text}':")
            for i, (doc, metadata) in enumerate(zip(
                query_results['documents'][0], 
                query_results['metadatas'][0]
            )):
                logger.info(f"\n--- Event {i+1} ---")
                logger.info(f"Title: {metadata['title']}")
                logger.info(f"Category: {metadata.get('category', 'Unknown')}")
                logger.info(f"Location: {metadata['location']}")
                logger.info(f"Date: {metadata.get('date', 'Unknown')}")
            
        # Verify we got results
        if all(len(query_results['ids'][0]) > 0 for query_results in [
            collection.query(query_embeddings=[model.encode([q])[0].tolist()], n_results=3)
            for q in queries
        ]):
            logger.info("Query tests completed successfully")
            return True
        else:
            logger.warning("Some queries returned no results")
            return False
            
    except Exception as e:
        logger.error(f"Error during test queries: {e}")
        return False

def main():
    """Main execution function."""
    start_time = time.time()
    
    logger.info(f"Starting ChromaDB Event Data Loader with Sentence Transformers")
    logger.info(f"Database path: {CHROMA_DB_PATH}")
    logger.info(f"JSON file path: {EVENTS_JSON_PATH}")
    logger.info(f"Recreate collection: {RECREATE_COLLECTION}")
    logger.info(f"Batch size: {BATCH_SIZE}")
    logger.info(f"Max retries: {MAX_RETRIES}")
    logger.info(f"Sentence Transformer model: {SENTENCE_TRANSFORMER_MODEL}")
    
    # Ensure the database directory exists
    os.makedirs(CHROMA_DB_PATH, exist_ok=True)
    
    # Initialize ChromaDB client
    try:
        chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    except Exception as e:
        logger.error(f"Failed to initialize ChromaDB client: {e}")
        sys.exit(1)
    
    # Load the Sentence Transformer model
    try:
        model = SentenceTransformer(SENTENCE_TRANSFORMER_MODEL)
        logger.info(f"Successfully loaded Sentence Transformer model: {SENTENCE_TRANSFORMER_MODEL}")
    except Exception as e:
        logger.error(f"Failed to load Sentence Transformer model: {e}")
        sys.exit(1)
    
    # Load events from JSON file
    try:
        events = load_events_from_json(EVENTS_JSON_PATH)
        if not events:
            logger.warning("No events to process. Exiting.")
            sys.exit(0)
    except Exception as e:
        logger.error(f"Failed to load events: {e}")
        sys.exit(1)
    
    # Fix duplicate IDs
    events = fix_duplicate_ids(events)
    
    # Create or get the ChromaDB collection
    collection = create_events_collection(chroma_client, recreate=RECREATE_COLLECTION)
    if not collection:
        logger.error("Failed to create ChromaDB collection. Exiting.")
        sys.exit(1)
    
    # Store events in the collection
    success_count = store_events_in_batches(
        collection, 
        events,
        model_name=SENTENCE_TRANSFORMER_MODEL,
        batch_size=BATCH_SIZE,
        max_retries=MAX_RETRIES
    )
    
    # Test querying the collection
    query_success = test_event_queries(collection, model)
    
    # Summary
    end_time = time.time()
    elapsed_time = end_time - start_time
    
    logger.info("\nChromaDB creation completed!")
    logger.info(f"ChromaDB is stored at: {os.path.abspath(CHROMA_DB_PATH)}")
    logger.info(f"Total events in database: {collection.count()}")
    logger.info(f"SentenceTransformer model used: {SENTENCE_TRANSFORMER_MODEL}")
    logger.info(f"Total processing time: {elapsed_time:.2f} seconds")
    
    if success_count < len(events):
        logger.warning(f"Not all events were added ({success_count}/{len(events)})")
        
    if not query_success:
        logger.warning("Query tests did not complete successfully")
        
    logger.info("Process complete")

if __name__ == "__main__":
    main()