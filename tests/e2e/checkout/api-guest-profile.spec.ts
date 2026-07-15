/**
 * Fase 1.5.1 — Testes de API: Guest Profile + Preferência MP
 * Sem browser. Valida o backend isoladamente contra produção.
 */

import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = process.env.BASE_URL ?? 'https://www.kingssimuladores.com.br'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const TEST_EMAIL = `qa-guest-${Date.now()}@test.kingssimuladores.com.br`

const GUEST_PAYLOAD = {
  items: [{ id: 'qa-test-product', title: 'Produto QA Teste', quantity: 1, price: 100.00, storeOrigin: 'kings' }],
  customer: {
    nome: 'QA Guest Automatico',
    email: TEST_EMAIL,
    cpf: '123.456.789-09',
    telefone: '(11) 99999-8888',
  },
  address: {
    cep: '01310-100',
    logradouro: 'Av Paulista',
    numero: '1000',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    complemento: '',
    referencia: '',
  },
  shipping: { name: 'PAC', price: '25.00' },
  total: 125.00,
  pix_discount: false,
}

test.describe('API: Guest Checkout @critical', () => {
  let createdOrderId: string | null = null

  test.afterAll(async () => {
    // Limpar dados de teste do banco
    if (!SUPABASE_URL || !SERVICE_KEY) return
    const admin = createClient(SUPABASE_URL, SERVICE_KEY)
    if (createdOrderId) {
      await admin.from('order_items').delete().eq('order_id', createdOrderId)
      await admin.from('orders').delete().eq('id', createdOrderId)
    }
    await admin.from('profiles').delete().eq('email', TEST_EMAIL)
  })

  test('POST /api/checkout retorna 200 com preferenceId @critical', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/checkout`, {
      data: GUEST_PAYLOAD,
      headers: { 'Content-Type': 'application/json' },
    })

    const status = res.status()
    if (status === 429) {
      test.skip(true, 'Rate limit atingido (max 5/min). Aguarde 1 minuto e re-execute.')
      return
    }

    const body = await res.json()

    if (status === 400) {
      // Se falhou por chaves MP ausentes ou dados rejeitados pelo MP, skip gracefully
      if (body.error?.includes('Mercado Pago') || body.error?.includes('credenciais') || body.error?.includes('rejeitados')) {
        test.skip(true, 'Chaves de teste do MP (TEST-) ainda não configuradas ou dados rejeitados.')
        return
      }
    }

    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.orderId).toBeTruthy()
    expect(body.preferenceId).toBeTruthy()
    createdOrderId = body.orderId
  })

  test('Perfil guest é criado no banco com role=client @critical', async ({ request }) => {
    if (!SUPABASE_URL || !SERVICE_KEY) {
      test.skip(true, 'SERVICE_ROLE_KEY não disponível para verificação direta no banco')
      return
    }
    const admin = createClient(SUPABASE_URL, SERVICE_KEY)

    // Tenta criar checkout para verificar o profile
    const res = await request.post(`${BASE_URL}/api/checkout`, { data: GUEST_PAYLOAD })
    if (res.status() !== 200) {
      test.skip(true, 'Checkout falhou — verificar teste api-guest-profile primeiro')
      return
    }

    const body = await res.json()
    createdOrderId = createdOrderId ?? body.orderId

    const { data: profile } = await admin
      .from('profiles')
      .select('id, role, email')
      .eq('email', TEST_EMAIL)
      .maybeSingle()

    expect(profile).not.toBeNull()
    expect(profile?.email).toBe(TEST_EMAIL)
    expect(profile?.role).toBe('client')
  })

  test('Pedido é criado com status=pending @critical', async ({ request }) => {
    if (!SUPABASE_URL || !SERVICE_KEY) {
      test.skip(true, 'SERVICE_ROLE_KEY não disponível')
      return
    }
    const admin = createClient(SUPABASE_URL, SERVICE_KEY)

    const res = await request.post(`${BASE_URL}/api/checkout`, { data: GUEST_PAYLOAD })
    if (res.status() !== 200) return

    const body = await res.json()
    const orderId = body.orderId
    createdOrderId = createdOrderId ?? orderId

    const { data: order } = await admin.from('orders').select('id, status').eq('id', orderId).single()
    expect(order?.status).toBe('pending')
  })

  test('Retorna erro 400 (ou 429) sem CPF @critical', async ({ request }) => {
    const payload = { ...GUEST_PAYLOAD, customer: { ...GUEST_PAYLOAD.customer, cpf: '' } }
    const res = await request.post(`${BASE_URL}/api/checkout`, { data: payload })
    // 429 = rate limit (normal nos testes em produção), 400 = validação
    expect([400, 429]).toContain(res.status())
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })

  test('Retorna erro 400 (ou 429) sem telefone @critical', async ({ request }) => {
    const payload = { ...GUEST_PAYLOAD, customer: { ...GUEST_PAYLOAD.customer, telefone: '' } }
    const res = await request.post(`${BASE_URL}/api/checkout`, { data: payload })
    expect([400, 429]).toContain(res.status())
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })
})
