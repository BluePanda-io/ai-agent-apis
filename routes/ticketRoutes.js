const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

// Create a new ticket
router.post('/', ticketController.createTicket);

// Get all tickets with optional filtering
router.get('/', ticketController.getTickets);

// Update ticket status
router.patch('/:id', ticketController.updateTicketStatus);

// Universal update endpoint for tickets
router.put('/:id', ticketController.updateTicket);

// Search tickets using Pinecone
router.get('/search', ticketController.searchTickets);

// Delete a ticket
router.delete('/:id', ticketController.deleteTicket);

module.exports = router; 