import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { MdDashboard, MdOutlineWallet, MdTrendingUp, MdSettings, MdLogout, MdMenu } from 'react-icons/md'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const NavLink = ({ to, label, icon: Icon }: { to: string; label: string; icon: React.ReactNode }) => {
    const isActive = location.pathname === to
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span className="text-xl">{Icon}</span>
        {sidebarOpen && <span>{label}</span>}
      </Link>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-blue-600">FinTrack</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MdMenu className="text-2xl text-gray-700" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 p-4">
          <NavLink to="/" label="Dashboard" icon={<MdDashboard />} />
          <NavLink to="/transactions" label="Transactions" icon={<MdOutlineWallet />} />
          <NavLink to="/budgets" label="Budgets" icon={<MdOutlineWallet />} />
          <NavLink to="/analytics" label="Analytics" icon={<MdTrendingUp />} />
          <NavLink to="/settings" label="Settings" icon={<MdSettings />} />
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <MdLogout className="text-lg" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {location.pathname === '/' && 'Dashboard'}
              {location.pathname === '/transactions' && 'Transactions'}
              {location.pathname === '/budgets' && 'Budgets'}
              {location.pathname === '/analytics' && 'Analytics'}
              {location.pathname === '/settings' && 'Settings'}
            </h2>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Signed in</span>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
