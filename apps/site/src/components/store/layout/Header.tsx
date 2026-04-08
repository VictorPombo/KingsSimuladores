import { Button, Container } from '@kings/ui'
import { CartIcon } from '../cart/CartIcon'
import { CategoryNav, MobileCategoryNav } from './CategoryNav'
import { SearchBar } from './SearchBar'
import './responsive.css'

export function Header() {
  return (
    <>
      {/* =======================================================
          🖥️ DESKTOP: CÓDIGO ORIGINAL INTACTO
       ========================================================= */}
      <div className="desktop-header-kings">
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
              <a href="/usado" style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 800, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(to right, #FF6B35, #FF3B5C)', borderRadius: '6px', border: 'none', boxShadow: '0 4px 10px rgba(255, 107, 53, 0.3)' }}>
                <span>♻️</span> Loja de Usados (MSU)
              </a>
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
      </div>

      {/* =======================================================
          📱 MOBILE: MENU OTIMIZADO PARA CELULAR
       ========================================================= */}
      <div className="mobile-header-kings">
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: 'rgba(6, 8, 15, 0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border)',
            paddingTop: '12px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px' }}>
              <a href="/" style={{ flexShrink: 0 }}>
                <img 
                  src="https://cdn.awsli.com.br/1940/1940182/logo/logo_novo_kings_-removebg-preview-1-ireduuhg5i.png" 
                  alt="Kings Simuladores" 
                  style={{ height: '48px', display: 'block', objectFit: 'contain' }}
                />
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CartIcon />
                <Button variant="secondary" size="sm" style={{ padding: '0 12px', fontSize: '0.75rem', borderRadius: '16px' }}>
                  User
                </Button>
              </div>
            </div>

            <div style={{ padding: '0 16px' }}>
              <SearchBar />
            </div>

            <MobileCategoryNav />
          </div>
        </header>
      </div>
    </>
  )
}
