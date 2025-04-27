const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');

async function fixIdentifierIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://milti:IZQdxvcCIZ6PwInS@cluster0.6vwtuwk.mongodb.net/devC?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Drop the existing index
    await mongoose.connection.collection('tickets').dropIndex('identifier_1');
    console.log('Dropped existing identifier index');

    // Create new sparse index
    await mongoose.connection.collection('tickets').createIndex(
      { identifier: 1 },
      { 
        unique: true,
        sparse: true,
        background: true
      }
    );
    console.log('Created new sparse index for identifier');

    // Close the connection
    await mongoose.connection.close();
    console.log('Done');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixIdentifierIndex(); 