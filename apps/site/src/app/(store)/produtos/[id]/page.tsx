import { Container, Badge, Button } from '@kings/ui'
import { AddToCartButton } from '@/components/store/cart/AddToCartButton'
import { ShippingSimulator } from '@/components/store/shipping/ShippingSimulator'
import { formatPrice } from '@kings/utils'
import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_URL_KINGS || 'https://kingssimuladores.com.br'

// Simulando um fetch de banco baseado no ID da URL
const MOCK_PRODUCTS: Record<string, any> = {
  '1': { id: '1', title: 'Cockpit P1 PRO Extreme', price: 4599.90, imageUrl: 'https://placehold.co/800x800/131928/e8ecf4?text=Cockpit+P1', brand: 'XTREME RACING', isNew: true, discount: 5, description: 'Cockpit robusto de alumínio estrutural para direct drives pesados. Ajustes milimétricos em banco, volante e pedais.', stock: 12 },
  '2': { id: '2', title: 'Volante Fanatec DD Pro', price: 7999.00, imageUrl: 'https://placehold.co/800x800/131928/e8ecf4?text=Fanatec+DD', brand: 'FANATEC', description: 'Base Direct Drive 8Nm com licença oficial PlayStation e Gran Turismo. Inclui volante compatível.', stock: 5 },
}

// ── SEO: Gera meta tags dinâmicas por produto ──
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = MOCK_PRODUCTS[params.id] || MOCK_PRODUCTS['1']
  const finalPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price

  return {
    title: `${product.title} | Kings Simuladores`,
    description: `${product.title} por ${formatPrice(finalPrice)} em até 12x sem juros. ${product.description}`,
    openGraph: {
      title: product.title,
      description: product.description,
      url: `${BASE_URL}/produtos/${product.id}`,
      siteName: 'Kings Simuladores',
      images: [{ url: product.imageUrl, width: 800, height: 800, alt: product.title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description,
      images: [product.imageUrl],
    },
  }
}

// ── SEO: Gera Schema JSON-LD Product para Google Rich Results ──
function ProductJsonLd({ product, finalPrice }: { product: any; finalPrice: number }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.imageUrl,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}/produtos/${product.id}`,
      priceCurrency: 'BRL',
      price: finalPrice.toFixed(2),
      availability: (product.stock ?? 1) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Kings Simuladores',
      },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    sku: product.id,
    category: 'Simuladores de Corrida',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = MOCK_PRODUCTS[params.id] || MOCK_PRODUCTS['1']

  const finalPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price
  const installmentValue = finalPrice / 12

  return (
    <div style={{ padding: '60px 0', minHeight: 'calc(100vh - 80px)' }}>
      {/* JSON-LD invisível para o Google */}
      <ProductJsonLd product={product} finalPrice={finalPrice} />

      <Container>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) minmax(300px, 500px)', gap: '60px', alignItems: 'start' }}>
          
          {/* Photos */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <img src={product.imageUrl} alt={product.title} style={{ width: '100%', aspectRatio: '1', objectFit: 'contain' }} />
          </div>

          {/* Details */}
          <div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <Badge variant="info">{product.brand}</Badge>
                {product.isNew && <Badge variant="success">Lançamento</Badge>}
              </div>
              <h1 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 16px 0', lineHeight: 1.1 }}>
                {product.title}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
                {product.description}
              </p>
            </div>

            <div style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '24px' }}>
              <div style={{ marginBottom: '8px' }}>
                {product.discount > 0 && <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '1rem' }}>{formatPrice(product.price)}</span>}
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
                imageUrl: product.imageUrl,
                brand: product.brand
              }} 
            />
          </div>

        </div>
      </Container>
    </div>
  )
}
