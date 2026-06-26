from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
import fitz  # PyMuPDF
from fastapi.middleware.cors import CORSMiddleware
from langchain.text_splitter import RecursiveCharacterTextSplitter
from bson.objectid import ObjectId
import logging
import google.generativeai as genai
import uuid
from datetime import datetime

from app.config import db, embedding_model

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Support Platform - Local Embedding Microservice")

# --- CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# ==========================================
# MODEL SCHEMAS
# ==========================================
class ChatRequest(BaseModel):
    organizationId: str
    question: str

# ==========================================
# ENDPOINT 1: DIRECT DOCUMENT UPLOAD & INGESTION
# ==========================================
@app.post("/api/v1/ai/ingest")
async def ingest_document(
    file: UploadFile = File(...), 
    organizationId: str = Form(...)
):
    logger.info(f"Received file: {file.filename} for Org: {organizationId}")
    
    try:
        # 1. Read the PDF File directly from memory
        pdf_bytes = await file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        full_text = ""
        for page in doc:
            full_text += page.get_text()
            
        if not full_text.strip():
            raise ValueError("Extracted text is empty. PDF might be an image/scan without OCR.")
            
        logger.info(f"Extraction complete. Extracted {len(full_text)} characters.")
            
        # 2. Apply Recursive Token Chunking 
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=150,
            length_function=len
        )
        chunks = text_splitter.split_text(full_text)
        logger.info(f"Split text into {len(chunks)} chunks.")
        
        # 3. Generate Embeddings LOCALLY
        logger.info("Generating vectors locally...")
        embeddings = embedding_model.encode(chunks).tolist()
        
        # 4. Create Master Document Record for UI tracking
        document_id = str(uuid.uuid4())
        doc_record = {
            "organization_id": ObjectId(organizationId),
            "document_id": document_id,
            "file_name": file.filename,
            "status": "SUCCESS",
            "timestamp": datetime.utcnow()
        }
        db["documents"].insert_one(doc_record)

        # 5. Batch Upload chunks directly to MongoDB Atlas
        documents_to_insert = []
        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            documents_to_insert.append({
                "organization_id": ObjectId(organizationId),
                "document_id": document_id,
                "file_name": file.filename,
                "chunk_index": idx,
                "content": chunk,
                "embedding": embedding  # 384 dimensions
            })
            
        if documents_to_insert:
            db["chunks"].insert_many(documents_to_insert)
            
        logger.info(f"Successfully vectorized Document: {file.filename}")
        return {"status": "SUCCESS", "chunks_processed": len(chunks), "file_name": file.filename}
        
    except Exception as e:
        logger.error(f"Failed to process document {file.filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# ENDPOINT 2: CHAT RETRIEVAL & GENERATION (RAG)
# ==========================================
@app.post("/api/v1/ai/chat")
async def chat_with_knowledge_base(payload: ChatRequest):
    logger.info(f"--- CHAT DEBUG START ---")
    logger.info(f"Received query for organizationId: {payload.organizationId}")
    logger.info(f"User Question: {payload.question}")
    
    try:
        # 1. Save User Question to history immediately
        db["chat_history"].insert_one({
            "organization_id": ObjectId(payload.organizationId),
            "role": "user",
            "text": payload.question,
            "timestamp": datetime.utcnow()
        })

        # 2. Convert the user's question into a vector locally
        question_vector = embedding_model.encode(payload.question).tolist()
        
        # 3. Execute Atlas Vector Search
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": question_vector,
                    "numCandidates": 100, 
                    "limit": 10
                }
            },
            {
                "$match": {
                    "organization_id": ObjectId(payload.organizationId)
                }
            },
            {
                "$limit": 3
            },
            {
                "$project": {
                    "content": 1,
                    "organization_id": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]
        
        results = list(db["chunks"].aggregate(pipeline))
        logger.info(f"Vector Search matched {len(results)} documents.")
        
        # 4. Compile the retrieved chunks into a single context string
        context_str = ""
        for idx, doc in enumerate(results):
            logger.info(f"Matched Doc {idx+1} (Score: {doc.get('score')}): {doc['content'][:50]}...")
            context_str += f"[Document Source {idx+1}]:\n{doc['content']}\n\n"
            
        if not context_str:
            logger.warning("Vector search returned zero results for this context window.")
            context_str = "No specific reference documents found in the database matching this query."

        # 5. Engineer the prompt instructing Gemini to act as an elite support agent
        system_instruction = (
            "You are an elite AI support agent. Your goal is to answer the customer's question "
            "truthfully and concisely using ONLY the provided context below. If the answer cannot be found "
            "in the context, politely state that you don't have that information.\n\n"
            f"Context from internal knowledge base:\n{context_str}"
        )
        
        # 6. Generate the answer using Gemini Flash with Graceful Error Handling
        model = genai.GenerativeModel(model_name='gemini-2.5-flash')
        full_prompt = f"{system_instruction}\n\nUser Question: {payload.question}"
        
        try:
            response = model.generate_content(full_prompt)
            answer_text = response.text
        except Exception as gemini_err:
            logger.error(f"Gemini API Error: {str(gemini_err)}")
            if "429" in str(gemini_err) or "quota" in str(gemini_err).lower():
                answer_text = "⚠️ The system is currently experiencing high demand. Please wait a few seconds and try your question again."
            else:
                answer_text = "An error occurred while generating a response. Please try again."
        
        sources_used = [{"id": str(r["_id"]), "score": r.get("score", 0)} for r in results]

        # 7. Save Assistant Answer to history
        db["chat_history"].insert_one({
            "organization_id": ObjectId(payload.organizationId),
            "role": "assistant",
            "text": answer_text,
            "sources": sources_used,
            "timestamp": datetime.utcnow()
        })

        logger.info(f"--- CHAT DEBUG END ---")
        
        return {
            "answer": answer_text,
            "sources_used": sources_used
        }
        
    except Exception as e:
        logger.error(f"Chat execution exception occurred: {str(e)}")
        logger.info(f"--- CHAT DEBUG END WITH ERROR ---")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# ENDPOINT 3: FETCH PERSISTENT CHAT HISTORY
# ==========================================
@app.get("/api/v1/ai/chat/{organizationId}")
async def get_chat_history(organizationId: str):
    try:
        # Fetch all history messages sorted oldest to newest
        history = list(db["chat_history"].find(
            {"organization_id": ObjectId(organizationId)}
        ).sort("timestamp", 1))
        
        formatted_history = []
        for msg in history:
            formatted_history.append({
                "role": msg.get("role"),
                "text": msg.get("text"),
                "sources": msg.get("sources", [])
            })
            
        return formatted_history
    except Exception as e:
        logger.error(f"Failed to fetch chat history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# ENDPOINT 4: FETCH PERSISTENT DOCUMENTS
# ==========================================
@app.get("/api/v1/ai/documents/{organizationId}")
async def get_documents(organizationId: str):
    try:
        # Fetch documents sorted newest first
        docs = list(db["documents"].find(
            {"organization_id": ObjectId(organizationId)}
        ).sort("timestamp", -1))
        
        formatted_docs = []
        for doc in docs:
            formatted_docs.append({
                "id": str(doc["_id"]),
                "name": doc.get("file_name", "Unnamed Document"),
                "status": doc.get("status", "SUCCESS"),
                "date": doc.get("timestamp", datetime.utcnow()).strftime("%Y-%m-%d")
            })
            
        return formatted_docs
    except Exception as e:
        logger.error(f"Failed to fetch documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))