from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
import fitz  # PyMuPDF
from fastapi.middleware.cors import CORSMiddleware
from langchain.text_splitter import RecursiveCharacterTextSplitter
from bson.objectid import ObjectId
import logging
import uuid
from datetime import datetime
import os

# Import official Groq client
from groq import Groq

from app.config import db, embedding_model

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Support Platform - Local Embedding Microservice")

# Initialize Groq Client
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_API_KEY:
    logger.warning("GROQ_API_KEY is not set in environment variables!")
groq_client = Groq(api_key=GROQ_API_KEY)

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
                "embedding": embedding  
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
# ==========================================
# ENDPOINT 2: CHAT RETRIEVAL & GENERATION (RAG)
# ==========================================
@app.post("/api/v1/ai/chat")
async def chat_with_knowledge_base(payload: ChatRequest):
    logger.info(f"--- CHAT DEBUG START ---")
    logger.info(f"Received query for organizationId: {payload.organizationId}")
    logger.info(f"User Question: {payload.question}")
    
    try:
        # 1. Fetch Recent Chat History (Conversational Memory)
        # Grab the last 6 messages (3 turns) to give the AI context for pronouns (it, they, he)
        recent_history_cursor = db["chat_history"].find(
            {"organization_id": ObjectId(payload.organizationId)}
        ).sort("timestamp", -1).limit(6)
        
        # Reverse the list so it is chronological (oldest to newest)
        recent_history = list(recent_history_cursor)[::-1]

        # 2. Save Current User Question to history immediately
        db["chat_history"].insert_one({
            "organization_id": ObjectId(payload.organizationId),
            "role": "user",
            "text": payload.question,
            "timestamp": datetime.utcnow()
        })

        # 3. Convert the user's question into a vector locally
        question_vector = embedding_model.encode(payload.question).tolist()
        
        # 4. Execute Atlas Vector Search (Upgraded Parameters)
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": question_vector,
                    "numCandidates": 150, # Increased for wider net
                    "limit": 12           # Increased to 12 chunks for Multi-Hop Summaries
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
                    "organization_id": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]
        
        results = list(db["chunks"].aggregate(pipeline))
        logger.info(f"Vector Search matched {len(results)} documents.")
        
        # 5. Compile the retrieved chunks into a single context string
        context_str = ""
        for idx, doc in enumerate(results):
            context_str += f"[Document Source {idx+1}]:\n{doc['content']}\n\n"
            
        if not context_str:
            context_str = "No specific reference documents found in the database matching this query."

        # 6. Elite-Level System Prompting
        # This explicitly instructs Llama-3 to use history, recognize synonyms, and handle multi-hop logic.
        # 6. Elite-Level System Prompting (ZERO HALLUCINATION STRICTNESS)
        system_instruction = (
            "You are an elite AI support agent representing this organization. Your primary duty is to answer the user's questions based STRICTLY and ONLY on the provided Context and the Conversation History.\n\n"
            "--- BEHAVIOR GUIDELINES ---\n"
            "1. ZERO HALLUCINATION: You are forbidden from using external knowledge. Do not invent examples, do not explain rules unless the explanation is explicitly in the text, and do not add context outside the provided chunks. Use the exact terminology found in the document.\n"
            "2. CONFIDENT RETRIEVAL: Use the retrieved context to answer. If the answer is present in the retrieved context, answer confidently. Do not refuse to answer if the context clearly states the fact.\n"
            "3. CONVERSATIONAL MEMORY: Use the previous messages in the chat history to understand context, follow-up questions, and pronouns (e.g., 'it', 'they', 'their').\n"
            "4. SYNONYMS & INTENT: Recognize semantic synonyms (e.g., 'irrigate' means 'water'), but when generating your answer, use the literal document wording.\n"
            "5. GREETINGS: If the user says hello or makes small talk, respond warmly and ask how you can help them.\n"
            "6. FALLBACK: If the exact answer cannot be reasonably deduced from the context, you MUST say exactly: 'I couldn't find this information in the uploaded knowledge base. Would you like me to connect you with a human agent?' Do not attempt to guess.\n\n"
            f"--- KNOWLEDGE BASE CONTEXT ---\n{context_str}"
        )
        
        # 7. Build the Messages Array for Groq
        messages_for_groq = [{"role": "system", "content": system_instruction}]
        
        # Append historical messages
        for msg in recent_history:
            messages_for_groq.append({"role": msg["role"], "content": msg["text"]})
            
        # Append the current question
        messages_for_groq.append({"role": "user", "content": payload.question})

        # 8. Generate answer using Groq
        try:
            completion = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages_for_groq,
                temperature=0.2, # Kept low for factual accuracy
                max_tokens=1000
            )
            answer_text = completion.choices[0].message.content
        except Exception as groq_err:
            logger.error(f"Groq API Error: {str(groq_err)}")
            answer_text = "⚠️ An error occurred while generating a response from Groq. Please verify your API key and try again."
        
        sources_used = [{"id": str(r["_id"]), "score": r.get("score", 0)} for r in results]

        # 9. Save Assistant Answer to history
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
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# ENDPOINT 3: FETCH PERSISTENT CHAT HISTORY
# ==========================================
@app.get("/api/v1/ai/chat/{organizationId}")
async def get_chat_history(organizationId: str):
    try:
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
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# ENDPOINT 4: FETCH PERSISTENT DOCUMENTS
# ==========================================
@app.get("/api/v1/ai/documents/{organizationId}")
async def get_documents(organizationId: str):
    try:
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
        raise HTTPException(status_code=500, detail=str(e))