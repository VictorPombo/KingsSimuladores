'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Container, Button } from '@kings/ui'
import { createBrowserClient } from '@supabase/ssr'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('')
  const [emailValue, setEmailValue] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  // Refs para controlar campos de senha e evitar popup Safari
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)

  const handleEmailBlur = async () => {
    if (!emailValue || mode !== 'register') {
      setEmailError('')
      return
    }
    setIsCheckingEmail(true)
    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue })
      })
      const data = await res.json()
      if (data.exists) {
        setEmailError('Este e-mail já está em uso')
      } else {
        setEmailError('')
      }
    } catch(e) {}
    setIsCheckingEmail(false)
  }

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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })
    
    // Supabase returns a fake success if the email is already registered (to prevent email enumeration).
    // We can detect this by checking if the user object has no identities.
    if (data?.user && data.user.identities && data.user.identities.length === 0) {
      setError('Este e-mail já está cadastrado. Por favor, faça login ou recupere sua senha.')
      setLoading(false)
      return
    }

    if (error) {
      if (error.message.includes('Error sending confirmation email') || error.message.includes('rate limit')) {
        setError('Conta criada, mas houve um erro ao enviar o e-mail de confirmação. (Limite de envios atingido no Supabase). Tente fazer o login se a confirmação não for obrigatória.')
        setMode('login')
        form.reset()
        setPasswordValue('')
        setConfirmPasswordValue('')
      } else if (error.message.includes('User already registered')) {
        setError('Este e-mail já está cadastrado. Por favor, faça login ou recupere sua senha.')
      } else {
        setError(error.message)
      }
    } else {
      if (data.session) {
        // Se a sessão já foi criada (Auto-Confirm ON), entra direto
        window.location.href = '/'
      } else {
        setSuccess('Conta criada com sucesso! Você já pode acessar o sistema (ou verifique seu e-mail se exigido).')
        setMode('login')
        form.reset() // Limpa os campos uncontrolled
      }
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
      } else if (data.fallbackLink) {
        setSuccess('Redirecionando para redefinição de senha...')
        window.location.href = data.fallbackLink
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
        .kings-password-mask {
          -webkit-text-security: disc;
          -moz-text-security: disc;
          text-security: disc;
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
          onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleResetPassword}
          autoComplete="off"
          data-form-type="other"
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
                color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>Nome completo</label>
              <input
                type="text" required
                placeholder="Piloto" autoComplete="off" name="fullName" id="fullName"
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
              placeholder="seu@email.com" autoComplete="off" name="email" id="email"
              className="kings-input"
              value={emailValue}
              onChange={e => {
                setEmailValue(e.target.value)
                if (emailError) setEmailError('')
              }}
              onBlur={handleEmailBlur}
              style={{
                borderColor: emailError ? '#ef4444' : undefined
              }}
            />
            {isCheckingEmail && <span style={{ color: '#00e5ff', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>Verificando...</span>}
            {emailError && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{emailError}</span>}
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
              <div style={{ position: 'relative' }}>
                <input
                  ref={passwordRef}
                  type="text" required
                  placeholder="••••••••" 
                  autoComplete="off"
                  name="password" id="password"
                  className={`kings-input ${!showPassword ? 'kings-password-mask' : ''}`}
                  data-lpignore="true"
                  data-form-type="other"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  style={{ paddingRight: '40px' }}
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
          )}

          {mode === 'register' && (
            <div>
              <label style={{
                display: 'block', marginBottom: '6px',
                color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>Confirmar senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  ref={confirmPasswordRef}
                  type="text" required
                  placeholder="••••••••" 
                  autoComplete="off"
                  name="confirmPassword" id="confirmPassword"
                  className={`kings-input ${!showConfirmPassword ? 'kings-password-mask' : ''}`}
                  data-lpignore="true"
                  data-form-type="other"
                  value={confirmPasswordValue}
                  onChange={(e) => setConfirmPasswordValue(e.target.value)}
                  style={{ 
                    paddingRight: '40px',
                    borderColor: confirmPasswordValue && passwordValue !== confirmPasswordValue ? '#ef4444' : confirmPasswordValue && passwordValue === confirmPasswordValue ? '#10b981' : undefined
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPasswordValue && passwordValue !== confirmPasswordValue && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  As senhas não coincidem
                </span>
              )}
              {confirmPasswordValue && passwordValue === confirmPasswordValue && (
                <span style={{ color: '#10b981', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  Senhas iguais
                </span>
              )}
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
