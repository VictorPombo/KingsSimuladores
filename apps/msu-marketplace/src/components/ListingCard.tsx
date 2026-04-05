'use client'
import React from 'react'
import Link from 'next/link'
import { formatPrice } from '@kings/utils'

interface ListingProps {
  id: string
  title: string
  price: number
  imageUrl: string
  condition: string
  location: string
  sellerName: string
}

export function ListingCard({ id, title, price, imageUrl, condition, location, sellerName }: ListingProps) {
  return (
    <Link href={`/produto/${id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        transition: 'transform 0.2s, border-color 0.2s',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.borderColor = 'var(--border-focus)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--border)'
      }}>
        
        {/* Imagem (Proporção diferente do ecommerce base) */}
        <div style={{ width: '100%', aspectRatio: '4/3', position: 'relative', background: '#000' }}>
          <img src={imageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          
          <div style={{ 
            position: 'absolute', top: '0.5rem', left: '0.5rem', 
            background: 'var(--accent)', color: '#000', 
            fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' 
          }}>
            {condition.toUpperCase()}
          </div>
        </div>

        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {title}
          </h3>
          <div style={{ color: 'var(--accent)', fontSize: '1.25rem', fontWeight: 700, margin: 'auto 0 0.5rem 0' }}>
            {formatPrice(price)}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>👤 {sellerName}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📍 {location}</span>
          </div>
        </div>
        
      </div>
    </Link>
  )
}
