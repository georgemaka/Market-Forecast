import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(`Error: ${error.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { name: 'ValidationError', message };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { name: 'ValidationError', message };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { name: 'ValidationError', message };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message,
      },
    });
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired. Please log in again.';
    return res.status(401).json({
      error: {
        code: 'TOKEN_EXPIRED',
        message,
      },
    });
  }

  // Prisma errors
  if (err.code === 'P2002') {
    const message = 'Duplicate field value entered';
    return res.status(400).json({
      error: {
        code: 'DUPLICATE_FIELD',
        message,
        details: {
          field: err.meta?.target?.[0] || 'unknown',
        },
      },
    });
  }

  if (err.code === 'P2025') {
    const message = 'Record not found';
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message,
      },
    });
  }

  // Joi validation errors
  if (err.isJoi) {
    const message = err.details[0].message;
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message,
        details: {
          field: err.details[0].path.join('.'),
          value: err.details[0].context?.value,
        },
      },
    });
  }

  // Default to 500 server error
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Server Error';

  res.status(statusCode).json({
    error: {
      code: statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'CLIENT_ERROR',
      message: statusCode === 500 && process.env.NODE_ENV === 'production' 
        ? 'Something went wrong' 
        : message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

export default errorHandler;