/**
 * Health Check Routes
 * 
 * These routes provide health and status information about the application.
 * They are useful for monitoring, deployment checks, and infrastructure validation.
 */

import { Router, Request, Response } from 'express';
import database from '../../config/database';
import appConfig from '../../config/app-config';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Comprehensive health check endpoint
 * @access  Public
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    // Get current database health
    const dbHealth = await database.verifyDatabaseHealth();
    
    // Get pool stats
    const poolStatus = database.getPoolStatus();
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    
    if (dbHealth.healthy) {
      return res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        platform: appConfig.environment.isReplit ? 'Replit' : 'Local',
        database: {
          status: 'connected',
          pool: poolStatus,
          tables: dbHealth.details?.tables || []
        },
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
        },
        uptime: Math.round(process.uptime()) + 's'
      });
    } else {
      return res.status(500).json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        platform: appConfig.environment.isReplit ? 'Replit' : 'Local',
        database: {
          status: 'disconnected',
          message: dbHealth.message,
          details: dbHealth.details
        },
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
        },
        uptime: Math.round(process.uptime()) + 's'
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      message: 'Failed to check system health',
      error: errorMessage
    });
  }
});

/**
 * @route   GET /api/health/simple
 * @desc    Basic health check endpoint for quick pings
 * @access  Public
 */
router.get("/simple", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

export default router;