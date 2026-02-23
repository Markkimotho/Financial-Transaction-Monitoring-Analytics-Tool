from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import uuid


class CustomUser(AbstractUser):
    """
    Extended User model with financial preferences.
    FR1 & FR2 support.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    currency_preference = models.CharField(
        max_length=3,
        default='USD',
        help_text="ISO 4217 currency code"
    )
    profile_image = models.ImageField(
        upload_to='profile_images/',
        null=True,
        blank=True
    )
    phone_number = models.CharField(
        max_length=15,
        null=True,
        blank=True
    )
    address = models.TextField(null=True, blank=True)
    
    # Security & audit
    email_verified = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    last_login = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.email


class Category(models.Model):
    """
    Transaction categories for organizing expenses and income.
    Supports budgeting and analytics.
    """
    CATEGORY_TYPES = [
        ('EXPENSE', 'Expense'),
        ('INCOME', 'Income'),
        ('TRANSFER', 'Transfer'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='categories'
    )
    name = models.CharField(max_length=100)
    category_type = models.CharField(
        max_length=20,
        choices=CATEGORY_TYPES,
        default='EXPENSE'
    )
    color = models.CharField(
        max_length=7,
        default='#000000',
        help_text="Hex color code for UI visualization"
    )
    icon = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="Icon identifier for UI"
    )
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'name']
        verbose_name_plural = 'Categories'

    def __str__(self):
        return f"{self.user.username} - {self.name}"


class Transaction(models.Model):
    """
    Core Transaction model with soft deletes.
    FR4 (ACID), FR5 (Soft Deletes), and FR6 (Bulk actions).
    """
    TRANSACTION_TYPES = [
        ('INCOME', 'Income'),
        ('EXPENSE', 'Expense'),
        ('TRANSFER', 'Transfer'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions'
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_TYPES,
        default='EXPENSE'
    )
    description = models.TextField(null=True, blank=True)
    
    # Timestamp tracking
    transaction_date = models.DateTimeField(
        help_text="When the transaction occurred"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Soft delete
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    delete_reason = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Reason for soft deletion"
    )
    
    # Tags and metadata
    tags = models.TextField(
        blank=True,
        help_text="Comma-separated tags for organization"
    )
    attachment = models.FileField(
        upload_to='transaction_attachments/',
        null=True,
        blank=True,
        help_text="Receipt or invoice attachment"
    )
    
    # External integration
    recurring_transaction = models.ForeignKey(
        'RecurringTransaction',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions'
    )

    class Meta:
        ordering = ['-transaction_date']
        indexes = [
            models.Index(fields=['user', 'transaction_date']),
            models.Index(fields=['user', 'category', 'transaction_date']),
            models.Index(fields=['is_deleted']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.amount} ({self.category})"


class RecurringTransaction(models.Model):
    """
    Support for recurring transactions (subscriptions, salary, etc.).
    FR8: Recurring Transactions.
    """
    FREQUENCY_CHOICES = [
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('BIWEEKLY', 'Bi-weekly'),
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('ANNUAL', 'Annual'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='recurring_transactions'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recurring_transactions'
    )
    
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    frequency = models.CharField(
        max_length=20,
        choices=FREQUENCY_CHOICES
    )
    transaction_type = models.CharField(
        max_length=20,
        choices=Transaction.TRANSACTION_TYPES
    )
    
    # Date management
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    next_due_date = models.DateTimeField()
    
    # Control
    is_active = models.BooleanField(default=True)
    auto_execute = models.BooleanField(
        default=False,
        help_text="Automatically create transactions"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['next_due_date']

    def __str__(self):
        return f"{self.user.username} - {self.name} ({self.frequency})"


class Budget(models.Model):
    """
    Budget tracking with alerts.
    FR7: Over-budget Triggers.
    """
    PERIOD_CHOICES = [
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('ANNUAL', 'Annual'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='budgets'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='budgets'
    )
    
    monthly_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('1.00'))]
    )
    period = models.CharField(
        max_length=20,
        choices=PERIOD_CHOICES,
        default='MONTHLY'
    )
    
    # Date tracking
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    
    # Alert thresholds (in percentage)
    alert_threshold = models.IntegerField(
        default=80,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Alert when spending reaches this percentage"
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'category', 'start_date']
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.user.username} - {self.category.name} - ${self.monthly_limit}"


class BudgetAlert(models.Model):
    """
    Notification when budget thresholds are crossed.
    """
    ALERT_TYPES = [
        ('WARNING', 'Warning'),
        ('CRITICAL', 'Critical'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    budget = models.ForeignKey(
        Budget,
        on_delete=models.CASCADE,
        related_name='alerts'
    )
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='budget_alerts'
    )
    
    alert_type = models.CharField(
        max_length=20,
        choices=ALERT_TYPES
    )
    message = models.TextField()
    current_spending = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )
    percentage_used = models.IntegerField()
    
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Alert: {self.budget.category.name} - {self.alert_type}"
