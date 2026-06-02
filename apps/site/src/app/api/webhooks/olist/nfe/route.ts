import { createAdminClient } from '@kings/db'
import { authenticateWebhook, successResponse, errorResponse, unauthorizedResponse, log, logError } from '../_shared/auth'

/**
 * POST /api/webhooks/olist/nfe
 * 
 * Webhook de Envio de Nota Fiscal — Tiny ERP → KingsHub
 * 
 * Disparado pelo Tiny quando uma NF-e é emitida/autorizada pela SEFAZ.
 * Atualiza a tabela invoices com a chave, número e link da NF-e.
 * 
 * Payload esperado (Tiny v2 — Callbacks):
 * {
 *   "dados": {
 *     "id": "111222333",
 *     "idPedido": "987654321",
 *     "numero": "001234",
 *     "serie": "1",
 *     "chaveAcesso": "35260529688089000102550010001234561123456789",
 *     "situacao": "5",    // 5 = Autorizada, 6 = Cancelada
 *     "link": "https://...",
 *     "xml": "https://..."
 *   }
 * }
 * 
 * Situações da NF-e no Tiny:
 * 1 = Em digitação | 2 = Pronta p/ envio | 3 = Aguardando retorno
 * 4 = Rejeitada    | 5 = Autorizada      | 6 = Cancelada
 * 7 = Denegada     | 8 = Inutilizada
 */

const NFE_SITUACAO: Record<string, string> = {
  '5': 'issued',     // Autorizada
  '6': 'cancelled',  // Cancelada
  '7': 'cancelled',  // Denegada
}

export async function POST(req: Request) {
  const SCOPE = 'NFe'

  try {
    const body = await req.json()
    const { token, store } = authenticateWebhook(req.url, body)

    if (!token) return unauthorizedResponse()

    log(SCOPE, `Notificação recebida (loja: ${store})`, body)

    const dados = body.dados || body
    const nfeId = dados.id?.toString()
    const erpPedidoId = dados.idPedido?.toString() || dados.id_pedido?.toString()
    const nfeNumero = dados.numero?.toString() || ''
    const nfeChave = dados.chaveAcesso || dados.chave_acesso || ''
    const situacao = dados.situacao?.toString() || ''
    const linkPdf = dados.link || dados.link_nfe || ''
    const linkXml = dados.xml || dados.xml_url || ''

    if (!erpPedidoId && !nfeId) {
      log(SCOPE, 'Payload sem ID do pedido ou da NF-e, ignorando.')
      return successResponse('Ignorado: sem identificador.')
    }

    const supabase = createAdminClient()

    // 1. Localizar o pedido pelo erp_id
    const { data: order } = await supabase
      .from('orders')
      .select('id, erp_id')
      .eq('erp_id', erpPedidoId || '')
      .maybeSingle()

    if (!order) {
      log(SCOPE, `Pedido ERP ID ${erpPedidoId} não encontrado no KingsHub. Ignorando.`)
      return successResponse('Pedido não encontrado — provavelmente externo ao site.')
    }

    // 2. Localizar ou criar a invoice vinculada
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id, status, nfe_number, nfe_key, pdf_url, xml_url')
      .eq('order_id', order.id)
      .maybeSingle()

    const nfeStatus = NFE_SITUACAO[situacao] || 'pending'

    const invoiceUpdates: Record<string, any> = {
      status: nfeStatus,
    }

    if (nfeNumero) invoiceUpdates.nfe_number = nfeNumero
    if (nfeChave) invoiceUpdates.nfe_key = nfeChave
    if (linkPdf) invoiceUpdates.pdf_url = linkPdf
    if (linkXml) invoiceUpdates.xml_url = linkXml
    if (nfeStatus === 'issued') invoiceUpdates.issued_at = new Date().toISOString()

    if (existingInvoice) {
      // Atualizar a invoice existente
      const { error } = await supabase
        .from('invoices')
        .update(invoiceUpdates)
        .eq('id', existingInvoice.id)

      if (error) {
        logError(SCOPE, `Falha ao atualizar invoice do pedido ${order.id}:`, error)
        return errorResponse(`Erro ao atualizar NF-e: ${error.message}`, 500)
      }

      log(SCOPE, `✅ Invoice ${existingInvoice.id} atualizada: NF-e #${nfeNumero} — ${nfeStatus}`)
    } else {
      // Criar nova invoice (edge case: NF-e chegou antes do webhook do MP)
      const { error } = await supabase
        .from('invoices')
        .insert({
          order_id: order.id,
          store_origin: store || 'kings',
          erp_id: erpPedidoId || '',
          cnpj_emitente: store === 'seven' ? '61.219.783/0001-93' : '29.688.089/0001-02',
          ...invoiceUpdates
        })

      if (error) {
        logError(SCOPE, `Falha ao criar invoice para pedido ${order.id}:`, error)
        return errorResponse(`Erro ao criar NF-e: ${error.message}`, 500)
      }

      log(SCOPE, `✅ Invoice CRIADA para pedido ${order.id}: NF-e #${nfeNumero} — ${nfeStatus}`)
    }

    return successResponse(`NF-e processada para pedido ${order.id}.`, {
      order_id: order.id,
      nfe_number: nfeNumero,
      nfe_status: nfeStatus,
      has_pdf: !!linkPdf,
      has_xml: !!linkXml
    })

  } catch (error: any) {
    logError(SCOPE, 'Erro fatal:', error)
    return errorResponse(error.message, 500)
  }
}
