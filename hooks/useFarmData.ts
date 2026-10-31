import { useState, useEffect, useCallback } from 'react'
import { getDailyRecords, createDailyRecord, deleteDailyRecord, getFarmStats } from '@/hooks/lib/api/daily-records'
import { getHealthLogs, createHealthLog, deleteHealthLog } from '@/hooks/lib/api/health-logs'
import { getExpenses, createExpense, deleteExpense, getTotalExpenses } from '@/hooks/lib/api/expenses'
import { getBatches, createBatch, updateBatchCount, deleteBatch } from '@/hooks/lib/api/batches'
import { getInventory, createInventoryItem, updateInventoryQuantity, deleteInventoryItem } from '@/hooks/lib/api/inventory'
import type { DailyRecord, DailyRecordInput, HealthLog, Expense, Batch, Inventory, FarmStats } from '@/types'
import { toast } from 'sonner'

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

const DEMO_RECORDS: DailyRecord[] = [
   { id: 'demo-1', farmer_id: 'demo', feed_bags_used: 5, feed_cost: 2500, mortality_count: 0, production_amt: 85, sales_amount: 17000, egg_sales_amount: 17000, bird_sales_amount: 0, manure_sales_amount: 0, record_date: '2026-04-28', created_at: '2026-04-28T00:00:00Z' },
   { id: 'demo-2', farmer_id: 'demo', feed_bags_used: 6, feed_cost: 3000, mortality_count: 1, production_amt: 92, sales_amount: 18400, egg_sales_amount: 18400, bird_sales_amount: 0, manure_sales_amount: 0, record_date: '2026-04-29', created_at: '2026-04-29T00:00:00Z' },
   { id: 'demo-3', farmer_id: 'demo', feed_bags_used: 5, feed_cost: 2500, mortality_count: 0, production_amt: 88, sales_amount: 17600, egg_sales_amount: 17600, bird_sales_amount: 0, manure_sales_amount: 0, record_date: '2026-04-30', created_at: '2026-04-30T00:00:00Z' },
   { id: 'demo-4', farmer_id: 'demo', feed_bags_used: 7, feed_cost: 3500, mortality_count: 2, production_amt: 78, sales_amount: 15600, egg_sales_amount: 15600, bird_sales_amount: 0, manure_sales_amount: 0, record_date: '2026-05-01', created_at: '2026-05-01T00:00:00Z' },
   { id: 'demo-5', farmer_id: 'demo', feed_bags_used: 6, feed_cost: 3000, mortality_count: 0, production_amt: 95, sales_amount: 19000, egg_sales_amount: 19000, bird_sales_amount: 0, manure_sales_amount: 0, record_date: '2026-05-02', created_at: '2026-05-02T00:00:00Z' },
   { id: 'demo-6', farmer_id: 'demo', feed_bags_used: 5, feed_cost: 2500, mortality_count: 1, production_amt: 82, sales_amount: 16400, egg_sales_amount: 16400, bird_sales_amount: 0, manure_sales_amount: 0, record_date: '2026-05-03', created_at: '2026-05-03T00:00:00Z' },
   { id: 'demo-7', farmer_id: 'demo', feed_bags_used: 6, feed_cost: 3000, mortality_count: 0, production_amt: 90, sales_amount: 18000, egg_sales_amount: 18000, bird_sales_amount: 0, manure_sales_amount: 0, record_date: '2026-05-04', created_at: '2026-05-04T00:00:00Z' },
 ]

const DEMO_BATCHES: Batch[] = [
  { id: 'demo-batch-1', farmer_id: 'demo', batch_name: 'Layer Batch A', animal_type: 'Layers', initial_count: 100, current_count: 95, acquired_date: '2026-01-15', created_at: '2026-01-15T00:00:00Z' },
  { id: 'demo-batch-2', farmer_id: 'demo', batch_name: 'Broiler Batch B', animal_type: 'Broilers', initial_count: 50, current_count: 48, acquired_date: '2026-03-01', created_at: '2026-03-01T00:00:00Z' },
]

