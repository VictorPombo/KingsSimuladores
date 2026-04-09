'use server'

import { createAdminClient } from '@kings/db'
import { revalidatePath } from 'next/cache'

export async function createCategoryAction(data: { name: string; slug: string; brand_scope: string | null }) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('categories')
    .insert({
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      brand_scope: data.brand_scope || null,
      sort_order: 0
    })

  if (error) {
    console.error('Error creating category:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categorias')
  // Categoria afeta a vitrine
  revalidatePath('/produtos')
  return { success: true }
}
