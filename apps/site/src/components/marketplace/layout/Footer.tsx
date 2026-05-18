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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
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
        <style dangerouslySetInnerHTML={{__html: `
          .msu-footer-bottom {
            margin-top: 4rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border);
            display: flex;
            flex-direction: column-reverse;
            align-items: center;
            text-align: center;
            gap: 16px;
            font-size: 0.85rem;
            color: var(--text-muted);
          }
          @media (min-width: 768px) {
            .msu-footer-bottom {
              flex-direction: row;
              justify-content: space-between;
              text-align: left;
            }
          }
        `}} />
        <div className="msu-footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} Meu Simulador Usado by KingsHub. Todos os direitos reservados.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="https://instagram.com/kingssimuladores" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', textDecoration: 'none' }}>Instagram</a>
            <a href="https://facebook.com/kingssimuladores" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', textDecoration: 'none' }}>Facebook</a>
            <a href="https://www.youtube.com/@kingssimuladores" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', textDecoration: 'none' }}>YouTube</a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
