import { Container } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db'
import { formatPrice } from '@kings/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@kings/ui'

export const revalidate = 60

const NIVEIS_DATA: Record<string, { title: string, desc: string, color: string }> = {
  iniciante: {
    title: "INICIANTE - HOBBIE O INÍCIO.",
    desc: "Esta categoria é o ponto de partida ideal para quem está entrando no mundo da simulação. Oferece equipamentos e softwares fáceis de usar, acessíveis e com configurações simplificadas. O foco é proporcionar uma primeira experiência imersiva e divertida, sem exigir um grande investimento inicial ou conhecimento técnico avançado.",
    color: "#00e5ff" // Ciano/Kings
  },
  semiprofissional: {
    title: "SEMIPROFISSIONAIS - 3X NA SEMANA, FOCO!!!",
    desc: "Esta categoria representa um passo acima para pilotos virtuais que já possuem alguma experiência e buscam um equipamento com maior realismo, precisão e imersão. Os produtos aqui oferecem um melhor feedback de força em wheelbases (9 a 12NM), pedaleiras mais avançadas e componentes de maior durabilidade.",
    color: "#10b981" // Verde/Kings
  },
  profissional: {
    title: "PROFISSIONAIS - TODO MILÉSIMO CONTA!",
    desc: "O ápice da simulação. Aqui o foco é extrair cada pentelhésimo de segundo da pista. Equipamentos de categoria mundial, pedais ativos, cockpits de movimento reais (Motion) e simuladores em níveis de fidelidade usados livremente por pilotos de F1, GT3 e Porsche Cup para treinar na vida real.",
    color: "#f59e0b" // Amarelo Gold
  }
}

export default async function NiveisShowcasePage({ params }: { params: { slug: string } }) {
  const data = NIVEIS_DATA[params.slug]
  
  if (!data) {
    notFound()
  }

  let products: any[] = []
  
  try {
    const supabase = await createServerSupabaseClient()
    
    let query = supabase
      .from('products')
      .select('id, title, slug, price, price_compare, images, attributes, stock')
      .eq('status', 'active')
      
    // Lógica Dinâmica de Keywords baseada no Level
    if (params.slug === 'iniciante') {
      query = query.or('title.ilike.%R3%,title.ilike.%R5%,title.ilike.%T128%,title.ilike.%G6%,title.ilike.%GR300%,title.ilike.%KS%')
    } else if (params.slug === 'semiprofissional') {
      query = query.or('title.ilike.%R9%,title.ilike.%R12%,title.ilike.%GR500%,title.ilike.%T818%,title.ilike.%MOZA%')
    } else if (params.slug === 'profissional') {
      query = query.or('title.ilike.%Motion%,title.ilike.%Active%,title.ilike.%GM5%,title.ilike.%Lamborghini%,title.ilike.%Active Pedal%,title.ilike.%R16%,title.ilike.%R21%,title.ilike.%FSR%,title.ilike.%Porsche%')
    }

    const result = await query.order('created_at', { ascending: false })
    products = result.data || []
  } catch (err) {
    console.error("Erro buscando produtos de nivel:", err)
  }

  return (
    <div style={{ padding: '40px 0', minHeight: 'calc(100vh - 80px)' }}>
      <Container>
        
        {/* Banner Hero estilo NÍVEIS */}
        <div style={{ 
          marginBottom: '48px', 
          background: 'rgba(10, 12, 18, 0.4)', 
          padding: 'clamp(24px, 5vw, 60px)', 
          borderRadius: '16px', 
          border: '1px solid rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0, right: 0, bottom: 0, left: 0,
            background: `radial-gradient(circle at 10% 90%, ${data.color}25 0%, transparent 70%)`,
            zIndex: 0,
            pointerEvents: 'none'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(32px, 5vw, 64px)', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '4px', background: data.color, borderRadius: '2px', boxShadow: `0 0 10px ${data.color}` }} />
                <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', color: data.color, margin: 0, fontWeight: 700 }}>Nível Recomendado</h4>
              </div>
              <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text-primary)', textShadow: `0 0 30px ${data.color}40`, lineHeight: 1.1 }}>
                <span style={{ display: 'block' }}>{data.title.split(' - ')[0]}</span>
                {data.title.split(' - ')[1] && (
                  <span style={{ display: 'block', fontSize: 'clamp(1.2rem, 2vw, 1.8rem)', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>
                    {data.title.split(' - ')[1]}
                  </span>
                )}
              </h1>
              <div style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                <p style={{ margin: 0, fontSize: 'clamp(1rem, 2vw, 1.15rem)' }}>
                  {data.desc}
                </p>
              </div>
            </div>
            
            {/* Espaço reservado para o vídeo */}
            <div style={{ 
              width: '100%', 
              aspectRatio: '16/9', 
              background: 'rgba(0,0,0,0.4)', 
              borderRadius: '12px',
              border: `1px solid ${data.color}30`,
              boxShadow: `inset 0 0 30px rgba(0,0,0,0.5)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: 'var(--text-muted)',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px', color: data.color, opacity: 0.8 }}>
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Espaço para Vídeo</span>
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
            <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>EQUIPAMENTOS DESTA CLASSE</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{products.length} encontrados</span>
          </div>
          
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)' }}>
              <p style={{ color: 'var(--text-muted)' }}>No momento, os equipamentos deste nível estão sendo atualizados no catálogo.</p>
              <Link href="/produtos" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '16px' }}>
                <Button size="sm" style={{ background: 'var(--accent)', color: '#000' }}>Explorar Todos os Produtos</Button>
              </Link>
            </div>
          ) : (
            <div className="kings-catalog-grid">
              {products.map(product => (
                <Link key={product.id} href={`/produtos/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="hover:-translate-y-1 group" style={{ 
                    background: 'var(--bg-card)', 
                    borderRadius: 'var(--radius)', 
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ aspectRatio: '1', background: '#fff', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '16px', mixBlendMode: 'multiply', transition: 'transform 0.4s' }} className="group-hover:scale-105" />
                      ) : (
                        <div style={{ color: '#ccc' }}>Sem Imagem</div>
                      )}
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px', background: `linear-gradient(90deg, transparent, ${data.color}80, transparent)` }} />
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '8px', lineHeight: 1.4, color: 'var(--text-primary)' }}>{product.title}</h3>
                      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: data.color }}>
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
