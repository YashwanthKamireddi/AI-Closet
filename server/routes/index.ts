/**
 * Routes Index
 * 
 * This file brings together all routes in the application and registers them with Express.
 * It serves as the central routing registry, keeping route organization modular and maintainable.
 */

import { Express } from 'express';
import { createServer, type Server } from 'http';

// Import all route modules
import healthRoutes from './health';
import wardrobeRoutes from './wardrobe';
import outfitsRoutes from './outfits';
import calendarRoutes from './calendar';
import sharingRoutes from './sharing';
import inspirationRoutes from './inspiration';
import preferencesRoutes from './preferences';
import aiRoutes from './ai';
import weatherRoutes from './weather';
import { setupAuth } from '../auth';

/**
 * Registers all application routes with the Express application
 * @param app Express application instance
 * @returns HTTP server instance
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server from Express app
  const server = createServer(app);
  
  // Set up authentication
  setupAuth(app);
  
  // Register all route modules with their base paths
  app.use('/api/health', healthRoutes);
  app.use('/api/wardrobe', wardrobeRoutes);
  app.use('/api/outfits', outfitsRoutes);
  app.use('/api/calendar-outfits', calendarRoutes);
  app.use('/api/sharing', sharingRoutes);
  app.use('/api/inspirations', inspirationRoutes);
  app.use('/api/preferences', preferencesRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/weather', weatherRoutes);
  
  return server;
}

export default registerRoutes;