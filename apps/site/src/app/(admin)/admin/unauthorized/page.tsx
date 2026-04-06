import { Container, Card } from '@kings/ui'

export default function UnauthorizedPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="400px">
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚫</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--danger)' }}>
              Acesso Negado
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px' }}>
              Seu usuário não tem permissão de administrador.
              <br />
              Contate o suporte se acredita que isso é um erro.
            </p>
          </div>
        </Card>
      </Container>
    </div>
  )
}
