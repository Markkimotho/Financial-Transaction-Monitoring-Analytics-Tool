"""
Management command to initialize default categories for users.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from src.transactions.models import Category

User = get_user_model()

DEFAULT_CATEGORIES = {
    'EXPENSE': [
        {'name': 'Groceries', 'color': '#FF9800'},
        {'name': 'Dining Out', 'color': '#F44336'},
        {'name': 'Transportation', 'color': '#2196F3'},
        {'name': 'Utilities', 'color': '#4CAF50'},
        {'name': 'Entertainment', 'color': '#9C27B0'},
        {'name': 'Shopping', 'color': '#E91E63'},
        {'name': 'Healthcare', 'color': '#00BCD4'},
        {'name': 'Education', 'color': '#3F51B5'},
        {'name': 'Travel', 'color': '#FF5722'},
        {'name': 'Subscriptions', 'color': '#757575'},
        {'name': 'Other', 'color': '#607D8B'},
    ],
    'INCOME': [
        {'name': 'Salary', 'color': '#4CAF50'},
        {'name': 'Freelance', 'color': '#8BC34A'},
        {'name': 'Investment', 'color': '#2196F3'},
        {'name': 'Bonus', 'color': '#FFC107'},
        {'name': 'Other Income', 'color': '#9E9E9E'},
    ],
    'TRANSFER': [
        {'name': 'Savings Transfer', 'color': '#00897B'},
        {'name': 'Loan', 'color': '#D32F2F'},
    ],
}


class Command(BaseCommand):
    help = 'Create default categories for users or a specific user'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-id',
            type=str,
            help='Specific user UUID to initialize categories for'
        )

    def handle(self, *args, **options):
        user_id = options.get('user_id')

        if user_id:
            try:
                user = User.objects.get(id=user_id)
                users = [user]
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'User with ID {user_id} not found')
                )
                return
        else:
            users = User.objects.all()

        for user in users:
            # Skip if user already has categories
            if user.categories.exists():
                self.stdout.write(
                    self.style.WARNING(
                        f'User {user.email} already has categories, skipping...'
                    )
                )
                continue

            created_count = 0
            for category_type, categories in DEFAULT_CATEGORIES.items():
                for cat_data in categories:
                    category, created = Category.objects.get_or_create(
                        user=user,
                        name=cat_data['name'],
                        defaults={
                            'category_type': category_type,
                            'color': cat_data['color'],
                            'is_default': True,
                        }
                    )
                    if created:
                        created_count += 1

            self.stdout.write(
                self.style.SUCCESS(
                    f'Created {created_count} default categories for {user.email}'
                )
            )

        self.stdout.write(
            self.style.SUCCESS('Default categories initialization complete!')
        )
