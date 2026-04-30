import { createServerSupabaseClient } from '@kings/db/server'
import { PedidosClient } from './PedidosClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { cookies } from 'next/headers'

export default async function AdminPedidosPage() {
  const storeCookie = cookies().get('admin_store')?.value || 'all'
  
  if (storeCookie === 'msu') {
    return (
      <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#94a3b8' }}>Pedidos da Loja MSU devem ser acessados pelos menus próprios do Marketplace.</h2>
      </div>
    )
  }
  try {
    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('orders')
      .select(`
        id, brand_origin, order_type, status, subtotal, shipping_cost, discount, total,
        payment_method, tracking_code, coupon_id, created_at,
        profiles!customer_id ( full_name, email, phone )
      `)
      .order('created_at', { ascending: false })

    if (storeCookie === 'kings' || storeCookie === 'seven') {
      query = query.eq('brand_origin', storeCookie)
    }

    const { data: orders, error } = await query

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
