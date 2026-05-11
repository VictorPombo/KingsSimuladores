import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@kings/db/server'
import { pushOrderToOlist } from '@kings/payments'

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: 'ID do pedido obrigatório' }, { status: 400 })
    }

    // Auth
    const supabaseUser = await createServerSupabaseClient()
    const { data: userData } = await (supabaseUser.auth as any).getUser()
    if (!userData?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { data: profile } = await supabaseUser.from('profiles').select('role').eq('auth_id', userData.user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const adminSupabase = createAdminClient()

    // Buscar dados do pedido
    const { data: order, error: orderErr } = await adminSupabase
      .from('orders')
      .select('id, brand_origin, status, total, shipping_address, shipping_cost, profiles(full_name, email, phone, cpf_cnpj)')
      .eq('id', orderId)
      .single()

    if (orderErr || !order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })

    const { data: items } = await adminSupabase
      .from('order_items')
      .select('id, product_id, quantity, unit_price, total_price, store_origin, product:product_id(title, sku, ncm, ean)')
      .eq('order_id', orderId)

    if (!items || items.length === 0) return NextResponse.json({ error: 'Pedido sem itens' }, { status: 400 })

    const profilesData = order.profiles as any
    const customerProfile = Array.isArray(profilesData) ? profilesData[0] : profilesData

    const store = order.brand_origin || 'kings'
    const cnpjEmitente = store === 'seven' ? '61.219.783/0001-93' : '29.688.089/0001-02'

    // Evitar duplicidade se já existir invoice (apenas atualiza o status se falhou antes)
    const { data: existingInvoice } = await adminSupabase.from('invoices').select('id').eq('order_id', orderId).maybeSingle()
    if (existingInvoice) {
        return NextResponse.json({ error: 'Nota Fiscal já existe para este pedido' }, { status: 400 })
    }

    const orderPayload = {
      id: order.id,
      total: order.total,
      customer: {
        name: customerProfile?.full_name || 'Desconhecido',
        email: customerProfile?.email || '',
        cpf_cnpj: customerProfile?.cpf_cnpj || '',
        phone: customerProfile?.phone || ''
      },
      shipping: order.shipping_address || {},
      shipping_cost: order.shipping_cost || 0,
      items: items.map((i: any) => ({
         product_id: i.product?.sku || i.product_id,
         title: i.product?.title || 'Item',
         quantity: i.quantity,
         unit_price: i.unit_price,
         ncm: i.product?.ncm || '',
         gtin: i.product?.ean || 'SEM GTIN',
         origem: '0',
         cfop: '6102' // Simplificado
      }))
    }

    const res = await pushOrderToOlist(orderPayload, store)

    if (res && res.status !== 'error') {
        await adminSupabase.from('invoices').insert({
            order_id: order.id,
            store_origin: store,
            erp_id: res.tiny_id || res.id || '',
            cnpj_emitente: cnpjEmitente,
            nfe_number: '',
            nfe_key: '',
            status: 'pending',
            xml_url: '',
            pdf_url: ''
        })
        if (res.tiny_id) await adminSupabase.from('orders').update({ erp_id: res.tiny_id }).eq('id', order.id)
        
        return NextResponse.json({ success: true, message: 'Enviado ao ERP com sucesso' })
    } else {
        return NextResponse.json({ error: 'Erro ao injetar no ERP. Verifique se o CPF e telefone são válidos.' }, { status: 400 })
    }

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
