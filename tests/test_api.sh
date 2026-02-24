#!/bin/bash

# Script to test the API endpoints

API_URL="http://localhost:8000/api"
USERNAME="${1:-testuser}"
PASSWORD="${2:-TestPassword123}"

echo "=== Financial Monitoring API Test ==="
echo ""

# Check if backend is running
echo "1. Testing backend connectivity..."
if curl -s -f -o /dev/null "$API_URL/transactions/"; then
    echo "   ✓ Backend is accessible (but needs auth)"
else
    echo "   ✗ Backend is not running or not accessible"
    echo "   Make sure to run: cd src && python manage.py runserver"
    exit 1
fi

echo ""
echo "2. Testing unauthenticated access (should fail)..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/transactions/")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
echo "   HTTP Status: $HTTP_CODE (expected 401 Unauthorized)"

echo ""
echo "3. Attempting login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login/" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}")

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "   ✗ Login failed"
    echo "   Response: $LOGIN_RESPONSE"
    echo ""
    echo "   Try creating a test user first:"
    echo "   cd src && python create_users.py"
    exit 1
fi

echo "   ✓ Login successful"
echo "   Access Token: ${ACCESS_TOKEN:0:20}..."

echo ""
echo "4. Fetching transactions with auth..."
TRANS_RESPONSE=$(curl -s "$API_URL/transactions/" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "   Response: $TRANS_RESPONSE" | head -c 200
echo ""

echo ""
echo "✓ API is working correctly!"
echo ""
echo "Next steps:"
echo "1. Frontend: npm run dev (in frontend directory)"
echo "2. Visit: http://localhost:3000"
echo "3. Login with: $USERNAME / $PASSWORD"
echo "4. Navigate to /transactions"
