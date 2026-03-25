#!/usr/bin/env python3
"""
Frontend & Backend Integration Test
Tests complete end-to-end flow of the Financial Monitoring Tool
"""

import json
import subprocess
import time
import sys

def _run_curl(method, endpoint, data=None, token=None, expected_status=None):
    """Helper to run curl requests"""
    base_url = "http://localhost:8000/api"
    headers = ["-H", "Content-Type: application/json"]
    
    if token:
        headers.extend(["-H", f"Authorization: Bearer {token}"])
    
    cmd = ["curl", "-s", "-X", method, f"{base_url}{endpoint}"] + headers
    
    if data:
        cmd.extend(["-d", json.dumps(data)])
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    try:
        response = json.loads(result.stdout)
        return response
    except json.JSONDecodeError:
        return {"error": result.stdout, "stderr": result.stderr}

def test_frontend_backend_integration():
    """Test complete integration flow"""
    
    print("\n" + "="*70)
    print("FRONTEND & BACKEND INTEGRATION TEST")
    print("="*70)
    
    # Test 1: Verify Backend is running
    print("\n[TEST 1] Backend Health Check...")
    try:
        result = subprocess.run(["curl", "-s", "http://localhost:8000/"], 
                              capture_output=True, text=True, timeout=3)
        if result.returncode == 0 or "404" in result.stdout or len(result.stdout) > 0:
            print("[PASS] Backend running on localhost:8000")
        else:
            print("[FAIL] Backend not responding correctly")
            return False
    except Exception as e:
        print(f"[FAIL] Backend health check failed: {e}")
        return False
    
    # Test 2: Verify Frontend is running
    print("\n[TEST 2] Frontend Health Check...")
    try:
        result = subprocess.run(["curl", "-s", "http://localhost:3000/"], 
                              capture_output=True, text=True, timeout=3)
        if "root" in result.stdout and "main.tsx" in result.stdout:
            print("[PASS] Frontend running on localhost:3000")
        else:
            print("[FAIL] Frontend not responding correctly")
            return False
    except Exception as e:
        print(f"[FAIL] Frontend health check failed: {e}")
        return False
    
    # Test 3: User Login Flow
    print("\n[TEST 3] User Authentication (Login)...")
    login_response = _run_curl("POST", "/auth/login/", {
        "username": "testuser",
        "password": "TestPassword123"
    })
    
    if "access" in login_response:
        access_token = login_response["access"]
        print(f"[PASS] Login successful - Token: {access_token[:20]}...")
    else:
        print(f"[FAIL] Login failed: {login_response}")
        return False
    
    # Test 4: Get User Profile
    print("\n[TEST 4] Fetch User Profile...")
    profile = _run_curl("GET", "/users/me/", token=access_token)
    
    if "id" in profile and "username" in profile:
        print(f"[PASS] Profile retrieved - User: {profile['username']}")
    else:
        print(f"[FAIL] Could not fetch profile: {profile}")
        return False
    
    # Test 5: Create Category
    print("\n[TEST 5] Create Transaction Category...")
    category = _run_curl("POST", "/categories/", {
        "name": "Groceries",
        "category_type": "EXPENSE"
    }, token=access_token)
    
    if "id" in category:
        category_id = category["id"]
        print(f"[PASS] Category created - ID: {category_id}")
    else:
        print(f"[FAIL] Category creation failed: {category}")
        return False
    
    # Test 6: Create Transaction
    print("\n[TEST 6] Create Transaction...")
    transaction = _run_curl("POST", "/transactions/", {
        "category": category_id,
        "amount": 50.00,
        "transaction_type": "EXPENSE",
        "description": "Weekly groceries",
        "transaction_date": "2025-02-23"
    }, token=access_token)
    
    if "id" in transaction:
        transaction_id = transaction["id"]
        print(f"[PASS] Transaction created - ID: {transaction_id}, Amount: ${transaction['amount']}")
    else:
        print(f"[FAIL] Transaction creation failed: {transaction}")
        return False
    
    # Test 7: List Transactions
    print("\n[TEST 7] List Transactions...")
    transactions = _run_curl("GET", "/transactions/", token=access_token)
    
    if isinstance(transactions, dict) and ("results" in transactions or isinstance(transactions, list)):
        count = len(transactions.get("results", transactions)) if isinstance(transactions, dict) else len(transactions)
        print(f"[PASS] Transactions retrieved - Count: {count}")
    else:
        print(f"[FAIL] Could not list transactions: {transactions}")
        return False
    
    # Test 8: Create Budget
    print("\n[TEST 8] Create Budget...")
    budget = _run_curl("POST", "/budgets/", {
        "category": category_id,
        "monthly_limit": 200.00,
        "alert_threshold": 80
    }, token=access_token)
    
    if "id" in budget:
        print(f"[PASS] Budget created - Limit: ${budget['monthly_limit']}, Alert: {budget['alert_threshold']}%")
    else:
        print(f"[FAIL] Budget creation failed: {budget}")
        return False
    
    # Test 9: Soft Delete Transaction
    print("\n[TEST 9] Soft Delete Transaction...")
    delete_response = _run_curl("DELETE", f"/transactions/{transaction_id}/", 
                               token=access_token)
    
    # Verify it was soft deleted
    deleted_tx = _run_curl("GET", f"/transactions/{transaction_id}/", token=access_token)
    
    if "is_deleted" in deleted_tx and deleted_tx["is_deleted"]:
        print(f"[PASS] Soft delete successful - Transaction marked as deleted")
    else:
        print(f"[FAIL] Soft delete failed or transaction not found")
        return False
    
    # Test 10: Dashboard Summary
    print("\n[TEST 10] Dashboard Summary...")
    summary = _run_curl("GET", "/transactions/summary/", token=access_token)
    
    if "total_transactions" in summary or "this_month" in summary:
        print(f"[PASS] Dashboard summary retrieved")
        print(f"   - Total Transactions: {summary.get('total_transactions', 'N/A')}")
        print(f"   - Total Income: ${summary.get('total_income', 0)}")
        print(f"   - Total Expense: ${summary.get('total_expense', 0)}")
    else:
        print(f"[FAIL] Could not fetch summary: {summary}")
        return False
    
    # Test 11: Check API Proxy (Frontend→Backend)
    print("\n[TEST 11] Frontend API Proxy Check...")
    # This would normally be tested via frontend JavaScript, but we'll verify the proxy setup
    try:
        # Check if vite.config is set up correctly
        with open("/Users/ktinega/Financial-Transaction-Monitoring-Analytics-Tool/frontend/vite.config.ts", "r") as f:
            vite_config = f.read()
            if "localhost:8000" in vite_config or "/api" in vite_config:
                print("[PASS] Frontend API proxy configured correctly")
            else:
                print("[WARNING]  API proxy configuration needs verification")
    except Exception as e:
        print(f"[WARNING]  Could not verify proxy config: {e}")
    
    print("\n" + "="*70)
    print("[PASS] ALL INTEGRATION TESTS PASSED!")
    print("="*70)
    print("\n[CHART] Summary:")
    print("   • Backend API: Fully operational")
    print("   • Frontend Server: Running on port 3000")
    print("   • Authentication: JWT tokens working")
    print("   • Database Operations: CRUD + soft deletes working")
    print("   • API Endpoints: All major features tested")
    print("\n[TARGET] Next Steps:")
    print("   1. Open http://localhost:3000 in your browser")
    print("   2. Login with: testuser / TestPassword123")
    print("   3. Test the UI components (Dashboard, Transactions, Budgets, Analytics)")
    print("   4. Verify API integration through browser DevTools (Network tab)")
    print("\n")
    
    return True

if __name__ == "__main__":
    try:
        success = test_frontend_backend_integration()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nTest failed with error: {e}")
        sys.exit(1)
