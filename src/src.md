```graphql
src/
├── core                   # Django project directory (main settings and configuration)
│   ├── asgi.py            # ASGI configuration for async support
│   ├── __init__.py        # Marks the directory as a Python package
│   ├── settings.py        # Main Django settings (configure this as needed)
│   ├── urls.py            # URL routing for the project
│   └── wsgi.py            # WSGI configuration for deployment
├── manage.py              # Django command-line utility
└── transactions           # My custom Django app
|   ├── admin.py           # Admin panel configuration for the `transactions` app
|   ├── apps.py            # App configuration
|   ├── __init__.py        # Marks the directory as a Python package
|   ├── migrations         # Directory for database migrations
|   │   └── __init__.py
|   ├── models.py          # Database models for `transactions`
|   ├── tests.py           # Unit tests for the app
|   └── views.py           # Views for handling requests
|
|__.....


```