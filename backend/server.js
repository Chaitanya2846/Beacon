require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const winston = require('winston');
const connectDB = require('./config/db');
const documentRoutes = require('./routes/documents');
// Initialize Logger Architecture
winston.configure({
  transports: [new winston.transports.Console({ format: winston.format.simple() })]
});

// Initialize the background worker listener
require('./queues/documentQueue'); 

const app = express();

// Global System Event Connect Pipelines
connectDB();

// Global Request Middleware Stack
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Core API Route Declarations
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/knowledge', require('./routes/knowledge')); // This must match the file name exactly
app.use('/api/documents', documentRoutes);
// Global Fallback Error Interceptor 
app.use((err, req, res, next) => {
  winston.error(`Unhandled Execution Exception Encountered: ${err.stack}`);
  res.status(500).json({ error: 'A systemic internal server exception occurred.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  winston.info(`Multi-Tenant Orchestration Platform online on Port ${PORT}`);
});