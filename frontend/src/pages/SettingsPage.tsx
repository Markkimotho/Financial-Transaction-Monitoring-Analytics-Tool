import { useState } from 'react'
import { useAuthStore } from '@/store/auth'

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const [formData, setFormData] = useState({
    currency_preference: 'USD',
    theme: 'light',
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
    // In a real app, this would make an API call to save settings
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      {saved && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          ✓ Settings saved successfully
        </div>
      )}

      {/* Profile Section */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900 font-medium">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Username</label>
            <p className="text-gray-900 font-medium">{user?.username}</p>
          </div>
          {user?.first_name && (
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="text-gray-900 font-medium">
                {user.first_name} {user.last_name || ''}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preferences */}
      <form onSubmit={handleSave} className="card p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Preferences</h3>

        <div className="form-group">
          <label className="label">Currency</label>
          <select
            name="currency_preference"
            value={formData.currency_preference}
            onChange={handleChange}
            className="input"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD ($)</option>
            <option value="AUD">AUD ($)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="label">Theme</label>
          <select
            name="theme"
            value={formData.theme}
            onChange={handleChange}
            className="input"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>

        <button type="submit" className="btn-primary">
          Save Preferences
        </button>
      </form>

      {/* Notifications */}
      <div className="card p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Notifications</h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="notifications_email"
              checked={formData.notifications_email}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <span className="text-gray-700">Email notifications for budget alerts</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="notifications_sms"
              checked={formData.notifications_sms}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <span className="text-gray-700">SMS notifications for budget overages</span>
          </label>
        </div>
      </div>

      {/* Security */}
      <div className="card p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Security</h3>

        <div className="space-y-3">
          <button

 className="btn-secondary w-full">
            Change Password
          </button>
          <button className="btn-secondary w-full">
            Enable Two-Factor Authentication
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="card p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Data</h3>

        <div className="space-y-3">
          <button className="btn-secondary w-full">
            Export My Data (CSV)
          </button>
          <button className="btn-secondary w-full">
            Download Statement (PDF)
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card p-6 border-red-300 bg-red-50 space-y-4">
        <h3 className="text-lg font-bold text-red-900">Danger Zone</h3>
        <p className="text-red-800 text-sm">
          Be careful with these actions. They cannot be undone.
        </p>
        <button className="btn-danger w-full">
          Delete Account
        </button>
      </div>

      {/* About */}
      <div className="card p-6 bg-gray-100 space-y-2">
        <p className="text-sm text-gray-700">
          <strong>Financial Monitoring & Analytics Tool</strong> - Version 1.0.0
        </p>
        <p className="text-sm text-gray-600">
          Helping you take control of your finances
        </p>
      </div>
    </div>
  )
}
