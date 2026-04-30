import { Container, Badge } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db/server'
import Link from 'next/link'
import { Suspense } from 'react'

import { SevenCatalogFilters } from './SevenCatalogFilters'

export const dynamic = 'force-dynamic'

function formatPrice(value: number) {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

export default async function SevenProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  let products: any[] = []
  
  const category = typeof searchParams.categoria === 'string' ? searchParams.categoria : null
  const marca = typeof searchParams.marca === 'string' ? searchParams.marca : null
  const q = typeof searchParams.q === 'string' ? searchParams.q : null
  
  try {
    const supabase = await createServerSupabaseClient()
    
    // Buscar brand_id da Seven
    const { data: sevenBrand } = await supabase.from('brands').select('id').eq('name', 'seven').single()
    
    if (!sevenBrand) throw new Error('Seven brand not found')
    
    let query = supabase
      .from('products')
      .select('id, title, slug, price, price_compare, images, attributes, stock')
      .eq('brand_id', sevenBrand.id)
      .eq('status', 'active')
      
    if (q) {
      query = query.ilike('title', `%${q}%`)
    }

    if (category) {
      const term = category.toLowerCase()
      
      if (term === 'pedal' || term === 'pedais') {
        query = query.or('title.ilike.%pedal%,title.ilike.%pedais%')
      } else if (term === 'volante' || term === 'volantes') {
        query = query.or('title.ilike.%volante%,title.ilike.%arco%,title.ilike.%cambio%')
      } else if (term === 'bases' || term === 'base') {
        query = query.or('title.ilike.%base%,title.ilike.%motor%')
      } else if (term === 'cockpit' || term === 'cockpits') {
        query = query.or('title.ilike.%cockpit%,title.ilike.%simulador%,title.ilike.%racing%')
      } else if (term === 'acessorios') {
        query = query.or('title.ilike.%suporte%,title.ilike.%fonte%,title.ilike.%tapete%,title.ilike.%monitor%,title.ilike.%freio%,title.ilike.%acessor%,title.ilike.%embreagem%')
      } else {
        const rootTerm = term.endsWith('s') ? term.slice(0, -1) : term
        query = query.ilike('title', `%${rootTerm}%`)
      }
    }
    
    if (marca) {
      query = query.ilike('attributes->>marca', `%${marca}%`)
    }

    const { data } = await query.order('created_at', { ascending: false })
    products = data || []
    
  } catch (err) {
    console.error("Erro buscando produtos Seven:", err)
  }

  return (
    <div style={{ padding: '40px 0', minHeight: 'calc(100vh - 80px)' }}>
      <Container>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <div>
            <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>CATÁLOGO SEVEN</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Mostrando {products.length} produtos encontrados</p>
          </div>

        </div>

        {/* Filter Bar */}
        <Suspense fallback={<div style={{ padding: '12px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', marginBottom: '24px' }}>Carregando filtros...</div>}>
          <SevenCatalogFilters />
        </Suspense>

        {/* Product Grid - mesmo estilo da Kings */}
        <style dangerouslySetInnerHTML={{__html: `
          .seven-product-card {
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease, box-shadow 0.25s ease;
          }
          .seven-product-card:hover {
            transform: translateY(-4px);
            border-color: rgba(249, 115, 22, 0.35) !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(249, 115, 22, 0.1);
          }
          .seven-product-card:hover .seven-card-img {
            transform: scale(1.04);
          }
          .seven-card-img {
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .seven-catalog-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
          
          .seven-card-img-container {
            background: #fff; display: flex; align-items: center; justify-content: center; height: 200px; flex-shrink: 0; overflow: hidden; position: relative;
          }
          .seven-card-info {
            padding: 16px 18px 18px; display: flex; flex-direction: column; flex-grow: 1;
          }
          .seven-card-brand {
            font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1.2px; color: var(--text-muted); margin-bottom: 6px; font-weight: 600;
          }
          .seven-card-title {
            font-size: 0.88rem; font-weight: 600; color: var(--text-primary); line-height: 1.35; margin-bottom: auto; min-height: 38px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
          }
          .seven-card-price-container {
             margin-top: 14px; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 12px;
          }
          .seven-card-price {
            font-size: 1.15rem; font-weight: 800; color: #f97316;
          }
          .seven-card-installments {
            font-size: 0.72rem; color: var(--text-secondary); margin-top: 3px;
          }

          @media (max-width: 1200px) {
            .seven-catalog-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
          @media (max-width: 768px) {
            .seven-catalog-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
            }
          }
          @media (max-width: 480px) {
            .seven-catalog-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
            }
            .seven-card-img-container { height: 130px; }
            .seven-card-info { padding: 10px; }
            .seven-card-brand { font-size: 0.55rem; margin-bottom: 4px; }
            .seven-card-title { font-size: 0.75rem; min-height: 32px; line-height: 1.2; }
            .seven-card-price-container { margin-top: 10px; padding-top: 8px; }
            .seven-card-price { font-size: 0.95rem; }
            .seven-card-installments { font-size: 0.6rem; }
            .seven-card-img { max-width: 90% !important; max-height: 90% !important; }
          }
        `}} />

        {products.length === 0 ? (
          <div style={{ padding: '64px 40px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔍</div>
            Nenhum produto encontrado com esses filtros.
          </div>
        ) : (
          <div className="seven-catalog-grid">
            {products.map(product => {
              const hasDiscount = product.price_compare && product.price_compare > product.price
              const imgUrl = product.images?.[0] || 'https://placehold.co/400x400/131928/f97316?text=Seven'
              const brandName = product.attributes?.brand || 'Seven Sim Racing'
              
              return (
                <Link key={product.id} href={`/seven/produtos/${product.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="seven-product-card" style={{
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
                    <div className="seven-card-img-container">
                      {hasDiscount && (
                        <div style={{
                          position: 'absolute', top: '10px', left: '10px', zIndex: 2,
                          background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                          color: '#fff', fontSize: '0.65rem', fontWeight: 800,
                          padding: '3px 8px', borderRadius: '4px',
                          letterSpacing: '0.5px',
                        }}>
                          OFERTA
                        </div>
                      )}
                      <img className="seven-card-img" src={imgUrl} alt={product.title} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
                    </div>
                    
                    {/* Info */}
                    <div className="seven-card-info">
                      <div className="seven-card-brand">
                        {brandName}
                      </div>
                      <div className="seven-card-title">
                        {product.title}
                      </div>
                      <div className="seven-card-price-container">
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                          {hasDiscount && (
                            <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              {formatPrice(product.price_compare)}
                            </span>
                          )}
                          <span className="font-display seven-card-price">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                        <div className="seven-card-installments">
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
