import { createAdminClient } from '@kings/db'
import { authenticateWebhook, successResponse, errorResponse, unauthorizedResponse, log, logError } from '../_shared/auth'

/**
 * POST /api/webhooks/olist/rastreio
 * 
 * Webhook de Envio de Rastreio — Tiny ERP → KingsHub
 * 
 * Disparado pelo Tiny quando um código de rastreio é vinculado a um pedido
 * (operador colou o tracking number no ERP ou a transportadora informou).
 * 
 * Payload esperado (Tiny v2 — Callbacks):
 * {
 *   "dados": {
 *     "id": "987654321",
 *     "numero": "1001",
 *     "codigo_rastreamento": "QU247608282BR",
 *     "url_rastreamento": "https://...",
 *     "formaEnvio": "Correios - PAC",
 *     "dataSaida": "27/05/2026"
 *   }
 * }
 */
export async function POST(req: Request) {
  const SCOPE = 'Rastreio'

  try {
    const body = await req.json()
    const { token, store } = authenticateWebhook(req.url, body)

    if (!token) return unauthorizedResponse()

    log(SCOPE, `Notificação recebida (loja: ${store})`, body)

    const dados = body.dados || body
    const erpId = dados.id?.toString()
    const trackingCode = dados.codigo_rastreamento || dados.codigoRastreamento || dados.tracking_code || dados.tracking_number

    if (!erpId) {
      log(SCOPE, 'Payload sem ID do pedido, ignorando.')
      return successResponse('Ignorado: sem ID de pedido.')
    }

    if (!trackingCode) {
      log(SCOPE, `Pedido ERP ID ${erpId} sem código de rastreio no payload. Ignorando.`)
      return successResponse('Ignorado: sem código de rastreio.')
    }

    const supabase = createAdminClient()

    // Localizar pedido pelo erp_id
    const { data: order } = await supabase
      .from('orders')
      .select('id, status, tracking_code, customer_id')
      .eq('erp_id', erpId)
      .maybeSingle()

    if (!order) {
      log(SCOPE, `Pedido ERP ID ${erpId} não encontrado no KingsHub. Ignorando.`)
      return successResponse('Pedido não encontrado — ignorado.')
    }

    // Se o tracking code já é o mesmo, não faz nada
    if (order.tracking_code === trackingCode) {
      log(SCOPE, `Pedido ${order.id} já possui tracking ${trackingCode}. Sem alteração.`)
      return successResponse('Rastreio já vinculado.')
    }

    const updates: Record<string, any> = {
      tracking_code: trackingCode
    }

    // Se o pedido ainda está como "paid", promover para "shipped"
    if (order.status === 'paid' || order.status === 'pending') {
      updates.status = 'shipped'
    }

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', order.id)

    if (error) {
      logError(SCOPE, `Falha ao vincular rastreio ao pedido ${order.id}:`, error)
      return errorResponse(`Erro ao atualizar rastreio: ${error.message}`, 500)
    }

    log(SCOPE, `✅ Rastreio "${trackingCode}" vinculado ao pedido ${order.id}. Status: ${order.status} → ${updates.status || order.status}`)

    // Notificação ao cliente poderia ser disparada aqui,
    // mas já é feito pelo webhook de shipping (Frenet) e pelo WhatsApp no MP webhook.

    return successResponse(`Rastreio vinculado ao pedido ${order.id}.`, {
      order_id: order.id,
      tracking_code: trackingCode,
      status: updates.status || order.status
    })

  } catch (error: any) {
    logError(SCOPE, 'Erro fatal:', error)
    return errorResponse(error.message, 500)
  }
}
