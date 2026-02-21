# Database Setup Guide

This guide will help you set up a local PostgreSQL database for your application.

## Prerequisites

### 1. Install PostgreSQL

**macOS (using Homebrew):**
```sh
brew install postgresql@16
brew services start postgresql@16
```

**Or use Postgres.app:**
- Download from https://postgresapp.com/
- Launch Postgres.app and initialize

**Verify installation:**
```sh
psql --version
```

## Quick Setup

### Option 1: Automated Setup (Recommended)

Run the setup script:
```sh
npm run db:setup
```

This will:
- Create the database
- Run schema migrations
- Seed with sample data

### Option 2: Manual Setup

1. **Create the database:**
```sh
createdb homepath_db
```

2. **Run the schema:**
```sh
psql -d homepath_db -f db/schema.sql
```

3. **Seed the database:**
```sh
psql -d homepath_db -f db/seed.sql
```

## Database Commands

```sh
# Connect to the database
psql homepath_db

# Reset database (drops and recreates)
npm run db:reset

# Run only schema
psql -d homepath_db -f db/schema.sql

# Run only seeds
psql -d homepath_db -f db/seed.sql

# Backup database
pg_dump homepath_db > db/backup.sql

# Restore from backup
psql -d homepath_db -f db/backup.sql
```

## Database Connection Info

- **Database Name:** `homepath_db`
- **Host:** `localhost`
- **Port:** `5432` (default)
- **User:** Your system username
- **Password:** (none for local development)

## Connection String

```
postgresql://localhost:5432/homepath_db
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://localhost:5432/homepath_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=homepath_db
DB_USER=your_username
DB_PASSWORD=
```

## Useful psql Commands

Once connected to the database (`psql homepath_db`):

```sql
-- List all tables
\dt

-- Describe a table
\d user_info

-- View all users
SELECT * FROM user_info;

-- View all survey questions
SELECT * FROM survey_questions;

-- Quit psql
\q
```

## Troubleshooting

### "Database does not exist" error
```sh
createdb homepath_db
```

### "Permission denied" error
```sh
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL
brew services start postgresql@16
```

### "psql: command not found"
Add PostgreSQL to your PATH:
```sh
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## Database Schema Overview

- **user_info** - User accounts and profiles
- **survey_questions** - Survey question templates
- **user_responses** - User answers to survey questions
- **todo_items** - Master list of todo items
- **steps** - User's journey steps
- **user_todos** - User-specific todo assignments
