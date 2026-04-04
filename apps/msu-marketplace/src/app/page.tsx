import { Button, Card, Container, Badge } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db'

export default async function HomePage() {
  let connectionStatus = 'Desconectado'
  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.from('brands').select('id').single()
    if (!error) connectionStatus = 'Conectado ✓'
  } catch {
    connectionStatus = 'Aguardando migrations'
  }

  return (
    <div style={{ minHeight: '100vh' }}>
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
        <Container style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 800,
              background: 'var(--gradient-msu)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            MEU SIMULADOR USADO
          </h1>
          <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <a href="/anuncios" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Anúncios
            </a>
            <Button variant="primary" size="sm">
              Vender
            </Button>
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
          </nav>
        </Container>
      </header>

      <section
        style={{
          padding: '80px 0',
          textAlign: 'center',
          background: 'radial-gradient(ellipse at top, rgba(139,92,246,.05) 0%, transparent 60%)',
        }}
      >
        <Container>
          <Badge variant="info">🏎️ Marketplace de Simuladores</Badge>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              marginTop: '16px',
              lineHeight: 1.1,
              background: 'var(--gradient-msu)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Compre e venda
            <br />
            simuladores usados.
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1.1rem',
              maxWidth: '600px',
              margin: '20px auto 32px',
            }}
          >
            O maior marketplace brasileiro de equipamentos de sim racing usados.
            Anuncie grátis e compre com segurança.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button size="lg">Ver Anúncios</Button>
            <Button variant="secondary" size="lg">Anunciar Agora</Button>
          </div>
        </Container>
      </section>

      <section style={{ padding: '40px 0' }}>
        <Container>
          <Card>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Status
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              {connectionStatus}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Meu Simulador Usado — Marketplace C2C · Next.js 14 · Porto 3001
            </div>
          </Card>
        </Container>
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
        <Container>
          Meu Simulador Usado © {new Date().getFullYear()} — Todos os direitos reservados
        </Container>
      </footer>
    </div>
  )
}
