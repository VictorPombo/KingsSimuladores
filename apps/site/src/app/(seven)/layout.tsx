import type { Metadata } from 'next'
import '@kings/ui/globals.css'
import { StreamingBackground, Button } from '@kings/ui'

export const metadata: Metadata = {
  title: 'Seven Sim Racing',
  description: 'Simuladores de Corrida Premium por Felipe.',
  openGraph: {
    title: 'Seven Sim Racing',
    description: 'Simuladores de Corrida Premium',
    type: 'website',
  },
}

import { Search, ShoppingCart, User, Menu, ChevronLeft, ChevronRight, ChevronDown, Phone, Mail, Clock, CreditCard, QrCode, Barcode, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { CartIcon } from '@/components/store/cart/CartIcon'
import { SearchBar } from '@/components/store/layout/SearchBar'
import { ProfileDropdown } from '@/components/store/layout/ProfileDropdown'
import { CartProvider } from '@/contexts/CartContext'
import { CartDrawer } from '@/components/store/cart/CartDrawer'
import { ToastProvider } from '@kings/ui'
import { AuthAction } from '@/components/store/layout/AuthAction'
import { StoreSwitcher } from '@/components/store/layout/StoreSwitcher'
import Script from 'next/script'

export default async function SevenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <Script 
        src="https://www.googletagmanager.com/gtag/js?id=AW-11399026698" 
        strategy="afterInteractive" 
      />
      <Script id="google-ads" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-11399026698');
        `}
      </Script>
      <CartProvider>
        <div className="theme-seven" style={{ minHeight: '100vh', color: '#f8fafc', position: 'relative', fontFamily: 'var(--font-sans)', zIndex: 1 }}>
        <CartDrawer />
      {/* Background Effect */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, rgba(0,0,0,0) 70%)', zIndex: -1, pointerEvents: 'none' }} />
      
      {/* --- DESKTOP HEADER --- */}
      <div className="desktop-header-seven">
        <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          
          {/* Top Bar - Produtos Originais */}
          <div style={{ background: '#050505', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <ChevronLeft size={16} color="#94a3b8" style={{ cursor: 'pointer' }} />
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', gap: '6px' }}>
                  <span style={{ color: '#ea580c' }}>ENTREGA GARANTIDA</span>
                  <span style={{ color: '#94a3b8' }}>Para todo Brasil</span>
                </div>
                <ChevronRight size={16} color="#94a3b8" style={{ cursor: 'pointer' }} />
              </div>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            .seven-search { display: none; }
            .seven-switcher { display: none; }
            .seven-divider { display: none; }
            .seven-panel-text { display: none; }
            .seven-main-bar { padding: 8px 12px; }
            @media (min-width: 768px) {
              .seven-search { display: block; }
              .seven-switcher { display: flex; }
              .seven-divider { display: block; }
              .seven-panel-text { display: flex; }
              .seven-main-bar { padding: 10px 20px; }
            }
          `}} />

          {/* Main Bar - Pesquisa e Ações */}
          <div className="seven-main-bar" style={{ 
            position: 'relative',
            background: '#090a0f',
            backgroundImage: 'radial-gradient(ellipse at top, rgba(234,88,12,0.1) 0%, rgba(9,10,15,1) 100%)',
          }}>
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1440px', margin: '0 auto' }}>
              
              {/* Logo */}
              <div style={{ flexShrink: 0 }}>
                <Link href="/seven" style={{ textDecoration: 'none', display: 'block', marginLeft: '16px' }}>
                  <img src="/logo-seven.svg" alt="Seven Sim Racing" style={{ height: '50px', display: 'block', objectFit: 'contain' }} />
                </Link>
              </div>

              {/* Search Bar - Centralizada */}
              <div className="seven-search" style={{ flex: 1, maxWidth: '600px', margin: '0 24px' }}>
                <SearchBar variant="seven" />
              </div>

              {/* Actions - Store Switcher, Usuário e Carrinho */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div className="seven-switcher" style={{ gap: '24px', alignItems: 'center' }}>
                  <StoreSwitcher store="kings" />
                  <StoreSwitcher store="msu" />
                </div>
                <div className="seven-divider" style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 8px' }} />
                <AuthAction store="seven" />
                <div className="seven-btn-hover cursor-pointer">
                  <CartIcon variant="seven" />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Navigation */}
          <div style={{ background: 'rgba(9, 10, 15, 0.95)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px', overflowX: 'auto' }}>
              <nav style={{ display: 'flex', alignItems: 'center', height: '38px', whiteSpace: 'nowrap' }}>
                <Link href="/seven/produtos" className="font-display hover:text-[#fff]" style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 0.2s', marginRight: '32px' }}>Todos Produtos</Link>
                <div style={{ display: 'flex', gap: '32px' }}>
                  <Link href="/seven/produtos?marca=simagic" className="font-display hover:text-[#fff]" style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 0.2s' }}>Simagic</Link>
                  <Link href="/seven/produtos?categoria=bases" className="font-display hover:text-[#fff]" style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 0.2s' }}>Base</Link>
                  <Link href="/seven/produtos?categoria=pedais" className="font-display hover:text-[#fff]" style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 0.2s' }}>Pedal</Link>
                  <Link href="/seven/produtos?categoria=volantes" className="font-display hover:text-[#fff]" style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 0.2s' }}>Volante</Link>
                  <Link href="/seven/produtos?categoria=acessorios" className="font-display hover:text-[#fff]" style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 0.2s' }}>Acessórios e Periféricos</Link>
                  <Link href="/seven/produtos?categoria=cockpits" className="font-display hover:text-[#fff]" style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 0.2s' }}>Simuladores/Cockpits</Link>
                  <Link href="/seven/produtos?marca=simagic&tipo=kit" className="font-display hover:text-[#fff]" style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 0.2s' }}>Kits Simagic</Link>
                </div>
              </nav>
            </div>
          </div>
        </header>
      </div>

      {/* --- MOBILE HEADER --- */}
      <div className="mobile-header-seven">
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(9, 10, 15, 0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '12px',
          paddingBottom: '12px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px' }}>
              <Link href="/seven" style={{ flexShrink: 0 }}>
                <img 
                  src="/logo-seven.svg" 
                  alt="Seven Sim Racing" 
                  style={{ height: '32px', display: 'block', objectFit: 'contain' }}
                />
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AuthAction store="seven" mobile={true} />
                <CartIcon variant="seven" />
              </div>
            </div>

            <div style={{ padding: '0 16px' }}>
              <SearchBar variant="seven" />
            </div>

            <div style={{ display: 'flex', gap: '8px', padding: '0 16px', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <StoreSwitcher store="kings" />
              </div>
              <div style={{ flex: 1 }}>
                <StoreSwitcher store="msu" />
              </div>
            </div>

            <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'center' }}>
                <Link href="/seven/produtos?marca=simagic" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Simagic
                </Link>
                <Link href="/seven/produtos?categoria=bases" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Bases
                </Link>
                <Link href="/seven/produtos?categoria=volantes" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Volantes
                </Link>
                <Link href="/seven/produtos?categoria=pedais" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Pedais
                </Link>
              </div>
            </nav>
          </div>
        </header>
      </div>

      <main style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </main>

      <footer style={{ background: '#0a0e17', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '80px', position: 'relative', zIndex: 10 }}>
        <style dangerouslySetInnerHTML={{__html: `
          .seven-footer-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px 16px;
            padding: 32px 16px;
            max-width: 1920px;
            margin: 0 auto;
          }
          .seven-footer-grid > div:first-child { grid-column: 1 / -1; }
          .seven-footer-grid h3 { font-size: 0.75rem !important; margin-bottom: 12px !important; }
          .seven-footer-grid a, .seven-footer-grid span, .seven-footer-grid div { font-size: 0.78rem !important; }
          @media (min-width: 768px) {
            .seven-footer-grid {
              grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
              gap: 40px;
              padding: 60px 24px;
            }
            .seven-footer-grid > div:first-child { grid-column: auto; }
            .seven-footer-grid h3 { font-size: 1rem !important; margin-bottom: 20px !important; }
            .seven-footer-grid a, .seven-footer-grid span, .seven-footer-grid div { font-size: 0.85rem !important; }
          }
        `}} />
        <div className="seven-footer-grid">
          
          {/* Coluna 1: Contato e Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <img src="/logo-seven.svg" alt="Seven Sim Racing" style={{ height: '40px', objectFit: 'contain', alignSelf: 'flex-start' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                <Phone size={14} color="#ea580c" style={{ flexShrink: 0 }} />
                <span>(11) 91549-7709</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                <Mail size={14} color="#ea580c" style={{ flexShrink: 0 }} />
                <span>contato@sevensimracing.com.br</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                <Clock size={14} color="#ea580c" style={{ flexShrink: 0 }} />
                <span>09:00 - 17:00</span>
              </div>
            </div>
          </div>

          {/* Coluna 2: Institucional */}
          <div>
            <h3 style={{ color: '#ea580c', fontWeight: 800 }}>Institucional</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Quem Somos', 'Como comprar', 'Privacidade', 'Envio', 'Pagamento', 'Garantia', 'Fale Conosco', 'Trocas'].map(link => (
                <a key={link} href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} className="hover:text-[#ea580c]">{link}</a>
              ))}
            </div>
          </div>

          {/* Coluna 3: Painel e Redes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ color: '#ea580c', fontWeight: 800 }}>Painel</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Meus Pedidos', 'Meus Dados', 'Contato'].map(link => (
                  <a key={link} href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} className="hover:text-[#ea580c]">{link}</a>
                ))}
              </div>
            </div>

          </div>

          {/* Coluna 4: Pagamento e Segurança */}
          <div>
            <h3 style={{ color: '#ea580c', fontWeight: 800 }}>Pagamento</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <div style={{ padding: '4px', background: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00b1ea' }}>
                <QrCode size={18} />
              </div>
              <div style={{ padding: '4px', background: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00b1ea' }}>
                <CreditCard size={18} />
              </div>
              <div style={{ padding: '4px', background: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                <Barcode size={18} />
              </div>
            </div>
            
            <h3 style={{ color: '#ea580c', fontWeight: 800 }}>Segurança</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f8fafc', fontWeight: 800 }}>
                <ShieldCheck size={16} color="#10b981" /> Google Safe Browsing
              </div>
              <div style={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
                <ShieldCheck size={18} color="#ea580c" />
                <span style={{ color: '#94a3b8', fontWeight: 800, letterSpacing: '1px' }}>LOJA PROTEGIDA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Faixa Laranja Base */}
        <style dangerouslySetInnerHTML={{__html: `
          .seven-footer-bottom {
            background: #ea580c;
            padding: 16px;
            display: flex;
            flex-direction: column-reverse;
            align-items: center;
            text-align: center;
            gap: 16px;
          }
          @media (min-width: 768px) {
            .seven-footer-bottom {
              flex-direction: row;
              justify-content: space-between;
              text-align: left;
              padding: 16px 40px;
            }
          }
        `}} />
        <div className="seven-footer-bottom">
          <div>
            <p style={{ color: '#fff', fontSize: '0.78rem', margin: 0, fontWeight: 600 }}>
              Seven Sim Racing 61.219.783/0001-93
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem', margin: '4px 0 0', fontWeight: 800, letterSpacing: '1px' }}>
              POWERED BY KINGSHUB
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="#" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Facebook</a>
            <a href="#" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Instagram</a>
            <a href="#" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>TikTok</a>
          </div>
        </div>
      </footer>
    </div>
      </CartProvider>
    </ToastProvider>
  )
}
