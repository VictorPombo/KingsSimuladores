'use client'

import { Gift, Plus, Package } from 'lucide-react'
import React, { useState } from 'react'

export default function BrindePage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Brinde</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Configure brindes automáticos para pedidos</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', borderRadius: '8px', padding: '10px 20px', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(139,92,246,0.3)' }}><Plus size={16} /> Novo Brinde</button>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '12px', border: '1px solid #3f424d', padding: '32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#8b5cf620', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Gift size={28} color="#8b5cf6" /></div>
        <div>
          <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 6px' }}>Como funciona?</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
            Configure um produto como brinde e defina regras automáticas: valor mínimo do pedido, categoria específica ou produto gatilho. O brinde será adicionado automaticamente ao carrinho quando as condições forem atendidas.
          </p>
        </div>
      </div>

      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Brinde', 'Condição', 'Pedido Mínimo', 'Status'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', background: '#1f2025' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            <tr><td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <Package size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
              Nenhum brinde configurado ainda.
            </td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
