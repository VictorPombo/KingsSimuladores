import { createServerSupabaseClient } from '@kings/db/server'
import { ClientesClient } from './ClientesClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminClientesPage() {
  const supabase = await createServerSupabaseClient()

  // Buscar todos os perfis (exceto admins)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, cpf_cnpj, addresses, created_at')
    .neq('role', 'admin')
    .order('created_at', { ascending: false })

  // Buscar pedidos agrupados por customer
  const { data: orders } = await supabase
    .from('orders')
    .select('customer_id, total')

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
