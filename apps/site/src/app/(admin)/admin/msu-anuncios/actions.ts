'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@kings/db'

/**
 * Alterna o status de um classificado MSU entre active e inactive
 */
export async function toggleListingStatus(id: string, currentStatus: string) {
  const supabase = await createServerSupabaseClient()
  
  // Se está ativo, vamos pausar (inserir restrição). Se está inativo ou pendente, vamos ativar.
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'

  const { error } = await supabase
    .from('marketplace_listings')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) {
    console.error('Error toggling list status:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/msu-anuncios')
  return { success: true }
}

/**
 * "Soft delete" de um classificado da MSU setando como archived
 */
export async function archiveListing(id: string) {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('marketplace_listings')
    .update({ status: 'archived' })
    .eq('id', id)

  if (error) {
    console.error('Error archiving listing:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/msu-anuncios')
  return { success: true }
}
