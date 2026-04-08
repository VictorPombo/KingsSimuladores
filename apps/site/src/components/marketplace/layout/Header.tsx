import React from 'react'
import Link from 'next/link'
import { Container, Button } from '@kings/ui'

export function Header() {
  return (
    <header style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: '80px',
      background: 'rgba(10, 10, 10, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center'
    }}>
      <Container style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/usado" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'var(--accent)',
            color: '#000',
            fontWeight: 800,
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '1.2rem',
            lineHeight: 1
          }}>MSU</div>
          <div style={{ color: '#fff', fontWeight: 600, letterSpacing: '-0.5px' }}>
            Meu Simulador Usado
          </div>
        </Link>
        
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/usado/produtos" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>
            Explorar Anúncios
          </Link>
          <div style={{ width: '1px', height: '16px', background: 'var(--border)' }}></div>
          <Link href="/usado/login" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, transition: 'color 0.2s' }}>
            Entrar
          </Link>
          <Link href="/usado/account" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>
            Minha Garagem
          </Link>
          <Link href="/usado/vender" style={{ textDecoration: 'none' }}>
            <Button style={{ background: 'var(--accent)', color: '#000', padding: '0.5rem 1rem' }}>
              + Anunciar Grátis
            </Button>
          </Link>
        </div>
      </Container>
    </header>
  )
}
