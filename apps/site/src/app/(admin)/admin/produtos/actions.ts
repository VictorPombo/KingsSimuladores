'use server'

import { createServerSupabaseClient } from '@kings/db/server'
import { revalidatePath } from 'next/cache'

export async function toggleProductStatus(productId: string, currentStatus: string) {
  const supabase = await createServerSupabaseClient()
  const newStatus = currentStatus === 'active' ? 'draft' : 'active'
  
  const { error } = await supabase
    .from('products')
    .update({ status: newStatus })
    .eq('id', productId)

  if (error) {
    console.error('Erro ao alterar status:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/produtos')
  return { success: true, newStatus }
}

export async function deleteProduct(productId: string) {
  const supabase = await createServerSupabaseClient()
  
  // Realiza um Soft Delete (Arquiva) ou Hard Delete
  // Para segurança em lojas, geralmente mudamos para 'archived' para não quebrar orders
  const { error } = await supabase
    .from('products')
    .update({ status: 'archived' })
    .eq('id', productId)

  if (error) {
    console.error('Erro ao arquivar/deletar produto:', error)
    return { success: false, error: 'Erro ao deletar produto. Pode estar vinculado a pedidos.' }
  }

  revalidatePath('/admin/produtos')
  return { success: true }
}
