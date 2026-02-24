#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.insert(0, '/Users/ktinega/Financial-Transaction-Monitoring-Analytics-Tool/src')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Create superuser
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123',
        first_name='Admin',
        last_name='User'
    )
    print("✓ Superuser 'admin' created (password: admin123)")
else:
    print("✓ Superuser 'admin' already exists")

# Create test user
if not User.objects.filter(username='testuser').exists():
    User.objects.create_user(
        username='testuser',
        email='testuser@example.com',
        password='testpass123',
        first_name='Test',
        last_name='User',
        currency_preference='KES'
    )
    print("✓ Test user 'testuser' created (password: testpass123)")
else:
    print("✓ Test user 'testuser' already exists")

print(f"\n✓ Total users: {User.objects.count()}")
print("✓ Users created successfully!")
