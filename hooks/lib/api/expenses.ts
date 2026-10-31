import { supabase } from '@/hooks/lib/supabase'
import type { Expense, ExpenseInput } from '@/types'

export async function createExpense(expense: ExpenseInput, signal?: AbortSignal) {
   const { data, error } = await supabase
     .from('expenses')
     .insert([expense])
     .select()
     .single()

   if (error) throw error
   return data as Expense
 }

export async function getExpenses(farmerId: string, limit = 50) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('farmer_id', farmerId)
    .order('expense_date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Expense[]
}

export async function updateExpense(id: string, updates: Partial<ExpenseInput>, farmerId: string) {
   const { data, error } = await supabase
     .from('expenses')
     .update(updates)
     .eq('id', id)
     .eq('farmer_id', farmerId)
     .select()
     .single()

   if (error) throw error
   return data as Expense
 }

export async function deleteExpense(id: string, signal?: AbortSignal) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .abortSignal(signal ?? new AbortController().signal)

    if (error) throw error
  }

export async function getExpensesByCategory(farmerId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select('category, amount')
    .eq('farmer_id', farmerId)

  if (error) throw error
  
  const categoryTotals: Record<string, number> = {}
  data.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount
  })
  
  return categoryTotals
}

export async function getTotalExpenses(farmerId: string): Promise<number> {
  const { data, error } = await supabase
    .from('expenses')
    .select('amount')
    .eq('farmer_id', farmerId)

  if (error) throw error
  return data.reduce((sum, exp) => sum + exp.amount, 0)
}