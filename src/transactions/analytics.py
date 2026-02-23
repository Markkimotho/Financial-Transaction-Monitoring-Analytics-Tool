"""
Analytics utilities for financial calculations.
FR9: Aggregation API for financial insights.
"""

from django.db.models import Sum, Count, Count as Cnt, Q, F
from django.utils import timezone
from datetime import datetime, timedelta, date
from decimal import Decimal
from .models import Transaction, Budget, Category


class FinancialAnalytics:
    """Comprehensive financial analytics calculations."""

    def __init__(self, user):
        self.user = user
        self.today = timezone.now().date()
        self.month_start = self.today.replace(day=1)
        self.month_end = (
            (self.month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        )

    def get_monthly_summary(self, month=None, year=None):
        """Get summary for a specific month."""
        if month is None:
            month = self.today.month
        if year is None:
            year = self.today.year

        month_start = date(year, month, 1)
        if month == 12:
            month_end = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            month_end = date(year, month + 1, 1) - timedelta(days=1)

        transactions = Transaction.objects.filter(
            user=self.user,
            is_deleted=False,
            transaction_date__date__gte=month_start,
            transaction_date__date__lte=month_end
        )

        income = transactions.filter(transaction_type='INCOME').aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        expenses = transactions.filter(transaction_type='EXPENSE').aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        return {
            'month': month,
            'year': year,
            'total_income': float(income),
            'total_expenses': float(expenses),
            'net': float(income - expenses),
            'transaction_count': transactions.count(),
            'categories_used': transactions.values('category').distinct().count(),
        }

    def get_category_breakdown(self, period='month'):
        """
        Get spending breakdown by category.
        FR9: Aggregation by category.
        """
        if period == 'month':
            start_date = self.month_start
            end_date = self.month_end
        elif period == 'quarter':
            quarter = (self.today.month - 1) // 3 + 1
            start_date = date(self.today.year, (quarter - 1) * 3 + 1, 1)
            if quarter == 4:
                end_date = date(self.today.year + 1, 1, 1) - timedelta(days=1)
            else:
                end_date = date(self.today.year, (quarter * 3) + 1, 1) - timedelta(days=1)
        elif period == 'year':
            start_date = date(self.today.year, 1, 1)
            end_date = date(self.today.year, 12, 31)
        else:  # week
            start_date = self.today - timedelta(days=self.today.weekday())
            end_date = start_date + timedelta(days=6)

        transactions = Transaction.objects.filter(
            user=self.user,
            is_deleted=False,
            transaction_type='EXPENSE',
            transaction_date__date__gte=start_date,
            transaction_date__date__lte=end_date
        ).values('category__name', 'category__id').annotate(
            total=Sum('amount'),
            count=Cnt('id')
        ).order_by('-total')

        return [
            {
                'category_id': item['category__id'],
                'category_name': item['category__name'] or 'Uncategorized',
                'amount': float(item['total']),
                'transaction_count': item['count'],
                'percentage': 0,  # Will be calculated below
            }
            for item in transactions
        ] if transactions else []

    def calculate_percentage_breakdown(self, categories):
        """Calculate percentage of total for each category."""
        total = sum(cat['amount'] for cat in categories)
        if total > 0:
            for cat in categories:
                cat['percentage'] = round((cat['amount'] / total) * 100, 2)
        return categories

    def get_savings_rate(self, month=None, year=None):
        """
        Calculate savings rate.
        FR9: Savings Rate calculation.
        Savings Rate = (Income - Expenses) / Income * 100
        """
        summary = self.get_monthly_summary(month, year)
        
        if summary['total_income'] == 0:
            savings_rate = 0
        else:
            savings_rate = (
                (summary['total_income'] - summary['total_expenses']) /
                summary['total_income'] * 100
            )

        return {
            'month': summary['month'],
            'year': summary['year'],
            'income': summary['total_income'],
            'expenses': summary['total_expenses'],
            'savings': summary['net'],
            'savings_rate': round(savings_rate, 2),
        }

    def get_comparison_with_previous_month(self):
        """
        Compare current month with previous month.
        FR9: Current Month vs Previous Month comparison.
        """
        current = self.get_monthly_summary()
        
        # Get previous month
        if self.today.month == 1:
            prev_month = 12
            prev_year = self.today.year - 1
        else:
            prev_month = self.today.month - 1
            prev_year = self.today.year

        previous = self.get_monthly_summary(prev_month, prev_year)

        expense_change = (
            ((current['total_expenses'] - previous['total_expenses']) /
             (previous['total_expenses'] or 1)) * 100
        )

        income_change = (
            ((current['total_income'] - previous['total_income']) /
             (previous['total_income'] or 1)) * 100
        )

        return {
            'current_month': {
                'month': current['month'],
                'year': current['year'],
                'income': current['total_income'],
                'expenses': current['total_expenses'],
            },
            'previous_month': {
                'month': previous['month'],
                'year': previous['year'],
                'income': previous['total_income'],
                'expenses': previous['total_expenses'],
            },
            'changes': {
                'expense_change_percent': round(expense_change, 2),
                'income_change_percent': round(income_change, 2),
            }
        }

    def get_budget_status(self):
        """Get status of all active budgets."""
        budgets = Budget.objects.filter(
            user=self.user,
            is_active=True,
            start_date__lte=self.today
        ).filter(
            Q(end_date__isnull=True) | Q(end_date__gte=self.today)
        )

        status_list = []
        for budget in budgets:
            spending = Transaction.objects.filter(
                user=self.user,
                category=budget.category,
                is_deleted=False,
                transaction_type='EXPENSE',
                transaction_date__date__gte=budget.start_date
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            percentage = (spending / budget.monthly_limit * 100) if budget.monthly_limit > 0 else 0
            remaining = budget.monthly_limit - spending

            status_list.append({
                'budget_id': str(budget.id),
                'category': budget.category.name,
                'limit': float(budget.monthly_limit),
                'spent': float(spending),
                'remaining': float(remaining),
                'percentage_used': round(float(percentage), 2),
                'status': 'CRITICAL' if percentage > 100 else (
                    'WARNING' if percentage > budget.alert_threshold else 'OK'
                ),
            })

        return status_list

    def get_top_expenses(self, limit=10, period='month'):
        """Get top N transactions by amount."""
        if period == 'month':
            start_date = self.month_start
            end_date = self.month_end
        elif period == 'quarter':
            quarter = (self.today.month - 1) // 3 + 1
            start_date = date(self.today.year, (quarter - 1) * 3 + 1, 1)
            if quarter == 4:
                end_date = date(self.today.year + 1, 1, 1) - timedelta(days=1)
            else:
                end_date = date(self.today.year, (quarter * 3) + 1, 1) - timedelta(days=1)
        else:  # year
            start_date = date(self.today.year, 1, 1)
            end_date = date(self.today.year, 12, 31)

        transactions = Transaction.objects.filter(
            user=self.user,
            is_deleted=False,
            transaction_type='EXPENSE',
            transaction_date__date__gte=start_date,
            transaction_date__date__lte=end_date
        ).order_by('-amount')[:limit]

        return [
            {
                'id': str(t.id),
                'category': t.category.name if t.category else 'Uncategorized',
                'description': t.description or '',
                'amount': float(t.amount),
                'date': t.transaction_date.isoformat(),
            }
            for t in transactions
        ]

    def get_statistics(self):
        """Get comprehensive statistics."""
        all_transactions = Transaction.objects.filter(
            user=self.user,
            is_deleted=False
        )

        total_income = all_transactions.filter(
            transaction_type='INCOME'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        total_expenses = all_transactions.filter(
            transaction_type='EXPENSE'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        month_transactions = all_transactions.filter(
            transaction_date__date__gte=self.month_start,
            transaction_date__date__lte=self.month_end
        )

        avg_transaction = (
            month_transactions.aggregate(avg=Sum('amount'))['avg'] or Decimal('0.00')
        ) / (month_transactions.count() or 1)

        return {
            'total_transactions': all_transactions.count(),
            'total_income': float(total_income),
            'total_expenses': float(total_expenses),
            'net_worth_trend': float(total_income - total_expenses),
            'transactions_this_month': month_transactions.count(),
            'avg_transaction_this_month': float(avg_transaction),
            'categories_used': Category.objects.filter(
                user=self.user,
                transactions__isnull=False
            ).distinct().count(),
        }
