'use server'

import { createAdminClient } from '@kings/db'
import { revalidatePath } from 'next/cache'

const HIDDEN_PREFIX = '[HIDDEN]'

export async function toggleReviewVisibility(id: string, currentComment: string | null) {
  const supabase = createAdminClient()

  let newComment: string | null = currentComment

  if (currentComment?.startsWith(HIDDEN_PREFIX)) {
    // Desocultar: remover o prefixo
    newComment = currentComment.slice(HIDDEN_PREFIX.length)
  } else {
    // Ocultar: adicionar o prefixo
    newComment = HIDDEN_PREFIX + (currentComment || '')
  }

  const { error } = await supabase
    .from('seller_reviews')
    .update({ comment: newComment })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/avaliacoes')
  return { success: true, newComment }
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
