import { Container } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db'
import { formatPrice } from '@kings/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

const BRAND_DATA: Record<string, { title: string, desc: string, color: string }> = {
  moza: {
    title: "LOJA OFICIAL - MOZA RACING",
    desc: "A revolução dos simuladores Direct Drive e ecossistema premium. Sinta cada detalhe da pista com a precisão inigualável da Moza Racing.",
    color: "#2563eb"
  },
  thrustmaster: {
    title: "LOJA OFICIAL - THRUSTMASTER",
    desc: "Tradição e performance. O ecossistema mais vasto de simuladores de corrida com opções consagradas para todas as plataformas.",
    color: "#e11d48"
  },
  thermaltake: {
    title: "LOJA OFICIAL - THERMALTAKE",
    desc: "Pioneirismo em gabinetes, cockpits e periféricos hi-end para fechar o setup perfeito ao redor do seu simulador.",
    color: "#f59e0b"
  }
}

export default async function BrandPage({ params }: { params: { slug: string } }) {
  const data = BRAND_DATA[params.slug]
  
  if (!data) {
    notFound()
  }

  let products: any[] = []
  
  try {
    const supabase = await createServerSupabaseClient()
    const { data: result } = await supabase
      .from('products')
      .select('id, title, slug, price, price_compare, images, attributes, stock, brands!inner(name)')
      .eq('status', 'active')
      .eq('brands.name', 'kings')
      .ilike('attributes->>brand', `%${params.slug}%`)
      .order('created_at', { ascending: false })
    
    products = result || []
  } catch (err) {
    console.error("Erro buscando produtos de marca:", err)
  }

  return (
    <div style={{ padding: '40px 0', minHeight: 'calc(100vh - 80px)' }}>
      <Container>
        
        {/* Banner Hero estilo NÍVEIS */}
        <div style={{ 
          marginBottom: '48px', 
          background: 'rgba(10, 12, 18, 0.4)', 
          padding: '40px', 
          borderRadius: '16px', 
          border: '1px solid rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle Glow Effect idêntico ao NÍVEIS */}
          <div style={{
            position: 'absolute',
            top: 0, right: 0, bottom: 0, left: 0,
            background: `radial-gradient(circle at 80% 0%, ${data.color}20 0%, transparent 60%)`,
            zIndex: 0,
            pointerEvents: 'none'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '4px', background: data.color, borderRadius: '2px' }} />
              <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>VITRINE CLASSIFICADA</h4>
            </div>
            <h1 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text-primary)', textShadow: `0 0 20px ${data.color}60` }}>
              {data.title}
            </h1>
            <div style={{ maxWidth: '800px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>
                {data.desc}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
            <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>PRODUTOS DESTA MARCA</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{products.length} encontrados</span>
          </div>
          
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)' }}>
              <p style={{ color: 'var(--text-muted)' }}>No momento, ainda não etiquetamos nenhum equipamento para &quot;{params.slug}&quot;.</p>
            </div>
          ) : (
            <div className="kings-catalog-grid">
              {products.map(product => (
                <Link key={product.id} href={`/produtos/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="hover:-translate-y-1 hover:border-[var(--accent)]" style={{ 
                    background: 'var(--bg-card)', 
                    borderRadius: 'var(--radius)', 
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    transition: 'transform 0.2s, border-color 0.2s',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ aspectRatio: '1', background: '#fff', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '16px' }} />
                      ) : (
                        <div style={{ color: '#ccc' }}>Sem Imagem</div>
                      )}
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', lineHeight: 1.4 }}>{product.title}</h3>
                      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)' }}>
                          {formatPrice(product.price)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
