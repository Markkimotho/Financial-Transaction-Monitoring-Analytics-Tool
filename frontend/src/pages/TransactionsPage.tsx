import { useEffect, useState } from 'react'
import { transactionAPI, categoryAPI } from '@/api/client'
import { Plus, Trash2 } from 'lucide-react'

interface Transaction {
  id: string
  category_name: string
  amount: number
  transaction_type: 'EXPENSE' | 'INCOME' | 'TRANSFER'
  description: string
  transaction_date: string
  is_deleted: boolean
}

interface Category {
  id: string
  name: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    transaction_type: 'EXPENSE',
    description: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txns, cats] = await Promise.all([
          transactionAPI.list({ limit: 50 }),
          categoryAPI.list(),
        ])
        setTransactions(txns.data.results || txns.data || [])
        setCategories(cats.data.results || cats.data || [])
      } catch (err: any) {
        console.error('Failed to load data:', err)
        const errorMsg = err.response?.data?.detail || err.message || 'Failed to load transactions'
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await transactionAPI.create({
        ...formData,
        amount: parseFloat(formData.amount),
        transaction_date: new Date().toISOString(),
      })
      setTransactions([response.data, ...transactions])
      setFormData({
        category: '',
        amount: '',
        transaction_type: 'EXPENSE',
        description: '',
      })
      setShowForm(false)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create transaction')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return
    try {
      await transactionAPI.delete(id)
      setTransactions(transactions.map(t =>
        t.id === id ? { ...t, is_deleted: true } : t
      ))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete transaction')
    }
  }

  if (loading) return <div className="text-center py-12 text-frost-3">Loading transactions...</div>

  return (
    <div className="space-y-8 max-w-6xl animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white">Transactions</h1>
        <p className="text-frost-3">Manage your financial records</p>
      </div>

      {/* Add Transaction Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-frost-3 to-frost-2 hover:from-frost-2 hover:to-frost-1 text-nord-0 font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
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
          <h3 className="text-xl font-bold text-white mb-6">Add Transaction</h3>
          <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-frost-3">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-nord-1/50 border border-frost-3/20 rounded-lg text-white placeholder-nord-3 focus:outline-none focus:border-frost-3/50 focus:ring-1 focus:ring-frost-3/30 transition-colors font-display"
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
              <label className="block text-sm font-semibold text-frost-3">Type</label>
              <select
                value={formData.transaction_type}
                onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                className="w-full px-4 py-3 bg-nord-1/50 border border-frost-3/20 rounded-lg text-white focus:outline-none focus:border-frost-3/50 focus:ring-1 focus:ring-frost-3/30 transition-colors font-display"
              >
                <option value="EXPENSE" className="bg-nord-0">Expense</option>
                <option value="INCOME" className="bg-nord-0">Income</option>
                <option value="TRANSFER" className="bg-nord-0">Transfer</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-frost-3">Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-3 bg-nord-1/50 border border-frost-3/20 rounded-lg text-white placeholder-nord-3 focus:outline-none focus:border-frost-3/50 focus:ring-1 focus:ring-frost-3/30 transition-colors font-display"
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-frost-3">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-nord-1/50 border border-frost-3/20 rounded-lg text-white placeholder-nord-3 focus:outline-none focus:border-frost-3/50 focus:ring-1 focus:ring-frost-3/30 transition-colors font-display"
                placeholder="Description"
              />
            </div>

            <button type="submit" className="col-span-1 md:col-span-2 btn-primary">
              Add Transaction
            </button>
          </form>
        </div>
      )}

      {/* Transactions List */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-frost-3/20 bg-nord-1/30">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-frost-3">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-frost-3">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-frost-3">Description</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-frost-3">Amount</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-frost-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-frost-3/10">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-nord-3">
                    No transactions yet. Add one to get started!
                  </td>
                </tr>
              ) : (
                transactions.filter(t => !t.is_deleted).map((txn, idx) => (
                  <tr key={txn.id} className="hover:bg-nord-1/30 transition-colors" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <td className="px-6 py-4 text-sm text-white">
                      {new Date(txn.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">{txn.category_name}</td>
                    <td className="px-6 py-4 text-sm text-frost-3">{txn.description}</td>
                    <td className={`px-6 py-4 text-sm font-semibold text-right ${
                      txn.transaction_type === 'INCOME' ? 'text-aurora-2' : 'text-aurora-0'
                    }`}>
                      {txn.transaction_type === 'INCOME' ? '+' : '-'}${Math.abs(txn.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(txn.id)}
                        className="p-2 hover:bg-aurora-0/20 text-aurora-0 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

