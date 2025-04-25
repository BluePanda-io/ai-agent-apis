const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error',
    message: err.message
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found'
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
}; 