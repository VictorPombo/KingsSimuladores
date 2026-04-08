'use client'
import React from 'react'
import Link from 'next/link'
import { formatPrice } from '@kings/utils'
import { MapPin, UserSquare2 } from 'lucide-react'

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
    <Link href={`/usado/produto/${id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'rgba(10, 14, 26, 0.6)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '1rem',
        overflow: 'hidden',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)'
        e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)'
        e.currentTarget.style.boxShadow = '0 10px 40px rgba(6, 182, 212, 0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        
        {/* Imagem */}
        <div style={{ width: '100%', aspectRatio: '4/3', position: 'relative', background: '#000', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
          <img src={imageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          
          <div style={{ 
            position: 'absolute', top: '0.75rem', left: '0.75rem', 
            background: 'rgba(6, 182, 212, 0.9)', color: '#000', 
            fontSize: '0.7rem', fontWeight: 800, padding: '4px 8px', borderRadius: '6px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)', letterSpacing: '0.5px'
          }}>
            {condition.toUpperCase()}
          </div>
        </div>

        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', fontWeight: 600, color: '#f4f4f5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
            {title}
          </h3>
          <div style={{ color: '#06b6d4', fontSize: '1.35rem', fontWeight: 800, margin: 'auto 0 1rem 0' }}>
            {formatPrice(price)}
          </div>
          
          <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '0.75rem' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#a1a1aa' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><UserSquare2 size={14} /> <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sellerName}</span></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {location}</span>
          </div>
        </div>
        
      </div>
    </Link>
  )
}