const DEMO_INVENTORY: Inventory[] = [
  { id: 'demo-inv-1', farmer_id: 'demo', item_name: 'Layer Feed', quantity: 20, unit: 'bags', reorder_level: 10, created_at: '2026-01-15T00:00:00Z' },
  { id: 'demo-inv-2', farmer_id: 'demo', item_name: 'Medicine', quantity: 5, unit: 'units', reorder_level: 3, created_at: '2026-02-01T00:00:00Z' },
]

const DEMO_STATS: FarmStats = {
  totalSales: 121000,
  totalMortality: 4,
  avgProduction: 86.3,
  totalFeedCost: 17500,
}

function getDemoData() {
  if (typeof window !== 'undefined' && document.cookie.includes('demo_mode=true')) {
    return {
      records: DEMO_RECORDS,
      batches: DEMO_BATCHES,
      inventory: DEMO_INVENTORY,
      stats: DEMO_STATS,
      healthLogs: [],
      expenses: [],
      totalExpenses: 0,
    }
  }
  return null
}

export function useFarmData(farmerId: string | null) {
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

  const refresh = useCallback(async () => {
    if (!farmerId) return
    
    const demoData = getDemoData()
    if (demoData) {
      setState({
        records: demoData.records,
        healthLogs: demoData.healthLogs,
        expenses: demoData.expenses,
        batches: demoData.batches,
        inventory: demoData.inventory,
        stats: demoData.stats,
        totalExpenses: demoData.totalExpenses,
        loading: false,
        error: null
      })
      return
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const [records, healthLogs, expenses, batches, inventory, stats, totalExpenses] = await Promise.all([
        getDailyRecords(farmerId),
        getHealthLogs(farmerId),
        getExpenses(farmerId),
        getBatches(farmerId),
        getInventory(farmerId),
        getFarmStats(farmerId),
        getTotalExpenses(farmerId)
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch farm data'
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: message 
      }))
    }
  }, [farmerId])

  useEffect(() => {
    if (!farmerId) return
    
    const demoData = getDemoData()
    if (demoData) {
      setState({
        records: demoData.records,
        healthLogs: demoData.healthLogs,
        expenses: demoData.expenses,
        batches: demoData.batches,
        inventory: demoData.inventory,
        stats: demoData.stats,
        totalExpenses: demoData.totalExpenses,
        loading: false,
        error: null
      })
      return
    }
    
    let cancelled = false
    
    const loadData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      try {
        const [records, healthLogs, expenses, batches, inventory, stats, totalExpenses] = await Promise.all([
          getDailyRecords(farmerId),
          getHealthLogs(farmerId),
          getExpenses(farmerId),
          getBatches(farmerId),
          getInventory(farmerId),
          getFarmStats(farmerId),
          getTotalExpenses(farmerId)
        ])
        
        if (!cancelled) {
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
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to fetch farm data'
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: message 
          }))
        }
      }
    }
    
    loadData()
    
    return () => {
      cancelled = true
    }
  }, [farmerId])

  const addRecord = async (record: Omit<DailyRecordInput, 'farmer_id'>) => {
    if (!farmerId) return { success: false, error: 'No farmer ID' }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const sanitized = {
        ...record,
        feed_bags_used: parseFloat(String(record.feed_bags_used)) || 0,
        feed_cost: parseFloat(String(record.feed_cost)) || 0,
        mortality_count: parseInt(String(record.mortality_count), 10) || 0,
        production_amt: parseInt(String(record.production_amt), 10) || 0,
        egg_sales_amount: parseFloat(String(record.egg_sales_amount)) || 0,
        bird_sales_amount: parseFloat(String(record.bird_sales_amount)) || 0,
        manure_sales_amount: parseFloat(String(record.manure_sales_amount)) || 0,
      }

      await createDailyRecord({ ...sanitized, farmer_id: farmerId }, controller.signal)
      await refresh()
      toast.success('Record saved successfully!')
      return { success: true }
    } catch (err: unknown) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError'
      const message = isTimeout
        ? 'Request timed out. Please check your connection and try again.'
        : err instanceof Error
          ? err.message
          : 'Failed to save record'

      if (isTimeout) {
        toast.error('Timeout: Server did not respond in time.')
      } else {
        toast.error('Error: ' + message)
      }

      return { success: false, error: message }
    } finally {
      clearTimeout(timeoutId)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const removeRecord = async (id: string) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      await deleteDailyRecord(id, controller.signal)
      await refresh()
      toast.success('Record deleted successfully!')
      return { success: true }
    } catch (err: unknown) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError'
      const message = isTimeout
        ? 'Request timed out. Please check your connection.'
        : err instanceof Error
          ? err.message
          : 'Failed to delete record'

      if (isTimeout) {
        toast.error('Timeout: Server did not respond in time.')
      } else {
        toast.error('Error: ' + message)
      }

      return { success: false, error: message }
    } finally {
      clearTimeout(timeoutId)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const addHealthLog = async (log: Omit<HealthLog, 'id' | 'created_at' | 'farmer_id'>) => {
    if (!farmerId) return { success: false, error: 'No farmer ID' }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      await createHealthLog({ ...log, farmer_id: farmerId }, controller.signal)
      await refresh()
      toast.success('Health log saved successfully!')
      return { success: true }
    } catch (err: unknown) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError'
      const message = isTimeout
        ? 'Request timed out. Please check your connection.'
        : err instanceof Error
          ? err.message
          : 'Failed to save health log'

      if (isTimeout) {
        toast.error('Timeout: Server did not respond in time.')
      } else {
        toast.error('Error: ' + message)
      }

      return { success: false, error: message }
    } finally {
      clearTimeout(timeoutId)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const removeHealthLog = async (id: string) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      await deleteHealthLog(id, controller.signal)
      await refresh()
      toast.success('Health log deleted successfully!')
      return { success: true }
    } catch (err: unknown) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError'
      const message = isTimeout
        ? 'Request timed out. Please check your connection.'
        : err instanceof Error
          ? err.message
          : 'Failed to delete health log'

      if (isTimeout) {
        toast.error('Timeout: Server did not respond in time.')
      } else {
        toast.error('Error: ' + message)
      }

      return { success: false, error: message }
    } finally {
      clearTimeout(timeoutId)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const addExpense = async (expense: Omit<Expense, 'id' | 'created_at' | 'farmer_id'>) => {
    if (!farmerId) return { success: false, error: 'No farmer ID' }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      await createExpense({ ...expense, farmer_id: farmerId }, controller.signal)
      await refresh()
      toast.success('Expense saved successfully!')
      return { success: true }
    } catch (err: unknown) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError'
      const message = isTimeout
        ? 'Request timed out. Please check your connection.'
        : err instanceof Error
          ? err.message
          : 'Failed to save expense'

      if (isTimeout) {
        toast.error('Timeout: Server did not respond in time.')
      } else {
        toast.error('Error: ' + message)
      }

      return { success: false, error: message }
    } finally {
      clearTimeout(timeoutId)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const removeExpense = async (id: string) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      await deleteExpense(id, controller.signal)
      await refresh()
      toast.success('Expense deleted successfully!')
      return { success: true }
    } catch (err: unknown) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError'
      const message = isTimeout
        ? 'Request timed out. Please check your connection.'
        : err instanceof Error
          ? err.message
          : 'Failed to delete expense'

      if (isTimeout) {
        toast.error('Timeout: Server did not respond in time.')
      } else {
        toast.error('Error: ' + message)
      }

      return { success: false, error: message }
    } finally {
      clearTimeout(timeoutId)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const addBatch = async (batch: Omit<Batch, 'id' | 'created_at' | 'farmer_id' | 'current_count'>) => {
    if (!farmerId) return { success: false, error: 'No farmer ID' }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      await createBatch({ ...batch, farmer_id: farmerId }, controller.signal)
      await refresh()
      toast.success('Batch added successfully!')
      return { success: true }
    } catch (err: unknown) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError'
      const message = isTimeout
        ? 'Request timed out. Please check your connection.'
        : err instanceof Error
          ? err.message
          : 'Failed to add batch'

      if (isTimeout) {
        toast.error('Timeout: Server did not respond in time.')
      } else {
        toast.error('Error: ' + message)
      }

      return { success: false, error: message }
    } finally {
      clearTimeout(timeoutId)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const updateBatch = async (id: string, newCount: number) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      await updateBatchCount(id, newCount, controller.signal)
      await refresh()
      toast.success('Batch updated successfully!')
      return { success: true }
    } catch (err: unknown) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError'
      const message = isTimeout
        ? 'Request timed out. Please check your connection.'
        : err instanceof Error
          ? err.message
          : 'Failed to update batch'

      if (isTimeout) {
        toast.error('Timeout: Server did not respond in time.')
      } else {
        toast.error('Error: ' + message)
      }

      return { success: false, error: message }
    } finally {
      clearTimeout(timeoutId)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const removeBatch = async (id: string) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      await deleteBatch(id, controller.signal)
      await refresh()
      toast.success('Batch deleted successfully!')
      return { success: true }
    } catch (err: unknown) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError'
      const message = isTimeout
        ? 'Request timed out. Please check your connection.'
        : err instanceof Error
          ? err.message
          : 'Failed to delete batch'

      if (isTimeout) {
        toast.error('Timeout: Server did not respond in time.')
      } else {
        toast.error('Error: ' + message)
      }

      return { success: false, error: message }
    } finally {
      clearTimeout(timeoutId)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const addInventoryItem = async (item: Omit<Inventory, 'id' | 'created_at' | 'farmer_id'>) => {
    if (!farmerId) return { success: false, error: 'No farmer ID' }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      await createInventoryItem({ ...item, farmer_id: farmerId }, controller.signal)
      await refresh()
      toast.success('Inventory item added successfully!')
      return { success: true }
    } catch (err: unknown) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError'
      const message = isTimeout
        ? 'Request timed out. Please check your connection.'
        : err instanceof Error
          ? err.message
          : 'Failed to add inventory item'

      if (isTimeout) {
        toast.error('Timeout: Server did not respond in time.')
      } else {
        toast.error('Error: ' + message)
      }

      return { success: false, error: message }
    } finally {
      clearTimeout(timeoutId)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const updateInventory = async (id: string, quantity: number) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      await updateInventoryQuantity(id, quantity, controller.signal)
      await refresh()
      toast.success('Inventory updated successfully!')
      return { success: true }
    } catch (err: unknown) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError'
      const message = isTimeout
        ? 'Request timed out. Please check your connection.'
        : err instanceof Error
          ? err.message
          : 'Failed to update inventory'

      if (isTimeout) {
        toast.error('Timeout: Server did not respond in time.')
      } else {
        toast.error('Error: ' + message)
      }

      return { success: false, error: message }
    } finally {
      clearTimeout(timeoutId)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const removeInventoryItem = async (id: string) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      await deleteInventoryItem(id, controller.signal)
      await refresh()
      toast.success('Inventory item deleted successfully!')
      return { success: true }
    } catch (err: unknown) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError'
      const message = isTimeout
        ? 'Request timed out. Please check your connection.'
        : err instanceof Error
          ? err.message
          : 'Failed to delete inventory item'

      if (isTimeout) {
        toast.error('Timeout: Server did not respond in time.')
      } else {
        toast.error('Error: ' + message)
      }

      return { success: false, error: message }
    } finally {
      clearTimeout(timeoutId)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

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