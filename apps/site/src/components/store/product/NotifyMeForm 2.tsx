'use client'

import { useState, useEffect } from 'react'
import { Button, Input } from '@kings/ui'
import { createClient } from '@kings/db/client'

export function NotifyMeForm({ productId }: { productId: string }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('auth_id', session.user.id)
          .single()
        
        if (profile) {
          if (profile.full_name) setName(profile.full_name)
          if (profile.phone) setPhone(profile.phone)
        }
      }
    }
    loadProfile()
  }, [])

  // Máscara simples de celular (ex: 11999999999)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    setPhone(val)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('idle')

    try {
      const res = await fetch('/api/notify-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, name, phone })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar o aviso')

      setStatus('success')
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'success') {
    return (
      <div style={{
        marginTop: '16px', padding: '24px',
        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
        borderRadius: '12px', textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
        <h4 style={{ color: '#22c55e', fontWeight: 700, margin: '0 0 4px 0' }}>Tudo Certo!</h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Você está na nossa fila de espera VIP. Assim que o produto voltar, enviaremos um WhatsApp para o número {phone}.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      marginTop: '16px', padding: '24px',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '12px'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ color: 'var(--text)', fontWeight: 700, margin: '0 0 4px 0', fontSize: '1.1rem' }}>
          Produto Indisponível
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
          Deixe seu WhatsApp abaixo e seja o primeiro a saber quando repormos o estoque!
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Input 
          placeholder="Seu Nome" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required
        />
        <Input 
          placeholder="WhatsApp (com DDD)" 
          value={phone} 
          onChange={handlePhoneChange} 
          required
          maxLength={11}
          type="tel"
        />
        <Button 
          type="submit" 
          variant="primary" 
          disabled={loading || phone.length < 10}
          style={{ width: '100%', marginTop: '4px' }}
        >
          {loading ? 'Salvando...' : 'Avise-me quando chegar'}
        </Button>
      </form>

      {status === 'error' && (
        <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '12px', textAlign: 'center' }}>
          {errorMsg}
        </p>
      )}
    </div>
  )
}
