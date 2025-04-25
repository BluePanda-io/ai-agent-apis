const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get or create index
const getIndex = async () => {
  const indexName = process.env.PINECONE_INDEX_NAME;
  const index = pinecone.Index(indexName);
  return index;
};

// Generate embeddings using OpenAI
const generateEmbedding = async (text) => {
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
};

// Add a record to Pinecone with text embedding
const addRecord = async (text, metadata = {}) => {
  try {
    const index = await getIndex();
    const vector = await generateEmbedding(text);
    const recordId = uuidv4();
    
    const upsertResponse = await index.upsert([{
      id: recordId,
      values: vector,
      metadata: {
        ...metadata,
        text: text
      }
    }]);
    
    return { 
      success: true, 
      message: 'Record added successfully',
      id: recordId,
      metadata: {
        ...metadata,
        text: text
      },
      pineconeResponse: upsertResponse
    };
  } catch (error) {
    console.error('Error adding record to Pinecone:', error);
    throw error;
  }
};

// Query records with text
const queryRecords = async (text, topK = 5) => {
  try {
    const index = await getIndex();
    const vector = await generateEmbedding(text);
    
    const queryResponse = await index.query({
      vector,
      topK,
      includeMetadata: true
    });
    return queryResponse.matches;
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    throw error;
  }
};

module.exports = {
  addRecord,
  queryRecords
}; 