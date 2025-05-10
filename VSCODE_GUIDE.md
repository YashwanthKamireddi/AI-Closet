# Cher's Closet: VS Code Local Setup Guide

This comprehensive guide will walk you through setting up and running the Cher's Closet wardrobe management application on your local machine using Visual Studio Code. This guide is designed specifically for users who are not experienced with coding.

![Local Setup Overview](./local-setup-diagram.svg)

## Table of Contents

1. [Installing Required Software](#1-installing-required-software)
2. [Getting the Code](#2-getting-the-code)
3. [Opening the Project in VS Code](#3-opening-the-project-in-vs-code)
4. [Setting Up PostgreSQL Database](#4-setting-up-postgresql-database)
5. [Setting Up Environment Variables](#5-setting-up-environment-variables)
6. [Installing Dependencies](#6-installing-dependencies)
7. [Creating Database Tables](#7-creating-database-tables)
8. [Running the Application](#8-running-the-application)
9. [Using the Application](#9-using-the-application)
10. [Troubleshooting](#10-troubleshooting)

## 1. Installing Required Software

### Visual Studio Code
1. Go to https://code.visualstudio.com/
2. Download the version for your operating system (Windows, Mac, or Linux)
3. Follow the installation instructions
4. Launch VS Code when installation is complete

### Node.js
1. Go to https://nodejs.org/
2. Download the "LTS" (Long Term Support) version (currently v18.x)
3. Follow the installation instructions, accepting all defaults
4. To verify installation:
   - In VS Code, open a terminal by clicking on "Terminal" → "New Terminal"
   - Type `node --version` and press Enter
   - You should see the version number (e.g., v18.17.1)

### PostgreSQL
1. Go to https://www.postgresql.org/download/
2. Select your operating system:
   - **Windows**: Use the installer provided by EnterpriseDB
   - **Mac**: Use the installer provided by EnterpriseDB or Postgres.app
   - **Linux**: Follow the instructions for your distribution
3. During installation:
   - Remember the password you set for the postgres user
   - Use the default port (5432)
   - Install pgAdmin (should be included in the installer)
4. After installation, PostgreSQL should start automatically as a service

## 2. Getting the Code

1. Download the project files from Replit or your preferred source
2. Extract the ZIP file to a location on your computer (e.g., Documents or Projects folder)

## 3. Opening the Project in VS Code

1. Open VS Code
2. Go to "File" → "Open Folder..."
3. Navigate to the folder where you extracted the project files and click "Open"
4. The project folder should now be loaded in VS Code's Explorer panel on the left

## 4. Setting Up PostgreSQL Database

### Using pgAdmin:
1. Open pgAdmin from your computer's programs/applications
2. Enter the master password you created during installation when prompted
3. In the left sidebar, expand "Servers", then expand "PostgreSQL"
4. Right-click on "Databases" and select "Create" → "Database..."
5. Enter "chers_closet" as the database name and click "Save"

### Alternative: Using Command Line
If you prefer using the command line, you can:
1. Open a terminal or command prompt
2. Run: `psql -U postgres`
3. Enter your password when prompted
4. At the PostgreSQL prompt, run: `CREATE DATABASE chers_closet;`
5. Type `\q` to exit

## 5. Setting Up Environment Variables

### Option 1: Using the Environment Configuration Generator (Recommended)

1. In the VS Code terminal, run:
   ```
   node scripts/create-env.js
   ```
2. Follow the prompts to create your `.env` file:
   - Enter your PostgreSQL connection details
   - Optionally add an OpenAI API key for AI features
   - The script will create the `.env` file with the correct format

3. To use default values (for quick setup), you can run:
   ```
   node scripts/create-env.js --default
   ```

### Option 2: Manual Creation

1. In VS Code, create a new file in the root of the project:
   - Right-click in the Explorer panel
   - Select "New File"
   - Name it `.env` (including the dot)
2. Add the following content to the file, replacing values as needed:

```
# Database connection
DATABASE_URL=postgres://postgres:your_password@localhost:5432/chers_closet
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=chers_closet

# OpenAI API key (optional, for AI features)
# Get one from https://platform.openai.com/account/api-keys if you want AI features
OPENAI_API_KEY=
```

3. Replace `your_password` with the PostgreSQL password you set during installation
4. Save the file (Ctrl+S or Cmd+S)

## 6. Installing Dependencies

1. In VS Code, open a terminal:
   - Click on "Terminal" in the top menu
   - Select "New Terminal"
2. In the terminal, run:
   ```
   npm install
   ```
3. Wait for the installation to complete (this may take a few minutes)

## 7. Creating Database Tables

1. In the VS Code terminal, run:
   ```
   npm run db:push
   ```
2. This command will create all necessary tables in your PostgreSQL database:
   - `users`: User accounts and authentication
   - `wardrobe_items`: Individual clothing items in a user's wardrobe
   - `outfits`: Combinations of clothing items created by users
   - `inspirations`: Fashion inspiration content
   - `weather_preferences`: User preferences for clothing based on weather
   - `mood_preferences`: User preferences for clothing based on emotional states

3. If successful, you'll see output indicating the tables were created

For more detailed information about the database structure and relationships, see the Database Structure section in SETUP.md.

## 8. Running the Application

### Option 1: Using the Interactive Local Startup Script (Recommended for Beginners)

1. In the VS Code terminal, run:
   ```
   node start-local.js
   ```
2. This script will:
   - Check if you have a `.env` file and help you create one if needed
   - Install dependencies if they're not already installed
   - Check if database tables exist and create them if needed
   - Start the development server automatically

3. Open your web browser and navigate to `http://localhost:3000`
4. You should now see the Cher's Closet application running

### Option 2: Standard Startup

If you prefer to run the application directly:

1. In the VS Code terminal, run:
   ```
   npm run dev
   ```
2. The application will start and display a message showing the URL
3. Open your web browser and navigate to `http://localhost:3000`

## 9. Using the Application

1. Register a new account to get started
2. Add clothing items to your digital wardrobe
3. Create outfits by combining items from your wardrobe
4. Explore the AI-powered outfit recommendations if you've set an OpenAI API key

## 10. Troubleshooting

### Database Connection Issues

If you see errors connecting to the database:

1. **Run the Database Check Script**:
   ```
   node scripts/check-database.js
   ```
   This script will:
   - Verify your environment variables are set correctly
   - Test the database connection
   - Check if required tables exist
   - Show record counts for each table
   - Provide detailed error messages with suggestions

2. **Check PostgreSQL Service**:
   - Windows: Open Services app and make sure PostgreSQL service is running
   - Mac/Linux: Run `sudo service postgresql status` or `brew services list` if using Homebrew

3. **Verify Connection Settings**:
   - Double-check the values in your `.env` file
   - Make sure the password is correct
   - Try connecting with pgAdmin to verify credentials

4. **PostgreSQL Authentication**:
   - If you get a "peer authentication" error on Linux, you may need to edit PostgreSQL's `pg_hba.conf` file to use "md5" authentication instead of "peer" for local connections

### Application Won't Start

If the application fails to start:

1. **Error Messages**:
   - Read the error messages in the terminal for clues
   - Most common issues are related to database connection or missing dependencies

2. **Port In Use**:
   - If you see "port 3000 is already in use", another application is using that port
   - You can either close the other application or change the port by updating the scripts in `package.json`

### Simplest Alternatives: Using Our Helper Scripts

#### Option 1: Interactive Startup Script (Recommended)

The easiest way to get started is using our interactive startup script:

1. In the VS Code terminal, run:
   ```
   node start-local.js
   ```
2. Follow the prompts to set up your environment
3. The script will automatically start the application when ready

#### Option 2: Automated Setup Script

We've also included a setup script that automates most of the configuration steps:

1. In the VS Code terminal, make the script executable:
   ```
   chmod +x local-setup.sh
   ```
2. Run the script:
   ```
   ./local-setup.sh
   ```
3. Follow the prompts to set up your environment
4. After the script completes, run:
   ```
   npm run dev
   ```

## Getting Help

If you encounter any issues not covered by this guide, please reach out for assistance. Remember that the most common issues are typically related to:

1. Database connection issues
2. Environment variable configuration
3. Missing dependencies

---

This guide should help you get Cher's Closet running locally on your machine with VS Code. Happy styling!