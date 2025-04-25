const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');

// Initialize clients
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const pineconeService = {
  getIndex: async () => {
    const indexName = process.env.PINECONE_INDEX_NAME;
    return pinecone.Index(indexName);
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
      const index = await pineconeService.getIndex();
      const vector = await pineconeService.generateEmbedding(text);
      
      await index.upsert([{
        id: _id,
        values: vector,
        metadata: {
          text: text,
          ...metadata
        }
      }]);


      
      return { success: true, _id };
    } catch (error) {
      console.error('Error adding ticket to Pinecone:', error);
      throw error;
    }
  },

  searchTickets: async (query, topK = 5) => {
    try {
      const index = await pineconeService.getIndex();
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
      const index = await pineconeService.getIndex();
      await index.deleteOne(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting ticket from Pinecone:', error);
      throw error;
    }
  }
};

module.exports = pineconeService; 