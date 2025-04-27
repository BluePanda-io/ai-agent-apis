const mongoService = require('../services/mongoService');
const pineconeService = require('../services/pineconeService');
const llmProcessingService = require('../services/llmProcessingService');
const contextualChangeService = require('../services/contextualChangeService');
const Logger = require('../utils/logger');


const ticketController = {
  createTicket: async (req, res) => {
    try {
      const { title, description } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({
          status: 'error',
          message: 'Please provide title and description'
        });
      }

      // Create ticket in MongoDB with all provided fields
      const ticket = await mongoService.createTicket({
        ...req.body,
        status: req.body.status || 'open',
        priority: req.body.priority || 'medium'
      });
      
      // Log ticket creation
      Logger.debug(`Ticket created: ID=${ticket._id.toString()}, Identifier=${ticket.identifier || 'none'}, Title="${ticket.title}", Status=${ticket.status}`);
      
      // Process ticket with LLM for better vectorization
      const processedText = await llmProcessingService.processTicketForVectorization(ticket);
      
      // Add ticket to Pinecone with processed text
      const metadata = {
        type: 'ticket',
        identifier: ticket.identifier || null
      };
      await pineconeService.addToPinecone(ticket._id.toString(), processedText, metadata);

      res.status(201).json({
        status: 'success',
        data: ticket
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  getTickets: async (req, res) => {
    try {
      const { status, priority, identifier, id } = req.query;
      const query = {};
      
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (identifier) query.identifier = identifier;
      if (id) {
        // If ID is provided, try to find a single ticket by ID
        const ticket = await mongoService.getTicketByIdOrLinearId(id);
        if (!ticket) {
          return res.status(404).json({
            status: 'error',
            message: 'Ticket not found'
          });
        }
        return res.status(200).json({
          status: 'success',
          data: ticket
        });
      }

      const tickets = await mongoService.findTickets(query);
      res.status(200).json({
        status: 'success',
        data: tickets
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  updateTicketStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const ticket = await mongoService.updateTicketStatus(req.params.id, status);

      if (!ticket) {
        return res.status(404).json({
          status: 'error',
          message: 'Ticket not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: ticket
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  updateTicket: async (req, res) => {
    try {
      const ticketId = req.params.id;
      const oldTicket = await mongoService.getTicketById(ticketId);

      if (!oldTicket) {
        return res.status(404).json({
          status: 'error',
          message: 'Ticket not found'
        });
      }

      // Handle comments separately
      let updateData = { ...req.body };
      if (req.body.comments) {
        // Ensure comments is an array
        const newComments = Array.isArray(req.body.comments) ? req.body.comments : [req.body.comments];
        // Add timestamps to new comments
        const commentsWithTimestamps = newComments.map(comment => ({
          ...comment,
          createdAt: new Date()
        }));
        
        // Get existing comments
        const existingComments = oldTicket.comments || [];
        
        // Combine existing and new comments
        updateData = {
          ...req.body,
          comments: [...existingComments, ...commentsWithTimestamps]
        };
        delete updateData.$push;
      }

      // Analyze changes and generate contextual description
      const contextualChange = await contextualChangeService.analyzeChanges(
        oldTicket.toObject(),
        { ...oldTicket.toObject(), ...req.body }
      );

      // Update ticket in MongoDB with all provided fields and contextual change
      const updatedTicket = await mongoService.updateTicket(ticketId, {
        ...updateData,
        contextualChange
      });

      if (!updatedTicket) {
        return res.status(404).json({
          status: 'error',
          message: 'Ticket not found'
        });
      }

      // Process updated ticket with LLM for better vectorization
      const processedText = await llmProcessingService.processTicketForVectorization(updatedTicket);
      
      // Update the vector in Pinecone with processed text
      await pineconeService.addToPinecone(ticketId, processedText, {
        type: 'ticket',
        identifier: updatedTicket.identifier || null
      });

      res.status(200).json({
        status: 'success',
        data: updatedTicket
      });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  searchTickets: async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query) {
        return res.status(400).json({
          status: 'error',
          message: 'Please provide a search query'
        });
      }

      Logger.info(`Searching for tickets with query: "${query}"`);
      const results = await pineconeService.searchTickets(query);
      Logger.info(`Found ${results.length} similar tickets in Pinecone`);
      
      // Fetch full ticket details from MongoDB
      const tickets = await Promise.all(
        results.map(async (result) => {
          try {
            // Try to find the ticket in MongoDB
            const ticket = await mongoService.getTicketById(result.id);
            if (!ticket) {
              Logger.warning(`Ticket not found in MongoDB for ID: ${result.id}`);
              return null;
            }
            return {
              ...ticket.toObject(),
              similarity: result.score
            };
          } catch (error) {
            Logger.error(`Error fetching ticket ${result.id}:`, error);
            return null;
          }
        })
      );

      // Filter out any null results
      const validTickets = tickets.filter(ticket => ticket !== null);
      Logger.info(`Found ${validTickets.length} valid tickets in MongoDB`);

      res.status(200).json({
        status: 'success',
        data: validTickets
      });
    } catch (error) {
      Logger.error('Search error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  deleteTicket: async (req, res) => {
    try {
      const ticketId = req.params.id;

      // Delete from MongoDB
      const deletedTicket = await mongoService.deleteTicket(ticketId);

      if (!deletedTicket) {
        return res.status(404).json({
          status: 'error',
          message: 'Ticket not found'
        });
      }

      // Delete from Pinecone
      await pineconeService.deleteFromPinecone(ticketId);

      res.status(200).json({
        status: 'success',
        message: 'Ticket deleted successfully',
        data: deletedTicket
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  getTicketByIdOrLinearId: async (req, res) => {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          status: 'error',
          message: 'Please provide an ID in the query parameters'
        });
      }

      Logger.debug(`Getting ticket by ID or Linear ID: ${id}`);
      const ticket = await mongoService.getTicketByIdOrLinearId(id);

      if (!ticket) {
        return res.status(404).json({
          status: 'error',
          message: 'Ticket not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: ticket
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
};

module.exports = ticketController; 