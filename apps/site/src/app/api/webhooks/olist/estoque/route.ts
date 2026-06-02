import { createAdminClient } from '@kings/db'
import { authenticateWebhook, successResponse, errorResponse, unauthorizedResponse, log, logError } from '../_shared/auth'

/**
 * POST /api/webhooks/olist/estoque
 * 
 * Webhook de Notificação de Estoque — Tiny ERP → KingsHub
 * 
 * Disparado pelo Tiny sempre que o saldo de estoque de um produto é alterado
 * (venda em outro canal, ajuste manual, entrada de mercadoria, etc).
 * 
 * Payload esperado (Tiny v2 — Callbacks):
 * {
 *   "dados": {
 *     "id": "123456",
 *     "codigo": "SIM-T300",
 *     "nome": "Volante Thrustmaster T300 RS",
 *     "saldo": "3",
 *     "saldoReservado": "1"
 *   }
 * }
 */
export async function POST(req: Request) {
  const SCOPE = 'Estoque'

  try {
    const body = await req.json()
    const { token, store } = authenticateWebhook(req.url, body)

    if (!token) return unauthorizedResponse()

    log(SCOPE, `Notificação recebida (loja: ${store})`, body)

    const dados = body.dados || body
    const sku = dados.codigo
    const erpId = dados.id?.toString()
    const novoSaldo = Number(dados.saldo ?? dados.estoque_atual ?? dados.estoque)

    if ((!sku && !erpId) || isNaN(novoSaldo)) {
      log(SCOPE, 'Payload incompleto (sem SKU/ID ou saldo inválido), ignorando.')
      return successResponse('Ignorado: payload incompleto.')
    }

    const supabase = createAdminClient()

    // Localizar o produto
    let query = supabase.from('products').select('id, sku, title, stock')
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

    const estoqueAtual = product.stock ?? 0

    if (novoSaldo === estoqueAtual) {
      log(SCOPE, `Estoque de "${product.title}" já está em ${estoqueAtual}. Nenhuma alteração.`)
      return successResponse('Estoque já sincronizado.')
    }

    const { error } = await supabase
      .from('products')
      .update({ stock: novoSaldo })
      .eq('id', product.id)

    if (error) {
      logError(SCOPE, `Falha ao atualizar estoque de ${product.sku}:`, error)
      return errorResponse(`Erro ao atualizar estoque: ${error.message}`, 500)
    }

    log(SCOPE, `✅ Estoque de "${product.title}" atualizado: ${estoqueAtual} → ${novoSaldo}`)

    return successResponse(`Estoque de ${product.sku} atualizado.`, {
      sku: product.sku,
      old_stock: estoqueAtual,
      new_stock: novoSaldo
    })

  } catch (error: any) {
    logError(SCOPE, 'Erro fatal:', error)
    return errorResponse(error.message, 500)
  }
}
