# CTEnvios Tracking API - Docker Commands
# Simple commands to manage your Docker environment

.PHONY: help build up down restart logs clean backup export import

# Default target
help:
	@echo "CTEnvios Tracking API - Docker Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  make build       - Build Docker images"
	@echo "  make up          - Start all services"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - View logs (follow mode)"
	@echo "  make clean       - Stop and remove all containers and volumes"
	@echo "  make backup      - Backup PostgreSQL database"
	@echo "  make export      - Export data from Supabase"
	@echo "  make import      - Import backup to Docker PostgreSQL"
	@echo "  make psql        - Connect to PostgreSQL CLI"
	@echo "  make mysql       - Connect to MySQL CLI"
	@echo "  make shell       - Open shell in API container"
	@echo "  make migrate     - Run Prisma migrations"
	@echo "  make pgadmin     - Start PgAdmin"

# Build Docker images
build:
	docker-compose build

# Start all services
up:
	docker-compose up -d
	@echo "Services started! API available at http://localhost:3000"

# Start with logs
up-logs:
	docker-compose up

# Stop all services
down:
	docker-compose down

# Restart all services
restart:
	docker-compose restart

# View logs
logs:
	docker-compose logs -f

# View API logs only
logs-api:
	docker-compose logs -f api

# View PostgreSQL logs only
logs-postgres:
	docker-compose logs -f postgres

# Clean everything (WARNING: Deletes all data!)
clean:
	@echo "WARNING: This will delete all containers, images, and volumes!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "Cleaned!"; \
	fi

# Backup PostgreSQL database
backup:
	@mkdir -p backups
	@TIMESTAMP=$$(date +%Y%m%d_%H%M%S); \
	docker-compose exec postgres pg_dump -U postgres -d ctenvios_tracking > backups/backup_$$TIMESTAMP.sql; \
	echo "Backup created: backups/backup_$$TIMESTAMP.sql"

# Export from Supabase
export:
	@./scripts/export-supabase.sh

# Import backup (usage: make import FILE=backups/backup.sql)
import:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make import FILE=backups/backup.sql"; \
		exit 1; \
	fi
	@./scripts/import-to-docker.sh $(FILE)

# Connect to PostgreSQL CLI
psql:
	docker-compose exec postgres psql -U postgres -d ctenvios_tracking

# Connect to MySQL CLI
mysql:
	docker-compose exec mysql mysql -u root -p

# Open shell in API container
shell:
	docker-compose exec api sh

# Run Prisma migrations
migrate:
	docker-compose exec api npx prisma migrate deploy

# Generate Prisma client
generate:
	docker-compose exec api npx prisma generate

# Start PgAdmin
pgadmin:
	docker-compose --profile tools up -d pgadmin
	@echo "PgAdmin started! Access at http://localhost:5050"

# Check status of services
status:
	docker-compose ps

# View resource usage
stats:
	docker stats --no-stream

# Prune unused Docker resources
prune:
	docker system prune -f
	docker volume prune -f

