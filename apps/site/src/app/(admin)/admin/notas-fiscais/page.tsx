import { createServerSupabaseClient } from '@kings/db/server'
import { NotasFiscaisClient } from './NotasFiscaisClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminNotasFiscaisPage() {
  const supabase = await createServerSupabaseClient()

  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      id, nfe_number, nfe_key, status, xml_url, pdf_url, issued_at, created_at, cnpj_emitente, order_id,
      orders!order_id ( total, status, profiles!customer_id ( full_name ) )
    `)
    .order('created_at', { ascending: false })

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
