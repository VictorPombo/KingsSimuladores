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
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '120px' }}>
        <Container style={{ textAlign: 'center' }}>
          <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '1rem', border: '1px solid var(--border)', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏁</div>
            <h1 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>Anúncio Enviado!</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Seu equipamento está em nossa central de <strong>Moderação</strong>.
              Nossa equipe irá revisar os dados (status: <code style={{ color: 'var(--accent)' }}>pending_review</code>) e ele entrará na vitrine em breve!
            </p>
            <Button onClick={() => router.push('/')} style={{ background: 'var(--accent)', color: '#000' }}>
              Voltar ao Início
            </Button>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px' }}>
      <Container>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800, marginBottom: '0.5rem' }}>Desapegue e faça um Upgrade.</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Preencha os dados do seu equipamento. Anunciar no MSU é gratuito, a KingsHub retém comissão apenas no sucesso da venda para garantir sua segurança.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
            
            <div>
              <label style={labelStyle}>O que você está vendendo?</label>
              <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} type="text" placeholder="Ex: Fanatec CSL DD 8Nm" style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Preço (R$)</label>
                <input required value={form.price} onChange={e => setForm({...form, price: e.target.value})} type="number" placeholder="2500" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})} style={inputStyle}>
                  <option value="like_new">Como Novo (Na caixa)</option>
                  <option value="good">Bom (Marcas normais de uso)</option>
                  <option value="fair">Justo (Marcas pesadas)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Link da Imagem Principal</label>
              <input required value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} type="url" placeholder="https://imgur.com/... (Temporário)" style={inputStyle} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Na próxima onda (Wave 2) ativaremos o envio de arquivos reais (Supabase Storage).
              </div>
            </div>

            <div>
              <label style={labelStyle}>Descrição do Equipamento</label>
              <textarea 
                value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Detalhes, tempo de uso, compatibilidade..." style={{ ...inputStyle, minHeight: '120px' }} 
              />
            </div>

            <Button type="submit" disabled={isSubmitting} style={{ background: 'var(--accent)', color: '#000', marginTop: '1rem' }}>
              {isSubmitting ? 'Enviando pra Box...' : 'Enviar para Moderação'}
            </Button>
          </form>

        </div>
      </Container>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: '0.9rem',
  color: 'var(--text-primary)',
  marginBottom: '0.5rem',
  fontWeight: 500
}

const inputStyle = {
  width: '100%',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-accent)',
  color: '#fff',
  padding: '0.75rem 1rem',
  borderRadius: '0.5rem',
  outline: 'none'
}
