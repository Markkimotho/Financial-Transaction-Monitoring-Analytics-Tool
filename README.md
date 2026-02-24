# Financial Monitoring & Analytics Tool

A comprehensive, secure, and intuitive financial tracking platform for individuals, freelancers, and small business owners. Built with Django REST Framework, PostgreSQL, and Redis.

## Features

### Core Functionality
- **Multi-user Authentication**: JWT-based token authentication with password hashing
- **Transaction Management**: Create, update, soft-delete, and restore transactions with ACID compliance
- **Budget Tracking**: Set category budgets with alert thresholds
- **Recurring Transactions**: Automate recurring income/expense logging
- **Analytics & Reporting**: Comprehensive financial insights and comparisons

### Security Features
- **Encryption**: AES-256 for sensitive data at rest
- **HTTPS/TLS**: Forced HTTPS in production
- **Rate Limiting**: 100 requests per minute per IP to prevent brute force
- **Data Isolation**: Multi-tenant architecture ensuring user data isolation
- **JWT Authentication**: Secure token-based session management

### User Features
- **Budget Alerts**: Real-time warnings when spending exceeds thresholds
- **Soft Deletes**: Restore deleted transactions within 30 days
- **Bulk Imports**: CSV file import for batch transaction creation
- **Category Management**: Custom expense/income categories with color coding
- **Monthly/Quarterly/Annual Reports**: Compare spending across periods
- **Savings Rate Calculation**: Automatic financial health metrics

## Technology Stack

- **Backend**: Django 4.2+ with Django REST Framework
- **Database**: PostgreSQL (relational data critical for financial integrity)
- **Cache**: Redis for session storage and analytics caching
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Documentation**: drf-spectacular (OpenAPI/Swagger)
- **Infrastructure**: Docker & Kubernetes ready

## Project Structure

```
.
├── src/
│   ├── core/                 # Django project settings
│   │   ├── settings.py      # Configuration (security, DB, cache, logging)
│   │   ├── urls.py          # URL routing
│   │   ├── wsgi.py          # WSGI application
│   │   └── asgi.py          # ASGI application
│   ├── transactions/         # Main app
│   │   ├── models.py        # CustomUser, Transaction, Budget, Category models
│   │   ├── views.py         # ViewSets and API endpoints
│   │   ├── serializers.py   # DRF serializers
│   │   ├── urls.py          # App-level routing
│   │   ├── admin.py         # Django admin interface
│   │   ├── analytics.py     # FR9: Analytics utilities
│   │   └── migrations/      # Database migrations
│   └── manage.py            # Django management
├── tests/                    # Comprehensive test suite
├── config/                   # Configuration files
├── docker/                   # Docker & Docker Compose
├── k8s/                      # Kubernetes manifests
├── requirements.txt          # Python dependencies
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## Getting Started

### Prerequisites
- Python 3.9+
- PostgreSQL 12+
- Redis 6+
- Docker & Docker Compose (optional)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Financial-Transaction-Monitoring-Analytics-Tool
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

5. **Apply database migrations**
   ```bash
   cd src
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run development servers**

   **Terminal 1 - Backend (Django)**
   ```bash
   cd src
   python manage.py runserver
   ```
   - API: `http://localhost:8000/api/`
   - API Documentation: `http://localhost:8000/api/docs/`
   - Admin interface: `http://localhost:8000/admin/`

   **Terminal 2 - Frontend (React)**
   ```bash
   cd frontend
   npm run dev
   ```
   - Application: `http://localhost:3000`
   - Frontend will automatically proxy API requests to backend

   Both servers must be running for full functionality.

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - JWT token login
- `POST /api/auth/refresh/` - Refresh access token

### Users (FR1, FR2)
- `GET /api/users/` - List users
- `GET /api/users/me/` - Get current user profile
- `POST /api/users/change_password/` - Change password
- `POST /api/users/request_password_reset/` - Request password reset

