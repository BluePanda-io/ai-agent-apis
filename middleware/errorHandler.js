const Logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  Logger.error(`Error: ${err.stack}`);
  res.status(500).json({ 
    status: 'error',
    message: err.message
  });
};

const notFoundHandler = (req, res) => {
  Logger.warning(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: 'error',
    message: 'Not Found'
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
}; 