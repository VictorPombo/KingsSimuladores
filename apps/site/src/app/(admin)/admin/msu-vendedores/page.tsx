'use client'

import React from 'react'
import { Users, ShieldCheck, ShoppingBag, TrendingUp, AlertCircle, UserCheck } from 'lucide-react'

export default function MsuVendedoresPage() {
  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={24} color="#06b6d4" /> Vendedores MSU
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Perfis e estatísticas dos pilotos que vendem no marketplace</p>
        </div>

        {/* Explainer */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '12px', border: '1px solid #3f424d', padding: '28px 32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#06b6d420', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><UserCheck size={28} color="#06b6d4" /></div>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 6px' }}>Como funciona?</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
              Todo usuário que submete um anúncio no MSU se torna automaticamente um <strong style={{ color: '#cbd5e1' }}>vendedor</strong>. Aqui você acompanha quem são, quantos anúncios publicaram e suas estatísticas de vendas. <br/>
              <span style={{ color: '#64748b' }}>Exemplo: O piloto "João Silva" já anunciou 3 equipamentos e vendeu 2. Isso ajuda a identificar vendedores confiáveis e recorrentes.</span>
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Vendedores', value: '0', color: '#06b6d4', icon: Users },
            { label: 'Ativos este mês', value: '0', color: '#10b981', icon: TrendingUp },
            { label: 'Vendas Totais', value: '0', color: '#f59e0b', icon: ShoppingBag },
          ].map((k, i) => (
            <div key={i} style={{ background: '#2c2e36', borderRadius: '12px', padding: '20px', border: '1px solid #3f424d', display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${k.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <k.icon size={20} color={k.color} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{k.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#2c2e36', borderRadius: '12px', border: '1px solid #3f424d', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '650px' }}>
              <thead>
                <tr>
                  {['Vendedor', 'E-mail', 'Anúncios', 'Vendas', 'Status'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', background: '#1f2025', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={5} style={{ padding: '80px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <AlertCircle size={36} color="#3f424d" />
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>Nenhum vendedor registrado</p>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>Quando pilotos começarem a anunciar, seus perfis aparecerão aqui automaticamente.</p>
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
