import { Container, Badge } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db'
import { formatPrice } from '@kings/utils'
import Link from 'next/link'
import { Suspense } from 'react'
import { applySegmentedPrices } from '@/lib/pricing'

import { CatalogFilters } from './CatalogFilters'

export const revalidate = 0 // Muda provisoriamente para 0 (dinâmico) para filtros funcionarem localmente e em prod sem atraso

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  let products: any[] = []
  
  const category = typeof searchParams.category === 'string' ? searchParams.category : null
  const brand = typeof searchParams.brand === 'string' ? searchParams.brand : null
  const q = typeof searchParams.q === 'string' ? searchParams.q : null
  
  try {
    const supabase = await createServerSupabaseClient()
    let query = supabase
      .from('products')
      .select('id, title, slug, price, price_compare, images, attributes, stock')
      .eq('status', 'active')
      
    if (q) {
      // Busca ampla pelo termo da barra de pesquisa
      query = query.ilike('title', `%${q}%`)
    }

    if (category) {
      const term = category.toLowerCase()
      
      if (term === 'pedal' || term === 'pedais') {
        query = query.or('title.ilike.%pedal%,title.ilike.%pedais%')
      } else if (term === 'volante' || term === 'volantes') {
        query = query.or('title.ilike.%volante%,title.ilike.%arco%')
      } else if (term === 'base') {
        query = query.or('title.ilike.%base%,title.ilike.%motor%')
      } else if (term === 'kit' || term === 'kit-completo') {
        query = query.or('title.ilike.%kit%,title.ilike.%bundle%')
      } else if (term === 'cockpit' || term === 'cockpits') {
        query = query.ilike('title', '%cockpit%')
      } else if (term === 'pc' || term === 'computador') {
        query = query.or('title.ilike.%pc%,title.ilike.%windows%,title.ilike.%computador%')
      } else if (term === 'playstation') {
        query = query.or('title.ilike.%playstation%,title.ilike.%ps4%,title.ilike.%ps5%')
      } else if (term === 'xbox') {
        query = query.ilike('title', '%xbox%')
      } else {
        // Fallback genérico para remover "s" do final e tentar pegar a raiz da palavra
        const rootTerm = term.endsWith('s') ? term.slice(0, -1) : term
        query = query.ilike('title', `%${rootTerm}%`)
      }
    }
    
    if (brand) {
      const map: Record<string, string> = {
        xtreme: 'xtreme',
        fanatec: 'fanatec',
        moza: 'moza'
      }
      const term = map[brand] || brand
      query = query.ilike('attributes->>brand', `%${term}%`)
    }

    const { data } = await query.order('created_at', { ascending: false })
    
    // Injeta a lógica de preços segmentados antes de mandar para a view
    products = await applySegmentedPrices(data || [])
    
  } catch (err) {
    console.error("Erro buscando produtos:", err)
  }

  return (
    <div style={{ padding: '40px 0', minHeight: 'calc(100vh - 80px)' }}>
      <Container>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <div>
            <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>CATÁLOGO</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Mostrando {products.length} produtos encontrados</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Badge variant="success">LIVE DATA</Badge>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 3fr', gap: '32px' }}>
          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Suspense fallback={<div style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius)' }}>Carregando filtros...</div>}>
              <CatalogFilters />
            </Suspense>
          </aside>

          {/* Product Grid */}
          <main>
            {products.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Nenhum produto encontrado.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
                {products.map(product => {
                  const hasDiscount = product.price_compare && product.price_compare > product.price
                  const imgUrl = product.images?.[0] || 'https://placehold.co/400x400/131928/e8ecf4?text=Kings'
                  const brandName = product.attributes?.brand || 'Kings Simuladores'
                  
                  return (
                    <Link key={product.id} href={`/produtos/${product.slug}`} style={{ textDecoration: 'none' }}>
                      <div className="hover:border-[currentColor] hover:-translate-y-1" style={{
                        color: 'var(--accent)', /* Usado para o currentColor do border no hover se o tailwind permitir fallbacks, ou deixamos estático */
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        transition: 'border-color 0.2s, transform 0.2s',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%'
                      }}>
                        {/* Imagem */}
                        <div style={{ background: '#fff', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', flexShrink: 0 }}>
                          <img src={imgUrl} alt={product.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </div>
                        
                        {/* Info */}
                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                            {brandName}
                          </div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 'auto', minHeight: '38px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {product.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '12px' }}>
                            {hasDiscount && (
                              <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                {formatPrice(product.price_compare)}
                              </span>
                            )}
                            <span className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>
                              {formatPrice(product.price)}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            12x de {formatPrice(product.price / 12)} sem juros
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </Container>
    </div>
  )
}
