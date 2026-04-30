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
      .select('id, title, slug, price, price_compare, images, attributes, stock, brands!inner(slug)')
      .eq('status', 'active')
      .eq('brands.slug', 'kings')
      
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
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <div>
            <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>CATÁLOGO</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Mostrando {products.length} produtos encontrados</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Badge variant="success">LIVE DATA</Badge>
          </div>
        </div>

        {/* Filter Bar (horizontal, collapsible, sticky) */}
        <Suspense fallback={<div style={{ padding: '12px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', marginBottom: '24px' }}>Carregando filtros...</div>}>
          <CatalogFilters />
        </Suspense>

        {/* Product Grid */}
        <style dangerouslySetInnerHTML={{__html: `
          .kings-product-card {
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease, box-shadow 0.25s ease;
          }
          .kings-product-card:hover {
            transform: translateY(-4px);
            border-color: rgba(0, 229, 255, 0.35) !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 229, 255, 0.1);
          }
          .kings-product-card:hover .kings-card-img {
            transform: scale(1.04);
          }
          .kings-card-img {
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .kings-catalog-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
          
          .kings-card-img-container {
            background: #fff; display: flex; align-items: center; justify-content: center; height: 200px; flex-shrink: 0; overflow: hidden; position: relative;
          }
          .kings-card-info {
            padding: 16px 18px 18px; display: flex; flex-direction: column; flex-grow: 1;
          }
          .kings-card-brand {
            font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1.2px; color: var(--text-muted); margin-bottom: 6px; font-weight: 600;
          }
          .kings-card-title {
            font-size: 0.88rem; font-weight: 600; color: var(--text-primary); line-height: 1.35; margin-bottom: auto; min-height: 38px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
          }
          .kings-card-price-container {
             margin-top: 14px; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 12px;
          }
          .kings-card-price {
            font-size: 1.15rem; font-weight: 800; color: var(--success);
          }
          .kings-card-installments {
            font-size: 0.72rem; color: var(--text-secondary); margin-top: 3px;
          }

          @media (max-width: 1200px) {
            .kings-catalog-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
          @media (max-width: 768px) {
            .kings-catalog-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
            }
          }
          @media (max-width: 480px) {
            .kings-catalog-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
            }
            .kings-card-img-container { height: 130px; }
            .kings-card-info { padding: 10px; }
            .kings-card-brand { font-size: 0.55rem; margin-bottom: 4px; }
            .kings-card-title { font-size: 0.75rem; min-height: 32px; line-height: 1.2; }
            .kings-card-price-container { margin-top: 10px; padding-top: 8px; }
            .kings-card-price { font-size: 0.95rem; }
            .kings-card-installments { font-size: 0.6rem; }
            .kings-card-img { max-width: 90% !important; max-height: 90% !important; }
          }
        `}} />

        {products.length === 0 ? (
          <div style={{ padding: '64px 40px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔍</div>
            Nenhum produto encontrado com esses filtros.
          </div>
        ) : (
          <div className="kings-catalog-grid">
            {products.map(product => {
              const hasDiscount = product.price_compare && product.price_compare > product.price
              const imgUrl = product.images?.[0] || 'https://placehold.co/400x400/131928/e8ecf4?text=Kings'
              const brandName = product.attributes?.brand || 'Kings Simuladores'
              
              return (
                <Link key={product.id} href={`/produtos/${product.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="kings-product-card" style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}>
                    {/* Imagem */}
                    <div className="kings-card-img-container">
                      {hasDiscount && (
                        <div style={{
                          position: 'absolute', top: '10px', left: '10px', zIndex: 2,
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: '#fff', fontSize: '0.65rem', fontWeight: 800,
                          padding: '3px 8px', borderRadius: '4px',
                          letterSpacing: '0.5px',
                        }}>
                          OFERTA
                        </div>
                      )}
                      <img className="kings-card-img" src={imgUrl} alt={product.title} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
                    </div>
                    
                    {/* Info */}
                    <div className="kings-card-info">
                      <div className="kings-card-brand">
                        {brandName}
                      </div>
                      <div className="kings-card-title">
                        {product.title}
                      </div>
                      <div className="kings-card-price-container">
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                          {hasDiscount && (
                            <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              {formatPrice(product.price_compare)}
                            </span>
                          )}
                          <span className="font-display kings-card-price">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                        <div className="kings-card-installments">
                          12x de {formatPrice(product.price / 12)} sem juros
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </Container>
    </div>
  )
}
