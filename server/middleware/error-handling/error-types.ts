/**
 * Error Types
 * 
 * This file defines custom error types used throughout the application.
 * These error types provide semantic meaning to different kinds of errors,
 * making error handling more predictable and organized.
 */

/**
 * API Error class
 * 
 * Extends the native Error class to include additional properties
 * useful for API error handling like status code and error code.
 */
export class ApiError extends Error {
  statusCode: number;
  errorCode?: string;
  details?: any;

  /**
   * Create an API error
   * @param message Error message
   * @param statusCode HTTP status code
   * @param errorCode Optional error code for more specific error identification
   * @param details Optional details about the error
   */
  constructor(message: string, statusCode: number, errorCode?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    
    // Needed for extending Error in TypeScript
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Create a 400 Bad Request error
   */
  static badRequest(message: string, errorCode?: string, details?: any): ApiError {
    return new ApiError(message, 400, errorCode, details);
  }

  /**
   * Create a 401 Unauthorized error
   */
  static unauthorized(message: string = 'Unauthorized', errorCode?: string, details?: any): ApiError {
    return new ApiError(message, 401, errorCode, details);
  }

  /**
   * Create a 403 Forbidden error
   */
  static forbidden(message: string = 'Forbidden', errorCode?: string, details?: any): ApiError {
    return new ApiError(message, 403, errorCode, details);
  }

  /**
   * Create a 404 Not Found error
   */
  static notFound(message: string = 'Resource not found', errorCode?: string, details?: any): ApiError {
    return new ApiError(message, 404, errorCode, details);
  }

  /**
   * Create a 409 Conflict error
   */
  static conflict(message: string, errorCode?: string, details?: any): ApiError {
    return new ApiError(message, 409, errorCode, details);
  }

  /**
   * Create a 422 Unprocessable Entity error
   */
  static validation(message: string, errorCode?: string, details?: any): ApiError {
    return new ApiError(message, 422, errorCode, details);
  }

  /**
   * Create a 500 Internal Server Error
   */
  static internal(message: string = 'Internal server error', errorCode?: string, details?: any): ApiError {
    return new ApiError(message, 500, errorCode, details);
  }
}