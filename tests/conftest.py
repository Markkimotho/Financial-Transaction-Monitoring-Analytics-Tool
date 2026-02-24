import sys
import os
import django
from pathlib import Path

# Add src directory to the path so Django can find the project
src_path = Path(__file__).parent / 'src'
sys.path.insert(0, str(src_path))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Override cache settings for testing (disable Redis)
os.environ.setdefault('CACHE_DISABLED', 'true')

# Setup Django
django.setup()

