const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { documentQueue } = require('../config/redis');
const { protect } = require('../middleware/auth');

// Endpoint to ingest documents into the background queue
// Note: 'protect' is temporarily removed to allow direct Postman testing
router.post('/upload-url', async (req, res) => {
  // We extract organizationId directly from the Postman body now
  const { fileUrl, fileName, organizationId } = req.body;

  if (!fileUrl || !fileName || !organizationId) {
    return res.status(400).json({ error: 'Missing required parameters: fileUrl, fileName, organizationId' });
  }

  try {
    // 1. Create a tracking row in MongoDB with status 'PENDING'
    const newDoc = await Document.create({
      organization_id: organizationId,
      file_name: fileName,
      cloudinary_url: fileUrl,
      status: 'PENDING'
    });

    // 2. Drop the job metadata onto our BullMQ Redis queue
    await documentQueue.add('extract-and-embed', {
      documentId: newDoc._id.toString(),
      organizationId: organizationId.toString(),
      fileUrl: fileUrl
    });

    return res.status(202).json({
      message: 'Document successfully queued for background processing.',
      documentId: newDoc._id,
      status: 'PENDING'
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Endpoint for the dashboard to check processing statuses
// This one still requires the user to be logged in
router.get('/documents', protect, async (req, res) => {
  try {
    const docs = await Document.find({ organization_id: req.user.organizationId }).sort({ createdAt: -1 });
    return res.json(docs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;