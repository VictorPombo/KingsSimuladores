'use client'

import React from 'react'
import { Truck, CheckCircle, AlertCircle, MapPin } from 'lucide-react'

const carriers = [
  { name: 'SEDEX (Correios)', desc: 'Encomenda expressa — 1 a 5 dias úteis', icon: '⚡', active: true, provider: 'Frenet' },
  { name: 'Jadlog .Package', desc: 'Transportadora terrestre econômica — 3 a 8 dias úteis', icon: '🚛', active: true, provider: 'Frenet' },
  { name: 'Jadlog .Com', desc: 'Transportadora terrestre expressa — 2 a 6 dias úteis', icon: '🚛', active: true, provider: 'Frenet' },
  { name: 'Azul Cargo Express', desc: 'Frete aéreo expresso — 2 a 5 dias úteis', icon: '✈️', active: true, provider: 'Frenet' },
  { name: 'LATAM Cargo', desc: 'Frete aéreo nacional — 2 a 5 dias úteis', icon: '✈️', active: true, provider: 'Frenet' },
  { name: 'Buslog', desc: 'Transporte rodoviário — 4 a 10 dias úteis', icon: '🚌', active: true, provider: 'Frenet' },
  { name: 'Retirada na loja', desc: 'O cliente busca pessoalmente o produto', icon: '🏪', active: false, provider: 'Interno' },
]

export default function FormasEnvioPage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Formas de Envio</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Transportadoras e métodos de entrega disponíveis</p>
      </div>

      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <MapPin size={20} color="#3b82f6" />
        <div>
          <div style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}>CEP de Origem</div>
          <div style={{ color: '#64748b', fontSize: '0.82rem' }}>Configurado via Frenet — CEP do depósito/armazém</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {carriers.map(c => (
          <div key={c.name} style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '1.6rem', width: '48px', height: '48px', borderRadius: '12px', background: '#1f2025', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 600 }}>{c.name}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '2px' }}>{c.desc}</div>
              <div style={{ display: 'inline-flex', marginTop: '6px', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', background: '#3b82f615', color: '#3b82f6', border: '1px solid #3b82f625' }}>via {c.provider}</div>
            </div>
            <span style={{
              display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderRadius: '12px',
              fontSize: '0.7rem', fontWeight: 'bold',
              background: c.active ? '#10b98118' : '#64748b18',
              color: c.active ? '#10b981' : '#64748b',
              border: `1px solid ${c.active ? '#10b98130' : '#64748b30'}`
            }}>
              {c.active ? <><CheckCircle size={12} /> Ativo</> : <><AlertCircle size={12} /> Inativo</>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
