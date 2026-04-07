import { Container } from '@kings/ui'

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        padding: '40px 0',
        background: 'transparent',
        color: 'var(--text-muted)',
      }}
    >
      <Container>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '32px' }}>
          <div>
            <img 
              src="https://cdn.awsli.com.br/1940/1940182/logo/logo_novo_kings_-removebg-preview-1-ireduuhg5i.png" 
              alt="Kings Simuladores" 
              style={{ height: '65px', display: 'block', objectFit: 'contain', marginBottom: '16px' }}
            />
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
              A melhor e maior loja de simuladores de corrida do Brasil. Tudo para o seu cockpit.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Navegação</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><a href="/produtos" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Todos os Produtos</a></li>
              <li><a href="/categorias/cockpits" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Cockpits</a></li>
              <li><a href="/categorias/volantes" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Volantes</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Atendimento</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ fontSize: '0.85rem' }}>WhatsApp: (11) 99999-9999</li>
              <li style={{ fontSize: '0.85rem' }}>contato@kingssimuladores.com.br</li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', textAlign: 'center', fontSize: '0.78rem' }}>
          Kings Simuladores © {new Date().getFullYear()} — Todos os direitos reservados.
        </div>
      </Container>
    </footer>
  )
}
