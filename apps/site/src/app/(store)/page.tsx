import { Button, Container } from '@kings/ui'
import Link from 'next/link'
import { createServerSupabaseClient } from '@kings/db'
import { formatPrice } from '@kings/utils'

const BASE_URL = process.env.NEXT_PUBLIC_URL_KINGS || 'https://kingssimuladores.com.br'

// ── SEO: Schema JSON-LD para a Marca e o Site ──
function HomeJsonLd() {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kings Simuladores',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'A maior loja de simuladores de corrida do Brasil. Cockpits, volantes, pedais e acessórios premium.',
    sameAs: [
      'https://www.instagram.com/kingssimuladores',
      'https://www.tiktok.com/@kingssimuladores',
    ],
  }
  const siteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Kings Simuladores',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/produtos?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }} />
    </>
  )
}

export default async function HomePage() {
  // Buscar produtos reais do Supabase
  let products: any[] = []
  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('products')
      .select('id, title, slug, price, price_compare, images, attributes, stock')
      .eq('status', 'active')
      .gt('stock', 0)
      .order('created_at', { ascending: false })
      .limit(20)
    products = data || []
  } catch {}

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* JSON-LD invisível para o Google */}
      <HomeJsonLd />

      {/* Hero */}
      <header style={{ position: 'relative', width: '100%', minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        
        {/* CONTEÚDO PRINCIPAL */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 16px', maxWidth: '896px', margin: '0 auto', marginTop: '-10vh' }}>
          
          {/* Badge superior */}
          <div style={{ marginBottom: '32px', padding: '8px 16px', borderRadius: '9999px', border: '1px solid var(--border)', background: 'rgba(12, 16, 24, 0.8)', backdropFilter: 'blur(4px)' }}>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, color: 'var(--accent)' }}>🏎️ Simuladores de Corrida Premium</span>
          </div>

          {/* Título Principal */}
          <h1 className="font-display" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            A experiência de pilotar <br/>
            <span className="gradient-text">
              começa aqui.
            </span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: 1.6, margin: '0 auto 40px' }}>
            Cockpits, volantes, pedais e acessórios das melhores marcas do mundo.
            Entrega para todo o Brasil com até 12x sem juros.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="#produtos" style={{ textDecoration: 'none' }}>
              <Button size="lg">
                VER PRODUTOS
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Vitrine de Produtos */}
      <section id="produtos" style={{ padding: '80px 0' }}>
        <Container>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Produtos em Destaque
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              {products.length} produtos disponíveis — todos com garantia e nota fiscal
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '24px',
          }}>
            {products.map(product => {
              const hasDiscount = product.price_compare && product.price_compare > product.price
              const imgUrl = product.images?.[0] || 'https://placehold.co/400x400/131928/e8ecf4?text=Kings'
              const brandName = product.attributes?.brand || 'Kings Simuladores'
              
              return (
                <Link key={product.id} href={`/produtos/${product.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="hover:border-[currentColor] hover:-translate-y-1" style={{
                    color: 'var(--accent)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s, transform 0.2s',
                    cursor: 'pointer',
                  }}>
                    {/* Imagem */}
                    <div style={{ background: '#fff', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px' }}>
                      <img src={imgUrl} alt={product.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    
                    {/* Info */}
                    <div style={{ padding: '16px' }}>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                        {brandName}
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '12px', minHeight: '38px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        {hasDiscount && (
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {formatPrice(product.price_compare)}
                          </span>
                        )}
                        <span className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        12x de {formatPrice(product.price / 12)} sem juros
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </Container>
      </section>
    </div>
  )
}
