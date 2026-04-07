'use client'

import React, { useState } from 'react'
import { Zap, Plus, Play, Pause, Clock, Mail, MessageSquare, ArrowRight } from 'lucide-react'

type Automation = { id: string; name: string; trigger: string; actions: string[]; active: boolean; sent_count: number }

export default function AutomacoesPage() {
  const [automations] = useState<Automation[]>([
    { id: '1', name: 'Carrinho abandonado — WhatsApp (1h)', trigger: 'cart_abandoned_1h', actions: ['WhatsApp'], active: true, sent_count: 0 },
    { id: '2', name: 'Carrinho abandonado — E-mail (24h)', trigger: 'cart_abandoned_24h', actions: ['Email'], active: true, sent_count: 0 },
    { id: '3', name: 'Pós-compra — Avaliação (7 dias)', trigger: 'post_purchase_7d', actions: ['Email'], active: false, sent_count: 0 },
  ])

  const triggerLabels: Record<string, string> = {
    cart_abandoned_1h: 'Carrinho abandonado (1h)',
    cart_abandoned_24h: 'Carrinho abandonado (24h)',
    post_purchase_7d: 'Pós-compra (7 dias)',
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Automações</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Regras automáticas de marketing via WhatsApp e E-mail</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '8px', padding: '10px 20px', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}><Plus size={16} /> Nova Automação</button>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {automations.map(auto => (
          <div key={auto.id} style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'border-color 0.2s' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: auto.active ? '#10b98118' : '#3f424d30', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap size={20} color={auto.active ? '#10b981' : '#64748b'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 600 }}>{auto.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                <Clock size={12} /> <span>{triggerLabels[auto.trigger]}</span>
                <ArrowRight size={12} />
                {auto.actions.map(a => (
                  <span key={a} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '4px', background: a === 'WhatsApp' ? '#10b98118' : '#3b82f618', color: a === 'WhatsApp' ? '#10b981' : '#3b82f6', border: `1px solid ${a === 'WhatsApp' ? '#10b98130' : '#3b82f630'}`, fontSize: '0.7rem', fontWeight: 600 }}>
                    {a === 'WhatsApp' ? <MessageSquare size={10} /> : <Mail size={10} />} {a}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'center', minWidth: '60px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{auto.sent_count}</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Enviados</div>
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderRadius: '12px',
              fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer',
              background: auto.active ? '#10b98118' : '#ef444418',
              color: auto.active ? '#10b981' : '#ef4444',
              border: `1px solid ${auto.active ? '#10b98130' : '#ef444430'}`
            }}>
              {auto.active ? <><Play size={10} /> Ativa</> : <><Pause size={10} /> Pausada</>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
