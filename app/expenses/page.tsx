"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useFarmData } from "@/hooks/useFarmData"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { CURRENCY_SYMBOL, EXPENSE_CATEGORIES } from "@/hooks/lib/constants"

export default function ExpensesPage() {
  const router = useRouter()
  const { user, loading: authLoading, getStoredFarmerId } = useAuth()
  const farmerId = user?.id || getStoredFarmerId()
  
  const { expenses, totalExpenses, loading, addExpense, removeExpense, refresh } = useFarmData(farmerId)
  
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState("all")
  const [newExpense, setNewExpense] = useState({
    category: "Feed",
    description: "",
    amount: ""
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  const handleAddExpense = async () => {
    if (!newExpense.amount) return
    
    const result = await addExpense({
      category: newExpense.category,
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      expense_date: new Date().toISOString().split('T')[0]
    })
    
    if (result.success) {
      setNewExpense({ category: "Feed", description: "", amount: "" })
      setShowForm(false)
    }
  }

  const filteredExpenses = filter === "all" 
    ? expenses 
    : expenses.filter(e => e.category === filter)

  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount
    return acc
  }, {} as Record<string, number>)

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-5 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pt-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-green-500">FarmTrack</h1>
          <p className="text-gray-500 text-xs font-medium uppercase">Expenses</p>
        </div>
        <Button onClick={() => router.push("/dashboard")} variant="outline" size="sm">
          ← Back
        </Button>
      </div>

      {/* Total Summary */}
      <div className="bg-gray-900/20 p-4 rounded-2xl border border-gray-800 mb-6">
        <p className="text-gray-500 text-xs font-bold uppercase">Total Expenses</p>
        <p className="text-3xl font-bold text-red-400">
          {CURRENCY_SYMBOL}{totalExpenses.toLocaleString()}
        </p>
      </div>

      {/* Category Summary */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {Object.entries(categoryTotals).map(([cat, total]) => (
          <div key={cat} className="bg-gray-900/10 p-3 rounded-xl">
            <p className="text-gray-500 text-xs">{cat}</p>
            <p className="font-bold">{CURRENCY_SYMBOL}{total.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Add Expense Button */}
      <Button onClick={() => setShowForm(!showForm)} className="w-full mb-6">
        {showForm ? "Cancel" : "+ Add Expense"}
      </Button>

      {/* Expense Form */}
      {showForm && (
        <div className="bg-gray-900/20 p-4 rounded-2xl border border-gray-800 mb-6 space-y-4">
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Category</label>
            <select
              className="w-full p-4 rounded-xl bg-gray-900 border border-gray-800"
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <Input
            label="Description"
            placeholder="e.g. Feed from Agrited"
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
          />
          <Input
            type="number"
            label="Amount"
            placeholder="0"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
          />
          <Button onClick={handleAddExpense} className="w-full">
            Save Expense
          </Button>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
            filter === "all" ? "bg-green-600" : "bg-gray-800"
          }`}
        >
          All
        </button>
        {EXPENSE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
              filter === cat ? "bg-green-600" : "bg-gray-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((expense) => (
            <div key={expense.id} className="bg-gray-900/20 p-4 rounded-2xl border border-gray-800">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{expense.category}</h3>
                  {expense.description && (
                    <p className="text-gray-500 text-sm">{expense.description}</p>
                  )}
                  <p className="text-gray-600 text-xs mt-1">
                    {new Date(expense.expense_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-red-400">
                    {CURRENCY_SYMBOL}{expense.amount.toLocaleString()}
                  </p>
                  <button 
                    onClick={() => removeExpense(expense.id)}
                    className="text-red-500 text-xs font-bold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">💸</div>
            <p>No expenses yet</p>
          </div>
        )}
      </div>
    </div>
  )
}