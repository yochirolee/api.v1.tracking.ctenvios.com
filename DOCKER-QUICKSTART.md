# 🚀 Docker Quick Start Guide

Get your CTEnvios Tracking API running with Docker in minutes!

## Prerequisites

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- PostgreSQL client tools (for data export)

## 📦 Step-by-Step Setup

### 1. Clone and Navigate

```bash
cd /path/to/api.v1.tracking.ctenvios.com
```

### 2. Create Environment File

Create a `.env` file with your configuration:

```bash
cat > .env << EOF
# PostgreSQL Configuration
POSTGRES_PASSWORD=ctenvios2024secure
POSTGRES_DB=ctenvios_tracking

# MySQL Configuration
MYSQL_ROOT_PASSWORD=mysql2024secure
MYSQL_DATABASE=ctenvios
MYSQL_USER=ctenvios_user
MYSQL_PASSWORD=ctenvios2024secure

# Application
NODE_ENV=production
PORT=3000

# JWT Secrets (change these!)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
EOF
```

### 3. Export Data from Supabase (First Time Only)

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Export your Supabase data
export PGPASSWORD="your-supabase-password"
./scripts/export-supabase.sh
```

### 4. Start Databases

```bash
# Using Docker Compose
docker-compose up -d postgres mysql

# OR using Make
make up
```

Wait 10-15 seconds for databases to initialize.

### 5. Import Your Data

```bash
# Find your backup file
ls -la backups/

# Import the data
./scripts/import-to-docker.sh backups/supabase_export_YYYYMMDD_HHMMSS.sql

# OR using Make
make import FILE=backups/your-backup.sql
```

### 6. Start the API

```bash
docker-compose up -d api

# View logs
docker-compose logs -f api
```

### 7. Verify Everything Works

```bash
# Check all services are running
docker-compose ps

# Test the API
curl http://localhost:3000/api/v1

# Check database
docker-compose exec postgres psql -U postgres -d ctenvios_tracking -c '\dt'
```

## ✅ Success! 

Your API is now running at: **http://localhost:3000**

## 🛠️ Common Commands

### Using Make (Recommended)

```bash
make help          # Show all commands
make up            # Start services
make down          # Stop services
make logs          # View logs
make backup        # Backup database
make psql          # Connect to PostgreSQL
make shell         # Open API shell
make restart       # Restart services
```

### Using Docker Compose

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart API only
docker-compose restart api

# Execute commands
docker-compose exec api sh
docker-compose exec postgres psql -U postgres -d ctenvios_tracking
```

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000
lsof -i :5432

# Kill the process or change ports in docker-compose.yml
```

### API Not Starting

```bash
# Check logs
docker-compose logs api

# Verify database connection
docker-compose exec api npx prisma db pull
```

### Database Connection Failed

```bash
# Ensure PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Import Failed

```bash
# Drop and recreate database
docker-compose exec postgres psql -U postgres -c 'DROP DATABASE IF EXISTS ctenvios_tracking;'
docker-compose exec postgres psql -U postgres -c 'CREATE DATABASE ctenvios_tracking;'

# Try import again
./scripts/import-to-docker.sh backups/your-backup.sql
```

## 🎯 Next Steps

1. **Update Prisma Connection**: Remove `pgbouncer=true` from local DATABASE_URL since you're not using a pooler anymore
2. **Configure CORS**: Update allowed origins in `src/api/v1/app.ts`
3. **Set Up Backups**: Schedule regular database backups
4. **Production Deploy**: Use `docker-compose.prod.yml` for production

## 📚 Full Documentation

For detailed migration instructions, see [MIGRATION.md](./MIGRATION.md)

## 🆘 Need Help?

- Check logs: `make logs` or `docker-compose logs -f`
- Verify environment: `docker-compose config`
- Check resources: `docker stats`
- Read full docs: `MIGRATION.md`

---

**Pro Tip**: Add `alias dc='docker-compose'` to your shell for faster commands! 🚀

