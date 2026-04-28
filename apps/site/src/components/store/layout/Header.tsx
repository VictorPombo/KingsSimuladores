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
                src="/logo_kings.png" 
                alt="Kings Simuladores" 
                style={{ height: '55px', display: 'block', objectFit: 'contain', transform: 'scale(1.2)' }}
              />
            </a>

            {/* Barra de Pesquisa Centralizada */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <SearchBar />
            </div>

            <style dangerouslySetInnerHTML={{__html: `
              .kings-nav-hover {
                display: inline-block;
                transition: transform 0.3s ease, color 0.3s ease;
              }
              .kings-nav-hover:hover {
                transform: scale(1.1) translateY(-1px);
                color: #fff !important;
              }
              .kings-btn-hover {
                transition: transform 0.3s ease;
              }
              .kings-btn-hover:hover {
                transform: scale(1.08) translateY(-1px);
              }
            `}} />
            <nav style={{ display: 'flex', gap: '24px', alignItems: 'center', flexShrink: 0 }}>
              <a href="/usado" style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 800, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(to right, #8b5cf6, #d946ef)', borderRadius: '6px', border: 'none', boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)' }} className="kings-btn-hover">
                MEU SIMULADOR USADO
              </a>
              <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 8px' }} />
              <div className="kings-btn-hover cursor-pointer">
                <CartIcon />
              </div>
              <div className="kings-btn-hover">
                <a href="/login" style={{ textDecoration: 'none' }}>
                  <Button variant="secondary" size="sm">
                    Entrar
                  </Button>
                </a>
              </div>
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
                  src="/logo_kings.png" 
                  alt="Kings Simuladores" 
                  style={{ height: '40px', display: 'block', objectFit: 'contain', transform: 'scale(1.2)' }}
                />
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CartIcon />
                <a href="/login" style={{ textDecoration: 'none' }}>
                  <Button variant="secondary" size="sm" style={{ padding: '0 12px', fontSize: '0.75rem', borderRadius: '16px' }}>
                    User
                  </Button>
                </a>
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
