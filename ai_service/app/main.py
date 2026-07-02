from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response
from pydantic import BaseModel
import fitz  # PyMuPDF
from fastapi.middleware.cors import CORSMiddleware
from langchain.text_splitter import RecursiveCharacterTextSplitter
from bson.objectid import ObjectId
from bson.binary import Binary
import logging
import uuid
from datetime import datetime, timedelta
import os
import zipfile
from io import BytesIO
import xml.etree.ElementTree as ET
import base64

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
    expose_headers=["Content-Disposition"],
)

# ==========================================
# MODEL SCHEMAS
# ==========================================
class ChatRequest(BaseModel):
    organizationId: str
    question: str

class RenameDocumentRequest(BaseModel):
    name: str

class UpdateDocumentMetadataRequest(BaseModel):
    category: str | None = None
    tags: list[str] | None = None

def serialize_date(value):
    if isinstance(value, datetime):
        return value.isoformat()
    return datetime.utcnow().isoformat()

def normalize_status(status):
    normalized = str(status or "PENDING").upper()
    if normalized == "SUCCESS":
        return "COMPLETED"
    return normalized

def file_type_from_name(file_name):
    extension = file_name.rsplit(".", 1)[-1].upper() if "." in file_name else "PDF"
    if extension == "MARKDOWN":
        return "MD"
    return extension

def build_daily_series():
    today = datetime.utcnow().date()
    return {
        (today - timedelta(days=offset)).isoformat(): {
            "day": (today - timedelta(days=offset)).strftime("%a"),
            "retrievals": 0,
            "usage": 0
        }
        for offset in range(6, -1, -1)
    }

def parse_tags(tags):
    if not tags:
        return []
    if isinstance(tags, list):
        return [tag.strip() for tag in tags if tag and tag.strip()]
    return [tag.strip() for tag in str(tags).split(",") if tag.strip()]

def find_document(org_object_id, document_id):
    filters = [{"document_id": document_id}]
    if ObjectId.is_valid(document_id):
        filters.append({"_id": ObjectId(document_id)})
    return db["documents"].find_one({"organization_id": org_object_id, "$or": filters})

def delete_document_records(org_object_id, document):
    document_key = document.get("document_id") or document.get("file_name")
    db["chunks"].delete_many({
        "organization_id": org_object_id,
        "$or": [
            {"document_id": document_key},
            {"file_name": document.get("file_name")}
        ]
    })
    db["documents"].delete_one({"_id": document["_id"]})

def extract_docx_text(file_bytes):
    text_parts = []
    with zipfile.ZipFile(BytesIO(file_bytes)) as docx_zip:
        xml_content = docx_zip.read("word/document.xml")
    root = ET.fromstring(xml_content)
    namespace = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    for text_node in root.findall(".//w:t", namespace):
        if text_node.text:
            text_parts.append(text_node.text)
    return " ".join(text_parts), 0

def extract_document_text(file_name, file_bytes):
    extension = file_type_from_name(file_name).lower()

    if extension == "pdf":
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        full_text = "".join(page.get_text() for page in doc)
        return full_text, len(doc)

    if extension in ["txt", "md"]:
        return file_bytes.decode("utf-8", errors="ignore"), 1

    if extension == "docx":
        return extract_docx_text(file_bytes)

    raise ValueError(f"Unsupported file type: .{extension}")

