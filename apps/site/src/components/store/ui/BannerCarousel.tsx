'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
    <section style={{ width: '100%', overflow: 'hidden', position: 'relative', backgroundColor: '#090a0f' }}>
      {/* Container com aspect-ratio fixo = ZERO layout shift */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '2.87 / 1' }}>
        {slides.map((slide, i) => {
          const imgEl = (
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                opacity: current === i ? 1 : 0,
                transition: 'opacity 0.8s ease-in-out',
              }}
            />
          )

          if (isExternal(slide.href)) {
            return (
              <a
                key={slide.src}
                href={slide.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: current === i ? 2 : 1,
                  pointerEvents: current === i ? 'auto' : 'none',
                }}
              >
                {imgEl}
              </a>
            )
          }
          return (
            <Link
              key={slide.src}
              href={slide.href}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: current === i ? 2 : 1,
                pointerEvents: current === i ? 'auto' : 'none',
              }}
            >
              {imgEl}
            </Link>
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
