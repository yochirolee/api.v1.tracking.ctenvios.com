#!/bin/bash

# Supabase Database Export Script
# This script exports your Supabase database to a SQL file

set -e

echo "================================================"
echo "Supabase Database Export Script"
echo "================================================"

# Configuration
SUPABASE_HOST="${SUPABASE_HOST:-aws-0-us-west-1.pooler.supabase.com}"
SUPABASE_PORT="${SUPABASE_PORT:-5432}"
SUPABASE_USER="${SUPABASE_USER:-postgres}"
SUPABASE_DB="${SUPABASE_DB:-postgres}"
OUTPUT_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_FILE="${OUTPUT_DIR}/supabase_export_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo ""
echo "Configuration:"
echo "  Host: $SUPABASE_HOST"
echo "  Port: $SUPABASE_PORT"
echo "  User: $SUPABASE_USER"
echo "  Database: $SUPABASE_DB"
echo "  Output: $OUTPUT_FILE"
echo ""

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo "Error: pg_dump not found. Please install PostgreSQL client tools."
    echo "  macOS: brew install postgresql@16"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

# Prompt for password if not set
if [ -z "$PGPASSWORD" ]; then
    read -sp "Enter Supabase password: " PGPASSWORD
    echo ""
    export PGPASSWORD
fi

echo "Starting export..."
echo ""

# Export database (schema + data)
pg_dump \
    --host="$SUPABASE_HOST" \
    --port="$SUPABASE_PORT" \
    --username="$SUPABASE_USER" \
    --dbname="$SUPABASE_DB" \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    --format=plain \
    --file="$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Export successful!"
    echo "   File: $OUTPUT_FILE"
    echo "   Size: $(du -h "$OUTPUT_FILE" | cut -f1)"
    echo ""
    echo "To import into Docker PostgreSQL:"
    echo "  docker-compose exec postgres psql -U postgres -d ctenvios_tracking -f /path/to/backup.sql"
else
    echo "❌ Export failed!"
    exit 1
fi

# Optional: Export only schema
SCHEMA_FILE="${OUTPUT_DIR}/supabase_schema_${TIMESTAMP}.sql"
echo "Exporting schema only..."
pg_dump \
    --host="$SUPABASE_HOST" \
    --port="$SUPABASE_PORT" \
    --username="$SUPABASE_USER" \
    --dbname="$SUPABASE_DB" \
    --schema-only \
    --no-owner \
    --no-privileges \
    --format=plain \
    --file="$SCHEMA_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Schema export successful!"
    echo "   File: $SCHEMA_FILE"
fi

# Optional: Export only data
DATA_FILE="${OUTPUT_DIR}/supabase_data_${TIMESTAMP}.sql"
echo "Exporting data only..."
pg_dump \
    --host="$SUPABASE_HOST" \
    --port="$SUPABASE_PORT" \
    --username="$SUPABASE_USER" \
    --dbname="$SUPABASE_DB" \
    --data-only \
    --no-owner \
    --no-privileges \
    --format=plain \
    --file="$DATA_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Data export successful!"
    echo "   File: $DATA_FILE"
fi

echo ""
echo "================================================"
echo "Export complete! Files saved in: $OUTPUT_DIR"
echo "================================================"

