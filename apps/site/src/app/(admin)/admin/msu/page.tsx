import React from 'react'

export const dynamic = 'force-dynamic'

export default function MsuDashboardPage() {
  return (
    <div>
      <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Dashboard MSU</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Acompanhe as métricas e comissões do Meu Simulador Usado.</p>
      
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '3rem', borderRadius: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Em desenvolvimento: KPIs do marketplace, ticket médio e comissões acumuladas na KingsHub.
      </div>
    </div>
  )
}
