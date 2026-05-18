'use server'

import { createAdminClient } from '@kings/db'
import { revalidatePath } from 'next/cache'

export async function restoreProductAction(id: string) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('products')
      .update({ status: 'draft' })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/lixeira-produtos')
    revalidatePath('/admin/produtos')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteProductPermanentlyAction(id: string) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/lixeira-produtos')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
