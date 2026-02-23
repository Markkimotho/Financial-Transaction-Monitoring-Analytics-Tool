import { useEffect, useState } from 'react'
import { transactionAPI, categoryAPI } from '@/api/client'

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

  if (loading) return <div className="text-center py-8">Loading transactions...</div>
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add Transaction'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-bold">Error: {error}</p>
          <p className="text-sm mt-2">Check browser console for more details</p>
        </div>
      )}

      {showForm && (
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4">Add Transaction</h3>
          <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="label">Type</label>
              <select
                value={formData.transaction_type}
                onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                className="input"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input"
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                placeholder="Description"
              />
            </div>

            <button type="submit" className="btn-primary col-span-full">
              Add Transaction
            </button>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No transactions yet. Add one to get started!
          </div>
        ) : (
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.filter(t => !t.is_deleted).map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(transaction.transaction_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {transaction.category_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`badge ${
                    transaction.transaction_type === 'EXPENSE' ? 'badge-danger' :
                    transaction.transaction_type === 'INCOME' ? 'badge-success' :
                    'badge-info'
                  }`}>
                    {transaction.transaction_type}
                  </span>
                </td>
                <td className={`px-6 py-4 text-sm font-semibold text-right ${
                  transaction.transaction_type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {transaction.transaction_type === 'EXPENSE' ? '-' : '+'}${transaction.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  )
}
