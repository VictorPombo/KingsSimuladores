'use client'

import React, { useState } from 'react'
import { Truck, Plus, CheckCircle, Edit2 } from 'lucide-react'

export default function FreteGratisPage() {
  const [rules] = useState<any[]>([])

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Frete Grátis</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Configure regras de frete grátis por valor ou região</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '8px', padding: '10px 20px', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}><Plus size={16} /> Nova Regra</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Truck size={20} color="#10b981" />
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>Por valor mínimo</div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>
            Frete grátis automático quando o pedido atinge um valor mínimo. Ex: "Frete grátis acima de R$ 999".
          </p>
        </div>
        <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Truck size={20} color="#3b82f6" />
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>Por região (CEP)</div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>
            Frete grátis para faixas de CEP específicas. Ex: "Frete grátis para SP capital" (CEPs 01000-000 a 05999-999).
          </p>
        </div>
      </div>

      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Regra', 'Tipo', 'Condição', 'Status'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', background: '#1f2025' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {rules.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                <Truck size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                Nenhuma regra de frete grátis configurada.
              </td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
