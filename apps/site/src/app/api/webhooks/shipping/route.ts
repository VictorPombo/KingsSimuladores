import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db/server'

/**
 * Webhook da Frenet — Recebe atualizações de rastreio automaticamente.
 * 
 * A Frenet envia um POST para esta URL toda vez que o status de uma
 * etiqueta muda (Postado → Em Trânsito → Entregue → etc.)
 * 
 * Configure esta URL no painel da Frenet:
 *   https://www.kingssimuladores.com.br/api/webhooks/shipping
 * 
 * Payload esperado (documentação Frenet):
 * {
 *   "ShipmentOrderId": "...",
 *   "TrackingNumber": "QU247608282BR",
 *   "TrackingEvents": [
 *     { "EventDescription": "Objeto entregue ao destinatário", "EventDateTimeISO": "..." }
 *   ]
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('[Webhook Shipping] Payload recebido:', JSON.stringify(body))

    const trackingNumber = body.TrackingNumber || body.tracking_number || body.trackingNumber
    const events = body.TrackingEvents || body.tracking_events || []

    if (!trackingNumber) {
      console.warn('[Webhook Shipping] Payload sem tracking number, ignorando.')
      return NextResponse.json({ ok: true, message: 'Ignored: no tracking number' })
    }

    const supabase = createAdminClient()

    // Encontra o pedido pelo tracking_code
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('tracking_code', trackingNumber)
      .single()

    if (findError || !order) {
      console.warn(`[Webhook Shipping] Nenhum pedido encontrado para tracking: ${trackingNumber}`)
      return NextResponse.json({ ok: true, message: 'Order not found for this tracking' })
    }

    // Detecta se foi entregue analisando os eventos
    const isDelivered = events.some((evt: any) => {
      const desc = (evt.EventDescription || evt.description || '').toLowerCase()
      return desc.includes('entregue') || desc.includes('delivered') || desc.includes('objeto entregue')
    })

    const isInTransit = events.some((evt: any) => {
      const desc = (evt.EventDescription || evt.description || '').toLowerCase()
      return desc.includes('trânsito') || desc.includes('transit') || desc.includes('postado') || desc.includes('objeto postado')
    })

    let newStatus = order.status // mantém o status atual por padrão

    if (isDelivered) {
      newStatus = 'delivered'
    } else if (isInTransit && order.status !== 'delivered') {
      newStatus = 'shipped'
    }

    // Só atualiza se o status mudou
    if (newStatus !== order.status) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id)

      if (updateError) {
        console.error('[Webhook Shipping] Erro ao atualizar status:', updateError)
        return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 })
      }

      console.log(`[Webhook Shipping] Pedido ${order.id} atualizado: ${order.status} → ${newStatus}`)
    } else {
      console.log(`[Webhook Shipping] Pedido ${order.id} já está com status "${order.status}", nada a alterar.`)
    }

    return NextResponse.json({ ok: true, orderId: order.id, status: newStatus })
  } catch (error: any) {
    console.error('[Webhook Shipping] Erro fatal:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
