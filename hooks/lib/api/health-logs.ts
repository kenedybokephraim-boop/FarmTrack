import { supabase } from '@/hooks/lib/supabase'
import type { HealthLog, HealthLogInput } from '@/types'

export async function createHealthLog(log: HealthLogInput, signal?: AbortSignal) {
   const { data, error } = await supabase
     .from('health_logs')
     .insert([log])
     .select()
     .single()
     

   if (error) throw error
   return data as HealthLog
 }

export async function getHealthLogs(farmerId: string, limit = 50) {
  const { data, error } = await supabase
    .from('health_logs')
    .select('*')
    .eq('farmer_id', farmerId)
    .order('record_date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as HealthLog[]
}

export async function updateHealthLog(id: string, updates: Partial<HealthLogInput>, farmerId: string) {
   const { data, error } = await supabase
     .from('health_logs')
     .update(updates)
     .eq('id', id)
     .eq('farmer_id', farmerId)
     .select()
     .single()

   if (error) throw error
   return data as HealthLog
 }

export async function deleteHealthLog(id: string, signal?: AbortSignal) {
    const { error } = await supabase
      .from('health_logs')
      .delete()
      .eq('id', id)
      .abortSignal(signal ?? new AbortController().signal)

    if (error) throw error
  }