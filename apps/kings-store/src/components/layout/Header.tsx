import { Button, Container } from '@kings/ui'
import { CartIcon } from '../cart/CartIcon'

export function Header() {
  return (
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
        <a href="/" style={{ textDecoration: 'none' }}>
          <h1
            className="gradient-text font-display"
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              margin: 0
            }}
          >
            KINGS SIMULADORES
          </h1>
        </a>
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="/produtos" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Produtos
          </a>
          <a href="/categorias" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Categorias
          </a>
          <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 8px' }} />
          <CartIcon />
          <Button variant="secondary" size="sm">
            Entrar
          </Button>
        </nav>
      </Container>
    </header>
  )
}
