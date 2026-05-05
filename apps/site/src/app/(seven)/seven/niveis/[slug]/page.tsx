import { Container } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db'
import { formatPrice } from '@kings/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@kings/ui'
import { LevelVideo } from './LevelVideo'

export const revalidate = 60

const NIVEIS_DATA: Record<string, { title: string, desc: string, color: string, video: string }> = {
  iniciante: {
    title: "INICIANTE - HOBBIE O INÍCIO.",
    desc: "O começo da sua jornada de alta performance com a Simagic. Equipamentos que entregam um realismo incomparável para quem quer ir além dos brinquedos de prateleira e sentir cada detalhe da pista.",
    color: "#f97316", // Laranja Seven
    video: "/IMG_8543.mp4"
  },
  semiprofissional: {
    title: "SEMIPROFISSIONAIS - 3X NA SEMANA, FOCO!!!",
    desc: "A escolha favorita dos pilotos competitivos. Bases direct drive de torque médio e pedais modulares com célula de carga pesada que entregam feedback instantâneo para melhorar o seu tempo de volta.",
    color: "#ef4444", // Vermelho Seven
    video: "/IMG_8541.mp4"
  },
  profissional: {
    title: "PROFISSIONAIS - TODO MILÉSIMO CONTA!",
    desc: "Equipamentos de nível profissional e simuladores de ponta sem concessões. A precisão absoluta necessária para os treinos de alta fidelidade e competições e-sports no mais alto grau.",
    color: "#dc2626", // Vermelho Escuro Seven
    video: "/IMG_8542.mp4"
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
      .select('id, title, slug, price, price_compare, images, attributes, stock, brands!inner(name)')
      .eq('status', 'active')
      .eq('brands.name', 'seven')
      
    // Lógica Dinâmica de Keywords baseada no Level para Seven/Simagic
    // Baseado no inventário atual de itens Simagic no banco
    if (params.slug === 'iniciante') {
      query = query.or('title.ilike.%Alpha Mini%,title.ilike.%Alpha EVO Sport%,title.ilike.%P500%,title.ilike.%T-LOC%,title.ilike.%P-330R%,title.ilike.%P-325C%')
    } else if (params.slug === 'semiprofissional') {
      query = query.or('title.ilike.%Alpha EVO Pro%,title.ilike.%Alpha (%,title.ilike.%P1000%,title.ilike.%NEO X%,title.ilike.%Q1S%,title.ilike.%TB-1%,title.ilike.%FX-C%')
    } else if (params.slug === 'profissional') {
      query = query.or('title.ilike.%Alpha U%,title.ilike.%P2000%,title.ilike.%FX Pro%,title.ilike.%GT Pro%,title.ilike.%HPR%')
    }

    const result = await query.order('created_at', { ascending: false })
    products = result.data || []
  } catch (err) {
    console.error("Erro buscando produtos de nivel:", err)
  }

  return (
    <div style={{ padding: '40px 0', minHeight: 'calc(100vh - 80px)' }}>
      <Container>

        {/* ← Voltar + Tabs de Nível */}
        <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Link href="/seven" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, transition: 'color 0.2s' }}>
            <span style={{ fontSize: '1.1rem' }}>←</span> Voltar para Home
          </Link>

          {/* Floating Level Tabs */}
          <div style={{
            display: 'flex', gap: '8px', padding: '6px',
            background: 'rgba(15,18,30,0.6)', backdropFilter: 'blur(12px)',
            borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)',
            width: 'fit-content',
          }}>
            {Object.entries(NIVEIS_DATA).map(([slug, d]) => {
              const isActive = slug === params.slug
              return (
                <Link key={slug} href={`/seven/niveis/${slug}`} style={{
                  textDecoration: 'none',
                  padding: '8px clamp(6px, 1.5vw, 20px)',
                  borderRadius: '10px',
                  fontSize: 'clamp(0.65rem, 2.8vw, 0.82rem)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  color: isActive ? '#000' : 'var(--text-secondary)',
                  background: isActive ? d.color : 'transparent',
                  border: isActive ? 'none' : '1px solid transparent',
                }}>
                  {slug.charAt(0).toUpperCase() + slug.slice(1)}
                </Link>
              )
            })}
          </div>
        </div>
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
              
              <div style={{ marginTop: '32px', display: 'inline-flex', alignItems: 'center', gap: '16px', background: 'rgba(0, 0, 0, 0.4)', padding: '16px 24px', borderRadius: '12px', border: `1px solid ${data.color}30`, boxShadow: `0 4px 20px rgba(0,0,0,0.5)` }}>
                <div style={{
                  width: '20px', height: '32px', borderRadius: '10px', border: `2px solid ${data.color}`, display: 'flex', justifyContent: 'center', paddingTop: '4px', flexShrink: 0
                }}>
                  <div style={{ width: '2px', height: '6px', borderRadius: '2px', background: data.color, animation: 'mouseScroll 1.5s ease-in-out infinite' }} />
                </div>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Role para baixo para ver os produtos
                </span>
                
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes mouseScroll {
                    0% { transform: translateY(0); opacity: 1; }
                    30% { transform: translateY(6px); opacity: 0; }
                    31% { transform: translateY(-6px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                  }
                `}} />
              </div>
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
              <Link href="/seven/produtos" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '16px' }}>
                <Button size="sm" style={{ background: 'var(--accent)', color: '#000' }}>Explorar Todos os Produtos</Button>
              </Link>
            </div>
          ) : (
            <div className="kings-catalog-grid">
              {products.map(product => (
                <Link key={product.id} href={`/seven/produtos/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
