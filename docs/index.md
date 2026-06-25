# Financial Transaction Monitoring & Analytics Tool


## Overview

A comprehensive, secure, and intuitive **financial tracking platform** for individuals, freelancers, and small business owners. Built with Django REST Framework, PostgreSQL, and Redis.

## Core Features

### Multi-User & Authentication

- JWT-based token authentication with password hashing
- Secure password management and reset functionality
- User profile management

### Transaction Management

- Create, update, soft-delete, and restore transactions
- ACID compliance for data integrity
- Bulk CSV import capabilities
- Transaction tagging and categorization
- Soft delete with 30-day recovery window

### Budget Tracking

- Category-based budget creation
- Spending threshold alerts
- Real-time budget monitoring
- Multiple budget period types (Daily, Weekly, Monthly, Quarterly, Annual)

### Recurring Transactions

- Automate recurring income/expense logging
- Flexible frequency options (Daily, Weekly, Biweekly, Monthly, Quarterly, Annual)
- Manual and automatic execution modes

### Analytics & Reporting

- Monthly, quarterly, and annual financial reports
- Category-wise expense breakdown
- Savings rate calculation
- Comparison across time periods
- Top expenses tracking
- Budget status visualization

## Security Features

- **Encryption**: AES-256 for sensitive data at rest
- **HTTPS/TLS**: Enforced in production
- **Rate Limiting**: 100 requests per minute per IP
- **Data Isolation**: Multi-tenant architecture
- **JWT**: Secure token-based authentication
- **CORS**: Configured origin restrictions
- **CSRF Protection**: Enabled by default

## Technology Stack

| Component          | Technology                                            |
| ------------------ | ----------------------------------------------------- |
| **Backend**        | Django 4.2+ with Django REST Framework                |
| **Database**       | PostgreSQL (relational model for financial integrity) |
| **Cache**          | Redis for session storage and analytics caching       |
| **Authentication** | JWT (djangorestframework-simplejwt)                   |
| **Documentation**  | drf-spectacular (OpenAPI/Swagger)                     |
| **Infrastructure** | Docker & Kubernetes ready                             |

## Quick Start

### Prerequisites

- Python 3.9+
- PostgreSQL 12+
- Redis 6+
- Docker & Docker Compose (optional)

### Local Development Setup

```bash
# Clone repository
git clone <repository-url>
cd Financial-Transaction-Monitoring-Analytics-Tool

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env

# Run migrations
cd src
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

**Access Points:**

- API: http://localhost:8000/api/
- Swagger Docs: http://localhost:8000/api/docs/
- Admin: http://localhost:8000/admin/

## API Endpoints

### Authentication

- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - JWT token login
- `POST /api/auth/refresh/` - Refresh access token

### Transactions

- `GET /api/transactions/` - List transactions
- `POST /api/transactions/` - Create transaction
- `DELETE /api/transactions/{id}/` - Soft delete
- `POST /api/transactions/restore/` - Restore deleted
- `POST /api/transactions/bulk_import/` - Bulk CSV import

### Budgets

- `GET /api/budgets/` - List budgets
- `POST /api/budgets/` - Create budget with alerts
- `GET /api/budgets/alerts/` - View all budget alerts

### Analytics

- `GET /api/transactions/summary/` - Dashboard summary
- Comprehensive financial insights via analytics module

## Database Schema

Core models include:

- **CustomUser** - User profiles
- **Category** - Transaction categories
- **Transaction** - Individual transactions (with soft delete)
- **Budget** - Budget definitions and limits
- **BudgetAlert** - Budget threshold alerts
- **RecurringTransaction** - Automated recurring transactions

## Testing

```bash
# Run all tests
pytest

# Specific test file
pytest tests/test_api.py

# With coverage
pytest --cov=src.transactions tests/
```

## Deployment

### Docker Deployment

```bash
docker build -f docker/Dockerfile -t financial-monitoring:latest .
docker-compose -f docker/docker-compose.staging.yml up -d
```

### Kubernetes Deployment

```bash
kubectl apply -f k8s/deployment_staging.yaml
kubectl apply -f k8s/service_staging.yaml
```

## Performance Optimizations

- Database indexing on high-query columns
- Redis caching for analytics results (1-hour TTL)
- Query optimization with `select_related()` and `prefetch_related()`
- Pagination (50 items per page)
- Rate limiting per IP address

## Repository

[View on GitHub](https://github.com/Markkimotho/Financial-Transaction-Monitoring-Analytics-Tool)
