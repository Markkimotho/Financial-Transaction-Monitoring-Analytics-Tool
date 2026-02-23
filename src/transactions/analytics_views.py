"""
Additional analytics API views for FR9: Aggregation API.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .analytics import FinancialAnalytics
from .models import Transaction, Category


class AnalyticsViewSet(viewsets.ViewSet):
    """
    ViewSet for financial analytics endpoints.
    FR9: Aggregation API for financial insights.
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        """Get monthly financial summary."""
        month = request.query_params.get('month')
        year = request.query_params.get('year')

        analytics = FinancialAnalytics(request.user)
        summary = analytics.get_monthly_summary(
            month=int(month) if month else None,
            year=int(year) if year else None
        )

        return Response(summary)

    @action(detail=False, methods=['get'])
    def category_breakdown(self, request):
        """Get category spending breakdown (FR9)."""
        period = request.query_params.get('period', 'month')

        analytics = FinancialAnalytics(request.user)
        categories = analytics.get_category_breakdown(period=period)
        categories = analytics.calculate_percentage_breakdown(categories)

        return Response({
            'period': period,
            'categories': categories,
        })

    @action(detail=False, methods=['get'])
    def savings_rate(self, request):
        """Get savings rate calculation (FR9)."""
        month = request.query_params.get('month')
        year = request.query_params.get('year')

        analytics = FinancialAnalytics(request.user)
        savings = analytics.get_savings_rate(
            month=int(month) if month else None,
            year=int(year) if year else None
        )

        return Response(savings)

    @action(detail=False, methods=['get'])
    def comparison(self, request):
        """Get month-over-month comparison (FR9)."""
        analytics = FinancialAnalytics(request.user)
        comparison = analytics.get_comparison_with_previous_month()

        return Response(comparison)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get overall financial statistics."""
        analytics = FinancialAnalytics(request.user)
        stats = analytics.get_statistics()

        return Response(stats)

    @action(detail=False, methods=['get'])
    def budget_status(self, request):
        """Get status of all budgets."""
        analytics = FinancialAnalytics(request.user)
        status_list = analytics.get_budget_status()

        return Response({
            'total_budgets': len(status_list),
            'budgets': status_list,
        })

    @action(detail=False, methods=['get'])
    def top_expenses(self, request):
        """Get top N expenses."""
        limit = int(request.query_params.get('limit', 10))
        period = request.query_params.get('period', 'month')

        analytics = FinancialAnalytics(request.user)
        top_expenses = analytics.get_top_expenses(limit=limit, period=period)

        return Response({
            'period': period,
            'limit': limit,
            'expenses': top_expenses,
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def financial_dashboard(request):
    """
    Comprehensive financial dashboard with all key metrics.
    FR9: Complete aggregation API response.
    """
    analytics = FinancialAnalytics(request.user)

    return Response({
        'summary': analytics.get_monthly_summary(),
        'category_breakdown': analytics.calculate_percentage_breakdown(
            analytics.get_category_breakdown('month')
        ),
        'savings_rate': analytics.get_savings_rate(),
        'comparison': analytics.get_comparison_with_previous_month(),
        'statistics': analytics.get_statistics(),
        'budget_status': analytics.get_budget_status(),
        'top_expenses': analytics.get_top_expenses(limit=5),
    })
