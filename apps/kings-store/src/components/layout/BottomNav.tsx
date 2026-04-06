'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '../../contexts/CartContext'

export function BottomNav() {
  const pathname = usePathname()
  const { totalItems } = useCart()

  const navItems = [
    { label: 'Início', href: '/', icon: '🏠' },
    { label: 'Catálogo', href: '/produtos', icon: '🏎️' },
    { label: 'Wishlist', href: '/wishlist', icon: '❤️' },
    { label: 'Garagem', href: '/account', icon: '👤' },
  ]

  return (
    <>
      {/* Floating Cart Button above the nav if items exist */}
      {totalItems > 0 && (
        <Link 
          href="/checkout" 
          style={{ 
            position: 'absolute', 
            bottom: '90px', 
            right: '20px', 
            background: 'var(--accent)', 
            color: '#000', 
            width: '56px', 
            height: '56px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            boxShadow: 'var(--shadow-glow)',
            zIndex: 40,
            textDecoration: 'none',
            fontSize: '1.2rem',
            fontWeight: 800
          }}>
          🛒
          <div style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger)', color: '#fff', fontSize: '0.75rem', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {totalItems}
          </div>
        </Link>
      )}

      {/* Base Navigation Menu */}
      <nav style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '70px',
        background: 'rgba(10, 14, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 50,
      }}>
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textDecoration: 'none',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              transform: isActive ? 'translateY(-2px)' : 'none'
            }}>
              <span style={{ fontSize: '1.4rem', filter: isActive ? 'drop-shadow(0 0 8px rgba(0,232,150,0.5))' : 'grayscale(100%) opacity(50%)' }}>
                {item.icon}
              </span>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase' }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
