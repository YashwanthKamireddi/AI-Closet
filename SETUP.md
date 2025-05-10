# Cher's Closet: Application Setup Guide

This document provides a comprehensive guide on how to set up and run the Cher's Closet wardrobe management application.

## Overview

Cher's Closet is a wardrobe management application that helps users organize their clothing, create outfits, and receive AI-powered fashion recommendations based on weather conditions, occasions, and personal style preferences.

## Technology Stack

- **Frontend**: React with Radix UI components and Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI API for fashion recommendations

## Setup Instructions

### Prerequisites

1. Node.js v18 or later
2. PostgreSQL database
3. OpenAI API key (for AI features)

### Environment Variables

The following environment variables need to be set:

- `DATABASE_URL`: PostgreSQL connection string
- `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT`: PostgreSQL credentials
- `OPENAI_API_KEY`: Your OpenAI API key (optional, but required for AI features)

#### Setting Up Environment Variables

We provide several helper scripts to make setting up environment variables easy:

1. **Environment Configuration Generator:**
   ```
   node scripts/create-env.js
   ```
   This interactive script will guide you through creating a `.env` file with the correct format.

2. **Quick Setup with Default Values:**
   ```
   node scripts/create-env.js --default
   ```
   This will create a `.env` file with default values for quick setup.

3. **Interactive Setup & Run:**
   ```
   node start-local.js
   ```
   This comprehensive script will guide you through the entire setup process and start the application.

### Running on Replit

1. The application is configured to run automatically on Replit
2. Make sure the PostgreSQL database is provisioned
3. Set the OpenAI API key in the Secrets tab
4. Run the application using one of the following methods:
   - Click the "Run" button in the Replit interface
   - Run `node start.cjs` in the terminal
   - Run `chmod +x run.sh && ./run.sh` in the terminal

### Running Locally with VS Code (Detailed Instructions)

For detailed step-by-step instructions on how to run the application locally with VS Code and PostgreSQL, please see the `VSCODE_GUIDE.md` file included in this repository.

We've created helper scripts to make local setup easy, even if you're not experienced with coding:

1. Interactive Setup and Run Script: `node start-local.js`
   - Guides you through setup with interactive prompts
   - Creates environment files, database, and tables automatically
   - Starts the application when everything is ready

2. Automated Setup Script: `./local-setup.sh`
   - Automates environment setup
   - Configures PostgreSQL connection
   - Prepares everything for you to run the app with `npm run dev`

## Database Structure

The application uses the following database tables:

- `users`: User accounts and authentication
  - Fields: id, username, password, name, email, profilePicture, role
  - Primary entity that all personal data relates to

- `wardrobe_items`: Individual clothing items in a user's wardrobe
  - Fields: id, userId, name, category, subcategory, color, season, imageUrl, tags, favorite
  - Foundation for outfit creation and recommendations

- `outfits`: Combinations of clothing items created by users
  - Fields: id, userId, name, description, items (array of wardrobe item IDs), occasion, season, favorite, weatherConditions, mood
  - Enables outfit planning, sharing, and intelligent recommendations

- `inspirations`: Fashion inspiration content
  - Fields: id, title, description, imageUrl, tags, category, source, content
  - Provides styling ideas and trend information for all users

- `weather_preferences`: User preferences for clothing based on weather
  - Fields: id, userId, weatherType, preferredCategories (array)
  - Enables weather-aware outfit recommendations 

- `mood_preferences`: User preferences for clothing based on emotional states
  - Fields: id, userId, mood, preferredCategories (array), preferredColors (array)
  - Powers emotionally intelligent styling suggestions

### Database Relationships:

- Users ← Wardrobe Items (one-to-many)
- Users ← Outfits (one-to-many)
- Wardrobe Items ← Outfits (many-to-many via items array)
- Users ← Weather Preferences (one-to-many)
- Users ← Mood Preferences (one-to-many)
- Inspirations (standalone, accessible by all users)

The database schema is defined in `shared/schema.ts`. When changes are made to the schema, run `npm run db:push` to apply changes.

## Features

- User authentication (register, login, profile management)
- Wardrobe management (add, edit, delete clothing items)
- Outfit creation and organization
- AI-powered outfit recommendations based on:
  - Weather conditions
  - Occasions (work, casual, formal, etc.)
  - User's mood
  - Personal style preferences
- Fashion inspiration browsing
- Weather integration for contextual recommendations

## Troubleshooting

- **Database connection issues**: Ensure PostgreSQL is running and the connection variables are correctly set
- **AI features not working**: Check that the OpenAI API key is correctly set
- **Missing tables**: Run `npm run db:push` to create all necessary database tables

## Additional Resources

- Drizzle ORM Documentation: [https://orm.drizzle.team/docs/overview](https://orm.drizzle.team/docs/overview)
- OpenAI API Documentation: [https://platform.openai.com/docs/api-reference](https://platform.openai.com/docs/api-reference)
- Radix UI Components: [https://www.radix-ui.com/primitives](https://www.radix-ui.com/primitives)