#!/bin/bash
# Cher's Closet Local Setup Script
# This script helps set up the local development environment

# Function for colored output
print_color() {
  COLOR=$1
  MESSAGE=$2
  case $COLOR in
    "red") echo -e "\033[0;31m$MESSAGE\033[0m" ;;
    "green") echo -e "\033[0;32m$MESSAGE\033[0m" ;;
    "yellow") echo -e "\033[0;33m$MESSAGE\033[0m" ;;
    "blue") echo -e "\033[0;34m$MESSAGE\033[0m" ;;
    "magenta") echo -e "\033[0;35m$MESSAGE\033[0m" ;;
    "cyan") echo -e "\033[0;36m$MESSAGE\033[0m" ;;
    *) echo "$MESSAGE" ;;
  esac
}

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Clear the terminal
clear

# Display welcome message
print_color "magenta" "====================================================="
print_color "magenta" "      Cher's Closet Local Development Setup"
print_color "magenta" "====================================================="
echo ""
print_color "cyan" "This script will help you set up the local development environment"
print_color "cyan" "for the Cher's Closet wardrobe management application."
echo ""

# Check prerequisites
print_color "blue" "Checking prerequisites..."

# Check for Node.js
if command_exists node; then
  NODE_VERSION=$(node -v)
  print_color "green" "✓ Node.js found: $NODE_VERSION"
else
  print_color "red" "✗ Node.js not found. Please install Node.js v18 or later."
  print_color "yellow" "Visit: https://nodejs.org/"
  exit 1
fi

# Check for npm
if command_exists npm; then
  NPM_VERSION=$(npm -v)
  print_color "green" "✓ npm found: $NPM_VERSION"
else
  print_color "red" "✗ npm not found. Please install npm."
  exit 1
fi

# Check for PostgreSQL
if command_exists psql; then
  PSQL_VERSION=$(psql --version)
  print_color "green" "✓ PostgreSQL found: $PSQL_VERSION"
else
  print_color "red" "✗ PostgreSQL not found."
  print_color "yellow" "Please install PostgreSQL from: https://www.postgresql.org/download/"
  print_color "yellow" "Continue anyway? [y/N]"
  read -r CONTINUE
  if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Create .env file if it doesn't exist
echo ""
print_color "blue" "Setting up environment variables..."

if [ -f .env ]; then
  print_color "yellow" "A .env file already exists. Do you want to overwrite it? [y/N]"
  read -r OVERWRITE
  if [[ "$OVERWRITE" =~ ^[Yy]$ ]]; then
    rm .env
  else
    print_color "green" "✓ Using existing .env file"
  fi
fi

if [ ! -f .env ]; then
  print_color "yellow" "PostgreSQL Database Configuration:"
  
  # Database connection details
  echo -n "Enter PostgreSQL host (default: localhost): "
  read -r DB_HOST
  DB_HOST=${DB_HOST:-localhost}
  
  echo -n "Enter PostgreSQL port (default: 5432): "
  read -r DB_PORT
  DB_PORT=${DB_PORT:-5432}
  
  echo -n "Enter PostgreSQL username (default: postgres): "
  read -r DB_USER
  DB_USER=${DB_USER:-postgres}
  
  echo -n "Enter PostgreSQL password: "
  read -rs DB_PASSWORD
  echo ""
  
  echo -n "Enter database name (default: chers_closet): "
  read -r DB_NAME
  DB_NAME=${DB_NAME:-chers_closet}
  
  # Optional OpenAI API key
  echo ""
  print_color "yellow" "Would you like to set up an OpenAI API key for AI features? [y/N]"
  read -r SETUP_OPENAI
  if [[ "$SETUP_OPENAI" =~ ^[Yy]$ ]]; then
    echo -n "Enter your OpenAI API key: "
    read -rs OPENAI_API_KEY
    echo ""
  else
    OPENAI_API_KEY=""
  fi
  
  # Create the .env file
  cat > .env << EOF
# Database connection
DATABASE_URL=postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
PGHOST=${DB_HOST}
PGPORT=${DB_PORT}
PGUSER=${DB_USER}
PGPASSWORD=${DB_PASSWORD}
PGDATABASE=${DB_NAME}

# OpenAI API key (optional, for AI features)
OPENAI_API_KEY=${OPENAI_API_KEY}
EOF
  
  print_color "green" "✓ Environment variables set up in .env file"
  
  # Create the database if it doesn't exist
  print_color "yellow" "Do you want to create the database '$DB_NAME'? [Y/n]"
  read -r CREATE_DB
  if [[ ! "$CREATE_DB" =~ ^[Nn]$ ]]; then
    print_color "blue" "Creating database..."
    if command_exists psql; then
      export PGPASSWORD=$DB_PASSWORD
      psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME" 2>/dev/null
      RESULT=$?
      if [ $RESULT -eq 0 ]; then
        print_color "green" "✓ Database created successfully"
      else
        print_color "yellow" "⚠ Could not create database. It may already exist or there might be a connection issue."
      fi
    else
      print_color "yellow" "⚠ PostgreSQL client not found. Please create the database manually."
    fi
  fi
fi

# Install dependencies
echo ""
print_color "blue" "Installing dependencies..."
if [ -d "node_modules" ]; then
  print_color "yellow" "node_modules already exists. Do you want to reinstall dependencies? [y/N]"
  read -r REINSTALL
  if [[ "$REINSTALL" =~ ^[Yy]$ ]]; then
    npm install
  else
    print_color "green" "✓ Using existing dependencies"
  fi
else
  npm install
fi

# Create database tables
echo ""
print_color "blue" "Setting up database schema..."
print_color "yellow" "Do you want to create the database tables? [Y/n]"
read -r CREATE_TABLES
if [[ ! "$CREATE_TABLES" =~ ^[Nn]$ ]]; then
  npm run db:push
fi

# Setup complete
echo ""
print_color "magenta" "====================================================="
print_color "green" "      Cher's Closet setup completed successfully!"
print_color "magenta" "====================================================="
echo ""
print_color "cyan" "You can now start the application by running:"
print_color "cyan" "  npm run dev"
echo ""
print_color "yellow" "Or use our simpler interactive script:"
print_color "yellow" "  node start-local.js"
echo ""
print_color "blue" "For more information, see VSCODE_GUIDE.md"
echo ""