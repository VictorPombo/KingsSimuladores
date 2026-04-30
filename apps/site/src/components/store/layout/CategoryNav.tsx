'use client'

import Link from 'next/link'
import { useState } from 'react'

const MENU_ITEMS = [

  {
    label: "TODOS PRODUTOS",
    href: "/produtos"
  },
  {
    label: "THERMALTAKE",
    href: "/marcas/thermaltake"
  },
  {
    label: "PLATAFORMAS",
    href: "/categorias/pc",
    subItems: [
      { label: "COMPUTADOR – PC", href: "/categorias/pc" },
      { label: "PLAYSTATION", href: "/categorias/playstation" },
      { label: "XBOX", href: "/categorias/xbox" }
    ]
  },
  {
    label: "THRUSTMASTER",
    href: "/marcas/thrustmaster",
    subItems: [
      { label: "BASES TM", href: "/categorias/base" },
      { label: "KIT COMPLETO TM", href: "/categorias/kit-completo" },
      { label: "PEDALEIRA TM", href: "/categorias/pedais" },
      { label: "VOLANTES", href: "/categorias/volantes" }
    ]
  },
  {
    label: "MOZA RACING",
    href: "/marcas/moza",
    subItems: [
      { label: "BASES - APENAS BASES", href: "/categorias/base" },
      { label: "KIT COMPLETO", href: "/categorias/kit-completo" },
      { label: "PEDAIS", href: "/categorias/pedais" },
      { label: "VOLANTES", href: "/categorias/volantes" }
    ]
  },
  {
    label: "KIT COMPLETO",
    href: "/categorias/kit-completo"
  },
  {
    label: "COCKPIT",
    href: "/categorias/cockpit"
  },
  {
    label: "CONSULTORIA",
    href: "/consultoria"
  },
  {
    label: "QUEM SOMOS?",
    href: "/quem-somos"
  }
]

export function CategoryNav() {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)

  return (
    <nav 
      style={{ 
        background: 'rgba(6, 8, 15, 0.6)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        zIndex: 90
      }}
    >
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '32px',
        flexWrap: 'wrap',
      }}>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulseGlowConsultoria {
            0% { box-shadow: 0 0 5px rgba(0, 229, 255, 0.2); filter: brightness(1); }
            50% { box-shadow: 0 0 20px rgba(0, 229, 255, 0.8), inset 0 0 10px rgba(0, 229, 255, 0.4); filter: brightness(1.2); }
            100% { box-shadow: 0 0 5px rgba(0, 229, 255, 0.2); filter: brightness(1); }
          }
          .btn-consultoria-pulse {
            animation: pulseGlowConsultoria 2s infinite ease-in-out;
            background: rgba(0, 229, 255, 0.15) !important;
            border: 1px solid rgba(0, 229, 255, 0.5) !important;
            border-radius: 8px !important;
            color: #fff !important;
            text-shadow: 0 0 8px rgba(0, 229, 255, 0.8);
          }
        `}} />
        {MENU_ITEMS.map((item, idx) => {
          const isConsultoria = item.label === 'CONSULTORIA';
          return (
          <div 
            key={idx} 
            style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
            onMouseEnter={() => setActiveDropdown(idx)}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <Link 
              href={item.href}
              className={isConsultoria ? "btn-consultoria-pulse" : ""}
              style={{
                display: 'block',
                padding: isConsultoria ? '6px 12px' : '16px 4px',
                color: activeDropdown === idx ? 'var(--accent)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                textShadow: activeDropdown === idx ? '0 0 10px rgba(0,229,255,0.4)' : 'none'
              }}
            >
              {item.label}
            </Link>

            {item.subItems && activeDropdown === idx && (
              <div 
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(10, 12, 18, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '12px 0',
                  minWidth: '240px',
                  borderRadius: '8px',
                  marginTop: '4px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
                  zIndex: 9999
                }}
              >
                {item.subItems.map((sub, sIdx) => (
                  <Link 
                    key={sIdx}
                    href={sub.href}
                    style={{
                      display: 'block',
                      padding: '10px 24px',
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      fontWeight: 500,
                      letterSpacing: '0.5px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={(e: any) => { 
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; 
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseOut={(e: any) => { 
                      e.currentTarget.style.backgroundColor = 'transparent'; 
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          );
        })}
      </div>
    </nav>
  )
}

export function MobileCategoryNav() {
  return (
    <nav style={{ width: '100%' }}>
      <div 
        className="hide-scroll" 
        style={{ 
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px 16px 16px',
          gap: '12px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory'
        }}
      >
        {MENU_ITEMS.map((item, idx) => {
          const isConsultoria = item.label === 'CONSULTORIA';
          return (
          <Link 
            key={idx} 
            href={item.href}
            className={isConsultoria ? "btn-consultoria-pulse" : ""}
            style={{
              display: 'block',
              padding: '5px 12px',
              background: isConsultoria ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
              border: isConsultoria ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              color: isConsultoria ? 'inherit' : 'var(--text-primary)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '11px',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              scrollSnapAlign: 'start',
              flexShrink: 0
            }}
          >
            {item.label}
          </Link>
          );
        })}
      </div>
    </nav>
  )
}
