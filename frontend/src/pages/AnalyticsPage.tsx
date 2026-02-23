import { useEffect, useState } from 'react'
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

  if (loading) return <div className="text-center py-8">Loading analytics...</div>
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics & Reports</h1>

      {/* Savings Rate */}
      {analytics.savings_rate && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Savings Rate</h3>
          <div className="text-center">
            <div className="text-5xl font-bold text-green-600 mb-2">
              {analytics.savings_rate.savings_rate?.toFixed(1) || '0'}%
            </div>
            <p className="text-gray-600">
              of your income is being saved
            </p>
          </div>
        </div>
      )}

      {/* Monthly Summary */}
      {analytics.monthly_summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Monthly Income</p>
            <p className="text-3xl font-bold text-green-600">
              ${analytics.monthly_summary.total_income?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="card p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Monthly Expenses</p>
            <p className="text-3xl font-bold text-red-600">
              ${analytics.monthly_summary.total_expenses?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="card p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Net</p>
            <p className={`text-3xl font-bold ${
              (analytics.monthly_summary.net || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${analytics.monthly_summary.net?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {analytics.category_breakdown && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Spending by Category</h3>
          <div className="space-y-4">
            {analytics.category_breakdown.categories?.map((cat: any) => (
              <div key={cat.category_id || cat.category_name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-900">{cat.category_name}</span>
                  <span className="text-gray-600">
                    ${cat.amount?.toFixed(2)} ({cat.percentage?.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all"
                    style={{ width: `${cat.percentage || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <p className="text-blue-900 text-sm">
          💡 <strong>Tip:</strong> Use these analytics to understand your spending patterns and identify areas where you can save money. Set realistic budgets based on your actual spending.
        </p>
      </div>
    </div>
  )
}
