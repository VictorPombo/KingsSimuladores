'use client'
import React, { useState } from 'react'
import { Container, Button } from '@kings/ui'
import { createBrowserSupabaseClient } from '@kings/db/client'

export default function MsuLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createBrowserSupabaseClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert(error.message)
    } else {
      window.location.href = '/usado/account'
    }
    setLoading(false)
  }

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingTop: '120px' }}>
      <Container style={{ maxWidth: '500px' }}>
        <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center' }}>Garagem MSU</h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>Acesse sua conta para gerenciar anúncios</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>E-mail</label>
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: '#fff', padding: '0.75rem', borderRadius: '0.5rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Senha</label>
            <input 
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: '#fff', padding: '0.75rem', borderRadius: '0.5rem' }}
            />
          </div>
          <Button type="submit" disabled={loading} style={{ background: 'var(--accent)', color: '#000', marginTop: '1rem' }}>
            {loading ? 'Acessando...' : 'Entrar'}
          </Button>
          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            A conta do Meu Simulador Usado é a mesma da KingsHub.
          </div>
        </form>
      </Container>
    </div>
  )
}
