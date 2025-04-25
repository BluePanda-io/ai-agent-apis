const mongoose = require('mongoose');
const Logger = require('./utils/logger');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    Logger.database(`Attempting to connect to MongoDB with URI: ${mongoUri}`);
    const conn = await mongoose.connect(mongoUri);
    Logger.success(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    Logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 