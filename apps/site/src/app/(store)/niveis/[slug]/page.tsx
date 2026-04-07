import { Container } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db'
import { formatPrice } from '@kings/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

const LEVEL_DATA: Record<string, { title: string, desc: string, color: string }> = {
  iniciante: {
    title: "INICIANTE – HOBBIE O INÍCIO.",
    desc: "Para quem está assumindo o volante pela primeira vez e busca o melhor custo-benefício com as consagradas bases de polia ou engrenagem.",
    color: "#34A853" 
  },
  premium: {
    title: "PREMIUM – AQUI VOCÊ FAZ A DIFERENÇA!",
    desc: "Equipamentos de alto padrão que elevam completamente a sua imersão em qualquer simulador e garantem durabilidade.",
    color: "#00e5ff"
  },
  profissional: {
    title: "PROFISSIONAIS – TODO MILÉSSIMO CONTA!",
    desc: "Apenas precisão bruta. Bases Direct Drive e Pedais Load Cell ou Hidráulicos. Sem concessões, máximo realismo competitivo das pistas para a sua sala.",
    color: "#ff3366"
  },
  semiprofissional: {
    title: "SEMIPROFISSIONAIS – 3X NA SEMANA, FOCO!!!",
    desc: "A evolução perfeita (Belt-Drive) para quem já tem experiência, joga constantemente e quer cortar os últimos milésimos para bater o próprio recorde.",
    color: "#eab308"
  }
}

export default async function LevelPage({ params }: { params: { slug: string } }) {
  const data = LEVEL_DATA[params.slug]
  
  if (!data) {
    notFound()
  }

  let products: any[] = []
  
  try {
    const supabase = await createServerSupabaseClient()
    const result = await supabase
      .from('products')
      .select('id, title, slug, price, price_compare, images, attributes, stock')
      .eq('status', 'active')
      .ilike('title', `%${params.slug}%`)
      .order('created_at', { ascending: false })
    
    products = result.data || []
  } catch (err) {
    console.error("Erro buscando produtos de nível:", err)
  }

  return (
    <div style={{ padding: '40px 0', minHeight: 'calc(100vh - 80px)' }}>
      <Container>
        
        {/* Banner Hero do Nível */}
        <div style={{ 
          marginBottom: '48px', 
          background: 'rgba(10, 12, 18, 0.4)', 
          padding: '40px', 
          borderRadius: '16px', 
          border: '1px solid rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle Glow Effect */}
          <div style={{
            position: 'absolute',
            top: 0, right: 0, bottom: 0, left: 0,
            background: `radial-gradient(circle at 80% 0%, ${data.color}15 0%, transparent 60%)`,
            zIndex: 0,
            pointerEvents: 'none'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '4px', background: data.color, borderRadius: '2px' }} />
              <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Vitrine Classificada</h4>
            </div>
            <h1 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text-primary)', textShadow: `0 0 20px ${data.color}40` }}>
              {data.title}
            </h1>
            <div style={{ maxWidth: '800px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>
                {data.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Produtos */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
            <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>PRODUTOS DESTE NÍVEL</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{products.length} encontrados</span>
          </div>
          
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '16px' }}>
                No momento, ainda não etiquetamos nenhum equipamento como "{params.slug}".
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                (Administrador: edite os produtos no Painel de Controle e adicione a palavra "{params.slug}" para preencher esta vitrine automaticamente).
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {products.map(product => (
                <Link key={product.id} href={`/produtos/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ 
                    background: 'var(--bg-card)', 
                    borderRadius: 'var(--radius)', 
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ aspectRatio: '1', background: '#fff', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
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
