import { useState } from 'react'
import { Shield, Download, Trash2, Lock } from 'lucide-react'
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
    <div className="space-y-8 max-w-2xl animate-fadeIn">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white">Settings</h1>
        <p className="text-frost-3">Manage your account and preferences</p>
      </div>

      {saved && (
        <div className="p-4 bg-aurora-2/20 border border-aurora-2/30 text-aurora-2 rounded-lg font-medium">
          Settings saved successfully
        </div>
      )}

      {/* Profile Section */}
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-6">Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-frost-3">Email</label>
            <p className="text-white font-medium mt-1">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-frost-3">Username</label>
            <p className="text-white font-medium mt-1">{user?.username}</p>
          </div>
          {user?.first_name && (
            <div>
              <label className="text-sm font-semibold text-frost-3">Name</label>
              <p className="text-white font-medium mt-1">
                {user.first_name} {user.last_name || ''}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preferences */}
      <form onSubmit={handleSave} className="card space-y-6">
        <h3 className="text-xl font-bold text-white">Preferences</h3>

        <div>
          <label className="text-sm font-semibold text-frost-3 block mb-2">Currency</label>
          <select
            name="currency_preference"
            value={formData.currency_preference}
            onChange={handleChange}
            className="w-full bg-nord-1/50 border border-frost-3/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-frost-3/50 focus:ring-1 focus:ring-frost-3/30 font-display"
          >
            <option value="KES" className="bg-nord-0">KES (Ksh) - Kenyan Shilling</option>
            <option value="USD" className="bg-nord-0">USD ($) - US Dollar</option>
            <option value="EUR" className="bg-nord-0">EUR (€) - Euro</option>
            <option value="GBP" className="bg-nord-0">GBP (£) - British Pound</option>
            <option value="CAD" className="bg-nord-0">CAD ($) - Canadian Dollar</option>
            <option value="AUD" className="bg-nord-0">AUD ($) - Australian Dollar</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-frost-3 block mb-2">Theme</label>
          <select
            name="theme"
            value={formData.theme}
            onChange={handleChange}
            className="w-full bg-nord-1/50 border border-frost-3/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-frost-3/50 focus:ring-1 focus:ring-frost-3/30 font-display"
          >
            <option value="dark" className="bg-nord-0">Dark</option>
            <option value="light" className="bg-nord-0">Light</option>
            <option value="auto" className="bg-nord-0">Auto (System)</option>
          </select>
        </div>

        <button type="submit" className="w-full btn-primary">
          Save Preferences
        </button>
      </form>

      {/* Notifications */}
      <div className="card space-y-6">
        <h3 className="text-xl font-bold text-white">Notifications</h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer hover:bg-nord-1/30 p-3 rounded-lg transition-colors">
            <input
              type="checkbox"
              name="notifications_email"
              checked={formData.notifications_email}
              onChange={handleChange}
              className="w-4 h-4 accent-frost-3"
            />
            <span className="text-white">Email notifications for budget alerts</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer hover:bg-nord-1/30 p-3 rounded-lg transition-colors">
            <input
              type="checkbox"
              name="notifications_sms"
              checked={formData.notifications_sms}
              onChange={handleChange}
              className="w-4 h-4 accent-frost-3"
            />
            <span className="text-white">SMS notifications for budget overages</span>
          </label>
        </div>
      </div>

      {/* Security */}
      <div className="card space-y-6">
        <h3 className="text-xl font-bold text-white">Security</h3>

        <div className="space-y-3">
          <button className="w-full flex items-center gap-2 bg-nord-1/50 hover:bg-nord-1 text-frost-3 hover:text-frost-1 font-medium py-3 px-4 rounded-lg transition-colors border border-frost-3/20">
            <Lock className="w-4 h-4" />
            Change Password
          </button>
          <button className="w-full flex items-center gap-2 bg-nord-1/50 hover:bg-nord-1 text-frost-3 hover:text-frost-1 font-medium py-3 px-4 rounded-lg transition-colors border border-frost-3/20">
            <Shield className="w-4 h-4" />
            Enable Two-Factor Authentication
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="card space-y-6">
        <h3 className="text-xl font-bold text-white">Data Management</h3>

        <div className="space-y-3">
          <button className="w-full flex items-center gap-2 bg-nord-1/50 hover:bg-nord-1 text-frost-3 hover:text-frost-1 font-medium py-3 px-4 rounded-lg transition-colors border border-frost-3/20">
            <Download className="w-4 h-4" />
            Export My Data (CSV)
          </button>
          <button className="w-full flex items-center gap-2 bg-nord-1/50 hover:bg-nord-1 text-frost-3 hover:text-frost-1 font-medium py-3 px-4 rounded-lg transition-colors border border-frost-3/20">
            <Download className="w-4 h-4" />
            Download Statement (PDF)
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-aurora-0/15 border border-aurora-0/30 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-bold text-aurora-0">Danger Zone</h3>
        <p className="text-aurora-0/80 text-sm">
          Be careful with these actions. They cannot be undone.
        </p>
        <button className="w-full flex items-center gap-2 bg-aurora-0/20 hover:bg-aurora-0/30 text-aurora-0 hover:text-red-300 font-medium py-3 px-4 rounded-lg transition-colors border border-aurora-0/30">
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </div>

      {/* About */}
      <div className="card space-y-2">
        <p className="text-sm text-white">
          <strong>Financial Monitoring & Analytics Tool</strong> - Version 1.0.0
        </p>
        <p className="text-sm text-frost-3">
          Helping you take control of your finances
        </p>
      </div>
    </div>
  )
}
