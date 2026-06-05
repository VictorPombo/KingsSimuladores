import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { verifyPaymentStatus } from '@kings/payments'
import { createAdminClient } from '@kings/db'

// Verifica a assinatura HMAC-SHA256 enviada pelo Mercado Pago no header x-signature.
// Documentação: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
// Retorna true se válida, false se inválida. Se MP_WEBHOOK_SECRET não estiver configurado,
// passa sem bloquear (compatibilidade com ambiente de desenvolvimento).
function verifyMPSignature(req: Request, rawBody: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true

  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id')
  const searchParams = new URL(req.url).searchParams
  const dataId = searchParams.get('data.id') || ''

  if (!xSignature) return false

  // O MP envia: "ts=<timestamp>,v1=<hash>"
  const parts = Object.fromEntries(xSignature.split(',').map(p => p.split('=')))
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  // Template de assinatura conforme documentação oficial do MP
  const signedTemplate = `id:${dataId};request-id:${xRequestId || ''};ts:${ts};`
  const expectedHash = createHmac('sha256', secret).update(signedTemplate).digest('hex')

  try {
    return timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(expectedHash, 'hex'))
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  try {
    const searchParams = new URL(req.url).searchParams
    const topic = searchParams.get('topic') || searchParams.get('type')
    const body = await req.json()

    // Verificação de assinatura HMAC-SHA256 — executada antes de qualquer I/O no banco.
    // Bloqueia requisições forjadas sem custo de query ao Supabase.
    if (!verifyMPSignature(req, JSON.stringify(body))) {
      console.warn('[Webhook MP] Assinatura inválida rejeitada.')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const action = body.action || topic

    if (action !== 'payment.created' && action !== 'payment.updated' && topic !== 'payment') {
      return NextResponse.json({ ok: true })
    }

    const paymentId = body.data?.id || searchParams.get('data.id')
    if (!paymentId) return NextResponse.json({ ok: true })

    // 1. Verificar status real no Mercado Pago
    const storeContext = searchParams.get('store') || undefined
    const paymentData = await verifyPaymentStatus(paymentId, storeContext)

    if (paymentData.status !== 'approved' || !paymentData.external_reference) {
      return NextResponse.json({ received: true })
    }

    const orderId = paymentData.external_reference
    const supabase = createAdminClient()

    // 1.5 Interceptar pagamento de Upsell de Destaque (MSU Premium)
    if (orderId.startsWith('bump_')) {
      const productId = orderId.replace('bump_', '')
      await supabase.from('products').update({ bumped_at: new Date().toISOString() }).eq('id', productId)
      await supabase.from('marketplace_listings').update({ bumped_at: new Date().toISOString() }).eq('listing_id', productId)
      console.log(`[Webhook MP] Destaque (bump) ativado para produto ${productId}`)
      return NextResponse.json({ received: true })
    }

    // 2. Idempotência: abortar silenciosamente se já processado
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single()

    if (existingOrder?.status === 'paid') {
      console.log(`[Webhook MP] Pedido ${orderId} já estava pago. Ignorando.`)
      return NextResponse.json({ received: true })
    }

    // 3. Atualizar pedido para 'paid' — operação atômica crítica
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_id: paymentId,
        payment_method: paymentData.payment_method_id,
      })
      .eq('id', orderId)
      .select('id, customer_id, brand_origin, total, shipping_address, coupon_id, preference_id, shipping_cost, profiles(full_name, email, phone, cpf_cnpj)')
      .single()

    if (orderErr || !order) {
      console.error('[Webhook MP] Falha ao atualizar pedido para paid:', orderId, orderErr)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 4. Operações síncronas rápidas (apenas banco local, sem APIs externas)

    // 4a. Incrementar uso do cupom
    if (order.coupon_id) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('usage_count')
        .eq('id', order.coupon_id)
        .single()
      if (coupon) {
        await supabase
          .from('coupons')
          .update({ usage_count: (coupon.usage_count || 0) + 1 })
          .eq('id', order.coupon_id)
      }
    }

    // 4b. Baixa de estoque e status MSU (leitura + escrita local, sem I/O externo)
    const { data: items } = await supabase
      .from('order_items')
      .select('id, product_id, quantity, unit_price, total_price, store_origin, product:product_id(title, stock, sku, ncm, ean, seller_id, price)')
      .eq('order_id', orderId)

    if (items) {
      for (const item of items) {
        const origin = item.store_origin || order.brand_origin

        if ((origin === 'kings' || origin === 'seven') && item.product_id) {
          const product = item.product as any
          const currentStock = typeof product?.stock === 'number'
            ? product.stock
            : (await supabase.from('products').select('stock').eq('id', item.product_id).single()).data?.stock ?? 0
          await supabase
            .from('products')
            .update({ stock: Math.max(0, currentStock - item.quantity) })
            .eq('id', item.product_id)
        }

        if (origin === 'msu' && item.product_id) {
          await supabase.from('products').update({ status: 'sold' }).eq('id', item.product_id)
        }
      }
    }

    // 4c. Limpar carrinho ativo (evita falso positivo no robô de cart abandonado)
    if (order.customer_id) {
      await supabase.from('cart').delete().eq('customer_id', order.customer_id)
    }

    // 4d. MSU: atualizar sub-ledger de marketplace
    if (order.preference_id) {
      await supabase
        .from('marketplace_orders')
        .update({ status: 'paid', mp_payment_id: paymentId })
        .eq('mp_preference_id', order.preference_id)
    }

    // 5. Enfileirar todos os jobs externos — ON CONFLICT DO NOTHING garante idempotência
    const profilesData = order.profiles as any
    const profile = Array.isArray(profilesData) ? profilesData[0] : profilesData

    // Payload compartilhado com os dados que os workers vão precisar (evita re-queries)
    const sharedPayload = {
      paymentId,
      storeContext,
      profile: {
        full_name: profile?.full_name,
        email: profile?.email,
        phone: profile?.phone,
        cpf_cnpj: profile?.cpf_cnpj,
      },
      order: {
        id: order.id,
        brand_origin: order.brand_origin,
        total: order.total,
        shipping_cost: (order as any).shipping_cost,
        shipping_address: order.shipping_address,
        coupon_id: order.coupon_id,
        preference_id: order.preference_id,
      },
      items: (items || []).map((i: any) => ({
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_price: i.total_price,
        store_origin: i.store_origin,
        product: i.product,
      })),
    }

    const jobsToEnqueue = [
      'olist_erp',
      'frenet_label',
      'notify_customer_whatsapp',
      'notify_customer_email',
      'notify_admin_email',
      ...(items?.some((i: any) => (i.store_origin || order.brand_origin) === 'msu') ? ['msu_split', 'msu_seller_email'] : []),
    ]

    const { error: jobsErr } = await supabase.from('order_jobs').insert(
      jobsToEnqueue.map(job_type => ({
        order_id: orderId,
        job_type,
        payload: sharedPayload,
      }))
    )

    if (jobsErr) {
      // Se o insert de jobs falhar (ex: constraint de unicidade em retry do MP),
      // logamos mas retornamos 200 — o pedido já está pago, não podemos deixar o MP retentar o update.
      console.error('[Webhook MP] Aviso: falha ao inserir jobs (possível retry do MP):', jobsErr.message)
    }

    console.log(`[Webhook MP] Pedido ${orderId} confirmado. ${jobsToEnqueue.length} jobs enfileirados.`)

    // MP exige 200 rápido — toda a lógica pesada agora é assíncrona via Cron
    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('[Webhook MP Fatal]', error)
    return NextResponse.json({ error: 'Processing error', details: error.message }, { status: 500 })
  }
}
