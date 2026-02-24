import axios from 'axios'

// Direct relative path - Vite proxy will handle routing
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

// Handle responses
api.interceptors.response.use(
  (response) => {
    console.log(`✓ ${response.status} response from ${response.config.url}`)
    return response
  },
  (error) => {
    console.error(`✗ Error:`, {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
    })
    return Promise.reject(error)
  }
)

// Export API functions
export const authAPI = {
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login/', data),
  register: (data: { email: string; username: string; password: string; password_confirm: string; first_name?: string; last_name?: string }) =>
    api.post('/auth/register/', data),
  getCurrentUser: () =>
    api.get('/users/me/'),
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },
}

export const transactionAPI = {
  list: (params?: Record<string, any>) =>
    api.get('/transactions/', { params }),
  create: (data: Record<string, any>) =>
    api.post('/transactions/', data),
  update: (id: string, data: Record<string, any>) =>
    api.put(`/transactions/${id}/`, data),
  delete: (id: string) =>
    api.delete(`/transactions/${id}/`),
  summary: () =>
    api.get('/transactions/summary/'),
}

export const categoryAPI = {
  list: (params?: Record<string, any>) =>
    api.get('/categories/', { params }),
  create: (data: Record<string, any>) =>
    api.post('/categories/', data),
  update: (id: string, data: Record<string, any>) =>
    api.put(`/categories/${id}/`, data),
  delete: (id: string) =>
    api.delete(`/categories/${id}/`),
}

export const budgetAPI = {
  list: (params?: Record<string, any>) =>
    api.get('/budgets/', { params }),
  create: (data: Record<string, any>) =>
    api.post('/budgets/', data),
  update: (id: string, data: Record<string, any>) =>
    api.put(`/budgets/${id}/`, data),
  delete: (id: string) =>
    api.delete(`/budgets/${id}/`),
  summary: () =>
    api.get('/budgets/summary/'),
}

export const analyticsAPI = {
  dashboard: () =>
    api.get('/dashboard/'),
  monthlySummary: (params?: Record<string, any>) =>
    api.get('/analytics/monthly_summary/', { params }),
  categoryBreakdown: (params?: Record<string, any>) =>
    api.get('/analytics/category_breakdown/', { params }),
  savingsRate: (params?: Record<string, any>) =>
    api.get('/analytics/savings_rate/', { params }),
  comparison: (params?: Record<string, any>) =>
    api.get('/analytics/comparison/', { params }),
}

export default api