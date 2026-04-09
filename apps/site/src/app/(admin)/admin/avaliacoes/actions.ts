'use server'

import { createAdminClient } from '@kings/db'
import { revalidatePath } from 'next/cache'

export async function hideReview(id: string) {
  const supabase = createAdminClient()

  // Limpa o comentário mas mantém a nota (oculta o texto ofensivo)
  const { error } = await supabase
    .from('seller_reviews')
    .update({ comment: '[Comentário ocultado pelo administrador]' })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/avaliacoes')
  return { success: true }
}

export async function deleteReview(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('seller_reviews')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/avaliacoes')
  return { success: true }
}
