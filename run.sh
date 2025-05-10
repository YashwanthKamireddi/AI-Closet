#!/usr/bin/env bash

# Make the script exit on any error
set -e

# Make sure we're in the project root directory
cd "$(dirname "$0")"

# Log helper function
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Print available environment variables for debugging (without showing secret values)
log "Checking environment variables..."
env | grep -v "KEY\|TOKEN\|SECRET\|PASSWORD" | grep -E "^(OPENAI|DATABASE|PG)" | cut -d= -f1 | sort | while read -r var; do
  log "Found environment variable: $var"
done

# Ensure we have the latest environment variables
if [ -f .env ]; then
  source .env
  log "Loaded environment variables from .env file"
fi

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
  log "⚠️ WARNING: OPENAI_API_KEY environment variable is not accessible. AI features will not work properly."
  log "Please ensure the API key is correctly set in the Replit Secrets tab."
else
  log "✅ OPENAI_API_KEY is available"
fi

# Check if database URL is set
if [ -z "$DATABASE_URL" ]; then
  log "⚠️ ERROR: DATABASE_URL is not set. The application requires a PostgreSQL database."
  log "Please set up a database using the create_postgresql_database_tool."
  exit 1
else
  log "✅ Database connection is available"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  log "📦 Installing dependencies..."
  npm install
fi

# Check if database tables already exist to avoid long db:push operation
TABLES_EXIST=$(psql "$DATABASE_URL" -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')" -t | tr -d '[:space:]')

if [ "$TABLES_EXIST" = "t" ]; then
  log "✅ Database tables already exist, skipping schema push"
else
  log "🔄 Creating database schema..."
  npm run db:push
fi

# Start the development server
log "🚀 Starting the application..."
npm run dev