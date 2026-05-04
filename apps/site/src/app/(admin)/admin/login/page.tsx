'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button, Card, Container } from '@kings/ui'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      if (data.session) {
        // Usar href nativo para forçar reload e garantir que edge cookies sejam lidos pelo server
        const searchParams = new URLSearchParams(window.location.search)
        const redirect = searchParams.get('redirect') || '/admin/diario-de-bordo'
        window.location.href = redirect
      }
    } catch (err: any) {
      console.error(err)
      setError('Erro crítico: ' + (err.message || 'Falha na conexão com o banco.'))
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
      <Container maxWidth="400px">
        <Card glow>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1
              className="gradient-text"
              style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800 }}
            >
              KINGS HUB — ADMIN
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '8px' }}>
              Acesso restrito a administradores
            </p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '4px' }}>
                {error}
              </div>
            )}
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                placeholder="admin@kingssimuladores.com.br"
                required
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    paddingRight: '40px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button size="lg" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Autenticando...' : 'Entrar'}
            </Button>
          </form>
        </Card>
      </Container>
    </div>
  )
}
