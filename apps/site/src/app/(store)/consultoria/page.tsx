import { Container } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db'
import { formatPrice } from '@kings/utils'
import Link from 'next/link'


export const revalidate = 60

export default async function ConsultoriaPage() {
  let products: any[] = []
  
  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('products')
      .select('id, title, slug, price, price_compare, images, attributes, stock')
      .eq('status', 'active')
      .ilike('title', '%consultoria%')
      .order('created_at', { ascending: false })
    
    products = data || []
  } catch (err) {
    console.error("Erro buscando produtos de consultoria:", err)
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
            background: `radial-gradient(circle at 10% 90%, rgba(0, 229, 255, 0.25) 0%, transparent 70%)`,
            zIndex: 0,
            pointerEvents: 'none'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(32px, 5vw, 64px)', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '4px', background: 'var(--accent)', borderRadius: '2px', boxShadow: `0 0 10px var(--accent)` }} />
                <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', color: 'var(--accent)', margin: 0, fontWeight: 700 }}>SERVIÇO ESPECIALIZADO</h4>
              </div>
              <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text-primary)', textShadow: `0 0 30px rgba(0, 229, 255, 0.4)`, lineHeight: 1.1 }}>
                <span style={{ display: 'block' }}>CONSULTORIA</span>
                <span style={{ display: 'block', fontSize: 'clamp(1.2rem, 2vw, 1.8rem)', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>
                  MONTAGEM E AJUSTES
                </span>
              </h1>
              <div style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                <p style={{ margin: '0 0 16px 0', fontSize: 'clamp(1rem, 2vw, 1.15rem)' }}>
                  A Kings oferece consultoria especializada para montagem e ajustes finos. Configuração de botões, ajustes de telas para o FOV ideal, telemetria baseada no seu rig e imersão sem dores nas costas para stint completo.
                </p>
                <div style={{ background: 'rgba(0, 229, 255, 0.05)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--accent)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
                  <div style={{ fontSize: '2rem' }}>🎟️</div>
                  <div>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--success)' }}>100% REVERTIDO EM CUPOM!</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                      O valor da consultoria (R$ 150) é inteiramente revertido em desconto imediato na sua próxima compra de hardware no site.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Espaço reservado para o vídeo */}
            <div style={{ 
              width: '100%', 
              aspectRatio: '16/9', 
              background: 'rgba(0,0,0,0.4)', 
              borderRadius: '12px',
              border: `1px solid rgba(0, 229, 255, 0.3)`,
              boxShadow: `inset 0 0 30px rgba(0,0,0,0.5)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: 'var(--text-muted)',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px', color: 'var(--accent)', opacity: 0.8 }}>
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Espaço para Vídeo</span>
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
            <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>SERVIÇOS DISPONÍVEIS</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{products.length} encontrados</span>
          </div>
          
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)' }}>
              <p style={{ color: 'var(--text-muted)' }}>Nenhum serviço de consultoria encontrado no momento.</p>
            </div>
          ) : (
            <div className="kings-catalog-grid">
              {products.map(product => (
                <Link key={product.id} href={`/produtos/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ 
                    background: 'var(--bg-card)', 
                    borderRadius: 'var(--radius)', 
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    transition: 'transform 0.2s, border-color 0.2s',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ height: '240px', background: '#fff', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.title}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '16px' }}
                        />
                      ) : (
                        <div style={{ color: '#ccc' }}>Sem Imagem</div>
                      )}
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', lineHeight: 1.4, color: 'var(--text-primary)' }}>{product.title}</h3>
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
