# Financial Monitoring & Analytics Tool - Frontend

React + TypeScript frontend for the Financial Monitoring & Analytics Tool.

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first styling
- **Chart.js** - Data visualization

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.ts          # Axios API client with interceptors
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── TransactionsPage.tsx
│   │   ├── BudgetsPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── components/
│   │   └── Layout.tsx          # Main app layout with sidebar
│   ├── store/
│   │   └── auth.ts            # Zustand auth store
│   ├── App.tsx                # Main app component with routing
│   ├── main.tsx               # React DOM entry point
│   └── index.css              # Tailwind + custom styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .env.example
├── .eslintrc.cjs
└── .prettierrc
```

## Getting Started

### Prerequisites

- **Node.js** >= 16
- **npm** or **yarn**

### Installation

1. **Install dependencies:**

```bash
cd frontend
npm install
```

2. **Create environment file:**

```bash
cp .env.example .env.local
```

Update `VITE_API_URL` if your backend is running on a different port:

```env
VITE_API_URL=http://localhost:8000/api
```

3. **Start development server:**

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Output is in the `dist/` directory. Deploy this to your hosting provider.

## Features

### 🔐 Authentication
- User registration and login
- JWT token management with auto-refresh
- Protected routes with automatic redirect
- Secure token storage in localStorage

### 📊 Dashboard
- Quick overview of financial summary
- Income vs. expense breakdown
- Monthly spending snapshot
- Budget status at a glance
- Quick action buttons

### 💳 Transactions
- List all transactions with filtering
- Create new transactions with category selection
- Soft delete with recovery option
- View transaction details
- Type indicators (Expense/Income/Transfer)
- Bulk import CSV (ready to implement)

### 💰 Budgets
- Create monthly budgets by category
- Real-time budget progress tracking
- Visual progress bars with color coding
- Budget overrun alerts
- Budget status indicators

### 📈 Analytics
- Monthly income and expense summary
- Spending by category breakdown
- Savings rate calculation
- Month-over-month comparisons (ready to implement)
- Downloadable reports (ready to implement)

### ⚙️ Settings
- Profile information view
- Currency preference selection
- Theme selection (light/dark/auto)
- Notification preferences
- Security settings (password change, 2FA)
- Data export and backup options
- Account deletion (with warnings)

## API Integration

### Authentication Flow

```typescript
// Login
await authAPI.login({ username, password })
// Stores JWT tokens in localStorage
// Includes auto-refresh on token expiry

// Register
await authAPI.register(userData)

// Logout
authAPI.logout()
```

### Protected Requests

All API requests automatically include:
- `Authorization: Bearer {access_token}` header
- Automatic token refresh on 401 response
- Request timeout configuration
- Error handling with user feedback

### API Endpoints Used

**Authentication:**
- `POST /auth/register/`
- `POST /auth/login/`
- `POST /auth/refresh/`

**Transactions:**
- `GET /transactions/`
- `POST /transactions/`
- `PUT /transactions/{id}/`
- `DELETE /transactions/{id}/`
- `POST /transactions/bulk_import/`
- `POST /transactions/restore/`
- `GET /transactions/summary/`

**Categories:**
- `GET /categories/`
- `POST /categories/`
- `PUT /categories/{id}/`
- `DELETE /categories/{id}/`

**Budgets:**
- `GET /budgets/`
- `POST /budgets/`
- `PUT /budgets/{id}/`
- `DELETE /budgets/{id}/`
- `GET /budgets/summary/`

**Analytics:**
- `GET /analytics/monthly-summary/`
- `GET /analytics/category-breakdown/`
- `GET /analytics/savings-rate/`
- `GET /analytics/comparisons/`
- `GET /dashboard/`

## State Management

**Zustand Store** (`src/store/auth.ts`):
```typescript
const authStore = useAuthStore()

// Login/Register
await authStore.login(username, password)
await authStore.register(userData)

// Logout
authStore.logout()

// Access
authStore.user          // Current user object
authStore.isAuthenticated  // Boolean
authStore.isLoading     // During API calls
authStore.error         // Error messages
```

## Styling

### Tailwind CSS
- Utility-first CSS framework
- Custom components in `index.css` (.card, .btn-*, .badge, etc.)
- Responsive design out of the box
- Dark mode ready

### Custom Classes
```css
.card { /* White container with shadow */ }
.btn-primary { /* Blue button */ }
.btn-secondary { /* Gray button */ }
.btn-danger { /* Red button */ }
.input { /* Form input with focus styles */ }
.badge { /* Inline badge elements */ }
```

## Development Tips

### Debugging
- Use React DevTools Browser Extension
- Enable Redux DevTools for Zustand
- Check Network tab for API requests
- Console logs for component lifecycle

### Code Quality
```bash
# Lint code
npm run lint

# Check types
npm run type-check

# Format code
npm run format
```

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/Layout.tsx`
4. Import API endpoints from `src/api/client.ts`

### Adding New API Calls
1. Add endpoints to `src/api/client.ts`
2. Use in components with error handling
3. Show loading state during requests
4. Display error messages to user

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000/api` | Backend API base URL |
| `VITE_ENABLE_ANALYTICS` | `false` | Enable analytics tracking |
| `VITE_DEBUG` | `false` | Enable debug logging |

## Performance Optimizations

- Code splitting with React Router
- Lazy loading of components
- Image optimization with Vite
- Browser caching with proper headers
- Minification in production build

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Drag and drop 'dist' folder to Netlify
```

### Docker

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

### Traditional Server

1. Run `npm run build`
2. Copy `dist/` to web server (Nginx, Apache, etc.)
3. Configure server to route all requests to `index.html`

## Troubleshooting

### API Connection Issues
- Verify backend is running on `http://localhost:8000`
- Check `VITE_API_URL` in `.env.local`
- Check browser console for CORS errors
- Verify JWT tokens in localStorage

### Build Issues
- Delete `node_modules/` and `dist/`
- Run `npm install` again
- Check Node version is >= 16
- Clear Vite cache: `rm -rf .vite`

### Styling Issues
- Run `npm run build` to regenerate Tailwind classes
- Check `tailwind.config.ts` content paths
- Clear browser cache (Ctrl+Shift+R)

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Follow code style: `npm run format`
3. Run linter: `npm run lint`
4. Commit changes: `git commit -m "feat: description"`
5. Push and create pull request

## License

This project is part of Financial Monitoring & Analytics Tool. All rights reserved.

## Support

For issues and questions:
- Check existing GitHub issues
- Create new issue with details
- Contact support@finantrack.com

---

**Ready to start?**
```bash
npm install && npm run dev
```

Visit http://localhost:3000 and login with your credentials!
