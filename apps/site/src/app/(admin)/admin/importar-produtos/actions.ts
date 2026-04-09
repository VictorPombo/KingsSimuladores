'use server'

import { createAdminClient } from '@kings/db'
import { revalidatePath } from 'next/cache'

type CsvRow = {
  titulo: string; slug: string; descricao: string; preco: string; preco_comparativo: string
  estoque: string; sku: string; marca: string; categoria: string; status: string; peso_kg: string
}

export async function importProducts(rows: CsvRow[]) {
  const supabase = createAdminClient()

  // 1. Buscar brands existentes para mapear nomes → IDs
  const { data: brands } = await supabase.from('brands').select('id, name')
  const brandMap = new Map((brands || []).map(b => [b.name.toLowerCase(), b.id]))

  // 2. Buscar categories existentes
  const { data: categories } = await supabase.from('categories').select('id, name')
  const catMap = new Map((categories || []).map(c => [c.name.toLowerCase(), c.id]))

  const results: { row: number; title: string; status: 'ok' | 'updated' | 'error'; msg?: string }[] = []

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const brandId = brandMap.get(r.marca?.toLowerCase() || '')
    const categoryId = catMap.get(r.categoria?.toLowerCase() || '') || null

    if (!brandId) {
      results.push({ row: i + 1, title: r.titulo, status: 'error', msg: `Marca "${r.marca}" não encontrada` })
      continue
    }

    if (!r.titulo || !r.slug || !r.preco) {
      results.push({ row: i + 1, title: r.titulo || '(vazio)', status: 'error', msg: 'Título, slug ou preço ausente' })
      continue
    }

    // Verificar se SKU já existe (upsert)
    let existingId: string | null = null
    if (r.sku) {
      const { data: existing } = await supabase.from('products').select('id').eq('sku', r.sku).single()
      existingId = existing?.id || null
    }

    const product = {
      title: r.titulo,
      slug: r.slug,
      description: r.descricao || null,
      price: parseFloat(r.preco) || 0,
      price_compare: r.preco_comparativo ? parseFloat(r.preco_comparativo) : null,
      stock: parseInt(r.estoque, 10) || 0,
      sku: r.sku || null,
      brand_id: brandId,
      category_id: categoryId,
      status: (['active', 'draft', 'archived'].includes(r.status) ? r.status : 'draft') as 'active' | 'draft' | 'archived',
      weight_kg: r.peso_kg ? parseFloat(r.peso_kg) : null,
      cnpj_emitente: '00.000.000/0001-00',
      updated_at: new Date().toISOString(),
    }

    if (existingId) {
      const { error } = await supabase.from('products').update(product).eq('id', existingId)
      results.push({ row: i + 1, title: r.titulo, status: error ? 'error' : 'updated', msg: error?.message })
    } else {
      const { error } = await supabase.from('products').insert(product)
      results.push({ row: i + 1, title: r.titulo, status: error ? 'error' : 'ok', msg: error?.message })
    }
  }

  revalidatePath('/admin/produtos')
  return results
}
