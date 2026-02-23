import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { analyticsAPI } from '@/api/client'

interface AnalyticsData {
  monthly_summary?: any
  category_breakdown?: any
  savings_rate?: any
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [monthly, categories, savings] = await Promise.all([
          analyticsAPI.monthlySummary(),
          analyticsAPI.categoryBreakdown(),
          analyticsAPI.savingsRate(),
        ])
        setAnalytics({
          monthly_summary: monthly.data,
          category_breakdown: categories.data,
          savings_rate: savings.data,
        })
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) return <div className="text-center py-8 text-gray-400">Loading analytics...</div>
  if (error) return <div className="text-center py-8 text-red-400">{error}</div>

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-8 h-8 text-blue-400" />
        <h1 className="text-3xl font-bold text-gray-100">Analytics & Reports</h1>
      </div>

      {/* Savings Rate */}
      {analytics.savings_rate && (
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-6" role="region" aria-label="Savings rate">
          <h3 className="text-lg font-bold text-gray-100 mb-4">Savings Rate</h3>
          <div className="text-center">
            <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              {analytics.savings_rate.savings_rate?.toFixed(1) || '0'}%
            </div>
            <p className="text-gray-400">
              of your income is being saved
            </p>
          </div>
        </div>
      )}

      {/* Monthly Summary */}
      {analytics.monthly_summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm font-medium mb-2">Monthly Income</p>
            <p className="text-3xl font-bold text-green-400">
              ${analytics.monthly_summary.total_income?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm font-medium mb-2">Monthly Expenses</p>
            <p className="text-3xl font-bold text-red-400">
              ${analytics.monthly_summary.total_expenses?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm font-medium mb-2">Net</p>
            <p className={`text-3xl font-bold ${
              (analytics.monthly_summary.net || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              ${analytics.monthly_summary.net?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {analytics.category_breakdown && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6" role="region" aria-label="Spending by category">
          <h3 className="text-lg font-bold text-gray-100 mb-4">Spending by Category</h3>
          <div className="space-y-4">
            {analytics.category_breakdown.categories?.map((cat: any) => (
              <div key={cat.category_id || cat.category_name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-300">{cat.category_name}</span>
                  <span className="text-gray-400">
                    ${cat.amount?.toFixed(2)} ({cat.percentage?.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                    style={{ width: `${cat.percentage || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6">
        <p className="text-gray-300 text-sm">
          <strong className="text-blue-400">Tip:</strong> Use these analytics to understand your spending patterns and identify areas where you can save money. Set realistic budgets based on your actual spending.
        </p>
      </div>
    </div>
  )
}
