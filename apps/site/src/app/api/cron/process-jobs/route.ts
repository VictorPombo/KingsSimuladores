import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db'
import { pushOrderToOlist, emitNfeTiny, getNfeLinkTiny } from '@kings/payments'
import { sendWhatsappMessage, sendEmailMessage } from '@kings/notifications'
import { generateShippingLabel } from '@kings/shipping'

export const dynamic = 'force-dynamic'

const MAX_RETRIES = 3
const BATCH_SIZE = 20

// Mapa de handlers por job_type
const JOB_HANDLERS: Record<string, (payload: any, supabase: any) => Promise<void>> = {

  async olist_erp(payload, supabase) {
    const { order, items } = payload
    const cnpjPorLoja: Record<string, string> = {
      kings: '29.688.089/0001-02',
      seven: '61.219.783/0001-93',
      msu:   '29.688.089/0001-02',
      sabrina_prado: '59.851.612/0001-30',
    }

    // Agrupar itens por loja
    const storeGroups: Record<string, any[]> = {}
    for (const item of items) {
      const origin = item.store_origin || order.brand_origin || 'kings'
      if (!storeGroups[origin]) storeGroups[origin] = []
      storeGroups[origin].push(item)
    }

    for (const store of Object.keys(storeGroups)) {
      const storeItems = storeGroups[store]
      const storeSubtotal = storeItems.reduce((acc: number, i: any) => acc + (i.total_price || i.unit_price * i.quantity), 0)
      const isMainStore = store === order.brand_origin
      const shippingVal = isMainStore ? (order.shipping_cost || 0) : 0

      const orderPayload = {
        id: `${order.id}-${store}`,
        total: storeSubtotal + shippingVal,
        customer: payload.profile,
        shipping: order.shipping_address,
        shipping_cost: shippingVal,
        items: storeItems.map((i: any) => {
          let uf = order.shipping_address?.state || ''
          if (!uf && order.shipping_address?.cidade?.includes('/')) {
            uf = order.shipping_address.cidade.split('/')[1].trim()
          }
          return {
            product_id: i.product?.sku || i.product_id,
            title: i.product?.title || 'Item',
            quantity: i.quantity,
            unit_price: i.unit_price,
            ncm: i.product?.ncm || '',
            gtin: i.product?.ean || 'SEM GTIN',
            origem: '0',
            cfop: uf.toUpperCase() === 'SP' ? '5102' : '6102',
          }
        }),
      }

      const apiKey = store === 'seven'
        ? process.env.OLIST_API_KEY_SEVEN
        : store === 'sabrina_prado'
          ? process.env.OLIST_API_KEY_SABRINA
          : process.env.OLIST_API_KEY_KINGS

      const cnpjEmitente = cnpjPorLoja[store] || cnpjPorLoja.kings

      const res = await pushOrderToOlist(orderPayload, store, apiKey)
      const erp_id = (res && res.status !== 'error') ? (res.tiny_id || res.id || '') : ''

      await supabase.from('invoices').insert({
        order_id: order.id,
        store_origin: store,
        erp_id,
        cnpj_emitente: cnpjEmitente,
        nfe_number: '',
        nfe_key: '',
        status: 'pending',
        xml_url: '',
        pdf_url: '',
      })

      if (erp_id) {
        await supabase.from('orders').update({ erp_id }).eq('id', order.id)

        // Enfileirar emissão automática da NFe
        await supabase.from('order_jobs').insert({
          order_id: order.id,
          job_type: 'emit_nfe',
          status: 'pending',
          retry_count: 0,
          payload: { erp_id, order_id: order.id, store },
        })
      }
    }
  },

  async emit_nfe(payload, supabase) {
    const { erp_id, order_id, store } = payload

    const apiKey = store === 'seven'
      ? process.env.OLIST_API_KEY_SEVEN
      : store === 'sabrina_prado'
        ? process.env.OLIST_API_KEY_SABRINA
        : (process.env.OLIST_API_KEY_KINGS || process.env.OLIST_ACCESS_TOKEN)

    if (!apiKey) {
      throw new Error(`[emit_nfe] API key não configurada para store "${store}"`)
    }

    const situacao = await emitNfeTiny(erp_id, apiKey)

    // Sefaz ainda processando — retry automático pelo cron
    if (!situacao || situacao.toLowerCase().includes('process') || situacao.toLowerCase().includes('pend')) {
      throw new Error(`[emit_nfe] NFe ainda em processamento (${situacao}). Retry pendente.`)
    }

    if (!situacao.toLowerCase().includes('aprovad') && !situacao.toLowerCase().includes('autoriza')) {
      throw new Error(`[emit_nfe] NFe rejeitada ou situação inesperada: ${situacao}`)
    }

    // Autorizada — buscar link do PDF
    const pdfUrl = await getNfeLinkTiny(erp_id, apiKey)

    await supabase
      .from('invoices')
      .update({
        status: 'issued',
        ...(pdfUrl ? { pdf_url: pdfUrl } : {}),
      })
      .eq('order_id', order_id)

    console.log(`[emit_nfe] ✅ NFe emitida para pedido ${order_id}. PDF: ${pdfUrl ?? 'n/a'}`)
  },

  async frenet_label(payload, supabase) {
    const { order, items } = payload

    // Buscar shipping_service_id diretamente do banco (mais atualizado que o payload)
    const { data: freshOrder } = await supabase
      .from('orders')
      .select('shipping_service_id')
      .eq('id', order.id)
      .single()

    const orderWithService = {
      ...order,
      shipping_service_id: freshOrder?.shipping_service_id || order.shipping_service_id,
    }

    // generateShippingLabel lança erro em caso de falha — o cron faz retry automaticamente
    const labelResult = await generateShippingLabel(orderWithService, items)

    if (labelResult.success && labelResult.tracking_code) {
      await supabase
        .from('orders')
        .update({
          tracking_code: labelResult.tracking_code,
          ticket_url: labelResult.ticket_url,
        })
        .eq('id', order.id)

      console.log(`[frenet_label] Pedido ${order.id} atualizado — Tracking: ${labelResult.tracking_code}`)
    }
  },

  async notify_customer_whatsapp(payload) {
    const { profile, order } = payload
    if (!profile?.phone) return
    const nome = profile.full_name?.split(' ')[0] || 'Cliente'
    const shortId = order.id.split('-')[0]
    const msg =
      `🏎️ Fala *${nome}*, tudo acelerando por aí?\n\n` +
      `Passando para confirmar que o pagamento do seu pedido (*#${shortId}*) foi aprovado com sucesso! ✅\n\n` +
      `A sua Nota Fiscal Eletrônica já está em processamento e será disponibilizada no seu painel em breve.\n\n` +
      `Entraremos em contato novamente assim que sua encomenda for despachada. Grande abraço da equipe KingsHub!`
    await sendWhatsappMessage({ phone: profile.phone, message: msg })
  },

  async notify_customer_email(payload) {
    const { profile, order } = payload
    if (!profile?.email) return
    const nome = profile.full_name?.split(' ')[0] || 'Cliente'
    const shortId = order.id.split('-')[0]
    await sendEmailMessage({
      to: profile.email,
      subject: `Pagamento Confirmado - Pedido #${shortId}`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;border:1px solid #eaeaea;border-radius:8px;overflow:hidden;">
          <div style="background-color:#00e5ff;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">Pagamento Confirmado!</h1>
          </div>
          <div style="padding:30px;">
            <p style="font-size:16px;">Fala <strong>${nome}</strong>,</p>
            <p style="font-size:16px;line-height:1.5;">O pagamento do seu pedido <strong>#${shortId}</strong> foi recebido e processado com sucesso.</p>
            <div style="margin:30px 0;padding:20px;background-color:#f7f9fa;border-radius:6px;">
              <h3 style="margin-top:0;color:#111;">Sua Nota Fiscal</h3>
              <p style="font-size:14px;color:#555;margin-bottom:0;">A NF-e está sendo processada e ficará disponível no seu painel em breve.</p>
            </div>
            <p style="font-size:15px;color:#666;">Avisaremos quando a transportadora embalar o seu pacote.</p>
            <p style="font-size:15px;margin-bottom:0;"><strong>Aperte os cintos,</strong></p>
            <p style="font-size:14px;margin-top:5px;color:#00e5ff;font-weight:bold;">Equipe KingsHub</p>
          </div>
        </div>`,
    })
  },

  async notify_admin_email(payload) {
    const { profile, order } = payload
    const shortId = order.id.split('-')[0]
    await sendEmailMessage({
      to: ['contato@kingssimuladores.com.br', 'Fernando.Albertoni@kingssimuladores.com.br'],
      subject: `💰 Nova Venda! Pedido #${shortId} aprovado`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;border:1px solid #eaeaea;border-radius:8px;overflow:hidden;">
          <div style="background-color:#22c55e;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">💰 Nova Venda Realizada!</h1>
          </div>
          <div style="padding:30px;">
            <p><strong>Pedido:</strong> #${shortId}</p>
            <p><strong>Loja:</strong> ${(order.brand_origin || 'kings').toUpperCase()}</p>
            <p><strong>Total:</strong> R$ ${Number(order.total).toFixed(2)}</p>
            <p><strong>Cliente:</strong> ${profile?.full_name || '—'} (${profile?.email || '—'})</p>
            <p><strong>CPF:</strong> ${profile?.cpf_cnpj || '—'}</p>
            <p><strong>Telefone:</strong> ${profile?.phone || '—'}</p>
            <p style="margin-top:20px;">Acesse o painel para separação e geração da etiqueta.</p>
          </div>
        </div>`,
    })
  },

  async msu_split(payload, supabase) {
    const { order, items } = payload
    if (!order.preference_id) return

    for (const item of items) {
      const origin = item.store_origin || order.brand_origin
      if (origin !== 'msu' || !item.product?.seller_id) continue

      // Buscar registro de marketplace_orders criado no checkout
      const { data: mpOrder } = await supabase
        .from('marketplace_orders')
        .select('id, kings_fee, seller_net, seller_id')
        .eq('listing_id', item.product_id)
        .eq('mp_preference_id', order.preference_id)
        .single()

      if (!mpOrder) continue

      // Buscar configurações de Split do Fernando
      const { data: splitSetting } = await supabase.from('system_settings').select('value').eq('key', 'msu_fernando_split').single()
      const fernandoAccountId = splitSetting?.value?.account_id
      
      // 1. Marcar marketplace_order como pago
      await supabase
        .from('marketplace_orders')
        .update({ status: 'paid', mp_payment_id: payload.paymentId })
        .eq('id', mpOrder.id)

      // 2. Registrar comissão no subledger contábil
      await supabase.from('commissions').insert({
        marketplace_order_id: mpOrder.id,
        seller_id: mpOrder.seller_id,
        sale_amount: item.total_price,
        commission_rate: 15,
        commission_amount: mpOrder.kings_fee,
        seller_payout: mpOrder.seller_net,
        payout_status: 'pending',
      })

      // 3. Criar registro de repasse em escrow para o vendedor
      await supabase.from('payouts').insert({
        order_item_id: item.id,
        seller_id: mpOrder.seller_id,
        gross_amount: item.total_price,
        platform_fee_percent: 15,
        platform_fee_amount: mpOrder.kings_fee,
        net_amount: mpOrder.seller_net,
        status: 'held',
      })

      // 4. Criar registro de repasse da taxa para o Fernando (Disponível na hora)
      if (fernandoAccountId && mpOrder.kings_fee > 0) {
        await supabase.from('payouts').insert({
          order_item_id: item.id,
          seller_id: fernandoAccountId,
          gross_amount: mpOrder.kings_fee,
          platform_fee_percent: 0,
          platform_fee_amount: 0,
          net_amount: mpOrder.kings_fee,
          status: 'available', // Taxa da plataforma já fica disponível para o Admin/Fernando
        })
      }

      console.log(`[msu_split] Marketplace order ${mpOrder.id} pago. Vendedor: R$${mpOrder.seller_net}. Fernando: R$${mpOrder.kings_fee}`)
    }
  },

  async msu_seller_email(payload, supabase) {
    const { order, items } = payload
    const MSU_URL = process.env.NEXT_PUBLIC_URL_MSU || 'https://meusimuladorusado.com.br'

    for (const item of items) {
      const origin = item.store_origin || order.brand_origin
      if (origin !== 'msu' || !item.product?.seller_id) continue

      const { data: mpOrder } = await supabase
        .from('marketplace_orders')
        .select('seller_net, kings_fee')
        .eq('listing_id', item.product_id)
        .eq('mp_preference_id', order.preference_id)
        .single()

      const sellerPayout = mpOrder?.seller_net || 0

      const { data: sellerProfile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', item.product.seller_id)
        .single()

      if (!sellerProfile?.email) continue

      await sendEmailMessage({
        to: sellerProfile.email,
        subject: 'Vendido! Prepare o envio do seu equipamento 📦',
        html: `
<div style="font-family:Arial,sans-serif;background:#0A0A0A;padding:40px 20px;color:#fff;text-align:center;">
  <div style="max-width:600px;margin:0 auto;background:#111;border:1px solid rgba(232,0,45,0.2);border-radius:12px;padding:30px;">
    <div style="font-size:40px;margin-bottom:10px;">📦</div>
    <h1 style="color:#fff;margin-bottom:10px;">Vendido!</h1>
    <p style="color:#a1a1aa;font-size:16px;line-height:1.6;">
      Alguém acaba de comprar o seu <strong>${item.product?.title || 'item'}</strong> no MeuSimuladorUsado!
    </p>
    <div style="background:rgba(255,255,255,0.02);border:1px dashed rgba(255,255,255,0.1);border-radius:8px;padding:20px;margin:30px 0;">
      <p style="margin:0;color:#71717a;font-size:14px;">Você vai receber:</p>
      <h2 style="margin:5px 0 0 0;color:#22c55e;font-size:28px;">R$ ${sellerPayout.toFixed(2).replace('.', ',')}</h2>
    </div>
    <a href="${MSU_URL}/usado/dashboard" style="display:inline-block;background:#E8002D;color:#fff;text-decoration:none;padding:15px 30px;border-radius:8px;font-weight:bold;font-size:16px;">
      Ver Dados de Envio
    </a>
  </div>
</div>`,
      })
    }
  },
}

export async function GET(req: Request) {
  // 1. Validar autenticação do Vercel Cron via Header
  const authHeader = req.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Rescue: jobs presos em 'processing' há mais de 5 minutos são devolvidos para 'pending'.
  // Isso acontece quando o Cron é reiniciado (novo deploy, timeout da Vercel) antes de um
  // job lento (ex: Olist) terminar — sem este rescue, eles ficam presos para sempre.
  const staleThreshold = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  await supabase
    .from('order_jobs')
    .update({ status: 'pending' })
    .eq('status', 'processing')
    .lt('updated_at', staleThreshold)

  // Puxar batch de jobs pendentes, os mais antigos primeiro
  const { data: jobs, error } = await supabase
    .from('order_jobs')
    .select('id, order_id, job_type, retry_count, payload')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (error) {
    console.error('[Cron Jobs] Erro ao buscar jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 })
  }

  // Marcar todos como 'processing' em lote antes de executar (evita duplo-processamento).
  // updated_at é atualizado aqui para que o rescue saiba quando este lock foi adquirido.
  const jobIds = jobs.map((j: any) => j.id)
  await supabase
    .from('order_jobs')
    .update({ status: 'processing', updated_at: new Date().toISOString() })
    .in('id', jobIds)

  const results = { done: 0, failed: 0, dead: 0 }

  for (const job of jobs) {
    const handler = JOB_HANDLERS[job.job_type]

    if (!handler) {
      console.warn(`[Cron Jobs] Tipo desconhecido: ${job.job_type}. Marcando como dead.`)
      await supabase
        .from('order_jobs')
        .update({ status: 'dead', error_log: `Handler não encontrado para tipo: ${job.job_type}`, processed_at: new Date().toISOString() })
        .eq('id', job.id)
      results.dead++
      continue
    }

    try {
      await handler(job.payload, supabase)
      await supabase
        .from('order_jobs')
        .update({ status: 'done', processed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', job.id)
      results.done++
      console.log(`[Cron Jobs] ✅ ${job.job_type} | Pedido ${job.order_id}`)
    } catch (err: any) {
      const newRetryCount = (job.retry_count || 0) + 1
      const isDead = newRetryCount >= MAX_RETRIES

      await supabase
        .from('order_jobs')
        .update({
          status: isDead ? 'dead' : 'pending',
          retry_count: newRetryCount,
          error_log: err?.message || 'Erro desconhecido',
          processed_at: isDead ? new Date().toISOString() : null,
        })
        .eq('id', job.id)

      console.error(`[Cron Jobs] ❌ ${job.job_type} | Pedido ${job.order_id} | Tentativa ${newRetryCount}/${MAX_RETRIES}:`, err?.message)
      isDead ? results.dead++ : results.failed++
    }
  }

  console.log(`[Cron Jobs] Batch concluído — done: ${results.done}, retry: ${results.failed}, dead: ${results.dead}`)
  return NextResponse.json({ ok: true, ...results })
}
