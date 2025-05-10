import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import { sql } from 'drizzle-orm';

// Determine if we're running in local mode or using Neon Serverless
const isLocal = !process.env.REPL_ID;

// Environment validation adjusted for local development
function validateDbEnvironment() {
  // Only require DATABASE_URL for local development
  if (isLocal) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required. Please check your .env file.');
    }
  } else {
    // For Replit, require full set of variables
    const requiredVars = ['DATABASE_URL', 'PGHOST', 'PGUSER', 'PGDATABASE'];
    const missing = requiredVars.filter(name => !process.env[name]);
    
    if (missing.length > 0) {
      throw new Error(
        `Missing required database environment variables: ${missing.join(', ')}. Did you forget to provision a database?`
      );
    }
  }
}

// Validate environment variables before proceeding
validateDbEnvironment();

// Configuration for local PostgreSQL connection
const localDbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: false, // Local PostgreSQL typically doesn't use SSL
  max: parseInt(process.env.DB_POOL_SIZE || '10'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000')
};

let pool;

if (isLocal) {
  // Local PostgreSQL connection
  pool = new Pool(localDbConfig);
  console.log('Using local PostgreSQL database connection');
} else {
  // Replit environment using Neon Serverless
  const { Pool: NeonPool, neonConfig } = require('@neondatabase/serverless');
  const ws = require('ws');
  
  // Configure Neon database to use WebSocket for connection
  neonConfig.webSocketConstructor = ws;
  neonConfig.useSecureWebSocket = true;
  
  pool = new NeonPool({ 
    connectionString: process.env.DATABASE_URL,
    max: parseInt(process.env.DB_POOL_SIZE || '10')
  });
  console.log('Using Neon Serverless database connection');
}

// State variables for connection management
let isReconnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_INTERVAL = 5000; // 5 seconds

// Log pool events
pool.on('connect', () => {
  console.log('New database connection established');
  reconnectAttempts = 0; // Reset reconnect counter on successful connection
});

// Log pool errors rather than crashing
pool.on('error', async (error) => {
  console.error('Unexpected error on idle database client', error);
  
  if (isLocal) {
    console.error('Check your PostgreSQL configuration and make sure the service is running');
  } else {
    // Only attempt reconnection if we're not already trying
    if (!isReconnecting) {
      await attemptReconnection();
    }
  }
});

// Helper function to attempt database reconnection
async function attemptReconnection() {
  isReconnecting = true;
  reconnectAttempts++;
  
  console.log(`Attempting database reconnection (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
  
  try {
    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    
    console.log('Database reconnection successful');
    isReconnecting = false;
    reconnectAttempts = 0;
  } catch (error) {
    // Handle the unknown error type safely
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Database reconnection attempt failed:', errorMessage);
    
    // If we haven't reached max attempts, try again after interval
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      setTimeout(attemptReconnection, RECONNECT_INTERVAL);
    } else {
      console.error('Max reconnection attempts reached. Database connection lost.');
      isReconnecting = false;
      // At this point, the application should handle failed state appropriately
      // Consider implementing a circuit breaker pattern for database operations
    }
  }
}

// Create Drizzle ORM instance with the pool
export const db = isLocal
  ? drizzle(pool, { schema }) // Standard PostgreSQL connection
  : drizzle({ client: pool, schema }); // Neon serverless connection

// Function to get pool status
export function getPoolStatus() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  };
}

// Function to test database connection with retry logic
export async function testDatabaseConnection(retries = 3, delay = 1000) {
  let attempt = 0;
  
  while (attempt < retries) {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT 1 AS ping');
      client.release();
      
      // Additional check to ensure result is as expected
      if (result?.rows?.[0]?.ping === 1) {
        return true;
      }
      
      // If we get here, something is wrong with the result format
      console.error(`Unexpected database test result: ${JSON.stringify(result)}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Database connection test failed (attempt ${attempt + 1}/${retries}):`, errorMessage);
      
      // Last attempt failed
      if (attempt === retries - 1) {
        return false;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    attempt++;
  }
  
  return false;
}

// Function to verify database health and schema with more details
export async function verifyDatabaseHealth() {
  try {
    // Test basic connectivity
    if (!await testDatabaseConnection()) {
      return { healthy: false, message: 'Database connection failed', details: null };
    }
    
    // Check all tables exist
    const tables = [
      'users', 'wardrobe_items', 'outfits', 'inspirations', 
      'weather_preferences', 'mood_preferences'
    ];
    
    const tablesResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTables = Array.isArray(tablesResult) 
      ? tablesResult.map(row => row.table_name) 
      : tablesResult.rows.map(row => row.table_name);
    
    const missingTables = tables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      return { 
        healthy: false, 
        message: 'Database schema incomplete', 
        details: { missingTables } 
      };
    }
    
    // Get pool status
    const poolStatus = getPoolStatus();
    
    return { 
      healthy: true,
      message: 'Database connection and schema verified',
      details: { 
        tables: existingTables,
        poolStatus
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      healthy: false,
      message: 'Database health check failed',
      details: { error: errorMessage }
    };
  }
}
