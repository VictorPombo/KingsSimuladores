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
        <CartDrawer />
        <div className="theme-seven" style={{ minHeight: '100vh', color: '#f8fafc', position: 'relative', fontFamily: 'var(--font-sans)', zIndex: 1 }}>
      {/* Background Effect */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, rgba(0,0,0,0) 70%)', zIndex: -1, pointerEvents: 'none' }} />
      
      {/* Header Premium Seven Sim Racing */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Bar - Produtos Originais */}
        <div style={{ background: '#050505', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
            
            {/* Removed Voltar à Kings button to standardize in Main Bar */}

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
          {/* Overlay Removido para garantir cor sólida e limpa */}
          
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
              
              {/* Store Switcher Buttons */}
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
              
              {/* Dropdown Qual o Seu Perfil? */}
              <ProfileDropdown />

              {/* Links Horizontais */}
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

      <main style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </main>

      <footer style={{ background: '#0a0e17', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '80px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', padding: '60px 24px' }}>
          
          {/* Coluna 1: Contato e Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <img src="/logo-seven.svg" alt="Seven Sim Racing" style={{ height: '48px', objectFit: 'contain', alignSelf: 'flex-start' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '0.85rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                  <Phone size={14} />
                </div>
                (11) 91549-7709
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '0.85rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                  <Mail size={14} />
                </div>
                contato@sevensimracing.com.br
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '0.85rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                  <Clock size={14} />
                </div>
                <div>Horários de Funcionamento<br/><strong style={{color: '#f8fafc'}}>Das 09:00 As 17:00</strong></div>
              </div>
            </div>
          </div>

          {/* Coluna 2: Institucional */}
          <div>
            <h3 style={{ color: '#ea580c', fontWeight: 800, fontSize: '1rem', marginBottom: '20px' }}>Institucional</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Empresa (Quem Somos)', 'Como comprar', 'Segurança (Política de Privacidade)', 'Envio', 'Pagamento', 'Tempo de Garantia', 'Fale Conosco', 'Trocas e devoluções (Completa)'].map(link => (
                <a key={link} href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }} className="hover:text-[#ea580c]">{link}</a>
              ))}
            </div>
          </div>

          {/* Coluna 3: Painel e Redes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div>
              <h3 style={{ color: '#ea580c', fontWeight: 800, fontSize: '1rem', marginBottom: '20px' }}>Painel</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Meus Pedidos', 'Meus Dados', 'Contato'].map(link => (
                  <a key={link} href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }} className="hover:text-[#ea580c]">{link}</a>
                ))}
              </div>
            </div>
            <div>
              <h3 style={{ color: '#ea580c', fontWeight: 800, fontSize: '1rem', marginBottom: '20px' }}>Nossas Redes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }} className="hover:text-[#ea580c]">
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </div> 
                  sevensimracing
                </a>
                <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }} className="hover:text-[#ea580c]">
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </div> 
                  sevensimracing
                </a>
                <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }} className="hover:text-[#ea580c]">
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 6.27 6.36 6.34 6.34 0 0 0 6.25-6.36V10.5a7.39 7.39 0 0 0 5 1.61V8.66a5.55 5.55 0 0 1-2.93-1.97z"/></svg>
                  </div> 
                  sevensimracing
                </a>
              </div>
            </div>
          </div>

          {/* Coluna 4: Pagamento e Segurança */}
          <div>
            <h3 style={{ color: '#ea580c', fontWeight: 800, fontSize: '1rem', marginBottom: '20px' }}>Pagamento</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
              <div style={{ padding: '6px', background: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00b1ea' }}>
                <QrCode size={20} />
              </div>
              <div style={{ padding: '6px', background: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00b1ea' }}>
                <CreditCard size={20} />
              </div>
              <div style={{ padding: '6px', background: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                <Barcode size={20} />
              </div>
            </div>
            
            <h3 style={{ color: '#ea580c', fontWeight: 800, fontSize: '1rem', marginBottom: '20px' }}>Segurança</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', fontSize: '0.85rem', fontWeight: 800 }}>
                <ShieldCheck size={20} color="#10b981" /> Google Safe Browsing
              </div>
              <div style={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', width: 'fit-content' }}>
                <ShieldCheck size={24} color="#ea580c" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '1px' }}>LOJA PROTEGIDA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Faixa Laranja Base */}
        <div style={{ background: '#ea580c', padding: '16px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <p style={{ color: '#fff', fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>
              Todos os direitos reservados a Seven Sim Racing 61.219.783/0001-93
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', margin: 0, fontWeight: 800, letterSpacing: '1px' }}>
              POWERED BY KINGSHUB
            </p>
          </div>
        </div>
      </footer>
    </div>
      </CartProvider>
    </ToastProvider>
  )
}
