/**
 * Error Handler Middleware
 * 
 * This middleware provides centralized error handling for the application.
 * It captures errors from routes and other middleware, logs them appropriately,
 * and returns standardized error responses to clients.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from './error-types';
import { createLogger } from '../../utils/logger';

const logger = createLogger('error-handler');

/**
 * Async handler wrapper for route handlers
 * 
 * Wraps async route handlers to catch errors and pass them to the error middleware
 * Eliminates the need for try/catch blocks in route handlers
 */
export function asyncHandler(fn: Function) {
  return function(req: Request, res: Response, next: NextFunction) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Central error handling middleware
 * 
 * Handles different types of errors and returns appropriate responses
 */
export function errorHandler(err: Error | ApiError, req: Request, res: Response, _next: NextFunction) {
  // Log the error based on type
  if (err instanceof ApiError) {
    // For API errors, include status code and error code in message
    if (err.statusCode >= 500) {
      const message = `Server error: ${err.message} [${err.statusCode}]`;
      logger.error(message, err);
    } else {
      const message = `Client error: ${err.message} [${err.statusCode}]`;
      logger.warn(message, { 
        path: req.path, 
        method: req.method
      });
    }
  } else {
    // For standard errors, just log the error with request info
    const message = `Unhandled error: ${err.message}`;
    logger.error(message, err, { 
      path: req.path, 
      method: req.method 
    });
  }

  // Handle ApiError (our custom error type)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.errorCode || 'ERROR_' + err.statusCode,
        details: err.details
      }
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: err.format()
      }
    });
  }

  // Handle other errors as 500 Internal Server Error
  return res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message,
      code: 'INTERNAL_SERVER_ERROR'
    }
  });
}

export default {
  asyncHandler,
  errorHandler
};