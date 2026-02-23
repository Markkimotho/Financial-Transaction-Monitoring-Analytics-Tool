from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import analytics_views

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'transactions', views.TransactionViewSet, basename='transaction')
router.register(r'recurring-transactions', views.RecurringTransactionViewSet, basename='recurring-transaction')
router.register(r'budgets', views.BudgetViewSet, basename='budget')
router.register(r'budget-alerts', views.BudgetAlertViewSet, basename='budget-alert')
router.register(r'analytics', analytics_views.AnalyticsViewSet, basename='analytics')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', views.TokenRefreshView.as_view(), name='token_refresh'),
    path('dashboard/', analytics_views.financial_dashboard, name='dashboard'),
]