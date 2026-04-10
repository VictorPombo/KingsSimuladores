import { createServerSupabaseClient } from '@kings/db/server'
import { PedidosClient } from './PedidosClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPedidosPage() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id, brand_origin, order_type, status, subtotal, shipping_cost, discount, total,
        payment_method, tracking_code, coupon_id, created_at,
        profiles!customer_id ( full_name, email, phone )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return <div style={{ padding: '2rem', color: 'red' }}>Erro do Banco: {error.message} (Dica: Verificar o nome da chave profiles!customer_id)</div>
    }

    return (
      <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
        <PedidosClient orders={(orders as any) || []} />
      </div>
    )
  } catch (err: any) {
    return (
      <div style={{ padding: '2rem', color: 'red', fontSize: '1.2rem', background: '#1e1e1e', minHeight: '100vh' }}>
        <h2>Erro Crítico no Servidor:</h2>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{err.message || String(err)}</pre>
        <pre>{err.stack}</pre>
      </div>
    )
  }
}
