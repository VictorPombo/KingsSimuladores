'use server'

import { createAdminClient } from '@kings/db'
import { revalidatePath } from 'next/cache'
import { processExternalImages } from '../../utils/imageUtils'

export async function updateProduct(id: string, formData: FormData) {
  const supabase = createAdminClient()

  const title = formData.get('title') as string
  const price = parseFloat(formData.get('price') as string)
  const priceCompare = formData.get('price_compare') ? parseFloat(formData.get('price_compare') as string) : null
  const costPrice = formData.get('cost_price') ? parseFloat(formData.get('cost_price') as string) : null
  const stock = parseInt(formData.get('stock') as string, 10)
  const sku = (formData.get('sku') as string) || null
  const status = formData.get('status') as string
  const description = (formData.get('description') as string) || null
  const fabricante = (formData.get('fabricante') as string) || null
  const outOfStockBehavior = (formData.get('out_of_stock_behavior') as string) || 'unavailable'
  const weightKg = formData.get('weight_kg') ? parseFloat(formData.get('weight_kg') as string) : null
  const ncm = (formData.get('ncm') as string) || null
  const ean = (formData.get('ean') as string) || null
  const cnpj_emitente = (formData.get('cnpj_emitente') as string) || null
  const width = formData.get('width') ? parseFloat(formData.get('width') as string) : null
  const height = formData.get('height') ? parseFloat(formData.get('height') as string) : null
  const length = formData.get('length') ? parseFloat(formData.get('length') as string) : null
  const imagesRaw = formData.get('images') as string
  const images = imagesRaw ? JSON.parse(imagesRaw) : undefined

  const categoryId = formData.get('category_id') as string || null

  if (!title || isNaN(price) || isNaN(stock)) {
    return { success: false, error: 'Campos obrigatórios não preenchidos.' }
  }

  const updatePayload: any = {
    title,
    price,
    price_compare: priceCompare,
    stock,
    sku,
    status,
    description,
    weight_kg: weightKg,
    dimensions_cm: { width, height, length },
    ncm,
    ean,
    cnpj_emitente,
    category_id: categoryId,
    updated_at: new Date().toISOString(),
  }

  if (images !== undefined) {
    updatePayload.images = await processExternalImages(images)
  }

  // Fetch existing attributes to merge
  const { data: existingProd } = await supabase.from('products').select('attributes').eq('id', id).single()
  const existingAttrs = (existingProd?.attributes as Record<string, any>) || {}
  
  updatePayload.attributes = {
    ...existingAttrs,
    ...(fabricante ? { marca: fabricante } : {}),
    ...(costPrice !== null && !isNaN(costPrice) ? { cost_price: costPrice } : { cost_price: null }),
    out_of_stock_behavior: outOfStockBehavior
  }

  if (!fabricante) {
    delete updatePayload.attributes.marca
  }

  const { error } = await supabase
    .from('products')
    .update(updatePayload)
    .eq('id', id)

  if (error) {
    console.error('Erro ao atualizar produto:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/produtos', 'layout')
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

export async function getAllCategories() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, brand_scope')
    .order('name')
  
  if (error || !data) return []
  return data
}
