'use client'
import React, { useState } from 'react'
import { Container, Button, StreamingBackground } from '@kings/ui'
import { login, signup } from './actions'

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: '#06080F', paddingTop: '100px' }}>
      <StreamingBackground />
      <Container style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(10, 14, 26, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '3rem', width: '100%', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1rem', fontWeight: 700, textAlign: 'center' }}>
            {isLogin ? 'Acesso ao Box' : 'Criar Credencial'}
          </h1>
          <p style={{ color: '#a1a1aa', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
            {isLogin ? 'Faça login para gerenciar sua garagem de simuladores e acompanhar seus pedidos.' : 'Preencha seus dados para começar no ecossistema Kings.'}
          </p>
          
          {searchParams?.error && (
            <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4444', padding: '0.5rem', borderRadius: '0.25rem', marginBottom: '1rem', textAlign: 'center', fontSize: '0.85rem', border: '1px solid rgba(255,0,0,0.2)' }}>
              {searchParams.error}
            </div>
          )}

          <form action={isLogin ? login : signup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!isLogin && (
              <div>
                <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Nome Completo</label>
                <input required name="full_name" type="text" placeholder="Ayrton Senna" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </div>
            )}
            <div>
              <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Logmetria / E-mail</label>
              <input required name="email" type="email" placeholder="piloto@kings.com.br" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Senha</label>
              <input required name="password" type="password" placeholder="••••••••" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
            </div>
            
            <Button type="submit" style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}>
              {isLogin ? 'Ignition / Entrar' : 'Registrar Piloto'}
            </Button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              type="button"
              style={{ background: 'transparent', border: 'none', color: '#00e5ff', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
            >
              {isLogin ? 'Primeira volta? Crie sua conta.' : 'Já é piloto? Voltar ao Box.'}
            </button>
          </div>
        </div>
      </Container>
    </div>
  )
}
