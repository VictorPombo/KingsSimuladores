import { createServerSupabaseClient } from '@kings/db/server'
import { PedidosClient } from './PedidosClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPedidosPage() {
  const supabase = await createServerSupabaseClient()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, brand_origin, order_type, status, subtotal, shipping_cost, discount, total,
      payment_method, tracking_code, coupon_id, created_at,
      profiles!customer_id ( full_name, email, phone )
    `)
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <PedidosClient orders={(orders as any) || []} />
    </div>
  )
}
