import React from 'react'

export const dynamic = 'force-dynamic'

export default function MsuComissoesPage() {
  return (
    <div>
      <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Comissões e Repasses</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Página de reconciliação financeira do MSU.</p>
      
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '3rem', borderRadius: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Em desenvolvimento: Integração de split de pagamento e controle de saques/repasses.
      </div>
    </div>
  )
}
