'use client'
import React, { useState } from 'react'
import { Container, Button } from '@kings/ui'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const getSupabase = () => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = getSupabase()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      window.location.href = '/' // Redirect to home or account page
    }
    setLoading(false)
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const form = e.currentTarget
    const formData = new FormData(form)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const fullName = formData.get('fullName') as string

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    setLoading(true)
    const supabase = getSupabase()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })
    if (error) {
      setError(error.message)
    } else {
      setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.')
      setMode('login')
      form.reset() // Limpa os campos uncontrolled
    }
    setLoading(false)
  }

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    try {
      const response = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao enviar email de recuperação.')
      } else {
        setSuccess('Se o e-mail existir, você receberá um link para redefinir a senha.')
        setMode('login')
      }
    } catch (err: any) {
      setError(err.message || 'Erro de conexão.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .kings-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .kings-input:focus {
          border-color: rgba(0, 229, 255, 0.5) !important;
        }
      `}} />
      {/* Glow de fundo */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(0, 229, 255, 0.08) 0%, rgba(0, 232, 150, 0.04) 40%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <Container style={{ maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: '16px',
          }}>
            <img 
              src="/logo_kings.png" 
              alt="Kings Simuladores" 
              style={{ height: '50px', objectFit: 'contain' }} 
            />
          </div>
          <h1 style={{
            fontSize: '1.8rem', color: '#fff', fontWeight: 800, margin: '0 0 8px 0',
            letterSpacing: '-0.02em',
          }}>
            {mode === 'login' ? 'Acessar Conta' : mode === 'register' ? 'Criar conta' : 'Recuperar Senha'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            {mode === 'login'
              ? 'Identifique-se para acessar seu histórico e pedidos.'
              : mode === 'register'
              ? 'Cadastre-se para acelerar com a Kings Simuladores.'
              : 'Digite seu e-mail para receber um link de recuperação.'
            }
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            {success}
          </div>
        )}

        {/* Card */}
        <form
          action="#"
          onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleResetPassword}
          autoComplete="off"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            background: 'rgba(15, 18, 30, 0.8)',
            backdropFilter: 'blur(20px)',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Safari Honeypot para evitar que ele fique pedindo para salvar a senha a cada letra digitada no email */}
          <input type="text" name="safari_username_honeypot" style={{ position: 'absolute', top: '-9999px', left: '-9999px' }} tabIndex={-1} aria-hidden="true" autoComplete="username" />
          <input type="password" name="safari_password_honeypot" style={{ position: 'absolute', top: '-9999px', left: '-9999px' }} tabIndex={-1} aria-hidden="true" autoComplete="current-password" />

          {mode === 'register' && (
            <div>
              <label style={{
                display: 'block', marginBottom: '6px',
                color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>Nome completo</label>
              <input
                type="text" required
                placeholder="Piloto" autoComplete="name" name="fullName" id="fullName"
                className="kings-input"
              />
            </div>
          )}

          <div>
            <label style={{
              display: 'block', marginBottom: '6px',
              color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>E-mail</label>
            <input
              type="email" required
              placeholder="seu@email.com" autoComplete="username" name="email" id="email"
              className="kings-input"
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{
                  color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>Senha</label>
                {mode === 'login' && (
                  <button type="button" onClick={() => setMode('reset')} style={{ background: 'none', border: 'none', padding: 0, color: '#06b6d4', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    Esqueci a senha
                  </button>
                )}
              </div>
              <input
                type="password" required
                placeholder="••••••••" 
                autoComplete={mode === 'login' ? "current-password" : "new-password"} 
                name="password" id="password"
                className="kings-input"
                data-lpignore="true"
              />
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label style={{
                display: 'block', marginBottom: '6px',
                color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>Confirmar senha</label>
              <input
                type="password" required
                placeholder="••••••••" 
                autoComplete="new-password" 
                name="confirmPassword" id="confirmPassword"
                className="kings-input"
                data-lpignore="true"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading
                ? 'rgba(0, 229, 255, 0.5)'
                : 'var(--gradient-primary)',
              color: '#000',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 16px rgba(0, 229, 255, 0.3)',
              marginTop: '4px',
            }}
            onMouseOver={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar conta' : 'Enviar Link de Recuperação'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>ou</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Toggle Login/Register */}
          <div style={{ textAlign: 'center' }}>
            {mode === 'login' ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                Não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); setSuccess('') }}
                  style={{
                    background: 'none', border: 'none', color: '#00e5ff',
                    fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem',
                    textDecoration: 'underline', textUnderlineOffset: '3px',
                  }}
                >
                  Cadastre-se grátis
                </button>
              </p>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                Já tem conta?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                  style={{
                    background: 'none', border: 'none', color: '#00e5ff',
                    fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem',
                    textDecoration: 'underline', textUnderlineOffset: '3px',
                  }}
                >
                  Acessar Conta
                </button>
              </p>
            )}
          </div>
        </form>

        {/* Footer info */}
        <p style={{
          textAlign: 'center', fontSize: '0.78rem',
          color: 'var(--text-muted)', marginTop: '24px',
          lineHeight: 1.5,
        }}>
          Sua conta é unificada pela KingsHub.<br />
          Seus dados estão protegidos com criptografia ponta a ponta.
        </p>
      </Container>
    </div>
  )
}
