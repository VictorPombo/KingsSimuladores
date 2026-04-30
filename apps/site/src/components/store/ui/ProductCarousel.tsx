'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function ProductCarousel({ title, prods, tenant = 'kings' }: { title: string, prods: any[], tenant?: 'kings' | 'msu' | 'seven' }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hasOverflow, setHasOverflow] = useState(false)

  const checkOverflow = useCallback(() => {
    if (scrollRef.current) {
      setHasOverflow(scrollRef.current.scrollWidth > scrollRef.current.clientWidth + 2)
    }
  }, [])

  useEffect(() => {
    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [checkOverflow, prods.length])

  if (!prods || prods.length === 0) return null

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -304, behavior: 'smooth' }) // 280px + 24px gap
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 304, behavior: 'smooth' })
    }
  }

  const getTheme = () => {
    switch(tenant) {
      case 'msu':
        return {
          color: '#8b5cf6', // purple-500
          rgba: 'rgba(139, 92, 246, 0.2)',
          badgeText: 'USADO'
        }
      case 'seven':
        return {
          color: '#f59e0b', // amber-500
          rgba: 'rgba(245, 158, 11, 0.2)',
          badgeText: 'NOVO'
        }
      case 'kings':
      default:
        return {
          color: 'var(--success)', // #10b981
          rgba: 'rgba(16, 185, 129, 0.2)',
          badgeText: 'SALE'
        }
    }
  }

  const theme = getTheme()
  const themeColor = theme.color
  const themeRgba = theme.rgba

  return (
    <div style={{ marginBottom: '40px', position: 'relative' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .carousel-item { min-width: 70%; max-width: 70%; }
        .carousel-arrow { display: none; }
        @media (min-width: 640px) {
          .carousel-item { min-width: 45%; max-width: 45%; }
          .carousel-arrow { display: flex; }
        }
        @media (min-width: 1024px) {
          .carousel-item { min-width: calc((100% - 72px) / 4); max-width: calc((100% - 72px) / 4); }
        }
        @media (min-width: 1440px) {
          .carousel-item { min-width: calc((100% - 120px) / 5); max-width: calc((100% - 120px) / 5); }
        }
        @media (min-width: 1800px) {
          .carousel-item { min-width: calc((100% - 150px) / 6); max-width: calc((100% - 150px) / 6); }
        }
      `}} />
      
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', gap: '24px' }}>
        <div style={{ height: '1px', flex: 1, maxWidth: '200px', background: 'linear-gradient(to right, transparent, var(--border))' }} />
        <h2 className="font-display" style={{ 
          fontSize: '1.25rem', 
          fontWeight: 700, 
          letterSpacing: '4px', 
          textTransform: 'uppercase', 
          color: themeColor,
          textShadow: `0 0 10px ${themeRgba}`, 
          margin: 0 
        }}>
          {title}
        </h2>
        <div style={{ height: '1px', flex: 1, maxWidth: '200px', background: 'linear-gradient(to left, transparent, var(--border))' }} />
      </div>
      
      {/* Container Relativo para as Setas */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        
        {/* Seta Esquerda - só aparece se há overflow */}
        {hasOverflow && (
          <button 
            onClick={scrollLeft}
            className="carousel-arrow"
            style={{
              position: 'absolute',
              left: '-20px',
              zIndex: 10,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--bg-card)',
              border: `1px solid ${themeColor}`,
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: `0 4px 12px ${themeRgba}`,
              color: themeColor,
              transition: 'transform 0.2s',
            }}
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Scroll Container */}
        <div 
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: '24px',
            overflowX: 'auto',
            paddingBottom: '32px',
            scrollBehavior: 'smooth',
            scrollSnapType: 'x mandatory',
            width: '100%',
          }} 
          className="hide-scroll"
        >
          {prods.map(product => {
            const hasDiscount = product.price_compare && product.price_compare > product.price
            const imgUrl = product.images?.[0] || 'https://placehold.co/400x400/131928/e8ecf4?text=Produto'
            const brandName = tenant === 'msu' 
              ? (product.profiles?.full_name || 'Usuário MSU') 
              : (product.attributes?.brand || 'Loja Oficial')
            const price = product.price
            const title = product.title
            const url = tenant === 'msu' 
              ? `/usado/anuncio/${product.id}` 
              : tenant === 'seven' 
                ? `/seven/produtos/${product.slug}` 
                : `/produtos/${product.slug}`
            
            return (
              <div key={product.id} className="carousel-item" style={{ 
                scrollSnapAlign: 'start', 
                flexShrink: 0 
              }}>
                <Link href={url} style={{ textDecoration: 'none' }}>
                  <div className="hover:-translate-y-1" style={{
                    color: themeColor,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s, transform 0.2s',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = themeColor}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ background: '#fff', padding: '24px', position: 'relative' }}>
                      <img src={imgUrl} alt={title} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain' }} />
                      {hasDiscount && tenant !== 'msu' && (
                        <div style={{
                          position: 'absolute', top: '12px', left: '12px',
                          background: '#ef4444', color: '#fff', padding: '4px 8px',
                          borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800,
                          textTransform: 'uppercase'
                        }}>
                          Sale
                        </div>
                      )}
                      {tenant === 'msu' && (
                        <div style={{
                          position: 'absolute', top: '12px', right: '12px',
                          background: 'rgba(139, 92, 246, 0.1)', border: '1px solid #8b5cf6',
                          color: '#8b5cf6', padding: '4px 8px',
                          borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800,
                        }}>
                          {theme.badgeText}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>
                        {brandName}
                      </div>
                      <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600, margin: '0 0 16px 0', lineHeight: 1.4, flex: 1 }}>
                        {title.length > 50 ? title.substring(0, 50) + '...' : title}
                      </h3>
                      
                      <div style={{ marginTop: 'auto' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: themeColor }}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          12x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price / 12)} s/ juros
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>

        {/* Seta Direita - só aparece se há overflow */}
        {hasOverflow && (
          <button 
            onClick={scrollRight}
            className="carousel-arrow"
            style={{
              position: 'absolute',
              right: '-20px',
              zIndex: 10,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--bg-card)',
              border: `1px solid ${themeColor}`,
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: `0 4px 12px ${themeRgba}`,
              color: themeColor,
              transition: 'transform 0.2s',
            }}
          >
            <ChevronRight size={24} />
          </button>
        )}

      </div>
    </div>
  )
}
