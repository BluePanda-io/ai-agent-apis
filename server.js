require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

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

// Test GET endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test endpoint working!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Test POST endpoint
app.post('/api/test', (req, res) => {
  const { message } = req.body;
  
  res.json({
    received: message || 'No message provided',
    status: 'success',
    timestamp: new Date().toISOString()
  });
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