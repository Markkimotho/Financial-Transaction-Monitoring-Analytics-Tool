import { useThemeStore } from '@/store/theme'
import { Code2, Copy, Check } from 'lucide-react'
import { useState } from 'react'

const ApiDocsPage = () => {
  const isDark = useThemeStore((state) => state.isDark)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const endpoints = [
    {
      id: 'auth-login',
      method: 'POST',
      path: '/api/auth/login/',
      description: 'Authenticate user and get JWT tokens',
      body: JSON.stringify({ username: 'testuser', password: 'testpass123' }, null, 2)
    },
    {
      id: 'auth-register',
      method: 'POST',
      path: '/api/auth/register/',
      description: 'Register a new user',
      body: JSON.stringify({
        email: 'user@example.com',
        username: 'username',
        password: 'securepassword123',
        password_confirm: 'securepassword123'
      }, null, 2)
    },
    {
      id: 'auth-refresh',
      method: 'POST',
      path: '/api/auth/refresh/',
      description: 'Refresh JWT access token',
      body: JSON.stringify({ refresh: 'refresh_token_here' }, null, 2)
    },
    {
      id: 'users-me',
      method: 'GET',
      path: '/api/users/me/',
      description: 'Get current user profile (requires authentication)',
      body: null
    },
    {
      id: 'transactions-list',
      method: 'GET',
      path: '/api/transactions/',
      description: 'List all user transactions (requires authentication)',
      body: null
    },
    {
      id: 'transactions-create',
      method: 'POST',
      path: '/api/transactions/',
      description: 'Create a new transaction',
      body: JSON.stringify({
        type: 'EXPENSE',
        amount: '50.00',
        description: 'Lunch',
        category_id: 'category-uuid'
      }, null, 2)
    },
    {
      id: 'categories-list',
      method: 'GET',
      path: '/api/categories/',
      description: 'List all user categories',
      body: null
    },
    {
      id: 'budgets-list',
      method: 'GET',
      path: '/api/budgets/',
      description: 'List all user budgets',
      body: null
    },
    {
      id: 'budgets-create',
      method: 'POST',
      path: '/api/budgets/',
      description: 'Create a new budget',
      body: JSON.stringify({
        name: 'Monthly Budget',
        category_id: 'category-uuid',
        amount: '1000.00',
        start_date: '2026-02-24',
        alert_type: 'WARNING'
      }, null, 2)
    },
    {
      id: 'analytics-monthly',
      method: 'GET',
      path: '/api/analytics/monthly_summary/',
      description: 'Get monthly financial summary',
      body: null
    },
    {
      id: 'analytics-breakdown',
      method: 'GET',
      path: '/api/analytics/category_breakdown/',
      description: 'Get expenses by category',
      body: null
    },
    {
      id: 'analytics-savings',
      method: 'GET',
      path: '/api/analytics/savings_rate/',
      description: 'Get savings rate analytics',
      body: null
    }
  ]

  return (
    <div className={`min-h-screen transition-colors ${
      isDark ? 'bg-black text-white' : 'bg-white text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Code2 className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <h1 className="text-4xl font-bold">API Documentation</h1>
          </div>
          <p className={isDark ? 'text-gray-400 text-lg' : 'text-slate-600 text-lg'}>
            Complete reference for the FinTrack API endpoints
          </p>
        </div>

        {/* Authentication Info */}
        <div className={`mb-12 p-6 rounded-lg border ${
          isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
            Authentication
          </h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Most endpoints require authentication via JWT tokens. Send the access token in the <code className={`px-2 py-1 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>Authorization</code> header:
          </p>
          <div className={`p-4 rounded font-mono text-sm ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
            Authorization: Bearer {'<access_token>'}
          </div>
        </div>

        {/* Base URL */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Base URL</h2>
          <div className={`p-4 rounded-lg border font-mono flex items-center justify-between ${
            isDark ? 'bg-gray-900 border-gray-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <span>http://localhost:8000/api</span>
            <button
              onClick={() => copyToClipboard('http://localhost:8000/api', 'base-url')}
              className={`p-2 rounded transition-colors ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-slate-200'
              }`}
            >
              {copiedId === 'base-url' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Endpoints */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Endpoints</h2>
          <div className="grid gap-6">
            {endpoints.map((endpoint) => (
              <div
                key={endpoint.id}
                className={`rounded-lg border p-6 transition-colors ${
                  isDark ? 'bg-gray-900 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                {/* Method and Path */}
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <span className={`px-3 py-1 rounded font-semibold text-sm ${
                    endpoint.method === 'GET' ? (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700') :
                    endpoint.method === 'POST' ? (isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700') :
                    endpoint.method === 'PUT' ? (isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700') :
                    isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className={`flex-1 font-mono text-sm p-2 rounded ${
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    {endpoint.path}
                  </code>
                  <button
                    onClick={() => copyToClipboard(endpoint.path, endpoint.id)}
                    className={`p-2 rounded transition-colors ${
                      isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                    }`}
                  >
                    {copiedId === endpoint.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>

                {/* Description */}
                <p className={`mb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {endpoint.description}
                </p>

                {/* Request Body */}
                {endpoint.body && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2 text-sm">Request Body:</h4>
                    <div className={`p-4 rounded font-mono text-xs overflow-x-auto ${
                      isDark ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <pre className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        {endpoint.body}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Codes */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Common HTTP Status Codes</h2>
          <div className="grid gap-4">
            {[
              { code: 200, message: 'OK - Request successful' },
              { code: 201, message: 'Created - Resource created successfully' },
              { code: 400, message: 'Bad Request - Invalid parameters' },
              { code: 401, message: 'Unauthorized - Authentication required' },
              { code: 403, message: 'Forbidden - Insufficient permissions' },
              { code: 404, message: 'Not Found - Resource not found' },
              { code: 500, message: 'Internal Server Error' }
            ].map((error) => (
              <div
                key={error.code}
                className={`p-4 rounded-lg border flex items-center gap-4 ${
                  error.code >= 400 ? (isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200') :
                  isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'
                }`}
              >
                <span className="font-bold text-lg w-12 text-center">{error.code}</span>
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{error.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiDocsPage
