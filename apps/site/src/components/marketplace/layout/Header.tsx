import React from 'react'
import Link from 'next/link'
import { Container, Button } from '@kings/ui'
import { Search } from 'lucide-react'

export function Header() {
  return (
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

          {/* Search Bar - Padronizado Kings */}
          <div style={{ flex: 1, maxWidth: '600px', margin: '0 40px', position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Buscar volantes, pedais, cockpits..." 
              style={{ 
                width: '100%', padding: '12px 20px', paddingRight: '50px', 
                borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', 
                background: 'rgba(255,255,255,0.02)', color: '#fff', 
                fontSize: '0.9rem', outline: 'none', transition: 'all 0.3s' 
              }}
              className="focus:border-[#d946ef] focus:bg-[rgba(255,255,255,0.05)]"
            />
            <button style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Search size={20} color="#94a3b8" />
            </button>
          </div>

          {/* Actions */}
          <nav style={{ display: 'flex', gap: '24px', alignItems: 'center', flexShrink: 0 }}>
            
            {/* Store Switcher Buttons */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <Link href="/" style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 800, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(to right, #10b981, #047857)', borderRadius: '6px', border: 'none', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)', textDecoration: 'none', transition: 'transform 0.3s ease' }} className="hover:scale-105">
                KINGS SIMULADORES
              </Link>
              <Link href="/seven" style={{ fontSize: '0.85rem', color: '#000', fontWeight: 800, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(to right, #facc15, #ca8a04)', borderRadius: '6px', border: 'none', boxShadow: '0 4px 10px rgba(250, 204, 21, 0.3)', textDecoration: 'none', transition: 'transform 0.3s ease' }} className="hover:scale-105">
                SEVEN SIM RACING
              </Link>
            </div>
            
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>
            
            <Link href="/usado/login" style={{ textDecoration: 'none', padding: '6px 20px', border: '1px solid #d946ef', color: '#d946ef', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s', textTransform: 'uppercase' }} className="hover:bg-[rgba(217,70,239,0.1)]">
              Entrar
            </Link>
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
  )
}
