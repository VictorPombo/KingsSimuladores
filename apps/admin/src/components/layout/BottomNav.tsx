'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { label: 'Visão Geral', href: '/', icon: '📊' },
    { label: 'Moderação', href: '/moderacao', icon: '⚖️' },
    { label: 'Pedidos', href: '/pedidos', icon: '📦' },
  ]

  return (
    <nav style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '70px',
      background: 'rgba(12, 16, 24, 0.95)',
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
            color: isActive ? 'var(--danger)' : 'var(--text-muted)',
            transition: 'all 0.2s ease',
            transform: isActive ? 'translateY(-2px)' : 'none'
          }}>
            <span style={{ fontSize: '1.5rem', filter: isActive ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))' : 'grayscale(100%) opacity(50%)' }}>
              {item.icon}
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase' }}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
