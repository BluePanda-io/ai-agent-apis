const Ticket = require('../models/Ticket');
const Logger = require('../utils/logger');
const mongoService = {
  createTicket: async (title, description, linear_id) => {
    try {
      const ticket = await Ticket.create({
        title,
        description,
        status: 'open',
        linear_id
      });
      return ticket;
    } catch (error) {
      console.error('Error creating ticket in MongoDB:', error);
      throw error;
    }
  },

  findTickets: async (query = {}) => {
    try {
      const tickets = await Ticket.find(query);
      return tickets;
    } catch (error) {
      console.error('Error finding tickets in MongoDB:', error);
      throw error;
    }
  },

  getTicketById: async (id) => {
    try {
      const ticket = await Ticket.findById(id);
      return ticket;
    } catch (error) {
      console.error('Error fetching ticket from MongoDB:', error);
      throw error;
    }
  },

  getTicketByIdOrLinearId: async (id) => {
    try {
      let ticket;
      try {
        // First try to find by MongoDB ID
        ticket = await Ticket.findById(id);
      } catch (error) {
        // If error is due to invalid ObjectId format, ticket will remain undefined
        Logger.debug(`Invalid MongoDB ID format: ${id}, will try Linear ID instead`);
      }
      
      // If not found by MongoDB ID, try to find by Linear ID
      if (!ticket) {
        ticket = await Ticket.findOne({ linear_id: id });
      }
      
      return ticket;
    } catch (error) {
      console.error('Error fetching ticket from MongoDB:', error);
      throw error;
    }
  },

  updateTicket: async (id, updateData) => {
    try {
      // Remove undefined values from updateData
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([, value]) => value !== undefined)
      );

      // Add updatedAt timestamp
      cleanUpdateData.updatedAt = new Date();

      const ticket = await Ticket.findByIdAndUpdate(
        id,
        { $set: cleanUpdateData },
        { new: true, runValidators: true }
      );
      return ticket;
    } catch (error) {
      console.error('Error updating ticket in MongoDB:', error);
      throw error;
    }
  },

  deleteTicket: async (id) => {
    try {
      const ticket = await Ticket.findByIdAndDelete(id);
      return ticket;
    } catch (error) {
      console.error('Error deleting ticket from MongoDB:', error);
      throw error;
    }
  }
};

module.exports = mongoService; 