import { createServerSupabaseClient } from '@kings/db/server'
import { ProdutosClient } from './ProdutosClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminProdutosPage() {
  const supabase = await createServerSupabaseClient()

  const { data: products } = await supabase
    .from('products')
    .select('id, title, slug, sku, price, price_compare, stock, status, weight_kg, images, created_at, brand_id, category_id, brands!brand_id(name), categories!category_id(name)')
    .order('created_at', { ascending: false })

  const mapped = (products || []).map((p: any) => ({
    id: p.id, title: p.title, slug: p.slug, sku: p.sku, price: Number(p.price),
    price_compare: p.price_compare ? Number(p.price_compare) : null,
    stock: p.stock, status: p.status, weight_kg: p.weight_kg, images: p.images || [],
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
