import { Container } from '@kings/ui'
import React from 'react'
import { DalesteVideoPlayer } from '@/components/store/about/DalesteVideoPlayer'

export const metadata = {
  title: 'Quem Somos | Kings Simuladores',
  description: 'Conheça a história de Fernando Albertoni (Daleste) e a Kings Simuladores.',
}

export default function QuemSomosPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', padding: '30px 0' }}>
      <Container>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <img 
              src="/daleste.png" 
              alt="Fernando Albertoni - Daleste" 
              style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                objectFit: 'cover',
                border: '2px solid var(--success)'
              }} 
            />
            <div>
              <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0', lineHeight: 1 }}>
                A Nossa História
              </h1>
              <p style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
                Por Fernando Albertoni (Daleste)
              </p>
            </div>
          </div>

          {/* Vídeo Nativo com Controles Client-Side */}
          <DalesteVideoPlayer />

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
