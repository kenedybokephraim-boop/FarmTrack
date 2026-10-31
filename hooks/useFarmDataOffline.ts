import { useState, useEffect, useCallback } from 'react'
import { 
  getDailyRecords, createDailyRecord, deleteDailyRecord, getFarmStats 
} from '@/hooks/lib/api/daily-records'
import { getHealthLogs, createHealthLog, deleteHealthLog } from '@/hooks/lib/api/health-logs'
import { getExpenses, createExpense, deleteExpense, getTotalExpenses } from '@/hooks/lib/api/expenses'
import { getBatches, createBatch, updateBatchCount, deleteBatch } from '@/hooks/lib/api/batches'
import { getInventory, createInventoryItem, updateInventoryQuantity, deleteInventoryItem } from '@/hooks/lib/api/inventory'
import type { DailyRecord, DailyRecordInput, HealthLog, Expense, Batch, Inventory, FarmStats } from '@/types'

interface FarmDataState {
  records: DailyRecord[]
  healthLogs: HealthLog[]
  expenses: Expense[]
  batches: Batch[]
  inventory: Inventory[]
  stats: FarmStats | null
  totalExpenses: number
  loading: boolean
  error: string | null
}

export function useFarmDataOffline(farmerId: string | null) {
  const [state, setState] = useState<FarmDataState>({
    records: [],
    healthLogs: [],
    expenses: [],
    batches: [],
    inventory: [],
    stats: null,
    totalExpenses: 0,
    loading: false,
    error: null
  })

  const loadData = useCallback(async (farmerIdValue: string) => {
    try {
      const [records, healthLogs, expenses, batches, inventory, stats, totalExpenses] = await Promise.all([
        getDailyRecords(farmerIdValue),
        getHealthLogs(farmerIdValue),
        getExpenses(farmerIdValue),
        getBatches(farmerIdValue),
        getInventory(farmerIdValue),
        getFarmStats(farmerIdValue),
        getTotalExpenses(farmerIdValue)
      ])

      setState({
        records,
        healthLogs,
        expenses,
        batches,
        inventory,
        stats,
        totalExpenses,
        loading: false,
        error: null
      })

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch farm data'
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: message 
      }))
      return false
    }
  }, [])

  const refresh = useCallback(async () => {
    if (!farmerId) return
    setState(prev => ({ ...prev, loading: true, error: null }))
    await loadData(farmerId)
  }, [farmerId, loadData])

  useEffect(() => {
    if (!farmerId) return
    
    let cancelled = false

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const success = await loadData(farmerId)
      if (cancelled) return
      if (!success) {
        setState(prev => ({ ...prev, loading: false }))
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [farmerId, loadData])

  const addRecord = useCallback(async (record: Omit<DailyRecordInput, 'farmer_id'>) => {
    if (!farmerId) return { success: false, error: 'No farmer ID' }

    try {
      await createDailyRecord({ ...record, farmer_id: farmerId })
      await refresh()
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save record'
      return { success: false, error: message }
    }
  }, [farmerId, refresh])

  const removeRecord = useCallback(async (id: string) => {
    if (!farmerId) return { success: false, error: 'No farmer ID' }

    try {
      await deleteDailyRecord(id)
      await refresh()
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete record'
      return { success: false, error: message }
    }
  }, [farmerId, refresh])

  const addHealthLog = useCallback(async (log: Omit<HealthLog, 'id' | 'created_at' | 'farmer_id'>) => {
    if (!farmerId) return { success: false, error: 'No farmer ID' }

    try {
      await createHealthLog({ ...log, farmer_id: farmerId })
      await refresh()
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save health log'
      return { success: false, error: message }
    }
  }, [farmerId, refresh])

  const removeHealthLog = useCallback(async (id: string) => {
    if (!farmerId) return { success: false, error: 'No farmer ID' }

    try {
      await deleteHealthLog(id)
      await refresh()
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete health log'
      return { success: false, error: message }
    }
  }, [farmerId, refresh])

  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'created_at' | 'farmer_id'>) => {
    if (!farmerId) return { success: false, error: 'No farmer ID' }

    try {
      await createExpense({ ...expense, farmer_id: farmerId })
      await refresh()
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save expense'
      return { success: false, error: message }
    }
  }, [farmerId, refresh])

  const removeExpense = useCallback(async (id: string) => {
    if (!farmerId) return { success: false, error: 'No farmer ID' }

    try {
      await deleteExpense(id)
      await refresh()
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete expense'
      return { success: false, error: message }
    }
  }, [farmerId, refresh])

  const addBatch = useCallback(async (batch: Omit<Batch, 'id' | 'created_at' | 'farmer_id'>) => {
    if (!farmerId) return { success: false, error: 'No farmer ID' }

    try {
      await createBatch({ ...batch, farmer_id: farmerId })
      await refresh()
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save batch'
      return { success: false, error: message }
    }
  }, [farmerId, refresh])

  const updateBatch = useCallback(async (id: string, newCount: number) => {
    if (!farmerId) return { success: false, error: 'No farmer ID' }

    try {
      await updateBatchCount(id, newCount)
      await refresh()
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update batch'
      return { success: false, error: message }
    }
  }, [farmerId, refresh])

  const removeBatch = useCallback(async (id: string) => {
    if (!farmerId) return { success: false, error: 'No farmer ID' }

    try {
      await deleteBatch(id)
      await refresh()
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete batch'
      return { success: false, error: message }
    }
  }, [farmerId, refresh])

  const addInventoryItem = useCallback(async (item: Omit<Inventory, 'id' | 'created_at' | 'farmer_id'>) => {
    if (!farmerId) return { success: false, error: 'No farmer ID' }

    try {
      await createInventoryItem({ ...item, farmer_id: farmerId })
      await refresh()
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save inventory item'
      return { success: false, error: message }
    }
  }, [farmerId, refresh])

  const updateInventory = useCallback(async (id: string, quantity: number) => {
    if (!farmerId) return { success: false, error: 'No farmer ID' }

    try {
      await updateInventoryQuantity(id, quantity)
      await refresh()
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update inventory'
      return { success: false, error: message }
    }
  }, [farmerId, refresh])

  const removeInventoryItem = useCallback(async (id: string) => {
    if (!farmerId) return { success: false, error: 'No farmer ID' }

    try {
      await deleteInventoryItem(id)
      await refresh()
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete inventory item'
      return { success: false, error: message }
    }
  }, [farmerId, refresh])

  return {
    ...state,
    refresh,
    addRecord,
    removeRecord,
    addHealthLog,
    removeHealthLog,
    addExpense,
    removeExpense,
    addBatch,
    updateBatch,
    removeBatch,
    addInventoryItem,
    updateInventory,
    removeInventoryItem
  }
}
