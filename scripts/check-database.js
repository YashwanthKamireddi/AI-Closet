/**
 * Database Connection Check Script
 * 
 * This script provides a simple way to test if the database connection is configured correctly.
 * It verifies that:
 * 1. The database environment variables are set
 * 2. The connection to PostgreSQL can be established
 * 3. The required tables exist in the database
 * 
 * Usage:
 * node scripts/check-database.js
 */

// Load environment variables from .env file
require('dotenv').config();

// Import modules
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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

// Required tables that should exist in the database
const requiredTables = [
  'users',
  'wardrobe_items',
  'outfits',
  'inspirations',
  'weather_preferences',
  'mood_preferences'
];

// Main function to check database connection
async function checkDatabaseConnection() {
  print('====================================================', 'magenta');
  print('           DATABASE CONNECTION CHECKER               ', 'magenta');
  print('====================================================', 'magenta');
  print('');

  // Step 1: Check for environment variables
  print('Checking environment variables...', 'blue');
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'PGHOST',
    'PGPORT',
    'PGUSER',
    'PGPASSWORD',
    'PGDATABASE'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    print(`❌ Missing required environment variables: ${missingVars.join(', ')}`, 'red');
    print('Please create a .env file with the required variables or run the setup script.', 'yellow');
    process.exit(1);
  } else {
    print('✅ All required environment variables are set', 'green');
  }
  
  print('');
  
  // Step 2: Check database connection
  print('Attempting to connect to the database...', 'blue');
  
  let client;
  try {
    client = new Client({
      connectionString: process.env.DATABASE_URL
    });
    
    await client.connect();
    print('✅ Successfully connected to the PostgreSQL database', 'green');
    
    // Step 3: Check tables exist
    print('');
    print('Checking for required database tables...', 'blue');
    
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      print(`❌ Missing required tables: ${missingTables.join(', ')}`, 'red');
      print('You need to run "npm run db:push" to create these tables.', 'yellow');
    } else {
      print('✅ All required database tables exist', 'green');
      
      // Count records in each table
      print('');
      print('Table record counts:', 'blue');
      for (const table of requiredTables) {
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
        const count = countResult.rows[0].count;
        print(`  - ${table}: ${count} record(s)`, count > 0 ? 'green' : 'yellow');
      }
    }
    
    // Check database connection info
    print('');
    print('Database connection information:', 'blue');
    const dbInfo = await client.query('SELECT version()');
    print(`  PostgreSQL version: ${dbInfo.rows[0].version.split(',')[0]}`, 'cyan');
    print(`  Database name: ${process.env.PGDATABASE}`, 'cyan');
    print(`  Host: ${process.env.PGHOST}`, 'cyan');
    print(`  User: ${process.env.PGUSER}`, 'cyan');
    
  } catch (error) {
    print(`❌ Database connection failed: ${error.message}`, 'red');
    
    if (error.message.includes('password authentication')) {
      print('The database credentials in your .env file might be incorrect.', 'yellow');
    } else if (error.message.includes('does not exist')) {
      print('The specified database does not exist. You may need to create it.', 'yellow');
    } else if (error.message.includes('ECONNREFUSED')) {
      print('Could not connect to the PostgreSQL server. Make sure it is running.', 'yellow');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
  
  print('');
  print('====================================================', 'magenta');
  print('           DATABASE CHECK COMPLETE                   ', 'magenta');
  print('====================================================', 'magenta');
}

// Run the check function
checkDatabaseConnection().catch(error => {
  print(`Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});