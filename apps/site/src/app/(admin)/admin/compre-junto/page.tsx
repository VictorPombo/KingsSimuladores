'use client'

import React from 'react'
import { ShoppingBag, Plus, ArrowRight, Package } from 'lucide-react'

export default function CompreJuntoPage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Compre Junto</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Configure combos de produtos com desconto especial</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '8px', padding: '10px 20px', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(245,158,11,0.3)' }}><Plus size={16} /> Novo Combo</button>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '12px', border: '1px solid #3f424d', padding: '32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#f59e0b20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ShoppingBag size={28} color="#f59e0b" /></div>
        <div>
          <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 6px' }}>Como funciona?</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
            Associe dois ou mais produtos em um combo. Quando o cliente adicionar um produto ao carrinho, os itens do combo serão sugeridos com desconto exclusivo. Perfeito para cross-sell: "Comprou volante → sugere cockpit com 10% OFF".
          </p>
        </div>
      </div>

      {/* Exemplo visual de combo */}
      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '24px', marginBottom: '20px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px' }}>Exemplo de Combo</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ background: '#1f2025', borderRadius: '8px', padding: '16px 24px', textAlign: 'center', border: '1px solid #3f424d' }}>
            <Package size={24} color="#3b82f6" style={{ marginBottom: '6px' }} />
            <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>Volante Fanatec</div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Produto principal</div>
          </div>
          <div style={{ color: '#f59e0b', fontSize: '1.2rem' }}>+</div>
          <div style={{ background: '#1f2025', borderRadius: '8px', padding: '16px 24px', textAlign: 'center', border: '1px dashed #f59e0b30' }}>
            <Package size={24} color="#f59e0b" style={{ marginBottom: '6px' }} />
            <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>Cockpit Pro</div>
            <div style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600 }}>-10% no combo</div>
          </div>
          <ArrowRight size={20} color="#64748b" />
          <div style={{ background: '#10b98118', borderRadius: '8px', padding: '16px 24px', textAlign: 'center', border: '1px solid #10b98130' }}>
            <div style={{ color: '#10b981', fontSize: '1.1rem', fontWeight: 'bold' }}>🎯</div>
            <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>Ticket médio ↑</div>
          </div>
        </div>
      </div>

      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Combo', 'Produto Principal', 'Produto Sugerido', 'Desconto', 'Status'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', background: '#1f2025' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>Nenhum combo criado ainda.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
