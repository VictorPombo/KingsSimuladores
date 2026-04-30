import React from 'react'
import Link from 'next/link'
import { Container, Button } from '@kings/ui'
import { Search } from 'lucide-react'
import { SearchBar } from '@/components/store/layout/SearchBar'
import { CartIcon } from '@/components/store/cart/CartIcon'
import { AuthAction } from '@/components/store/layout/AuthAction'
import { StoreSwitcher } from '@/components/store/layout/StoreSwitcher'

export async function Header() {
  return (
    <>
      {/* --- DESKTOP HEADER --- */}
      <div className="desktop-header-msu">
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#0a0c14',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '16px 0',
        }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
            
            {/* Top Row: Logo, Search, Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              
              {/* Logo */}
              <div style={{ flexShrink: 0 }}>
                <Link href="/usado" style={{ textDecoration: 'none', display: 'block', marginLeft: '24px' }}>
                  <img 
                    src="/logo_msu.png" 
                    alt="Meu Simulador Usado" 
                    style={{ height: '65px', display: 'block', objectFit: 'contain' }} 
                  />
                </Link>
              </div>

              {/* Search Bar */}
              <div style={{ flex: 1, maxWidth: '600px', margin: '0 40px', position: 'relative' }}>
                <SearchBar variant="msu" />
              </div>

              {/* Actions */}
              <nav style={{ display: 'flex', gap: '24px', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <StoreSwitcher store="kings" />
                  <StoreSwitcher store="seven" />
                </div>
                
                <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>
                
                <AuthAction store="msu" />
                <CartIcon variant="msu" />
              </nav>

            </div>

            {/* Bottom Row: Navigation */}
            <nav style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: '20px', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                <Link href="/usado/produtos" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }} className="hover:text-white transition-colors">
                  Explorar Anúncios
                </Link>
                <Link href="/usado/account" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }} className="hover:text-white transition-colors">
                  Minha Garagem
                </Link>
              </div>
              
              <div style={{ position: 'absolute', right: 0 }}>
                <Link href="/usado/vender" style={{ textDecoration: 'none' }}>
                  <Button style={{ background: 'linear-gradient(to right, #8b5cf6, #d946ef)', color: '#fff', border: 'none', fontWeight: 800, fontSize: '0.8rem', padding: '6px 16px' }}>
                    + ANUNCIAR GRÁTIS
                  </Button>
                </Link>
              </div>
            </nav>

          </div>
        </header>
      </div>

      {/* --- MOBILE HEADER --- */}
      <div className="mobile-header-msu">
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(10, 12, 20, 0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '12px',
          paddingBottom: '12px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px' }}>
              <Link href="/usado" style={{ flexShrink: 0 }}>
                <img 
                  src="/logo_msu.png" 
                  alt="Meu Simulador Usado" 
                  style={{ height: '40px', display: 'block', objectFit: 'contain' }}
                />
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AuthAction store="msu" mobile={true} />
                <CartIcon variant="msu" />
              </div>
            </div>

            <div style={{ padding: '0 16px' }}>
              <SearchBar variant="msu" />
            </div>

            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Link href="/usado/produtos" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Explorar
                </Link>
                <Link href="/usado/account" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Minha Garagem
                </Link>
              </div>
              <Link href="/usado/vender" style={{ textDecoration: 'none', marginLeft: '16px' }}>
                <div style={{ background: 'linear-gradient(to right, #8b5cf6, #d946ef)', color: '#fff', borderRadius: '4px', fontWeight: 800, fontSize: '0.7rem', padding: '4px 8px', whiteSpace: 'nowrap' }}>
                  + ANUNCIAR
                </div>
              </Link>
            </nav>
          </div>
        </header>
      </div>
    </>
  )
}
