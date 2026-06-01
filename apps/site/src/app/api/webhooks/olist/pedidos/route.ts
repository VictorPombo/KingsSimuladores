import { createAdminClient } from '@kings/db'
import { authenticateWebhook, successResponse, errorResponse, unauthorizedResponse, log, logError } from '../_shared/auth'

/**
 * POST /api/webhooks/olist/pedidos
 * 
 * Webhook de Alteração na Situação de Pedidos — Tiny ERP → KingsHub
 * 
 * Disparado pelo Tiny sempre que o status de um pedido muda no ERP
 * (ex: Aprovado → Faturado, Faturado → Enviado, etc).
 * 
 * Payload esperado (Tiny v2 — Callbacks):
 * {
 *   "dados": {
 *     "id": "987654321",
 *     "numero": "1001",
 *     "situacao": "Faturado",
 *     "data_pedido": "27/05/2026"
 *   }
 * }
 * 
 * Mapeamento de situações Tiny → KingsHub:
 * - "Aprovado"    → paid
 * - "Faturado"    → paid (mantém, NF-e está sendo processada)
 * - "Pronto Envio"→ paid (aguardando despacho)
 * - "Enviado"     → shipped
 * - "Entregue"    → delivered
 * - "Cancelado"   → cancelled
 */

const SITUACAO_MAP: Record<string, string> = {
  'aprovado': 'paid',
  'faturado': 'paid',
  'pronto para envio': 'paid',
  'pronto envio': 'paid',
  'enviado': 'shipped',
  'entregue': 'delivered',
  'cancelado': 'cancelled',
  'devolvido': 'cancelled',
}