### Categories
- `GET /api/categories/` - List user's categories
- `POST /api/categories/` - Create category
- `GET /api/categories/{id}/` - Get category details
- `PUT /api/categories/{id}/` - Update category
- `DELETE /api/categories/{id}/` - Delete category

### Transactions (FR4, FR5, FR6)
- `GET /api/transactions/` - List transactions
- `POST /api/transactions/` - Create transaction (with budget checks)
- `GET /api/transactions/{id}/` - Get transaction details
- `PUT /api/transactions/{id}/` - Update transaction
- `DELETE /api/transactions/{id}/` - Soft delete transaction
- `POST /api/transactions/restore/` - Restore soft-deleted transactions (within 30 days)
- `POST /api/transactions/bulk_import/` - Bulk import from CSV
- `POST /api/transactions/bulk_delete/` - Soft delete multiple transactions
- `GET /api/transactions/summary/` - Dashboard summary

### Budgets (FR7, FR9)
- `GET /api/budgets/` - List budgets
- `POST /api/budgets/` - Create budget with alerts
- `GET /api/budgets/{id}/` - Get budget details with spending calculations
- `PUT /api/budgets/{id}/` - Update budget
- `DELETE /api/budgets/{id}/` - Delete budget
- `GET /api/budgets/summary/` - Budget summary with all spending
- `GET /api/budgets/alerts/` - All unread budget alerts

### Budget Alerts
- `GET /api/budget-alerts/` - List alerts
- `POST /api/budget-alerts/{id}/mark_as_read/` - Mark alert as read
- `POST /api/budget-alerts/mark_all_as_read/` - Mark all alerts as read

### Recurring Transactions (FR8)
- `GET /api/recurring-transactions/` - List recurring transactions
- `POST /api/recurring-transactions/` - Create recurring transaction
- `GET /api/recurring-transactions/{id}/` - Get details
- `PUT /api/recurring-transactions/{id}/` - Update
- `DELETE /api/recurring-transactions/{id}/` - Delete
- `POST /api/recurring-transactions/{id}/execute/` - Execute manually

## Analytics Features (FR9)

The analytics module provides comprehensive financial insights:

```python
from src.transactions.analytics import FinancialAnalytics

analytics = FinancialAnalytics(user)

# Monthly summary
summary = analytics.get_monthly_summary()

# Category breakdown
breakdown = analytics.get_category_breakdown(period='month')

# Savings rate calculation
savings = analytics.get_savings_rate()

# Budget status
budget_status = analytics.get_budget_status()

# Month-over-month comparison
comparison = analytics.get_comparison_with_previous_month()

# Top expenses
top = analytics.get_top_expenses(limit=10, period='month')

# Overall statistics
stats = analytics.get_statistics()
```

## Database Schema

### Categories
- `id` (UUID) - Primary key
- `user_id` (FK) - Reference to CustomUser
- `name` - Category name
- `category_type` - EXPENSE, INCOME, TRANSFER
- `color` - Hex color code
- `icon` - Icon identifier
- `is_default` - Whether default category

### Transactions (Soft Deletes - FR5)
- `id` (UUID)
- `user_id` (FK)
- `category_id` (FK)
- `amount` - Transaction amount
- `transaction_type` - INCOME, EXPENSE, TRANSFER
- `description` - User notes
- `transaction_date` - When transaction occurred
- `is_deleted` - Soft delete flag
- `deleted_at` - Deletion timestamp
- `delete_reason` - Reason for deletion
- `recurring_transaction_id` (FK) - If part of recurring series
- `tags` - Comma-separated tags

### Budgets (FR7 - Over-budget Triggers)
- `id` (UUID)
- `user_id` (FK)
- `category_id` (FK)
- `monthly_limit` - Budget limit amount
- `period` - DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUAL
- `start_date` - Budget start date
- `end_date` - Budget end date (optional)
- `alert_threshold` - Percentage (0-100)
- `is_active` - Whether budget is active

