'use client'

import React from 'react'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart } from 'lucide-react'

export function CartIcon() {
  const { totalItems, setIsOpen } = useCart()

  return (
    <button 
      onClick={() => setIsOpen(true)}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--border)',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)'
      }}
    >
      <ShoppingCart size={20} strokeWidth={2.5} color="var(--text-primary)" />
      {totalItems > 0 && (
        <span 
          style={{
            position: 'absolute',
            top: '-5px', right: '-5px',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 800,
            width: '20px', height: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
          }}
        >
          {totalItems}
        </span>
      )}
    </button>
  )
}
