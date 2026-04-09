'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export function DalesteSticker() {
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      // Ajustes finos: começa a sumir já na primeira rolagem suave do Hero
      // Termina de sumir exatamente na altura média do Banner principal (~400px do topo)
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

  if (opacity <= 0.05) return null // Desmonta ou não renderiza quando invisível

  return (
    <Link href="/quem-somos" style={{ textDecoration: 'none' }}>
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
      <div style={{
        position: 'fixed',
        bottom: '0',
        left: '0', /* Editado p/ ficar colado na borda esquerda */
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start', /* Alinha o conteúdo à esquerda do container */
        justifyContent: 'flex-end',
        cursor: 'pointer',
        width: '320px',
        opacity: opacity,
        pointerEvents: opacity > 0.5 ? 'auto' : 'none'
      }} className="hidden md:flex flex-col items-start justify-end sticker-pump group">
        
        {/* Caixa de Texto compacta - Fica EM CIMA da imagem */}
        <div style={{ 
          marginBottom: '-30px', 
          marginLeft: '20px', /* Empurra a caixa para o centro visual mesmo alinhando na esquerda */
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

        {/* Imagem do Daleste - Fica EMBAIXO da caixa de texto */}
        <img 
          src="/daleste.png" 
          alt="Fernando Albertoni" 
          style={{ 
            width: '130%', 
            height: 'auto',
            objectFit: 'contain', 
            objectPosition: 'left bottom', 
            filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.8))',
            zIndex: 2,
            position: 'relative',
            pointerEvents: 'none',
            transform: 'translate(-85px, 15px)' /* Puxão agressivo para zerar o vão na borda */
          }} 
        />
      </div>
    </Link>
  )
}
