import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import { PieChart, ArrowRight, Sun, Moon } from 'lucide-react'

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

    try {
      await login(formData.username, formData.password)
      navigate('/app')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    }
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
      isDark ? 'bg-black text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Navigation with Theme Toggle */}
      <nav className={`border-b ${
        isDark ? 'border-gray-800' : 'border-gray-100 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <PieChart className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">FinTrack</h1>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'bg-gray-900 text-yellow-400 hover:bg-gray-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/" className={`transition-colors text-sm font-medium ${
              isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}>Back to Home</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-bold">Sign In</h2>
              <p className={isDark ? 'text-gray-400' : 'text-slate-600'}>Welcome back to FinTrack</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                  className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                    isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20' : 'bg-slate-50 border-slate-300 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-blue-500/10'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                    isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20' : 'bg-slate-50 border-slate-300 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-blue-500/10'
                  }`}
                />
              </div>

              {error && (
                <div className={`p-4 border rounded-lg text-sm ${
                  isDark ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-50 border-red-300 text-red-700'
                }`}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${
                  isDark ? 'border-gray-700' : 'border-gray-300'
                }`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${
                  isDark ? 'bg-black text-gray-400' : 'bg-white text-slate-600'
                }`}>New to FinTrack?</span>
              </div>
            </div>

            {/* Sign Up Link - Centered */}
            <div className="flex flex-col items-center gap-4 pt-4">
              <Link
                to="/register"
                className={`w-full px-4 py-3 font-semibold rounded-lg transition-all text-center border duration-200 ${
                  isDark ? 'bg-green-600/20 border-green-500/30 text-green-400 hover:bg-green-600/30' : 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                }`}
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
