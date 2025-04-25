const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB with URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/sample_mflix');
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sample_mflix');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 