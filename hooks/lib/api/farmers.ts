import { supabase } from '@/hooks/lib/supabase'
import type { Farmer } from '@/types'

export async function createFarmer(farmerData: { id: string; email?: string; name?: string; full_name?: string; bird_types?: string[] }) {
  const { data, error } = await supabase
    .from('farmers')
    .upsert([{
      id: farmerData.id,
      email: farmerData.email,
      full_name: farmerData.full_name,
      farm_type: 'Poultry',
      bird_types: farmerData.bird_types || ['Layers'] as any[],
    }])
    .select()
    .single()

  if (error) throw error
  return data as Farmer
}

export async function getFarmerByEmail(email: string) {
  const { data, error } = await supabase
    .from('farmers')
    .select('*')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as Farmer | null
}

export async function getFarmerById(id: string) {
  const { data, error } = await supabase
    .from('farmers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Farmer
}

export async function updateFarmer(id: string, updates: Partial<Farmer>, farmerId: string) {
   // Ownership validation: ensure the farmer being updated belongs to the authenticated user
   if (id !== farmerId) {
     throw new Error("Unauthorized: can only update own farmer record")
   }
   
   const { data, error } = await supabase
     .from('farmers')
     .update({ ...updates, updated_at: new Date().toISOString() })
     .eq('id', id)
     .select()
     .single()

   if (error) throw error
   return data as Farmer
 }

export async function getAllFarmers() {
  const { data, error } = await supabase
    .from('farmers')
    .select('*')

  if (error) throw error
  return data as Farmer[]
}