const OpenAI = require('openai');
const Logger = require('../utils/logger');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const contextualChangeService = {
  analyzeChanges: async (oldTicket, newTicket) => {
    try {
      // Convert tickets to plain objects and remove MongoDB-specific fields
      const cleanOldTicket = { ...oldTicket };
      const cleanNewTicket = { ...newTicket };
      delete cleanOldTicket._id;
      delete cleanOldTicket.__v;
      delete cleanOldTicket.createdAt;
      delete cleanOldTicket.updatedAt;
      delete cleanNewTicket._id;
      delete cleanNewTicket.__v;
      delete cleanNewTicket.createdAt;
      delete cleanNewTicket.updatedAt;

      // Ensure comments are arrays
      const oldComments = Array.isArray(oldTicket.comments) ? oldTicket.comments : [];
      const newComments = Array.isArray(newTicket.comments) ? newTicket.comments : [];

      // Check for new comments
      const newCommentsAdded = newComments.filter(newComment => 
        !oldComments.some(oldComment => 
          oldComment.text === newComment.text && 
          oldComment.author === newComment.author
        )
      );

      const prompt = `Analyze the changes between these two versions of a ticket and provide a concise, natural language description of what changed, focusing on the most important and contextual changes.

      Old Ticket:
      ${JSON.stringify(cleanOldTicket, null, 2)}

      New Ticket:
      ${JSON.stringify(cleanNewTicket, null, 2)}

      ${newCommentsAdded.length > 0 ? `New Comments Added:
      ${newCommentsAdded.map(comment => `- ${comment.author}: ${comment.text}`).join('\n')}` : ''}

      Consider all fields and their relationships. For example:
      - Changes in status might indicate progress
      - Changes in priority might indicate urgency shifts
      - New comments might indicate discussion or updates
      - Changes in custom fields might indicate scope changes
      - Changes in tags might indicate categorization updates
      - Changes in metadata might indicate source or ownership changes

      Provide a single sentence describing the most significant change in context, considering all these aspects.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that analyzes ticket changes and provides concise, contextual descriptions of what changed. Consider all fields and their relationships to understand the full context of the change, including new comments and their significance.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 100
      });

      const changeDescription = response.choices[0].message.content;
      Logger.debug(`Generated contextual change: ${changeDescription}`);
      
      return changeDescription;
    } catch (error) {
      Logger.error('Error analyzing changes with LLM:', error);
      // Fallback to basic change detection
      const changes = [];
      
      // Check for new comments
      const oldComments = Array.isArray(oldTicket.comments) ? oldTicket.comments : [];
      const newComments = Array.isArray(newTicket.comments) ? newTicket.comments : [];
      const newCommentsAdded = newComments.filter(newComment => 
        !oldComments.some(oldComment => 
          oldComment.text === newComment.text && 
          oldComment.author === newComment.author
        )
      );
      
      if (newCommentsAdded.length > 0) {
        changes.push(`${newCommentsAdded.length} new comment(s) added`);
      }

      // Check other fields
      for (const [key, value] of Object.entries(newTicket)) {
        if (key !== 'comments' && oldTicket[key] !== value) {
          changes.push(`${key} changed from "${oldTicket[key]}" to "${value}"`);
        }
      }
      
      return changes.length > 0 ? changes.join(', ') : 'No significant changes detected';
    }
  }
};

module.exports = contextualChangeService; 