'use client'
import React from 'react'
import Link from 'next/link'
import { formatPrice } from '@kings/utils'
import { Package, AlertTriangle } from 'lucide-react'

interface ListingProps {
  id: string
  title: string
  price: number
  imageUrl: string
  condition: string
  location: string
  sellerName: string
  brand?: string
  model?: string
  hasOriginalBox?: boolean
  hasUsageMarks?: boolean
  isFeatured?: boolean
}

export function ListingCard({ id, title, price, imageUrl, condition, location, sellerName, brand, model, hasOriginalBox, hasUsageMarks, isFeatured }: ListingProps) {
  return (
    <Link href={`/usado/produto/${id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--bg-card)',
        border: isFeatured ? '1px solid rgba(255, 183, 0, 0.3)' : '1px solid var(--border)',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        transition: 'transform 0.2s, border-color 0.2s',
        display: 'flex', flexDirection: 'column',
        cursor: 'pointer',
        boxShadow: isFeatured ? '0 0 20px rgba(255, 183, 0, 0.08)' : 'none',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--border-focus)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)' }}>

        <div style={{ width: '100%', aspectRatio: '4/3', position: 'relative', background: '#000' }}>
          <img src={imageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{
            position: 'absolute', top: '0.5rem', left: '0.5rem',
            background: 'var(--accent)', color: '#000',
            fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px'
          }}>
            {condition.toUpperCase()}
          </div>
          {isFeatured && (
            <div style={{
              position: 'absolute', top: '0.5rem', right: '0.5rem',
              background: 'linear-gradient(135deg, #FFB700, #FF8C00)', color: '#000',
              fontSize: '0.6rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px',
              letterSpacing: '0.5px', textTransform: 'uppercase',
            }}>
              ⭐ Destaque
            </div>
          )}
        </div>

        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {title}
          </h3>

          {(brand || model) && (
            <div style={{ fontSize: '0.78rem', color: '#71717a', marginBottom: '0.5rem' }}>
              {brand && <span>Marca: <strong style={{ color: '#a1a1aa' }}>{brand}</strong></span>}
              {brand && model && <span> · </span>}
              {model && <span>Modelo: <strong style={{ color: '#a1a1aa' }}>{model}</strong></span>}
            </div>
          )}

          <div style={{ color: 'var(--accent)', fontSize: '1.25rem', fontWeight: 700, margin: 'auto 0 0.5rem 0' }}>
            {formatPrice(price)}
          </div>

          {/* Badges */}
          {(hasOriginalBox || hasUsageMarks) && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {hasOriginalBox && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px', background: 'rgba(6, 214, 160, 0.1)', color: '#06d6a0', fontWeight: 600 }}>
                  <Package size={11} /> Caixa
                </span>
              )}
              {hasUsageMarks && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontWeight: 600 }}>
                  <AlertTriangle size={11} /> Uso visível
                </span>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>👤 {sellerName}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📍 {location}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
