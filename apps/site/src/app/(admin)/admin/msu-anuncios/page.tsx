import React from 'react'
import { createServerSupabaseClient } from '@kings/db'
import { Badge, Card } from '@kings/ui'
import { MsuClient } from './MsuClient'

export const dynamic = 'force-dynamic'

export default async function MsuAnunciosPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: listings } = await supabase
    .from('marketplace_listings')
    .select('*')
    .neq('status', 'archived')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Anúncios MSU</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Lista de todos os classificados (todos os status).</p>
      
      <MsuClient initialListings={listings || []} />
    </div>
  )
}
