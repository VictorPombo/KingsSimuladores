'use client'
import React from 'react'
import { Container, Button, StreamingBackground } from '@kings/ui'

export default function LoginPage() {
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: '#06080F', paddingTop: '100px' }}>
      <StreamingBackground />
      <Container style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(10, 14, 26, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1rem', fontWeight: 700 }}>Acesso ao Box</h1>
          <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>A identificação de pilotos (Supabase Auth) será injetada nesta tela via OAuth na próxima fase.</p>
          <Button style={{ width: '100%', padding: '1rem', marginBottom: '1rem' }}>Entrar com Google</Button>
          <Button variant="secondary" style={{ width: '100%', padding: '1rem' }}>Entrar com E-mail</Button>
        </div>
      </Container>
    </div>
  )
}
