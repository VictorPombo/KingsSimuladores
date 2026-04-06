'use client'
import React from 'react'
import { Card, Badge, useToast } from './index'
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
  const { toast } = useToast()

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toast('Favoritado com sucesso!', 'success')
  }

  return (
    <Card 
      hover 
      style={{ 
        padding: 0, 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1', backgroundColor: '#fff' }}>
        <img 
          src={imageUrl} 
          alt={title} 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
        />
        
        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6, flexDirection: 'column', alignItems: 'flex-start' }}>
          {isNew && <Badge variant="info">Novo</Badge>}
          {discount > 0 && <Badge variant="success">-{discount}%</Badge>}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlist}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            zIndex: 10,
            fontSize: '0.9rem'
          }}
        >
          ❤️
        </button>
      </div>
      
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', zIndex: 5 }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
          {brand}
        </span>
        
        <h3 style={{ fontSize: '0.9rem', marginTop: '2px', marginBottom: '8px', minHeight: '40px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {title}
        </h3>
        
        <div style={{ marginTop: 'auto' }}>
          {discount > 0 && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
              {formatPrice(price)}
            </div>
          )}
          <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatPrice(finalPrice)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: '0px', fontWeight: 600 }}>
            {installments}x de {formatPrice(installmentValue)} sem juros
          </div>
        </div>
      </div>
    </Card>
  )
}
