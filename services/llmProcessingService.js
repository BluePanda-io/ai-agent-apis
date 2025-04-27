const OpenAI = require('openai');
const Logger = require('../utils/logger');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const llmProcessingService = {
  processTicketForVectorization: async (ticket) => {
    try {
      const prompt = `Extract the most relevant, readable information from this ticket for text search and retrieval. Focus only on what would be useful for finding this ticket later. while removing any unreadable or unnecessary information.

        Ticket Information:
        ${JSON.stringify(ticket, null, 2)}

        Provide a concise summary with only the essential information that would make this ticket discoverable in a text search.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that processes ticket information for better search and retrieval. Your task is to extract readable information the most relevant information from tickets and throw away any unreadable information or unless information for a text search, focusing on what would be most useful for finding them later using a text search.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const processedText = response.choices[0].message.content;
      Logger.debug(`Processed ticket text for vectorization: ${processedText}`);
      
      return processedText;
    } catch (error) {
      Logger.error('Error processing ticket with LLM:', error);
      // Fallback to basic text processing if LLM fails
      return `${ticket.identifier ? ticket.identifier + ' ' : ''}${ticket.title} ${ticket.description}`;
    }
  }
};

module.exports = llmProcessingService; 