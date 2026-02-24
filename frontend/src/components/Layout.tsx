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
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-mono font-500 ${
          isActive
            ? 'bg-frost-3/20 border border-frost-3/50 text-frost-2 shadow-lg'
            : 'text-nord-4 hover:text-frost-3 hover:bg-nord-3/30 hover:border border-nord-3/30'
        }`}
      >
        <span className="flex-shrink-0">{Icon}</span>
        {sidebarOpen && <span>{label}</span>}
      </Link>
    )
  }

  return (
    <div className="flex h-screen bg-nord-0">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-nord-3/30 transform transition-transform duration-300 md:relative md:translate-x-0 bg-nord-1/60 backdrop-blur-md ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-nord-3/30">
          {sidebarOpen && (
            <Link to="/app" className="flex items-center gap-2 group">
              <PieChart className="w-6 h-6 text-frost-3 group-hover:text-frost-2 transition-colors" />
              <h1 className="text-lg font-display font-700 bg-gradient-to-r from-frost-3 via-frost-2 to-frost-1 bg-clip-text text-transparent">FinTrack</h1>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg transition-colors md:hidden hover:bg-nord-3/30 text-frost-3"
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
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-nord-3/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 font-display font-600 bg-aurora1/20 border border-aurora1/40 text-aurora1 hover:bg-aurora1/30 hover:border-aurora1/60 hover:shadow-lg"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden bg-black/40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-nord-0">
        {/* Top Bar */}
        <div className="border-b border-nord-3/30 px-6 py-4 backdrop-blur-md bg-nord-1/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg transition-colors md:hidden hover:bg-nord-3/30 text-frost-3"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-display font-700 text-nord-5">{getPageTitle()}</h2>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all duration-200 text-frost-3 hover:text-frost-2 hover:bg-nord-3/30"
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
