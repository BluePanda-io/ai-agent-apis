// Mock implementation of Pinecone service for testing
const mockPineconeService = {
  addToPinecone: async (id, text, metadata) => {
    console.log('[MOCK] Adding to Pinecone:', { 
      id, 
      text, 
      metadata: { 
        ...metadata, 
        identifier: metadata.identifier || '',
        type: metadata.type || 'ticket'
      } 
    });
    return { success: true, _id: id };
  },

  searchTickets: async (query) => {
    console.log('[MOCK] Searching tickets with query:', query);
    // Return mock search results
    return [
      {
        id: '123456789012345678901234', // Valid MongoDB ObjectId format
        score: 0.95,
        metadata: { 
          type: 'ticket',
          identifier: 'DG-1',
          text: 'Test ticket content'
        }
      }
    ];
  },

  deleteFromPinecone: async (id) => {
    console.log('[MOCK] Deleting from Pinecone:', id);
    return { success: true };
  },

  deleteAllVectors: async () => {
    console.log('[MOCK] Deleting all vectors from Pinecone');
    return { success: true };
  }
};

module.exports = mockPineconeService; 