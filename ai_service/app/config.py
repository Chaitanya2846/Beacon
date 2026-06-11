import os
from dotenv import load_dotenv
from pymongo import MongoClient
import google.generativeai as genai
from sentence_transformers import SentenceTransformer

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_ATLAS_URI")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not MONGO_URI or not GEMINI_API_KEY:
    raise ValueError("Missing Critical Environment Variables: Check MONGO_ATLAS_URI and GEMINI_API_KEY")

# 1. Initialize MongoDB Client
db_client = MongoClient(MONGO_URI)
db = db_client.get_default_database(default="test") 

# 2. Configure Google Gemini (Free Tier LLM for later use)
genai.configure(api_key=GEMINI_API_KEY)

# 3. Load Local Open-Source Embedding Model
# This will download a ~80MB model to your local machine on the very first run.
print("Loading local Sentence-Transformer model (this may take a moment)...")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
print("Local embedding model loaded successfully.")