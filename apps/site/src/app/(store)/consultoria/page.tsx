import { Container } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db'
import { formatPrice } from '@kings/utils'
import Link from 'next/link'
import Image from 'next/image'

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
        <div style={{ marginBottom: '40px' }}>
          <h1 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
            CONSULTORIA
          </h1>
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            <p style={{ margin: 0 }}>
              Consultoria Completa para Montagem e Otimização de Simuladores Oferecemos consultoria especializada para montagem e ajustes de simuladores de corrida e jogos. Nosso serviço cobre tudo que você precisa para uma experiência imersiva e confortável, incluindo: Configuração de botões e controles, Ajuste de telas e distanciamento ideal, Postura correta para maior conforto e rendimento, Configuração de 3 telas ou mais, Personalização de setups para diferentes tipos de simuladores. Seja para uso profissional ou hobby, ajudamos você a criar o ambiente perfeito com orientação de especialistas. Garanta o máximo desempenho e imersão com nossa consultoria completa!
            </p>
          </div>
        </div>

        <div>
          <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>SERVIÇOS DISPONÍVEIS</h2>
          
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)' }}>
              <p style={{ color: 'var(--text-muted)' }}>Nenhum serviço de consultoria encontrado no momento.</p>
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
                    transition: 'transform 0.2s, border-color 0.2s',
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
