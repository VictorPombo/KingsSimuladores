import React, { Suspense } from 'react'
import { Container } from '@kings/ui'
import { ListingCard } from '@/components/marketplace/ListingCard'
import { createAdminClient } from '@kings/db'
import { MsuCatalogFilters } from './MsuCatalogFilters'

export const dynamic = 'force-dynamic'

interface SearchParams {
  q?: string
  condition?: string
  category?: string
  state?: string
  city?: string
  brand?: string
  hasBox?: string
  minPrice?: string
  maxPrice?: string
  sort?: string
}

export default async function ProdutosPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createAdminClient()
  
  let query = supabase
    .from('marketplace_listings')
    .select(`*, profiles(full_name)`)
    .eq('status', 'active')

  // Text search (brand, model, title, description)
  if (searchParams.q) {
    const q = searchParams.q
    query = query.or(`title.ilike.%${q}%,brand.ilike.%${q}%,model.ilike.%${q}%,description.ilike.%${q}%`)
  }

  // Category filter
  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }

  // Condition filter
  if (searchParams.condition) {
    query = query.eq('condition', searchParams.condition)
  }

  // State and City filter
  if (searchParams.state) {
    query = query.eq('state', searchParams.state)
  }
  if (searchParams.city) {
    query = query.ilike('city', `%${searchParams.city}%`)
  }

  // Brand filter
  if (searchParams.brand) {
    query = query.ilike('brand', `%${searchParams.brand}%`)
  }

  // Has box filter
  if (searchParams.hasBox === 'true') {
    query = query.eq('has_original_box', true)
  } else if (searchParams.hasBox === 'false') {
    query = query.eq('has_original_box', false)
  }

  // Price range
  if (searchParams.minPrice) {
    query = query.gte('price', parseFloat(searchParams.minPrice))
  }
  if (searchParams.maxPrice) {
    query = query.lte('price', parseFloat(searchParams.maxPrice))
  }

  // Sorting (boosted always first, then sort criteria)
  const sort = searchParams.sort || 'newest'
  if (sort === 'price_asc') {
    query = query.order('is_boosted', { ascending: false, nullsFirst: false }).order('price', { ascending: true })
  } else if (sort === 'price_desc') {
    query = query.order('is_boosted', { ascending: false, nullsFirst: false }).order('price', { ascending: false })
  } else {
    query = query.order('is_boosted', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false })
  }

  const { data: listingsData, error } = await query
  const listings = (listingsData || []) as any[]

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
      <Container>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800, margin: 0 }}>Mural de Anúncios</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              {listings.length} desapegos encontrados
            </p>
          </div>
        </div>

        <Suspense fallback={<div style={{ padding: '12px', color: '#71717a' }}>Carregando filtros...</div>}>
          <MsuCatalogFilters />
        </Suspense>

        <style dangerouslySetInnerHTML={{__html: `
          .msu-listing-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
          @media (max-width: 1200px) { .msu-listing-grid { grid-template-columns: repeat(3, 1fr); } }
          @media (max-width: 768px) { .msu-listing-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
        `}} />

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '16px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', marginBottom: '24px', fontSize: '0.9rem' }}>
            Erro ao puxar anúncios: {error.message}
          </div>
        )}

        {!listings.length && !error && (
          <div style={{ textAlign: 'center', padding: '80px 40px', color: 'var(--text-muted)', background: 'rgba(15,18,30,0.4)', borderRadius: 'var(--radius)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏁</div>
            <p style={{ fontSize: '1rem', margin: 0 }}>Nenhum equipamento encontrado com esses filtros.</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>Tente ajustar os filtros ou buscar por outro termo.</p>
          </div>
        )}

        {listings.length > 0 && (
          <div className="msu-listing-grid">
            {listings.map(listing => (
              <ListingCard 
                key={listing.id}
                id={listing.id}
                title={listing.title}
                price={listing.price}
                condition={listing.condition}
                imageUrl={listing.images?.[0]}
                location={listing.city && listing.state ? `${listing.city} - ${listing.state}` : 'Brasil'}
                sellerName={(listing as any).profiles?.full_name || 'Piloto Vendedor'}
                sellerId={listing.seller_id}
                brand={listing.brand}
                model={listing.model}
                hasOriginalBox={listing.has_original_box}
                hasUsageMarks={listing.has_usage_marks}
                isFeatured={listing.is_boosted}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  )
}
