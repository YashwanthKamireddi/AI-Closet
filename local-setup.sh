#!/bin/bash

# Text formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
  echo -e "\n${BOLD}${BLUE}STEP $1: $2${NC}\n"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

# Display welcome message
clear
echo -e "${BOLD}${GREEN}==================================${NC}"
echo -e "${BOLD}${GREEN}  Cher's Closet - Local Setup   ${NC}"
echo -e "${BOLD}${GREEN}==================================${NC}\n"
echo -e "This script will help you set up the Cher's Closet application to run locally on your machine.\n"

# Step 1: Check prerequisites
print_step "1" "Checking prerequisites"

# Check Node.js
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  print_success "Node.js is installed: $NODE_VERSION"
else
  print_error "Node.js is not installed. Please install Node.js v18 or later from https://nodejs.org/"
  exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm -v)
  print_success "npm is installed: $NPM_VERSION"
else
  print_error "npm is not installed. It should be included with Node.js installation."
  exit 1
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
  PSQL_VERSION=$(psql --version)
  print_success "PostgreSQL is installed: $PSQL_VERSION"
else
  print_error "PostgreSQL is not installed. Please install PostgreSQL from https://www.postgresql.org/download/"
  exit 1
fi

# Step 2: Setup environment file
print_step "2" "Setting up environment file"

if [ -f .env ]; then
  print_warning "An .env file already exists. Do you want to overwrite it? (y/n)"
  read -r overwrite
  if [[ $overwrite != "y" ]]; then
    print_warning "Skipping .env file creation"
  else
    create_env=true
  fi
else
  create_env=true
fi

if [[ $create_env == true ]]; then
  echo -e "We need to set up your local PostgreSQL database connection."
  echo -e "Please enter your PostgreSQL credentials:\n"
  
  read -p "PostgreSQL hostname [localhost]: " db_host
  db_host=${db_host:-localhost}
  
  read -p "PostgreSQL port [5432]: " db_port
  db_port=${db_port:-5432}
  
  read -p "PostgreSQL username [postgres]: " db_user
  db_user=${db_user:-postgres}
  
  read -p "PostgreSQL password: " db_password
  
  read -p "PostgreSQL database name [chers_closet]: " db_name
  db_name=${db_name:-chers_closet}
  
  echo -e "# Database connection" > .env
  echo -e "DATABASE_URL=postgres://$db_user:$db_password@$db_host:$db_port/$db_name" >> .env
  echo -e "PGHOST=$db_host" >> .env
  echo -e "PGPORT=$db_port" >> .env
  echo -e "PGUSER=$db_user" >> .env
  echo -e "PGPASSWORD=$db_password" >> .env
  echo -e "PGDATABASE=$db_name" >> .env
  echo -e "\n# OpenAI API key (optional, for AI features)" >> .env
  echo -e "# Get one from https://platform.openai.com/account/api-keys" >> .env
  echo -e "OPENAI_API_KEY=" >> .env
  
  print_success "Created .env file with database configuration"
fi

# Step 3: Install dependencies
print_step "3" "Installing dependencies"
npm install
print_success "Dependencies installed"

# Step 4: Set up database
print_step "4" "Setting up database"

# Check if database exists
DB_EXISTS=$(PGPASSWORD=$db_password psql -h $db_host -p $db_port -U $db_user -tAc "SELECT 1 FROM pg_database WHERE datname='$db_name'" postgres)

if [ "$DB_EXISTS" != "1" ]; then
  echo "Creating database $db_name..."
  PGPASSWORD=$db_password psql -h $db_host -p $db_port -U $db_user -c "CREATE DATABASE $db_name;" postgres
  print_success "Database $db_name created"
else
  print_success "Database $db_name already exists"
fi

# Create tables using Drizzle
echo "Creating database tables..."
npm run db:push
print_success "Database schema created"

# Step 5: Running the application
print_step "5" "Starting the application"
echo -e "Your Cher's Closet application is now set up and ready to run!\n"
echo -e "To start the application, run: ${BOLD}npm run dev${NC}"
echo -e "The application will be available at: ${BOLD}http://localhost:3000${NC}\n"

# Done
echo -e "${BOLD}${GREEN}==================================${NC}"
echo -e "${BOLD}${GREEN}      Setup Complete! 🎉         ${NC}"
echo -e "${BOLD}${GREEN}==================================${NC}\n"