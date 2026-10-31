import { supabase } from '@/hooks/lib/supabase'
import type { Inventory, InventoryInput } from '@/types'

export async function createInventoryItem(item: InventoryInput, signal?: AbortSignal) {
   const { data, error } = await supabase
     .from('inventory')
     .insert([item])
     .select()
     .single()
     

   if (error) throw error
   return data as Inventory
 }

export async function getInventory(farmerId: string) {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('farmer_id', farmerId)
    .order('item_name', { ascending: true })

  if (error) throw error
  return data as Inventory[]
}

export async function getInventoryItem(id: string) {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Inventory
}

export async function updateInventoryItem(id: string, updates: Partial<Inventory>, farmerId?: string, signal?: AbortSignal) {
   const { data, error } = await supabase
     .from('inventory')
     .update(updates)
     .eq('id', id)
     .eq('farmer_id', farmerId)
     .select()
     .single()


   if (error) throw error
   return data as Inventory
  }

export async function deleteInventoryItem(id: string, signal?: AbortSignal) {
     const { error } = await supabase
       .from('inventory')
       .delete()
       .eq('id', id)
       .abortSignal(signal ?? new AbortController().signal)

     if (error) throw error
   }

export async function getLowStockItems(farmerId: string) {
  const inventory = await getInventory(farmerId)
  return inventory.filter(item => 
    item.reorder_level && item.quantity <= item.reorder_level
  )
}

export async function updateInventoryQuantity(id: string, quantity: number, signal?: AbortSignal) {
    return updateInventoryItem(id, { quantity }, undefined, signal)
  }