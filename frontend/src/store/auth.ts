import { create } from 'zustand'
import { authAPI } from '@/api/client'

export interface User {
  id: string
  email: string
  username: string
  first_name?: string
  last_name?: string
  currency_preference?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  login: (username: string, password: string) => Promise<void>
  register: (data: {
    email: string
    username: string
    password: string
    password_confirm: string
    first_name?: string
    last_name?: string
  }) => Promise<void>
  logout: () => void
  clearError: () => void
  loadUser: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null })
    try {
      console.log('Auth store: logging in user...')
      const { data } = await authAPI.login({ username, password })
      console.log('Auth store: login response received, tokens:', data.access ? 'yes' : 'no')
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      
      // Fetch user info from /users/me/ endpoint
      try {
        console.log('Auth store: fetching user info...')
        const userResponse = await authAPI.getCurrentUser()
        console.log('Auth store: user info:', userResponse.data)
        set({
          user: userResponse.data,
          isAuthenticated: true,
          isLoading: false,
        })
      } catch (err) {
        // If we can't fetch user, still set as authenticated (tokens are valid)
        console.warn('Auth store: Failed to fetch user info, but authentication succeeded', err)
        set({
          user: {
            id: '',
            email: '',
            username: ''
          },
          isAuthenticated: true,
          isLoading: false,
        })
      }
    } catch (error: any) {
      console.error('Auth store: login error', error)
      const message = error.response?.data?.detail || 'Login failed'
      set({
        error: message,
        isLoading: false,
      })
      throw error
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null })
    try {
      await authAPI.register(data)
      set({ isLoading: false })
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed'
      set({
        error: message,
        isLoading: false,
      })
      throw error
    }
  },

  logout: () => {
    authAPI.logout()
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    })
  },

  clearError: () => {
    set({ error: null })
  },

  loadUser: () => {
    // This would fetch from /users/me/ endpoint
    const token = localStorage.getItem('access_token')
    if (token) {
      set({ isAuthenticated: true })
    }
  },
}))
