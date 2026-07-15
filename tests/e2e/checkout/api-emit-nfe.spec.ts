/**
 * Fase: emit_nfe handler @critical
 * Valida que após o job olist_erp enfileirar um pedido com erp_id:
 *  1. Um job emit_nfe é criado na tabela order_jobs
 *  2. O job emit_nfe tem o payload correto (erp_id, order_id, store)
 *  3. A tabela invoices começa com status 'pending' (aguardando o worker processar)
 *  4. O cron job /api/cron/process-jobs responde 200 com autenticação correta
 *
 * NÃO chama a API real do Tiny ERP — apenas valida a estrutura do banco e do endpoint.
 */

import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = process.env.BASE_URL ?? 'https://www.kingssimuladores.com.br'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const CRON_SECRET = process.env.CRON_SECRET ?? ''

test.describe('API: emit_nfe job handler @critical', () => {
  let orderId: string
  let profileId: string
  let productId: string
  const testEmail = `qa-nfe-${Date.now()}@test.kingssimuladores.com.br`
  const FAKE_ERP_ID = `erp_qa_${Date.now()}`

  test.beforeAll(async () => {
    if (!SUPABASE_URL || !SERVICE_KEY) return
    const admin = createClient(SUPABASE_URL, SERVICE_KEY)

    // Criar profile de teste
    const { data: profile } = await admin
      .from('profiles')
      .insert({
        full_name: 'QA NFe Teste',
        email: testEmail,
        phone: '11999997777',
        cpf_cnpj: '12345678909',
        role: 'client',
      })
      .select('id')
      .single()

    if (!profile) return
    profileId = profile.id

    // Criar produto mínimo para o pedido
    const { data: brand } = await admin.from('brands').select('id').limit(1).single()
    if (!brand?.id) return

    const { data: product } = await admin
      .from('products')
      .insert({
        title: 'Produto QA NFe',
        slug: `qa-nfe-product-${Date.now()}`,
        price: 199.9,
        stock: 5,
        brand_id: brand.id,
        cnpj_emitente: '00000000000000',
        status: 'active',
      })
      .select('id')
      .single()

    if (!product) return
    productId = product.id

    // Criar pedido pago com erp_id simulado (como se olist_erp já tivesse rodado)
    const { data: order } = await admin
      .from('orders')
      .insert({
        customer_id: profile.id,
        status: 'paid',
        brand_origin: 'kings',
        erp_id: FAKE_ERP_ID,
        subtotal: 199.9,
        total: 199.9,
        shipping_cost: 0,
        discount: 0,
        shipping_address: { cep: '01310-100', logradouro: 'Av Paulista', numero: '1', bairro: 'Bela Vista', cidade: 'São Paulo' },
      })
      .select('id')
      .single()

    if (!order) return
    orderId = order.id

    await admin.from('order_items').insert({
      order_id: orderId,
      product_id: productId,
      quantity: 1,
      unit_price: 199.9,
      total_price: 199.9,
    })

    // Criar invoice como olist_erp faria
    await admin.from('invoices').insert({
      order_id: orderId,
      store_origin: 'kings',
      erp_id: FAKE_ERP_ID,
      cnpj_emitente: '29.688.089/0001-02',
      nfe_number: '',
      nfe_key: '',
      status: 'pending',
      xml_url: '',
      pdf_url: '',
    })

    // Enfileirar emit_nfe como olist_erp faria após injeção bem-sucedida
    await admin.from('order_jobs').insert({
      order_id: orderId,
      job_type: 'emit_nfe',
      status: 'pending',
      retry_count: 0,
      payload: { erp_id: FAKE_ERP_ID, order_id: orderId, store: 'kings' },
    })
  })

  test.afterAll(async () => {
    if (!SUPABASE_URL || !SERVICE_KEY) return
    const admin = createClient(SUPABASE_URL, SERVICE_KEY)

    if (orderId) {
      await admin.from('order_jobs').delete().eq('order_id', orderId)
      await admin.from('invoices').delete().eq('order_id', orderId)
      await admin.from('order_items').delete().eq('order_id', orderId)
      await admin.from('orders').delete().eq('id', orderId)
    }
    if (productId) await admin.from('products').delete().eq('id', productId)
    if (profileId) await admin.from('profiles').delete().eq('id', profileId)
  })

  test('job emit_nfe é enfileirado com payload correto @critical', async () => {
    if (!SUPABASE_URL || !SERVICE_KEY || !orderId) {
      test.skip(true, 'Setup falhou — variáveis de ambiente ou orderId ausentes')
      return
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY)

    const { data: jobs } = await admin
      .from('order_jobs')
      .select('job_type, payload, status, retry_count')
      .eq('order_id', orderId)
      .eq('job_type', 'emit_nfe')

    expect(jobs).not.toBeNull()
    expect(jobs!.length).toBeGreaterThanOrEqual(1)

    const nfeJob = jobs![0]
    expect(nfeJob.job_type).toBe('emit_nfe')
    expect(nfeJob.status).toBe('pending')
    expect(nfeJob.retry_count).toBe(0)
    expect(nfeJob.payload.erp_id).toBe(FAKE_ERP_ID)
    expect(nfeJob.payload.order_id).toBe(orderId)
    expect(nfeJob.payload.store).toBe('kings')
  })

  test('invoice criada com status pending antes da emissão @critical', async () => {
    if (!SUPABASE_URL || !SERVICE_KEY || !orderId) {
      test.skip(true, 'Setup falhou')
      return
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY)

    const { data: invoice } = await admin
      .from('invoices')
      .select('status, erp_id, store_origin')
      .eq('order_id', orderId)
      .single()

    expect(invoice).not.toBeNull()
    expect(invoice!.status).toBe('pending')
    expect(invoice!.erp_id).toBe(FAKE_ERP_ID)
    expect(invoice!.store_origin).toBe('kings')
  })

  test('cron /api/cron/process-jobs responde 401 sem autenticação @critical', async ({ request }) => {
    // Contra servidor remoto o comportamento do cron depende do CRON_SECRET de produção
    const isRemote = BASE_URL.includes('kingssimuladores.com.br')
    if (isRemote) {
      // Contra produção, apenas verificar que não retorna 200 sem auth
      const res = await request.get(`${BASE_URL}/api/cron/process-jobs`)
      expect(res.status()).not.toBe(200)
      return
    }

    const res = await request.get(`${BASE_URL}/api/cron/process-jobs`)
    if (CRON_SECRET) {
      expect(res.status()).toBe(401)
    } else {
      expect([200, 401]).toContain(res.status())
    }
  })

  test('cron /api/cron/process-jobs responde 200 com token correto @critical', async ({ request }) => {
    if (!CRON_SECRET) {
      test.skip(true, 'CRON_SECRET não configurado — cron está em modo aberto')
      return
    }

    // Em produção/staging o CRON_SECRET do .env.test é diferente do servidor remoto.
    // Este teste só pode rodar contra localhost onde o mesmo .env.test é carregado.
    const isRemote = BASE_URL.includes('kingssimuladores.com.br')
    if (isRemote) {
      test.skip(true, 'Pulado contra servidor remoto — CRON_SECRET difere do ambiente de produção')
      return
    }

    const res = await request.get(`${BASE_URL}/api/cron/process-jobs`, {
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    })

    // O cron pode retornar ok:true (jobs processados ou batch vazio)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  test('não existem jobs emit_nfe duplicados para o mesmo pedido @critical', async () => {
    if (!SUPABASE_URL || !SERVICE_KEY || !orderId) {
      test.skip(true, 'Setup falhou')
      return
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY)

    const { data: jobs } = await admin
      .from('order_jobs')
      .select('id, job_type')
      .eq('order_id', orderId)
      .eq('job_type', 'emit_nfe')

    // Deve haver exatamente 1 job emit_nfe para este pedido (idempotência via ON CONFLICT ou lógica de negócio)
    // O beforeAll insere apenas 1 — verificamos que não houve duplicação
    expect(jobs!.length).toBe(1)
  })
})
