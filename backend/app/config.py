import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent
DATASET_PATH = PROJECT_ROOT / "standardiq-dashboard" / "src" / "data" / "standardsDataset.json"
SAMPLE_QUERIES_PATH = PROJECT_ROOT / "standardiq-dashboard" / "src" / "data" / "sampleQueries.json"
CHROMA_PERSIST_DIR = BASE_DIR / "chroma_db"

# Embedding Model (defaults to BAAI/bge-small-en-v1.5 for fast local CPU inference)
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "BAAI/bge-small-en-v1.5")
CHROMA_COLLECTION_NAME = "bis_electrical_standards"
