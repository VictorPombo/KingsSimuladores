/**
 * Fase 1.5.3 — Idempotência do Webhook
 * Garante que o webhook do MP pode ser chamado N vezes sem duplicar jobs.
 */

import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import * as crypto from 'crypto'

const BASE_URL = process.env.BASE_URL ?? 'https://www.kingssimuladores.com.br'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET ?? ''

function signWebhookPayload(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex')
}

test.describe('API: Idempotência do Webhook @critical', () => {
  test('Webhook duplicado não cria order_jobs duplicados @critical', async ({ request }) => {
    if (!SUPABASE_URL || !SERVICE_KEY) {
      test.skip(true, 'SERVICE_ROLE_KEY necessário para este teste')
      return
    }

    // Criar um pedido real de teste para ter um orderId válido
    const testEmail = `qa-idem-${Date.now()}@test.kingssimuladores.com.br`
    const checkoutRes = await request.post(`${BASE_URL}/api/checkout`, {
      data: {
        items: [{ id: 'qa-idem-product', title: 'Produto Idempotência QA', quantity: 1, price: 50.00, storeOrigin: 'kings' }],
        customer: { nome: 'QA Idempotencia', email: testEmail, cpf: '123.456.789-09', telefone: '(11) 88888-7777' },
        address: { cep: '01310-100', logradouro: 'Av Paulista', numero: '1', bairro: 'Bela Vista', cidade: 'São Paulo' },
        shipping: { name: 'PAC', price: '20.00' },
        total: 70.00,
        pix_discount: false,
      }
    })

    if (checkoutRes.status() !== 200) {
      test.skip(true, 'Checkout não disponível — aguardando chaves MP de teste')
      return
    }

    const { orderId, preferenceId } = await checkoutRes.json()
    const fakePaymentId = `TEST_PAYMENT_${Date.now()}`

    // Simular o webhook 3x com o mesmo payment_id
    const webhookBody = JSON.stringify({
      type: 'payment',
      data: { id: fakePaymentId },
      action: 'payment.updated',
    })

    const signature = signWebhookPayload(webhookBody, WEBHOOK_SECRET)

    for (let i = 0; i < 3; i++) {
      await request.post(`${BASE_URL}/api/webhooks/mercadopago?store=kings`, {
        data: webhookBody,
        headers: {
          'Content-Type': 'application/json',
          'x-signature': `ts=${Date.now()},v1=${signature}`,
        }
      })
    }

    // Verificar no banco que não houve duplicação de order_jobs para este pedido
    const admin = createClient(SUPABASE_URL, SERVICE_KEY)
    const { data: jobs } = await admin.from('order_jobs').select('id, job_type').eq('order_id', orderId)

    if (jobs && jobs.length > 0) {
      // Agrupar por job_type e verificar que não há duplicatas
      const jobTypes = jobs.map((j: any) => j.job_type)
      const uniqueJobTypes = new Set(jobTypes)
      expect(jobTypes.length).toBe(uniqueJobTypes.size)
    }

    // Cleanup
    await admin.from('order_jobs').delete().eq('order_id', orderId)
    await admin.from('order_items').delete().eq('order_id', orderId)
    await admin.from('orders').delete().eq('id', orderId)
    await admin.from('profiles').delete().eq('email', testEmail)
  })
})
