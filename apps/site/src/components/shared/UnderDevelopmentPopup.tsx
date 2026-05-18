'use client'

import { useState, useEffect } from 'react'
import { Construction, ArrowRight } from 'lucide-react'

interface UnderDevelopmentPopupProps {
  store: 'seven' | 'msu'
  redirectUrl: string
  redirectLabel: string
  accentColor: string
  logoSrc: string
  storeName: string
}

export function UnderDevelopmentPopup({
  store,
  redirectUrl,
  redirectLabel,
  accentColor,
  logoSrc,
  storeName,
}: UnderDevelopmentPopupProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          background: '#13151c',
          border: `1px solid ${accentColor}40`,
          borderRadius: '20px',
          padding: '40px 32px',
          maxWidth: '460px',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          boxShadow: `0 0 60px ${accentColor}20, 0 24px 60px rgba(0,0,0,0.6)`,
          animation: 'popupIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        <style>{`
          @keyframes popupIn {
            from { opacity: 0; transform: scale(0.9) translateY(10px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>


        {/* Ícone */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <Construction size={28} color={accentColor} />
        </div>

        {/* Logo */}
        <img
          src={logoSrc}
          alt={storeName}
          style={{ height: '32px', objectFit: 'contain', margin: '0 auto 16px', display: 'block' }}
        />

        {/* Texto */}
        <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, margin: '0 0 10px' }}>
          Site em Desenvolvimento
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 28px' }}>
          A nova loja <strong style={{ color: '#e2e8f0' }}>{storeName}</strong> está sendo construída
          com muito carinho. Em breve estará disponível!
          <br /><br />
          Por enquanto, acesse o nosso site atual:
        </p>

        {/* Botão principal */}
        <a
          href={redirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '14px 20px',
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
            borderRadius: '12px',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.95rem',
            textDecoration: 'none',
            boxShadow: `0 4px 20px ${accentColor}40`,
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = `0 8px 28px ${accentColor}60`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = `0 4px 20px ${accentColor}40`
          }}
        >
          {redirectLabel}
          <ArrowRight size={16} />
        </a>


      </div>
    </div>
  )
}
