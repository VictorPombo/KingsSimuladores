import { createServerSupabaseClient } from '@kings/db/server'
import { NotasFiscaisClient } from './NotasFiscaisClient'

export const dynamic = 'force-dynamic'
export const revalidate = 30

import { cookies } from 'next/headers'

export default async function AdminNotasFiscaisPage() {
  const storeCookie = cookies().get('admin_store')?.value || 'all'

  if (storeCookie === 'msu') {
    return (
      <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#94a3b8' }}>Notas Fiscais da Loja MSU devem ser acessadas pelos menus próprios do Marketplace.</h2>
      </div>
    )
  }
  const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('invoices')
      .select(`
        id, nfe_number, nfe_key, status, xml_url, pdf_url, issued_at, created_at, cnpj_emitente, order_id,
        orders!inner ( total, status, brand_origin, profiles!customer_id ( full_name ) )
      `)
      .order('created_at', { ascending: false })

    if (storeCookie === 'kings' || storeCookie === 'seven') {
      query = query.eq('orders.brand_origin', storeCookie)
    }

    const { data: invoices } = await query

  const mapped = (invoices || []).map((inv: any) => ({
    id: inv.id,
    nfe_number: inv.nfe_number,
    nfe_key: inv.nfe_key,
    status: inv.status,
    xml_url: inv.xml_url,
    pdf_url: inv.pdf_url,
    issued_at: inv.issued_at,
    created_at: inv.created_at,
    cnpj_emitente: inv.cnpj_emitente,
    order_id: inv.order_id,
    order_total: Number(inv.orders?.total || 0),
    order_status: inv.orders?.status || '-',
    customer_name: inv.orders?.profiles?.full_name || 'Desconhecido',
  }))

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <NotasFiscaisClient invoices={mapped} />
    </div>
  )
}
