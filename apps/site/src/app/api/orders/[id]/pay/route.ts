import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db/server'
import { createPreference } from '@kings/payments'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar o pedido garantindo que pertence ao usuário logado
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*, customer:profiles!customer_id(*)')
      .eq('id', orderId)
      .eq('customer.auth_id', user.id) // RLS já ajuda, mas garantimos explicitamente
      .single()

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Se o pedido não estiver pendente, não permitimos gerar novo link
    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Este pedido já foi pago ou cancelado.' }, { status: 400 })
    }

    // Buscar os itens do pedido
    const { data: orderItems, error: itemsErr } = await supabase
      .from('order_items')
      .select('*, product:product_id(title, image_url)')
      .eq('order_id', orderId)

    let mpItems: any[] = [];

    if (!itemsErr && orderItems && orderItems.length > 0) {
      mpItems = orderItems.map((item: any) => ({
        id: item.product_id || item.id,
        title: item.product?.title || 'Produto Kings',
        quantity: item.quantity,
        price: item.unit_price, // Compatibilidade com a createPreference
      }))
    } else {
      // Fallback: se os itens não existem ou RLS bloqueou, 
      // garante a geração do link com o valor total do pedido.
      mpItems = [{
        id: orderId,
        title: `Pedido #${orderId.split('-')[0].toUpperCase()}`,
        quantity: 1,
        price: order.total,
      }]
    }

    // Obter dados do cliente
    const customer = {
      email: user.email,
      name: order.customer?.full_name || '',
      phone: order.customer?.phone || ''
    }

    // Gerar nova preferência
    const preference = await createPreference(
      mpItems, 
      customer, 
      order.id, 
      undefined, 
      order.brand_origin as any
    )

    // Atualizar no banco de dados
    if (preference.id) {
      await supabase.from('orders').update({ preference_id: preference.id }).eq('id', order.id)
    }

    return NextResponse.json({ ok: true, init_point: preference.init_point })

  } catch (err: any) {
    console.error('[API Pay] Erro ao regerar link:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
