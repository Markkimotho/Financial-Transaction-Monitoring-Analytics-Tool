# Free Deployment Guide

**Date**: February 24, 2026  
**Purpose**: Deploy your app so anyone can access it (not localhost)

---

## Table of Contents
1. [Best Free Options](#best-free-options)
2. [Recommended Setup](#recommended-setup)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [Custom Domain (Free)](#custom-domain-free)
5. [Monitoring & Logs](#monitoring--logs)
6. [Troubleshooting](#troubleshooting)

---

## Best Free Options

### Frontend Hosting Comparison

| Platform | Limit | Cost | Speed | SSL | Bandwidth |
|----------|-------|------|-------|-----|-----------|
| **Vercel** | Unlimited | FREE | [STAR][STAR][STAR][STAR][STAR] | [PASS] | 100GB/mo |
| **Netlify** | Unlimited | FREE | [STAR][STAR][STAR][STAR] | [PASS] | 100GB/mo |
| **GitHub Pages** | 1GB | FREE | [STAR][STAR][STAR] | [PASS] | Unlimited |
| **Firebase** | 1GB | FREE | [STAR][STAR][STAR] | [PASS] | 10GB/mo |

**Winner**: **Vercel** (best for React/TypeScript)

### Backend Hosting Comparison

| Platform | Language | Database | Cost | Max Requests |
|----------|----------|----------|------|--------------|
| **Render** | Python | PostgreSQL | FREE* | 100/min |
| **Railway** | Python | PostgreSQL | FREE credits | Limited |
| **Fly.io** | Python | Separate | FREE | Limited |
| **PythonAnywhere** | Python | Limited | FREE | Limited |
| **Heroku** | Python | [FAIL] | Paid | - |

**Winner**: **Render** (best Django support + PostgreSQL)

*Free tier: spins down after 15min inactivity (adds 10-30s startup delay)

### Database Comparison

| Platform | Type | Limit | Cost | Backups |
|----------|------|-------|------|---------|
| **Supabase** | PostgreSQL | 500MB | FREE | Auto |
| **Render** | PostgreSQL | 256MB | FREE | Weekly |
| **Railway** | PostgreSQL | 6GB | FREE credits | Auto |
| **Neon** | PostgreSQL | 3GB | FREE | Auto |

**Winner**: **Render** (PostgreSQL included with backend hosting)

---

## Recommended Setup

### **Easiest & Most Reliable Combo**

```
┌──────────────────────────────────────┐
│  Frontend: Vercel (React)            │
│  ├─ URL: yourapp.vercel.app          │
│  ├─ Git auto-deployment              │
│  └─ Serverless functions (optional)  │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Backend: Render (Django)            │
│  ├─ URL: yourapp.onrender.com        │
│  ├─ PostgreSQL included              │
│  ├─ Redis available                  │
│  └─ Auto-deploys from GitHub         │
└──────────────────────────────────────┘

Custom Domain (Free):
  └─ yourname.eu.org (FREE .eu.org)
```

---

## Step-by-Step Deployment

### PART 1: Deploy Frontend to Vercel

#### 1.1 Prepare Frontend

```bash
cd frontend

# Install dependencies
npm install

# Build locally to test
npm run build

# Should create dist/ folder with no errors
ls -la dist/
```

#### 1.2 Push to GitHub

```bash
cd /Users/ktinega/Financial-Transaction-Monitoring-Analytics-Tool

# If not already a git repo
git remote -v

# Make sure frontend is committed
git add frontend/
git commit -m "frontend: prepare for deployment"
git push origin main
```

#### 1.3 Deploy to Vercel

**Option A: Import from GitHub (Easiest)**

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Authenticate with GitHub
5. Select your repository
6. Choose the **`/frontend`** folder as root
7. Set Environment Variables:
   ```
   VITE_API_URL=https://yourapp.onrender.com/api
   ```
8. Click **Deploy**

**Option B: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Follow prompts - select "frontend" folder
# When asked for API URL, use: https://yourapp.onrender.com/api
```

**Result**: Your frontend is now live at yourapp.vercel.app

---

### PART 2: Deploy Backend to Render

#### 2.1 Prepare Django for Deployment

Edit `src/core/settings.py`:

```python
# Add to ALLOWED_HOSTS
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'yourapp.onrender.com',  # Add this
    'yourdomain.com',         # Add this later
]

# Update CORS for Vercel frontend
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://yourapp.vercel.app',  # Add this
    'https://yourdomain.com',        # Add this later
]
```

#### 2.2 Create `.env` File

Create `src/.env` (or use Render's environment variables):

```env
DEBUG=False
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:port/0
ALLOWED_HOSTS=localhost,127.0.0.1,yourapp.onrender.com
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourapp.vercel.app
```

#### 2.3 Create Render Configuration

Create `render.yaml` in project root:

```yaml
services:
  - type: web
    name: financial-app-backend
    env: python
    region: oregon
    plan: free
    buildCommand: |
      pip install -r requirements.txt
      python src/manage.py migrate
      python src/manage.py collectstatic --noinput
    startCommand: |
      gunicorn \
        --bind 0.0.0.0:$PORT \
        --workers 1 \
        --worker-class sync \
        --timeout 30 \
        src.core.wsgi:application
    envVars:
      - key: DEBUG
        value: false
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: DJANGO_SETTINGS_MODULE
        value: core.settings
  
  - type: pserv
    name: financial-app-db
    env: postgres
    region: oregon
    plan: free
    ipAllowList: []
    postgresMajorVersion: 15
```

#### 2.4 Deploy to Render

**Step 1: Create Database**

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **New +**
4. Select **PostgreSQL**
5. Fill in:
   - **Name**: `financial-app-db`
   - **Database**: `financial_db`
   - **User**: `financial_user`
   - **Plan**: Free
6. Click **Create Database**
7. Copy the **Internal Database URL**

**Step 2: Deploy Backend**

1. Go to [render.com](https://render.com)
2. Click **New +**
3. Select **Web Service**
4. Connect GitHub repository
5. Select your repository
6. Fill in:
   - **Name**: `financial-app-backend`
   - **Runtime**: `Python 3`
   - **Root Directory**: `src` (if it asks)
   - **Build Command**:
     ```
     pip install -r requirements.txt && python manage.py migrate
     ```
   - **Start Command**:
     ```
     gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --workers 1
     ```
7. Add Environment Variables:
   - `DATABASE_URL`: (from step 1)
   - `SECRET_KEY`: (generate with: `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`)
   - `CORS_ALLOWED_ORIGINS`: `https://yourapp.vercel.app`
   - `ALLOWED_HOSTS`: `yourapp.onrender.com`
   - Click **Deploy**

**Result**: Your backend is now live at `yourapp.onrender.com`

---

### PART 3: Connect Frontend to Backend

#### Update Vercel Environment Variables

1. Go to [vercel.com](https://vercel.com)
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   ```
   VITE_API_URL=https://yourapp.onrender.com/api
   ```
5. Click **Save & Redeploy**

#### Verify Connection

```bash
# Frontend should now connect to backend
# Check browser console (F12) for any errors

# Test backend directly:
curl https://yourapp.onrender.com/api/auth/login/
# Should return 405 (POST required) - means backend is working
```

---

## Custom Domain (Free)

### Option 1: Free .eu.org Domain

1. Go to [eu.org](https://eu.org)
2. Register a free `.eu.org` domain (takes 24-48 hours)
3. Get nameservers for your hosting:
   - **For Vercel**: Use Vercel's nameservers
   - **For Render**: Use Render's nameservers

### Option 2: Free Subdomain on GitHub Pages

1. Use `username.github.io` as custom domain
2. Configure in settings

### Option 3: Paid Budget Domain

- `.com`: $10-12/year
- `.dev`: $12-15/year
- `.io`: $40/year

---

## Final Checklist

```
[CHECK] Frontend
  ├─ Built successfully: npm run build
  ├─ Deployed to Vercel: yourapp.vercel.app
  ├─ Environment variables set: VITE_API_URL
  └─ Tests pass locally

[CHECK] Backend
  ├─ Database migrated: python manage.py migrate
  ├─ Deployed to Render: yourapp.onrender.com
  ├─ Environment variables set (SECRET_KEY, DB_URL, etc)
  ├─ Static files collected: collectstatic
  ├─ CORS configured for Vercel
  └─ Tests pass locally

[CHECK] Integration
  ├─ Frontend connects to backend
  ├─ Login works end-to-end
  ├─ Transactions can be created
  ├─ Analytics page loads
  └─ No console errors

[CHECK] Domain
  ├─ Custom domain configured (optional)
  ├─ SSL/HTTPS working
  └─ Email set for alerts (if configured)

[CHECK] Monitoring
  ├─ Error logs checked
  ├─ Performance acceptable
  └─ No sensitive data in logs
```

---

## Monitoring & Logs

### Vercel Logs

```bash
# View deployment logs
vercel logs

# Or in web dashboard:
# https://vercel.com → Project → Deployments → Logs
```

### Render Logs

1. Go to [render.com](https://render.com)
2. Select your service
3. Click **Logs** tab
4. See real-time logs

### Test Your Deployment

```bash
# Frontend
curl https://yourapp.vercel.app

# Backend
curl https://yourapp.onrender.com/api/auth/login/

# Should return 405 Method Not Allowed (because GET not allowed)
# This means backend is working!

# Test with real auth request
curl -X POST https://yourapp.onrender.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test"}'
```

---

## Troubleshooting

### Problem: "Vercel can't find /api endpoints"

**Solution**: Make sure `VITE_API_URL` is set in Vercel environment variables
```
VITE_API_URL=https://yourapp.onrender.com/api
```

### Problem: "Render backend spins down"

**Solution**: Free tier spins down after 15 minutes inactivity. First request takes 10-30s.
Options:
- Upgrade to paid ($7/month)
- Use cron job to ping every 14 minutes
- Use uptime monitor (e.g., [cron-job.org](https://cron-job.org))

### Problem: "CORS errors in browser"

**Solution**: Check `CORS_ALLOWED_ORIGINS` in Django:
```python
CORS_ALLOWED_ORIGINS = [
    'https://yourapp.vercel.app',  # No trailing slash
]
```

### Problem: "Static files not loading (CSS, images)"

**Solution**: Run collectstatic in Render build command:
```
python manage.py collectstatic --noinput
```

### Problem: "Database connection fails"

**Solution**: 
1. Check `DATABASE_URL` is correct format:
   ```
   postgresql://user:pass@host:port/dbname
   ```
2. Run migrations:
   ```
   python manage.py migrate
   ```

### Problem: "502 Bad Gateway"

**Solution**: 
- Check Render logs for errors
- Verify `gunicorn` is installed in `requirements.txt`
- Check port binding (should be `$PORT`)

---

## Cost Analysis

### Completely Free Forever

| Component | Service | Cost | Limitations |
|-----------|---------|------|-------------|
| **Frontend** | Vercel | FREE | 100GB bandwidth/mo |
| **Backend** | Render | FREE | 0.5 CPU, 512MB RAM, spins down |
| **Database** | Render PostgreSQL | FREE | 256MB storage |
| **Domain** | eu.org | FREE | .eu.org only |
| **SSL** | Automatic | FREE | Included |
| **CDN** | Vercel | FREE | Included |
| **Total** | - | **FREE** | OK for hobby/testing |

### Low-Cost Professional ($15-30/month)

| Component | Service | Cost | Benefits |
|-----------|---------|------|----------|
| **Frontend** | Vercel Pro | $20/mo | Priority support |
| **Backend** | Render ($7/mo) | $7/mo | Always on, no spin-down |
| **Database** | Included | - | - |
| **Domain** | .com | $12/year | Professional branding |
| **Total** | - | **~$27/month** | Production-ready |

---

## Next Steps

1. **Choose hosting**: Vercel + Render (recommended) [PASS]
2. **Deploy frontend**: Follow Part 1 above
3. **Deploy backend**: Follow Part 2 above
4. **Test everything**: Use checklist above
5. **Share link**: Anyone can now access via public URL
6. **Monitor**: Check logs regularly

---

## Quick Commands Reference

```bash
# Frontend build
cd frontend && npm run build

# Backend migration
cd src && python manage.py migrate

# Test backend locally
cd src && python manage.py runserver

# Test frontend locally
cd frontend && npm run dev

# Generate Django secret key
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Deploy to Vercel (with CLI)
vercel

# View Render logs
# Dashboard → Service → Logs tab
```

---

Your app will be live and shareable!

Everyone can access it via:
- Frontend: https://yourapp.vercel.app
- API: https://yourapp.onrender.com/api

No localhost needed!
