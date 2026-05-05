'use server'

import { createServerSupabaseClient } from '@kings/db/server'

export async function getMsuCommissionRate() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('brands').select('settings').eq('name', 'msu').single()
  
  if (data?.settings && typeof data.settings.commission_rate === 'number') {
    return data.settings.commission_rate
  }
  return 10 // Padrão
}

export async function updateMsuCommissionRate(rate: number) {
  const supabase = await createServerSupabaseClient()
  
  // Buscar os settings atuais para não sobrescrever a cor primária, etc.
  const { data } = await supabase.from('brands').select('settings').eq('name', 'msu').single()
  const currentSettings = data?.settings || {}
  
  const newSettings = { ...currentSettings, commission_rate: rate }
  
  const { error } = await supabase.from('brands').update({ settings: newSettings }).eq('name', 'msu')
  
  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true }
}
