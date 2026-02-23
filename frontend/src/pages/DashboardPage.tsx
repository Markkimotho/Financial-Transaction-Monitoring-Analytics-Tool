import { useEffect, useState } from 'react'
import { transactionAPI, budgetAPI } from '@/api/client'
import { TrendingUp, Wallet, Target } from 'lucide-react'

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
    return <div className="text-center py-12 text-gray-400">Loading dashboard...</div>
  }

  if (error) {
    return <div className="p-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">{error}</div>
  }

  const netIncome = (summary?.total_income || 0) - (summary?.total_expense || 0)

  const StatCard = ({ icon: Icon, label, value, color = 'blue' }: any) => {
    const colorClasses = {
      blue: 'from-blue-500/20 to-purple-500/20 border-blue-500/30',
      green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
      red: 'from-red-500/20 to-pink-500/20 border-red-500/30',
    }
    return (
      <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} border rounded-lg p-6`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <Icon className="w-8 h-8 text-gray-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet}
          label="Total Transactions"
          value={summary?.total_transactions || 0}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Income"
          value={`$${summary?.total_income?.toFixed(2) || '0.00'}`}
          color="green"
        />
        <StatCard
          icon={Wallet}
          label="Total Expenses"
          value={`$${summary?.total_expense?.toFixed(2) || '0.00'}`}
          color="red"
        />
        <StatCard
          icon={Target}
          label="Net Income"
          value={`$${netIncome.toFixed(2)}`}
          color={netIncome >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* This Month & Budget Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* This Month Card */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-6">This Month</h3>
          <div className="space-y-6">
            <div>
              <p className="text-gray-400 text-sm mb-2">Transactions</p>
              <p className="text-4xl font-bold">{summary?.this_month || 0}</p>
            </div>
            <div className="pt-4 border-t border-gray-800">
              <p className="text-gray-400 text-sm mb-2">Monthly Expenses</p>
              <p className="text-3xl font-bold text-red-400">${summary?.this_month_expense?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        {/* Budget Status Card */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-6">Budget Status</h3>
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              {budgetSummary?.active_budgets || 0} active budgets
            </p>
            {budgetSummary?.budgets?.slice(0, 3).map((budget: any) => {
              const percentageUsed = budget.percentage_used || 0
              const statusColor =
                percentageUsed >= 100
                  ? 'from-red-500/20 to-red-500/10 border-red-500/30'
                  : percentageUsed >= 80
                  ? 'from-yellow-500/20 to-yellow-500/10 border-yellow-500/30'
                  : 'from-green-500/20 to-green-500/10 border-green-500/30'
              
              return (
                <div key={budget.id} className={`bg-gradient-to-r ${statusColor} border rounded-lg p-4`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium">{budget.category_name}</span>
                    <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded">{percentageUsed.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        percentageUsed >= 100 ? 'bg-red-500' :
                        percentageUsed >= 80 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    ${budget.current_spending?.toFixed(2) || '0.00'} of ${budget.monthly_limit?.toFixed(2) || '0.00'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="px-4 py-3 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors font-medium">
            + Add Transaction
          </button>
          <button className="px-4 py-3 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors font-medium">
            + Create Budget
          </button>
          <button className="px-4 py-3 bg-green-600/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors font-medium">
            View Analytics
          </button>
          <button className="px-4 py-3 bg-orange-600/20 border border-orange-500/30 text-orange-400 rounded-lg hover:bg-orange-600/30 transition-colors font-medium">
            Import Data
          </button>
        </div>
      </div>
    </div>
  )
}
