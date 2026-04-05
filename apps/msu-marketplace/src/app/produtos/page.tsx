import React from 'react'
import { Container } from '@kings/ui'
import { ListingCard } from '../../components/ListingCard'
import { createAdminClient } from '@kings/db'

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
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '100px' }}>
      <Container>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800 }}>Mural de Anúncios</h1>
            <div style={{ color: 'var(--text-muted)' }}>
              {listings?.length || 0} desapegos encontrados.
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
          {/* Sidebar de Filtros (Simulada para visualização rápida) */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border)', height: 'fit-content' }}>
            <h3 style={{ color: '#fff', fontWeight: 600, marginBottom: '1rem' }}>Filtros</h3>
            
            <form action="/produtos" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Busca</label>
                <input 
                  type="text" 
                  name="q" 
                  defaultValue={searchParams.q}
                  placeholder="Ex: Volante..." 
                  style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: '#fff', padding: '0.5rem', borderRadius: '0.25rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Estado</label>
                <select name="condition" defaultValue={searchParams.condition || ''} style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: '#fff', padding: '0.5rem', borderRadius: '0.25rem', outline: 'none' }}>
                  <option value="">Qualquer</option>
                  <option value="like_new">Como Novo</option>
                  <option value="good">Bom</option>
                  <option value="fair">Justo</option>
                </select>
              </div>

              <button type="submit" style={{ background: 'var(--accent)', color: '#000', padding: '0.5rem', borderRadius: '0.25rem', fontWeight: 600, cursor: 'pointer', border: 'none' }}>
                Aplicar
              </button>
            </form>
          </div>

          {/* Lista */}
          <div>
            {error && (
              <div style={{ background: 'rgba(255,0,0,0.1)', color: 'red', padding: '1rem', borderRadius: '0.5rem', border: '1px solid red' }}>
                Erro ao puxar anúncios: {error.message}
              </div>
            )}

            {!listings?.length && !error && (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                Nenhum equipamento à venda no momento 😢
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {listings?.map(listing => (
                <ListingCard 
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  price={listing.price}
                  condition={listing.condition}
                  imageUrl={listing.images[0]}
                  location="Brasil"
                  sellerName="Piloto Oculto"
                />
              ))}
            </div>
          </div>
        </div>

      </Container>
    </div>
  )
}
