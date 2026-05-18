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
  
  // Check if it's already archived
  const { data: prod } = await supabase.from('products').select('status').eq('id', productId).single()

  if (prod?.status === 'archived') {
    // HARD DELETE se já estiver arquivado (Lixeira definitiva)
    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) {
      console.error('Erro ao deletar definitivamente o produto:', error)
      return { success: false, error: 'Não foi possível deletar o produto definitivamente. Verifique se ele não possui vendas atreladas.' }
    }
  } else {
    // SOFT DELETE (Move para a lixeira/arquivado)
    const { error } = await supabase
      .from('products')
      .update({ status: 'archived' })
      .eq('id', productId)

    if (error) {
      console.error('Erro ao arquivar produto:', error)
      return { success: false, error: 'Erro ao arquivar produto.' }
    }
  }

  revalidatePath('/admin/produtos')
  return { success: true }
}
