const mongoose = require('mongoose');

async function removeIdentifierIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://milti:IZQdxvcCIZ6PwInS@cluster0.6vwtuwk.mongodb.net/devC?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Drop the existing index
    await mongoose.connection.collection('tickets').dropIndex('identifier_1');
    console.log('Dropped identifier index');

    // Close the connection
    await mongoose.connection.close();
    console.log('Done');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

removeIdentifierIndex(); 