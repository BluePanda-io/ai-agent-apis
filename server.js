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

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Body parsing middleware
app.use(express.json({ strict: false, limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Raw body parsing for Railway
app.use((req, res, next) => {
  if (req.headers['x-railway-edge'] && !req.body && req.method === 'POST') {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        req.body = JSON.parse(data);
      } catch (e) {
        Logger.error('Failed to parse raw body:', e);
      }
      next();
    });
  } else {
    next();
  }
});

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
  Logger.debug(`Raw Body: ${req.rawBody || 'none'}`);
  Logger.debug(`Parsed Body: ${JSON.stringify(req.body, null, 2)}`);
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