require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const connectDB = require('./db');
const mongoService = require('./services/mongoService');
const pineconeService = require('./services/pineconeService');

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello World!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Create a new ticket (both in MongoDB and Pinecone)
app.post('/api/tickets', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide both title and description'
      });
    }

    // Create ticket in MongoDB
    const ticket = await mongoService.createTicket(title, description);
    
    // Add ticket to Pinecone
    const text = `${title} ${description}`;
    const metadata = {
      type: 'ticket',
    };
    await pineconeService.addToPinecone(ticket._id.toString(), text,metadata);

    // Save the MongoDB ticket
    await ticket.save();

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
});

// Get all tickets with optional filtering
app.get('/api/tickets', async (req, res) => {
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
});

// Update ticket status
app.patch('/api/tickets/:id', async (req, res) => {
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
});

// Search tickets using Pinecone
app.get('/api/tickets/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a search query'
      });
    }

    const results = await pineconeService.searchTickets(query);
    
    // Fetch full ticket details from MongoDB
    const tickets = await Promise.all(
      results.map(async (result) => {
        try {
          const ticket = await mongoService.getTicketById(result.id);
          if (!ticket) {
            console.warn(`Ticket not found for ID: ${result.id}`);
            return null;
          }
          return {
            ...ticket.toObject(),
            similarity: result.score
          };
        } catch (error) {
          console.error(`Error fetching ticket ${result.metadata.id}:`, error);
          return null;
        }
      })
    );

    // Filter out any null results
    const validTickets = tickets.filter(ticket => ticket !== null);

    res.status(200).json({
      status: 'success',
      data: validTickets
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error',
    message: err.message
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found'
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 