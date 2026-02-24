# Testing Guide

This directory contains all test files for the Financial Transaction Monitoring & Analytics Tool. This guide explains how to run each test suite.

## Prerequisites

### Backend Tests
```bash
cd /path/to/Financial-Transaction-Monitoring-Analytics-Tool
source venv/bin/activate
cd src
```

### Frontend Tests
```bash
cd /path/to/Financial-Transaction-Monitoring-Analytics-Tool/frontend
npm install  # if not already done
```

## Test Files Overview

### 1. **Unit & Integration Tests (Python)**

#### `conftest.py`
Pytest configuration and fixtures. Run automatically with other pytest tests.

#### `test_api_endpoints.py`
Tests API endpoint functionality and responses.

**Run:**
```bash
cd src
pytest ../tests/test_api_endpoints.py -v
```

#### `test_endpoints.py`
Comprehensive endpoint testing suite (28KB file with extensive coverage).

**Run:**
```bash
cd src
pytest ../tests/test_endpoints.py -v
```

#### `test_models.py`
Tests for Django models and database operations.

**Run:**
```bash
cd src
pytest ../tests/test_models.py -v
```

#### `test_utils.py`
Tests for utility functions.

**Run:**
```bash
cd src
pytest ../tests/test_utils.py -v
```

#### `test_api_new.py`
New API testing suite with modern test patterns.

**Run:**
```bash
cd src
pytest ../tests/test_api_new.py -v
```

### 2. **Integration Tests (Python)**

#### `integration_test.py`
Full integration testing for the entire application flow.

**Run:**
```bash
cd src
pytest ../tests/integration_test.py -v
```

#### `integration_test_v2.py`
Enhanced integration tests (v2) with additional scenarios.

**Run:**
```bash
cd src
pytest ../tests/integration_test_v2.py -v
```

### 3. **Shell/Bash Tests**

#### `test_login_flow.sh`
Tests the complete login authentication flow using curl.

**Run:**
```bash
chmod +x tests/test_login_flow.sh
./tests/test_login_flow.sh
```

**Credentials used:**
- Username: `testuser`
- Password: `TestPassword123!`

**Tests:**
1. Server connectivity
2. Login endpoint and token generation
3. User info endpoint with authentication

#### `test_api.sh`
API endpoint testing via curl (1.8KB).

**Run:**
```bash
chmod +x tests/test_api.sh
./tests/test_api.sh
```

### 4. **Setup/Utilities**

#### `create_users.py`
Creates test users in the database. Useful for manual testing.

**Run:**
```bash
cd src
python ../tests/create_users.py
```

**Creates:**
- Username: `testuser`
- Password: `TestPassword123!`
- Other test users as configured

## Running All Tests

### Run All Python Tests
```bash
cd src
pytest ../tests/ -v --tb=short
```

### Run All Python Tests with Coverage
```bash
cd src
pytest ../tests/ -v --cov=transactions --cov=core
```

### Run Specific Test Class
```bash
cd src
pytest ../tests/test_endpoints.py::TestUserEndpoints -v
```

### Run Tests Matching Pattern
```bash
cd src
pytest ../tests/ -k "login" -v
```

## Manual Test Scenarios

### 1. Login Flow Test
Tests user authentication end-to-end:
```bash
./tests/test_login_flow.sh
```

### 2. Create Test Data
```bash
cd src
python ../tests/create_users.py
```

### 3. API Endpoint Testing
```bash
./tests/test_api.sh
```

## Backend Setup for Testing

Before running integration tests, ensure:

1. **Database is migrated:**
   ```bash
   cd src
   python manage.py migrate
   ```

2. **Test user exists:**
   ```bash
   cd src
   python ../tests/create_users.py
   ```

3. **Backend server is running (for shell tests):**
   ```bash
   cd src
   python manage.py runserver 8000
   ```

## Frontend Testing

Frontend tests are typically run with:

```bash
cd frontend
npm test
```

Or with watch mode:
```bash
cd frontend
npm test -- --watch
```

## Continuous Integration

For CI/CD pipelines, use:

```bash
# Backend tests
cd src
pytest ../tests/ -v --junitxml=test-results.xml

# Code coverage
pytest ../tests/ --cov=transactions --cov=core --cov-report=html
```

## Test Credentials

**Test User:**
- Username: `testuser`
- Password: `TestPassword123!`
- Email: `test@example.com`

**Database:** SQLite (db.sqlite3) - resets between test runs if using pytest's transaction isolation

## Troubleshooting

### Tests Fail with "Django Settings Module Not Found"
Make sure you're in the `src/` directory before running pytest.

### Tests Timeout
Increase the curl timeout in shell scripts or pytest timeout in `conftest.py`.

### Database Lock Errors
Delete `db.sqlite3` and run migrations:
```bash
cd src
rm db.sqlite3
python manage.py migrate
```

### Port Already in Use
If port 8000 is busy:
```bash
lsof -i :8000
kill -9 <PID>
```

## Performance

- **Quick test (endpoints only):** ~2-5 seconds
- **Full integration suite:** ~15-30 seconds
- **All tests with coverage:** ~45-60 seconds

## Adding New Tests

1. Create test file in `tests/` directory
2. Follow naming convention: `test_*.py` or `*_test.py`
3. Use existing `conftest.py` fixtures
4. Run with pytest or add to CI pipeline

Example:
```python
# tests/test_new_feature.py
import pytest
from transactions.models import Transaction

def test_create_transaction(db):
    txn = Transaction.objects.create(...)
    assert txn.id is not None
```

## Resources

- [Pytest Documentation](https://pytest.readthedocs.io/)
- [Django Testing Documentation](https://docs.djangoproject.com/en/4.2/topics/testing/)
- [DRF Testing Documentation](https://www.django-rest-framework.org/api-guide/testing/)
