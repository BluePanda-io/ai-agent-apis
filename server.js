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

// Routes
app.use('/', generalRoutes);
app.use('/api/tickets', ticketRoutes);

// Error handling middleware
app.use(errorHandler);
app.use(notFoundHandler);

app.listen(port, () => {
  Logger.success(`Server running at http://localhost:${port}`);
}); 