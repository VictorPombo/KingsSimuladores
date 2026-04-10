'use client'

import React from 'react'
import { DollarSign, TrendingUp, ArrowDownRight, Clock, AlertCircle, Wallet, PieChart } from 'lucide-react'

export default function MsuComissoesPage() {
  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign size={24} color="#06b6d4" /> Comissões e Repasses
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Reconciliação financeira do marketplace MSU</p>
        </div>

        {/* Explainer */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '12px', border: '1px solid #3f424d', padding: '28px 32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#10b98120', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Wallet size={28} color="#10b981" /></div>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 6px' }}>Como funciona?</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
              Quando um equipamento é vendido no MSU, a Kings retém uma <strong style={{ color: '#cbd5e1' }}>comissão sobre o valor da venda</strong> (split de pagamento) e o restante é repassado ao vendedor. <br/>
              <span style={{ color: '#64748b' }}>Exemplo: Cockpit vendido por R$ 3.000 com comissão de 12% → R$ 360 ficam com a Kings e R$ 2.640 são repassados ao piloto vendedor.</span>
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Receita de Vendas', value: 'R$ 0,00', color: '#10b981', icon: TrendingUp },
            { label: 'Comissão Kings (12%)', value: 'R$ 0,00', color: '#f59e0b', icon: PieChart },
            { label: 'Repasses Efetuados', value: 'R$ 0,00', color: '#3b82f6', icon: ArrowDownRight },
            { label: 'Repasses Pendentes', value: 'R$ 0,00', color: '#ef4444', icon: Clock },
          ].map((k, i) => (
            <div key={i} style={{ background: '#2c2e36', borderRadius: '12px', padding: '20px', border: '1px solid #3f424d', display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${k.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <k.icon size={20} color={k.color} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k.label}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{k.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#2c2e36', borderRadius: '12px', border: '1px solid #3f424d', overflow: 'hidden' }}>
          <div className="admin-overflow-table">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '750px' }}>
              <thead>
                <tr>
                  {['Transação', 'Vendedor', 'Valor Venda', 'Comissão', 'Repasse', 'Status', 'Data'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', background: '#1f2025', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={7} style={{ padding: '80px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <AlertCircle size={36} color="#3f424d" />
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>Nenhuma transação registrada</p>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>Quando vendas forem concluídas no MSU, as comissões e repasses aparecerão aqui.</p>
                  </div>
                </td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
