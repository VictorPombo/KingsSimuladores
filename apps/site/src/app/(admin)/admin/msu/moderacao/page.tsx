import { createAdminClient } from '@kings/db'
import { ClientList } from './ClientList'

export const revalidate = 30 // Força a página a não usar cache (sempre fresca)

export default async function ModeracaoPage() {
  const supabaseAdmin = createAdminClient()

  // 1. Buscar os produtos pendentes
  const { data: pendingProducts, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Erro ao buscar produtos pendentes:', error)
  }

  const products = pendingProducts || []

  // 2. Buscar os perfis dos vendedores para cruzar os dados (Join seguro)
  const sellerIds = [...new Set(products.map(p => p.seller_id).filter(Boolean))]
  
  let profiles: any[] = []
  if (sellerIds.length > 0) {
    const { data: profilesData } = await supabaseAdmin
      .from('profiles')
      .select('id, auth_id, full_name, email')
      .in('id', sellerIds)
    
    // Tratativa extra: em alguns schemas, products.seller_id aponta para profiles.id ou profiles.auth_id
    // Pegamos a lista bruta e fazemos o map de forma flexível:
    if (profilesData) profiles = profilesData
  }

  // 3. Mesclar os dados para enviar ao Client Component
  const enrichedProducts = products.map(product => {
    // Tenta casar pelo id ou auth_id, dependendo de como a tabela profiles está estruturada
    const seller = profiles.find(p => p.id === product.seller_id || p.auth_id === product.seller_id)
    return {
      ...product,
      seller: seller || null
    }
  })

  return (
    <div style={{ padding: '2rem', background: '#0A0A0A', minHeight: '100vh', color: '#fff' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E8002D', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
          ADMIN / MSU
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', color: '#fff', letterSpacing: '-1px' }}>
          Fila de Moderação.
        </h1>
        <p style={{ color: '#a1a1aa', marginBottom: '3rem', fontSize: '1.1rem' }}>
          Avalie e aprove rapidamente os anúncios submetidos pela comunidade para que fiquem ativos na plataforma.
        </p>

        <ClientList initialProducts={enrichedProducts} />
      </div>
    </div>
  )
}
