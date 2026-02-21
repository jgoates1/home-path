#!/bin/bash

# Database reset script - drops and recreates the database

set -e

DB_NAME="homepath_db"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔄 Resetting database '$DB_NAME'..."
echo ""

# Drop database if it exists
if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    dropdb "$DB_NAME"
    echo "✓ Database dropped"
fi

# Create database
createdb "$DB_NAME"
echo "✓ Database created"

# Run schema
psql -d "$DB_NAME" -f "$SCRIPT_DIR/schema.sql" > /dev/null
echo "✓ Schema created"

# Run seeds
psql -d "$DB_NAME" -f "$SCRIPT_DIR/seed.sql" > /dev/null
echo "✓ Data seeded"

echo ""
echo "✅ Database reset complete!"
echo ""
