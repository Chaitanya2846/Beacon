const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

// Use memory storage so we don't clutter the Node server's hard drive.
// We just hold the file in RAM for a millisecond before sending it to Python.
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file
});

/**
 * POST /api/documents/upload
 * Receives PDF from React -> Forwards to FastAPI -> Returns success to React
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // 1. Validate the request
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    
    // Note: In production, you would extract the organizationId from the JWT token.
    // For now, we expect it in the form body.
    const { organizationId, category, tags, replaceDocumentId } = req.body; 
    if (!organizationId) return res.status(400).json({ error: 'Organization ID is required for tenant isolation.' });

    // 2. Prepare the payload for FastAPI
    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);
    formData.append('organizationId', organizationId);
    formData.append('category', category || 'Uncategorized');
    formData.append('tags', tags || '');
    if (replaceDocumentId) formData.append('replaceDocumentId', replaceDocumentId);

    // 3. Forward the file to your Python AI Microservice
    console.log(`Forwarding ${req.file.originalname} to AI Engine for Org: ${organizationId}...`);
    
    const pythonResponse = await axios.post('http://127.0.0.1:8000/api/v1/ai/ingest', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    // 4. Return the AI Engine's success response back to the React frontend
    return res.status(200).json({
      message: 'Document successfully ingested and vectorized.',
      details: pythonResponse.data
    });

  } catch (error) {
    console.error('Ingestion Error:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Failed to process document in AI engine.',
      details: error.response?.data || error.message 
    });
  }
});

module.exports = router;
