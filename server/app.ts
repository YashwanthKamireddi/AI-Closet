/**
 * Application Configuration and Setup
 * 
 * This file initializes the Express application with all necessary middleware,
 * configurations, and routes. It sets up error handling, authentication,
 * and other core features.
 */

import express, { Express } from 'express';
import session from 'express-session';
import cors from 'cors';
import bodyParser from 'body-parser';
import { setupAuth } from './auth';
import { registerRoutes } from './routes';
import { errorHandler, requestLogger } from './middleware';
import connectPgSimpleModule from 'connect-pg-simple';
import { logger } from './utils';
import appConfig from './config/app-config';
import database from './config/database';

/**
 * Creates and configures the Express application
 */
export async function createApp(): Promise<Express> {
  // Initialize the Express application
  const app = express();
  
  // Set application variables
  app.set('isReplit', appConfig.environment.isReplit);
  app.set('env', appConfig.environment.nodeEnv);
  
  // Apply basic middleware
  app.use(cors({
    origin: appConfig.server.corsOrigins,
    credentials: true
  }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  
  // Set up request logging
  app.use(requestLogger);
  
  // Set up session handling
  const sessionConfig: session.SessionOptions = {
    secret: appConfig.auth.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: appConfig.environment.isProduction,
      maxAge: appConfig.auth.cookieMaxAge
    }
  };
  
  // Connect session to database if available
  if (database.pool) {
    const PgStore = connectPgSimpleModule(session);
    sessionConfig.store = new PgStore({ pool: database.pool });
  }
  
  app.use(session(sessionConfig));
  
  // Set up authentication
  setupAuth(app);
  
  // Register application routes
  await registerRoutes(app);
  
  // Apply global error handler (must be after routes)
  app.use(errorHandler);
  
  return app;
}

export default createApp;