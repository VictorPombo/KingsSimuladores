import React from 'react'
import { createServerSupabaseClient } from '@kings/db'
import { Badge, Card } from '@kings/ui'

export const dynamic = 'force-dynamic'

export default async function MsuAnunciosPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: listings } = await supabase
    .from('marketplace_listings')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Anúncios MSU</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Lista de todos os classificados (todos os status).</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {listings?.map(listing => (
          <Card key={listing.id} style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '60px', height: '60px', background: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden' }}>
                {listing.images?.[0] && <img src={listing.images[0]} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', color: '#fff', fontSize: '1rem' }}>{listing.title}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>R$ {listing.price}</div>
              </div>
            </div>
            <Badge variant={
              listing.status === 'active' ? 'success' : 
              listing.status === 'pending_review' ? 'warning' : 'info'
            }>
              {listing.status}
            </Badge>
          </Card>
        ))}
        {listings?.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '1rem' }}>Nenhum anúncio encontrado.</div>
        )}
      </div>
    </div>
  )
}
