import { useEffect, useState } from 'react'
import { transactionAPI, budgetAPI } from '@/api/client'

interface Summary {
  total_transactions: number
  total_income: number
  total_expense: number
  this_month: number
  this_month_expense: number
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [budgetSummary, setBudgetSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txn, budget] = await Promise.all([
          transactionAPI.summary(),
          budgetAPI.summary(),
        ])
        setSummary(txn.data)
        setBudgetSummary(budget.data)
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>
  }

  const netIncome = (summary?.total_income || 0) - (summary?.total_expense || 0)

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6">
          <p className="text-gray-600 text-sm font-medium">Total Transactions</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {summary?.total_transactions || 0}
          </p>
        </div>

        <div className="card p-6">
          <p className="text-gray-600 text-sm font-medium">Total Income</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            ${summary?.total_income?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="card p-6">
          <p className="text-gray-600 text-sm font-medium">Total Expenses</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            ${summary?.total_expense?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="card p-6">
          <p className="text-gray-600 text-sm font-medium">Net Income</p>
          <p className={`text-3xl font-bold mt-2 ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${netIncome.toFixed(2)}
          </p>
        </div>
      </div>

      {/* This Month */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">This Month</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.this_month || 0}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                ${summary?.this_month_expense?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Budget Status</h3>
          <div className="space-y-3">
            <p className="text-gray-600 text-sm font-medium">
              {budgetSummary?.active_budgets || 0} active budgets
            </p>
            {budgetSummary?.budgets?.slice(0, 3).map((budget: any) => (
              <div key={budget.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">{budget.category_name}</span>
                  <span className="font-medium">
                    ${budget.current_spending?.toFixed(2) || '0.00'} / ${budget.monthly_limit?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      budget.percentage_used >= 100 ? 'bg-red-600' :
                      budget.percentage_used >= 80 ? 'bg-yellow-500' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(budget.percentage_used || 0, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary">+ Add Transaction</button>
          <button className="btn-secondary">+ Create Budget</button>
          <button className="btn-secondary">View Analytics</button>
          <button className="btn-secondary">Import Transactions</button>
        </div>
      </div>
    </div>
  )
}
