import { supabase } from '@/hooks/lib/supabase'
import type { AIAlert, AIAlertInput } from '@/types'

export async function createAlert(alert: AIAlertInput) {
  const { data, error } = await supabase
    .from('ai_alerts')
    .insert([alert])
    .select()
    .single()

  if (error) throw error
  return data as AIAlert
}

export async function getAlerts(farmerId: string, limit = 20) {
  const { data, error } = await supabase
    .from('ai_alerts')
    .select('*')
    .eq('farmer_id', farmerId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as AIAlert[]
}

export async function getUnreadAlerts(farmerId: string) {
  const { data, error } = await supabase
    .from('ai_alerts')
    .select('*')
    .eq('farmer_id', farmerId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as AIAlert[]
}

export async function getUnreadAlertCount(farmerId: string): Promise<number> {
  const { data, error } = await supabase
    .from('ai_alerts')
    .select('id', { count: 'exact' })
    .eq('farmer_id', farmerId)
    .eq('is_read', false)

  if (error) throw error
  return data?.length || 0
}

export async function markAlertAsRead(id: string, farmerId: string) {
  const { error } = await supabase
    .from('ai_alerts')
    .update({ is_read: true })
    .eq('id', id)
    .eq('farmer_id', farmerId)

  if (error) throw error
}

export async function markAllAlertsAsRead(farmerId: string) {
  const { error } = await supabase
    .from('ai_alerts')
    .update({ is_read: true })
    .eq('farmer_id', farmerId)
    .eq('is_read', false)

  if (error) throw error
}

export async function deleteAlert(id: string, farmerId: string) {
  const { error } = await supabase
    .from('ai_alerts')
    .delete()
    .eq('id', id)
    .eq('farmer_id', farmerId)

  if (error) throw error
}