// Central export for all middleware
const { authenticate, optionalAuth } = require('./auth');
const { errorHandler, notFound } = require('./errorHandler');

module.exports = {
  authenticate,
  optionalAuth,
  errorHandler,
  notFound
};