# ==========================================
# ENDPOINT 1: DIRECT DOCUMENT UPLOAD & INGESTION
# ==========================================
@app.post("/api/v1/ai/ingest")
async def ingest_document(
    file: UploadFile = File(...), 
    organizationId: str = Form(...),
    category: str = Form("Uncategorized"),
    tags: str = Form(""),
    replaceDocumentId: str = Form("")
):
    logger.info(f"Received file: {file.filename} for Org: {organizationId}")
    
    try:
        # 1. Read and extract supported document formats directly from memory
        file_bytes = await file.read()
        full_text, page_count = extract_document_text(file.filename, file_bytes)
            
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
        org_object_id = ObjectId(organizationId)
        if replaceDocumentId:
            old_document = find_document(org_object_id, replaceDocumentId)
            if old_document:
                delete_document_records(org_object_id, old_document)

        document_id = str(uuid.uuid4())
        file_size = len(file_bytes)

        doc_record = {
            "organization_id": org_object_id,
            "document_id": document_id,
            "file_name": file.filename,
            "category": category.strip() or "Uncategorized",
            "tags": parse_tags(tags),
            "file_type": file_type_from_name(file.filename),
            "file_size": file_size,
            "pages": page_count,
            "extracted_text": full_text,
            "original_file": Binary(file_bytes),
            "original_content_type": file.content_type or "application/octet-stream",
            "chunk_count": len(chunks),
            "embedding_count": len(embeddings),
            "embedding_model": "all-MiniLM-L6-v2",
            "embedding_status": "GENERATED",
            "generated_at": datetime.utcnow(),
            "status": "SUCCESS",
            "timestamp": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        db["documents"].insert_one(doc_record)

        # 5. Batch Upload chunks directly to MongoDB Atlas
        documents_to_insert = []
        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            documents_to_insert.append({
                "organization_id": org_object_id,
                "document_id": document_id,
                "file_name": file.filename,
                "chunk_index": idx,
                "content": chunk,
                "token_count": len(chunk.split()),
                "character_count": len(chunk),
                "embedding_status": "GENERATED",
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
                    "document_id": 1,
                    "file_name": 1,
                    "chunk_index": 1,
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
        
        sources_used = [
            {
                "id": str(r["_id"]),
                "document_id": r.get("document_id"),
                "file_name": r.get("file_name"),
                "chunk_index": r.get("chunk_index"),
                "score": r.get("score", 0)
            }
            for r in results
        ]

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
        org_object_id = ObjectId(organizationId)
        docs = list(db["documents"].find(
            {"organization_id": org_object_id}
        ).sort("timestamp", -1))

        chunks = list(db["chunks"].find(
            {"organization_id": org_object_id},
            {
                "document_id": 1,
                "file_name": 1,
                "chunk_index": 1,
                "content": 1,
                "token_count": 1,
                "character_count": 1,
                "embedding_status": 1
            }
        ).sort("chunk_index", 1))

        chunks_by_document = {}
        chunk_to_document = {}
        chunk_scores = {}

        for chunk in chunks:
            document_key = chunk.get("document_id") or chunk.get("file_name")
            if not document_key:
                continue
            chunks_by_document.setdefault(document_key, []).append(chunk)
            chunk_to_document[str(chunk["_id"])] = document_key

        assistant_messages = list(db["chat_history"].find(
            {
                "organization_id": org_object_id,
                "role": "assistant",
                "sources": {"$exists": True}
            },
            {"sources": 1, "timestamp": 1}
        ))

        usage_by_document = {}
        response_count_by_document = {}
        last_retrieved_by_document = {}
        daily_series = build_daily_series()

        for message in assistant_messages:
            message_docs = set()
            timestamp = message.get("timestamp", datetime.utcnow())
            day_key = timestamp.date().isoformat() if isinstance(timestamp, datetime) else datetime.utcnow().date().isoformat()

            for source in message.get("sources", []):
                source_id = source.get("id")
                document_key = source.get("document_id") or chunk_to_document.get(source_id)
                if not document_key:
                    continue

                score = float(source.get("score", 0) or 0)
                chunk_scores.setdefault(source_id, []).append(score)
                usage_by_document[document_key] = usage_by_document.get(document_key, 0) + 1
                message_docs.add(document_key)

                current_last = last_retrieved_by_document.get(document_key)
                if isinstance(timestamp, datetime) and (not current_last or timestamp > current_last):
                    last_retrieved_by_document[document_key] = timestamp

                if day_key in daily_series:
                    daily_series[day_key]["retrievals"] += 1

            for document_key in message_docs:
                response_count_by_document[document_key] = response_count_by_document.get(document_key, 0) + 1
                if day_key in daily_series:
                    daily_series[day_key]["usage"] += 1
        
        formatted_docs = []
        for doc in docs:
            document_key = doc.get("document_id") or doc.get("file_name")
            doc_chunks = chunks_by_document.get(document_key, [])
            chunk_count = len(doc_chunks)
            retrieved_scores = []
            most_retrieved_chunk = None
            most_retrieved_count = 0

            chunk_previews = []
            for chunk in doc_chunks[:8]:
                chunk_id = str(chunk["_id"])
                scores = chunk_scores.get(chunk_id, [])
                retrieved_scores.extend(scores)
                if len(scores) > most_retrieved_count:
                    most_retrieved_count = len(scores)
                    most_retrieved_chunk = chunk.get("chunk_index", 0) + 1

                content = chunk.get("content", "")
                chunk_previews.append({
                    "id": chunk_id,
                    "chunkNumber": chunk.get("chunk_index", 0) + 1,
                    "preview": content[:260],
                    "content": content,
                    "tokenCount": chunk.get("token_count", len(content.split())),
                    "characterCount": chunk.get("character_count", len(content)),
                    "similarityScore": round(sum(scores) / len(scores), 4) if scores else None,
                    "embeddingStatus": chunk.get("embedding_status", "GENERATED")
                })

            average_score = round(sum(retrieved_scores) / len(retrieved_scores), 4) if retrieved_scores else 0
            usage_count = usage_by_document.get(document_key, 0)
            ai_responses = response_count_by_document.get(document_key, 0)
            uploaded_at = doc.get("timestamp", datetime.utcnow())
            updated_at = doc.get("updated_at", uploaded_at)
            status = normalize_status(doc.get("status", "PENDING"))
            embedding_count = doc.get("embedding_count", chunk_count)

            formatted_docs.append({
                "id": str(doc["_id"]),
                "documentId": document_key,
                "name": doc.get("file_name", "Unnamed Document"),
                "category": doc.get("category", "Uncategorized"),
                "tags": doc.get("tags", []),
                "type": doc.get("file_type", file_type_from_name(doc.get("file_name", ""))),
                "sizeBytes": doc.get("file_size", 0),
                "pages": doc.get("pages", 0),
                "chunks": chunk_count,
                "embeddings": embedding_count,
                "embeddingStatus": doc.get("embedding_status", "GENERATED" if chunk_count else "PENDING"),
                "embeddingModel": doc.get("embedding_model", "all-MiniLM-L6-v2"),
                "generatedDate": serialize_date(doc.get("generated_at", uploaded_at)),
                "uploadDate": serialize_date(uploaded_at),
                "lastUpdated": serialize_date(updated_at),
                "usageCount": usage_count,
                "averageScore": average_score,
                "confidence": round(average_score * 100, 1) if average_score else 0,
                "lastRetrieved": serialize_date(last_retrieved_by_document.get(document_key)) if document_key in last_retrieved_by_document else None,
                "mostRetrievedChunk": most_retrieved_chunk,
                "aiResponses": ai_responses,
                "status": status,
                "errorReason": doc.get("error_log", ""),
                "chunksData": chunk_previews,
                "date": uploaded_at.strftime("%Y-%m-%d") if isinstance(uploaded_at, datetime) else None
            })

        return {
            "documents": formatted_docs,
            "analytics": {
                "trend": list(daily_series.values()),
                "retrievals": sum(item["retrievals"] for item in daily_series.values()),
                "usage": sum(item["usage"] for item in daily_series.values())
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/ai/documents/{organizationId}/{documentId}/preview")
async def preview_document(organizationId: str, documentId: str):
    try:
        org_object_id = ObjectId(organizationId)
        document = find_document(org_object_id, documentId)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        text = document.get("extracted_text")
        if not text:
            document_key = document.get("document_id") or document.get("file_name")
            chunks = list(db["chunks"].find(
                {
                    "organization_id": org_object_id,
                    "$or": [
                        {"document_id": document_key},
                        {"file_name": document.get("file_name")}
                    ]
                },
                {"content": 1, "chunk_index": 1}
            ).sort("chunk_index", 1))
            text = "\n\n".join(chunk.get("content", "") for chunk in chunks)

        file_type = document.get("file_type", file_type_from_name(document.get("file_name", "")))
        rendered_pages = []
        file_bytes = document.get("original_file")

        if file_type.lower() == "pdf" and file_bytes:
            pdf_doc = fitz.open(stream=bytes(file_bytes), filetype="pdf")
            for page_number, page in enumerate(pdf_doc, start=1):
                pixmap = page.get_pixmap(matrix=fitz.Matrix(1.6, 1.6), alpha=False)
                rendered_pages.append({
                    "page": page_number,
                    "width": pixmap.width,
                    "height": pixmap.height,
                    "text": page.get_text(),
                    "image": "data:image/png;base64," + base64.b64encode(pixmap.tobytes("png")).decode("ascii")
                })

        return {
            "id": str(document["_id"]),
            "documentId": document.get("document_id"),
            "name": document.get("file_name", "Unnamed Document"),
            "type": file_type,
            "pages": document.get("pages", 0),
            "text": text or "",
            "renderedPages": rendered_pages
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/ai/documents/{organizationId}/{documentId}/download")
async def download_document(organizationId: str, documentId: str):
    try:
        org_object_id = ObjectId(organizationId)
        document = find_document(org_object_id, documentId)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        file_bytes = document.get("original_file")
        file_name = document.get("file_name", "document.txt")
        content_type = document.get("original_content_type", "application/octet-stream")

        if file_bytes:
            return Response(
                content=bytes(file_bytes),
                media_type=content_type,
                headers={"Content-Disposition": f'attachment; filename="{file_name}"'}
            )

        text = document.get("extracted_text", "")
        if not text:
            document_key = document.get("document_id") or document.get("file_name")
            chunks = list(db["chunks"].find(
                {
                    "organization_id": org_object_id,
                    "$or": [
                        {"document_id": document_key},
                        {"file_name": document.get("file_name")}
                    ]
                },
                {"content": 1, "chunk_index": 1}
            ).sort("chunk_index", 1))
            text = "\n\n".join(chunk.get("content", "") for chunk in chunks)

        if not text:
            raise HTTPException(status_code=404, detail="No downloadable content is available for this document")

        return Response(
            content=text.encode("utf-8"),
            media_type="text/plain",
            headers={"Content-Disposition": f'attachment; filename="{file_name}.txt"'}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/ai/documents/{organizationId}/{documentId}/preview/search")
async def search_document_preview(organizationId: str, documentId: str, query: str):
    try:
        search_query = query.strip()
        if not search_query:
            return {"matches": []}

        org_object_id = ObjectId(organizationId)
        document = find_document(org_object_id, documentId)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        file_type = document.get("file_type", file_type_from_name(document.get("file_name", "")))
        file_bytes = document.get("original_file")
        matches = []

        if file_type.lower() == "pdf" and file_bytes:
            pdf_doc = fitz.open(stream=bytes(file_bytes), filetype="pdf")
            for page_number, page in enumerate(pdf_doc, start=1):
                pixmap = page.get_pixmap(matrix=fitz.Matrix(1.6, 1.6), alpha=False)
                x_scale = pixmap.width / page.rect.width
                y_scale = pixmap.height / page.rect.height

                for match_index, rect in enumerate(page.search_for(search_query), start=1):
                    x = rect.x0 * x_scale
                    y = rect.y0 * y_scale
                    width = rect.width * x_scale
                    height = rect.height * y_scale
                    matches.append({
                        "id": f"{page_number}-{match_index}-{round(x)}-{round(y)}",
                        "page": page_number,
                        "left": (x / pixmap.width) * 100,
                        "top": (y / pixmap.height) * 100,
                        "width": (width / pixmap.width) * 100,
                        "height": (height / pixmap.height) * 100
                    })
        else:
            text = document.get("extracted_text", "")
            lower_text = text.lower()
            lower_query = search_query.lower()
            start = 0
            while True:
                index = lower_text.find(lower_query, start)
                if index == -1:
                    break
                matches.append({"id": str(index), "index": index, "page": 1})
                start = index + len(lower_query)

        return {"matches": matches}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/v1/ai/documents/{organizationId}/{documentId}/rename")
async def rename_document(organizationId: str, documentId: str, payload: RenameDocumentRequest):
    try:
        next_name = payload.name.strip()
        if not next_name:
            raise HTTPException(status_code=400, detail="Document name is required")

        org_object_id = ObjectId(organizationId)
        document = find_document(org_object_id, documentId)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        document_key = document.get("document_id")
        db["documents"].update_one(
            {"_id": document["_id"]},
            {"$set": {"file_name": next_name, "file_type": file_type_from_name(next_name), "updated_at": datetime.utcnow()}}
        )
        if document_key:
            db["chunks"].update_many(
                {"organization_id": org_object_id, "document_id": document_key},
                {"$set": {"file_name": next_name}}
            )
        return {"status": "RENAMED", "name": next_name}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/v1/ai/documents/{organizationId}/{documentId}/metadata")
async def update_document_metadata(organizationId: str, documentId: str, payload: UpdateDocumentMetadataRequest):
    try:
        org_object_id = ObjectId(organizationId)
        document = find_document(org_object_id, documentId)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        updates = {"updated_at": datetime.utcnow()}
        if payload.category is not None:
            updates["category"] = payload.category.strip() or "Uncategorized"
        if payload.tags is not None:
            updates["tags"] = parse_tags(payload.tags)

        db["documents"].update_one({"_id": document["_id"]}, {"$set": updates})
        return {"status": "UPDATED"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/ai/documents/{organizationId}/{documentId}/rebuild")
async def rebuild_document_embeddings(organizationId: str, documentId: str):
    try:
        org_object_id = ObjectId(organizationId)
        document = find_document(org_object_id, documentId)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        full_text = document.get("extracted_text")
        if not full_text:
            document_key = document.get("document_id") or document.get("file_name")
            existing_chunks = list(db["chunks"].find(
                {
                    "organization_id": org_object_id,
                    "$or": [
                        {"document_id": document_key},
                        {"file_name": document.get("file_name")}
                    ]
                },
                {"content": 1, "chunk_index": 1}
            ).sort("chunk_index", 1))
            full_text = "\n\n".join(chunk.get("content", "") for chunk in existing_chunks)

        if not full_text or not full_text.strip():
            raise HTTPException(status_code=400, detail="No text is available to rebuild embeddings")

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150, length_function=len)
        chunks = text_splitter.split_text(full_text)
        embeddings = embedding_model.encode(chunks).tolist()
        document_key = document.get("document_id") or str(uuid.uuid4())

        db["chunks"].delete_many({
            "organization_id": org_object_id,
            "$or": [
                {"document_id": document_key},
                {"file_name": document.get("file_name")}
            ]
        })

        docs_to_insert = []
        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            docs_to_insert.append({
                "organization_id": org_object_id,
                "document_id": document_key,
                "file_name": document.get("file_name"),
                "chunk_index": idx,
                "content": chunk,
                "token_count": len(chunk.split()),
                "character_count": len(chunk),
                "embedding_status": "GENERATED",
                "embedding": embedding
            })

        if docs_to_insert:
            db["chunks"].insert_many(docs_to_insert)

        db["documents"].update_one(
            {"_id": document["_id"]},
            {
                "$set": {
                    "document_id": document_key,
                    "chunk_count": len(chunks),
                    "embedding_count": len(embeddings),
                    "embedding_status": "GENERATED",
                    "generated_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "status": "SUCCESS"
                }
            }
        )

        return {"status": "REBUILT", "chunks_processed": len(chunks)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/v1/ai/documents/{organizationId}/{documentId}")
async def delete_document(organizationId: str, documentId: str):
    try:
        org_object_id = ObjectId(organizationId)
        document = find_document(org_object_id, documentId)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        document_key = document.get("document_id") or document.get("file_name")
        delete_document_records(org_object_id, document)

        return {"status": "DELETED", "documentId": document_key}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
