import React from 'react'
import { Container } from '@kings/ui'
import Link from 'next/link'

export function Footer() {
  return (
    <footer style={{
      background: 'transparent',
      borderTop: '1px solid var(--border)',
      padding: '4rem 0'
    }}>
      <Container>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>Meu Simulador Usado</div>
            <p style={{ maxWidth: '300px', fontSize: '0.9rem', lineHeight: 1.6 }}>O marketplace oficial da KingsHub para você desapegar e fazer um upgrade no seu setup.</p>
          </div>
          <div style={{ display: 'flex', gap: '4rem' }}>
            <div>
              <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '1rem' }}>Comunidade</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                <li><Link href="/usado/ajuda#como-funciona" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Como Funciona</Link></li>
                <li><Link href="/usado/ajuda#como-vender" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Como Vender</Link></li>
                <li><Link href="/usado/ajuda#seguranca" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Dicas de Segurança</Link></li>
                <li><Link href="/usado/ajuda#regras" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Regras de Moderação</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          &copy; {new Date().getFullYear()} Meu Simulador Usado by KingsHub. Todos os direitos reservados.
        </div>
      </Container>
    </footer>
  )
}
