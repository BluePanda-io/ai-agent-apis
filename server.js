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
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide both title and description'
      });
    }

    const ticket = await Ticket.create({
      title,
      description
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

// Get all tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
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