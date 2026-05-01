import { createServerSupabaseClient } from '@kings/db/server'
import { ClientesClient } from './ClientesClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { cookies } from 'next/headers'

export default async function AdminClientesPage() {
  const storeCookie = cookies().get('admin_store')?.value || 'all'

  if (storeCookie === 'msu') {
    return (
      <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#94a3b8' }}>Clientes da Loja MSU devem ser acessados pelos relatórios do Marketplace.</h2>
      </div>
    )
  }
  const supabase = await createServerSupabaseClient()

  // Buscar pedidos agrupados por customer e aplicar filtro da loja
  let ordersQuery = supabase.from('orders').select('customer_id, total')
  if (storeCookie === 'kings' || storeCookie === 'seven') {
    ordersQuery = ordersQuery.eq('brand_origin', storeCookie)
  }
  const { data: orders } = await ordersQuery

  // Se tem filtro de loja e não houver pedidos, retorna vazio direto (otimização)
  const customerIds = Array.from(new Set((orders || []).map((o: any) => o.customer_id)))
  if ((storeCookie === 'kings' || storeCookie === 'seven') && customerIds.length === 0) {
    return (
      <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
        <ClientesClient clients={[]} />
      </div>
    )
  }

  // Buscar todos os perfis (exceto admins)
  let profilesQuery = supabase
    .from('profiles')
    .select('id, full_name, email, phone, cpf_cnpj, addresses, created_at')
    .order('created_at', { ascending: false })

  if (storeCookie === 'kings' || storeCookie === 'seven') {
    profilesQuery = profilesQuery.in('id', customerIds)
  }

  const { data: profiles } = await profilesQuery

  // Mapear contagem e total por cliente
  const orderMap = new Map<string, { count: number; total: number }>()
  for (const o of (orders || []) as any[]) {
    const entry = orderMap.get(o.customer_id) || { count: 0, total: 0 }
    entry.count++
    entry.total += Number(o.total || 0)
    orderMap.set(o.customer_id, entry)
  }

  const clients = (profiles || []).map((p: any) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
    phone: p.phone,
    cpf_cnpj: p.cpf_cnpj,
    addresses: p.addresses,
    created_at: p.created_at,
    order_count: orderMap.get(p.id)?.count || 0,
    total_spent: orderMap.get(p.id)?.total || 0,
  }))

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <ClientesClient clients={clients} />
    </div>
  )
}
