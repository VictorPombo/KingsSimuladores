import React from 'react'
import { createAdminClient } from '@kings/db'
import { Badge, Card } from '@kings/ui'
import { MsuClient } from './MsuClient'

export const dynamic = 'force-dynamic'

export default async function MsuAnunciosPage() {
  const supabase = createAdminClient()
  
  const { data: listings, error } = await supabase
    .from('marketplace_listings')
    .select('*')
    .neq('status', 'rejected')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('SERVER ERROR FETCHING MSU LISTINGS:', error)
  }

  return (
    <div>
      <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Anúncios MSU</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Lista de todos os classificados (todos os status).</p>
      
      <div style={{ padding: '1rem', background: '#333', color: '#fff', marginBottom: '1rem' }}>
        <strong>DEBUG INFO:</strong><br />
        Error: {JSON.stringify(error)}<br />
        Listings fetched: {listings?.length ?? 'undefined'}<br />
        Is supabase instance defined? {!!supabase ? 'Yes' : 'No'}
      </div>

      <MsuClient initialListings={listings || []} />
    </div>
  )
}
