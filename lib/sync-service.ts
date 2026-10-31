import type { SyncOperation } from '@/types'
// Storage key for pending sync operations
const PENDING_SYNC_KEY = 'farmtrack:pending-sync'

// Get pending operations from localStorage
function getPendingOperations(): SyncOperation[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(PENDING_SYNC_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to parse pending sync operations:', error)
    return []
  }
}

// Save pending operations to localStorage
function savePendingOperations(operations: SyncOperation[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(operations))
  } catch (error) {
    console.error('Failed to save pending sync operations:', error)
  }
}

// Add a pending operation
export async function addPendingOperation(operation: Omit<SyncOperation, 'id' | 'timestamp'>): Promise<string> {
  const operations = getPendingOperations()
  const newOperation: SyncOperation = {
    ...operation,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString()
  }
  
  operations.push(newOperation)
  savePendingOperations(operations)
  return newOperation.id
}

// Process pending sync operations
export async function processPendingSync(): Promise<{ success: number; failed: number }> {
  const operations = getPendingOperations()
  if (operations.length === 0) {
    return { success: 0, failed: 0 }
  }

  const supabase = await import('@/hooks/lib/supabase').then(module => module.supabase)
  
  let successCount = 0
  let failedCount = 0
  const remainingOperations: SyncOperation[] = []

  for (const operation of operations) {
    try {
      // Process based on operation type
      switch (operation.type) {
        case 'CREATE_ALERT':
          await supabase.from('ai_alerts').insert([operation.payload])
          break
        case 'UPDATE_ALERT':
          await supabase.from('ai_alerts').update(operation.payload).eq('id', operation.id)
          break
        case 'DELETE_ALERT':
          await supabase.from('ai_alerts').delete().eq('id', operation.id)
          break
        case 'CREATE_BATCH':
          await supabase.from('batches').insert([operation.payload])
          break
        case 'UPDATE_BATCH':
          await supabase.from('batches').update(operation.payload).eq('id', operation.id)
          break
        case 'DELETE_BATCH':
          await supabase.from('batches').delete().eq('id', operation.id)
          break
        // Add more operation types as needed
        default:
          console.warn(`Unknown sync operation type: ${operation.type}`)
          throw new Error(`Unknown operation type: ${operation.type}`)
      }
      
      successCount++
    } catch (error) {
      console.error(`Failed to process sync operation ${operation.id}:`, error)
      failedCount++
      // Keep failed operations for retry
      remainingOperations.push(operation)
    }
  }

  // Save remaining (failed) operations back to storage
  savePendingOperations(remainingOperations)
  
  return { success: successCount, failed: failedCount }
}

// Check if there are pending sync items
export async function hasPendingSyncItems(): Promise<boolean> {
  return getPendingOperations().length > 0
}

// Get count of pending sync items
export async function getPendingSyncCount(): Promise<number> {
  return getPendingOperations().length
}

// Clear all pending operations (use with caution)
export async function clearPendingSync(): Promise<void> {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(PENDING_SYNC_KEY)
  } catch (error) {
    console.error('Failed to clear pending sync operations:', error)
  }
}