import { Container, Badge } from '@kings/ui'
import { AddToCartButton } from '@/components/store/cart/AddToCartButton'
import { ShippingSimulator } from '@/components/store/shipping/ShippingSimulator'
import { formatPrice } from '@kings/utils'
import { createServerSupabaseClient } from '@kings/db'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { applySegmentedPrices } from '@/lib/pricing'

export const revalidate = 60 // Cache de 60 segundos

const BASE_URL = process.env.NEXT_PUBLIC_URL_KINGS || 'https://kingssimuladores.com.br'

// ── Extrair primeiro parágrafo para resumo ──
function getShortDescription(htmlOrText: string) {
  if (!htmlOrText) return '';
  // Tentar extrair o primeiro parágrafo de um HTML
  const pMatch = htmlOrText.match(/<p[^>]*>(.*?)<\/p>/is);
  if (pMatch && pMatch[1]) {
    const clean = pMatch[1].replace(/<[^>]+>/g, '').trim();
    if (clean.length > 20) return clean;
  }
  // Fallback: quebrar por quebras de linha duplas
  const cleanText = htmlOrText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const sentences = cleanText.split('. ');
  return sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '');
}

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
    <div className="kings-product-page-wrapper">
      <ProductJsonLd product={product} />
      <Container>
        <div className="kings-product-grid">
          
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
              <h1 className="font-display kings-product-title">
                {product.title}
              </h1>
              {product.description && !product.description.startsWith('Produto importado da Tray') && (
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.95rem', 
                  lineHeight: 1.6
                }}>
                  {getShortDescription(product.description)}
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

            <ShippingSimulator 
              dimensions={[{ 
                weight: product.weight_kg || 2, 
                width: product.dimensions_cm?.width || 20, 
                height: product.dimensions_cm?.height || 20, 
                length: product.dimensions_cm?.length || 20 
              }]} 
            />

              <AddToCartButton 
                product={{
                  id: product.id,
                  title: product.title,
                  price: finalPrice,
                  imageUrl,
                  brand: brandName,
                  storeOrigin: 'kings',
                  dimensions: {
                    weight: product.weight_kg || 2,
                    width: product.dimensions_cm?.width || 20,
                    height: product.dimensions_cm?.height || 20,
                    length: product.dimensions_cm?.length || 20
                  }
                }} 
              />
          </div>
        </div>

        {/* Full Description Section (Premium HTML Rendering) */}
        {product.description && !product.description.startsWith('Produto importado da Tray') && (
          <div style={{ marginTop: '64px', padding: '0', background: 'transparent' }}>
            {/<[a-z][\s\S]*>/i.test(product.description) ? (
              <div 
                className="kings-rich-description"
                style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.1rem' }}
                dangerouslySetInnerHTML={{ 
                  __html: `<style>
                    .kings-rich-description { max-width: 100%; overflow: hidden; font-family: var(--font-sans); }
                    .kings-rich-description img { max-width: 100%; height: auto; border-radius: 16px; margin: 32px auto; display: block; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
                    .kings-rich-description h2 { font-size: 2.2rem; font-weight: 800; color: #fff; margin-top: 64px; margin-bottom: 24px; text-align: center; letter-spacing: -0.5px; }
                    .kings-rich-description h3 { font-size: 1.5rem; font-weight: 700; color: #e2e8f0; margin-top: 48px; margin-bottom: 16px; text-align: center; }
                    .kings-rich-description p { margin-bottom: 24px; text-align: center; max-width: 900px; margin-left: auto; margin-right: auto; color: #cbd5e1; }
                    .kings-rich-description ul { max-width: 900px; margin: 0 auto 32px auto; padding-left: 20px; color: #cbd5e1; display: flex; flex-direction: column; gap: 8px; }
                    .kings-rich-description li { margin-bottom: 8px; }
                    @media (max-width: 768px) {
                      .kings-rich-description h2 { font-size: 1.8rem; }
                      .kings-rich-description p, .kings-rich-description ul { text-align: left; padding: 0 16px; }
                    }
                  </style>` + product.description 
                }}
              />
            ) : (
              <div style={{ padding: '32px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <h2 className="font-display" style={{ fontSize: '1.5rem', marginBottom: '24px', color: 'var(--text)' }}>Descrição do Produto</h2>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                  {product.description}
                </div>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  )
}
