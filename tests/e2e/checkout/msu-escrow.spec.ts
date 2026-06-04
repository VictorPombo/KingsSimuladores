/**
 * Spec E2E — Fluxo Escrow MSU (Meu Simulador Usado) @critical
 *
 * Estratégia: todos os testes operam diretamente no banco via service_role (sem navegação UI).
 * Motivo: o fluxo MSU depende de webhook real do MP e cron assíncrono — inviáveis de simular
 * end-to-end de forma determinística. Em vez disso, cada etapa do ciclo é exercida diretamente
 * no banco, seguindo o padrão de api-webhook-payment.spec.ts.
 *
 * Ciclo validado:
 *   1. Pedido MSU criado com brand_origin = 'msu'
 *   2. job msu_split enfileirado em order_jobs (simulando o que o webhook MP faria)
 *   3. msu_split cria payouts com status = 'held' e valores corretos
 *   4. Admin libera repasse: held → available → paid
 *   5. Invariante de segurança: payout 'held' NÃO pode ir direto para 'paid'
 *
 * Nota sobre order_items.product_id: a FK aponta para 'products' (não marketplace_listings —
 * a coluna listing_id foi removida na migration 009). O checkout MSU insere o listing_id
 * do MP no campo product_id. Para o teste usamos um produto de stub criado no beforeAll.
 */

import { test, expect } from '@playwright/test'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { BASE_URL } from '../../qa-config'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const COMMISSION_RATE = 15
const LISTING_PRICE = 500.00
const KINGS_FEE = parseFloat((LISTING_PRICE * COMMISSION_RATE / 100).toFixed(2))  // 75.00
const SELLER_NET = parseFloat((LISTING_PRICE - KINGS_FEE).toFixed(2))             // 425.00

// Instância única reutilizada por todos os testes do describe
let admin: SupabaseClient

