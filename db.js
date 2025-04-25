const mongoose = require('mongoose');
const Logger = require('./utils/logger');

const connectDB = async () => {
  try {
    Logger.database(`Attempting to connect to MongoDB with URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/sample_mflix'}`);
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sample_mflix');
    Logger.success(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    Logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 