import React from 'react'
import { createAdminClient } from '@kings/db'
import { MsuClient } from './MsuClient'

export const dynamic = 'force-dynamic'

export default async function MsuAnunciosPage() {
  const supabase = createAdminClient()
  
  const { data: listings, error } = await supabase
    .from('marketplace_listings')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('SERVER ERROR FETCHING MSU LISTINGS:', error)
  }

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <MsuClient initialListings={listings || []} />
    </div>
  )
}
