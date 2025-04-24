require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const connectDB = require('./db');
const Ticket = require('./models/Ticket');

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

// Create a new ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide both title and description'
      });
    }

    const ticket = await Ticket.create({
      title,
      description,
      priority: priority || 'medium'
    });

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

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
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
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        updatedAt: Date.now()
      },
      { new: true }
    );

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message,
    status: 'error'
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    status: 'error'
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 