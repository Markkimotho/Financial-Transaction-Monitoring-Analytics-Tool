import { useEffect, useState } from 'react'
import { budgetAPI, categoryAPI } from '@/api/client'

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
      // Refresh budgets
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

  if (loading) return <div className="text-center py-8">Loading budgets...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ Create Budget'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4">Create Budget</h3>
          <form onSubmit={handleAddBudget} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
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

            <div className="form-group">
              <label className="label">Monthly Limit</label>
              <input
                type="number"
                step="0.01"
                value={formData.monthly_limit}
                onChange={(e) => setFormData({ ...formData, monthly_limit: e.target.value })}
                className="input"
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Alert Threshold (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.alert_threshold}
                onChange={(e) => setFormData({ ...formData, alert_threshold: e.target.value })}
                className="input"
                required
              />
            </div>

            <button type="submit" className="btn-primary col-span-full">
              Create Budget
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((budget) => {
          const isOverBudget = budget.percentage_used > 100
          const isNearLimit = budget.percentage_used > budget.alert_threshold

          return (
            <div key={budget.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {budget.category_name}
                </h3>
                <span className={`badge ${
                  isOverBudget ? 'badge-danger' :
                  isNearLimit ? 'badge-warning' :
                  'badge-success'
                }`}>
                  {budget.percentage_used.toFixed(0)}%
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Spent</span>
                    <span className="font-semibold text-gray-900">
                      ${budget.current_spending.toFixed(2)} / ${budget.monthly_limit.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        isOverBudget ? 'bg-red-600' :
                        isNearLimit ? 'bg-yellow-500' :
                        'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(budget.percentage_used, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {isOverBudget && (
                  <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    You've exceeded your budget by ${(budget.current_spending - budget.monthly_limit).toFixed(2)}
                  </div>
                )}

                {isNearLimit && !isOverBudget && (
                  <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-sm">
                    You're approaching your budget limit
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {budgets.length === 0 && (
        <div className="card p-6 text-center">
          <p className="text-gray-600">No budgets yet. Create one to get started!</p>
        </div>
      )}
    </div>
  )
}
