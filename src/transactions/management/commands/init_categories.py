"""Management command to initialize default categories for new users."""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from transactions.models import Category

User = get_user_model()

DEFAULT_CATEGORIES = [
    'Groceries',
    'Transportation',
    'Utilities',
    'Entertainment',
    'Dining Out',
    'Shopping',
    'Healthcare',
    'Insurance',
    'Rent/Mortgage',
    'Salary',
    'Freelance',
    'Investments',
    'Other Income',
    'Savings',
    'Emergency Fund',
]


class Command(BaseCommand):
    help = 'Initialize default categories for users who don\'t have any'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-id',
            type=int,
            help='Initialize categories for a specific user ID',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Initialize categories for all users without categories',
        )

    def handle(self, *args, **options):
        user_id = options.get('user_id')
        init_all = options.get('all')

        if user_id:
            self._init_user_categories(user_id)
        elif init_all:
            self._init_all_users_categories()
        else:
            self.stdout.write(
                self.style.WARNING(
                    'Please use --user-id <id> or --all to initialize categories'
                )
            )

    def _init_user_categories(self, user_id):
        """Initialize categories for a specific user."""
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'User with ID {user_id} not found')
            )
            return

        existing_count = Category.objects.filter(user=user).count()
        if existing_count > 0:
            self.stdout.write(
                self.style.WARNING(
                    f'User {user.email} already has {existing_count} categories'
                )
            )
            return

        created_categories = []
        for category_name in DEFAULT_CATEGORIES:
            category, created = Category.objects.get_or_create(
                user=user,
                name=category_name,
            )
            if created:
                created_categories.append(category_name)

        self.stdout.write(
            self.style.SUCCESS(
                f'Created {len(created_categories)} categories for user {user.email}'
            )
        )
        if created_categories:
            self.stdout.write(f'Categories: {", ".join(created_categories)}')

    def _init_all_users_categories(self):
        """Initialize categories for all users without categories."""
        users_with_no_categories = []

        for user in User.objects.all():
            if not Category.objects.filter(user=user).exists():
                users_with_no_categories.append(user)

        if not users_with_no_categories:
            self.stdout.write(
                self.style.SUCCESS('All users already have categories')
            )
            return

        total_created = 0
        for user in users_with_no_categories:
            for category_name in DEFAULT_CATEGORIES:
                Category.objects.get_or_create(
                    user=user,
                    name=category_name,
                )
            total_created += len(DEFAULT_CATEGORIES)

        self.stdout.write(
            self.style.SUCCESS(
                f'Created {total_created} categories for {len(users_with_no_categories)} users'
            )
        )
