'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div 
      style={{ position: 'relative', marginRight: '40px' }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div style={{ border: '1px solid #ea580c', borderRadius: '20px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
        <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px' }}>QUAL O SEU PERFIL?</span>
        <ChevronDown size={14} color="#ea580c" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </div>
      
      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          marginTop: '8px',
          zIndex: 50,
          background: 'rgba(10, 12, 18, 0.95)', 
          border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: '8px', 
          padding: '8px 0', 
          minWidth: '200px', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)' 
        }}>
          <Link href="/seven/niveis/iniciante" style={{ display: 'block', padding: '8px 24px', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }} onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent' }}>
            Iniciante
          </Link>
          <Link href="/seven/niveis/intermediario" style={{ display: 'block', padding: '8px 24px', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }} onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent' }}>
            Intermediário
          </Link>
          <Link href="/seven/niveis/avancado" style={{ display: 'block', padding: '8px 24px', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }} onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent' }}>
            Avançado
          </Link>
        </div>
      )}
    </div>
  )
}
