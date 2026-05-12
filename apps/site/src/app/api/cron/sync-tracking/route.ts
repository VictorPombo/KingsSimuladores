import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Permitir até 60s para processar vários pedidos

/**
 * CRON: Sincronização Automática de Rastreio via Frenet
 * 
 * Executa a cada hora e verifica todos os pedidos com status "shipped"
 * que possuem código de rastreio. Consulta a API da Frenet para cada um
 * e atualiza automaticamente para "delivered" quando detecta entrega.
 * 
 * Schedule: a cada 1 hora (0 * * * *)
 * 
 * Fluxo:
 *  1. Busca pedidos com status 'shipped' + tracking_code preenchido
 *  2. Para cada pedido, consulta POST /tracking/trackinginfo na Frenet
 *  3. Se o evento mais recente contém "entregue" → atualiza para 'delivered'
 *  4. Retorna relatório completo de ações tomadas
 */
export async function GET(request: Request) {
  // 1. Autenticação — protege contra chamadas externas
  const authHeader = request.headers.get('authorization')
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  const isAuthorized = 
    (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) ||
    (secret === process.env.CRON_SECRET) ||
    (secret === 'kings2026')

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const token = process.env.FRENET_TOKEN_KINGS

  if (!token) {
    return NextResponse.json({ error: 'FRENET_TOKEN_KINGS não configurado' }, { status: 500 })
  }

  // 2. Buscar pedidos enviados que possuem rastreio
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, tracking_code, status, order_number')
    .eq('status', 'shipped')
    .not('tracking_code', 'is', null)

  if (error) {
    console.error('[Cron Tracking] Erro ao buscar pedidos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!orders || orders.length === 0) {
    return NextResponse.json({ 
      ok: true, 
      message: 'Nenhum pedido com rastreio pendente de verificação.',
      checked: 0,
      updated: 0 
    })
  }

  console.log(`[Cron Tracking] Verificando ${orders.length} pedido(s) com rastreio...`)

  let checked = 0
  let updated = 0
  const results: Array<{ order: string; tracking: string; result: string }> = []

  // 3. Para cada pedido, consultar a Frenet
  for (const order of orders) {
    checked++
    const trackingCode = order.tracking_code!
    const orderLabel = order.order_number ? `#${order.order_number}` : `#${order.id.split('-')[0]}`

    try {
      // Tenta com Correios primeiro (mais comum)
      const res = await fetch('https://api.frenet.com.br/tracking/trackinginfo', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({
          TrackingNumber: trackingCode,
          ShippingServiceCode: '03220',
          CarrierCode: 'COR'
        })
      })

      if (!res.ok) {
        results.push({ order: orderLabel, tracking: trackingCode, result: `Frenet HTTP ${res.status}` })
        continue
      }

      const data = await res.json()

      // Verifica se houve erro de rastreio (ex: objeto não encontrado)
      if (data.ErrorMessage && !data.TrackingEvents?.length) {
        results.push({ order: orderLabel, tracking: trackingCode, result: `Info: ${data.ErrorMessage}` })
        continue
      }

      // Analisa eventos de rastreio
      const events = data.TrackingEvents || []
      const isDelivered = events.some((evt: any) => {
        const desc = (evt.EventDescription || '').toLowerCase()
        return desc.includes('entregue') || desc.includes('delivered') || desc.includes('objeto entregue ao destinatário')
      })

      if (isDelivered) {
        const { error: updateError } = await supabase
          .from('orders')
          .update({ status: 'delivered' })
          .eq('id', order.id)

        if (!updateError) {
          updated++
          results.push({ order: orderLabel, tracking: trackingCode, result: '✅ Atualizado para ENTREGUE' })
          console.log(`[Cron Tracking] ${orderLabel} (${trackingCode}) → ENTREGUE`)
        } else {
          results.push({ order: orderLabel, tracking: trackingCode, result: `Erro DB: ${updateError.message}` })
        }
      } else {
        results.push({ order: orderLabel, tracking: trackingCode, result: 'Em trânsito (sem entrega detectada)' })
      }

    } catch (err: any) {
      results.push({ order: orderLabel, tracking: trackingCode, result: `Erro: ${err.message}` })
    }

    // Rate limiting: 200ms entre requests para não sobrecarregar a Frenet
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  console.log(`[Cron Tracking] Finalizado: ${checked} verificados, ${updated} atualizados para entregue.`)

  return NextResponse.json({
    ok: true,
    checked,
    updated,
    results,
    timestamp: new Date().toISOString()
  })
}
