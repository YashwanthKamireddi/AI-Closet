/**
 * Simple startup script for local development
 * 
 * This script provides a streamlined way to start the application
 * in local development mode, checking prerequisites and handling common issues.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function for logging with timestamps and colors
function log(message, type = 'info') {
  const date = new Date().toISOString();
  const colors = {
    info: '\x1b[36m%s\x1b[0m',    // Cyan
    success: '\x1b[32m%s\x1b[0m',  // Green
    warning: '\x1b[33m%s\x1b[0m',  // Yellow
    error: '\x1b[31m%s\x1b[0m'     // Red
  };
  
  const colorFormat = colors[type] || colors.info;
  console.log(colorFormat, `[${date}] ${message}`);
}

// Helper function to ask questions
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to check database connection
async function checkDatabase() {
  log("Running database connection check...", 'info');
  try {
    // Execute the database check script
    execSync('node scripts/check-database.js', { stdio: 'inherit' });
    return true;
  } catch (error) {
    log("Database check failed. Please fix the issues above before starting the application.", 'error');
    return false;
  }
}

// Main function to run the application
async function main() {
  log("Starting Cher's Closet in local development mode...");
  
  // Display menu for first-time users
  console.log("\nWhat would you like to do?");
  console.log("1. Start the application");
  console.log("2. Check database connection");
  console.log("3. Create/update .env file");
  console.log("4. Exit");
  
  const choice = await ask("\nEnter your choice (1-4): ");
  
  if (choice === '2') {
    await checkDatabase();
    const restart = await ask("\nWould you like to return to the main menu? (y/n): ");
    if (restart.toLowerCase() === 'y') {
      return main();
    } else {
      rl.close();
      return;
    }
  } else if (choice === '3') {
    // Delete existing .env file if it exists
    if (fs.existsSync(path.join(__dirname, '.env'))) {
      fs.unlinkSync(path.join(__dirname, '.env'));
    }
    // Continue to .env file creation below
  } else if (choice === '4') {
    log("Exiting...", 'warning');
    rl.close();
    return;
  } else if (choice !== '1') {
    log("Invalid choice. Please try again.", 'warning');
    return main();
  }
  
  // Check for .env file
  if (!fs.existsSync(path.join(__dirname, '.env'))) {
    log("No .env file found. Let's create one!", 'warning');
    
    const dbHost = await ask("PostgreSQL Host [localhost]: ");
    const dbPort = await ask("PostgreSQL Port [5432]: ");
    const dbUser = await ask("PostgreSQL Username [postgres]: ");
    const dbPassword = await ask("PostgreSQL Password: ");
    const dbName = await ask("PostgreSQL Database Name [chers_closet]: ");
    
    // Create .env file with default values if none provided
    const envContent = `# Database Connection
DATABASE_URL=postgres://${dbUser || 'postgres'}:${dbPassword}@${dbHost || 'localhost'}:${dbPort || '5432'}/${dbName || 'chers_closet'}
PGHOST=${dbHost || 'localhost'}
PGPORT=${dbPort || '5432'}
PGUSER=${dbUser || 'postgres'}
PGPASSWORD=${dbPassword}
PGDATABASE=${dbName || 'chers_closet'}

# OpenAI API Key (optional, for AI features)
OPENAI_API_KEY=
`;
    
    fs.writeFileSync(path.join(__dirname, '.env'), envContent);
    log(".env file created successfully!", 'success');
    
    // Ask if they want to create the database
    const createDb = await ask("Would you like to create the PostgreSQL database? (y/n): ");
    if (createDb.toLowerCase() === 'y') {
      try {
        log("Creating database...");
        execSync(`psql -U ${dbUser || 'postgres'} -c "CREATE DATABASE ${dbName || 'chers_closet'}"`, {
          env: { ...process.env, PGPASSWORD: dbPassword },
          stdio: 'pipe'
        });
        log("Database created successfully!", 'success');
      } catch (error) {
        log("Failed to create database. You may need to create it manually.", 'error');
        console.error(error.message);
      }
    }
  }
  
  // Load environment variables from .env file
  require('dotenv').config();
  
  // Check if node_modules exists and install dependencies if needed
  if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
    log("Installing dependencies...");
    execSync('npm install', { stdio: 'inherit' });
  }
  
  // Check if database tables exist and create them if needed
  log("Checking database tables...");
  try {
    // Run db:push to create tables if they don't exist
    log("Setting up database schema...");
    execSync('npm run db:push', { stdio: 'inherit' });
    log("Database schema ready!", 'success');
  } catch (error) {
    log("Error setting up database schema!", 'error');
    console.error(error.message);
    rl.close();
    process.exit(1);
  }
  
  // Start the development server
  log("Starting development server...", 'success');
  const devProcess = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
  
  // Handle process termination
  process.on('SIGINT', () => {
    log("Shutting down...", 'warning');
    devProcess.kill('SIGINT');
    rl.close();
  });
  
  devProcess.on('exit', (code) => {
    log(`Development server exited with code ${code}`, code === 0 ? 'info' : 'error');
    rl.close();
    process.exit(code);
  });
}

// Run the main function
main().catch(error => {
  log(`Unexpected error: ${error.message}`, 'error');
  console.error(error);
  rl.close();
  process.exit(1);
});