const mongoose = require('mongoose');
const winston = require('winston');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_ATLAS_URI);
    winston.info(`MongoDB Atlas Pipeline Linked: ${conn.connection.host}`);
  } catch (error) {
    winston.error(`Database Handshake Failure: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;