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

  if (loading) return <div className="text-center py-12 text-frost-3">Loading analytics...</div>
  if (error) return <div className="text-center py-12 text-red-400">{error}</div>

  return (
    <div className="space-y-8 max-w-7xl animate-fadeIn">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white">Analytics & Reports</h1>
        <p className="text-frost-3">Understand your financial patterns</p>
      </div>

      {/* Savings Rate */}
      {analytics.savings_rate && (
        <div className="card" role="region" aria-label="Savings rate">
          <h3 className="text-xl font-bold text-white mb-6">Savings Rate</h3>
          <div className="text-center">
            <div className="text-6xl font-bold bg-gradient-to-r from-aurora-2 to-frost-2 bg-clip-text text-transparent mb-2">
              {analytics.savings_rate.savings_rate?.toFixed(1) || '0'}%
            </div>
            <p className="text-frost-3">
              of your income is being saved
            </p>
          </div>
        </div>
      )}

      {/* Monthly Summary */}
      {analytics.monthly_summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card">
            <p className="text-frost-3 text-sm font-semibold mb-2">Monthly Income</p>
            <p className="text-4xl font-bold text-aurora-2">
              ${analytics.monthly_summary.total_income?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-frost-3 text-sm font-semibold mb-2">Monthly Expenses</p>
            <p className="text-4xl font-bold text-aurora-0">
              ${analytics.monthly_summary.total_expenses?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-frost-3 text-sm font-semibold mb-2">Net</p>
            <p className={`text-4xl font-bold ${
              (analytics.monthly_summary.net || 0) >= 0 ? 'text-aurora-2' : 'text-aurora-0'
            }`}>
              ${analytics.monthly_summary.net?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {analytics.category_breakdown && (
        <div className="card" role="region" aria-label="Spending by category">
          <h3 className="text-xl font-bold text-white mb-6">Spending by Category</h3>
          <div className="space-y-5">
            {analytics.category_breakdown.categories?.map((cat: any, idx: number) => (
              <div key={cat.category_id || cat.category_name} style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-white">{cat.category_name}</span>
                  <span className="text-frost-3">
                    ${cat.amount?.toFixed(2)} ({cat.percentage?.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-nord-1/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-frost-3 to-frost-2 transition-all duration-500"
                    style={{ width: `${cat.percentage || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-br from-frost-3/10 to-aurora-2/10 border border-frost-3/20 rounded-lg p-6">
        <p className="text-white text-sm">
          <strong className="text-frost-3">💡 Insight:</strong> Use these analytics to understand your spending patterns and identify areas where you can save money. Set realistic budgets based on your actual spending.
        </p>
      </div>
    </div>
  )
}
