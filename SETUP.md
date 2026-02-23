# Setup & Installation Guide

This guide provides step-by-step instructions to set up the Financial Monitoring & Analytics Tool on your local development machine or production environment.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Local Development Setup](#local-development-setup)
3. [Database Setup](#database-setup)
4. [Redis Setup](#redis-setup)
5. [Running the Application](#running-the-application)
6. [Docker Setup](#docker-setup)
7. [Kubernetes Deployment](#kubernetes-deployment)
8. [Troubleshooting](#troubleshooting)

## Quick Start

For experienced Django developers, here's a quick summary:

```bash
# Clone and navigate
git clone <repository-url>
cd Financial-Transaction-Monitoring-Analytics-Tool

# Setup
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure
cp .env.example .env
# Edit .env with your settings

# Initialize
cd src
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Access
# API: http://localhost:8000/api/
# Docs: http://localhost:8000/api/docs/
# Admin: http://localhost:8000/admin/
```

## Local Development Setup

### Prerequisites
- **Python**: 3.9+ (check with `python --version`)
- **PostgreSQL**: 12+ ([Download](https://www.postgresql.org/download/))
- **Redis**: 6+ ([Download](https://redis.io/download))
- **Git**: For version control

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/Financial-Transaction-Monitoring-Analytics-Tool.git
cd Financial-Transaction-Monitoring-Analytics-Tool
```

### Step 2: Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate it (macOS/Linux)
source venv/bin/activate

# Activate it (Windows)
venv\Scripts\activate

# Verify activation
which python  # Should show path inside venv
```

### Step 3: Install Dependencies

```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

```bash
# Copy example configuration
cp .env.example .env

# Edit with your settings (use your favorite editor)
nano .env  # or vim, code, etc.
```

**Important variables to set:**

```env
# Security (development settings)
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_ENGINE=django.db.backends.postgresql_psycopg2
DB_NAME=financial_monitoring
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/1
```

### Step 5: Database Setup

See [Database Setup section](#database-setup) below.

### Step 6: Apply Migrations

```bash
cd src

# Create migrations (optional if none exist)
python manage.py makemigrations transactions

# Apply all migrations
python manage.py migrate
```

After migrations, you should see:
```
Running migrations:
  Applying transactions.0001_initial... OK
  Applying transactions.0002_... OK
  ...
```

### Step 7: Create Superuser

```bash
python manage.py createsuperuser
# Follow the prompts:
# Email: admin@example.com
# Username: admin
# Password: (something secure)
```

### Step 8: Initialize Default Categories

```bash
# Create default categories for all users
python manage.py init_default_categories

# Create default categories for a specific user
python manage.py init_default_categories --user-id=<user-uuid>
```

### Step 9: Run Development Server

```bash
python manage.py runserver

# Or specify a different port
python manage.py runserver 8001
```

You should see:
```
Django version 4.2, using settings 'core.settings'
Starting development server at http://127.0.0.1:8000/
```

## Database Setup

### PostgreSQL Installation

**macOS:**
```bash
# Using Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Or manually
/opt/homebrew/opt/postgresql@15/bin/postgres -D /opt/homebrew/var/postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download and run the PostgreSQL installer from https://www.postgresql.org/download/windows/

### Create Database and User

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql shell:
CREATE DATABASE financial_monitoring;
CREATE USER financial_user WITH PASSWORD 'secure_password';
ALTER ROLE financial_user SET client_encoding TO 'utf8';
ALTER ROLE financial_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE financial_user SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE financial_monitoring TO financial_user;
\q
```

### Verify Connection

```bash
# Test connection
psql -U financial_user -d financial_monitoring -h localhost

# You should see the prompt: financial_monitoring=>
# Exit with: \q
```

Update your `.env` file with these credentials:

```env
DB_USER=financial_user
DB_PASSWORD=secure_password
DB_NAME=financial_monitoring
```

## Redis Setup

### Redis Installation

**macOS:**
```bash
# Using Homebrew
brew install redis

# Start Redis service
brew services start redis

# Or manually
redis-server
```

**Ubuntu/Debian:**
```bash
sudo apt-get install redis-server

# Start service
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**Windows:**
Download from https://github.com/microsoftarchive/redis/releases
Or use WSL (Windows Subsystem for Linux) with Ubuntu instructions.

### Verify Redis Connection

```bash
# In another terminal
redis-cli ping
# Should respond: PONG

# Check Redis server info
redis-cli info
```

## Running the Application

### Development Server

```bash
cd src
python manage.py runserver
```

Access at: `http://localhost:8000/`

### Full Development Stack

You'll need 3 terminal windows:

**Terminal 1 - Django:**
```bash
cd src
python manage.py runserver
```

**Terminal 2 - Celery Worker (for async tasks):**
```bash
celery -A core worker -l info
```

**Terminal 3 - Celery Beat (for scheduled tasks):**
```bash
celery -A core beat -l info
```

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_api_new.py

# Run with coverage report
pytest --cov=src.transactions tests/

# Run specific test class
pytest tests/test_api_new.py::AuthenticationTestCase

# Run specific test method
pytest tests/test_api_new.py::AuthenticationTestCase::test_user_registration
```

### Useful Django Commands

```bash
cd src

# Create a new migration
python manage.py makemigrations transactions

# Apply migrations
python manage.py migrate

# Rollback migrations
python manage.py migrate transactions zero

# List all migrations
python manage.py showmigrations

# Access Django shell
python manage.py shell

# Clear Django cache
python manage.py clear_cache

# Collect static files (for production)
python manage.py collectstatic --noinput

# Flush entire database (WARNING: deletes all data)
python manage.py flush

# Create a backup
python manage.py dumpdata > backup.json

# Restore from backup
python manage.py loaddata backup.json
```

## Docker Setup

### Building Docker Image

```bash
# Build the Docker image
docker build -f docker/Dockerfile -t financial-monitoring:latest .

# Verify image was created
docker images | grep financial-monitoring
```

### Running with Docker Compose

```bash
# Start all services (Django, PostgreSQL, Redis)
docker-compose -f docker/docker-compose.staging.yml up -d

# View logs
docker-compose -f docker/docker-compose.staging.yml logs -f

# Stop services
docker-compose -f docker/docker-compose.staging.yml down

# Stop and remove volumes (WARNING: deletes data)
docker-compose -f docker/docker-compose.staging.yml down -v
```

### Docker Troubleshooting

```bash
# Check container status
docker-compose -f docker/docker-compose.staging.yml ps

# View container logs
docker-compose -f docker/docker-compose.staging.yml logs <service-name>

# Connect to running container
docker exec -it <container-id> bash

# Rebuild without cache
docker-compose -f docker/docker-compose.staging.yml build --no-cache
```

## Kubernetes Deployment

### Prerequisites
- `kubectl` installed and configured
- Access to a Kubernetes cluster (local minikube or cloud)
- Docker images pushed to registry

### Deploy to Kubernetes

```bash
# Apply persistence volume
kubectl apply -f k8s/persistent-volume.yaml

# Apply secrets (update with real values first)
kubectl create secret generic financial-monitoring-secret \
  --from-literal=SECRET_KEY='your-secret-key' \
  --from-literal=DB_PASSWORD='your-db-password'

# Apply deployments
kubectl apply -f k8s/deployment_staging.yaml

# Apply services
kubectl apply -f k8s/service_staging.yaml

# Check status
kubectl get pods
kubectl get services
kubectl describe pod <pod-name>
```

### Monitor Kubernetes

```bash
# View pod logs
kubectl logs <pod-name>
kubectl logs <pod-name> -f  # Follow logs

# Get shell access to pod
kubectl exec -it <pod-name> -- bash

# View resource usage
kubectl top nodes
kubectl top pods

# Get more detailed pod info
kubectl describe pod <pod-name>
```

## Troubleshooting

### Python/Virtual Environment Issues

**Issue: `python command not found` or wrong version**
```bash
# Check Python version
python --version  # Should be 3.9+

# Use python3 explicitly
python3 -m venv venv
python3 -m pip install -r requirements.txt
```

**Issue: Modules not found even after `pip install`**
```bash
# Ensure venv is activated
source venv/bin/activate

# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Database Issues

**Issue: `psycopg2` module error**
```bash
# Install system dependencies
# macOS:
brew install postgresql

# Ubuntu/Debian:
sudo apt-get install libpq-dev python3-dev

# Then reinstall
pip install psycopg2-binary
```

**Issue: Connection refused (postgres)**
```bash
# Check if PostgreSQL is running
# macOS:
brew services list | grep postgresql

# Ubuntu:
sudo systemctl status postgresql

# Start if not running:
# macOS: brew services start postgresql@15
# Ubuntu: sudo systemctl start postgresql
```

**Issue: Database doesn't exist**
```bash
# Create it
createdb financial_monitoring

# Or via psql
psql -U postgres -c "CREATE DATABASE financial_monitoring;"
```

**Issue: User doesn't have permissions**
```bash
# Reset permissions
psql -U postgres -d financial_monitoring -c \
  "GRANT ALL PRIVILEGES ON DATABASE financial_monitoring TO financial_user;"
```

### Redis Issues

**Issue: Connection error to Redis**
```bash
# Check if Redis is running
redis-cli ping  # Should return PONG

# Start Redis
# macOS: brew services start redis
# Ubuntu: sudo systemctl start redis-server
```

**Issue: "Error connecting to Redis"**
```bash
# Verify .env REDIS_URL
echo $REDIS_URL  # Should be redis://localhost:6379/1

# Test connection
redis-cli -u redis://localhost:6379/1
redis-cli ping
```

### Migration Issues

**Issue: Migration conflicts**
```bash
# Show all migrations
python manage.py showmigrations

# Rollback specific migration
python manage.py migrate transactions 0001

# Create new migration
python manage.py makemigrations
python manage.py migrate
```

**Issue: "No migrations to apply"**
```bash
# Create initial migration
python manage.py makemigrations transactions

# Apply it
python manage.py migrate
```

### Django/API Issues

**Issue: Superuser login fails**
```bash
# Create new superuser
python manage.py createsuperuser

# Or reset password
python manage.py changepassword <username>
```

**Issue: Static files not found**
```bash
# Collect static files
python manage.py collectstatic --noinput

# For development, ensure DEBUG=True in .env
```

**Issue: CORS errors when accessing from frontend**
```bash
# Update CORS_ALLOWED_ORIGINS in .env:
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Then restart server
```

### General Debugging

**Enable debug logging:**
```python
# In .env
DEBUG=True
DJANGO_LOG_LEVEL=DEBUG
```

**Access Django shell for debugging:**
```bash
python manage.py shell

# In shell:
from src.transactions.models import CustomUser, Transaction
user = CustomUser.objects.first()
print(user.email)
```

**Check installed packages:**
```bash
pip list
pip show django
```

**Verify all services are running:**
```bash
# Check Django
curl http://localhost:8000/api/

# Check PostgreSQL
psql -U financial_user -d financial_monitoring -c "SELECT 1;"

# Check Redis
redis-cli ping
```

## Next Steps

1. **Create your first user**: Visit `/admin/` and create a user or use the registration endpoint
2. **Initialize default categories**: `python manage.py init_default_categories --user-id=<user-uuid>`
3. **Test API**: Visit `/api/docs/` for interactive API documentation
4. **Create test data**: Use the admin interface or API to create transactions
5. **Explore analytics**: Check `/api/analytics/` endpoints for insights

## Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

## Getting Help

If you encounter issues:

1. Check this troubleshooting section
2. Check the logs: `docker-compose logs` or `python manage.py runserver`
3. Search existing GitHub issues
4. Create a new GitHub issue with:
   - Error message
   - Steps to reproduce
   - System information (OS, Python version)
   - Relevant logs

## Support Contact

For questions or support, please open an issue on GitHub or contact the development team.
