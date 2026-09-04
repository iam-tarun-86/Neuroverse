import json
import logging
from typing import List, Dict, Any
from pathlib import Path
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

from app.config import (
    DATASET_PATH,
    CHROMA_PERSIST_DIR,
    EMBEDDING_MODEL_NAME,
    CHROMA_COLLECTION_NAME
)

logger = logging.getLogger("standardiq.database")
logging.basicConfig(level=logging.INFO)

class StandardsVectorDB:
    def __init__(self):
        logger.info(f"Initializing embedding model: {EMBEDDING_MODEL_NAME}")
        self.model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        
        # Ensure persistence directory exists
        CHROMA_PERSIST_DIR.mkdir(parents=True, exist_ok=True)
        
        # Initialize ChromaDB persistent client
        self.client = chromadb.PersistentClient(path=str(CHROMA_PERSIST_DIR))
        self.collection = self.client.get_or_create_collection(
            name=CHROMA_COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )
        
        self._ensure_dataset_indexed()

    def _ensure_dataset_indexed(self):
        """Indexes standardsDataset.json into ChromaDB if collection is empty or out of sync."""
        existing_count = self.collection.count()
        
        if not DATASET_PATH.exists():
            raise FileNotFoundError(f"Standards dataset not found at: {DATASET_PATH}")
            
        with open(DATASET_PATH, "r", encoding="utf-8") as f:
            standards = json.load(f)
            
        if existing_count == len(standards):
            logger.info(f"ChromaDB collection already contains {existing_count} indexed standards.")
            return

        logger.info(f"Indexing {len(standards)} standards into ChromaDB (collection count was {existing_count})...")
        
        ids = []
        documents = []
        metadatas = []
        
        for std in standards:
            sid = std["standard_id"]
            title = std["title"]
            scope = std["scope_text"]
            
            # Formulate rich text representation for dense retrieval
            doc_text = f"Standard ID: {sid}\nTitle: {title}\nScope: {scope}"
            
            ids.append(sid)
            documents.append(doc_text)
            
            # Chroma metadata values must be str, int, float, or bool
            metadatas.append({
                "standard_id": sid,
                "title": title,
                "scope_text": scope,
                "status": std.get("status", "Active"),
                "sector": std.get("sector", "Electrical"),
                "certification": std.get("certification", "None"),
                "normative_references_json": json.dumps(std.get("normative_references", [])),
                "reference_type_json": json.dumps(std.get("reference_type", {}))
            })
            
        # Generate normalized dense embeddings
        embeddings = self.model.encode(documents, normalize_embeddings=True, show_progress_bar=True).tolist()
        
        # Upsert into ChromaDB
        self.collection.upsert(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )
        logger.info(f"Successfully indexed {self.collection.count()} standards into ChromaDB.")

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Encodes query and retrieves top_k standards ranked by cosine similarity."""
        query_vec = self.model.encode([query], normalize_embeddings=True).tolist()
        
        results = self.collection.query(
            query_embeddings=query_vec,
            n_results=top_k,
            include=["metadatas", "distances", "documents"]
        )
        
        output = []
        metadatas = results["metadatas"][0]
        distances = results["distances"][0]
        
        for rank_idx, (meta, dist) in enumerate(zip(metadatas, distances), start=1):
            # For cosine distance: distance = 1 - cosine_similarity
            similarity = max(0.0, min(1.0, 1.0 - dist))
            
            output.append({
                "rank": rank_idx,
                "standard_id": meta["standard_id"],
                "title": meta["title"],
                "scope_text": meta["scope_text"],
                "status": meta["status"],
                "sector": meta["sector"],
                "certification": meta["certification"],
                "similarity_score": round(similarity, 4),
                "normative_references": json.loads(meta.get("normative_references_json", "[]")),
                "reference_type": json.loads(meta.get("reference_type_json", "{}"))
            })
            
        return output

# Singleton instance
db_instance = None

def get_db() -> StandardsVectorDB:
    global db_instance
    if db_instance is None:
        db_instance = StandardsVectorDB()
    return db_instance
