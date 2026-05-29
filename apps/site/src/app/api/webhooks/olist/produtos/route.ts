import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db'
import { authenticateWebhook, successResponse, errorResponse, unauthorizedResponse, log, logError } from '../_shared/auth'

/**
 * POST /api/webhooks/olist/produtos
 * 
 * Webhook de Notificação de Produtos — Tiny ERP → KingsHub
 * 
 * Disparado pelo Tiny sempre que um produto é criado, editado ou removido no ERP.
 * 
 * - inclusao → CRIA o produto no site como rascunho (busca dados completos no Tiny)
 * - alteracao → ATUALIZA preço, nome, NCM, EAN, status
 * - exclusao → ARQUIVA o produto (não deleta pra manter histórico)
 */

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export async function POST(req: Request) {
  const SCOPE = 'Produtos'

  try {
    const body = await req.json()
    const { token, store } = authenticateWebhook(req.url, body)

    if (!token) return unauthorizedResponse()

    log(SCOPE, `Notificação recebida (loja: ${store})`, body)

    const dados = body.dados || body
    const tipo = body.tipo || 'alteracao'

    const erpId = dados.id?.toString()
    const sku = dados.codigo

    if (!erpId && !sku) {
      log(SCOPE, 'Payload sem ID ou código, ignorando.')
      return successResponse('Ignorado: sem identificador de produto.')
    }

    const supabase = createAdminClient()

    // Localizar o produto no banco pelo SKU (mais confiável) ou pelo tray_id
    let query = supabase.from('products').select('id, sku, title, price, stock, status, tray_id')
    
    if (sku) {
      query = query.eq('sku', sku)
    } else {
      query = query.eq('tray_id', erpId)
    }

    const { data: product } = await query.maybeSingle()

    if (tipo === 'exclusao') {
      if (product) {
        // Arquivar o produto (não deleta para manter histórico de pedidos)
        await supabase.from('products').update({ status: 'archived' }).eq('id', product.id)
        log(SCOPE, `Produto "${product.title}" (${product.sku}) arquivado por exclusão no ERP.`)
        return successResponse(`Produto ${product.sku} arquivado.`)
      }

      log(SCOPE, `Produto com ERP ID ${erpId} / SKU ${sku} não encontrado para exclusão (já removido?).`)
      return successResponse('Produto não encontrado — nenhuma ação necessária.')
    }

    // ═══════════════════════════════════════════════════════════
    // PRODUTO NOVO — Criar automaticamente a partir do Tiny
    // ═══════════════════════════════════════════════════════════
    if (!product) {
      log(SCOPE, `Produto não existe no site. Criando automaticamente a partir do Tiny...`)

      const tinyToken = store === 'seven' 
        ? process.env.OLIST_API_KEY_SEVEN 
        : process.env.OLIST_API_KEY_KINGS

      if (!tinyToken || !erpId) {
        log(SCOPE, 'Token do Tiny ou ID do ERP ausente. Não é possível criar o produto automaticamente.')
        return successResponse('Produto não encontrado e sem dados suficientes para criação automática.')
      }

      // Buscar dados completos do produto na API do Tiny
      let richData: any = {}
      try {
        const fetchParams = new URLSearchParams()
        fetchParams.append('token', tinyToken)
        fetchParams.append('formato', 'json')
        fetchParams.append('id', erpId)

        const richRes = await fetch('https://api.tiny.com.br/api2/produto.obter.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: fetchParams.toString()
        })
        const richJson = await richRes.json()

        if (richJson.retorno?.status === 'OK' && richJson.retorno?.produto) {
          richData = richJson.retorno.produto
        } else {
          log(SCOPE, 'Falha ao obter dados completos do Tiny:', richJson.retorno)
        }
      } catch (e) {
        logError(SCOPE, `Erro ao buscar dados do Tiny para SKU ${sku}:`, e)
      }

      // Montar dados do produto
      const title = richData.nome || dados.nome || `Produto ${sku || erpId}`
      const productSku = richData.codigo || sku || `ERP-${erpId}`
      const slug = slugify(`${title}-${productSku}`)

      const precoBase = Number(richData.preco || dados.preco) || 0
      const precoPromo = Number(richData.preco_promocional || dados.preco_promocional) || 0
      const price = precoPromo > 0 && precoPromo < precoBase ? precoPromo : precoBase

      // Imagens
      let imagesArray: string[] = []
      if (richData.anexos && Array.isArray(richData.anexos)) {
        imagesArray = richData.anexos.map((a: any) => a.anexo).filter(Boolean)
      }

      // Buscar brand_id padrão
      const brandName = store === 'seven' ? 'seven' : 'kings'
      const { data: brandData } = await supabase.from('brands').select('id').eq('name', brandName).single()

      const insertPayload = {
        title,
        sku: productSku,
        slug,
        price,
        price_compare: precoPromo > 0 && precoPromo < precoBase ? precoBase : null,
        status: 'draft' as const,
        brand_id: brandData?.id || null,
        cnpj_emitente: '',
        ncm: (richData.ncm || dados.ncm || '').replace(/\D/g, '') || null,
        ean: (richData.gtin && richData.gtin !== 'Não especifica') ? richData.gtin : null,
        weight_kg: richData.peso_bruto ? Number(richData.peso_bruto) : null,
        description: richData.descricao_complementar || null,
        images: imagesArray,
        tray_id: erpId,
        stock: richData.estoque_atual ? Number(richData.estoque_atual) : (dados.estoque_atual ? Number(dados.estoque_atual) : 0),
      }

      const { data: newProd, error: insertErr } = await supabase
        .from('products')
        .insert(insertPayload)
        .select('id')
        .single()

      if (insertErr) {
        logError(SCOPE, `Erro ao criar produto ${productSku}:`, insertErr)
        return errorResponse(`Erro ao criar produto: ${insertErr.message}`, 500)
      }

      log(SCOPE, `✅ Produto "${title}" (${productSku}) CRIADO como rascunho. ID: ${newProd?.id}`)
      return successResponse(`Produto ${productSku} criado como rascunho.`, { created: true, id: newProd?.id })
    }

    // ═══════════════════════════════════════════════════════════
    // PRODUTO EXISTENTE — Atualizar campos que mudaram
    // ═══════════════════════════════════════════════════════════
    const updates: Record<string, any> = {}

    const novoPreco = dados.preco_promocional && Number(dados.preco_promocional) > 0
      ? Number(dados.preco_promocional)
      : Number(dados.preco)

    if (novoPreco && novoPreco !== Number(product.price)) {
      updates.price = novoPreco
    }

    if (dados.ncm) updates.ncm = dados.ncm.replace(/\D/g, '')
    if (dados.gtin && dados.gtin !== 'Não especifica') updates.ean = dados.gtin
    if (dados.nome && dados.nome !== product.title) updates.title = dados.nome

    // Se o produto estava inativo no ERP e foi reativado
    if (dados.situacao === 'I' && product.status === 'active') {
      updates.status = 'draft'
    } else if (dados.situacao === 'A' && product.status === 'archived') {
      updates.status = 'draft' // Reativar como rascunho para revisão manual
    }

    // Vincular o tray_id se ainda não existir
    if (!product.tray_id && erpId) {
      updates.tray_id = erpId
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from('products').update(updates).eq('id', product.id)
      if (error) {
        logError(SCOPE, `Falha ao atualizar produto ${product.sku}:`, error)
        return errorResponse(`Erro ao atualizar: ${error.message}`, 500)
      }
      log(SCOPE, `Produto "${product.title}" atualizado:`, updates)
    } else {
      log(SCOPE, `Produto "${product.title}" — nenhuma alteração detectada.`)
    }

    return successResponse(`Produto ${product.sku} processado com sucesso.`, { updated: Object.keys(updates) })

  } catch (error: any) {
    logError(SCOPE, 'Erro fatal:', error)
    return errorResponse(error.message, 500)
  }
}

