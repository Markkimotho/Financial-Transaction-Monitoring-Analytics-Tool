from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import (
    CustomUser, Category, Transaction, RecurringTransaction,
    Budget, BudgetAlert
)


@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    """Admin interface for CustomUser model."""
    list_display = [
        'email', 'username', 'first_name', 'last_name',
        'currency_preference', 'email_verified', 'is_active',
        'created_at'
    ]
    list_filter = [
        'is_active', 'email_verified', 'two_factor_enabled',
        'currency_preference', 'created_at'
    ]
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Financial Settings', {
            'fields': ('currency_preference', 'phone_number', 'address')
        }),
        ('Security', {
            'fields': ('email_verified', 'two_factor_enabled')
        }),
        ('Profile', {
            'fields': ('profile_image',)
        }),
    )
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-created_at']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin interface for Category model."""
    list_display = [
        'name', 'user', 'category_type', 'color_display',
        'is_default', 'created_at'
    ]
    list_filter = ['category_type', 'is_default', 'created_at']
    search_fields = ['name', 'user__email']
    readonly_fields = ['created_at', 'updated_at', 'color_display']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'name', 'category_type')
        }),
        ('Styling', {
            'fields': ('color', 'color_display', 'icon')
        }),
        ('Settings', {
            'fields': ('is_default',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def color_display(self, obj):
        """Display a colored box for the category color."""
        return format_html(
            '<div style="width: 20px; height: 20px; background-color: {}; '
            'border: 1px solid #ccc; border-radius: 3px;"></div>',
            obj.color
        )
    color_display.short_description = 'Color Preview'


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """Admin interface for Transaction model."""
    list_display = [
        'user', 'amount', 'category', 'transaction_type',
        'transaction_date', 'is_deleted', 'created_at'
    ]
    list_filter = [
        'transaction_type', 'is_deleted', 'category',
        'transaction_date', 'created_at'
    ]
    search_fields = ['user__email', 'description', 'category__name']
    readonly_fields = [
        'id', 'created_at', 'updated_at', 'deleted_at'
    ]
    date_hierarchy = 'transaction_date'

    fieldsets = (
        ('Transaction Details', {
            'fields': ('user', 'category', 'amount', 'transaction_type')
        }),
        ('Information', {
            'fields': ('description', 'tags', 'attachment')
        }),
        ('Recurrence', {
            'fields': ('recurring_transaction',),
            'classes': ('collapse',)
        }),
        ('Deletion Info', {
            'fields': (
                'is_deleted', 'deleted_at', 'delete_reason'
            ),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('transaction_date', 'created_at', 'updated_at', 'id'),
            'classes': ('collapse',)
        }),
    )

    def has_delete_permission(self, request, obj=None):
        """Disallow hard deletion; use soft deletes."""
        return False


@admin.register(RecurringTransaction)
class RecurringTransactionAdmin(admin.ModelAdmin):
    """Admin interface for RecurringTransaction model."""
    list_display = [
        'name', 'user', 'amount', 'frequency', 'transaction_type',
        'next_due_date', 'is_active', 'created_at'
    ]
    list_filter = [
        'is_active', 'frequency', 'transaction_type', 'created_at'
    ]
    search_fields = ['name', 'user__email', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    date_hierarchy = 'next_due_date'

    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'name', 'description')
        }),
        ('Transaction Details', {
            'fields': ('category', 'amount', 'transaction_type')
        }),
        ('Schedule', {
            'fields': (
                'frequency', 'start_date', 'end_date', 'next_due_date'
            )
        }),
        ('Control', {
            'fields': ('is_active', 'auto_execute')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'id'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    """Admin interface for Budget model."""
    list_display = [
        'user', 'category', 'monthly_limit', 'period',
        'alert_threshold', 'is_active', 'start_date'
    ]
    list_filter = ['is_active', 'period', 'start_date', 'created_at']
    search_fields = ['user__email', 'category__name']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Budget Setup', {
            'fields': ('user', 'category', 'monthly_limit', 'period')
        }),
        ('Date Range', {
            'fields': ('start_date', 'end_date')
        }),
        ('Alerts', {
            'fields': ('alert_threshold',)
        }),
        ('Control', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(BudgetAlert)
class BudgetAlertAdmin(admin.ModelAdmin):
    """Admin interface for BudgetAlert model."""
    list_display = [
        'budget', 'user', 'alert_type', 'percentage_used',
        'is_read', 'created_at'
    ]
    list_filter = ['alert_type', 'is_read', 'created_at']
    search_fields = ['user__email', 'budget__category__name', 'message']
    readonly_fields = [
        'budget', 'user', 'alert_type', 'message',
        'current_spending', 'percentage_used', 'created_at'
    ]

    fields = (
        'budget', 'user', 'alert_type', 'message',
        'current_spending', 'percentage_used', 'is_read', 'created_at'
    )

    def has_add_permission(self, request):
        """Alerts are created programmatically."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Archive alerts instead of deleting."""
        return False
