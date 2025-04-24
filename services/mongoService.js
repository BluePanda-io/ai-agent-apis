const Ticket = require('../models/Ticket');

const mongoService = {
  createTicket: async (title, description) => {
    try {
      const ticket = await Ticket.create({
        title,
        description,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return ticket;
    } catch (error) {
      console.error('Error creating ticket in MongoDB:', error);
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
  }
};

module.exports = mongoService; 