# System Architecture & Technical Reference

**Version**: 2.0.0  
**Last Updated**: February 24, 2026  
**Status**: Production Ready

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Pattern](#architecture-pattern)
3. [Technology Stack](#technology-stack)
4. [Component Architecture](#component-architecture)
5. [Data Flow & Workflows](#data-flow--workflows)
6. [Data Models](#data-models)
7. [Security Architecture](#security-architecture)
8. [Performance & Scalability](#performance--scalability)
9. [Deployment Architecture](#deployment-architecture)
10. [API Endpoints Reference](#api-endpoints-reference)
11. [Testing Strategy](#testing-strategy)

---

## System Overview

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                 │
│                  (http://localhost:3000)                             │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS + JSON
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
   ┌──────────────┐              ┌──────────────┐
   │  CDN Cache   │              │ API Gateway  │
   │   Layer      │              │ (Optional)   │
   └──────────────┘              └──────┬───────┘
                                        │
                         ┌──────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │   Frontend Layer (React)        │
        │   ├─ UI Components              │
        │   ├─ State Management           │
        │   └─ API Client                 │
        └────────┬───────────────────────┘
                 │
                 │ REST API Calls
                 │ (with JWT tokens)
                 ▼
        ┌────────────────────────────────┐
        │   Backend Layer (Django)        │
        │   ├─ ViewSets & Serializers     │
        │   ├─ Business Logic             │
        │   └─ Authentication             │
        └────────┬───────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌────────────┐ ┌────────┐ ┌─────────┐
│ PostgreSQL │ │ Redis  │ │ Storage │
│ Database   │ │ Cache  │ │(S3/GCS) │
└────────────┘ └────────┘ └─────────┘
```

---

## Architecture Pattern

### Layered Architecture with Clean Architecture Principles

```
┌────────────────────────────────────────────────────────────────┐
│             PRESENTATION LAYER (Frontend)                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  React Components, Pages, Layouts                       │   │
│  │  └─ User Interface & UX                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
       △                                                         │
       │                                                         │
       │ HTTP/REST                                              │
       │                                                         │
       └──────────────────────────────────────┐                 │
              ┌────────────────────────────┐  │
              ▼                             │  │
        ┌─────────────────┐                │  │
        │ API Client      │                │  │
        │ (axios)         │                │  │
        └────────┬────────┘                │  │
                 │                         │  │
                 ▼                         │  │
┌────────────────────────────────────────┐  │  │
│     INTERFACE LAYER (API Layer)        │  │  │
│  ┌──────────────────────────────────┐  │  │  │
│  │  REST Endpoints                  │  │  │  │
│  │  ├─ /api/auth/*                 │  │  │  │
│  │  ├─ /api/transactions/*          │  │  │  │
│  │  ├─ /api/categories/*            │  │  │  │
│  │  ├─ /api/budgets/*               │  │  │  │
│  │  └─ /api/analytics/*             │  │  │  │
│  └──────────────────────────────────┘  │  │  │
│  ┌──────────────────────────────────┐  │  │  │
│  │  Serializers & Validation        │  │  │  │
│  │  └─ Request/Response formatting  │  │  │  │
│  └──────────────────────────────────┘  │  │  │
└────────────────────────────────────────┘  │  │
                 △                          │  │
                 │                          │  │
                 │ ORM Queries              │  │
                 │                          │  │
                 └──────────┐    ┌──────────┘  │
                            │    │             │
        ┌───────────────────┴────┼─────────────┘
        │                        │
        ▼                        │
┌────────────────────────────────┼──────────────────┐
│   BUSINESS LOGIC LAYER          │                 │
│  ┌──────────────────────────────┼────────────┐    │
│  │  Services & Use Cases         │            │    │
│  │  ├─ TransactionService        │            │    │
│  │  ├─ AnalyticsService          │            │    │
│  │  ├─ BudgetService             │            │    │
│  │  └─ NotificationService       │            │    │
│  └──────────────────────────────┼────────────┘    │
│  ┌──────────────────────────────┼────────────┐    │
│  │  Permissions & Policy         │            │    │
│  │  ├─ Authentication checks     │            │    │
│  │  └─ Authorization rules       │            │    │
│  └──────────────────────────────┼────────────┘    │
└────────────────────────────────────┼──────────────┘
                        △             │
                        │             │
                        │             ▼
                        │      ┌──────────────┐
                        │      │ Caching Logic│
                        │      │  (Redis)     │
                        │      └──────┬───────┘
                        │             │
                        │             ▼
┌────────────────────────┴──────────────────────────┐
│     DATA ACCESS LAYER (Models & Repositories)     │
│  ┌──────────────────────────────────────────────┐ │
│  │  ORM Models                                  │ │
│  │  ├─ CustomUser                               │ │
│  │  ├─ Transaction                              │ │
│  │  ├─ Category                                 │ │
│  │  ├─ Budget                                   │ │
│  │  ├─ BudgetAlert                              │ │
│  │  └─ RecurringTransaction                     │ │
│  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
                        △
                        │
                        │ SQL Queries
                        │
┌────────────────────────┴──────────────────────────┐
│  PERSISTENCE LAYER (Databases & External Storage)│
│  ┌──────────────────────────────────────────────┐ │
│  │  Primary Database                            │ │
│  │  └─ PostgreSQL 13+                           │ │
│  ├──────────────────────────────────────────────┤ │
│  │  Cache Layer                                 │ │
│  │  └─ Redis 6+                                 │ │
│  ├──────────────────────────────────────────────┤ │
│  │  File Storage (Optional)                     │ │
│  │  └─ AWS S3 / Google Cloud Storage            │ │
│  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend Stack

```
┌───────────────────────────────────────────────┐
│      FRONTEND TECHNOLOGY STACK                │
├───────────────────────────────────────────────┤
│ Runtime Environment                           │
│ ├─ Node.js 18+ LTS                            │
│ └─ npm 9.0.0+                                 │
│                                               │
│ Framework & Library                           │
│ ├─ React 18.2.0                               │
│ ├─ React Router v6.21.0                       │
│ └─ TypeScript 5.3.3                           │
│                                               │
│ Build & Development                           │
│ ├─ Vite 5.4.21                                │
│ ├─ PostCSS 8.4.0                              │
│ └─ Autoprefixer 10.4.0                        │
│                                               │
│ State Management                              │
│ ├─ Zustand 4.4.0 (lightweight)                │
│ └─ localStorage API (persistence)             │
│                                               │
│ HTTP & Networking                             │
│ ├─ Axios 1.6.0                                │
│ ├─ Request interceptors (JWT)                 │
│ └─ Response interceptors (errors)             │
│                                               │
│ Styling & UI                                  │
│ ├─ Tailwind CSS 3.4.1                         │
│ ├─ Responsive Grid/Flex                       │
│ ├─ Dark/Light Mode Support                    │
│ └─ Custom CSS variables                       │
│                                               │
│ Quality & Testing                             │
│ ├─ ESLint (code quality)                      │
│ ├─ TypeScript strict mode                     │
│ └─ IDE autocomplete & type checking           │
└───────────────────────────────────────────────┘
```

### Backend Stack

```
┌───────────────────────────────────────────────┐
│       BACKEND TECHNOLOGY STACK                │
├───────────────────────────────────────────────┤
│ Runtime Environment                           │
│ ├─ Python 3.11.x                              │
│ └─ pip (package manager)                      │
│                                               │
│ Web Framework                                 │
│ ├─ Django 5.2.11 (full-featured)              │
│ ├─ Django REST Framework 3.14.0               │
│ └─ drf-spectacular (API docs)                 │
│                                               │
│ Authentication & Security                     │
│ ├─ djangorestframework-simplejwt 5.3+         │
│ │  ├─ Access Token (1 hour)                   │
│ │  └─ Refresh Token (7 days)                  │
│ ├─ Django built-in auth                       │
│ └─ CORS handling                              │
│                                               │
│ Database & ORM                                │
│ ├─ Django ORM (built-in)                      │
│ ├─ SQLite (development)                       │
│ ├─ PostgreSQL 13+ (production)                │
│ └─ psycopg2-binary 2.9.0                      │
│                                               │
│ Caching & Sessions                            │
│ ├─ Redis 6.0+                                 │
│ ├─ django-redis 5.4.0                         │
│ └─ Session middleware                         │
│                                               │
│ Utilities                                     │
│ ├─ python-decouple (env config)               │
│ ├─ python-dateutil (date handling)            │
│ ├─ pytz (timezone support)                    │
│ └─ Pillow (image processing)                  │
│                                               │
│ Testing & Quality                             │
│ ├─ pytest 7.4.0                               │
│ ├─ pytest-django 4.5.0                        │
│ ├─ factory-boy (fixtures)                     │
│ └─ Coverage.py (test coverage)                │
│                                               │
│ Server & Deployment                           │
│ ├─ Gunicorn 21.0.0 (WSGI server)              │
│ ├─ Nginx (reverse proxy)                      │
│ └─ Whitenoise (static file serving)           │
└───────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Component Structure

```
FRONTEND DIRECTORY TREE
/frontend
├─ src/
│  ├─ App.tsx                          │ Main component, routing
│  ├─ main.tsx                         │ React entry point
│  ├─ index.css                        │ Global styles
│  │
│  ├─ api/
│  │  └─ client.ts                     │ Axios configuration
│  │     ├─ Request interceptor (JWT)
│  │     ├─ Response interceptor
│  │     └─ Error handler
│  │
│  ├─ components/
│  │  └─ Layout.tsx                    │ Main layout wrapper
│  │     ├─ Sidebar navigation
│  │     ├─ Top bar / Header
│  │     ├─ Theme toggle
│  │     └─ User menu
│  │
│  ├─ pages/                           │ Page components (routes)
│  │  ├─ LoginPage.tsx                 │ /login
│  │  ├─ RegisterPage.tsx              │ /register
│  │  ├─ DashboardPage.tsx             │ / (home)
│  │  ├─ TransactionsPage.tsx          │ /transactions
│  │  ├─ BudgetsPage.tsx               │ /budgets
│  │  ├─ AnalyticsPage.tsx             │ /analytics
│  │  ├─ SettingsPage.tsx              │ /settings
│  │  └─ ApiDocsPage.tsx               │ /docs
│  │
│  ├─ store/                           │ Zustand state management
│  │  ├─ auth.ts                       │ Auth state & actions
│  │  └─ theme.ts                      │ Theme state & toggle
│  │
│  └─ styles/                          │ Global styling
│     ├─ tailwind.config.ts            │ Tailwind configuration
│     └─ postcss.config.js             │ PostCSS plugins
│
├─ package.json                        │ Dependencies
├─ tsconfig.json                       │ TypeScript config
└─ vite.config.ts                      │ Vite build config
```

### 🔧 Backend Component Structure

```
BACKEND DIRECTORY TREE
/src
├─ manage.py                           │ Django CLI
│
├─ core/                               │ Project settings
│  ├─ settings.py                      │ Django settings
│  ├─ urls.py                          │ URL routing
│  ├─ wsgi.py                          │ Production server config
│  └─ asgi.py                          │ Async support
│
├─ transactions/                       │ Main app
│  ├─ models.py                        │ Database models
│  │  ├─ CustomUser
│  │  ├─ Category
│  │  ├─ Transaction
│  │  ├─ Budget
│  │  ├─ BudgetAlert
│  │  └─ RecurringTransaction
│  │
│  ├─ views.py                         │ ViewSets (API logic)
│  │  ├─ UserViewSet
│  │  ├─ AuthViewSet
│  │  ├─ CategoryViewSet
│  │  ├─ TransactionViewSet
│  │  ├─ BudgetViewSet
│  │  └─ AnalyticsViewSet
│  │
│  ├─ serializers.py                   │ Data serialization
│  │  ├─ UserSerializer
│  │  ├─ TransactionSerializer
│  │  ├─ CategorySerializer
│  │  └─ BudgetSerializer
│  │
│  ├─ analytics.py                     │ Business logic
│  │  ├─ monthly_summary()
│  │  ├─ category_breakdown()
│  │  ├─ savings_rate()
│  │  └─ budget_alerts()
│  │
│  ├─ urls.py                          │ App-level routing
│  ├─ admin.py                         │ Django admin
│  └─ tests.py                         │ Unit tests
│
├─ migrations/                         │ Database migrations
│  └─ 0001_initial.py, ...
│
└─ utilities/                          │ Helper functions
   ├─ decorators.py
   ├─ permissions.py
   └─ filters.py
```

---

## Data Flow & Workflows

### Authentication Flow

```
USER LOGIN WORKFLOW
═════════════════════════════════════════════════════════════════

1. USER INPUT
   ┌─────────────────────────────────┐
   │ Email/Username & Password       │
   └──────────────┬──────────────────┘
                  │
                  ▼
2. FRONTEND VALIDATION
   ┌─────────────────────────────────┐
   │ LoginPage.tsx validates form    │
   │ ├─ Email format check           │
   │ ├─ Password length check        │
   │ └─ Required fields present      │
   └──────────────┬──────────────────┘
                  │
                  ▼
3. SEND REQUEST
   ┌─────────────────────────────────┐
   │ POST /api/auth/login/           │
   │ Body: {                         │
   │   "username":"user@email.com",  │
   │   "password":"SecurePass123!"   │
   │ }                               │
   └──────────────┬──────────────────┘
                  │
                  ▼
4. BACKEND AUTHENTICATION
   ┌───────────────────────────────────────┐
   │ Django REST Framework Handler         │
   │ ├─ Check username exists              │
   │ ├─ Verify password hash (bcrypt)      │
   │ ├─ Load CustomUser instance           │
   │ └─ Generate JWT tokens                │
   └──────────────┬────────────────────────┘
                  │
                  ├─ Access Token (1 hour)
                  ├─ Refresh Token (7 days)
                  └─ User data
                  │
                  ▼
5. RESPONSE
   ┌───────────────────────────────────┐
   │ HTTP 200 OK                       │
   │ {                                 │
   │   "access":"eyJ0eXAi...",         │
   │   "refresh":"eyJ0eXAi...",        │
   │   "user":{                        │
   │     "id":"uuid",                  │
   │     "email":"user@email.com",     │
   │     "username":"user"             │
   │   }                               │
   │ }                                 │
   └──────────────┬────────────────────┘
                  │
                  ▼
6. FRONTEND STORAGE
   ┌─────────────────────────────────┐
   │ Store Tokens                    │
   │ ├─ localStorage.access_token    │
   │ ├─ localStorage.refresh_token   │
   │ └─ Zustand auth state           │
   └──────────────┬──────────────────┘
                  │
                  ▼
7. AUTHENTICATED SESSION
   ┌──────────────────────────────────────┐
   │ All subsequent API requests          │
   │ Header: Authorization: Bearer {token}│
   │                                      │
   │ Request Interceptor adds JWT header  │
   │ Response Interceptor handles:        │
   │ ├─ 200: Return data                  │
   │ ├─ 401: Refresh token & retry        │
   │ └─ Error: Handle appropriately       │
   └──────────────────────────────────────┘
```

### 📝 Create Transaction Flow

```
TRANSACTION CREATION WORKFLOW
═════════════════════════════════════════════════════════════════

1. USER INPUT
   ┌────────────────────────────────────────┐
   │ TransactionsPage Form                  │
   │ ├─ Category: "Groceries"               │
   │ ├─ Amount: 75.50                       │
   │ ├─ Type: "EXPENSE"                     │
   │ ├─ Description: "Weekly shopping"      │
   │ └─ Date: "2024-02-24"                  │
   └─────────────┬──────────────────────────┘
                 │
                 ▼
2. FRONTEND VALIDATION & STATE
   ┌────────────────────────────────┐
   │ Validate form                  │
   │ ├─ Amount > 0                  │
   │ ├─ Category selected           │
   │ ├─ Date valid & not future     │
   │ └─ Description provided        │
   └─────────────┬──────────────────┘
                 │
                 ▼
3. API REQUEST
   ┌─────────────────────────────────────────┐
   │ POST /api/transactions/                 │
   │ Header: Authorization: Bearer {token}   │
   │ Body: {                                 │
   │   "category":"uuid-abc123",             │
   │   "amount":75.50,                       │
   │   "transaction_type":"EXPENSE",         │
   │   "description":"Weekly shopping",      │
   │   "transaction_date":"2024-02-24"       │
   │ }                                       │
   └─────────────┬──────────────────────────┘
                 │
                 ▼
4. BACKEND PROCESSING
   ┌────────────────────────────────────────┐
   │ TransactionViewSet.create()             │
   │ ├─ Verify JWT token valid              │
   │ ├─ Extract user from token             │
   │ ├─ Validate serializer                 │
   │ │  ├─ Check amount > 0                 │
   │ │  ├─ Verify category exists & owner   │
   │ │  └─ Validate date format             │
   │ ├─ Save Transaction to DB              │
   │ ├─ Trigger analytics cache removal     │
   │ └─ Check budget triggers               │
   └────────────┬─────────────────────────┘
                │
    ┌───────────┴──────────────┐
    │                          │
    ▼                          ▼
5A. DATABASE SAVE       5B. BUDGET CHECK
   ┌──────────────────┐  ┌──────────────────┐
   │ PostgreSQL       │  │ Calculate usage  │
   │ INSERT into      │  │ Check thresholds │
   │ transactions()   │  │ Create alerts if │
   │                  │  │ budget exceeded  │
   └────────────────┘  └──────────────────┘
                │          │
                └──────┬───┘
                       │
                       ▼
6. RESPONSE
   ┌──────────────────────────────────────┐
   │ HTTP 201 Created                     │
   │ {                                    │
   │   "id":"uuid-new-123",               │
   │   "category_id":"uuid-abc123",       │
   │   "amount":75.50,                    │
   │   "transaction_type":"EXPENSE",      │
   │   "created_at":"2024-02-24T...",     │
   │   "is_deleted":false                 │
   │ }                                    │
   └─────────────┬──────────────────────┘
                 │
                 ▼
7. FRONTEND UPDATE
   ┌───────────────────────────────────┐
   │ ├─ Add to transaction list         │
   │ ├─ Update dashboard summary        │
   │ ├─ Refresh budget progress bars    │
   │ ├─ Invalidate analytics cache      │
   │ └─ Show success notification       │
   └───────────────────────────────────┘
```

### 📊 Analytics Data Flow

```
ANALYTICS CALCULATION WORKFLOW
═════════════════════════════════════════════════════════════════

1. USER NAVIGATION
   ┌──────────────────────────┐
   │ Click "Analytics" link   │
   └──────────┬───────────────┘
              │
              ▼
2. PARALLEL API REQUESTS
   ┌──────────────────────────────────────────┐
   │ Fetch: /api/analytics/monthly_summary/  │
   │ Fetch: /api/analytics/category_breakdown/│
   │ Fetch: /api/analytics/savings_rate/      │
   │ (3 concurrent requests)                 │
   └──────────────────────────────────────────┘
              │
              ▼
3. BACKEND QUERIES
   ┌───────────────────────────────────┐
   │ Analytics Service                 │
   │                                   │
   │ A) Monthly Summary                │
   │    SELECT SUM(amount) FROM        │
   │    transactions WHERE             │
   │    user_id=user AND               │
   │    created_at BETWEEN month START │
   │    AND month END                  │
   │    GROUP BY transaction_type      │
   │                                   │
   │ B) Category Breakdown             │
   │    SELECT category,               │
   │           SUM(amount)             │
   │    FROM transactions              │
   │    WHERE user_id=user             │
   │    GROUP BY category              │
   │    ORDER BY SUM DESC              │
   │                                   │
   │ C) Savings Rate                   │
   │    Calculate: (income - expense)  │
   │    / income * 100                 │
   └───────────────────────────────────┘
              │
              ▼
4. CACHE CHECK
   ┌──────────────────────────────┐
   │ Check Redis Cache             │
   │ ├─ Cache key: "user_analytics"│
   │ ├─ TTL: 300 seconds (5 min)   │
   │ ├─ Hit: Return cached data    │
   │ └─ Miss: Execute query        │
   └──────────────────────────────┘
              │
              ▼
5. RESPONSE
   ┌──────────────────────────────────────┐
   │ HTTP 200 OK (all 3 requests)         │
   │ [                                    │
   │   {monthly_income, monthly_expense}, │
   │   [{category, amount, %}, ...],      │
   │   {savings_rate, recommendation}     │
   │ ]                                    │
   └──────────────┬───────────────────────┘
                  │
                  ▼
6. FRONTEND RENDERING
   ┌────────────────────────────────┐
   │ AnalyticsPage.tsx               │
   │ ├─ Line chart (monthly trends)  │
   │ ├─ Pie chart (category split)   │
   │ ├─ KPI cards (totals, rates)    │
   │ └─ Recommendations              │
   └────────────────────────────────┘
```

---

## Data Models

### Entity Relationship Diagram

```
┌──────────────────────────┐
│     CustomUser           │
├──────────────────────────┤
│ id (UUID, PK)            │
│ username (unique)        │
│ email (unique)           │
│ password_hash            │
│ first_name               │
│ last_name                │
│ currency_preference      │
│ profile_image (nullable) │
│ email_verified           │
│ created_at               │
│ updated_at               │
└────────────┬─────────────┘
             │ (1:N)
             │ has many
             │
    ┌────────┴────────┬──────────────┐
    │                 │              │
    ▼                 ▼              ▼
┌────────────┐  ┌────────────┐  ┌──────────────┐
│ Category   │  │Transaction │  │   Budget     │
├────────────┤  ├────────────┤  ├──────────────┤
│ id (UUID)  │  │ id (UUID)  │  │ id (UUID)    │
│ user_id    │◄─┤ user_id    │  │ user_id      │
│ name       │  │ category_id├─►│ category_id  │
│ type       │  │ amount     │  │ monthly_limit│
│ color      │  │ type       │  │ period       │
│ icon       │  │ description│  │ threshold    │
│ is_default │  │ date       │  │ is_active    │
│ created_at │  │ is_deleted │  │ created_at   │
│ updated_at │  │ deleted_at │  │ updated_at   │
└────────────┘  │ created_at │  └──────┬───────┘
                │ updated_at │         │ (1:N)
                └────────────┘         │ has many
                                       ▼
                            ┌──────────────────┐
                            │  BudgetAlert     │
                            ├──────────────────┤
                            │ id (UUID)        │
                            │ budget_id (FK)   │
                            │ user_id (FK)     │
                            │ alert_level      │
                            │ message          │
                            │ is_read          │
                            │ created_at       │
                            └──────────────────┘

┌────────────────────────────┐
│ RecurringTransaction       │
├────────────────────────────┤
│ id (UUID)                  │
│ user_id (FK)               │
│ category_id (FK)           │
│ amount (Decimal)           │
│ type (INCOME/EXPENSE)      │
│ description                │
│ frequency (DAILY/WEEKLY)   │
│ start_date                 │
│ end_date (nullable)        │
│ next_due_date              │
│ is_active                  │
│ created_at                 │
└────────────────────────────┘
```

---

## Security Architecture

### Authentication & Authorization

```
AUTHENTICATION FLOW
═════════════════════════════════════════════════════════════════

1. User Registration
   ├─ Password validation (min 8 chars, uppercase, digit, special)
   ├─ Hash password with PBKDF2-SHA256
   ├─ Create CustomUser record
   └─ Send verification email (optional)

2. User Login
   ├─ Lookup user by username/email
   ├─ Verify password hash
   ├─ Generate JWT access token (1 hour expiry)
   ├─ Generate JWT refresh token (7 day expiry)
   └─ Return both tokens

3. Token Usage
   ├─ Add to Authorization header: "Bearer {access_token}"
   ├─ Include in all subsequent API requests
   └─ Request interceptor adds header automatically

4. Token Refresh
   ├─ When access token expires (401 response)
   ├─ Send POST /api/auth/refresh/ with refresh token
   ├─ Backend validates refresh token
   ├─ Generate new access token
   └─ Request interceptor auto-retries original request

5. Token Validation
   ├─ Signature verification (HS256)
   ├─ Expiry check (not expired)
   ├─ User blacklist verification
   └─ Scope/permission validation

AUTHORIZATION FLOW
═════════════════════════════════════════════════════════════════

1. Permission Classes
   ├─ IsAuthenticated: User must be logged in
   ├─ IsAdminUser: User must be staff/superuser
   └─ Custom permissions: (future expansion)

2. Object-Level Permissions
   ├─ User isolation on all viewsets
   ├─ filter_queryset() enforces: filter(user=request.user)
   ├─ Users can only access their own data
   └─ Prevents cross-user data access

3. Rate Limiting
   ├─ Anonymous users: 100 requests/hour
   ├─ Authenticated users: 1000 requests/hour
   └─ Throttle limiting via DRF

4. CORS Policy
   ├─ Allowed origins: localhost:3000, yourdomain.com
   ├─ Allowed methods: GET, POST, PUT, DELETE, PATCH
   ├─ Allowed headers: Content-Type, Authorization
   └─ Credentials: Included with requests

DATA SECURITY
═════════════════════════════════════════════════════════════════

1. Password Security
   ├─ PBKDF2-SHA256 hashing (Django default)
   ├─ Salt: 120-bit random per password
   ├─ Validation rules enforced
   └─ Never logged or exposed

2. Sensitive Data Protection
   ├─ Personal Info (PII): HTTPS encrypted in transit
   ├─ Token Storage: localStorage (XSS vulnerable)
   │  └─ Consider: HttpOnly cookies for production
   ├─ No sensitive data in logs
   └─ Sanitized error messages

3. Database Security
   ├─ Parameterized queries (Django ORM)
   ├─ SQL injection prevention: Built-in
   ├─ Connection encryption: PostgreSQL SSL ready
   ├─ Access control: Database user roles
   └─ Automatic backups: Required for production

4. API Security
   ├─ HTTPS only: Required for production
   ├─ Request validation: Serializers validate all input
   ├─ Response sanitization: No sensitive in responses
   ├─ Security headers: HSTS, X-Content-Type-Options, etc
   └─ CSRF protection: SameSite cookie flag
```

---

## Performance & Scalability

### Caching Strategy

```
MULTI-LAYER CACHING ARCHITECTURE
═════════════════════════════════════════════════════════════════

Frontend Cache:
  ├─ localStorage: JWT tokens, user info
  └─ In-memory: Zustand state, recent data

HTTP Cache:
  ├─ Cache-Control headers
  ├─ ETag validation
  └─ Conditional requests (If-None-Match)

API Response Cache:
  └─ See Redis cache below

Redis Cache (Server-side):
  ├─ Key: analytics:user_id:month
  ├─ TTL: 300 seconds (5 minutes)
  ├─ Size: <100MB per user
  ├─ Items cached:
  │  ├─ Monthly summaries
  │  ├─ Category breakdowns
  │  ├─ Budget status
  │  ├─ User session data
  │  └─ Frequently accessed reports

Database Query Cache:
  ├─ PostgreSQL query execution cache
  ├─ Connection pooling
  └─ Index optimization

Cache Invalidation:
  On transaction create/update:
    ├─ Invalidate: analytics:user_id:*
    ├─ Invalidate: budget_status:user_id
    └─ Keep: user profile cache

TTL by Data Type:
  ├─ Transactions: 60s (frequently changing)
  ├─ Analytics: 300s (computed)
  ├─ Budgets: 120s (depends on transactions)
  └─ User profile: 3600s (rarely changes)
```

### Database Optimization

```
INDEXING STRATEGY
═════════════════════════════════════════════════════════════════

Transaction Indexes:
  ├─ (user_id, transaction_date DESC)     │ Most queries
  ├─ (user_id, is_deleted)                 │ Soft delete
  ├─ (category_id, user_id)                │ Category filter
  └─ (user_id, created_at DESC)            │ Recent items

Budget Indexes:
  ├─ (user_id, category_id)                │ Budget lookup
  └─ (user_id, is_active)                  │ Active only

Category Indexes:
  └─ (user_id)                             │ User categories

User Indexes:
  ├─ (email)                               │ Login lookup
  ├─ (username)                            │ Search
  └─ (created_at DESC)                     │ Sorting

QUERY OPTIMIZATION RULES
═════════════════════════════════════════════════════════════════

Avoid:
  ❌ SELECT * (use specific fields)
  ❌ N+1 queries (no select_related/prefetch_related)
  ❌ Unfiltered queries (must filter by user)
  ❌ LIKE '%pattern%' (use full-text search)
  ❌ Multiple lookups per request

Good Practices:
  ✓ select_related() for FK (1:1, foreign key)
  ✓ prefetch_related() for reverse FK (1:N)
  ✓ Filter by user first (WHERE user_id=...)
  ✓ Use database aggregation (SUM, COUNT, AVG)
  ✓ Paginate large results (20 items/page)
  ✓ Cache computed fields and reports
  ✓ Use indexes for filter columns

Example:
  transactions = (
    Transaction.objects
    .filter(user=request.user, is_deleted=False)
    .select_related('category')
    .only('id','amount','category_id','created_at')
    .order_by('-transaction_date')[:20]
  )
```

---

## Deployment Architecture

### Development Environment

```
DEVELOPMENT SETUP
═════════════════════════════════════════════════════════════════

Frontend              Backend          Database
────────────────────────────────────────────────────

npm run dev       Django dev server    SQLite3 / Redis
  ↓                    ↓                  ↓
Vite dev server    localhost:8000    db.sqlite3
localhost:3000        ↓              port 6379
                  Watchdog reloads
                  on file change
                  
Proxy Configuration:
  API requests to /api/* → localhost:8000/api

Development Tools:
  ├─ Django admin: localhost:8000/admin
  ├─ API docs: localhost:8000/api/docs/
  ├─ ReDoc: localhost:8000/api/redoc/
  ├─ Swagger: localhost:8000/api/swagger/
  └─ Devtools: Browser inspection

Development Features:
  ├─ Hot module reloading (frontend)
  ├─ Auto-reload on code change (backend)
  ├─ Detailed error messages
  ├─ Debug toolbar (optional)
  └─ Mock email backend
```

### Production Environment

```
PRODUCTION DEPLOYMENT
═════════════════════════════════════════════════════════════════

                    ┌──────────────────┐
                    │   Users/Clients  │
                    └────────┬─────────┘
                             │
                             │ HTTPS
                             ▼
                    ┌──────────────────┐
                    │  Load Balancer   │
                    │ (Nginx/HAProxy)  │
                    └────────┬──────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │ Frontend │        │ Backend  │        │ Backend  │
    │Instance 1│        │Instance 1│        │Instance 2│
    │(Nginx)   │        │(Gunicorn)│        │(Gunicorn)│
    └────┬─────┘        └────┬─────┘        └────┬─────┘
         │                   │                    │
         │ Static files      │ API requests       │
         │ (cached)          │ (processed)        │
         │                   └──────────┬─────────┘
         │                              │
         │                   ┌──────────┴──────────┐
         │                   │                     │
         │                   ▼                     ▼
         │            ┌──────────────┐     ┌─────────────┐
         │            │ PostgreSQL   │     │   Redis     │
         │            │  Database    │     │   Cache     │
         │            │ (Primary)    │     │  (Sessions) │
         │            └──────────────┘     └─────────────┘
         │                   │
         │                   ▼
         │            ┌──────────────┐
         │            │   Backups    │
         │            │  (Daily)     │
         │            └──────────────┘
         │
         ▼
    ┌──────────────────┐
    │  CDN / Storage   │
    │ (S3/GCS/Etc)     │
    │ (Static Files)   │
    └──────────────────┘

CONTAINER DEPLOYMENT
────────────────────
Docker Services:
  ├─ frontend-service (Node + Nginx)
  ├─ backend-service (Python + Gunicorn)
  ├─ postgres-db (PostgreSQL 13+)
  ├─ redis-cache (Redis 6+)
  └─ nginx-reverse-proxy (Latest)

Kubernetes Ready:
  ├─ Dockerfile per service
  ├─ ConfigMaps for non-sensitive config
  ├─ Secrets for API keys/passwords
  ├─ PersistentVolumes for data
  ├─ Services for networking
  ├─ Ingress for external access
  └─ HPA for auto-scaling
```

---

## API Endpoints Reference

### Authentication
```
POST   /api/auth/login/              │ User login
POST   /api/auth/register/           │ User registration
POST   /api/auth/refresh/            │ Refresh access token
POST   /api/auth/logout/             │ Logout (optional)
```

### Users
```
GET    /api/users/                   │ List users (admin)
GET    /api/users/{id}/              │ Get user details
GET    /api/users/me/                │ Current user info
PUT    /api/users/{id}/              │ Update user
DELETE /api/users/{id}/              │ Delete account
POST   /api/users/change_password/   │ Change password
```

### Transactions
```
GET    /api/transactions/            │ List transactions
POST   /api/transactions/            │ Create transaction
GET    /api/transactions/{id}/       │ Get details
PUT    /api/transactions/{id}/       │ Update transaction
DELETE /api/transactions/{id}/       │ Soft delete
GET    /api/transactions/summary/    │ Summary stats
POST   /api/transactions/bulk/       │ Bulk import
```

### Categories
```
GET    /api/categories/              │ List categories
POST   /api/categories/              │ Create category
GET    /api/categories/{id}/         │ Get category
PUT    /api/categories/{id}/         │ Update category
DELETE /api/categories/{id}/         │ Delete category
GET    /api/categories/aggregate/    │ Spending breakdown
```

### Budgets
```
GET    /api/budgets/                 │ List budgets
POST   /api/budgets/                 │ Create budget
GET    /api/budgets/{id}/            │ Get budget
PUT    /api/budgets/{id}/            │ Update budget
DELETE /api/budgets/{id}/            │ Delete budget
GET    /api/budgets/summary/         │ Usage summary
GET    /api/budgets/alerts/          │ Budget alerts
```

### Analytics
```
GET    /api/analytics/dashboard/     │ Dashboard data
GET    /api/analytics/monthly/       │ Monthly trends
GET    /api/analytics/breakdown/     │ Category breakdown
GET    /api/analytics/savings/       │ Savings rate
GET    /api/analytics/trends/        │ Year-over-year
GET    /api/analytics/export/        │ Export (CSV/PDF)
```

---

## Testing Strategy

### Test Structure

```
PROJECT TESTING HIERARCHY
═════════════════════════════════════════════════════════════════

Unit Tests (Fast, Isolated)
  ├─ models_test.py             │ Model behavior
  ├─ serializers_test.py        │ Data validation
  ├─ utils_test.py              │ Utility functions
  └─ analytics_test.py           │ Calculations

Integration Tests (API)
  ├─ test_auth_flow.py          │ Full login workflow
  ├─ test_transaction_crud.py    │ Create/read/update/delete
  ├─ test_permissions.py        │ Authorization checks
  ├─ test_analytics.py          │ Report generation
  └─ test_budgets.py            │ Budget logic

End-to-End Tests
  ├─ test_user_journey.py       │ Complete workflows
  ├─ test_workflows.py          │ Cross-feature tests
  └─ shell_test_scripts/        │ User scenario tests

Performance Tests
  ├─ load_test.py               │ Concurrent loads
  └─ query_performance.py       │ Database speed
```

### Running Tests

```
All tests:
  pytest

Unit tests only:
  pytest tests/unit/ -v

Integration tests:
  pytest tests/integration/ -v

With coverage:
  pytest --cov=src/transactions tests/

Single file:
  pytest tests/test_models.py -v

Single function:
  pytest tests/test_models.py::TestTransaction::test_create -v

By name pattern:
  pytest -k "test_create" -v

Show output:
  pytest -s tests/test_models.py

Coverage targets:
  ├─ Models: 95%+
  ├─ Views: 85%+
  ├─ Serializers: 90%+
  └─ Overall: 80%+
```

---

## Architecture Decision Records (ADRs)

### ADR-001: Layered Architecture
**Decision**: Organize code into presentation, API, business logic, and data access layers.  
**Rationale**: Clear separation of concerns, easier testing, improved maintainability.

### ADR-002: JWT Authentication
**Decision**: Use stateless JWT tokens (access + refresh pair).  
**Rationale**: Supports mobile, scalable, CORS-friendly, standard approach.

### ADR-003: Soft Delete Pattern
**Decision**: Mark deleted with flag, don't hard delete transactions.  
**Rationale**: Preserve audit trail, enable data recovery, maintain referential integrity.

### ADR-004: Redis Caching
**Decision**: Cache analytics with 5-minute TTL in Redis.  
**Rationale**: Reduce DB load, improve response time, cost-effective.

### ADR-005: PostgreSQL for Production
**Decision**: PostgreSQL required for production, SQLite for dev only.  
**Rationale**: ACID compliance, scalability, reliability, backup support.

---

## Conclusion

This architecture provides:

✅ **Scalability** - Horizontal scaling, load balancing, containerization  
✅ **Security** - JWT auth, CORS, rate limiting, encrypted passwords  
✅ **Performance** - Multi-layer caching, optimized queries, CDN ready  
✅ **Maintainability** - Clean layers, documented patterns, clear structure  
✅ **Reliability** - Comprehensive testing, error handling, monitoring  
✅ **Flexibility** - Easily extensible, modular design, technology-agnostic

---

**For more information:**
- [Setup Instructions](./SETUP.md)
- [Quick Start Guide](./QUICKSTART.md)
- [API Documentation](./docs/api_documentation.md)
- [Testing Guide](./tests/TESTING.md)