export async function POST(req: Request) {
  const SCOPE = 'Pedidos'

  try {
    const body = await req.json()
    const { token, store } = authenticateWebhook(req.url, body)

    if (!token) return unauthorizedResponse()

    log(SCOPE, `Notificação recebida (loja: ${store})`, body)

    const dados = body.dados || body
    const erpId = dados.id?.toString()
    const situacao = (dados.situacao || '').toLowerCase().trim()

    if (!erpId) {
      log(SCOPE, 'Payload sem ID do pedido, ignorando.')
      return successResponse('Ignorado: sem ID de pedido.')
    }

    if (!situacao) {
      log(SCOPE, 'Payload sem situação do pedido, ignorando.')
      return successResponse('Ignorado: sem situação.')
    }

    const novoStatus = SITUACAO_MAP[situacao]

    if (!novoStatus) {
      log(SCOPE, `Situação "${dados.situacao}" não mapeada. Registrando e ignorando.`)
      return successResponse(`Situação "${dados.situacao}" não mapeada — ignorada.`)
    }

    const supabase = createAdminClient()

    // Localizar pedido pelo erp_id
    const { data: order } = await supabase
      .from('orders')
      .select('id, status, erp_id')
      .eq('erp_id', erpId)
      .maybeSingle()

    if (!order) {
      log(SCOPE, `Pedido ERP ID ${erpId} não encontrado no KingsHub. Buscando dados no Tiny ERP para criação automática (Marketplace)...`)
      
      const tinyToken = store === 'seven' 
        ? process.env.OLIST_API_KEY_SEVEN 
        : process.env.OLIST_API_KEY_KINGS

      if (!tinyToken) {
        log(SCOPE, 'Token do Tiny ausente. Não é possível buscar os dados do pedido.')
        return successResponse('Pedido não encontrado e sem token para busca.')
      }

      // Buscar dados completos do pedido na API do Tiny
      let pedidoData: any = null
      try {
        const fetchParams = new URLSearchParams()
        fetchParams.append('token', tinyToken)
        fetchParams.append('formato', 'json')
        fetchParams.append('id', erpId)

        const res = await fetch('https://api.tiny.com.br/api2/pedido.obter.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: fetchParams.toString()
        })
        const json = await res.json()

        if (json.retorno?.status === 'OK' && json.retorno?.pedido) {
          pedidoData = json.retorno.pedido
        } else {
          log(SCOPE, 'Falha ao obter dados completos do pedido no Tiny:', json.retorno)
          return successResponse('Falha ao obter dados do pedido no Tiny.')
        }
      } catch (e) {
        logError(SCOPE, `Erro ao buscar dados do Tiny para o pedido ${erpId}:`, e)
        return successResponse('Erro na busca API Tiny.')
      }

      // Identificar ou criar cliente
      const clienteEmail = pedidoData.cliente?.email || `marketplace_${erpId}@kingshub.local`
      const clienteNome = pedidoData.cliente?.nome || 'Cliente Marketplace'
      
      let customerId: string | null = null
      
      // Busca perfil existente
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, auth_id')
        .eq('email', clienteEmail)
        .maybeSingle()

      if (existingProfile) {
        customerId = existingProfile.id
      } else {
        // Tenta criar usuário no Auth (que dispara trigger criando o Profile)
        const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: clienteEmail,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { full_name: clienteNome }
        })

        if (authUser?.user) {
          // Busca o perfil recém criado pelo trigger
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('auth_id', authUser.user.id)
            .single()
          customerId = newProfile?.id || null
        } else if (authError?.message?.includes('already exists')) {
            // Caso raro onde existe no auth mas não no profiles, fazemos fallback buscando de novo
            const { data: fallbackUser } = await supabase.auth.admin.listUsers()
            const found = fallbackUser.users.find(u => u.email === clienteEmail)
            if (found) {
               const { data: fp } = await supabase.from('profiles').select('id').eq('auth_id', found.id).maybeSingle()
               customerId = fp?.id || null
            }
        } else {
           logError(SCOPE, 'Erro ao criar usuário auth para marketplace:', authError)
        }
      }

      if (!customerId) {
         log(SCOPE, 'Falha ao resolver customer_id. Cancelando criação do pedido.')
         return successResponse('Falha ao resolver cliente.')
      }

      // Criar o Pedido
      const brandOrigin = store === 'seven' ? 'seven' : 'kings'
      
      const insertOrder = {
        customer_id: customerId,
        brand_origin: brandOrigin,
        order_type: 'marketplace' as const,
        status: novoStatus,
        subtotal: Number(pedidoData.valor_produtos || 0),
        shipping_cost: Number(pedidoData.valor_frete || 0),
        discount: Number(pedidoData.valor_desconto || 0),
        total: Number(pedidoData.total_pedido || 0),
        cnpj_emitente: store === 'seven' ? process.env.FRENET_CEP_ORIGEM_SEVEN : process.env.FRENET_CEP_ORIGEM_KINGS, // Fallback apenas
        notes: `Pedido importado via Hub (Tiny ID: ${erpId})`,
        erp_id: erpId
      }

      const { data: newOrder, error: orderErr } = await supabase
        .from('orders')
        .insert(insertOrder)
        .select('id')
        .single()

      if (orderErr || !newOrder) {
        logError(SCOPE, 'Erro ao inserir pedido marketplace:', orderErr)
        return errorResponse('Erro ao inserir pedido', 500)
      }

      // Inserir Itens do Pedido
      if (pedidoData.itens && Array.isArray(pedidoData.itens)) {
        const orderItemsPayload = await Promise.all(pedidoData.itens.map(async (itemWrapper: any) => {
          const item = itemWrapper.item
          const itemSku = item.codigo
          
          // Tenta achar o produto no banco
          const { data: prod } = await supabase.from('products').select('id').eq('sku', itemSku).maybeSingle()
          
          return {
            order_id: newOrder.id,
            product_id: prod?.id || null, // Se null, é apenas um registro histórico no BD
            quantity: Number(item.quantidade || 1),
            unit_price: Number(item.valor_unitario || 0),
            total_price: Number(item.valor_total || 0),
            // Nome gravado estaticamente para caso o produto não exista na base
            title_fallback: item.descricao
          }
        }))

        // order_items não tem column 'title_fallback' no schema publico padrão? 
        // Vamos checar e remover se necessário. Melhor inserir sem pra não dar erro.
        const cleanPayload = orderItemsPayload.map(({ title_fallback, ...rest }) => rest)
        
        await supabase.from('order_items').insert(cleanPayload)
      }

      log(SCOPE, `✅ Pedido Marketplace ${newOrder.id} (ERP: ${erpId}) criado com sucesso no KingsHub.`)
      return successResponse(`Pedido Marketplace criado com sucesso.`, { order_id: newOrder.id })
    }

    // Proteção contra regressão de status (não voltar de "shipped" para "paid", por ex)
    const STATUS_ORDER = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
    const currentIndex = STATUS_ORDER.indexOf(order.status)
    const newIndex = STATUS_ORDER.indexOf(novoStatus)

    // Permite "cancelled" a qualquer momento, mas bloqueia regressões normais
    if (novoStatus !== 'cancelled' && newIndex <= currentIndex) {
      log(SCOPE, `Pedido ${order.id} já está em "${order.status}". Status "${novoStatus}" seria regressão. Ignorando.`)
      return successResponse(`Status já em "${order.status}" — sem regressão.`)
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: novoStatus })
      .eq('id', order.id)

    if (error) {
      logError(SCOPE, `Falha ao atualizar pedido ${order.id}:`, error)
      return errorResponse(`Erro ao atualizar pedido: ${error.message}`, 500)
    }

    log(SCOPE, `✅ Pedido ${order.id} atualizado: "${order.status}" → "${novoStatus}" (ERP: ${situacao})`)

    return successResponse(`Pedido ${order.id} atualizado para "${novoStatus}".`, {
      order_id: order.id,
      old_status: order.status,
      new_status: novoStatus,
      erp_situacao: dados.situacao
    })

  } catch (error: any) {
    logError(SCOPE, 'Erro fatal:', error)
    return errorResponse(error.message, 500)
  }
}
