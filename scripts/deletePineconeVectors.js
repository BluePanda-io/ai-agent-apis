require('dotenv').config();
const pineconeService = require('../services/pineconeService');
const Logger = require('../utils/logger');

async function deleteAllVectors() {
  try {
    Logger.info('Starting deletion of all Pinecone vectors...');
    await pineconeService.deleteAllVectors();
    Logger.info('Successfully deleted all vectors from Pinecone');
    process.exit(0);
  } catch (error) {
    Logger.error('Failed to delete vectors:', error);
    process.exit(1);
  }
}

deleteAllVectors(); 