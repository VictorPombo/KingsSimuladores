import { Button, Card, Container, Badge } from '@kings/ui'
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
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(6, 8, 15, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 0',
        }}
      >
        <Container
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h1
            className="gradient-text"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 800,
            }}
          >
            KINGS SIMULADORES
          </h1>
          <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <a href="/produtos" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Produtos
            </a>
            <a href="/categorias" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Categorias
            </a>
            <Button variant="secondary" size="sm">
              Entrar
            </Button>
          </nav>
        </Container>
      </header>

      {/* Hero */}
      <section
        style={{
          padding: '80px 0',
          textAlign: 'center',
          background: 'radial-gradient(ellipse at top, rgba(0,229,255,.05) 0%, transparent 60%)',
        }}
      >
        <Container>
          <Badge variant="info">🏎️ Simuladores de Corrida Premium</Badge>
          <h2
            className="gradient-text"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              marginTop: '16px',
              lineHeight: 1.1,
            }}
          >
            A experiência de pilotar
            <br />
            como nunca antes.
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1.1rem',
              maxWidth: '600px',
              margin: '20px auto 32px',
            }}
          >
            Cockpits, volantes, pedais e acessórios das melhores marcas do mundo.
            Até 12x sem juros.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button size="lg">Ver Catálogo</Button>
            <Button variant="secondary" size="lg">
              Já tenho conta
            </Button>
          </div>
        </Container>
      </section>

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
              <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
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
              <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
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
              <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                {formatPrice(4999.90)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Formatação via @kings/utils
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '24px 0',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.78rem',
        }}
      >
        <Container>
          Kings Simuladores © {new Date().getFullYear()} — Todos os direitos reservados
        </Container>
      </footer>
    </div>
  )
}
