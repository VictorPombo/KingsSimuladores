'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface BannerSlide {
  src: string
  alt: string
  href: string
}

export function BannerCarousel({ slides, accentColor = '#10b981' }: { slides: BannerSlide[], accentColor?: string }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [slides.length])

  if (!slides || slides.length === 0) return null

  const isExternal = (href: string) => href.startsWith('http')

  return (
    <section style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', overflow: 'hidden', position: 'relative', backgroundColor: '#090a0f', padding: 0, margin: 0 }}>
      <style dangerouslySetInnerHTML={{__html: `
        .banner-container { aspect-ratio: 2.2 / 1; width: 100%; }
        .banner-container img { object-fit: fill !important; object-position: center !important; }
        @media (min-width: 768px) { .banner-container { aspect-ratio: 2.87 / 1; } }
        @media (min-width: 1440px) { .banner-container { aspect-ratio: 3.5 / 1; } }
        @media (min-width: 1800px) { .banner-container { aspect-ratio: 4 / 1; } }
      `}} />
      {/* Container edge-to-edge */}
      <div className="banner-container" style={{ position: 'relative', width: '100%' }}>
        {slides.map((slide, i) => {
          return (
            <div 
              key={slide.src}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: current === i ? 1 : 0,
                transition: 'opacity 0.8s ease-in-out',
                pointerEvents: current === i ? 'auto' : 'none',
                zIndex: current === i ? 2 : 1,
              }}
            >
              {/* Main Banner Image (stretched to fit exactly) */}
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                style={{
                  objectFit: 'fill',
                  objectPosition: 'center',
                }}
              />
              
              {/* Overlay Link */}
              <a
                href={slide.href}
                target={slide.href.startsWith('http') ? '_blank' : '_self'}
                rel={slide.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                style={{ position: 'absolute', inset: 0, zIndex: 2 }}
              />
            </div>
          )
        })}
      </div>

      {/* Dots - padrão circular */}
      {slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
          {slides.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: current === i ? accentColor : 'transparent',
                border: `2px solid ${accentColor}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
