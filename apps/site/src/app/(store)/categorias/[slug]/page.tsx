import { Container } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db'
import { formatPrice } from '@kings/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

const UI_METADATA: Record<string, { desc: string, color: string }> = {
  'kings-cockpits': {
    desc: "A fundação do seu simulador. Estruturas prontas para aguentar o torque absurdo de bases Direct Drive.",
    color: "#00e5ff" // Cyan/Kings
  },
  'kings-kits-completos': {
    desc: "Pluge, ligue e acelere. Conjuntos fechados de Base + Volante + Pedal.",
    color: "#a855f7" 
  },
  'kings-computadores': {
    desc: "Equipamentos com certificação e drivers 100% otimizados para Windows.",
    color: "#06b6d4" 
  },
  'kings-bases': {
    desc: "O coração do seu simulador. Tecnologias Direct Drive em sua máxima performance.",
    color: "#f59e0b" 
  },
  'kings-pedais': {
    desc: "Porque freadas perfeitas ganham corridas com precisão magnética e Load Cell.",
    color: "#ef4444" 
  },
  'kings-volantes': {
    desc: "Fórmulas, GT3 ou Rally. Arcos para você não precisar tirar a mão da direção.",
    color: "#10b981" 
  },
  'kings-acessorios': {
    desc: "Aprimore sua experiência com acessórios oficiais para seu simulador.",
    color: "#8b5cf6"
  }
}

export default async function CategoryShowcasePage({ params }: { params: { slug: string } }) {
  let products: any[] = []
  let category: any = null
  
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: cat } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', params.slug)
      .eq('brand_scope', 'kings')
      .single()

    if (!cat) {
      notFound()
    }
    
    category = cat

    const { data: prods } = await supabase
      .from('products')
      .select('id, title, slug, price, price_compare, images, attributes, stock, brands!inner(name)')
      .eq('status', 'active')
      .eq('brands.name', 'kings')
      .eq('category_id', cat.id)
      .order('created_at', { ascending: false })
      
    products = prods || []
  } catch (err) {
    console.error("Erro buscando produtos de categoria:", err)
    if (!category) notFound()
  }

  const meta = UI_METADATA[category.slug] || { desc: "Explore nossa seleção de produtos.", color: "#00e5ff" }

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
          <div style={{
            position: 'absolute',
            top: 0, right: 0, bottom: 0, left: 0,
            background: `radial-gradient(circle at 10% 90%, ${meta.color}20 0%, transparent 60%)`,
            zIndex: 0,
            pointerEvents: 'none'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '4px', background: meta.color, borderRadius: '2px' }} />
              <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>VITRINE CLASSIFICADA</h4>
            </div>
            <h1 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text-primary)', textShadow: `0 0 20px ${meta.color}40` }}>
              {category.name}
            </h1>
            <div style={{ maxWidth: '800px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>
                {meta.desc}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
            <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>PRODUTOS DESTA CLASSE</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{products.length} encontrados</span>
          </div>
          
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)' }}>
              <p style={{ color: 'var(--text-muted)' }}>No momento, ainda não etiquetamos nenhum equipamento para "{category.name}".</p>
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
                    <div style={{ height: '240px', background: '#fff', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '16px' }} />
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
