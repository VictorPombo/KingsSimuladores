import { createAdminClient } from '@kings/db'
import { SegmentedPricesClient } from './SegmentedPricesClient'

export const dynamic = 'force-dynamic'

export default async function PrecosSegmentadosPage() {
  const supabase = createAdminClient()

  // Buscar grupos
  const { data: groups } = await supabase
    .from('customer_groups')
    .select('*')
    .order('created_at', { ascending: false })

  // Buscar produtos ativos (para listar na tabela de preços)
  const { data: products } = await supabase
    .from('products')
    .select('id, title, sku, price')
    .eq('status', 'active')
    .order('title', { ascending: true })

  // Buscar overrides já salvos
  const { data: overrides } = await supabase
    .from('segmented_prices')
    .select('id, product_id, group_id, price')

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Preços Segmentados</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Configure preços diferenciados por grupo de clientes</p>
        </div>

        <SegmentedPricesClient 
          initialGroups={groups || []} 
          products={products || []} 
          initialOverrides={overrides || []} 
        />
      </div>
    </div>
  )
}
