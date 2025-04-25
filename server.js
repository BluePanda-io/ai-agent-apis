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

// Add detailed request logging middleware
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