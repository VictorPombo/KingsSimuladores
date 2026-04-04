import React from 'react'
import { Card } from './index'
import { Badge } from './index'
import { formatPrice } from '@kings/utils'

export interface ProductCardProps {
  id: string
  title: string
  price: number
  imageUrl: string
  brand: string
  discount?: number
  isNew?: boolean
  installments?: number
}

export function ProductCard({
  id,
  title,
  price,
  imageUrl,
  brand,
  discount = 0,
  isNew = false,
  installments = 12,
}: ProductCardProps) {
  const finalPrice = discount > 0 ? price * (1 - discount / 100) : price
  const installmentValue = finalPrice / installments

  return (
    <Card 
      hover 
      style={{ 
        padding: 0, 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer' 
      }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1', backgroundColor: '#fff' }}>
        <img 
          src={imageUrl} 
          alt={title} 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
        />
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexDirection: 'column', alignItems: 'flex-start' }}>
          {isNew && <Badge variant="info">Novo</Badge>}
          {discount > 0 && <Badge variant="success">-{discount}%</Badge>}
        </div>
      </div>
      
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
          {brand}
        </span>
        
        <h3 style={{ fontSize: '1rem', marginTop: '4px', marginBottom: '12px', minHeight: '48px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {title}
        </h3>
        
        <div style={{ marginTop: 'auto' }}>
          {discount > 0 && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
              {formatPrice(price)}
            </div>
          )}
          <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatPrice(finalPrice)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '2px', fontWeight: 600 }}>
            {installments}x de {formatPrice(installmentValue)} sem juros
          </div>
        </div>
      </div>
    </Card>
  )
}
