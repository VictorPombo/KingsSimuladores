import React, { Suspense } from 'react'
import { Container } from '@kings/ui'
import { ListingCard } from '@/components/marketplace/ListingCard'
import { createAdminClient } from '@kings/db'
import { MsuCatalogFilters } from './MsuCatalogFilters'

export const dynamic = 'force-dynamic'

export default async function ProdutosPage({ searchParams }: { searchParams: { q?: string, condition?: string } }) {
  const supabase = createAdminClient()
  
  let query = supabase.from('marketplace_listings').select('*').eq('status', 'active')

  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }
  if (searchParams.condition) {
    query = query.eq('condition', searchParams.condition)
  }

  const { data: listingsData, error } = await query.order('created_at', { ascending: false })
  const listings = listingsData as any[]

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingTop: '100px' }}>
      <Container>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800, margin: 0 }}>Mural de Anúncios</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              {listings?.length || 0} desapegos encontrados
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <Suspense fallback={<div style={{ padding: '12px 20px', background: 'rgba(15,18,30,0.6)', borderRadius: 'var(--radius)', marginBottom: '24px', display: 'inline-block' }}>Carregando filtros...</div>}>
          <MsuCatalogFilters />
        </Suspense>

        {/* Listings Grid */}
        <style dangerouslySetInnerHTML={{__html: `
          .msu-listing-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
          @media (max-width: 1200px) {
            .msu-listing-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
          @media (max-width: 768px) {
            .msu-listing-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
            }
          }
          @media (max-width: 480px) {
            .msu-listing-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
            }
          }
        `}} />

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '16px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', marginBottom: '24px', fontSize: '0.9rem' }}>
            Erro ao puxar anúncios: {error.message}
          </div>
        )}

        {!listings?.length && !error && (
          <div style={{ textAlign: 'center', padding: '80px 40px', color: 'var(--text-muted)', background: 'rgba(15,18,30,0.4)', borderRadius: 'var(--radius)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏁</div>
            <p style={{ fontSize: '1rem', margin: 0 }}>Nenhum equipamento à venda no momento.</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>Seja o primeiro a anunciar!</p>
          </div>
        )}

        {listings?.length > 0 && (
          <div className="msu-listing-grid">
            {listings.map(listing => (
              <ListingCard 
                key={listing.id}
                id={listing.id}
                title={listing.title}
                price={listing.price}
                condition={listing.condition}
                imageUrl={listing.images?.[0]}
                location="Brasil"
                sellerName="Piloto Vendedor"
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  )
}
