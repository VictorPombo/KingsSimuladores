'use server'

import { createServerSupabaseClient } from '@kings/db/server'
import { redirect } from 'next/navigation'
import { processExternalImages } from '../utils/imageUtils'

export async function getBrands() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('brands').select('id, name, display_name, cnpj')
  return data || []
}

export async function getCategories() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('categories').select('id, name, slug, brand_scope').order('name')
  return data || []
}

export async function getVariationGrids() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('variation_grids').select('*').order('name')
  return data || []
}

export async function createProduct(formData: {
  title: string; slug: string; description: string; price: number; priceCompare: number | null
  stock: number; sku: string; brandId: string; categoryId: string; status: string
  weightKg: number | null; width: number | null; height: number | null; length: number | null
  ncm: string; ean: string
  cnpjEmitente: string
  images?: string[]
  variations?: { sku: string; stock: number; price: number | null; attributes: Record<string, string> }[]
  fabricante?: string
  outOfStockBehavior: string
  reviews?: { reviewer_name: string; rating: string | number; comment: string; created_at?: string }[]
  itemType?: 'product' | 'service'
}) {
  const supabase = await createServerSupabaseClient()

  const slug = formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  // Se o admin escolher variações, o estoque matriz passa a ser a soma do estoque de cada variação.
  let computedStock = formData.stock
  if (formData.variations && formData.variations.length > 0) {
    computedStock = formData.variations.reduce((acc, v) => acc + (v.stock || 0), 0)
  }

  const { data: newProd, error } = await supabase.from('products').insert({
    title: formData.title,
    slug,
    description: formData.description,
    price: formData.price,
    price_compare: formData.priceCompare,
    stock: computedStock,
    sku: formData.sku || null,
    brand_id: formData.brandId,
    category_id: formData.categoryId || null,
    status: formData.status,
    images: formData.images ? await processExternalImages(formData.images) : [],
    weight_kg: formData.weightKg,
    dimensions_cm: { width: formData.width, height: formData.height, length: formData.length },
    ncm: formData.ncm,
    ean: formData.ean,
    cnpj_emitente: formData.cnpjEmitente,
    attributes: { 
      ...(formData.fabricante ? { marca: formData.fabricante } : {}),
      out_of_stock_behavior: formData.outOfStockBehavior,
      item_type: formData.itemType || 'product'
    },
  }).select('id').single()

  if (error) throw new Error(error.message)

  // Desdobramento de Sub-SKUs
  if (formData.variations && formData.variations.length > 0) {
    const varsToInsert = formData.variations.map(vari => ({
      product_id: newProd.id,
      sku: vari.sku || `${formData.sku || slug}-${Math.random().toString(36).substring(2,6).toUpperCase()}`,
      price: vari.price, // pode ser nulo para herdar o base da product
      stock: vari.stock,
      attributes: vari.attributes // ex: {"Tamanho": "P"}
    }))
    const { error: varErr } = await supabase.from('product_variations').insert(varsToInsert)
    if (varErr) {
      console.error('[Admin] Salvar Produto ocorreu erro ao inserir Variations:', varErr)
      throw new Error('Produto criado, mas erro ao salvar Grade de opções. Edite o produto manualmente.')
    }
  }

  // Inserção de Avaliações
  if (formData.reviews && formData.reviews.length > 0) {
    const reviewsToInsert = formData.reviews.map(rev => ({
      product_id: newProd.id,
      reviewer_name: rev.reviewer_name,
      rating: Number(rev.rating) || 5,
      comment: rev.comment,
      status: 'approved',
      created_at: rev.created_at || new Date().toISOString()
    }))
    
    // As in kings_simuladores, reviews might need an ID or just auto-increment.
    // If user_id is needed, we leave it null for anonymous/imported reviews.
    const { error: revErr } = await supabase.from('seller_reviews').insert(reviewsToInsert)
    if (revErr) {
      console.warn('[Admin] Erro ao importar avaliações:', revErr)
    }
  }

  // Aciona a ponte Omnichannel assíncrona/interna apenas se for Produto Físico
  if (formData.itemType !== 'service') {
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
  }

  return { success: true }
}
