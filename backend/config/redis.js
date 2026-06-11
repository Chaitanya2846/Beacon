const { Queue } = require('bullmq');

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10)
};

// Initialize the core document processing background task queue
const documentQueue = new Queue('document-processing', {
  connection: redisConnection
});

module.exports = { redisConnection, documentQueue };