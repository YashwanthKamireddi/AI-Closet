/**
 * Application Startup Script
 * 
 * This script provides a common entry point for running the application
 * in both development and production environments.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper function for logging with timestamps
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Check if database URL is set
if (!process.env.DATABASE_URL) {
  log("⚠️ ERROR: DATABASE_URL is not set. The application requires a PostgreSQL database.");
  log("Please set up a database using the create_postgresql_database_tool.");
  process.exit(1);
}

// Check if OpenAI API key is set (only a warning, as app can still run without it)
if (!process.env.OPENAI_API_KEY) {
  log("⚠️ WARNING: OPENAI_API_KEY is not set. AI features will not work properly.");
  log("Please set the OPENAI_API_KEY environment variable.");
}

// Check if node_modules exists and install dependencies if needed
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  log("📦 Installing dependencies...");
  execSync('npm install', { stdio: 'inherit' });
}

// Run database push to ensure schema is up to date
log("🔄 Ensuring database schema is up to date...");
try {
  execSync('npm run db:push', { stdio: 'inherit' });
} catch (error) {
  log("⚠️ WARNING: Failed to update database schema. Some features may not work properly.");
  log(error.message);
  // Continue execution despite schema push failure
}

// Start the application in the appropriate mode
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  log("🚀 Starting the application in production mode...");
  execSync('npm run build', { stdio: 'inherit' });
  execSync('npm run start', { stdio: 'inherit' });
} else {
  log("🚀 Starting the application in development mode...");
  const devProcess = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
  
  // Handle process termination
  process.on('SIGINT', () => {
    devProcess.kill('SIGINT');
  });
  
  devProcess.on('exit', (code) => {
    process.exit(code);
  });
}