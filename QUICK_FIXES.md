# Quick Reference: Component Issues & Fixes

## 🔴 CRITICAL: Quick Action Buttons Not Working

**File**: `frontend/src/pages/DashboardPage.tsx` (Lines 155-205)

**Problem**: 4 buttons with NO onClick handlers:
```tsx
// BROKEN - does nothing when clicked
<button className="group relative ...">
  <span>⊕</span> Add Transaction
</button>
<button className="group relative ...">
  <span>⊕</span> Create Budget
</button>
<button className="group relative ...">
  <span>📊</span> Analytics
</button>
<button className="group relative ...">
  <span>↑</span> Import
</button>
```

**Fix Required**:
```tsx
import { useNavigate } from 'react-router-dom'

// Inside DashboardPage component:
const navigate = useNavigate()

// Update buttons:
<button 
  onClick={() => navigate('/transactions')}
  className="..."
>
  <span>⊕</span> Add Transaction
</button>

<button 
  onClick={() => navigate('/budgets')}
  className="..."
>
  <span>⊕</span> Create Budget
</button>

<button 
  onClick={() => navigate('/analytics')}
  className="..."
>
  <span>📊</span> Analytics
</button>

<button 
  onClick={() => {/* Open import modal */}}
  className="..."
>
  <span>↑</span> Import
</button>
```

---

## 🟢 WORKING: Category Loading

### TransactionsPage.tsx ✓
- **Path**: `frontend/src/pages/TransactionsPage.tsx`
- **Lines**: 31-48 (useEffect)
- **Status**: Categories correctly loaded from `/api/categories/`
- **Dropdown**: Lines 142-154
- **Issue**: None - working as expected

### BudgetsPage.tsx ✓
- **Path**: `frontend/src/pages/BudgetsPage.tsx`
- **Lines**: 27-46 (useEffect)
- **Status**: Categories correctly loaded from `/api/categories/`
- **Dropdown**: Lines 99-107
- **Issue**: None - working as expected

### API Endpoint
```
GET /api/categories/
Returns: { id, name, user, created_at }
Filters: User's own categories only
```

---

## 🟡 MEDIUM: Form Validation Missing

### Issue
No validation before submission in:
- TransactionsPage.tsx (Lines 61-78)
- BudgetsPage.tsx (Lines 48-72)

### What's Missing
- Category selection validation (can't be empty string)
- Amount validation (must be > 0)
- Date validation
- Budget limit validation (can't be 0)

### Quick Fix Example
```tsx
const handleAddTransaction = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // Add validation:
  if (!formData.category) {
    setError('Please select a category')
    return
  }
  if (!formData.amount || parseFloat(formData.amount) <= 0) {
    setError('Amount must be greater than 0')
    return
  }
  
  // ... rest of submission
}
```

---

## 🟢 WORKING: Data Fetching

### Analytics Page ✓
- **File**: `AnalyticsPage.tsx` (Lines 15-33)
- **Endpoints**:
  - `GET /api/analytics/monthly_summary/`
  - `GET /api/analytics/category_breakdown/`
  - `GET /api/analytics/savings_rate/`
- **Status**: ✓ Fetches and displays correctly

### Dashboard Page ✓
- **File**: `DashboardPage.tsx` (Lines 28-48)
- **Endpoints**:
  - `GET /api/transactions/summary/`
  - `GET /api/budgets/summary/`
- **Status**: ✓ Fetches and displays correctly
- **Except**: Quick action buttons not working (see above)

---

## Summary Table

| Component | Feature | Status | Location | Fix Effort |
|-----------|---------|--------|----------|-----------|
| Dashboard | Quick Action Buttons | ❌ Broken | Lines 155-205 | 10 min |
| Transactions | Category Dropdown | ✓ Working | Lines 142-154 | - |
| Budgets | Category Dropdown | ✓ Working | Lines 99-107 | - |
| Analytics | Data Fetching | ✓ Working | Lines 15-33 | - |
| Dashboard | Data Fetching | ✓ Working | Lines 28-48 | - |
| Forms | Validation | ⚠️ Missing | Multiple | 30 min |

---

## Implementation Priority

**ASAP (Next 15 minutes)**:
1. Add onClick handlers to quick action buttons

**Soon (Next hour)**:
2. Add form validation
3. Add loading states during submission

**Later (Nice to have)**:
4. Standardize API response handling
5. Add data null-check guards
