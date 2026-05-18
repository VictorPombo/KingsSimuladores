// @ts-nocheck
import React from 'react'
import { Container } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db'
import { redirect } from 'next/navigation'
import { GarageClient } from './GarageClient'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/usado/login')
  }

  // Buscar profile para obter o ID correto do vendedor
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('auth_id', user.id)
    .single()
    
  const profileId = userProfile?.id || user.id

  // 1. Buscar anúncios do vendedor
  const { data: meusAnunciosData } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('seller_id', profileId)
    .order('created_at', { ascending: false })

  // 2. Buscar vendas realizadas (orders onde o user é o vendedor)
  const { data: ordersData } = await supabase
    .from('marketplace_orders')
    .select(`
      id,
      total_price,
      kings_fee,
      seller_net,
      status,
      tracking_code,
      created_at,
      listing_id,
      buyer_id
    `)
    .eq('seller_id', profileId)
    .order('created_at', { ascending: false })

  // 3. Para cada order, buscar listing e buyer info
  const ordersEnriched = await Promise.all(
    (ordersData || []).map(async (order: any) => {
      // Listing info
      const { data: listing } = await supabase
        .from('marketplace_listings')
        .select('title, images')
        .eq('id', order.listing_id)
        .single()

      // Buyer info
      const { data: buyer } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', order.buyer_id)
        .single()

      return {
        ...order,
        listing: listing || { title: 'Produto removido', images: [] },
        buyer: buyer || { full_name: 'Piloto' },
      }
    })
  )

  // 4. Profile info
  const profile = {
    email: user.email || '',
    full_name: user.user_metadata?.full_name || '',
    created_at: user.created_at || '',
  }

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
      <Container>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '12px',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
              padding: '6px 14px', borderRadius: '6px',
              fontSize: '0.85rem', fontWeight: 900, color: '#fff',
              letterSpacing: '2px',
            }}>
              MEU SIMULADOR USADO
            </div>
          </div>
          <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800, margin: '0 0 4px' }}>
            Minha Garagem
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Gerencie seus anúncios, acompanhe vendas e gere comprovantes.
          </p>
        </div>

        <GarageClient
          listings={(meusAnunciosData || []) as any[]}
          orders={ordersEnriched as any[]}
          profile={profile}
        />
      </Container>
    </div>
  )
}
