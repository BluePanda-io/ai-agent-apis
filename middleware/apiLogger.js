const Logger = require('../utils/logger');

const beautifyJson = (data) => {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      return data;
    }
  }
  return JSON.stringify(data, null, 2);
};

const apiLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, body, query, params } = req;

  // Log API request
  Logger.api(`[${method}] ${originalUrl}`);
  if (Object.keys(body).length > 0) {
    Logger.info('Request Body:');
    Logger.info(beautifyJson(body));
  }
  if (Object.keys(query).length > 0) {
    Logger.info('Query Parameters:');
    Logger.info(beautifyJson(query));
  }
  if (Object.keys(params).length > 0) {
    Logger.info('URL Parameters:');
    Logger.info(beautifyJson(params));
  }

  // Store the original res.json method
  const originalJson = res.json;

  // Override res.json to log the response
  res.json = function (data) {
    const duration = Date.now() - start;
    Logger.success(`[${method}] ${originalUrl} - ${res.statusCode} (${duration}ms)`);
    if (data.status === 'error') {
      Logger.error('Error Response:');
      Logger.error(beautifyJson(data));
    } else {
      Logger.info('Response:');
      Logger.info(beautifyJson(data));
    }
    return originalJson.call(this, data);
  };

  next();
};

module.exports = apiLogger; 