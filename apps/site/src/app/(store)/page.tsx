import { Button, Card, Container } from '@kings/ui'
import Link from 'next/link'
import { createServerSupabaseClient } from '@kings/db'
import { formatPrice } from '@kings/utils'

export default async function HomePage() {
  // Test Supabase connection
  let connectionStatus = 'Desconectado'
  let brandCount = 0

  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from('brands').select('*')
    if (!error && data) {
      connectionStatus = 'Conectado ✓'
      brandCount = data.length
    }
  } catch {
    connectionStatus = 'Aguardando migrations'
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* Hero */}
      <header style={{ position: 'relative', width: '100%', minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'var(--bg-primary)' }}>
        
        {/* BACKGROUND REATIVO E SUTIL */}

        
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {/* Malha (Grid) bem sutil para textura tecnológica */}
          <div style={{ 
            position: 'absolute', inset: 0, 
            background: 'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
            backgroundSize: '4rem 4rem',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)',
            opacity: 0.3 
          }}></div>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 16px', maxWidth: '896px', margin: '0 auto', marginTop: '-10vh' }}>
          
          {/* Badge superior com Backdrop Blur */}
          <div style={{ marginBottom: '32px', padding: '8px 16px', borderRadius: '9999px', border: '1px solid var(--border)', background: 'rgba(12, 16, 24, 0.8)', backdropFilter: 'blur(4px)' }}>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, color: 'var(--accent)' }}>🏎️ Simuladores de Corrida Premium</span>
          </div>

          {/* Título Principal */}
          <h1 className="font-display" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            A experiência de pilotar <br/>
            <span className="gradient-text">
              como nunca antes.
            </span>
          </h1>

          {/* Subtítulo */}
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 40px', fontWeight: 400 }}>
            Cockpits, volantes, pedais e acessórios das melhores marcas do mundo. <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Até 12x sem juros.</span>
          </p>

          {/* Botões usando o componente nativo */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
            <Link href="/produtos" style={{ textDecoration: 'none' }}>
              <Button size="lg" style={{ boxShadow: '0 0 20px rgba(0,229,255,0.2)' }}>
                VER CATÁLOGO
              </Button>
            </Link>
            <Link href="/account" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="lg">
                JÁ TENHO CONTA
              </Button>
            </Link>
          </div>
        </div>

        {/* Overlay gradiente na parte inferior */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '128px', background: 'linear-gradient(to top, var(--bg-primary), transparent)', zIndex: 1, pointerEvents: 'none' }}></div>
      </header>

      {/* Status Cards */}
      <section style={{ padding: '40px 0' }}>
        <Container>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            <Card>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Supabase
              </div>
              <div className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {connectionStatus}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {brandCount} marca(s) no banco
              </div>
            </Card>
            <Card>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                App
              </div>
              <div className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Kings Store
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Next.js 14 · App Router · Turborepo
              </div>
            </Card>
            <Card>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Exemplo
              </div>
              <div className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {formatPrice(4999.90)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Formatação via @kings/utils
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  )
}
