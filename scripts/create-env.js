/**
 * Environment Configuration Generator
 * 
 * This script creates a .env file with the necessary environment variables
 * for running the Cher's Closet application locally.
 * 
 * Usage:
 * node scripts/create-env.js
 * 
 * Options:
 * --default  Creates a .env file with default settings for quick setup
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function for colored console output
function print(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Check for --default flag
const useDefaults = process.argv.includes('--default');

// Main function to generate the .env file
async function generateEnvFile() {
  print('====================================================', 'magenta');
  print('           Environment Configuration Generator       ', 'magenta');
  print('====================================================', 'magenta');
  print('');
  
  // Check if .env already exists
  const envFilePath = path.join(__dirname, '..', '.env');
  
  if (fs.existsSync(envFilePath)) {
    if (!useDefaults) {
      const overwrite = await ask("A .env file already exists. Overwrite it? (y/n): ");
      if (overwrite.toLowerCase() !== 'y') {
        print("Operation cancelled. Existing .env file preserved.", 'yellow');
        rl.close();
        return;
      }
    }
  }
  
  // Default values
  const defaults = {
    dbHost: 'localhost',
    dbPort: '5432',
    dbUser: 'postgres',
    dbPassword: 'postgres', // Default password, will be prompted to change if not using defaults
    dbName: 'chers_closet',
    openaiApiKey: ''
  };
  
  let config = { ...defaults };
  
  // If not using defaults, prompt for values
  if (!useDefaults) {
    print("Please enter your PostgreSQL database credentials:", 'blue');
    print("(Press Enter to use the default value shown in brackets)", 'cyan');
    print('');
    
    config.dbHost = await ask(`Host [${defaults.dbHost}]: `) || defaults.dbHost;
    config.dbPort = await ask(`Port [${defaults.dbPort}]: `) || defaults.dbPort;
    config.dbUser = await ask(`Username [${defaults.dbUser}]: `) || defaults.dbUser;
    
    // Always prompt for password without showing a default
    config.dbPassword = await ask("Password: ");
    if (!config.dbPassword) {
      print("Warning: Using empty password. This may not work with your PostgreSQL configuration.", 'yellow');
      config.dbPassword = '';
    }
    
    config.dbName = await ask(`Database name [${defaults.dbName}]: `) || defaults.dbName;
    
    print('');
    print("For AI-powered outfit recommendations, you'll need an OpenAI API key.", 'blue');
    print("This is optional. You can leave it blank and add it later.", 'blue');
    config.openaiApiKey = await ask("OpenAI API Key (optional): ") || '';
  } else {
    print("Using default configuration values.", 'yellow');
    print("Note: The default database password is 'postgres' - you should change this in production!", 'yellow');
  }
  
  // Generate the DATABASE_URL
  const dbUrl = `postgres://${config.dbUser}:${config.dbPassword}@${config.dbHost}:${config.dbPort}/${config.dbName}`;
  
  // Create the .env file content
  const envContent = `# Cher's Closet Environment Configuration
# Generated on: ${new Date().toISOString()}

# ====================================
# Database Connection Configuration
# ====================================
DATABASE_URL=${dbUrl}
PGHOST=${config.dbHost}
PGPORT=${config.dbPort}
PGUSER=${config.dbUser}
PGPASSWORD=${config.dbPassword}
PGDATABASE=${config.dbName}

# ====================================
# Optional: OpenAI API Key
# ====================================
# Required for AI-powered outfit recommendations
OPENAI_API_KEY=${config.openaiApiKey}

# ====================================
# Advanced Database Configuration
# ====================================
# Optional: Configure database connection pool
DB_POOL_SIZE=10
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=10000
`;

  // Write the .env file
  try {
    fs.writeFileSync(envFilePath, envContent);
    print('');
    print("✅ .env file created successfully!", 'green');
    print(`   Location: ${envFilePath}`, 'green');
    
    // Next steps
    print('');
    print("Next steps:", 'blue');
    if (!fs.existsSync(path.join(__dirname, '..', 'node_modules'))) {
      print("1. Run 'npm install' to install dependencies", 'cyan');
      print("2. Run 'npm run db:push' to create database tables", 'cyan');
      print("3. Run 'npm run dev' to start the application", 'cyan');
    } else {
      print("1. Run 'npm run db:push' to create database tables", 'cyan');
      print("2. Run 'npm run dev' to start the application", 'cyan');
    }
    print('');
    print("Or use our interactive setup script:", 'blue');
    print("   node start-local.js", 'cyan');
    
  } catch (error) {
    print(`Error writing .env file: ${error.message}`, 'red');
    process.exit(1);
  }
  
  rl.close();
}

// Run the main function
generateEnvFile().catch(error => {
  print(`Unexpected error: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});