import { useEffect, useState } from 'react'
import { budgetAPI, categoryAPI } from '@/api/client'
import { Plus, AlertCircle, CheckCircle } from 'lucide-react'

interface Budget {
  id: string
  category_name: string
  monthly_limit: number
  current_spending: number
  percentage_used: number
  alert_threshold: number
}

interface Category {
  id: string
  name: string
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    monthly_limit: '',
    alert_threshold: '80',
    start_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [budgetsRes, categoriesRes] = await Promise.all([
          budgetAPI.summary(),
          categoryAPI.list(),
        ])
        setBudgets(budgetsRes.data.budgets || [])
        setCategories(categoriesRes.data.results || categoriesRes.data)
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load budgets')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await budgetAPI.create({
        category: formData.category,
        monthly_limit: parseFloat(formData.monthly_limit),
        alert_threshold: parseInt(formData.alert_threshold),
        start_date: formData.start_date,
      })
      const res = await budgetAPI.summary()
      setBudgets(res.data.budgets || [])
      setFormData({
        category: '',
        monthly_limit: '',
        alert_threshold: '80',
        start_date: new Date().toISOString().split('T')[0],
      })
      setShowForm(false)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create budget')
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading budgets...</div>

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Create Budget
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-6">Create Budget</h3>
          <form onSubmit={handleAddBudget} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Monthly Limit</label>
              <input
                type="number"
                step="0.01"
                value={formData.monthly_limit}
                onChange={(e) => setFormData({ ...formData, monthly_limit: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Alert Threshold (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.alert_threshold}
                onChange={(e) => setFormData({ ...formData, alert_threshold: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                required
              />
            </div>

            <button type="submit" className="col-span-1 md:col-span-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Create Budget
            </button>
          </form>
        </div>
      )}

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((budget) => {
          const isOverBudget = budget.percentage_used > 100
          const isNearLimit = budget.percentage_used > budget.alert_threshold && !isOverBudget

          const bgColor = isOverBudget 
            ? 'from-red-500/20 to-red-500/10 border-red-500/30' 
            : isNearLimit 
            ? 'from-yellow-500/20 to-yellow-500/10 border-yellow-500/30'
            : 'from-green-500/20 to-green-500/10 border-green-500/30'

          return (
            <div key={budget.id} className={`bg-gradient-to-br ${bgColor} border rounded-lg p-6`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">{budget.category_name}</h3>
                <div className="flex items-center gap-2">
                  {isOverBudget && <AlertCircle className="w-5 h-5 text-red-400" />}
                  {!isOverBudget && !isNearLimit && <CheckCircle className="w-5 h-5 text-green-400" />}
                  <span className="text-sm font-mono px-3 py-1 bg-gray-800 rounded-full">
                    {budget.percentage_used.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Spent this month</span>
                    <span className="font-semibold text-gray-200">
                      ${budget.current_spending.toFixed(2)} / ${budget.monthly_limit.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full ${
                        isOverBudget ? 'bg-red-500' :
                        isNearLimit ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budget.percentage_used, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Status Messages */}
                {isOverBudget && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-sm">
                    Exceeded by ${(budget.current_spending - budget.monthly_limit).toFixed(2)}
                  </div>
                )}

                {isNearLimit && !isOverBudget && (
                  <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-lg text-sm">
                    Approaching limit
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {budgets.length === 0 && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-400">No budgets yet. Create one to get started!</p>
        </div>
      )}
    </div>
  )
}
