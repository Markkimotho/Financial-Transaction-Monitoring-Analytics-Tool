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
      console.log('[AUTH] Login: sending credentials')
      const response = await authAPI.login({ username, password })
      const { data } = response
      
      console.log('[AUTH] Login: got tokens')
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      
      try {
        const userResponse = await authAPI.getCurrentUser()
        console.log('[AUTH] Login: authenticated as', userResponse.data.username)
        set({
          user: userResponse.data,
          isAuthenticated: true,
          isLoading: false,
        })
      } catch (userErr) {
        console.log('[AUTH] Login: no user info, but using tokens')
        set({
          user: { id: '', email: '', username },
          isAuthenticated: true,
          isLoading: false,
        })
      }
    } catch (error: any) {
      const msg = error.response?.data?.detail || error.message || 'Login failed'
      console.error('[AUTH] Login error:', msg)
      set({ error: msg, isLoading: false })
      throw error
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null })
    try {
      await authAPI.register(data)
      set({ isLoading: false })
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Registration failed'
      set({ error: msg, isLoading: false })
      throw error
    }
  },

  logout: () => {
    authAPI.logout()
    set({ user: null, isAuthenticated: false, error: null })
  },

  clearError: () => {
    set({ error: null })
  },

  loadUser: () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      set({ isAuthenticated: true })
    }
  },
}))
