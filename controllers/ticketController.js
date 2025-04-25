const mongoService = require('../services/mongoService');
const pineconeService = require('../services/pineconeService');
const Logger = require('../utils/logger');


const ticketController = {
  createTicket: async (req, res) => {
    try {
      const { title, description } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({
          status: 'error',
          message: 'Please provide both title and description'
        });
      }

      // Create ticket in MongoDB
      const ticket = await mongoService.createTicket(title, description);      // Log ticket creation
      Logger.debug(`Ticket created: ID=${ticket._id.toString()}, Title="${ticket.title}", Status=${ticket.status}`);
      
      // Add ticket to Pinecone
      const text = `${title} ${description}`;
      const metadata = {
        type: 'ticket',
      };
      await pineconeService.addToPinecone(ticket._id.toString(), text, metadata);

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
      const { status, priority } = req.query;
      const query = {};
      
      if (status) query.status = status;
      if (priority) query.priority = priority;

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
      const { title, description, status, priority } = req.body;
      const ticketId = req.params.id;

      // Update ticket in MongoDB
      const updatedTicket = await mongoService.updateTicket(ticketId, {
        title,
        description,
        status,
        priority
      });

      if (!updatedTicket) {
        return res.status(404).json({
          status: 'error',
          message: 'Ticket not found'
        });
      }

      // Update the vector in Pinecone with new text
      if (title || description) {
        const text = `${updatedTicket.title} ${updatedTicket.description}`;
        await pineconeService.addToPinecone(ticketId, text, {
          type: 'ticket'
        });
      }

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
  }
};

module.exports = ticketController; 