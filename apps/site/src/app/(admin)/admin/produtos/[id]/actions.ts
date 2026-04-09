'use server'

import { createAdminClient } from '@kings/db'
import { revalidatePath } from 'next/cache'

export async function updateProduct(id: string, formData: FormData) {
  const supabase = createAdminClient()

  const title = formData.get('title') as string
  const price = parseFloat(formData.get('price') as string)
  const priceCompare = formData.get('price_compare') ? parseFloat(formData.get('price_compare') as string) : null
  const stock = parseInt(formData.get('stock') as string, 10)
  const sku = (formData.get('sku') as string) || null
  const status = formData.get('status') as string
  const description = (formData.get('description') as string) || null
  const weightKg = formData.get('weight_kg') ? parseFloat(formData.get('weight_kg') as string) : null
  const ncm = (formData.get('ncm') as string) || null
  const ean = (formData.get('ean') as string) || null

  if (!title || isNaN(price) || isNaN(stock)) {
    return { success: false, error: 'Campos obrigatórios não preenchidos.' }
  }

  const { error } = await supabase
    .from('products')
    .update({
      title,
      price,
      price_compare: priceCompare,
      stock,
      sku,
      status,
      description,
      weight_kg: weightKg,
      ncm,
      ean,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('Erro ao atualizar produto:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/produtos')
  return { success: true }
}

export async function getProductById(id: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('products')
    .select('*, brands!brand_id(name), categories!category_id(name)')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}
