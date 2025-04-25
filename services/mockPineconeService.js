// Mock implementation of Pinecone service for testing
const mockPineconeService = {
  addToPinecone: async (id, text, metadata) => {
    console.log('[MOCK] Adding to Pinecone:', { id, text, metadata });
    return true;
  },

  searchTickets: async (query) => {
    console.log('[MOCK] Searching tickets with query:', query);
    // Return mock search results
    return [
      {
        id: '123456789012345678901234', // Valid MongoDB ObjectId format
        score: 0.95,
        metadata: { type: 'ticket' }
      }
    ];
  },

  deleteFromPinecone: async (id) => {
    console.log('[MOCK] Deleting from Pinecone:', id);
    return true;
  }
};

module.exports = mockPineconeService; 