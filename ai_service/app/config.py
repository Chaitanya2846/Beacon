import os
from dotenv import load_dotenv
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_ATLAS_URI")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not MONGO_URI or not GROQ_API_KEY:
    raise ValueError("Missing Critical Environment Variables: Check MONGO_ATLAS_URI and GROQ_API_KEY")

# 1. Initialize MongoDB Client
db_client = MongoClient(MONGO_URI)
# EXPLICITLY set to 'ai_support' to ensure we never accidentally save to 'test' again
db = db_client["ai_support"] 

# 2. Load Local Open-Source Embedding Model (Used for Vector Search)
# This will download a ~80MB model to your local machine on the very first run.
print("Loading local Sentence-Transformer model (this may take a moment)...")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
print("Local embedding model loaded successfully.")