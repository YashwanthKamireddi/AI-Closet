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
try {
  // Try to access the process.env.OPENAI_API_KEY to see if it exists and is accessible
  const apiKeyExists = !!process.env.OPENAI_API_KEY;
  if (!apiKeyExists) {
    log("⚠️ WARNING: OPENAI_API_KEY is not set. AI features will not work properly.");
    log("Please set the OPENAI_API_KEY environment variable.");
  } else {
    log("✅ OPENAI_API_KEY is available - AI features should work properly");
  }
} catch (error) {
  log("⚠️ ERROR: There was a problem accessing the OPENAI_API_KEY environment variable:");
  log(error.message);
  log("Please ensure the API key is correctly set in the Replit Secrets tab.");
}

// Check if node_modules exists and install dependencies if needed
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  log("📦 Installing dependencies...");
  execSync('npm install', { stdio: 'inherit' });
}

// Check if database tables already exist to avoid long db:push operation
log("🔄 Checking database status...");
try {
  const tableCheckResult = execSync("psql \"$DATABASE_URL\" -c \"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')\" -t", { encoding: 'utf8' }).trim();
  
  if (tableCheckResult.includes('t')) {
    log("✅ Database tables already exist, skipping schema push");
  } else {
    log("🔄 Creating database schema...");
    execSync('npm run db:push', { stdio: 'inherit' });
  }
} catch (error) {
  log("⚠️ WARNING: Error checking database tables. Will try to run schema push anyway.");
  log(error.message);
  
  try {
    execSync('npm run db:push', { stdio: 'inherit' });
  } catch (pushError) {
    log("⚠️ WARNING: Failed to update database schema. Some features may not work properly.");
    log(pushError.message);
    // Continue execution despite schema push failure
  }
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