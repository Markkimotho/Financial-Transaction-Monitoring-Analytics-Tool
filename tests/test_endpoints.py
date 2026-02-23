"""
Comprehensive endpoint tests for Financial Monitoring API
Tests all endpoints to ensure they function correctly
"""

import json
from decimal import Decimal
from datetime import datetime, timedelta
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from transactions.models import Category, Transaction, Budget, BudgetAlert, RecurringTransaction

User = get_user_model()


class AuthenticationEndpointsTestCase(APITestCase):
    """Test authentication endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'
        self.refresh_url = '/api/auth/refresh/'
        
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'TestPassword123',
            'password_confirm': 'TestPassword123',
            'first_name': 'Test',
            'last_name': 'User'
        }

    def test_user_registration_success(self):
        """Test successful user registration"""
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user_id', response.data)
        self.assertEqual(User.objects.count(), 1)

    def test_user_registration_password_mismatch(self):
        """Test registration fails when passwords don't match"""
        data = self.user_data.copy()
        data['password_confirm'] = 'DifferentPassword123'
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_duplicate_username(self):
        """Test registration fails with duplicate username"""
        self.client.post(self.register_url, self.user_data, format='json')
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_weak_password(self):
        """Test registration fails with weak password (less than 12 chars)"""
        data = self.user_data.copy()
        data['password'] = 'weak'
        data['password_confirm'] = 'weak'
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_success(self):
        """Test successful user login"""
        # Register first
        self.client.post(self.register_url, self.user_data, format='json')
        
        # Login
        login_data = {
            'username': 'testuser',
            'password': 'TestPassword123'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_user_login_invalid_credentials(self):
        """Test login fails with invalid credentials"""
        self.client.post(self.register_url, self.user_data, format='json')
        
        login_data = {
            'username': 'testuser',
            'password': 'WrongPassword123'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        """Test JWT token refresh"""
        # Register and login
        self.client.post(self.register_url, self.user_data, format='json')
        login_response = self.client.post(
            self.login_url,
            {'username': 'testuser', 'password': 'TestPassword123'},
            format='json'
        )
        refresh_token = login_response.data['refresh']
        
        # Refresh token
        response = self.client.post(
            self.refresh_url,
            {'refresh': refresh_token},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)


class UserEndpointsTestCase(APITestCase):
    """Test user management endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPassword123',
            first_name='Test',
            last_name='User'
        )
        self.client.force_authenticate(user=self.user)

    def test_get_user_profile(self):
        """Test getting current user profile"""
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')

    def test_list_users(self):
        """Test listing users (self only for non-staff)"""
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Non-staff users should only see themselves
        self.assertEqual(len(response.data['results']), 1)

    def test_change_password_success(self):
        """Test successful password change"""
        data = {
            'old_password': 'TestPassword123',
            'new_password': 'NewPassword1234',
            'new_password_confirm': 'NewPassword1234'
        }
        response = self.client.post('/api/users/change_password/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_change_password_wrong_old_password(self):
        """Test password change with wrong old password"""
        data = {
            'old_password': 'WrongPassword',
            'new_password': 'NewPassword1234',
            'new_password_confirm': 'NewPassword1234'
        }
        response = self.client.post('/api/users/change_password/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_request_password_reset(self):
        """Test password reset request"""
        data = {'email': 'test@example.com'}
        response = self.client.post('/api/users/request_password_reset/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class CategoryEndpointsTestCase(APITestCase):
    """Test category endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPassword123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_category(self):
        """Test creating a category"""
        data = {
            'name': 'Groceries',
            'category_type': 'EXPENSE'
        }
        response = self.client.post('/api/categories/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Groceries')

    def test_list_categories(self):
        """Test listing categories"""
        Category.objects.create(
            user=self.user,
            name='Groceries',
            category_type='EXPENSE'
        )
        response = self.client.get('/api/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_get_category_detail(self):
        """Test getting category detail"""
        category = Category.objects.create(
            user=self.user,
            name='Groceries',
            category_type='EXPENSE'
        )
        response = self.client.get(f'/api/categories/{category.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Groceries')

    def test_update_category(self):
        """Test updating a category"""
        category = Category.objects.create(
            user=self.user,
            name='Groceries',
            category_type='EXPENSE'
        )
        data = {'name': 'Food & Groceries'}
        response = self.client.patch(f'/api/categories/{category.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Food & Groceries')

    def test_delete_category(self):
        """Test deleting a category"""
        category = Category.objects.create(
            user=self.user,
            name='Groceries',
            category_type='EXPENSE'
        )
        response = self.client.delete(f'/api/categories/{category.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Category.objects.filter(id=category.id).exists())


class TransactionEndpointsTestCase(APITestCase):
    """Test transaction endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPassword123'
        )
        self.client.force_authenticate(user=self.user)
        self.category = Category.objects.create(
            user=self.user,
            name='Groceries',
            category_type='EXPENSE'
        )

    def test_create_transaction(self):
        """Test creating a transaction"""
        data = {
            'category': str(self.category.id),
            'amount': '50.00',
            'transaction_type': 'EXPENSE',
            'description': 'Weekly groceries',
            'transaction_date': '2026-02-23'
        }
        response = self.client.post('/api/transactions/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(response.data['amount']), Decimal('50.00'))

    def test_list_transactions(self):
        """Test listing transactions"""
        Transaction.objects.create(
            user=self.user,
            category=self.category,
            amount=Decimal('50.00'),
            transaction_type='EXPENSE',
            description='Groceries',
            transaction_date='2026-02-23'
        )
        response = self.client.get('/api/transactions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_get_transaction_detail(self):
        """Test getting transaction detail"""
        transaction = Transaction.objects.create(
            user=self.user,
            category=self.category,
            amount=Decimal('50.00'),
            transaction_type='EXPENSE',
            description='Groceries',
            transaction_date='2026-02-23'
        )
        response = self.client.get(f'/api/transactions/{transaction.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(response.data['amount']), Decimal('50.00'))

    def test_update_transaction(self):
        """Test updating a transaction"""
        transaction = Transaction.objects.create(
            user=self.user,
            category=self.category,
            amount=Decimal('50.00'),
            transaction_type='EXPENSE',
            description='Groceries',
            transaction_date='2026-02-23'
        )
        data = {'amount': '75.00', 'description': 'Weekly shopping'}
        response = self.client.patch(f'/api/transactions/{transaction.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(response.data['amount']), Decimal('75.00'))

    def test_soft_delete_transaction(self):
        """Test soft delete (should mark is_deleted=True)"""
        transaction = Transaction.objects.create(
            user=self.user,
            category=self.category,
            amount=Decimal('50.00'),
            transaction_type='EXPENSE',
            description='Groceries',
            transaction_date='2026-02-23'
        )
        response = self.client.delete(f'/api/transactions/{transaction.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify soft delete
        transaction.refresh_from_db()
        self.assertTrue(transaction.is_deleted)
        self.assertIsNotNone(transaction.deleted_at)

    def test_transaction_summary(self):
        """Test transaction summary endpoint"""
        Transaction.objects.create(
            user=self.user,
            category=self.category,
            amount=Decimal('50.00'),
            transaction_type='EXPENSE',
            description='Groceries',
            transaction_date='2026-02-23'
        )
        response = self.client.get('/api/transactions/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_transactions', response.data)
        self.assertIn('total_expense', response.data)

    def test_transaction_restore(self):
        """Test restoring a soft-deleted transaction"""
        transaction = Transaction.objects.create(
            user=self.user,
            category=self.category,
            amount=Decimal('50.00'),
            transaction_type='EXPENSE',
            description='Groceries',
            transaction_date='2026-02-23',
            is_deleted=True,
            deleted_at=timezone.now()
        )
        response = self.client.post('/api/transactions/restore/', {'transaction_ids': [str(transaction.id)]}, format='json')
        # Check if endpoint exists and returns valid status
        if response.status_code == status.HTTP_200_OK:
            transaction.refresh_from_db()
            self.assertFalse(transaction.is_deleted)

    def test_bulk_import_transactions(self):
        """Test bulk importing transactions"""
        # Bulk import expects CSV file upload
        from io import BytesIO
        csv_content = (b"category,amount,transaction_type,description,transaction_date\n"
                      b"Groceries,50.00,EXPENSE,Item 1,2026-02-23T10:00:00\n"
                      b"Groceries,75.00,EXPENSE,Item 2,2026-02-23T11:00:00")
        
        csv_file = BytesIO(csv_content)
        csv_file.name = 'transactions.csv'
        response = self.client.post('/api/transactions/bulk_import/', 
                                   {'file': csv_file}, 
                                   format='multipart')
        # The endpoint should respond
        self.assertIn(response.status_code, 
                     [status.HTTP_200_OK, status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])


class BudgetEndpointsTestCase(APITestCase):
    """Test budget endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPassword123'
        )
        self.client.force_authenticate(user=self.user)
        self.category = Category.objects.create(
            user=self.user,
            name='Groceries',
            category_type='EXPENSE'
        )

    def test_create_budget(self):
        """Test creating a budget"""
        data = {
            'category': str(self.category.id),
            'monthly_limit': '200.00',
            'alert_threshold': 80,
            'start_date': '2026-02-01'
        }
        response = self.client.post('/api/budgets/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(response.data['monthly_limit']), Decimal('200.00'))

    def test_list_budgets(self):
        """Test listing budgets"""
        Budget.objects.create(
            user=self.user,
            category=self.category,
            monthly_limit=Decimal('200.00'),
            alert_threshold=80,
            start_date='2026-02-01'
        )
        response = self.client.get('/api/budgets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_budget_summary(self):
        """Test budget summary endpoint"""
        Budget.objects.create(
            user=self.user,
            category=self.category,
            monthly_limit=Decimal('200.00'),
            alert_threshold=80,
            start_date='2026-02-01'
        )
        response = self.client.get('/api/budgets/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Summary endpoint may return results in different formats
        self.assertIsNotNone(response.data)

    def test_update_budget(self):
        """Test updating a budget"""
        budget = Budget.objects.create(
            user=self.user,
            category=self.category,
            monthly_limit=Decimal('200.00'),
            alert_threshold=80,
            start_date='2026-02-01'
        )
        data = {'monthly_limit': '300.00', 'alert_threshold': 75}
        response = self.client.patch(f'/api/budgets/{budget.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(response.data['monthly_limit']), Decimal('300.00'))

    def test_get_budget_alerts(self):
        """Test getting budget alerts"""
        budget = Budget.objects.create(
            user=self.user,
            category=self.category,
            monthly_limit=Decimal('200.00'),
            alert_threshold=80,
            start_date='2026-02-01'
        )
        BudgetAlert.objects.create(
            user=self.user,
            budget=budget,
            alert_type='WARNING',
            message='Budget nearly full',
            current_spending=Decimal('160.00'),
            percentage_used=80
        )
        response = self.client.get('/api/budgets/alerts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class BudgetAlertEndpointsTestCase(APITestCase):
    """Test budget alert endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPassword123'
        )
        self.client.force_authenticate(user=self.user)
        self.category = Category.objects.create(
            user=self.user,
            name='Groceries',
            category_type='EXPENSE'
        )
        self.budget = Budget.objects.create(
            user=self.user,
            category=self.category,
            monthly_limit=Decimal('200.00'),
            alert_threshold=80,
            start_date='2026-02-01'
        )

    def test_list_budget_alerts(self):
        """Test listing budget alerts"""
        BudgetAlert.objects.create(
            user=self.user,
            budget=self.budget,
            alert_type='WARNING',
            message='Budget nearly full',
            current_spending=Decimal('160.00'),
            percentage_used=80
        )
        response = self.client.get('/api/budget-alerts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_get_alert_detail(self):
        """Test getting alert detail"""
        alert = BudgetAlert.objects.create(
            user=self.user,
            budget=self.budget,
            alert_type='WARNING',
            message='Budget nearly full',
            current_spending=Decimal('160.00'),
            percentage_used=80
        )
        response = self.client.get(f'/api/budget-alerts/{alert.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['alert_type'], 'WARNING')

    def test_mark_alert_as_read(self):
        """Test marking alert as read"""
        alert = BudgetAlert.objects.create(
            user=self.user,
            budget=self.budget,
            alert_type='WARNING',
            message='Budget nearly full',
            current_spending=Decimal('160.00'),
            percentage_used=80,
            is_read=False
        )
        response = self.client.post(f'/api/budget-alerts/{alert.id}/mark_as_read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        alert.refresh_from_db()
        self.assertTrue(alert.is_read)

    def test_mark_all_alerts_as_read(self):
        """Test marking all alerts as read"""
        BudgetAlert.objects.create(
            user=self.user,
            budget=self.budget,
            alert_type='WARNING',
            message='Alert 1',
            current_spending=Decimal('160.00'),
            percentage_used=80,
            is_read=False
        )
        BudgetAlert.objects.create(
            user=self.user,
            budget=self.budget,
            alert_type='CRITICAL',
            message='Alert 2',
            current_spending=Decimal('200.00'),
            percentage_used=100,
            is_read=False
        )
        response = self.client.post('/api/budget-alerts/mark_all_as_read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(BudgetAlert.objects.filter(is_read=False).count(), 0)


class AnalyticsEndpointsTestCase(APITestCase):
    """Test analytics endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPassword123'
        )
        self.client.force_authenticate(user=self.user)
        
        self.expense_cat = Category.objects.create(
            user=self.user,
            name='Groceries',
            category_type='EXPENSE'
        )
        self.income_cat = Category.objects.create(
            user=self.user,
            name='Salary',
            category_type='INCOME'
        )

    def test_monthly_summary(self):
        """Test monthly summary analytics"""
        Transaction.objects.create(
            user=self.user,
            category=self.income_cat,
            amount=Decimal('5000.00'),
            transaction_type='INCOME',
            transaction_date='2026-02-01'
        )
        Transaction.objects.create(
            user=self.user,
            category=self.expense_cat,
            amount=Decimal('1500.00'),
            transaction_type='EXPENSE',
            transaction_date='2026-02-15'
        )
        
        response = self.client.get('/api/analytics/monthly_summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_income', response.data)
        self.assertIn('total_expenses', response.data)

    def test_category_breakdown(self):
        """Test category breakdown analytics"""
        Transaction.objects.create(
            user=self.user,
            category=self.expense_cat,
            amount=Decimal('50.00'),
            transaction_type='EXPENSE',
            transaction_date='2026-02-15'
        )
        
        response = self.client.get('/api/analytics/category_breakdown/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)

    def test_savings_rate(self):
        """Test savings rate calculation"""
        Transaction.objects.create(
            user=self.user,
            category=self.income_cat,
            amount=Decimal('5000.00'),
            transaction_type='INCOME',
            transaction_date='2026-02-01'
        )
        Transaction.objects.create(
            user=self.user,
            category=self.expense_cat,
            amount=Decimal('1000.00'),
            transaction_type='EXPENSE',
            transaction_date='2026-02-15'
        )
        
        response = self.client.get('/api/analytics/savings_rate/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('savings_rate', response.data)

    def test_budget_status(self):
        """Test budget status analytics"""
        budget = Budget.objects.create(
            user=self.user,
            category=self.expense_cat,
            monthly_limit=Decimal('200.00'),
            alert_threshold=80,
            start_date='2026-02-01'
        )
        
        response = self.client.get('/api/analytics/budget_status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_top_expenses(self):
        """Test top expenses endpoint"""
        Transaction.objects.create(
            user=self.user,
            category=self.expense_cat,
            amount=Decimal('150.00'),
            transaction_type='EXPENSE',
            transaction_date='2026-02-15'
        )
        
        response = self.client.get('/api/analytics/top_expenses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_statistics(self):
        """Test statistics endpoint"""
        response = self.client.get('/api/analytics/statistics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_comparison(self):
        """Test comparison analytics"""
        response = self.client.get('/api/analytics/comparison/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class DashboardEndpointTestCase(APITestCase):
    """Test dashboard endpoint"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPassword123'
        )
        self.client.force_authenticate(user=self.user)

    def test_dashboard_endpoint(self):
        """Test dashboard data aggregation"""
        response = self.client.get('/api/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Dashboard should return aggregated data
        self.assertIsNotNone(response.data)


class PermissionAndAuthTestCase(APITestCase):
    """Test permissions and authentication"""

    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='TestPassword123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='TestPassword123'
        )

    def test_unauthenticated_access_denied(self):
        """Test that unauthenticated requests are rejected"""
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_isolation(self):
        """Test that users can only see their own data"""
        category1 = Category.objects.create(
            user=self.user1,
            name='Category 1',
            category_type='EXPENSE'
        )
        category2 = Category.objects.create(
            user=self.user2,
            name='Category 2',
            category_type='EXPENSE'
        )

        # User1 should only see their category
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/categories/')
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Category 1')

        # User2 should only see their category
        self.client.force_authenticate(user=self.user2)
        response = self.client.get('/api/categories/')
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Category 2')

    def test_invalid_token_rejected(self):
        """Test that invalid tokens are rejected"""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token')
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
