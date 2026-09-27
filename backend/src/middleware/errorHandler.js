const { errorResponse } = require('../utils/apiResponse');

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  // Handle Zod / validation error
  if (err.name === 'ZodError') {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return errorResponse(res, 'Validation Error', 400, formattedErrors);
  }

  // Handle Prisma known request error
  if (err.code === 'P2002') {
    const target = err.meta?.target ? err.meta.target.join(', ') : 'field';
    return errorResponse(res, `A record with this ${target} already exists.`, 409);
  }

  if (err.code === 'P2025') {
    return errorResponse(res, 'Requested record was not found.', 404);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token. Please authenticate.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token has expired. Please log in again.', 401);
  }

  // Custom application error status
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return errorResponse(res, message, statusCode, err.errors || null);
};

module.exports = errorHandler;
