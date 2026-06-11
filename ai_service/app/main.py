from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import fitz  # PyMuPDF
from fastapi.middleware.cors import CORSMiddleware
import requests
from langchain.text_splitter import RecursiveCharacterTextSplitter
from bson.objectid import ObjectId
import logging
import google.generativeai as genai  # Added Gemini Import

from app.config import db, embedding_model

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Support Platform - Local Embedding Microservice")

app = FastAPI(title="AI Support Platform - Local Embedding Microservice")

# --- ADD THIS ENTIRE BLOCK ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (perfect for local development)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (POST, GET, OPTIONS, etc.)
    allow_headers=["*"],  # Allows all headers
)
# -----------------------------

# ... your endpoints continue below ...

# ==========================================
# MODEL SCHEMAS
# ==========================================
class ProcessRequest(BaseModel):
    documentId: str
    organizationId: str
    fileUrl: str

class ChatRequest(BaseModel):
    organizationId: str
    question: str

# ==========================================
# ENDPOINT 1: DOCUMENT EXTRACTION & EMBEDDING
# ==========================================
@app.post("/api/v1/ai/process-document")
async def process_document(payload: ProcessRequest):
    logger.info(f"Received processing request for Document: {payload.documentId}")
    
    try:
        # 1. Fetch file from URL directly into memory
        response = requests.get(payload.fileUrl)
        response.raise_for_status()
        pdf_bytes = response.content
        
        # 2. Extract text page by page via PyMuPDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        full_text = ""
        for page in doc:
            full_text += page.get_text()
            
        if not full_text.strip():
            raise ValueError("Extracted text is empty. PDF might be an image/scan without OCR.")
            
        logger.info(f"Extraction complete. Extracted {len(full_text)} characters.")
            
        # 3. Apply Recursive Token Chunking 
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=150,
            length_function=len
        )
        chunks = text_splitter.split_text(full_text)
        logger.info(f"Split text into {len(chunks)} chunks.")
        
        # 4. Generate Embeddings LOCALLY (Zero Cost)
        logger.info("Generating vectors locally...")
        embeddings = embedding_model.encode(chunks).tolist()
        
        # 5. Batch Upload directly to MongoDB Atlas
        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            db["chunks"].insert_one({
                "organization_id": ObjectId(payload.organizationId),
                "document_id": ObjectId(payload.documentId),
                "chunk_index": idx,
                "content": chunk,
                "embedding": embedding  # These are 384 dimensions
            })
            
        # 6. Flip status to COMPLETED in the parent Node.js collection
        db["documents"].update_one(
            {"_id": ObjectId(payload.documentId)},
            {"$set": {"status": "COMPLETED"}}
        )
        
        logger.info(f"Successfully vectorized Document: {payload.documentId}")
        return {"status": "SUCCESS", "chunks_processed": len(chunks)}
        
    except Exception as e:
        logger.error(f"Failed to process document {payload.documentId}: {str(e)}")
        db["documents"].update_one(
            {"_id": ObjectId(payload.documentId)},
            {"$set": {"status": "FAILED", "error_log": str(e)}}
        )
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# ENDPOINT 2: CHAT RETRIEVAL & GENERATION (RAG)
# ==========================================
@app.post("/api/v1/ai/chat")
async def chat_with_knowledge_base(payload: ChatRequest):
    logger.info(f"Received chat request for organization: {payload.organizationId}")
    
    try:
        # 1. Convert the user's question into a vector locally
        question_vector = embedding_model.encode(payload.question).tolist()
        
        # 2. Execute an Atlas Vector Search against the chunks collection
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": question_vector,
                    "numCandidates": 10,
                    "limit": 3
                }
            },
            {
                "$match": {
                    "organization_id": ObjectId(payload.organizationId)
                }
            },
            {
                "$project": {
                    "content": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]
        
        results = list(db["chunks"].aggregate(pipeline))
        
        # 3. Compile the retrieved chunks into a single context string
        context_str = ""
        for idx, doc in enumerate(results):
            context_str += f"[Document Source {idx+1}]:\n{doc['content']}\n\n"
            
        if not context_str:
            context_str = "No specific reference documents found in the database matching this query."

        # 4. Engineer the prompt instructing Gemini to act as an elite support agent
        system_instruction = (
            "You are an elite AI support agent. Your goal is to answer the customer's question "
            "truthfully and concisely using ONLY the provided context below. If the answer cannot be found "
            "in the context, politely state that you don't have that information.\n\n"
            f"Context from internal knowledge base:\n{context_str}"
        )
        
        # 5. Generate the answer using Gemini Flash
        # (Removed the unsupported system_instruction parameter)
        model = genai.GenerativeModel(model_name='gemini-2.5-flash')
        
        # Combine the context and the user's question into one payload
        full_prompt = f"{system_instruction}\n\nUser Question: {payload.question}"
        
        response = model.generate_content(full_prompt)
        
        return {
            "answer": response.text,
            "sources_used": [{"id": str(r["_id"]), "score": r["score"]} for r in results]
        }
        
    except Exception as e:
        logger.error(f"Chat execution exception occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))