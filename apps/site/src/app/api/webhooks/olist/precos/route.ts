import { createAdminClient } from '@kings/db'
import { authenticateWebhook, successResponse, errorResponse, unauthorizedResponse, log, logError } from '../_shared/auth'

/**
 * POST /api/webhooks/olist/precos
 * 
 * Webhook de Notificação de Preços — Tiny ERP → KingsHub
 * 
 * Disparado pelo Tiny sempre que o preço de um produto é alterado no ERP.
 * Garante que o site reflita o preço correto sem precisar de sync manual.
 * 
 * Payload esperado (Tiny v2 — Callbacks):
 * {
 *   "dados": {
 *     "id": "123456",
 *     "codigo": "SIM-T300",
 *     "nome": "Volante Thrustmaster T300 RS",
 *     "preco": "1599.90",
 *     "preco_promocional": "1399.90"
 *   }
 * }
 */
export async function POST(req: Request) {
  const SCOPE = 'Preços'

  try {
    const body = await req.json()
    const { token, store } = authenticateWebhook(req.url, body)

    if (!token) return unauthorizedResponse()

    log(SCOPE, `Notificação recebida (loja: ${store})`, body)

    const dados = body.dados || body
    const sku = dados.codigo
    const erpId = dados.id?.toString()

    if (!sku && !erpId) {
      log(SCOPE, 'Payload sem identificador, ignorando.')
      return successResponse('Ignorado: sem identificador.')
    }

    // Calcula preço final (prioriza o promocional)
    const precoBase = Number(dados.preco) || 0
    const precoPromocional = Number(dados.preco_promocional) || 0

    if (precoBase <= 0 && precoPromocional <= 0) {
      log(SCOPE, 'Preço inválido ou zerado no payload, ignorando.')
      return successResponse('Ignorado: preço inválido.')
    }

    const supabase = createAdminClient()

    // Localizar o produto
    let query = supabase.from('products').select('id, sku, title, price, price_compare')
    if (sku) {
      query = query.eq('sku', sku)
    } else {
      query = query.eq('tray_id', erpId)
    }

    const { data: product } = await query.maybeSingle()

    if (!product) {
      log(SCOPE, `Produto SKU ${sku || erpId} não encontrado no site. Ignorando.`)
      return successResponse('Produto não encontrado — ignorado.')
    }

    const updates: Record<string, any> = {}

    // Lógica de precificação:
    // - Se tem preco_promocional > 0: price = promocional, price_compare = precoBase (riscado)
    // - Se só tem preco: price = precoBase, price_compare = null
    if (precoPromocional > 0 && precoPromocional < precoBase) {
      if (Number(product.price) !== precoPromocional) updates.price = precoPromocional
      if (Number(product.price_compare) !== precoBase) updates.price_compare = precoBase
    } else {
      if (Number(product.price) !== precoBase) updates.price = precoBase
      // Limpar price_compare se não há mais promoção
      if (product.price_compare && precoPromocional <= 0) updates.price_compare = null
    }

    if (Object.keys(updates).length === 0) {
      log(SCOPE, `Preço de "${product.title}" já está correto. Nenhuma alteração.`)
      return successResponse('Preço já sincronizado.')
    }

    const { error } = await supabase.from('products').update(updates).eq('id', product.id)

    if (error) {
      logError(SCOPE, `Falha ao atualizar preço de ${product.sku}:`, error)
      return errorResponse(`Erro ao atualizar preço: ${error.message}`, 500)
    }

    log(SCOPE, `✅ Preço de "${product.title}" atualizado:`, {
      antes: { price: product.price, price_compare: product.price_compare },
      depois: updates
    })

    return successResponse(`Preço de ${product.sku} atualizado.`, { updated: updates })

  } catch (error: any) {
    logError(SCOPE, 'Erro fatal:', error)
    return errorResponse(error.message, 500)
  }
}
