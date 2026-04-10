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
      <style dangerouslySetInnerHTML={{__html: `
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
        <Link href="/quem-somos" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', width: '320px', cursor: 'pointer' }} className="sticker-pump group">
          
          <div style={{ 
            marginBottom: '-30px', 
            marginLeft: '20px',
            textAlign: 'center', 
            background: 'rgba(6, 8, 15, 0.9)', 
            backdropFilter: 'blur(16px)',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
            zIndex: 3,
            position: 'relative',
            width: '230px'
          }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>Olá eu sou Fernando Albertoni</p>
            <p style={{ margin: '4px 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Conhecido como Daleste</p>
            <p style={{ margin: '8px 0 0', fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--success)', fontWeight: 700, lineHeight: 1.3 }}>Clica aqui para conhecer minha história!</p>
          </div>

          <img 
            src="/daleste.png" 
            alt="Fernando Albertoni - Desktop" 
            style={{ 
              width: '130%', 
              height: 'auto',
              objectFit: 'contain', 
              objectPosition: 'left bottom', 
              filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.8))',
              zIndex: 2,
              position: 'relative',
              pointerEvents: 'none',
              transform: 'translate(-85px, 15px)' 
            }} 
          />
        </Link>
      </div>

      {/* VERSÃO MOBILE (LAYOUT DE SUPER-SOBREPOSIÇÃO) */}
      <div className="mobile-only w-full max-w-[896px] mx-auto px-4" style={{ position: 'relative', display: 'flex', justifyContent: 'center', padding: '90px 16px 90px', zIndex: 10 }}>
        {/* Aumentei agressivamente os paddings superior e inferior (90px) para acomodar a foto gigante simetricamente e garantir a mesma distância de cima e de baixo! */}
        
        <Link href="/quem-somos" style={{ textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', maxWidth: '380px', minHeight: '100px', cursor: 'pointer' }} className="sticker-pump group">
          
          <img 
            src="/daleste.png" 
            alt="Fernando Albertoni - Mobile" 
            style={{ 
              position: 'absolute',
              left: '-40px', /* Bem colado/sangrando para a esquerda para caber a foto larga */
              top: '50%',
              transform: 'translateY(-50%)', /* Alinhamento central absoluto em relação à caixinha */
              width: '290px', /* Tamanho extremamente GIGANTE para a nova foto abraçando o volante */
              height: 'auto',
              objectFit: 'contain', 
              filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.8))',
              zIndex: 2,
              pointerEvents: 'none'
            }} 
          />

          <div style={{ 
            textAlign: 'left', 
            background: 'rgba(6, 8, 15, 0.9)', 
            backdropFilter: 'blur(16px)',
            padding: '8px 14px', /* CAIXA ACHATADA: Reduzi o enchimento superior e inferior */
            borderRadius: '10px',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
            zIndex: 3,
            position: 'relative',
            width: '170px' /* Mais fina/estreita na horizontal também */
          }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>Sou Fernando Albertoni</p>
            <p style={{ margin: '2px 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Famoso Daleste</p>
            <p style={{ margin: '6px 0 0', fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--success)', fontWeight: 700, lineHeight: 1.2 }}>Ver minha história!</p>
          </div>
          
        </Link>
      </div>
    </>
  )
}
