require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const apiLogger = require('./middleware/apiLogger');
const Logger = require('./utils/logger');

// Import routes
const ticketRoutes = require('./routes/ticketRoutes');
const generalRoutes = require('./routes/generalRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(apiLogger);

// Railway-specific middleware to handle edge proxy
app.use((req, res, next) => {
  // Check if we're on Railway by looking for Railway-specific headers
  if (req.headers['x-railway-edge']) {
    // Preserve original method from headers if available
    const originalMethod = 
      req.headers['x-http-method-override'] || 
      req.headers['x-http-method'] || 
      req.headers['x-method-override'] || 
      req.method;
    
    // Force the method to be the original method
    req.method = originalMethod.toUpperCase();
    
    // Log the method transformation for debugging
    Logger.debug(`Railway detected - Original method: ${originalMethod}, Final method: ${req.method}`);
  }
  next();
});

// Add detailed request logging
app.use((req, res, next) => {
  Logger.debug('=== Request Details ===');
  Logger.debug(`Original Method: ${req.method}`);
  Logger.debug(`Original URL: ${req.originalUrl}`);
  Logger.debug(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
  Logger.debug(`Body: ${JSON.stringify(req.body, null, 2)}`);
  Logger.debug('=====================');
  next();
});

// Routes
app.use('/', generalRoutes);
app.use('/api/tickets', ticketRoutes);

// Error handling middleware
app.use(errorHandler);
app.use(notFoundHandler);

app.listen(port, () => {
  Logger.success(`Server running at http://localhost:${port}`);
}); 