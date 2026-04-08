import React from 'react'

export const dynamic = 'force-dynamic'

export default function MsuVendedoresPage() {
  return (
    <div>
      <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Vendedores MSU</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Gerencie perfis e avaliações de vendedores do marketplace.</p>
      
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '3rem', borderRadius: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Em desenvolvimento: Listagem de perfis com role de vendedor e suas estatísticas.
      </div>
    </div>
  )
}
