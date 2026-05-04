import { createServerSupabaseClient } from '@kings/db/server'
import { ProdutosClient } from './ProdutosClient'

export const dynamic = 'force-dynamic'
export const revalidate = 30

import { cookies } from 'next/headers'

export default async function AdminProdutosPage() {
  const storeCookie = cookies().get('admin_store')?.value || 'all'

  if (storeCookie === 'msu') {
    return (
      <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#94a3b8' }}>Produtos da Loja MSU devem ser acessados pelos menus próprios do Marketplace.</h2>
      </div>
    )
  }
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('products')
    .select('id, title, slug, sku, price, price_compare, stock, status, weight_kg, ncm, images, created_at, brand_id, category_id, brands!brand_id(name), categories!category_id(name)')
    .order('created_at', { ascending: false })

  if (storeCookie === 'kings' || storeCookie === 'seven') {
    const { data: brand } = await supabase.from('brands').select('id').eq('name', storeCookie).single()
    if (brand) {
      query = query.eq('brand_id', brand.id)
    }
  }

  const { data: products } = await query

  const mapped = (products || []).map((p: any) => ({
    id: p.id, title: p.title, slug: p.slug, sku: p.sku, price: Number(p.price),
    price_compare: p.price_compare ? Number(p.price_compare) : null,
    stock: p.stock, status: p.status, weight_kg: p.weight_kg, ncm: p.ncm, images: p.images || [],
    created_at: p.created_at,
    brand_name: p.brands?.name || 'Desconhecida',
    category_name: p.categories?.name || null,
  }))

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <ProdutosClient products={mapped} />
    </div>
  )
}
