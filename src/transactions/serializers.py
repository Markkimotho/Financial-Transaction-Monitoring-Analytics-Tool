from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Sum
from .models import (
    CustomUser, Category, Transaction, RecurringTransaction,
    Budget, BudgetAlert
)
from datetime import datetime, timedelta
from decimal import Decimal

User = get_user_model()


class CustomUserSerializer(serializers.ModelSerializer):
    """User profile serializer with read-only computed fields."""
    transactions_count = serializers.SerializerMethodField()
    budgets_count = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'currency_preference', 'profile_image', 'phone_number',
            'address', 'email_verified', 'two_factor_enabled',
            'created_at', 'updated_at', 'transactions_count', 'budgets_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'transactions_count', 'budgets_count']
        extra_kwargs = {
            'email': {'validators': []},  # Override unique validator for updates
        }

    def get_transactions_count(self, obj):
        return obj.transactions.filter(is_deleted=False).count()

    def get_budgets_count(self, obj):
        return obj.budgets.filter(is_active=True).count()


class CustomUserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration with password."""
    password = serializers.CharField(write_only=True, min_length=12)
    password_confirm = serializers.CharField(write_only=True, min_length=12)

    class Meta:
        model = CustomUser
        fields = [
            'email', 'username', 'first_name', 'last_name',
            'password', 'password_confirm', 'currency_preference'
        ]

    def validate(self, data):
        if data['password'] != data.pop('password_confirm'):
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user


class CategorySerializer(serializers.ModelSerializer):
    """Transaction category serializer."""
    transaction_count = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'category_type', 'color', 'icon',
            'is_default', 'created_at', 'updated_at',
            'transaction_count', 'total_amount'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_transaction_count(self, obj):
        return obj.transactions.filter(is_deleted=False).count()

    def get_total_amount(self, obj):
        transactions = obj.transactions.filter(is_deleted=False)
        total = transactions.aggregate(total=Sum('amount'))['total']
        return Decimal(str(total)) if total else Decimal('0.00')


class TransactionSerializer(serializers.ModelSerializer):
    """Transaction serializer with validation."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'user_email', 'category', 'category_name',
            'amount', 'transaction_type', 'description', 'transaction_date',
            'created_at', 'updated_at', 'is_deleted', 'deleted_at',
            'delete_reason', 'tags', 'attachment', 'recurring_transaction'
        ]
        read_only_fields = [
            'id', 'user', 'user_email', 'created_at', 'updated_at',
            'deleted_at'
        ]

    def validate_amount(self, value):
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def validate(self, data):
        # Check budget before creating transaction
        if 'category' in data and data['category'] and 'amount' in data:
            self._check_budget_alert(data)
        return data

    def _check_budget_alert(self, data):
        """Check if transaction would exceed budget alert threshold."""
        user = self.context['request'].user
        category = data.get('category')
        amount = data.get('amount')
        
        # Get current month's budget
        today = datetime.now().date()
        budgets = Budget.objects.filter(
            user=user,
            category=category,
            is_active=True,
            start_date__lte=today
        ).filter(
            end_date__gte=today
        )
        
        if budgets.exists():
            budget = budgets.first()
            current_spending = Transaction.objects.filter(
                user=user,
                category=category,
                is_deleted=False,
                transaction_date__date__gte=budget.start_date,
                transaction_date__date__lte=budget.end_date or today
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            
            new_total = current_spending + amount
            if new_total > budget.monthly_limit:
                self.context['budget_exceeded'] = True
                self.context['budget'] = budget
                self.context['current_spending'] = current_spending
                self.context['projected_total'] = new_total


class TransactionListSerializer(serializers.ModelSerializer):
    """Lightweight transaction serializer for list views."""
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'amount', 'transaction_type', 'category_name',
            'description', 'transaction_date', 'is_deleted'
        ]


class RecurringTransactionSerializer(serializers.ModelSerializer):
    """Recurring transaction serializer."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    generated_count = serializers.SerializerMethodField()

    class Meta:
        model = RecurringTransaction
        fields = [
            'id', 'user', 'category', 'category_name', 'name',
            'description', 'amount', 'frequency', 'transaction_type',
            'start_date', 'end_date', 'next_due_date', 'is_active',
            'auto_execute', 'created_at', 'updated_at', 'generated_count'
        ]
        read_only_fields = [
            'id', 'user', 'created_at', 'updated_at', 'generated_count'
        ]

    def get_generated_count(self, obj):
        return obj.transactions.count()


class BudgetAlertSerializer(serializers.ModelSerializer):
    """Budget alert serializer."""
    category_name = serializers.CharField(source='budget.category.name', read_only=True)
    budget_limit = serializers.DecimalField(
        source='budget.monthly_limit',
        max_digits=12,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = BudgetAlert
        fields = [
            'id', 'budget', 'alert_type', 'message', 'current_spending',
            'percentage_used', 'is_read', 'category_name', 'budget_limit',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class BudgetSerializer(serializers.ModelSerializer):
    """Budget serializer with spending calculations."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    current_spending = serializers.SerializerMethodField()
    remaining_budget = serializers.SerializerMethodField()
    percentage_used = serializers.SerializerMethodField()
    alerts = BudgetAlertSerializer(many=True, read_only=True)

    class Meta:
        model = Budget
        fields = [
            'id', 'user', 'category', 'category_name', 'monthly_limit',
            'period', 'start_date', 'end_date', 'alert_threshold',
            'is_active', 'created_at', 'updated_at', 'current_spending',
            'remaining_budget', 'percentage_used', 'alerts'
        ]
        read_only_fields = [
            'id', 'user', 'created_at', 'updated_at',
            'current_spending', 'remaining_budget', 'percentage_used'
        ]

    def get_current_spending(self, obj):
        """Calculate spending for the budget period."""
        today = datetime.now().date()
        transactions = Transaction.objects.filter(
            user=obj.user,
            category=obj.category,
            is_deleted=False,
            transaction_date__date__gte=obj.start_date,
            transaction_type='EXPENSE'
        )
        
        if obj.end_date:
            transactions = transactions.filter(transaction_date__date__lte=obj.end_date)
        else:
            transactions = transactions.filter(transaction_date__date__lte=today)
        
        total = transactions.aggregate(total=Sum('amount'))['total']
        return total or Decimal('0.00')

    def get_remaining_budget(self, obj):
        current = self.get_current_spending(obj)
        return obj.monthly_limit - current

    def get_percentage_used(self, obj):
        current = self.get_current_spending(obj)
        if obj.monthly_limit == 0:
            return 0
        percentage = (current / obj.monthly_limit) * 100
        return round(float(percentage), 2)


class BudgetCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating budgets."""
    
    class Meta:
        model = Budget
        fields = [
            'category', 'monthly_limit', 'period', 'start_date',
            'end_date', 'alert_threshold', 'is_active'
        ]

    def validate(self, data):
        if data.get('end_date') and data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("End date must be after start date.")
        
        if 'alert_threshold' in data:
            if not (0 <= data['alert_threshold'] <= 100):
                raise serializers.ValidationError("Alert threshold must be between 0 and 100.")
        
        return data
