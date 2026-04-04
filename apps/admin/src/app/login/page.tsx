import { Button, Card, Container } from '@kings/ui'

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="400px">
        <Card glow>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1
              className="gradient-text"
              style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800 }}
            >
              KINGS HUB — ADMIN
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '8px' }}>
              Acesso restrito a administradores
            </p>
          </div>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                E-mail
              </label>
              <input
                type="email"
                placeholder="admin@kingssimuladores.com.br"
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
            <Button size="lg" style={{ width: '100%', marginTop: '8px' }}>
              Entrar
            </Button>
          </form>
        </Card>
      </Container>
    </div>
  )
}
