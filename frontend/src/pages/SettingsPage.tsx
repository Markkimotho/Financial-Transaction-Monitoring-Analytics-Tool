import { useState } from 'react'
import { Shield, Download, Trash2, Lock, Bell, Settings as SettingsIcon } from 'lucide-react'
import { useAuthStore } from '@/store/auth'

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const [formData, setFormData] = useState({
    currency_preference: 'KES',
    theme: 'dark',
    notifications_email: true,
    notifications_sms: false,
  })
  const [saved, setSaved] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-blue-400" />
        <h1 className="text-3xl font-bold text-gray-100">Settings</h1>
      </div>

      {saved && (
        <div className="p-4 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg">
          Settings saved successfully
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-100 mb-4">Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-400">Email</label>
            <p className="text-gray-200 font-medium">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400">Username</label>
            <p className="text-gray-200 font-medium">{user?.username}</p>
          </div>
          {user?.first_name && (
            <div>
              <label className="text-sm font-medium text-gray-400">Name</label>
              <p className="text-gray-200 font-medium">
                {user.first_name} {user.last_name || ''}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preferences */}
      <form onSubmit={handleSave} className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-100">Preferences</h3>

        <div>
          <label className="text-sm font-medium text-gray-400 block mb-1">Currency</label>
          <select
            name="currency_preference"
            value={formData.currency_preference}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="KES">KES (Ksh) - Kenyan Shilling</option>
            <option value="USD">USD ($) - US Dollar</option>
            <option value="EUR">EUR (€) - Euro</option>
            <option value="GBP">GBP (£) - British Pound</option>
            <option value="CAD">CAD ($) - Canadian Dollar</option>
            <option value="AUD">AUD ($) - Australian Dollar</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-400 block mb-1">Theme</label>
          <select
            name="theme"
            value={formData.theme}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl">
          Save Preferences
        </button>
      </form>

      {/* Notifications */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-gray-100">Notifications</h3>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-800/50 p-2 rounded-lg transition-colors">
            <input
              type="checkbox"
              name="notifications_email"
              checked={formData.notifications_email}
              onChange={handleChange}
              className="w-4 h-4 accent-blue-500"
            />
            <span className="text-gray-300">Email notifications for budget alerts</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-800/50 p-2 rounded-lg transition-colors">
            <input
              type="checkbox"
              name="notifications_sms"
              checked={formData.notifications_sms}
              onChange={handleChange}
              className="w-4 h-4 accent-blue-500"
            />
            <span className="text-gray-300">SMS notifications for budget overages</span>
          </label>
        </div>
      </div>

      {/* Security */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-gray-100">Security</h3>
        </div>

        <div className="space-y-3">
          <button className="w-full flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium py-2 px-4 rounded-lg transition-colors">
            <Lock className="w-4 h-4" />
            Change Password
          </button>
          <button className="w-full flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium py-2 px-4 rounded-lg transition-colors">
            <Shield className="w-4 h-4" />
            Enable Two-Factor Authentication
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-gray-100">Data Management</h3>
        </div>

        <div className="space-y-3">
          <button className="w-full flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium py-2 px-4 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export My Data (CSV)
          </button>
          <button className="w-full flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium py-2 px-4 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Download Statement (PDF)
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-bold text-red-400">Danger Zone</h3>
        <p className="text-red-300 text-sm">
          Be careful with these actions. They cannot be undone.
        </p>
        <button className="w-full flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 font-medium py-2 px-4 rounded-lg transition-colors border border-red-500/30">
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </div>

      {/* About */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-2">
        <p className="text-sm text-gray-300">
          <strong className="text-gray-100">Financial Monitoring & Analytics Tool</strong> - Version 1.0.0
        </p>
        <p className="text-sm text-gray-400">
          Helping you take control of your finances
        </p>
      </div>
    </div>
  )
}
