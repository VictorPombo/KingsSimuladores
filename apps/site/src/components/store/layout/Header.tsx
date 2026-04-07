import { Button, Container } from '@kings/ui'
import { CartIcon } from '../cart/CartIcon'
import { CategoryNav } from './CategoryNav'
import { SearchBar } from './SearchBar'

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
        <a href="/" style={{ textDecoration: 'none', marginLeft: '24px', flexShrink: 0 }}>
          <img 
            src="https://cdn.awsli.com.br/1940/1940182/logo/logo_novo_kings_-removebg-preview-1-ireduuhg5i.png" 
            alt="Kings Simuladores" 
            style={{ height: '75px', display: 'block', objectFit: 'contain' }}
          />
        </a>

        {/* Barra de Pesquisa Centralizada */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <SearchBar />
        </div>

        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center', flexShrink: 0 }}>
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
      
      {/* Barra Secundária de Categorias (Estilo Clássico Kings) */}
      <CategoryNav />
    </header>
  )
}
