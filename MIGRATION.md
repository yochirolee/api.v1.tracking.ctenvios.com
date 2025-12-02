# Migration Guide: Supabase to Docker PostgreSQL

This guide will help you migrate your CTEnvios Tracking application from Supabase to a self-hosted Docker environment.

## 📋 Prerequisites

- Docker and Docker Compose installed
- PostgreSQL client tools (`pg_dump`, `psql`)
  - macOS: `brew install postgresql@16`
  - Ubuntu: `sudo apt-get install postgresql-client`
- Access to your Supabase database credentials

## 🚀 Quick Start

### 1. Export Data from Supabase

```bash
# Set your Supabase credentials
export SUPABASE_HOST="aws-0-us-west-1.pooler.supabase.com"
export SUPABASE_USER="postgres"
export PGPASSWORD="your-supabase-password"

# Run the export script
./scripts/export-supabase.sh
```

This will create backup files in the `./backups/` directory:
- `supabase_export_YYYYMMDD_HHMMSS.sql` - Full database (schema + data)
- `supabase_schema_YYYYMMDD_HHMMSS.sql` - Schema only
- `supabase_data_YYYYMMDD_HHMMSS.sql` - Data only

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# PostgreSQL Configuration
POSTGRES_PASSWORD=your-secure-postgres-password
POSTGRES_DB=ctenvios_tracking

# MySQL Configuration (if needed)
MYSQL_ROOT_PASSWORD=your-mysql-root-password
MYSQL_DATABASE=ctenvios
MYSQL_USER=ctenvios_user
MYSQL_PASSWORD=your-mysql-user-password

# Application Configuration
NODE_ENV=production
PORT=3000

# JWT Secrets
JWT_SECRET=your-very-secure-jwt-secret-key-here
JWT_REFRESH_SECRET=your-very-secure-refresh-secret-key-here

# PgAdmin (optional)
PGADMIN_EMAIL=admin@ctenvios.com
PGADMIN_PASSWORD=admin
```

### 3. Start Docker Containers

```bash
# Start PostgreSQL and MySQL only (without API)
docker-compose up -d postgres mysql

# Wait for databases to be ready
docker-compose ps
```

### 4. Import Data into Docker PostgreSQL

```bash
# Import the backup
./scripts/import-to-docker.sh ./backups/supabase_export_YYYYMMDD_HHMMSS.sql
```

Or manually:

```bash
# Copy backup to container
docker cp ./backups/your-backup.sql ctenvios-postgres:/tmp/backup.sql

# Import into database
docker-compose exec postgres psql -U postgres -d ctenvios_tracking -f /tmp/backup.sql
```

### 5. Run Prisma Migrations (Optional)

If you want to use Prisma migrations instead of direct import:

```bash
# Update your .env with Docker PostgreSQL URL
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/ctenvios_tracking"

# Run migrations
npx prisma migrate deploy

# Or reset and migrate
npx prisma migrate reset
```

### 6. Start the Application

```bash
# Start all services (API will run migrations automatically)
docker-compose up -d

# Check logs
docker-compose logs -f api

# Verify services are running
docker-compose ps
```

## 🔍 Verification

### Check Database Tables

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d ctenvios_tracking

# List tables
\dt

# Check record counts
SELECT 'users' as table_name, COUNT(*) as count FROM "User"
UNION ALL
SELECT 'shipments', COUNT(*) FROM "Shipment"
UNION ALL
SELECT 'agencies', COUNT(*) FROM "Agency";

# Exit
\q
```

### Test API Endpoints

```bash
# Health check
curl http://localhost:3000/api/v1

# Test a specific endpoint
curl http://localhost:3000/api/v1/shipments
```

## 🛠️ Useful Docker Commands

### Container Management

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (DELETES DATA!)
docker-compose down -v

# Restart a specific service
docker-compose restart api

# View logs
docker-compose logs -f api
docker-compose logs -f postgres

# Execute commands in containers
docker-compose exec api sh
docker-compose exec postgres psql -U postgres -d ctenvios_tracking
```

### Database Management

```bash
# Create a backup from Docker PostgreSQL
docker-compose exec postgres pg_dump -U postgres -d ctenvios_tracking > backup.sql

# Create a compressed backup
docker-compose exec postgres pg_dump -U postgres -d ctenvios_tracking | gzip > backup.sql.gz

# Restore from backup
docker-compose exec -T postgres psql -U postgres -d ctenvios_tracking < backup.sql
```

### PgAdmin (Optional Database Management Tool)

Start PgAdmin:

```bash
docker-compose --profile tools up -d pgadmin
```

Access at: http://localhost:5050
- Email: admin@ctenvios.com (or your configured email)
- Password: admin (or your configured password)

Add PostgreSQL server:
- Host: postgres
- Port: 5432
- Database: ctenvios_tracking
- Username: postgres
- Password: (your POSTGRES_PASSWORD)

## 🔄 Updating the Application

### Update Code

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build api
```

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Deploy migrations to production
docker-compose exec api npx prisma migrate deploy
```

## 📦 Building for Production

### Build Docker Image

```bash
# Build the image
docker build -t ctenvios-api:latest .

# Tag for registry
docker tag ctenvios-api:latest your-registry.com/ctenvios-api:latest

# Push to registry
docker push your-registry.com/ctenvios-api:latest
```

## 🐛 Troubleshooting

### PostgreSQL Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Verify connection from host
psql "postgresql://postgres:your-password@localhost:5432/ctenvios_tracking"
```

### API Connection Issues

```bash
# Check API logs
docker-compose logs -f api

# Verify environment variables
docker-compose exec api env | grep DATABASE_URL

# Test Prisma connection
docker-compose exec api npx prisma db pull
```

### Data Import Issues

If data import fails:

1. Check if tables exist: `docker-compose exec postgres psql -U postgres -d ctenvios_tracking -c '\dt'`
2. Drop and recreate database:
   ```bash
   docker-compose exec postgres psql -U postgres -c 'DROP DATABASE IF EXISTS ctenvios_tracking;'
   docker-compose exec postgres psql -U postgres -c 'CREATE DATABASE ctenvios_tracking;'
   ```
3. Re-import the backup

## 🔐 Security Considerations

1. **Change default passwords** in `.env` file
2. **Use strong JWT secrets** (generate with `openssl rand -base64 32`)
3. **Don't commit `.env` file** to version control
4. **Use Docker secrets** for production deployments
5. **Enable SSL/TLS** for PostgreSQL in production
6. **Regular backups** - automate with cron jobs

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)

## 🆘 Need Help?

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables are set correctly
3. Ensure ports 3000, 5432, and 3306 are not in use
4. Check Docker resources (memory, CPU)

---

**Note**: Always test the migration in a development environment before applying to production!

