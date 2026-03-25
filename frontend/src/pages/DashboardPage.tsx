import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { transactionAPI, budgetAPI } from '@/api/client'
import { TrendingUp, Wallet, Target, ArrowDownLeft } from 'lucide-react'

interface Summary {
  total_transactions: number
  total_income: number
  total_expense: number
  this_month: number
  this_month_expense: number
}

export default function DashboardPage() {
  const navigate = useNavigate()
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
    return <div className="text-center py-12 text-nord-3 font-mono">▌ Loading dashboard...</div>
  }

  if (error) {
    return <div className="stat-card border-aurora1/50 bg-aurora1/10">{error}</div>
  }

  const netIncome = (summary?.total_income || 0) - (summary?.total_expense || 0)

  // Distinctive Stat Cards with asymmetric design
  const StatCard = ({ icon: Icon, label, value, subvalue, color = 'frost3', stagger = 0 }: any) => {
    const colorMap = {
      frost3: 'from-frost-3/20 to-frost-3/5 border-frost-3/40',
      frost2: 'from-frost-2/20 to-frost-2/5 border-frost-2/40',
      aurora3: 'from-aurora3/20 to-aurora3/5 border-aurora3/40',
      aurora4: 'from-aurora4/20 to-aurora4/5 border-aurora4/40',
    }
    
    return (
      <div 
        className={`stat-card bg-gradient-to-br ${colorMap[color as keyof typeof colorMap]} animate-stagger-${stagger + 1}`}
      >
        <div className="stat-card-content">
          <div className="flex items-start justify-between mb-6">
            <div className="flex flex-col gap-1">
              <p className="text-nord-3 text-sm font-mono uppercase tracking-wider">{label}</p>
              <p className="text-4xl font-display font-700 text-nord-5">{value}</p>
              {subvalue && <p className="text-xs text-nord-3 font-mono mt-1">{subvalue}</p>}
            </div>
            <Icon className="w-10 h-10 text-nord-3/40" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Asymmetric Bento Grid - Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Large Primary Card - 6 columns */}
        <div className="md:col-span-6 animate-stagger-1">
          <StatCard
            icon={Wallet}
            label="Net Income"
            value={`$${netIncome.toFixed(2)}`}
            subvalue={netIncome >= 0 ? '[POSITIVE] Positive flow' : '[NEGATIVE] Negative flow'}
            color={netIncome >= 0 ? 'aurora4' : 'aurora3'}
            stagger={1}
          />
        </div>

        {/* Secondary Cards - 3 columns each */}
        <div className="md:col-span-3 animate-stagger-2">
          <StatCard
            icon={TrendingUp}
            label="Total Income"
            value={`$${summary?.total_income?.toFixed(2) || '0.00'}`}
            color="frost3"
            stagger={2}
          />
        </div>
        
        <div className="md:col-span-3 animate-stagger-3">
          <StatCard
            icon={ArrowDownLeft}
            label="Total Expenses"
            value={`$${summary?.total_expense?.toFixed(2) || '0.00'}`}
            color="aurora1"
            stagger={3}
          />
        </div>

        {/* Bottom row - asymmetric layout */}
        <div className="md:col-span-4 animate-stagger-4">
          <StatCard
            icon={Target}
            label="Transactions"
            value={summary?.total_transactions || 0}
            color="frost2"
            stagger={4}
          />
        </div>

        <div className="md:col-span-8 animate-stagger-5">
          <div className="stat-card bg-gradient-to-br from-nord-2/40 to-nord-1/20 border-nord-3/40">
            <div className="stat-card-content">
              <h3 className="text-lg font-display font-600 text-nord-5 mb-6">This Month Overview</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-nord-3 text-xs font-mono uppercase tracking-wider mb-3">Transactions Count</p>
                  <p className="text-3xl font-display font-700 text-nord-5">{summary?.this_month || 0}</p>
                </div>
                <div>
                  <p className="text-nord-3 text-xs font-mono uppercase tracking-wider mb-3">Month Expenses</p>
                  <p className="text-3xl font-display font-700 text-aurora1">${summary?.this_month_expense?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Status - Full Width */}
      <div className="animate-stagger-6">
        <div className="stat-card bg-gradient-to-br from-nord-2/30 to-nord-1/10 border-frost-3/30">
          <div className="stat-card-content">
            <h3 className="text-lg font-display font-600 text-nord-5 mb-2">Budget Status</h3>
            <p className="text-nord-3 text-sm font-mono mb-6">{budgetSummary?.active_budgets || 0} active budgets</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {budgetSummary?.budgets?.slice(0, 3).map((budget: any) => {
                const percentageUsed = budget.percentage_used || 0
                const statusColor =
                  percentageUsed >= 100
                    ? 'from-aurora1/20 to-aurora1/5 border-aurora1/40'
                    : percentageUsed >= 80
                    ? 'from-aurora3/20 to-aurora3/5 border-aurora3/40'
                    : 'from-aurora4/20 to-aurora4/5 border-aurora4/40'
                
                return (
                  <div key={budget.id} className={`bg-gradient-to-br ${statusColor} border border-nord-3/30 rounded-2xl p-5 hover:shadow-lg transition-all duration-300`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-sm font-display font-600 text-nord-4">{budget.category_name}</span>
                      <span className="text-xs font-mono bg-nord-0/60 px-3 py-1 rounded-lg border border-nord-3/30">{percentageUsed.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-nord-0/40 rounded-full h-3 overflow-hidden border border-nord-3/20">
                      <div
                        className={`h-full transition-all duration-500 ${
                          percentageUsed >= 100 ? 'bg-gradient-to-r from-aurora1 to-aurora2' :
                          percentageUsed >= 80 ? 'bg-gradient-to-r from-aurora3 to-aurora2' :
                          'bg-gradient-to-r from-aurora4 to-frost-3'
                        }`}
                        style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-nord-3 font-mono mt-3">
                      ${budget.current_spending?.toFixed(2) || '0.00'} / ${budget.monthly_limit?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Terminal Style */}
      <div className="animate-stagger-1">
        <div className="stat-card bg-gradient-to-br from-nord-2/20 to-nord-1/5">
          <div className="stat-card-content">
            <h3 className="text-lg font-display font-600 text-nord-5 mb-6 font-mono">$ quick actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button 
                onClick={() => navigate('/transactions')}
                className="group relative overflow-hidden rounded-xl px-4 py-3 font-mono font-500 text-sm bg-frost-3/20 border border-frost-3/40 text-frost-3 hover:bg-frost-3/30 hover:border-frost-3/60 transition-all duration-200 hover:shadow-lg hover:shadow-frost-3/20 cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>[+]</span> Add Transaction
                </span>
              </button>
              
              <button 
                onClick={() => navigate('/budgets')}
                className="group relative overflow-hidden rounded-xl px-4 py-3 font-mono font-500 text-sm bg-frost-2/20 border border-frost-2/40 text-frost-2 hover:bg-frost-2/30 hover:border-frost-2/60 transition-all duration-200 hover:shadow-lg hover:shadow-frost-2/20 cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>[+]</span> Create Budget
                </span>
              </button>
              
              <button 
                onClick={() => navigate('/analytics')}
                className="group relative overflow-hidden rounded-xl px-4 py-3 font-mono font-500 text-sm bg-aurora4/20 border border-aurora4/40 text-aurora4 hover:bg-aurora4/30 hover:border-aurora4/60 transition-all duration-200 hover:shadow-lg hover:shadow-aurora4/20 cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>[*]</span> Analytics
                </span>
              </button>
              
              <button 
                onClick={() => navigate('/settings')}
                className="group relative overflow-hidden rounded-xl px-4 py-3 font-mono font-500 text-sm bg-aurora3/20 border border-aurora3/40 text-aurora3 hover:bg-aurora3/30 hover:border-aurora3/60 transition-all duration-200 hover:shadow-lg hover:shadow-aurora3/20 cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>[=]</span> Settings
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
