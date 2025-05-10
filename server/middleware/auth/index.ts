/**
 * Authentication Middleware
 * 
 * This file provides middleware functions for authentication and authorization.
 * It handles common authentication patterns like requiring a user to be logged in,
 * checking for specific roles, or verifying ownership of resources.
 */

import { Request, Response, NextFunction } from 'express';
import { User } from '@shared/schema';
import { ApiError } from '../error-handling/error-types';
import { createLogger } from '../../utils/logger';

const logger = createLogger('auth-middleware');

// Define possible user roles
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

// Extend the Express Request type to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware to require authentication
 * Checks if a user is logged in via session
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    logger.warn('Unauthorized access attempt', { 
      path: req.path, 
      method: req.method,
      ip: req.ip 
    });
    return next(new ApiError('You must be logged in to access this resource', 401));
  }
  
  // User is authenticated, proceed
  next();
}

/**
 * Middleware to require a specific role
 * Checks if the authenticated user has the required role
 */
export function requireRole(role: UserRole | UserRole[]) {
  return function(req: Request, _res: Response, next: NextFunction) {
    // First check if user is authenticated
    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
      logger.warn('Unauthorized role access attempt', { 
        path: req.path, 
        method: req.method,
        ip: req.ip
      });
      return next(new ApiError('You must be logged in to access this resource', 401));
    }
    
    // Check if user has the required role
    const userRole = req.user.role || UserRole.USER;
    const requiredRoles = Array.isArray(role) ? role : [role];
    
    if (!requiredRoles.includes(userRole as UserRole)) {
      logger.warn('Forbidden access attempt', { 
        path: req.path, 
        method: req.method,
        userId: req.user.id,
        userRole,
        requiredRoles,
        ip: req.ip
      });
      return next(new ApiError('You do not have permission to access this resource', 403));
    }
    
    // User has the required role, proceed
    next();
  };
}

/**
 * Middleware to require ownership of a resource or admin role
 * Checks if the authenticated user owns the resource or is an admin
 */
export function requireSelfOrAdmin(getUserId: (req: Request) => number) {
  return function(req: Request, _res: Response, next: NextFunction) {
    // First check if user is authenticated
    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
      logger.warn('Unauthorized ownership access attempt', { 
        path: req.path, 
        method: req.method,
        ip: req.ip
      });
      return next(new ApiError('You must be logged in to access this resource', 401));
    }
    
    // Get the user ID associated with the resource
    const resourceUserId = getUserId(req);
    
    // Check if user owns the resource or is an admin
    const userRole = req.user.role || UserRole.USER;
    if (req.user.id !== resourceUserId && userRole !== UserRole.ADMIN) {
      logger.warn('Forbidden ownership access attempt', { 
        path: req.path, 
        method: req.method,
        userId: req.user.id,
        resourceUserId,
        userRole,
        ip: req.ip
      });
      return next(new ApiError('You do not have permission to access this resource', 403));
    }
    
    // User is authorized, proceed
    next();
  };
}

export default {
  requireAuth,
  requireRole,
  requireSelfOrAdmin,
  UserRole
};