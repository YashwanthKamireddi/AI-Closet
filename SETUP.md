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

### Running on Replit

1. The application is configured to run automatically on Replit
2. Make sure the PostgreSQL database is provisioned
3. Set the OpenAI API key in the Secrets tab
4. Run the application using one of the following methods:
   - Click the "Run" button in the Replit interface
   - Run `node start.cjs` in the terminal
   - Run `chmod +x run.sh && ./run.sh` in the terminal

### Running Locally

To run the application on your local machine:

1. Clone the repository
2. Create a `.env` file with the necessary environment variables
3. Install dependencies: `npm install`
4. Create the database tables: `npm run db:push`
5. Start the development server: `npm run dev`

## Database Structure

The application uses the following database tables:

- `users`: User accounts and authentication
- `wardrobe_items`: Individual clothing items in a user's wardrobe
- `outfits`: Combinations of clothing items created by users
- `inspirations`: Fashion inspiration content
- `weather_preferences`: User preferences for clothing based on weather
- `mood_preferences`: User preferences for clothing based on mood

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