const { Worker } = require('bullmq');
const axios = require('axios');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const winston = require('winston');
const { redisConnection } = require('../config/redis');

// Initialize the background worker
const documentWorker = new Worker(
  'document-processing',
  async (job) => {
    const { documentId, organizationId, fileUrl } = job.data;
    winston.info(`[Worker] Starting background processing for Document: ${documentId}`);

    try {
      // 1. Advance the state to PROCESSING in MongoDB
      await Document.updateOne(
        { _id: new mongoose.Types.ObjectId(documentId) },
        { $set: { status: 'PROCESSING' } }
      );

      // 2. Fire the HTTP payload over to the FastAPI AI service
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const response = await axios.post(`${aiServiceUrl}/api/v1/ai/process-document`, {
        documentId: documentId,
        organizationId: organizationId,
        fileUrl: fileUrl
      });

      winston.info(`[Worker] FastAPI successfully ingested document. Response: ${JSON.stringify(response.data)}`);
      return response.data;

    } catch (error) {
      winston.error(`[Worker] Job failing for Document ${documentId}: ${error.message}`);
      
      // Update the DB state to FAILED if the network call or FastAPI fails
      await Document.updateOne(
        { _id: new mongoose.Types.ObjectId(documentId) },
        { $set: { status: 'FAILED', error_log: error.message } }
      );
      
      throw error; // Let BullMQ handle the retry strategy
    }
  },
  { connection: redisConnection }
);

documentWorker.on('completed', (job) => {
  winston.info(`[Worker] Job ${job.id} completed successfully.`);
});

documentWorker.on('failed', (job, err) => {
  winston.error(`[Worker] Job ${job.id} completely failed with error: ${err.message}`);
});

module.exports = documentWorker;