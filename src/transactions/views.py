from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
import csv
import io

from .models import (
    CustomUser, Category, Transaction, RecurringTransaction,
    Budget, BudgetAlert
)
from .serializers import (
    CustomUserSerializer, CustomUserRegistrationSerializer,
    CategorySerializer, TransactionSerializer, TransactionListSerializer,
    RecurringTransactionSerializer, BudgetSerializer, BudgetCreateUpdateSerializer,
    BudgetAlertSerializer
)

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Extended JWT serializer with user info."""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['email'] = user.email
        token['full_name'] = user.get_full_name()
        return token


class CustomTokenObtainPairView(TokenObtainPairView):
    """JWT token obtain endpoint with extended claims."""
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    """User registration endpoint."""
    serializer = CustomUserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {'message': 'User created successfully', 'user_id': str(user.id)},
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user management.
    FR1: Authentication (JWT), FR2: Password reset capability.
    """
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'last_login']
    ordering = ['-created_at']

    def get_queryset(self):
        """Users can only view their own profile; admins see all."""
        if self.request.user.is_staff:
            return CustomUser.objects.all()
        return CustomUser.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password."""
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        new_password_confirm = request.data.get('new_password_confirm')

        if not user.check_password(old_password):
            return Response(
                {'error': 'Old password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_password != new_password_confirm:
            return Response(
                {'error': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(new_password) < 12:
            return Response(
                {'error': 'Password must be at least 12 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Password changed successfully'})

    @action(detail=False, methods=['post'])
    def request_password_reset(self, request):
        """Request password reset (FR2)."""
        email = request.data.get('email')
        try:
            user = CustomUser.objects.get(email=email)
            # TODO: Implement email sending with password reset token
            return Response(
                {'message': 'Password reset email sent if user exists'},
                status=status.HTTP_200_OK
            )
        except CustomUser.DoesNotExist:
            # Don't reveal whether email exists
            return Response(
                {'message': 'Password reset email sent if user exists'},
                status=status.HTTP_200_OK
            )


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for transaction categories."""
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['created_at', 'name']
    ordering = ['name']

    def get_queryset(self):
        """Users see their own categories."""
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for transactions.
    FR4: ACID compliance, FR5: Soft deletes, FR6: Bulk actions.
    """
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'transaction_type', 'is_deleted']
    search_fields = ['description', 'category__name']
    ordering_fields = ['transaction_date', 'amount', 'created_at']
    ordering = ['-transaction_date']
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def get_queryset(self):
        """Users see their own transactions by default."""
        queryset = Transaction.objects.filter(user=self.request.user)
        # Hide deleted transactions unless explicitly requested
        include_deleted = self.request.query_params.get('include_deleted', 'false') == 'true'
        if not include_deleted:
            queryset = queryset.filter(is_deleted=False)
        return queryset

    def get_serializer_class(self):
        """Use lightweight serializer for list views."""
        if self.action == 'list':
            return TransactionListSerializer
        return TransactionSerializer

    def perform_create(self, serializer):
        """Create transaction and check budget alerts."""
        instance = serializer.save(user=self.request.user)
        
        # Check budget and create alert if necessary
        if 'budget_exceeded' in serializer.context:
            budget = serializer.context['budget']
            percentage_used = (
                (serializer.context['projected_total'] / budget.monthly_limit) * 100
            )
            
            alert_type = 'CRITICAL' if percentage_used > 100 else 'WARNING'
            
            BudgetAlert.objects.create(
                budget=budget,
                user=self.request.user,
                alert_type=alert_type,
                message=f"Budget for {budget.category.name} is {int(percentage_used)}% used",
                current_spending=serializer.context['projected_total'],
                percentage_used=int(percentage_used)
            )

    def perform_destroy(self, instance):
        """Soft delete transaction instead of hard deletion."""
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.delete_reason = 'User initiated deletion'
        instance.save()

    def get_serializer_context(self):
        """Add request to serializer context."""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=False, methods=['post'])
    def bulk_import(self, request):
        """
        Bulk import transactions from CSV.
        FR6: Bulk Actions.
        
        Expected CSV columns: category, amount, transaction_type, description, transaction_date
        """
        csv_file = request.FILES.get('file')
        
        if not csv_file:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        errors = []
        created_count = 0
        
        try:
            decoded_file = csv_file.read().decode('utf-8')
            reader = csv.DictReader(io.StringIO(decoded_file))
            
            for row_num, row in enumerate(reader, start=2):
                try:
                    category = Category.objects.get(
                        user=request.user,
                        name=row.get('category')
                    )
                    
                    Transaction.objects.create(
                        user=request.user,
                        category=category,
                        amount=Decimal(row.get('amount', 0)),
                        transaction_type=row.get('transaction_type', 'EXPENSE'),
                        description=row.get('description', ''),
                        transaction_date=datetime.fromisoformat(
                            row.get('transaction_date')
                        )
                    )
                    created_count += 1
                except Exception as e:
                    errors.append({
                        'row': row_num,
                        'error': str(e)
                    })
            
            return Response({
                'created': created_count,
                'errors': errors
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Soft delete multiple transactions."""
        transaction_ids = request.data.get('transaction_ids', [])
        reason = request.data.get('reason', 'User initiated deletion')
        
        deleted_count = Transaction.objects.filter(
            id__in=transaction_ids,
            user=request.user
        ).update(
            is_deleted=True,
            deleted_at=timezone.now(),
            delete_reason=reason
        )
        
        return Response({
            'deleted_count': deleted_count,
            'message': f'{deleted_count} transactions soft deleted'
        })

    @action(detail=False, methods=['post'])
    def restore(self, request):
        """Restore soft-deleted transactions (within 30 days)."""
        transaction_ids = request.data.get('transaction_ids', [])
        cutoff_date = timezone.now() - timedelta(days=30)
        
        restored_count = Transaction.objects.filter(
            id__in=transaction_ids,
            user=request.user,
            is_deleted=True,
            deleted_at__gte=cutoff_date
        ).update(
            is_deleted=False,
            deleted_at=None,
            delete_reason=None
        )
        
        return Response({
            'restored_count': restored_count,
            'message': f'{restored_count} transactions restored'
        })

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get transaction summary for dashboard."""
        today = timezone.now().date()
        month_start = today.replace(day=1)
        
        transactions = self.get_queryset()
        
        return Response({
            'total_transactions': transactions.count(),
            'total_income': transactions.filter(
                transaction_type='INCOME'
            ).aggregate(Sum('amount'))['amount__sum'] or 0,
            'total_expense': transactions.filter(
                transaction_type='EXPENSE'
            ).aggregate(Sum('amount'))['amount__sum'] or 0,
            'this_month': transactions.filter(
                transaction_date__date__gte=month_start
            ).count(),
            'this_month_expense': transactions.filter(
                transaction_type='EXPENSE',
                transaction_date__date__gte=month_start
            ).aggregate(Sum('amount'))['amount__sum'] or 0,
        })


class RecurringTransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for recurring transactions.
    FR8: Recurring Transactions support.
    """
    serializer_class = RecurringTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_active', 'frequency']
    ordering_fields = ['next_due_date', 'created_at']
    ordering = ['next_due_date']

    def get_queryset(self):
        return RecurringTransaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Manually execute a recurring transaction."""
        recurring = self.get_object()
        
        if not recurring.is_active:
            return Response(
                {'error': 'Recurring transaction is not active'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            transaction = Transaction.objects.create(
                user=request.user,
                category=recurring.category,
                amount=recurring.amount,
                transaction_type=recurring.transaction_type,
                description=recurring.description,
                transaction_date=timezone.now(),
                recurring_transaction=recurring
            )
            
            # Update next due date
            from dateutil.relativedelta import relativedelta
            
            frequency_map = {
                'DAILY': relativedelta(days=1),
                'WEEKLY': relativedelta(weeks=1),
                'BIWEEKLY': relativedelta(weeks=2),
                'MONTHLY': relativedelta(months=1),
                'QUARTERLY': relativedelta(months=3),
                'ANNUAL': relativedelta(years=1),
            }
            
            recurring.next_due_date = recurring.next_due_date + frequency_map[
                recurring.frequency
            ]
            recurring.save()
            
            return Response({
                'message': 'Recurring transaction executed',
                'transaction_id': str(transaction.id)
            })
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class BudgetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for budgets.
    FR7: Over-budget Triggers, FR9: Aggregation API.
    """
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active']
    ordering_fields = ['start_date', 'created_at']
    ordering = ['-start_date']

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        """Use different serializer for create/update."""
        if self.action in ['create', 'update', 'partial_update']:
            return BudgetCreateUpdateSerializer
        return BudgetSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get budget summary with spending."""
        budgets = self.get_queryset()
        
        data = []
        for budget in budgets:
            serializer = BudgetSerializer(budget)
            data.append(serializer.data)
        
        return Response({
            'total_budgets': budgets.count(),
            'active_budgets': budgets.filter(is_active=True).count(),
            'budgets': data
        })

    @action(detail=False, methods=['get'])
    def alerts(self, request):
        """Get all budget alerts for user."""
        alerts = BudgetAlert.objects.filter(user=request.user).order_by('-created_at')
        serializer = BudgetAlertSerializer(alerts, many=True)
        return Response({
            'unread_count': alerts.filter(is_read=False).count(),
            'alerts': serializer.data
        })


class BudgetAlertViewSet(viewsets.ModelViewSet):
    """ViewSet for budget alerts."""
    serializer_class = BudgetAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['alert_type', 'is_read']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return BudgetAlert.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark alert as read."""
        alert = self.get_object()
        alert.is_read = True
        alert.save()
        return Response({'message': 'Alert marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all alerts as read."""
        count = BudgetAlert.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)
        return Response({
            'message': f'{count} alerts marked as read'
        })
