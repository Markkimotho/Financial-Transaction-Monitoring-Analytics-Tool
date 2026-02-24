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

  if (loading) return <div className="text-center py-12 text-frost-3">Loading budgets...</div>

  return (
    <div className="space-y-8 max-w-6xl animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white">Budgets</h1>
        <p className="text-frost-3">Set and manage your spending limits</p>
      </div>

      {/* Create Budget Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-frost-3 to-frost-2 hover:from-frost-2 hover:to-frost-1 text-nord-0 font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
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
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-6">Create Budget</h3>
          <form onSubmit={handleAddBudget} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-frost-3">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-nord-1/50 border border-frost-3/20 rounded-lg text-white focus:outline-none focus:border-frost-3/50 focus:ring-1 focus:ring-frost-3/30 transition-colors font-display"
                required
              >
                <option value="" className="bg-nord-0">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-nord-0">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-frost-3">Monthly Limit</label>
              <input
                type="number"
                step="0.01"
                value={formData.monthly_limit}
                onChange={(e) => setFormData({ ...formData, monthly_limit: e.target.value })}
                className="w-full px-4 py-3 bg-nord-1/50 border border-frost-3/20 rounded-lg text-white placeholder-nord-3 focus:outline-none focus:border-frost-3/50 focus:ring-1 focus:ring-frost-3/30 transition-colors font-display"
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-frost-3">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 bg-nord-1/50 border border-frost-3/20 rounded-lg text-white focus:outline-none focus:border-frost-3/50 focus:ring-1 focus:ring-frost-3/30 transition-colors font-display"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-frost-3">Alert Threshold (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.alert_threshold}
                onChange={(e) => setFormData({ ...formData, alert_threshold: e.target.value })}
                className="w-full px-4 py-3 bg-nord-1/50 border border-frost-3/20 rounded-lg text-white focus:outline-none focus:border-frost-3/50 focus:ring-1 focus:ring-frost-3/30 transition-colors font-display"
                required
              />
            </div>

            <button type="submit" className="col-span-1 md:col-span-3 btn-primary">
              Create Budget
            </button>
          </form>
        </div>
      )}

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((budget, idx) => {
          const isOverBudget = budget.percentage_used > 100
          const isNearLimit = budget.percentage_used > budget.alert_threshold && !isOverBudget

          const statusColor = isOverBudget 
            ? 'aurora-0' 
            : isNearLimit 
            ? 'aurora-1'
            : 'aurora-2'

          return (
            <div key={budget.id} className="stat-card" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white">{budget.category_name}</h3>
                <div className="flex items-center gap-2">
                  {isOverBudget && <AlertCircle className="w-5 h-5 text-aurora-0" />}
                  {!isOverBudget && !isNearLimit && <CheckCircle className="w-5 h-5 text-aurora-2" />}
                  <span className={`text-sm font-semibold px-3 py-1 bg-nord-1/50 border border-frost-3/20 rounded-full text-${statusColor}`}>
                    {budget.percentage_used.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-frost-3">Spent this month</span>
                    <span className="font-semibold text-white">
                      ${budget.current_spending.toFixed(2)} / ${budget.monthly_limit.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-nord-1/50 rounded-full h-3 overflow-hidden border border-frost-3/10">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isOverBudget ? 'bg-aurora-0' :
                        isNearLimit ? 'bg-aurora-1' :
                        'bg-aurora-2'
                      }`}
                      style={{ width: `${Math.min(budget.percentage_used, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Status Messages */}
                {isOverBudget && (
                  <div className="p-3 bg-aurora-0/15 border border-aurora-0/30 text-aurora-0 rounded-lg text-sm font-medium">
                    Exceeded by ${(budget.current_spending - budget.monthly_limit).toFixed(2)}
                  </div>
                )}

                {isNearLimit && !isOverBudget && (
                  <div className="p-3 bg-aurora-1/15 border border-aurora-1/30 text-aurora-1 rounded-lg text-sm font-medium">
                    Approaching limit
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {budgets.length === 0 && (
        <div className="card text-center">
          <p className="text-frost-3">No budgets yet. Create one to get started!</p>
        </div>
      )}
    </div>
  )
}