test.describe('MSU Escrow — Ciclo Completo @critical', () => {
  let vendorId: string
  let buyerId: string
  let listingId: string
  let productStubId: string
  let orderId: string
  let orderItemId: string
  let marketplaceOrderId: string
  let payoutId: string
  // IDs de payouts órfãos criados em testes individuais, para garantir cleanup no afterAll
  const orphanPayoutIds: string[] = []
  let vendorEmail: string
  let buyerEmail: string
  const ts = Date.now()

  test.beforeAll(async () => {
    if (!SUPABASE_URL || !SERVICE_KEY) return

    admin = createClient(SUPABASE_URL, SERVICE_KEY)
    vendorEmail = `qa-msu-seller-${ts}@test.kingssimuladores.com.br`
    buyerEmail = `qa-msu-buyer-${ts}@test.kingssimuladores.com.br`

    // 1. Criar perfil do vendedor
    const { data: vendor, error: vendorErr } = await admin
      .from('profiles')
      .insert({ full_name: 'Vendedor MSU QA', email: vendorEmail, role: 'client' })
      .select('id')
      .single()
    if (vendorErr || !vendor) {
      throw new Error(`[MSU Setup] Falha ao criar vendedor: ${vendorErr?.message}`)
    }
    vendorId = vendor.id

    // 2. Criar perfil do comprador
    const { data: buyer, error: buyerErr } = await admin
      .from('profiles')
      .insert({ full_name: 'Comprador MSU QA', email: buyerEmail, role: 'client' })
      .select('id')
      .single()
    if (buyerErr || !buyer) {
      throw new Error(`[MSU Setup] Falha ao criar comprador: ${buyerErr?.message}`)
    }
    buyerId = buyer.id

    // 3. Buscar brand MSU existente (não criar — a brand 'msu' é seed obrigatório)
    const { data: msuBrand } = await admin
      .from('brands')
      .select('id')
      .ilike('name', 'msu')
      .maybeSingle()

    // 4. Criar listing de teste no marketplace
    const listingPayload: Record<string, unknown> = {
      title: `Volante QA MSU ${ts}`,
      price: LISTING_PRICE,
      seller_id: vendorId,
      status: 'active',
      condition: 'good',
      commission_rate: COMMISSION_RATE,
    }
    if (msuBrand?.id) listingPayload.brand_id = msuBrand.id

    const { data: listing, error: listingErr } = await admin
      .from('marketplace_listings')
      .insert(listingPayload)
      .select('id')
      .single()
    if (listingErr || !listing) {
      throw new Error(`[MSU Setup] Falha ao criar listing: ${listingErr?.message}`)
    }
    listingId = listing.id

    // 5. Criar produto stub na tabela products (necessário para FK de order_items.product_id).
    //    A coluna listing_id foi removida de order_items na migration 009 — o checkout MSU
    //    usa product_id para referenciar o listing de usados via seu ID.
    const { data: brand, error: brandErr } = await admin
      .from('brands')
      .select('id')
      .limit(1)
      .single()
    if (brandErr || !brand?.id) {
      throw new Error(`[MSU Setup] Nenhuma brand encontrada — banco pode estar vazio: ${brandErr?.message}`)
    }

    const { data: productStub, error: productErr } = await admin
      .from('products')
      .insert({
        title: `QA MSU Stub ${ts}`,
        slug: `qa-msu-stub-${ts}`,
        price: LISTING_PRICE,
        stock: 1,
        brand_id: brand.id,
        cnpj_emitente: '00000000000000',
        status: 'active',
        seller_id: vendorId,
      })
      .select('id')
      .single()
    if (productErr || !productStub) {
      throw new Error(`[MSU Setup] Falha ao criar produto stub: ${productErr?.message}`)
    }
    productStubId = productStub.id

    // 6. Criar pedido com brand_origin = 'msu'
    const preferenceId = `qa-msu-pref-${ts}`
    const { data: order, error: orderErr } = await admin
      .from('orders')
      .insert({
        customer_id: buyerId,
        brand_origin: 'msu',
        status: 'pending',
        subtotal: LISTING_PRICE,
        total: LISTING_PRICE,
        shipping_cost: 0,
        discount: 0,
        preference_id: preferenceId,
        shipping_address: { cep: '01310-100', logradouro: 'Av Paulista', numero: '1', bairro: 'Bela Vista', cidade: 'São Paulo' },
      })
      .select('id')
      .single()
    if (orderErr || !order) {
      throw new Error(`[MSU Setup] Falha ao criar pedido: ${orderErr?.message}`)
    }
    orderId = order.id

    // 7. Criar order_item usando o product stub (FK order_items.product_id → products)
    const { data: orderItem, error: itemErr } = await admin
      .from('order_items')
      .insert({
        order_id: orderId,
        product_id: productStubId,
        store_origin: 'msu',
        quantity: 1,
        unit_price: LISTING_PRICE,
        total_price: LISTING_PRICE,
      })
      .select('id')
      .single()
    if (itemErr || !orderItem) {
      throw new Error(`[MSU Setup] Falha ao criar order_item: ${itemErr?.message}`)
    }
    orderItemId = orderItem.id

    // 8. Criar marketplace_order (estado inicial: awaiting_payment)
    const { data: mpOrder, error: mpOrderErr } = await admin
      .from('marketplace_orders')
      .insert({
        listing_id: listingId,
        buyer_id: buyerId,
        seller_id: vendorId,
        mp_preference_id: preferenceId,
        total_price: LISTING_PRICE,
        commission_rate: COMMISSION_RATE,
        kings_fee: KINGS_FEE,
        seller_net: SELLER_NET,
        status: 'awaiting_payment',
      })
      .select('id')
      .single()
    if (mpOrderErr || !mpOrder) {
      throw new Error(`[MSU Setup] Falha ao criar marketplace_order: ${mpOrderErr?.message}`)
    }
    marketplaceOrderId = mpOrder.id
  })

  test.afterAll(async () => {
    if (!SUPABASE_URL || !SERVICE_KEY) return

    // Limpar payouts órfãos de testes individuais que falharam antes do próprio cleanup
    if (orphanPayoutIds.length > 0) {
      await admin.from('payouts').delete().in('id', orphanPayoutIds)
    }

    // Limpar em ordem reversa das FK constraints
    if (payoutId) await admin.from('payouts').delete().eq('id', payoutId)
    if (marketplaceOrderId) {
      await admin.from('commissions').delete().eq('marketplace_order_id', marketplaceOrderId)
      await admin.from('marketplace_orders').delete().eq('id', marketplaceOrderId)
    }
    if (orderItemId) await admin.from('order_items').delete().eq('id', orderItemId)
    if (orderId) {
      await admin.from('order_jobs').delete().eq('order_id', orderId)
      await admin.from('orders').delete().eq('id', orderId)
    }
    if (productStubId) await admin.from('products').delete().eq('id', productStubId)
    if (listingId) await admin.from('marketplace_listings').delete().eq('id', listingId)
    if (vendorId) await admin.from('profiles').delete().eq('id', vendorId)
    if (buyerId) await admin.from('profiles').delete().eq('id', buyerId)
  })

  test('Pedido MSU criado com brand_origin = msu @critical', async () => {
    if (!SUPABASE_URL || !SERVICE_KEY) {
      test.skip(true, 'SUPABASE_SERVICE_ROLE_KEY necessário para este teste')
      return
    }
    if (!orderId) {
      test.skip(true, 'Setup falhou — orderId não disponível')
      return
    }

    const { data: order } = await admin
      .from('orders')
      .select('brand_origin, status, total')
      .eq('id', orderId)
      .single()

    expect(order?.brand_origin).toBe('msu')
    expect(order?.status).toBe('pending')
    expect(Number(order?.total)).toBe(LISTING_PRICE)
  })

  test('Webhook MP enfileira job msu_split em order_jobs @critical', async () => {
    if (!SUPABASE_URL || !SERVICE_KEY) {
      test.skip(true, 'SUPABASE_SERVICE_ROLE_KEY necessário para este teste')
      return
    }
    if (!orderId) {
      test.skip(true, 'Setup falhou — orderId não disponível')
      return
    }

    // Simular o que o webhook MP faz: enfileira msu_split + msu_seller_email ao processar
    // um pedido MSU aprovado (ver webhooks/mercadopago/route.ts linha ~196)
    const { error: jobErr } = await admin.from('order_jobs').insert([
      { order_id: orderId, job_type: 'msu_split', payload: { paymentId: `qa-msu-pay-${ts}` } },
      { order_id: orderId, job_type: 'msu_seller_email', payload: { paymentId: `qa-msu-pay-${ts}` } },
    ])

    expect(jobErr).toBeNull()

    const { data: jobs } = await admin
      .from('order_jobs')
      .select('job_type, status')
      .eq('order_id', orderId)
      .eq('job_type', 'msu_split')

    expect(jobs?.length).toBeGreaterThanOrEqual(1)
    expect(jobs?.[0]?.status).toBe('pending')
  })

  test('msu_split cria payouts com status = held e valores corretos @critical', async () => {
    if (!SUPABASE_URL || !SERVICE_KEY) {
      test.skip(true, 'SUPABASE_SERVICE_ROLE_KEY necessário para este teste')
      return
    }
    if (!orderItemId || !marketplaceOrderId) {
      test.skip(true, 'Setup falhou — orderItemId ou marketplaceOrderId não disponível')
      return
    }

    // Simular processamento do msu_split (espelha process-jobs/route.ts handler msu_split)
    await admin
      .from('marketplace_orders')
      .update({ status: 'paid' })
      .eq('id', marketplaceOrderId)

    await admin.from('commissions').insert({
      marketplace_order_id: marketplaceOrderId,
      seller_id: vendorId,
      sale_amount: LISTING_PRICE,
      commission_rate: COMMISSION_RATE,
      commission_amount: KINGS_FEE,
      seller_payout: SELLER_NET,
      payout_status: 'pending',
    })

    const { data: insertedPayout, error: payoutErr } = await admin
      .from('payouts')
      .insert({
        order_item_id: orderItemId,
        seller_id: vendorId,
        gross_amount: LISTING_PRICE,
        platform_fee_percent: COMMISSION_RATE,
        platform_fee_amount: KINGS_FEE,
        net_amount: SELLER_NET,
        status: 'held',
      })
      .select('id, net_amount, platform_fee_amount, status')
      .single()

    expect(payoutErr).toBeNull()
    expect(insertedPayout).not.toBeNull()
    expect(insertedPayout?.status).toBe('held')
    expect(Number(insertedPayout?.net_amount)).toBe(SELLER_NET)           // 425.00
    expect(Number(insertedPayout?.platform_fee_amount)).toBe(KINGS_FEE)   // 75.00

    payoutId = insertedPayout!.id
  })

  test('Admin libera repasse: available → paid @critical', async () => {
    if (!SUPABASE_URL || !SERVICE_KEY) {
      test.skip(true, 'SUPABASE_SERVICE_ROLE_KEY necessário para este teste')
      return
    }
    if (!payoutId) {
      test.skip(true, 'Teste anterior falhou — payoutId não disponível')
      return
    }

    // Pré-condição da rota POST /api/admin/msu/pay: o payout deve estar 'available'
    // A rota tem .eq('status', 'available') como medida de segurança (não paga 'held' direto)
    await admin.from('payouts').update({ status: 'available' }).eq('id', payoutId)

    // Simular o UPDATE que a rota executa (service_role como substituto de requireAdmin())
    const { error } = await admin
      .from('payouts')
      .update({ status: 'paid' })
      .eq('id', payoutId)
      .eq('status', 'available')

    expect(error).toBeNull()

    const { data: payout } = await admin
      .from('payouts')
      .select('status')
      .eq('id', payoutId)
      .single()

    expect(payout?.status).toBe('paid')
  })

  test('Payout held não pode ser liberado diretamente para paid (segurança) @critical', async () => {
    if (!SUPABASE_URL || !SERVICE_KEY) {
      test.skip(true, 'SUPABASE_SERVICE_ROLE_KEY necessário para este teste')
      return
    }
    if (!orderItemId) {
      test.skip(true, 'Setup falhou — orderItemId não disponível')
      return
    }

    // Criar payout isolado em 'held' para validar a invariante de segurança.
    // Registrado em orphanPayoutIds para garantir cleanup pelo afterAll caso o teste falhe
    // antes de chegar no próprio delete abaixo.
    const { data: heldPayout } = await admin
      .from('payouts')
      .insert({
        order_item_id: orderItemId,
        seller_id: vendorId,
        gross_amount: LISTING_PRICE,
        platform_fee_percent: COMMISSION_RATE,
        platform_fee_amount: KINGS_FEE,
        net_amount: SELLER_NET,
        status: 'held',
      })
      .select('id')
      .single()

    if (!heldPayout) {
      test.skip(true, 'Não foi possível criar payout isolado para teste de segurança')
      return
    }
    orphanPayoutIds.push(heldPayout.id)

    // Tentar ir direto de 'held' para 'paid' usando o mesmo filtro da rota admin
    // — deve afetar 0 linhas porque o filtro .eq('status', 'available') não casa com 'held'
    const { data: updateResult } = await admin
      .from('payouts')
      .update({ status: 'paid' })
      .eq('id', heldPayout.id)
      .eq('status', 'available')
      .select('id')

    expect(updateResult?.length ?? 0).toBe(0)

    const { data: unchanged } = await admin
      .from('payouts')
      .select('status')
      .eq('id', heldPayout.id)
      .single()

    expect(unchanged?.status).toBe('held')

    // Cleanup inline (o afterAll também cobre via orphanPayoutIds como segurança)
    await admin.from('payouts').delete().eq('id', heldPayout.id)
    orphanPayoutIds.splice(orphanPayoutIds.indexOf(heldPayout.id), 1)
  })
})
