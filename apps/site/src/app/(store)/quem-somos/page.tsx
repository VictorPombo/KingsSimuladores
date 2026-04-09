import { Container } from '@kings/ui'
import React from 'react'

export const metadata = {
  title: 'Quem Somos | Kings Simuladores',
  description: 'Conheça a história de Fernando Albertoni (Daleste) e a Kings Simuladores.',
}

export default function QuemSomosPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', padding: '60px 0' }}>
      <Container>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '40px' }}>
            <img 
              src="/daleste.png" 
              alt="Fernando Albertoni - Daleste" 
              style={{ 
                width: '150px', 
                height: '150px', 
                borderRadius: '50%', 
                objectFit: 'cover',
                border: '4px solid var(--success)',
                marginBottom: '20px'
              }} 
            />
            <h1 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              A Nossa História
            </h1>
            <p style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '1.2rem', margin: 0 }}>
              Por Fernando Albertoni (Daleste)
            </p>
          </div>

          <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '20px' }}>
              Nossa história começa com a paixão pelo automobilismo virtual. A Kings Simuladores nasceu do sonho de trazer o que há de melhor em equipamentos e tecnologia para o ecossistema brasileiro de simuladores.
            </p>
            <p style={{ marginBottom: '20px' }}>
              <em style={{color: 'var(--text-muted)'}}>(Use este espaço para contar toda a trajetória do Daleste, criação da loja e a essência da marca!)</em>
            </p>
            <p>
              Hoje, somos a grande referência nacional quando o assunto é qualidade, imersão e performance. Seja bem-vindo à família Kings Simuladores!
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}
