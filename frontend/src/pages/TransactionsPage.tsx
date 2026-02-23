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

  if (loading) return <div className="text-center py-12 text-gray-400">Loading transactions...</div>

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-100">Transactions</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors font-medium"
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
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-100 mb-6">Add Transaction</h3>
          <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
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
              <label className="block text-sm font-medium text-gray-400">Type</label>
              <select
                value={formData.transaction_type}
                onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Description"
              />
            </div>

            <button type="submit" className="col-span-1 md:col-span-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all font-medium shadow-lg">
              Add Transaction
            </button>
          </form>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Description</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Amount</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No transactions yet. Add one to get started!
                  </td>
                </tr>
              ) : (
                transactions.filter(t => !t.is_deleted).map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(txn.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{txn.category_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{txn.description}</td>
                    <td className={`px-6 py-4 text-sm font-semibold text-right ${
                      txn.transaction_type === 'INCOME' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {txn.transaction_type === 'INCOME' ? '+' : '-'}${Math.abs(txn.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(txn.id)}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
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

