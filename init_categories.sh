#!/bin/bash
# Quick script to initialize default categories for the current logged-in user

echo "Financial Transaction Monitoring Tool - Category Initialization"
echo "================================================================"
echo ""
echo "This script will initialize default spending categories for your account."
echo ""

# Check if we're in the project directory
if [ ! -f "src/manage.py" ]; then
    echo "Error: manage.py not found. Please run this script from the project root directory."
    exit 1
fi

# Activate venv if it exists
if [ -d "venv-backend" ]; then
    source venv-backend/bin/activate
    echo "✓ Virtual environment activated"
elif [ -d ".venv" ]; then
    source .venv/bin/activate
    echo "✓ Virtual environment activated"
fi

echo ""
echo "Available options:"
echo "1. Initialize categories for all users without categories"
echo "2. Initialize categories for a specific user ID (admin)"
echo ""

read -p "Select option (1 or 2): " option

cd src

if [ "$option" = "1" ]; then
    echo ""
    echo "Initializing default categories for all users without categories..."
    python manage.py init_categories --all
elif [ "$option" = "2" ]; then
    read -p "Enter user ID: " user_id
    echo ""
    echo "Initializing default categories for user ID $user_id..."
    python manage.py init_categories --user-id "$user_id"
else
    echo "Invalid option. Please run the script again."
    exit 1
fi

echo ""
echo "Done! Categories have been initialized."
echo "You can now log in to your account and see the default categories in the transaction and budget forms."
