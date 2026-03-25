#!/bin/bash

# Test the complete login flow
API_URL="http://localhost:8000/api"
USERNAME="testuser"
PASSWORD="TestPassword123!"

echo "[LOCK] Testing Financial Monitoring & Analytics Login Flow"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 1: Check if server is running
echo ""
echo "1️⃣  Checking server connectivity..."
if ! curl -s "${API_URL}/" > /dev/null 2>&1; then
  echo "[FAIL] Server is not responding at ${API_URL}"
  exit 1
fi
echo "✓ Server is running at ${API_URL}"

# Test 2: Attempt login
echo ""
echo "2️⃣  Attempting login..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login/" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${USERNAME}\",\"password\":\"${PASSWORD}\"}")

echo "Response: $LOGIN_RESPONSE" | head -c 200
echo "..."

# Extract tokens
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access":"[^"]*' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"refresh":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "[FAIL] Login failed - no access token in response"
  echo "Full response: $LOGIN_RESPONSE"
  exit 1
fi

echo ""
echo "✓ Login successful!"
echo "  Access Token: ${ACCESS_TOKEN:0:50}..."
echo "  Refresh Token: ${REFRESH_TOKEN:0:50}..."

# Test 3: Fetch current user
echo ""
echo "3️⃣  Fetching current user info..."
USER_RESPONSE=$(curl -s -X GET "${API_URL}/users/me/" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json")

USERNAME_RESPONSE=$(echo "$USER_RESPONSE" | grep -o '"username":"[^"]*' | cut -d'"' -f4)

if [ -z "$USERNAME_RESPONSE" ]; then
  echo "[FAIL] Failed to fetch user info"
  echo "Full response: $USER_RESPONSE"
  exit 1
fi

echo "✓ User info retrieved!"
echo "  Username: ${USERNAME_RESPONSE}"
echo ""
echo "[PASS] All tests passed! Login flow is working correctly."
echo ""
echo "🔑 Credentials for testing:"
echo "  Username: ${USERNAME}"
echo "  Password: ${PASSWORD}"
