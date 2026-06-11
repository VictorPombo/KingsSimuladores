import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db'
import { pushOrderToOlist, type OlistOrderInput } from '@kings/payments'

export const dynamic = 'force-dynamic'

const CNPJ_POR_LOJA: Record<string, string> = {
  kings: '29.688.089/0001-02',
  seven: '61.219.783/0001-93',
  msu: '29.688.089/0001-02',
  sabrina_prado: '59.851.612/0001-30',
}

export async function POST(req: Request) {
  let body: { order_id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 })
  }

  const { order_id } = body
  if (!order_id) {
    return NextResponse.json({ error: 'Campo order_id é obrigatório.' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // 1. Buscar pedido com itens e perfil
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      id, brand_origin, total, subtotal, shipping_cost, shipping_address, erp_id,
      order_items (
        quantity, unit_price, total_price, store_origin,
        product:product_id ( sku, title, ncm, ean )
      ),
      profiles!customer_id ( full_name, email, phone, cpf_cnpj )
    `)
    .eq('id', order_id)
    .single()

  if (orderError || !order) {
    return NextResponse.json(
      { error: 'Pedido não encontrado.', detail: orderError?.message },
      { status: 404 },
    )
  }

  const profile = order.profiles as {
    full_name: string
    email: string
    phone?: string
    cpf_cnpj?: string
  } | null

  const items = (order.order_items as Array<{
    quantity: number
    unit_price: number
    total_price: number
    store_origin: string | null
    product: { sku?: string; title?: string; ncm?: string; ean?: string } | null
  }>) ?? []

  const addr = order.shipping_address as Record<string, string> | null

  // 2. Montar o payload no formato OlistOrderInput
  const uf = (addr?.state || addr?.estado || addr?.cidade?.split('/')?.[1] || 'SP').trim().toUpperCase()

  const olistPayload: OlistOrderInput = {
    id: order.id,
    total: Number(order.total),
    customer: {
      name: profile?.full_name || 'Cliente',
      email: profile?.email || '',
      cpf_cnpj: profile?.cpf_cnpj ?? undefined,
      phone: profile?.phone ?? undefined,
    },
    shipping: {
      street: addr?.street || addr?.logradouro || '',
      number: addr?.number || addr?.numero || 'S/N',
      complement: addr?.complement || addr?.complemento,
      neighborhood: addr?.neighborhood || addr?.bairro || '',
      zip: addr?.cep || '',
      city: addr?.city || addr?.cidade || '',
      state: uf,
    },
    shipping_cost: Number(order.shipping_cost) || 0,
    items: items.map((item) => ({
      product_id: item.product?.sku || 'SEM-SKU',
      title: item.product?.title || 'Item',
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
      ncm: item.product?.ncm || '',
      gtin: item.product?.ean || 'SEM GTIN',
      origem: '0',
      cfop: uf === 'SP' ? '5102' : '6102',
    })),
  }

  const store = order.brand_origin || 'kings'

  // 3. Chamar pushOrderToOlist
  const res = await pushOrderToOlist(olistPayload, store)

  if (!res || res.status === 'error') {
    const errMsg = (res as { retorno?: { erros?: Array<{ erro?: string }> } } | null)
      ?.retorno?.erros?.[0]?.erro
      ?? 'Falha ao enviar pedido ao ERP. Verifique as chaves de API.'

    return NextResponse.json({ error: errMsg }, { status: 502 })
  }

  const erp_id: string = res.tiny_id || res.id || ''

  // 4. Atualizar orders.erp_id e upsert em invoices
  await supabase.from('orders').update({ erp_id }).eq('id', order_id)

  await supabase.from('invoices').upsert(
    {
      order_id,
      store_origin: store,
      erp_id,
      cnpj_emitente: CNPJ_POR_LOJA[store] ?? CNPJ_POR_LOJA.kings,
      nfe_number: '',
      nfe_key: '',
      status: 'pending',
      xml_url: '',
      pdf_url: '',
    },
    { onConflict: 'order_id' },
  )

  // 5. Enfileirar emissão automática da NFe (mesmo fluxo do cron)
  await supabase.from('order_jobs').insert({
    order_id,
    job_type: 'emit_nfe',
    status: 'pending',
    retry_count: 0,
    payload: { erp_id, order_id, store },
  })

  return NextResponse.json({ ok: true, erp_id })
}
