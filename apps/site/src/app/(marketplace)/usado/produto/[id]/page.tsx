import React from 'react'
import { Container, Button } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db/server'
import { formatPrice } from '@kings/utils'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()
  
  const { data: listing } = await supabase
    .from('marketplace_listings')
    .select(`
      *,
      profiles (
        full_name,
        created_at
      )
    `)
    .eq('id', params.id)
    .single()

  if (!listing) return notFound()

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '100px' }}>
      <Container>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3rem', alignItems: 'start' }}>
          
          {/* Esquerda: Fotos e Descrição */}
          <div>
            <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: '1rem', overflow: 'hidden', background: '#000', marginBottom: '2rem' }}>
              <img src={listing.images[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 800, marginBottom: '1rem' }}>Descrição do Anúncio</h2>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {listing.description}
            </div>
          </div>

          {/* Direita: Price Box */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <div style={{ textTransform: 'uppercase', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>{listing.condition}</div>
              <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800, margin: '0 0 1rem 0', lineHeight: 1.2 }}>{listing.title}</h1>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '2rem' }}>
                {formatPrice(listing.price)}
              </div>

              <Button style={{ width: '100%', background: 'var(--accent)', color: '#000', padding: '1rem', fontSize: '1.1rem', marginBottom: '1rem' }}>
                Comprar com Garantia Kings
              </Button>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Vendedor</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', background: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👤</div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{(listing as any).profiles?.full_name || 'Piloto'}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Membro confiável</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </Container>
    </div>
  )
}
