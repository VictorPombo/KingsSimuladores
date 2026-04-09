'use server'

import { createAdminClient } from '@kings/db'
import { revalidatePath } from 'next/cache'

// Grupos
export async function createCustomerGroup(name: string, discount_percent: number) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('customer_groups')
    .insert({ name, discount_percent })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/precos-segmentados')
  return { success: true, data }
}

export async function updateCustomerGroup(id: string, name: string, discount_percent: number) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('customer_groups')
    .update({ name, discount_percent })
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/precos-segmentados')
  return { success: true, data }
}

export async function deleteCustomerGroup(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('customer_groups')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/precos-segmentados')
  return { success: true }
}

// Preços Específicos
export async function setSegmentedPrice(product_id: string, group_id: string, price: number | null) {
  const supabase = createAdminClient()

  if (price === null) {
    // Remover override
    const { error } = await supabase
      .from('segmented_prices')
      .delete()
      .eq('product_id', product_id)
      .eq('group_id', group_id)
    if (error) return { success: false, error: error.message }
  } else {
    // Upsert novo preço usando supabase match
    // O Supabase postgREST suporta on-conflict se a tabela tiver constraint unique explícita configurada, 
    // mas se o pk for diferente, as vezes precisa de onConflict explícito.
    // Pra garantir, tentamos um update primeiro, ou um select then insert/update.
    const { data: existing } = await supabase
      .from('segmented_prices')
      .select('id')
      .eq('product_id', product_id)
      .eq('group_id', group_id)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('segmented_prices')
        .update({ price })
        .eq('id', existing.id)
      if (error) return { success: false, error: error.message }
    } else {
      const { error } = await supabase
        .from('segmented_prices')
        .insert({ product_id, group_id, price })
      if (error) return { success: false, error: error.message }
    }
  }

  revalidatePath('/admin/precos-segmentados')
  return { success: true }
}
