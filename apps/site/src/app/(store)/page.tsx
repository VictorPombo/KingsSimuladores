import { Button, Container } from '@kings/ui'
import Link from 'next/link'
import { createServerSupabaseClient } from '@kings/db'
import { formatPrice } from '@kings/utils'
import { ListingCard } from '@/components/marketplace/ListingCard'

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
  // Buscar produtos reais do Supabase classificados nas 3 novas vitrines
  let lancamentos: any[] = []
  let maisVendidos: any[] = []
  let destaques: any[] = []
  let msuListings: any[] = []

  try {
    const supabase = await createServerSupabaseClient()
    
    // 1. Lançamentos (Os 6 mais recentes do banco)
    const { data: dataLanc } = await supabase
      .from('products')
      .select('id, title, slug, price, price_compare, images, attributes, stock')
      .eq('status', 'active')
      .gt('stock', 0)
      .order('created_at', { ascending: false })
      .limit(6)
    lancamentos = dataLanc || []

    // 2. Mais Vendidos (Normalmente Kits, Moza R5, R9, Thrustmaster)
    const { data: dataVend } = await supabase
      .from('products')
      .select('id, title, slug, price, price_compare, images, attributes, stock')
      .eq('status', 'active')
      .or('title.ilike.%kit%,title.ilike.%r5%,title.ilike.%v3%,title.ilike.%thrustmaster%')
      .limit(6)
    
    maisVendidos = dataVend && dataVend.length > 0 ? dataVend : lancamentos // fallback de segurança

    // 3. Destaques (Cockpits, Thermaltake, Consultoria, Pedais Elite)
    const { data: dataDest } = await supabase
      .from('products')
      .select('id, title, slug, price, price_compare, images, attributes, stock')
      .eq('status', 'active')
      .or('title.ilike.%thermaltake%,title.ilike.%consultoria%,title.ilike.%cockpit%,title.ilike.%pedal%')
      .limit(6)
      
    destaques = dataDest && dataDest.length > 0 ? dataDest : lancamentos // fallback de segurança
    
    // 4. Oportunidades P2P (Meu Simulador Usado - Cross-Selling)
    const { data: dataMsu } = await supabase
      .from('marketplace_listings')
      .select('id, title, price, condition, images, seller_id, profiles(full_name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(6)
      
    msuListings = dataMsu || []
  } catch (err) {
    console.error(err)
  }

  // Componente interno para economizar arquivos: Carrossel Horizontal
  const ProductCarousel = ({ title, prods }: { title: string, prods: any[] }) => {
    if (!prods || prods.length === 0) return null;
    return (
      <div style={{ marginBottom: '80px' }}>
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scroll::-webkit-scrollbar { display: none; }
          .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
        {/* Cabeçalho estilo "Site Antigo Line-Divider", mas na identidade Dark/Green/Accent atual */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', gap: '24px' }}>
          <div style={{ height: '1px', flex: 1, maxWidth: '200px', background: 'linear-gradient(to right, transparent, var(--border))' }} />
          <h2 className="font-display" style={{ 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            letterSpacing: '4px', 
            textTransform: 'uppercase', 
            color: 'var(--success)', // Aquele Verde Kings
            textShadow: '0 0 10px rgba(16, 185, 129, 0.2)', 
            margin: 0 
          }}>
            {title}
          </h2>
          <div style={{ height: '1px', flex: 1, maxWidth: '200px', background: 'linear-gradient(to left, transparent, var(--border))' }} />
        </div>
        
        {/* Scroll Horizontal nativo bem perfomático */}
        <div style={{
          display: 'flex',
          gap: '24px',
          overflowX: 'auto',
          paddingBottom: '32px', // Espaço para sombra e outline
          scrollBehavior: 'smooth',
          scrollSnapType: 'x mandatory',
        }} className="hide-scroll">
          {prods.map(product => {
            const hasDiscount = product.price_compare && product.price_compare > product.price
            const imgUrl = product.images?.[0] || 'https://placehold.co/400x400/131928/e8ecf4?text=Kings'
            const brandName = product.attributes?.brand || 'Loja Oficial'
            
            return (
              <div key={product.id} style={{ minWidth: '280px', maxWidth: '280px', scrollSnapAlign: 'start', flexShrink: 0 }}>
                <Link href={`/produtos/${product.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="hover:border-[currentColor] hover:-translate-y-1" style={{
                    color: 'var(--success)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s, transform 0.2s',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Imagem (Fundo branco para contrastar o shape dos produtos industriais) */}
                    <div style={{ background: '#fff', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px' }}>
                      <img src={imgUrl} alt={product.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    
                    {/* Infos do Produto */}
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        {brandName}
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 'auto', minHeight: '40px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '16px' }}>
                        {hasDiscount && (
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {formatPrice(product.price_compare)}
                          </span>
                        )}
                        <span className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        12x de {formatPrice(product.price / 12)} s/ juros
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* JSON-LD invisível para o Google */}
      <HomeJsonLd />

      {/* Hero */}
      <header style={{ position: 'relative', width: '100%', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        
        {/* GLOW DE FUNDO MAIS AGRESSIVO DA KINGS */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80vw',
          height: '80vw',
          maxWidth: '800px',
          maxHeight: '800px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)', // Verde Kings no topo
          filter: 'blur(80px)',
          zIndex: 0,
          pointerEvents: 'none',
        }} />

        {/* CONTEÚDO PRINCIPAL */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 16px', maxWidth: '896px', margin: '0 auto' }}>
          
          {/* Badge superior */}
          <div style={{ marginBottom: '24px', padding: '6px 14px', borderRadius: '9999px', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(12, 16, 24, 0.8)', backdropFilter: 'blur(4px)' }}>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, color: 'var(--success)' }}>O REI DOS SIMULADORES!</span>
          </div>

          {/* Título Principal */}
          <h1 className="font-display" style={{ fontSize: 'clamp(2.2rem, 8vw, 4.5rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            A experiência de pilotar <br/>
            <span style={{ color: 'var(--success)' }}>
              começa aqui.
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 3vw, 1.15rem)', color: 'var(--text-secondary)', maxWidth: '700px', lineHeight: 1.6, margin: '0 auto 40px' }}>
            Cockpits, volantes, pedais e ecossistemas absolutos das melhores marcas.
            Entrega para todo o Brasil com parcelamento real em até 12x.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/produtos" style={{ textDecoration: 'none' }}>
              <Button size="lg" style={{ background: 'var(--success)', color: '#000', border: 'none' }}>
                VER CATÁLOGO
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* BANNER MOZA ACTIVE PEDAL */}
      <section style={{ width: '100%', maxWidth: '1200px', margin: 'clamp(20px, 4vw, 40px) auto 0', padding: '0 16px' }}>
        <div style={{ 
          width: '100%', 
          borderRadius: '16px', 
          overflow: 'hidden', 
          border: '1px solid rgba(16, 185, 129, 0.2)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
          background: '#0a0a0a'
        }}>
          {/* Banner Único: YouTube com Link */}
          <a href="https://www.youtube.com/@kingssimuladores" target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%' }}>
            <img 
              src="https://cdn.awsli.com.br/1920x1920/1940/1940182/banner/dkp-2-eapfpa40uj.png" 
              alt="Canal Kings Simuladores no YouTube" 
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} 
            />
          </a>
        </div>
      </section>

      {/* SECTION TRIPLA DE PRODUTOS */}
      <section id="vitrines" style={{ padding: 'clamp(32px, 8vw, 80px) 0', overflow: 'hidden' }}>
        <Container>
          <ProductCarousel title="LANÇAMENTOS" prods={lancamentos} />
          
          {msuListings.length > 0 && (
            <div style={{ marginBottom: '80px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', gap: '24px' }}>
                <div style={{ height: '1px', flex: 1, maxWidth: '200px', background: 'linear-gradient(to right, transparent, rgba(6, 182, 212, 0.4))' }} />
                <h2 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#06b6d4', textShadow: '0 0 10px rgba(6, 182, 212, 0.2)' }}>
                  OPORTUNIDADES MSU
                </h2>
                <div style={{ height: '1px', flex: 1, maxWidth: '200px', background: 'linear-gradient(to left, transparent, rgba(6, 182, 212, 0.4))' }} />
              </div>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Equipamentos premium da comunidade com a Segurança Kings.</p>
              
              <div className="hide-scroll" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px', scrollSnapType: 'x mandatory' }}>
                {msuListings.map(listing => (
                  <div key={listing.id} style={{ minWidth: 'min(300px, 80vw)', scrollSnapAlign: 'start', flexShrink: 0 }}>
                    <ListingCard 
                      id={listing.id}
                      title={listing.title}
                      price={listing.price}
                      condition={listing.condition}
                      imageUrl={listing.images[0]}
                      location="Brasil"
                      sellerName={listing.profiles?.full_name || 'Piloto Vendedor'}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <ProductCarousel title="MAIS VENDIDOS" prods={maisVendidos} />
          <ProductCarousel title="DESTAQUES" prods={destaques} />
        </Container>
      </section>
    </div>
  )
}
