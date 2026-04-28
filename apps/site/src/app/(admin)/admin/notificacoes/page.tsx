'use client'

import React, { useState } from 'react'
import { Bell, Send, AlertTriangle, MessageCircle, Info } from 'lucide-react'

export default function NotificacoesAdminPage() {
  const [form, setForm] = useState({ title: '', message: '', priority: 'normal', sendWhatsapp: false })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.message) return
    
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/admin/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar notificação')
      
      setStatus('success')
      setForm({ title: '', message: '', priority: 'normal', sendWhatsapp: false })
      
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#3b82f620', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bell size={24} color="#3b82f6" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Notificações Globais</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Envie comunicados para todos os usuários da plataforma</p>
        </div>
      </div>

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '32px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div>
            <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Título da Notificação</label>
            <input 
              type="text" 
              required
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              placeholder="Ex: Novo recurso no Marketplace!"
              style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '12px 16px', borderRadius: '8px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Mensagem</label>
            <textarea 
              required
              value={form.message}
              onChange={e => setForm({...form, message: e.target.value})}
              placeholder="Digite o conteúdo do comunicado..."
              style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '12px 16px', borderRadius: '8px', outline: 'none', minHeight: '120px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Prioridade</label>
              <select 
                value={form.priority}
                onChange={e => setForm({...form, priority: e.target.value})}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '12px 16px', borderRadius: '8px', outline: 'none' }}
              >
                <option value="normal">Normal (Informativo)</option>
                <option value="high">Alta (Urgente / Alerta)</option>
              </select>
            </div>

            <div>
              <label style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageCircle size={16} /> Disparo via WhatsApp
              </label>
              <div 
                onClick={() => setForm({...form, sendWhatsapp: !form.sendWhatsapp})}
                style={{ 
                  width: '100%', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                  background: form.sendWhatsapp ? '#22c55e15' : '#0f172a',
                  border: `1px solid ${form.sendWhatsapp ? '#22c55e' : '#334155'}`,
                  display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s'
                }}
              >
                <div style={{ 
                  width: '40px', height: '22px', background: form.sendWhatsapp ? '#22c55e' : '#475569', 
                  borderRadius: '11px', position: 'relative', transition: 'all 0.2s' 
                }}>
                  <div style={{ 
                    position: 'absolute', top: '2px', left: form.sendWhatsapp ? '20px' : '2px', 
                    width: '18px', height: '18px', background: '#fff', borderRadius: '50%', transition: 'all 0.2s' 
                  }} />
                </div>
                <span style={{ color: form.sendWhatsapp ? '#22c55e' : '#94a3b8', fontWeight: 600, fontSize: '0.9rem' }}>
                  {form.sendWhatsapp ? 'Ativado' : 'Desativado'}
                </span>
              </div>
            </div>
          </div>

          {form.sendWhatsapp && (
            <div style={{ display: 'flex', gap: '12px', background: '#f59e0b15', border: '1px solid #f59e0b30', padding: '16px', borderRadius: '8px' }}>
              <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#f59e0b', fontSize: '0.9rem', display: 'block' }}>Atenção ao usar WhatsApp</strong>
                <span style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>Essa ação disparará mensagens para TODOS os usuários com telefone cadastrado. Use apenas para comunicados importantes ou urgentes para evitar bloqueios no número oficial.</span>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div style={{ padding: '16px', background: '#10b98120', color: '#10b981', borderRadius: '8px', border: '1px solid #10b981', textAlign: 'center', fontWeight: 600 }}>
              Notificação enviada com sucesso!
            </div>
          )}

          {status === 'error' && (
            <div style={{ padding: '16px', background: '#ef444420', color: '#ef4444', borderRadius: '8px', border: '1px solid #ef4444', textAlign: 'center', fontWeight: 600 }}>
              Erro: {errorMsg}
            </div>
          )}

          <div style={{ marginTop: '16px' }}>
            <button 
              type="submit" 
              disabled={status === 'loading'}
              style={{ 
                width: '100%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                border: 'none', borderRadius: '8px', padding: '16px', color: '#fff', 
                fontWeight: 'bold', fontSize: '1rem', cursor: status === 'loading' ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: status === 'loading' ? 0.7 : 1
              }}
            >
              <Send size={18} /> {status === 'loading' ? 'Enviando...' : 'Enviar Notificação Global'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
