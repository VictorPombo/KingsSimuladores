'use client'
import React, { useState } from 'react'
import { Container, Button } from '@kings/ui'
import { useRouter } from 'next/navigation'

export default function VenderPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    title: '',
    price: '',
    condition: 'good',
    imageUrl: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/vender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          price: parseFloat(form.price),
          condition: form.condition,
          imageUrl: form.imageUrl,
          description: form.description
        })
      })

      if (!res.ok) throw new Error('Falha ao anunciar')
      setSuccess(true)
    } catch (e) {
      alert('Erro ao enviar anúncio. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div style={{ background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', minHeight: 'calc(100vh - 90px)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏁</div>
        <h1 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>Anúncio Enviado!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Seu classificado está sob revisão (<code style={{ color: 'var(--accent)' }}>pending_review</code>). Nossa moderação aprovará em breve!
        </p>
        <Button size="lg" onClick={() => router.push('/account')} style={{ width: '100%', background: 'var(--accent)', color: '#000', fontWeight: 800 }}>
          Voltar para Garagem
        </Button>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '20px 20px 100px 20px' }}>
      <h1 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.1 }}>Desapegue e faça Upgrade.</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Anuncie gratuitamente no maior app da comunidade SIMRACING.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        
        {/* Usando Cards soltos para inputs parecendo App */}
        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <label style={labelStyle}>O que você está vendendo?</label>
          <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} type="text" placeholder="Ex: Fanatec CSL DD 8Nm" style={inputStyle} />
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <label style={labelStyle}>Preço (R$)</label>
          <input required value={form.price} onChange={e => setForm({...form, price: e.target.value})} type="number" placeholder="2500" style={inputStyle} />
          
          <label style={{ ...labelStyle, marginTop: '1rem' }}>Estado de Conservação</label>
          <select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})} style={inputStyle}>
            <option value="like_new">Como Novo</option>
            <option value="good">Uso normal</option>
            <option value="fair">Com marcas visíveis</option>
          </select>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <label style={labelStyle}>Foto Principal (URL)</label>
          <input required value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} type="url" placeholder="https://imgur.com/..." style={inputStyle} />
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <label style={labelStyle}>Mais detalhes</label>
          <textarea 
            value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            placeholder="Descreva bem para vender rápido..." style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} 
          />
        </div>

        <Button size="lg" type="submit" disabled={isSubmitting} style={{ background: 'var(--msu-primary)', color: '#000', marginTop: '0.5rem', width: '100%', fontSize: '1rem', height: '56px', borderRadius: '12px' }}>
          {isSubmitting ? 'Enviando...' : 'POSTAR NA VITRINE'}
        </Button>
      </form>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
  marginBottom: '0.4rem',
  fontWeight: 700,
  textTransform: 'uppercase' as const
}

const inputStyle = {
  width: '100%',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-accent)',
  color: '#fff',
  padding: '0.8rem',
  borderRadius: '8px',
  outline: 'none',
  fontSize: '1rem'
}
