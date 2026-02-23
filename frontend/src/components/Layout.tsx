import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import { PieChart, LayoutDashboard, Wallet, TrendingUp, Settings, LogOut, Menu, X, Sun, Moon } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((state) => state.logout)
  const { isDark, toggleTheme } = useThemeStore()

  useEffect(() => {
    const small = window.innerWidth < 768
    setSidebarOpen(!small)

    const onResize = () => setSidebarOpen(window.innerWidth >= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/app':
        return 'Dashboard'
      case '/transactions':
        return 'Transactions'
      case '/budgets':
        return 'Budgets'
      case '/analytics':
        return 'Analytics'
      case '/settings':
        return 'Settings'
      default:
        return 'Dashboard'
    }
  }

  const NavLink = ({ to, label, icon: Icon }: { to: string; label: string; icon: React.ReactNode }) => {
    const isActive = location.pathname === to
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? isDark ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400' : 'bg-blue-100 border border-blue-300 text-blue-600'
            : isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
        }`}
      >
        <span className="flex-shrink-0">{Icon}</span>
        {sidebarOpen && <span className="font-medium">{label}</span>}
      </Link>
    )
  }

  return (
    <div className={`flex h-screen transition-colors ${isDark ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 border-r transform transition-transform duration-300 md:relative md:translate-x-0 ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          {sidebarOpen && (
            <Link to="/app" className="flex items-center gap-2">
              <PieChart className="w-6 h-6 text-blue-400" />
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">FinTrack</h1>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-1.5 rounded-lg transition-colors md:hidden ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 p-4">
          <NavLink to="/app" label="Dashboard" icon={<LayoutDashboard className="w-5 h-5" />} />
          <NavLink to="/transactions" label="Transactions" icon={<Wallet className="w-5 h-5" />} />
          <NavLink to="/budgets" label="Budgets" icon={<Wallet className="w-5 h-5" />} />
          <NavLink to="/analytics" label="Analytics" icon={<TrendingUp className="w-5 h-5" />} />
          <NavLink to="/settings" label="Settings" icon={<Settings className="w-5 h-5" />} />
        </nav>

        {/* Logout Button */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium ${
              isDark ? 'bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30' : 'bg-red-100 border border-red-300 text-red-600 hover:bg-red-200'
            }`}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className={`fixed inset-0 z-30 md:hidden ${isDark ? 'bg-black/50' : 'bg-black/30'}`}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className={`border-b px-6 py-4 transition-colors ${
          isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-2 rounded-lg transition-colors md:hidden ${
                  isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{getPageTitle()}</h2>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
