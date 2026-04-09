import { notFound } from 'next/navigation'
import { getProductById } from './actions'
import { EditProductForm } from './EditProductForm'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id)

  if (!product) {
    notFound()
  }

  const mapped = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    sku: product.sku,
    price: Number(product.price),
    price_compare: product.price_compare ? Number(product.price_compare) : null,
    stock: product.stock,
    status: product.status,
    weight_kg: product.weight_kg,
    images: product.images || [],
    description: product.description,
    ncm: product.ncm,
    ean: product.ean,
    created_at: product.created_at,
    updated_at: product.updated_at,
    brand_name: (product as any).brands?.name || 'Desconhecida',
    category_name: (product as any).categories?.name || null,
  }

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <EditProductForm product={mapped} />
    </div>
  )
}
