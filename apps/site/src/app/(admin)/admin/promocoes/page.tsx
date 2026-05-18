'use client'

import React, { useState } from 'react'
import { Percent, Plus, Clock, CheckCircle, XCircle, Calendar, Tag, Zap } from 'lucide-react'

type Promo = {
  id: string; name: string; type: 'percentage' | 'fixed' | 'buy_x_get_y'
  value: number; min_order: number; starts_at: string; ends_at: string
  active: boolean; usage_count: number; max_usage: number | null
}

const inputStyle: React.CSSProperties = { width: '100%', background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', padding: '10px 14px', color: '#fff', fontSize: '0.9rem', outline: 'none' }

export default function PromocoesPage() {
  const [promos] = useState<Promo[]>([])
  const [showForm, setShowForm] = useState(false)

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Descontos Automáticos</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Regras de desconto aplicadas automaticamente no carrinho</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '8px',
          padding: '10px 20px', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(245,158,11,0.3)'
        }}><Plus size={16} /> Nova Regra</button>
      </div>

      {/* Explainer */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '12px', border: '1px solid #3f424d', padding: '28px 32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#f59e0b20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Zap size={28} color="#f59e0b" /></div>
        <div>
          <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 6px' }}>Como funciona?</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
            Diferente dos <strong style={{ color: '#cbd5e1' }}>Cupons</strong> (onde o cliente precisa digitar um código), os Descontos Automáticos são aplicados <strong style={{ color: '#cbd5e1' }}>sozinhos no carrinho</strong> quando as condições são atendidas. <br/>
            <span style={{ color: '#64748b' }}>Exemplo: "10% OFF em compras acima de R$ 2.000" — o desconto aparece automaticamente no checkout sem o cliente precisar fazer nada.</span>
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Ativas', value: '0', color: '#10b981', icon: CheckCircle },
          { label: 'Agendadas', value: '0', color: '#3b82f6', icon: Clock },
          { label: 'Expiradas', value: '0', color: '#64748b', icon: XCircle },
        ].map((k, i) => (
          <div key={i} style={{ background: '#2c2e36', borderRadius: '8px', padding: '20px', border: '1px solid #3f424d', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <k.icon size={20} color={k.color} />
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>{k.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: k.color, marginTop: '2px' }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={18} color="#f59e0b" /> Criar regra de desconto</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div><label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Nome da regra *</label><input type="text" placeholder="Ex: Black Friday 2026" style={inputStyle} /></div>
            <div><label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Tipo *</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }}><option value="percentage">Desconto %</option><option value="fixed">Desconto fixo (R$)</option><option value="buy_x_get_y">Leve X Pague Y</option></select>
            </div>
            <div><label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Valor do desconto *</label><input type="number" placeholder="10" style={inputStyle} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
            <div><label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Pedido mínimo (R$)</label><input type="number" placeholder="0" style={inputStyle} /></div>
            <div><label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Início *</label><input type="datetime-local" style={inputStyle} /></div>
            <div><label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Fim *</label><input type="datetime-local" style={inputStyle} /></div>
          </div>
        </div>
      )}

      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Regra', 'Tipo', 'Desconto', 'Período', 'Usos', 'Status'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', background: '#1f2025' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {promos.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                <Percent size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                <p style={{ margin: '0 0 4px', fontSize: '0.9rem', fontWeight: 500 }}>Nenhuma regra ativa ainda</p>
                <p style={{ margin: 0, fontSize: '0.8rem' }}>Crie descontos automáticos para o carrinho.</p>
              </td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
