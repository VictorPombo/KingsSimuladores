'use client'

import React from 'react'
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react'

const methods = [
  { name: 'Mercado Pago', desc: 'Checkout transparente: Pix, Boleto, Cartão até 12x', icon: '💰', active: true, fees: '3,49% + R$0,40 (Gateway) + 0,50% (Antifraude)' },
  { name: 'Pix', desc: 'Pagamento instantâneo via QR Code', icon: '⚡', active: true, fees: '0,99% por transação' },
  { name: 'Boleto Bancário', desc: 'Pagamento em até 3 dias úteis', icon: '📄', active: true, fees: 'R$ 3,49 por boleto' },
  { name: 'Cartão de Crédito', desc: 'Visa, Mastercard, Elo, Amex — até 12x', icon: '💳', active: true, fees: '3,49% + R$0,40 por transação' },
]

export default function FormasPagamentoPage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Formas de Pagamento</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Meios de pagamento aceitos na loja</p>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {methods.map(m => (
          <div key={m.name} style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '1.6rem', width: '48px', height: '48px', borderRadius: '12px', background: '#1f2025', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{m.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 600 }}>{m.name}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '2px' }}>{m.desc}</div>
              <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '4px', fontFamily: 'monospace' }}>Taxa: {m.fees}</div>
            </div>
            <span style={{
              display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderRadius: '12px',
              fontSize: '0.7rem', fontWeight: 'bold',
              background: m.active ? '#10b98118' : '#ef444418',
              color: m.active ? '#10b981' : '#ef4444',
              border: `1px solid ${m.active ? '#10b98130' : '#ef444430'}`
            }}>
              {m.active ? <><CheckCircle size={12} /> Ativo</> : <><AlertCircle size={12} /> Inativo</>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
