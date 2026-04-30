import { Container, Badge } from '@kings/ui'
import { AddToCartButton } from '@/components/store/cart/AddToCartButton'
import { ShippingSimulator } from '@/components/store/shipping/ShippingSimulator'
import { formatPrice } from '@kings/utils'
import { createServerSupabaseClient } from '@kings/db'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { applySegmentedPrices } from '@/lib/pricing'

export const revalidate = 0 // Força dinâmico para a checagem de B2B
export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_URL_KINGS || 'https://kingssimuladores.com.br'

// ── Buscar produto do Supabase ──
async function getProduct(slug: string) {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('products')
    .select('*, brands!inner(name)')
    .eq('slug', slug)
    .eq('status', 'active')
    .eq('brands.name', 'kings')
    .single()
  return data
}

// ── SEO: Meta tags dinâmicas ──
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id)
  if (!product) return { title: 'Produto não encontrado | Kings Simuladores' }

  const price = product.price_compare && product.price_compare > product.price
    ? product.price : product.price

  return {
    title: `${product.title} | Kings Simuladores`,
    description: `${product.title} por ${formatPrice(price)} em até 12x sem juros. ${(product.description || '').slice(0, 150)}`,
    openGraph: {
      title: product.title,
      description: product.description || product.title,
      url: `${BASE_URL}/produtos/${product.slug}`,
      siteName: 'Kings Simuladores',
      images: product.images?.[0] ? [{ url: product.images[0], width: 800, height: 800, alt: product.title }] : [],
      type: 'website',
    },
  }
}

// ── SEO: Schema JSON-LD Product ──
function ProductJsonLd({ product }: { product: any }) {
  const brandName = product.attributes?.brand || 'Kings Simuladores'
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images?.[0] || '',
    brand: { '@type': 'Brand', name: brandName },
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}/produtos/${product.slug}`,
      priceCurrency: 'BRL',
      price: Number(product.price).toFixed(2),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Kings Simuladores' },
    },
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  let product = await getProduct(params.id)
  if (!product) notFound()

  // Injetar lógicas de preços baseados no grupo
  const [segmentedProduct] = await applySegmentedPrices([product])
  product = segmentedProduct || product

  const hasDiscount = product.price_compare && product.price_compare > product.price
  const originalPrice = hasDiscount ? product.price_compare : product.price
  const finalPrice = product.price
  const discountPct = hasDiscount ? Math.round((1 - finalPrice / originalPrice) * 100) : 0
  const installmentValue = finalPrice / 12
  const brandName = product.attributes?.brand || 'Kings Simuladores'
  const imageUrl = product.images?.[0] || 'https://placehold.co/800x800/131928/e8ecf4?text=Kings'

  return (
    <div style={{ padding: '60px 0', minHeight: 'calc(100vh - 80px)' }}>
      <ProductJsonLd product={product} />
      <Container>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) minmax(300px, 500px)', gap: '60px', alignItems: 'start' }}>
          
          {/* Foto */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <img src={imageUrl} alt={product.title} style={{ width: '100%', aspectRatio: '1', objectFit: 'contain' }} />
          </div>

          {/* Detalhes */}
          <div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <Badge variant="info">{brandName}</Badge>
                {product.stock <= 0 && <Badge variant="warning">Esgotado</Badge>}
                {discountPct > 0 && <Badge variant="success">-{discountPct}%</Badge>}
              </div>
              <h1 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 16px 0', lineHeight: 1.1 }}>
                {product.title}
              </h1>
              {product.description && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
                  {product.description.slice(0, 300)}{product.description.length > 300 ? '...' : ''}
                </p>
              )}
            </div>

            <div style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '24px' }}>
              <div style={{ marginBottom: '8px' }}>
                {hasDiscount && (
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '1rem' }}>
                    {formatPrice(originalPrice)}
                  </span>
                )}
                <div className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>
                  {formatPrice(finalPrice)}
                </div>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Em até <strong>12x sem juros de {formatPrice(installmentValue)}</strong> no cartão de crédito.
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                10% de desconto via Pix.
              </div>
            </div>

            <ShippingSimulator dimensions={[{ weight: 25, width: 60, height: 60, length: 60 }]} />

            <AddToCartButton 
              product={{
                id: product.id,
                title: product.title,
                price: finalPrice,
                imageUrl,
                brand: brandName,
              }} 
            />
            {product.stock <= 0 && (
              <a href={`/usado/produtos?q=${encodeURIComponent(product.title)}`} style={{ display: 'block', marginTop: '16px', textDecoration: 'none' }}>
                <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid #06b6d4', color: '#06b6d4', padding: '16px', borderRadius: 'var(--radius)', textAlign: 'center', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span>🔍</span> Buscar versão usada no MSU
                </div>
              </a>
            )}
          </div>
        </div>
      </Container>
    </div>
  )
}