### BudgetAlert
- `id` (UUID)
- `budget_id` (FK)
- `user_id` (FK)
- `alert_type` - WARNING, CRITICAL
- `message` - Alert message
- `percentage_used` - Percentage of budget used
- `is_read` - Whether alert was read

### RecurringTransaction (FR8)
- `id` (UUID)
- `user_id` (FK)
- `category_id` (FK)
- `name` - Recurring transaction name
- `amount` - Transaction amount
- `frequency` - DAILY, WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY, ANNUAL
- `transaction_type` - INCOME, EXPENSE, TRANSFER
- `start_date` - When recurring starts
- `end_date` - When recurring ends (optional)
- `next_due_date` - Next execution date
- `is_active` - Whether active
- `auto_execute` - Automatically create transactions

## Testing

Run tests with pytest:

```bash
# All tests
pytest

# Specific test file
pytest tests/test_api_new.py

# With coverage
pytest --cov=src.transactions tests/
```

Test categories:
- **Authentication**: User registration, JWT login, password reset
- **Transactions**: Create, update, soft delete, restore, bulk import
- **Budgets**: Create, spending calculation, alert creation
- **Analytics**: Category breakdown, savings rate, comparisons
- **Permissions**: User isolation, access control

## Deployment

### Docker Deployment

1. **Build Docker image**
   ```bash
   docker build -f docker/Dockerfile -t financial-monitoring:latest .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose -f docker/docker-compose.staging.yml up -d
   ```

### Kubernetes Deployment

```bash
# Apply manifests
kubectl apply -f k8s/deployment_staging.yaml
kubectl apply -f k8s/service_staging.yaml

# Check status
kubectl get pods
kubectl logs <pod-name>
```

### Environment Variables for Production

Set in `.env` or as environment variables:

```
SECRET_KEY=<strong-secret-key>
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True

DB_ENGINE=django.db.backends.postgresql_psycopg2
DB_NAME=financial_monitoring_prod
DB_USER=postgres_user
DB_PASSWORD=<strong-password>
DB_HOST=prod-db.example.com
DB_PORT=5432

REDIS_URL=redis://prod-redis.example.com:6379/1
```

## Performance Optimization

1. **Database Indexing**
   - Indexes on `user`, `transaction_date`, `category` for fast queries
   - Soft delete queries optimized with `is_deleted` index

2. **Caching**
   - Redis cache for session storage
   - Analytics results cached for 1 hour

3. **Query Optimization**
   - `select_related` for foreign keys
   - `prefetch_related` for reverse relations
   - Pagination (50 items per page)

4. **Rate Limiting**
   - Anonymous: 100 requests/hour
   - Authenticated: 1000 requests/hour

## Security Implementation

### Data at Rest (NFR 5.1)
- AES-256 encryption for sensitive columns via django-cryptography
- Database-level encryption at rest (PostgreSQL)

### Data in Transit (NFR 5.1)
- TLS 1.3 enforced in production
- HTTPS redirect
- HSTS headers

### API Security
- JWT token expiration: 1 hour
- Refresh token: 7 days
- Rate limiting implemented
- CORS restricted to configured origins
- CSRF protection enabled

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -d financial_monitoring

# Reset migrations
python manage.py migrate zero transactions
python manage.py migrate transactions
```

### Redis Connection Issues
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# Clear cache
redis-cli FLUSHDB
```

### Migration Issues
```bash
# Create new migration
python manage.py makemigrations transactions

# Apply migrations
python manage.py migrate
```

## Contributing

1. Create feature branch
2. Write tests for new features
3. Ensure all tests pass: `pytest`
4. Format code: `black src/`
5. Check linting: `flake8 src/`
6. Submit pull request

## License

See LICENSE file for details.

## Support

For issues and questions, please create an issue in the repository.

---

**API Documentation**: Visit `/api/docs/` for interactive Swagger UI
**ReDoc**: Visit `/api/redoc/` for alternative documentation
