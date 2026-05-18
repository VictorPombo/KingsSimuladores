'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export function DalesteSticker() {
  const [opacity, setOpacity] = useState(1)

  // Fade Effect APENAS PARA DESKTOP (pois no celular ela não será fixed)
  useEffect(() => {
    const handleScroll = () => {
      // Se a tela for pequena (mobile), ignoramos a lógica de fade porque o componente
      // fará parte orgânica da DOM e sumirá rolando para cima
      if (window.innerWidth < 768) {
        setOpacity(1)
        return
      }

      const scrolled = window.scrollY
      const startFadingAt = 100
      const fullyInvisibleAt = 450

      if (scrolled >= fullyInvisibleAt) {
        setOpacity(0)
      } else if (scrolled > startFadingAt) {
        const range = fullyInvisibleAt - startFadingAt
        const currentInRange = scrolled - startFadingAt
        setOpacity(1 - (currentInRange / range))
      } else {
        setOpacity(1)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (opacity <= 0.05 && typeof window !== 'undefined' && window.innerWidth >= 768) return null

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        .sticker-pump {
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.3s ease;
        }
        .sticker-pump:hover {
          transform: scale(1.1) translateY(-10px) !important;
          filter: brightness(1.2) drop-shadow(0 0 30px rgba(0, 229, 255, 0.5));
          z-index: 10000;
        }
      `}} />

      {/* VERSÃO DESKTOP (FIXA NO CANTO ESQUERDO) */}
      <div className="desktop-only" style={{ position: 'fixed', bottom: 0, left: 0, zIndex: 9999, opacity: opacity, pointerEvents: opacity > 0.5 ? 'auto' : 'none' }}>
        <Link href="/quem-somos" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', width: '240px', cursor: 'pointer' }} className="sticker-pump group">

          <div style={{
            marginBottom: '-25px',
            marginLeft: '15px',
            textAlign: 'center',
            background: 'rgba(6, 8, 15, 0.9)',
            backdropFilter: 'blur(16px)',
            padding: '10px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
            zIndex: 3,
            position: 'relative',
            width: '180px'
          }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '0.72rem', color: '#fff', lineHeight: 1.2 }}>Olá eu sou Fernando Albertoni</p>
            <p style={{ margin: '3px 0', fontSize: '0.65rem', color: '#a1a1aa' }}>Conhecido como Daleste</p>
            <p style={{ margin: '6px 0 0', fontSize: '0.68rem', fontStyle: 'italic', color: '#00e5ff', fontWeight: 700, lineHeight: 1.3 }}>Clica aqui para conhecer minha história!</p>
          </div>

          <img
            src="/daleste.png"
            alt="Fernando Albertoni - Desktop"
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              objectPosition: 'left bottom',
              filter: 'drop-shadow(0 12px 25px rgba(0,0,0,0.8))',
              zIndex: 2,
              position: 'relative',
              pointerEvents: 'none',
              transform: 'translate(-60px, 12px)'
            }}
          />
        </Link>
      </div>

      {/* VERSÃO MOBILE (BANNER CLICÁVEL REDIRECIONANDO PARA A HISTÓRIA) */}
      <div className="mobile-only w-full mx-auto" style={{ position: 'relative', display: 'flex', justifyContent: 'center', padding: '0 16px', margin: '-50px 0 -50px', zIndex: 10 }}>
        <Link href="/quem-somos" style={{ display: 'block', width: '100%', textDecoration: 'none' }}>
          <img
            src="/banner-fernando.png"
            alt="Sou Fernando Albertoni, conhecido como Daleste. Clica pra ver a história!"
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              borderRadius: '16px',
            }}
          />
        </Link>
      </div>
    </>
  )
}
