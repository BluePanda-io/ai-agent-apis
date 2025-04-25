const express = require('express');
const router = express.Router();

// Root endpoint
router.get('/', (req, res) => {
  res.json({ 
    message: 'Hello World!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 