"""
Quick API endpoint test
Run this to verify the backend is working
"""

import requests
import json
from pathlib import Path

API_BASE = "http://localhost:8000/api"

def test_transactions():
    """Test if transactions endpoint is accessible"""
    print("\n" + "="*60)
    print("FINANCIAL MONITORING API TEST")
    print("="*60)
    
    # Test 1: Check backend health
    print("\n[1/4] Testing backend connectivity...")
    try:
        response = requests.get(f"{API_BASE}/transactions/", timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 401:
            print("   ✓ Backend is running (requires authentication)")
        else:
            print(f"   Response: {response.text[:100]}")
    except requests.exceptions.ConnectionError:
        print("   ✗ FAILED: Backend not running")
        print("   Fix: cd src && python manage.py runserver")
        return False
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False
    
    # Test 2: Try login
    print("\n[2/4] Testing authentication...")
    try:
        login_data = {
            "username": "testuser",
            "password": "TestPassword123"
        }
        response = requests.post(f"{API_BASE}/auth/login/", json=login_data)
        
        if response.status_code != 200:
            print(f"   ✗ Login failed ({response.status_code})")
            print(f"   Response: {response.text}")
            print("   Fix: Create test user with: python create_users.py")
            return False
        
        data = response.json()
        token = data.get('access')
        print(f"   ✓ Login successful")
        print(f"   Token: {token[:30]}...")
        
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False
    
    # Test 3: Fetch transactions
    print("\n[3/4] Testing transactions endpoint...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/transactions/", headers=headers)
        
        if response.status_code != 200:
            print(f"   ✗ Failed ({response.status_code})")
            print(f"   Response: {response.text}")
            return False
        
        data = response.json()
        count = len(data.get('results', data) if isinstance(data, dict) else [])
        print(f"   ✓ Transactions fetched successfully")
        print(f"   Found {count} transactions")
        
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False
    
    # Test 4: Fetch categories
    print("\n[4/4] Testing categories endpoint...")
    try:
        response = requests.get(f"{API_BASE}/categories/", headers=headers)
        
        if response.status_code != 200:
            print(f"   ✗ Failed ({response.status_code})")
            return False
        
        data = response.json()
        count = len(data.get('results', data) if isinstance(data, dict) else [])
        print(f"   ✓ Categories fetched successfully")
        print(f"   Found {count} categories")
        
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False
    
    print("\n" + "="*60)
    print("✓ ALL TESTS PASSED!")
    print("="*60)
    print("\nFrontend setup:")
    print("1. cd frontend")
    print("2. npm run dev")
    print("3. Visit http://localhost:3000")
    print("4. Login with: testuser / TestPassword123")
    print("5. Navigate to /transactions")
    return True

if __name__ == "__main__":
    import sys
    success = test_transactions()
    sys.exit(0 if success else 1)
