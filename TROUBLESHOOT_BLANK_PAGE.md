# Troubleshooting: Transactions Page Shows Blank

If `http://localhost:3000/transactions` shows a blank page, follow these steps:

## Quick Diagnosis

### Step 1: Verify Backend is Running
```bash
# In one terminal
cd src
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

### Step 2: Test API Endpoints

```bash
# In another terminal, from the project root
python test_api_endpoints.py
```

This will test:
- ✓ Backend connectivity
- ✓ Authentication
- ✓ Transactions endpoint
- ✓ Categories endpoint

## Common Issues & Fixes

### Issue 1: Server Not Running
**Symptom:** Connection refused error

**Fix:**
```bash
cd src
python manage.py runserver
```

### Issue 2: User Not Logged In
**Symptom:** Blank page loads but no data shown

**Fix:**
1. Create a test user:
   ```bash
   cd src
   python create_users.py
   ```

2. Login in the frontend with:
   - Username: `testuser`
   - Password: `TestPassword123`

### Issue 3: API URL Misconfigured
**Symptom:** Network errors in browser console

**Fix:** Check `/frontend/.env`
```
VITE_API_URL=http://localhost:8000/api
```

### Issue 4: Token Not Being Sent
**Symptom:** 401 Unauthorized errors

**Fix:**
1. Clear browser localStorage
2. Login again
3. Check DevTools > Application > Local Storage

## Debug Mode

To see detailed error messages:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to `/transactions`
4. Look for error messages with details

## Frontend Error Display

The page will now show:
- ✓ "Loading transactions..." while fetching data
- ✓ Error message with details if API call fails
- ✓ "No transactions yet" if no data exists

## Complete Setup from Scratch

```bash
# Terminal 1: Start Backend
cd src
python manage.py migrate  # if needed
python manage.py runserver

# Terminal 2: Create test user (if needed)
cd src
python create_users.py

# Terminal 3: Start Frontend
cd frontend
npm run dev
```

Then visit: `http://localhost:3000`

Login with:
- Username: `testuser`
- Password: `TestPassword123`

Navigate to:
- Dashboard: `/`
- Transactions: `/transactions`
- Budgets: `/budgets`
- Analytics: `/analytics`

## What Was Fixed

1. ✓ Added proper loading/error state returns
2. ✓ Added empty state message for no transactions
3. ✓ Improved error logging to console
4. ✓ Fixed API endpoint URLs (underscores instead of hyphens)
5. ✓ Added required `start_date` field for budgets
6. ✓ Fixed TypeScript environment variable types
7. ✓ Added/configured `.env` file with correct API URL

## Still Not Working?

Run the test script and share the output:
```bash
python test_api_endpoints.py
```

This will help identify exactly where the issue is.
