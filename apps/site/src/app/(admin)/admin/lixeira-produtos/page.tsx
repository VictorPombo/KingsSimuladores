import { createServerSupabaseClient } from '@kings/db/server'
import { LixeiraClient } from './LixeiraClient'

export const dynamic = 'force-dynamic'

export default async function LixeiraProdutosPage() {
  const supabase = await createServerSupabaseClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, title, sku, price, stock, status, created_at')
    .eq('status', 'archived')
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Lixeira de Produtos</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Produtos arquivados que podem ser restaurados</p>
        </div>

        <LixeiraClient products={products || []} />
      </div>
    </div>
  )
}
