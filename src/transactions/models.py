# This file will contain my models

from django.db import models


class User(models.Model):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        return self.username

class UserProfile(models.Model):
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

class Transaction(models.Model):
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=True)
    description = models.TextField(null=True, blank=True)
    transaction_type = models.CharField(max_length=20, choices=[('Income', 'Income'), ('Expense', 'Expense')])
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')

class Budget(models.Model):
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')

class Visualization(models.Model):
    chart_type = models.CharField(max_length=50)
    data_points = models.TextField()
    labels = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='visualizations')

class Alert(models.Model):
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alerts')

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

class Goal(models.Model):
    title = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    current_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deadline = models.DateTimeField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')

class AuditLog(models.Model):
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='audit_logs')

class Report(models.Model):
    report_type = models.CharField(max_length=50)
    generated_on = models.DateTimeField(auto_now_add=True)
    report_file = models.FileField(upload_to='reports/')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')

class BankIntegration(models.Model):
    bank_name = models.CharField(max_length=100)
    api_key = models.CharField(max_length=255)
    account_number = models.CharField(max_length=30)
    last_synced = models.DateTimeField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bank_integrations')
