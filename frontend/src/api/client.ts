import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Response interceptor to handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refresh_token')

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          })
          localStorage.setItem('access_token', data.access)
          apiClient.defaults.headers.Authorization = `Bearer ${data.access}`
          return apiClient(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  register: (data: { email: string; username: string; password: string; password_confirm: string; first_name?: string; last_name?: string }) =>
    apiClient.post('/auth/register/', data),
  login: (data: { username: string; password: string }) =>
    apiClient.post('/auth/login/', data),
  getCurrentUser: () =>
    apiClient.get('/users/me/'),
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },
}

export const transactionAPI = {
  list: (params?: Record<string, any>) =>
    apiClient.get('/transactions/', { params }),
  create: (data: Record<string, any>) =>
    apiClient.post('/transactions/', data),
  update: (id: string, data: Record<string, any>) =>
    apiClient.put(`/transactions/${id}/`, data),
  delete: (id: string) =>
    apiClient.delete(`/transactions/${id}/`),
  bulkImport: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/transactions/bulk_import/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  restore: (transactionIds: string[]) =>
    apiClient.post('/transactions/restore/', { transaction_ids: transactionIds }),
  summary: () =>
    apiClient.get('/transactions/summary/'),
}

export const categoryAPI = {
  list: (params?: Record<string, any>) =>
    apiClient.get('/categories/', { params }),
  create: (data: Record<string, any>) =>
    apiClient.post('/categories/', data),
  update: (id: string, data: Record<string, any>) =>
    apiClient.put(`/categories/${id}/`, data),
  delete: (id: string) =>
    apiClient.delete(`/categories/${id}/`),
}

export const budgetAPI = {
  list: (params?: Record<string, any>) =>
    apiClient.get('/budgets/', { params }),
  create: (data: Record<string, any>) =>
    apiClient.post('/budgets/', data),
  update: (id: string, data: Record<string, any>) =>
    apiClient.put(`/budgets/${id}/`, data),
  delete: (id: string) =>
    apiClient.delete(`/budgets/${id}/`),
  summary: () =>
    apiClient.get('/budgets/summary/'),
  alerts: () =>
    apiClient.get('/budgets/alerts/'),
}

export const analyticsAPI = {
  dashboard: () =>
    apiClient.get('/dashboard/'),
  monthlySummary: (params?: Record<string, any>) =>
    apiClient.get('/analytics/monthly_summary/', { params }),
  categoryBreakdown: (params?: Record<string, any>) =>
    apiClient.get('/analytics/category_breakdown/', { params }),
  savingsRate: (params?: Record<string, any>) =>
    apiClient.get('/analytics/savings_rate/', { params }),
  comparison: (params?: Record<string, any>) =>
    apiClient.get('/analytics/comparison/', { params }),
}

export default apiClient
