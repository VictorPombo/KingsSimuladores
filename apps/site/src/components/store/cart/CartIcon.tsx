'use client'

import React from 'react'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart } from 'lucide-react'

export function CartIcon({ variant = 'kings' }: { variant?: 'kings' | 'seven' | 'msu' }) {
  const { totalItems, setIsOpen } = useCart()

  // Define accent color based on variant
  let accentColor = 'var(--accent)'
  if (variant === 'msu') accentColor = '#d946ef'
  if (variant === 'seven') accentColor = '#ea580c'

  return (
    <>
      <style>{`
        @keyframes pulse-cart {
          0% { box-shadow: 0 0 0 0 ${accentColor}80; }
          70% { box-shadow: 0 0 0 10px rgba(0,0,0,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
        }
        .pulsing-cart {
          animation: pulse-cart 2s infinite;
        }
      `}</style>
      <button 
        onClick={() => setIsOpen(true)}
        className={totalItems > 0 ? 'pulsing-cart' : ''}
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
              background: accentColor,
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
    </>
  )
}
