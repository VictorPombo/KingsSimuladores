'use server'

import { createServerSupabaseClient } from '@kings/db/server'
import { redirect } from 'next/navigation'

export async function getBrands() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('brands').select('id, name, slug')
  return data || []
}

export async function getCategories() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('categories').select('id, name, slug').order('name')
  return data || []
}

export async function createProduct(formData: {
  title: string; slug: string; description: string; price: number; priceCompare: number | null
  stock: number; sku: string; brandId: string; categoryId: string; status: string
  weightKg: number | null; width: number | null; height: number | null; length: number | null
  ncm: string; ean: string
  cnpjEmitente: string
}) {
  const supabase = await createServerSupabaseClient()

  const slug = formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const { data: newProd, error } = await supabase.from('products').insert({
    title: formData.title,
    slug,
    description: formData.description,
    price: formData.price,
    price_compare: formData.priceCompare,
    stock: formData.stock,
    sku: formData.sku || null,
    brand_id: formData.brandId,
    category_id: formData.categoryId || null,
    status: formData.status,
    weight_kg: formData.weightKg,
    dimensions_cm: { width: formData.width, height: formData.height, length: formData.length },
    ncm: formData.ncm,
    ean: formData.ean,
    cnpj_emitente: formData.cnpjEmitente,
  }).select('id').single()

  if (error) throw new Error(error.message)

  // Aciona a ponte Omnichannel assíncrona/interna
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const syncRes = await fetch(`${baseUrl}/api/erp/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kings_id: newProd.id,
        title: formData.title,
        sku: formData.sku || null,
        price: formData.price,
        price_compare: formData.priceCompare,
        stock: formData.stock,
        ncm: formData.ncm,
        ean: formData.ean,
        weight_kg: formData.weightKg,
        dimensions: {
          width: formData.width,
          height: formData.height,
          length: formData.length
        }
      })
    })

    if (!syncRes.ok) {
      console.warn('[Admin] Sync Olist avisou que falhou (mas o produto foi salvo no DB).')
    }
  } catch (err) {
    console.warn('[Admin] Erro de rede ao contatar /api/erp/sync:', err)
  }

  return { success: true }
}
