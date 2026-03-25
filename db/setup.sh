#!/bin/bash

# Database setup script for HomePath

set -e  # Exit on error

DB_NAME="homepath_db"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🏠 HomePath Database Setup"
echo "=========================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo "Please install PostgreSQL first:"
    echo "  brew install postgresql@16"
    exit 1
fi

echo "✓ PostgreSQL is installed"

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo ""
    read -p "⚠️  Database '$DB_NAME' already exists. Drop and recreate? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping existing database..."
        dropdb "$DB_NAME"
        echo "✓ Database dropped"
    else
        echo "Aborting setup."
        exit 0
    fi
fi

# Create database
echo ""
echo "Creating database '$DB_NAME'..."
createdb "$DB_NAME"
echo "✓ Database created"

# Run migration
echo ""
echo "Running migration..."
psql -d "$DB_NAME" -f "$SCRIPT_DIR/migrate.sql" > /dev/null
echo "✓ Schema created"

# Verify setup
echo ""
echo "Verifying setup..."
TABLES=$(psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Connection info:"
echo "  Database: $DB_NAME"
echo "  URL: postgresql://localhost:5432/$DB_NAME"
echo ""
echo "To connect: psql $DB_NAME"
echo ""
