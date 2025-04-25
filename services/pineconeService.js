const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
const mockPineconeService = require('./mockPineconeService');
const Logger = require('../utils/logger');
 
// Use mock service if in test environment
if (process.env.NODE_ENV === 'test' && process.env.MOCK_SERVICES === 'true') {
  module.exports = mockPineconeService;
} else {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
  });

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

  const pineconeService = {
    getIndex: async () => {
      return index;
    },

    generateEmbedding: async (text) => {
      try {
        const response = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: text,
          encoding_format: 'float'
        });
        return response.data[0].embedding;
      } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
      }
    },

    addToPinecone: async (_id, text, metadata = {}) => {
      try {
        const vector = await pineconeService.generateEmbedding(text);
        
        // Ensure _id is a string
        const id = _id.toString();
        
        await index.upsert([{
          id,
          values: vector,
          metadata: {
            text: text,
            ...metadata
          }
        }]);

        Logger.debug(`Added ticket to Pinecone with ID: ${id}`);
        return { success: true, _id: id };
      } catch (error) {
        Logger.error('Error adding ticket to Pinecone:', error);
        throw error;
      }
    },

    searchTickets: async (query, topK = 5) => {
      try {
        const vector = await pineconeService.generateEmbedding(query);
        
        const results = await index.query({
          vector,
          topK,
          includeMetadata: true
        });
        
        return results.matches;
      } catch (error) {
        console.error('Error searching tickets in Pinecone:', error);
        throw error;
      }
    },

    deleteFromPinecone: async (id) => {
      try {
        await index.deleteOne(id);
        return { success: true };
      } catch (error) {
        console.error('Error deleting ticket from Pinecone:', error);
        throw error;
      }
    },

    deleteAllVectors: async () => {
      try {
        await index.deleteAll();
        Logger.debug('Successfully deleted all vectors from Pinecone');
        return { success: true };
      } catch (error) {
        Logger.error('Error deleting all vectors from Pinecone:', error);
        throw error;
      }
    }
  };

  module.exports = pineconeService;
} 