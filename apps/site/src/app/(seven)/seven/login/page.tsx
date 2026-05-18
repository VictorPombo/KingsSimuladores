'use client'
import React, { useState } from 'react'
import { Container, Button } from '@kings/ui'
import { createBrowserClient } from '@supabase/ssr'
import { Eye, EyeOff } from 'lucide-react'

export default function SevenLoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const getSupabase = () => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = getSupabase()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      window.location.href = '/seven/account' // Redirect to Seven account
    }
    setLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

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
      if (error.message.includes('Error sending confirmation email') || error.message.includes('rate limit')) {
        setError('Conta criada, mas o e-mail de confirmação não pôde ser enviado no momento. Tente fazer o login ou contate o suporte.')
        setMode('login')
        setPassword('')
        setConfirmPassword('')
        setFullName('')
      } else {
        setError(error.message)
      }
    } else {
      setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.')
      setMode('login')
      setPassword('')
      setConfirmPassword('')
      setFullName('')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', background: '#050505', fontFamily: 'var(--font-sans)' }}>
      {/* Glow de fundo */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(234, 88, 12, 0.15) 0%, rgba(234, 88, 12, 0.05) 40%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <Container style={{ maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: '16px',
          }}>
            <img 
              src="/logo-seven.svg" 
              alt="Seven Sim Racing" 
              style={{ height: '50px', objectFit: 'contain' }} 
            />
          </div>
          <h1 style={{
            fontSize: '1.8rem', color: '#fff', fontWeight: 800, margin: '0 0 8px 0',
            letterSpacing: '-0.02em',
          }}>
            {mode === 'login' ? 'Acesso ao Painel' : 'Crie seu perfil'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            {mode === 'login'
              ? 'Identifique-se para acessar seu histórico e pedidos da Seven.'
              : 'Cadastre-se para acelerar com a Seven Sim Racing.'
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
          onSubmit={mode === 'login' ? handleLogin : handleRegister}
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
          {mode === 'register' && (
            <div>
              <label style={{
                display: 'block', marginBottom: '6px',
                color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>Nome completo</label>
              <input
                type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Piloto"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                  padding: '12px 16px', borderRadius: '10px', fontSize: '0.95rem',
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(234, 88, 12, 0.5)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          )}

          <div>
            <label style={{
              display: 'block', marginBottom: '6px',
              color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>E-mail</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                padding: '12px 16px', borderRadius: '10px', fontSize: '0.95rem',
                outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(234, 88, 12, 0.5)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div>
            <label style={{
              display: 'block', marginBottom: '6px',
              color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                  padding: '12px 16px', paddingRight: '40px', borderRadius: '10px', fontSize: '0.95rem',
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(234, 88, 12, 0.5)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label style={{
                display: 'block', marginBottom: '6px',
                color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>Confirmar senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                    padding: '12px 16px', paddingRight: '40px', borderRadius: '10px', fontSize: '0.95rem',
                    outline: 'none', transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(234, 88, 12, 0.5)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? 'rgba(234, 88, 12, 0.5)' : '#ea580c',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 16px rgba(234, 88, 12, 0.3)',
              marginTop: '4px',
            }}
            onMouseOver={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {loading
              ? (mode === 'login' ? 'Entrando...' : 'Criando perfil...')
              : (mode === 'login' ? 'Acessar' : 'Criar perfil')
            }
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>ou</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Toggle Login/Register */}
          <div style={{ textAlign: 'center' }}>
            {mode === 'login' ? (
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
                Não tem perfil?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); setSuccess('') }}
                  style={{
                    background: 'none', border: 'none', color: '#ea580c',
                    fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem',
                    textDecoration: 'underline', textUnderlineOffset: '3px',
                  }}
                >
                  Cadastre-se grátis
                </button>
              </p>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
                Já tem perfil?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                  style={{
                    background: 'none', border: 'none', color: '#ea580c',
                    fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem',
                    textDecoration: 'underline', textUnderlineOffset: '3px',
                  }}
                >
                  Acesso ao Painel
                </button>
              </p>
            )}
          </div>
        </form>

        {/* Footer info */}
        <p style={{
          textAlign: 'center', fontSize: '0.78rem',
          color: '#64748b', marginTop: '24px',
          lineHeight: 1.5,
        }}>
          Sua conta é unificada pela KingsHub.<br />
          Seus dados estão protegidos com criptografia ponta a ponta.
        </p>
      </Container>
    </div>
  )
}
