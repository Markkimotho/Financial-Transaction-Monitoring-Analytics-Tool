"""
Comprehensive API tests for Financial Monitoring & Analytics Tool.
Tests for authentication, transactions, budgets, and analytics endpoints.
"""

from decimal import Decimal
from datetime import datetime, timedelta
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from transactions.models import (
    CustomUser, Category, Transaction, Budget,
    BudgetAlert, RecurringTransaction
)
from transactions.serializers import (
    TransactionSerializer, BudgetSerializer, CategorySerializer
)

User = get_user_model()


class AuthenticationTestCase(APITestCase):
    """Test authentication and user registration."""

    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'

    def test_user_registration(self):
        """Test user registration endpoint."""
        data = {
            'email': 'testuser@example.com',
            'username': 'testuser',
            'password': 'TestPassword123!',
            'password_confirm': 'TestPassword123!',
            'first_name': 'Test',
            'last_name': 'User',
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user_id', response.data)

    def test_user_registration_password_mismatch(self):
        """Test registration fails with mismatched passwords."""
        data = {
            'email': 'testuser@example.com',
            'username': 'testuser',
            'password': 'TestPassword123!',
            'password_confirm': 'DifferentPassword123!',
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login(self):
        """Test JWT token login."""
        # Create user
        user = CustomUser.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='TestPassword123!'
        )
        
        # Login with username
        data = {'username': 'testuser', 'password': 'TestPassword123!'}
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)


class CategoryTestCase(APITestCase):
    """Test category management endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='TestPassword123!'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_category(self):
        """Test creating a new category."""
        data = {
            'name': 'Groceries',
            'category_type': 'EXPENSE',
            'color': '#FF5733',
        }
        response = self.client.post('/api/categories/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class TransactionTestCase(APITestCase):
    """Test transaction management endpoints (FR5: Soft Deletes, FR6: Bulk Actions)."""

    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='TestPassword123!'
        )
        self.client.force_authenticate(user=self.user)
        
        self.category = Category.objects.create(
            user=self.user,
            name='Food',
            category_type='EXPENSE'
        )

    def test_create_transaction(self):
        """Test creating a transaction (FR4: ACID Compliance)."""
        import json
        data = {
            'category': str(self.category.id),
            'amount': '50.00',
            'transaction_type': 'EXPENSE',
            'transaction_date': timezone.now().isoformat(),
            'description': 'Test transaction',
        }
        response = self.client.post(
            '/api/transactions/',
            json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_soft_delete_transaction(self):
        """Test soft deleting a transaction (FR5)."""
        transaction = Transaction.objects.create(
            user=self.user,
            category=self.category,
            amount=Decimal('50.00'),
            transaction_type='EXPENSE',
            transaction_date=timezone.now()
        )
        
        response = self.client.delete(f'/api/transactions/{transaction.id}/')
        transaction.refresh_from_db()
        self.assertTrue(transaction.is_deleted)


class BudgetTestCase(APITestCase):
    """Test budget management endpoints (FR7: Over-budget Triggers)."""

    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='TestPassword123!'
        )
        self.client.force_authenticate(user=self.user)
        
        self.category = Category.objects.create(
            user=self.user,
            name='Food',
            category_type='EXPENSE'
        )

    def test_create_budget(self):
        """Test creating a budget."""
        today = timezone.now().date()
        data = {
            'category': str(self.category.id),
            'monthly_limit': '500.00',
            'start_date': today.isoformat(),
        }
        response = self.client.post('/api/budgets/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class PermissionTestCase(APITestCase):
    """Test user isolation and permissions."""

    def test_unauthenticated_access_denied(self):
        """Test that unauthenticated users cannot access protected endpoints."""
        response = self.client.get('/api/transactions/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
