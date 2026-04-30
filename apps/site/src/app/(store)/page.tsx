import { Button, Container } from '@kings/ui'
import Link from 'next/link'
import { createServerSupabaseClient } from '@kings/db'
import { formatPrice } from '@kings/utils'
import { ListingCard } from '@/components/marketplace/ListingCard'
import { DalesteSticker } from '@/components/store/home/DalesteSticker'
import { ProductCarousel } from '@/components/store/ui/ProductCarousel'
import { BannerCarousel } from '@/components/store/ui/BannerCarousel'

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
      .select('id, title, slug, price, price_compare, images, attributes, stock, brands!inner(name)')
      .eq('status', 'active')
      .eq('brands.name', 'kings')
      .gt('stock', 0)
      .order('created_at', { ascending: false })
      .limit(6)
    lancamentos = dataLanc || []

    // 2. Mais Vendidos (Normalmente Kits, Moza R5, R9, Thrustmaster)
    const { data: dataVend } = await supabase
      .from('products')
      .select('id, title, slug, price, price_compare, images, attributes, stock, brands!inner(name)')
      .eq('status', 'active')
      .eq('brands.name', 'kings')
      .or('title.ilike.%kit%,title.ilike.%r5%,title.ilike.%v3%,title.ilike.%thrustmaster%')
      .limit(6)
    
    maisVendidos = dataVend && dataVend.length > 0 ? dataVend : lancamentos // fallback de segurança

    // 3. Destaques (Cockpits, Thermaltake, Consultoria, Pedais Elite)
    const { data: dataDest } = await supabase
      .from('products')
      .select('id, title, slug, price, price_compare, images, attributes, stock, brands!inner(name)')
      .eq('status', 'active')
      .eq('brands.name', 'kings')
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

  // Removido o componente inline ProductCarousel, agora utilizando a versão externa com scroll.

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* JSON-LD invisível para o Google */}
      <HomeJsonLd />

      {/* HERO BANNER CAROUSEL - Full width, igual Seven */}
      <BannerCarousel 
        slides={[
          { src: '/Banner_00Kings.jpeg', alt: 'Kings Simuladores', href: '/produtos' },
          { src: '/banners/banner-mbooster.png', alt: 'MOZA M-Booster Active Pedal', href: '/buscar?q=MOZA+mBooster' },
          { src: '/banners/banner-youtube.png', alt: 'Canal Kings Simuladores no YouTube', href: 'https://www.youtube.com/@kingssimuladores' },
          { src: '/banners/banner-msu.png', alt: 'Meu Simulador Usado', href: '/usado' },
        ]}
      />

      {/* Faixa de Níveis */}
      <section style={{ position: 'relative', padding: 'clamp(32px, 5vw, 60px) 0', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '80vw', height: '300px', maxWidth: '800px',
          background: 'radial-gradient(ellipse, rgba(0, 229, 255, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 16px', maxWidth: '896px', margin: '0 auto' }}>
          <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'clamp(8px, 2vw, 16px)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            A experiência de pilotar <br/>
            <span style={{ color: 'var(--success)' }}>começa aqui.</span>
          </h1>
          <p style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.05rem)', color: 'var(--text-secondary)', maxWidth: '700px', lineHeight: 1.5, margin: '0 auto clamp(20px, 3vw, 32px)' }}>
            Cockpits, volantes, pedais e ecossistemas absolutos das melhores marcas.
            Entrega para todo o Brasil com parcelamento real em até 12x.
          </p>

          <style dangerouslySetInnerHTML={{__html: `
            .kings-btn-pump {
              transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease, filter 0.3s ease;
            }
            .kings-btn-pump:hover {
              transform: scale(1.08) translateY(-2px) !important;
              filter: brightness(1.2);
            }
            .hero-btn-grid {
              display: grid !important;
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 6px;
              align-items: stretch;
              justify-items: stretch;
            }
            @media (min-width: 768px) {
              .hero-btn-grid { 
                gap: 16px; 
              }
            }
            .hero-btn-grid a { display: block; width: 100%; }
            .hero-btn-grid .kings-btn-pump {
              display: flex; align-items: center; justify-content: center; height: 100%; width: 100%;
            }
          `}} />

          <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            QUAL É SEU NÍVEL?
          </h3>

          <div className="hero-btn-grid w-full max-w-[800px] px-1 md:px-0">
            <Link href="/niveis/iniciante" style={{ textDecoration: 'none' }} className="w-full">
              <div style={{ padding: '8px 2px', borderRadius: '12px', border: '1px solid rgba(0, 229, 255, 0.4)', background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(16, 185, 129, 0.1))', color: '#fff', fontSize: 'clamp(8px, 2.2vw, 14px)', fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 10px rgba(0,229,255,0.1)', textAlign: 'center' }} className="kings-btn-pump hover:bg-[rgba(0,229,255,0.3)] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] whitespace-nowrap">
                INICIANTE
              </div>
            </Link>
            <Link href="/niveis/semiprofissional" style={{ textDecoration: 'none' }} className="w-full">
              <div style={{ padding: '8px 2px', borderRadius: '12px', border: '1px solid rgba(0, 229, 255, 0.4)', background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(16, 185, 129, 0.1))', color: '#fff', fontSize: 'clamp(8px, 2.2vw, 14px)', fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 10px rgba(0,229,255,0.1)', textAlign: 'center' }} className="kings-btn-pump hover:bg-[rgba(0,229,255,0.3)] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] whitespace-nowrap">
                SEMIPROFISSIONAL
              </div>
            </Link>
            <Link href="/niveis/profissional" style={{ textDecoration: 'none' }} className="w-full">
              <div style={{ padding: '8px 2px', borderRadius: '12px', border: '1px solid rgba(0, 229, 255, 0.4)', background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(16, 185, 129, 0.1))', color: '#fff', fontSize: 'clamp(8px, 2.2vw, 14px)', fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 10px rgba(0,229,255,0.1)', textAlign: 'center' }} className="kings-btn-pump hover:bg-[rgba(0,229,255,0.3)] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] whitespace-nowrap">
                PROFISSIONAL
              </div>
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '24px' }}>
            <Link href="/produtos" style={{ textDecoration: 'none' }}>
              <button style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '14px 32px', fontSize: '0.9rem', fontWeight: 700, borderRadius: '12px', cursor: 'pointer' }} className="kings-btn-pump hover:border-white hover:text-white">
                VER CATÁLOGO COMPLETO
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FIGURINHA DALESTE */}
      <DalesteSticker />

      {/* SECTION TRIPLA DE PRODUTOS */}
      {(lancamentos?.length > 0 || maisVendidos?.length > 0 || destaques?.length > 0) && (
        <section id="vitrines" style={{ padding: 'clamp(32px, 8vw, 80px) 0', overflow: 'hidden' }}>
          <Container>
            <ProductCarousel title="LANÇAMENTOS" prods={lancamentos} />
            <ProductCarousel title="MAIS VENDIDOS" prods={maisVendidos} />
            <ProductCarousel title="DESTAQUES" prods={destaques} />
            
          </Container>
        </section>
      )}
    </div>
  )
}
