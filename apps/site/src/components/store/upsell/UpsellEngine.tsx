'use client'

import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@kings/utils'
import { useState, useEffect } from 'react'

/**
 * Motor de Recomendação Inteligente — Kings Simuladores
 * Busca sugestões reais do banco de dados via /api/upsell
 */

interface Suggestion {
  id: string
  title: string
  slug: string
  price: number
  imageUrl: string
  brand: string
  category: string
}

interface UpsellEngineProps {
  variant?: 'compact' | 'full'
  maxItems?: number
  storeContext?: string
}

export function UpsellEngine({ variant = 'compact', maxItems = 2, storeContext = 'kings' }: UpsellEngineProps) {
  const { items, addItem } = useCart()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (items.length === 0) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/upsell', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartItems: items.map(i => ({ id: i.id, title: i.title })),
            limit: maxItems,
            storeContext,
          })
        })
        const data = await res.json()
        setSuggestions(data.suggestions || [])
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [items.length]) // eslint-disable-line react-hooks/exhaustive-deps

  if (items.length === 0 || suggestions.length === 0) return null
  if (loading) return null

  const handleAdd = (product: Suggestion) => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
      brand: product.brand,
      storeOrigin: 'kings',
      quantity: 1,
    })
  }

  // ── VERSÃO COMPACTA (CartDrawer) ──
  if (variant === 'compact') {
    return (
      <div style={{
        marginTop: '16px',
        padding: '16px',
        background: 'rgba(0,229,255,0.03)',
        border: '1px solid rgba(0,229,255,0.1)',
        borderRadius: '12px',
      }}>
        <div style={{
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: 'var(--accent)',
          fontWeight: 700,
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          ⚡ Complete seu Setup
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {suggestions.map(product => (
            <div
              key={product.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                background: 'var(--bg-card)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                transition: 'border-color 0.2s, transform 0.15s',
                cursor: 'pointer',
              }}
              onClick={() => handleAdd(product)}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.transform = 'translateX(4px)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'translateX(0)'
              }}
            >
              <img
                src={product.imageUrl}
                alt={product.title}
                style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'contain', background: '#fff' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {product.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {product.brand}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className="font-display" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)' }}>
                  {formatPrice(product.price)}
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--green)', fontWeight: 600 }}>
                  + ADICIONAR
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── VERSÃO FULL (Checkout Page) ──
  return (
    <div style={{
      marginTop: '24px',
      padding: '20px',
      background: 'rgba(0,229,255,0.02)',
      border: '1px solid rgba(0,229,255,0.08)',
      borderRadius: '12px',
    }}>
      <div style={{
        fontSize: '0.85rem',
        fontWeight: 700,
        color: 'var(--accent, #00e5ff)',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        ⚡ Pilotos que compraram isso também levaram
      </div>

      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '12px',
        paddingBottom: '8px',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
      }}>
        {suggestions.map(product => (
          <div
            key={product.id}
            style={{
              minWidth: '180px',
              maxWidth: '220px',
              flexShrink: 0,
              scrollSnapAlign: 'start',
              background: 'rgba(10,14,26,0.8)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              padding: '16px',
              textAlign: 'center',
              transition: 'border-color 0.2s, transform 0.2s',
              cursor: 'pointer',
            }}
            onClick={() => handleAdd(product)}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#00e5ff'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <img
              src={product.imageUrl}
              alt={product.title}
              style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'contain', background: '#fff', margin: '0 auto 12px' }}
            />
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              {product.brand}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '8px', lineHeight: 1.3 }}>
              {product.title}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#00e5ff', marginBottom: '8px' }}>
              {formatPrice(product.price)}
            </div>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#06d6a0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '6px 12px',
              border: '1px solid rgba(6,214,160,0.3)',
              borderRadius: '6px',
              display: 'inline-block',
            }}>
              + Adicionar ao Carrinho
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
