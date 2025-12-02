#!/bin/bash

# Import Supabase backup into Docker PostgreSQL
# This script imports a SQL dump file into the Docker PostgreSQL container

set -e

echo "================================================"
echo "Import Backup to Docker PostgreSQL"
echo "================================================"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup-file.sql>"
    echo ""
    echo "Available backups:"
    ls -lh ./backups/*.sql 2>/dev/null || echo "  No backups found in ./backups/"
    exit 1
fi

BACKUP_FILE="$1"

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: File not found: $BACKUP_FILE"
    exit 1
fi

echo "Backup file: $BACKUP_FILE"
echo ""

# Check if docker-compose is running
if ! docker-compose ps | grep -q "ctenvios-postgres.*Up"; then
    echo "Starting Docker containers..."
    docker-compose up -d postgres
    echo "Waiting for PostgreSQL to be ready..."
    sleep 10
fi

echo "Importing backup into Docker PostgreSQL..."
echo ""

# Copy backup file into container
docker cp "$BACKUP_FILE" ctenvios-postgres:/tmp/backup.sql

# Import the backup
docker-compose exec -T postgres psql -U postgres -d ctenvios_tracking -f /tmp/backup.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Import successful!"
    echo ""
    echo "Next steps:"
    echo "  1. Verify the import: docker-compose exec postgres psql -U postgres -d ctenvios_tracking -c '\\dt'"
    echo "  2. Start the API: docker-compose up -d api"
else
    echo "❌ Import failed!"
    exit 1
fi

# Clean up
docker-compose exec -T postgres rm /tmp/backup.sql

echo "================================================"
echo "Import complete!"
echo "================================================"

