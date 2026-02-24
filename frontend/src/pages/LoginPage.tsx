import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import { PieChart, Sun, Moon } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const { login, isLoading } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    console.log('Form submitted, attempting login...')

    try {
      await login(formData.username, formData.password)
      console.log('Login successful, navigating to /app')
      navigate('/app')
    } catch (err: any) {
      const errorMsg = 
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        err.message ||
        'Unable to connect to server'
      
      console.error('Login failed with:', errorMsg)
      setError(errorMsg)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-nord-0 text-nord-4">
      {/* Navigation with Theme Toggle */}
      <nav className="border-b border-nord-3/30 backdrop-blur-md bg-nord-1/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <PieChart className="w-6 h-6 text-frost-3 group-hover:text-frost-2 transition-colors" />
            <h1 className="text-xl font-display font-700 bg-gradient-to-r from-frost-3 to-frost-2 bg-clip-text text-transparent">FinTrack</h1>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all hover:bg-nord-3/30 text-frost-3"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/" className="transition-colors text-sm font-mono text-nord-4 hover:text-frost-3">← Home</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
              <h2 className="text-5xl font-display font-700 text-nord-5">Welcome Back</h2>
              <p className="text-nord-3 text-sm font-light">Sign in to your account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-nord-3">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="john_doe"
                  required
                  className="w-full px-4 py-3 bg-nord-1/50 border border-nord-3/20 rounded-lg text-nord-4 placeholder:text-nord-3 focus:outline-none focus:border-frost-3/50 focus:ring-2 focus:ring-frost-3/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-nord-3">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-nord-1/50 border border-nord-3/20 rounded-lg text-nord-4 placeholder:text-nord-3 focus:outline-none focus:border-frost-3/50 focus:ring-2 focus:ring-frost-3/20 transition-all duration-200"
                />
              </div>

              {error && (
                <div className="p-4 border border-aurora1/40 bg-aurora1/10 rounded-xl text-sm text-aurora1 font-mono">
                  {error}
                </div>
              )}

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-frost-3 to-frost-2 text-nord-0 font-display font-600 rounded-lg hover:shadow-lg hover:shadow-frost-3/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-nord-3/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-nord-0 text-nord-3 text-xs">Don't have an account?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="flex justify-center">
              <Link
                to="/register"
                className="px-8 py-3 font-display font-600 rounded-lg transition-all text-center border duration-200 bg-nord-2/40 border-frost-2/30 text-frost-2 hover:bg-nord-2/60 hover:border-frost-2/50 hover:shadow-lg hover:shadow-frost-2/20 text-sm"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
