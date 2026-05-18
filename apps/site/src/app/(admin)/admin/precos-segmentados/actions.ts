'use server'

import { createAdminClient } from '@kings/db'
import { revalidatePath } from 'next/cache'

// Grupos
export async function createCustomerGroup(name: string, discount_percent: number, apply_to_all_products: boolean) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('customer_groups')
    .insert({ name, discount_percent, apply_to_all_products })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/precos-segmentados')
  return { success: true, data }
}

export async function updateCustomerGroup(id: string, name: string, discount_percent: number, apply_to_all_products: boolean) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('customer_groups')
    .update({ name, discount_percent, apply_to_all_products })
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

// Preços / Regras Específicas
export async function setSegmentedProductRule(
  product_id: string,
  group_id: string,
  rule: 'normal' | 'base_discount' | 'fixed',
  price: number | null,
  group_apply_to_all: boolean
) {
  const supabase = createAdminClient()

  let shouldDeleteRow = false;
  let rowStatus = 'active';
  let rowPrice = null;

  if (group_apply_to_all) {
    if (rule === 'base_discount') shouldDeleteRow = true; // inheriting default behavior
    else if (rule === 'normal') { rowStatus = 'ignored'; rowPrice = null; }
    else if (rule === 'fixed') { rowStatus = 'active'; rowPrice = price; }
  } else {
    if (rule === 'normal') shouldDeleteRow = true; // inheriting default behavior
    else if (rule === 'base_discount') { rowStatus = 'active'; rowPrice = null; }
    else if (rule === 'fixed') { rowStatus = 'active'; rowPrice = price; }
  }

  if (shouldDeleteRow) {
    const { error } = await supabase
      .from('segmented_prices')
      .delete()
      .eq('product_id', product_id)
      .eq('group_id', group_id)
    if (error) return { success: false, error: error.message }
  } else {
    // Upsert
    const { data: existing } = await supabase
      .from('segmented_prices')
      .select('id')
      .eq('product_id', product_id)
      .eq('group_id', group_id)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('segmented_prices')
        .update({ status: rowStatus, price: rowPrice })
        .eq('id', existing.id)
      if (error) return { success: false, error: error.message }
    } else {
      const { error } = await supabase
        .from('segmented_prices')
        .insert({ product_id, group_id, status: rowStatus, price: rowPrice })
      if (error) return { success: false, error: error.message }
    }
  }

  revalidatePath('/admin/precos-segmentados')
  return { success: true }
}
