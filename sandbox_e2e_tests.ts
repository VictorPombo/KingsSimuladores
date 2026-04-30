import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const WEBHOOK_URL = 'http://localhost:3001/api/webhooks/mercadopago?topic=payment'

async function triggerWebhook(paymentId: string) {
  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'payment.created', data: { id: paymentId } })
  })
  return res.status
}

async function runTests() {
  console.log('--- STARTING E2E WEBHOOK SANDBOX TESTS ---\n')

  const profileId = 'ae8f8bc9-dc8f-470d-b6f1-839a51d679a9'

  // TEST 1: Kings B2C Success
  const { data: kOrder, error: kErr } = await supabase.from('orders').insert({
    customer_id: profileId, brand_origin: 'kings', subtotal: 100, shipping_cost: 0, total: 100, status: 'pending', shipping_address: {}
  }).select('id').single()

  console.log(`[TEST 1] Kings B2C Approved (Order: ${kOrder?.id}, Error: ${kErr?.message})`)
  if (kOrder) {
    await triggerWebhook(`mockpay_${kOrder.id}`)
    await new Promise(r => setTimeout(r, 2000))
    const { data: kCheck } = await supabase.from('orders').select('status, erp_id').eq('id', kOrder.id).single()
    console.log(`Result: Status is ${kCheck?.status} | ERP_ID: ${kCheck?.erp_id || 'NONE'}`)
  }

  // TEST 2: Kings B2C Rejected
  const { data: kRejOrder } = await supabase.from('orders').insert({
    customer_id: profileId, brand_origin: 'kings', subtotal: 100, shipping_cost: 0, total: 100, status: 'pending', shipping_address: {}
  }).select('id').single()

  console.log(`\n[TEST 2] Kings B2C Rejected (Order: ${kRejOrder?.id})`)
  if (kRejOrder) {
    await triggerWebhook(`mockrej_${kRejOrder.id}`)
    await new Promise(r => setTimeout(r, 1000))
    const { data: krCheck } = await supabase.from('orders').select('status').eq('id', kRejOrder.id).single()
    console.log(`Result: Status is ${krCheck?.status} (Should be pending)`)
  }

  // TEST 3: Seven Sim Racing Success
  const { data: sOrder } = await supabase.from('orders').insert({
    customer_id: profileId, brand_origin: 'seven', subtotal: 200, shipping_cost: 0, total: 200, status: 'pending', shipping_address: {}
  }).select('id').single()

  console.log(`\n[TEST 3] Seven Sim Racing Approved (Order: ${sOrder?.id})`)
  if (sOrder) {
    await triggerWebhook(`mockpay_${sOrder.id}`)
    await new Promise(r => setTimeout(r, 2000))
    const { data: sCheck } = await supabase.from('orders').select('status, erp_id').eq('id', sOrder.id).single()
    console.log(`Result: Status is ${sCheck?.status} | ERP_ID: ${sCheck?.erp_id || 'NONE'}`)
  }

  // TEST 4: MSU Marketplace Success
  const { data: mOrder } = await supabase.from('orders').insert({
    customer_id: profileId, brand_origin: 'msu', subtotal: 50, shipping_cost: 0, total: 50, status: 'pending', shipping_address: {}
  }).select('id').single()
  
  console.log(`\n[TEST 4] MSU Marketplace Approved (Order: ${mOrder?.id})`)
  if (mOrder) {
    await triggerWebhook(`mockpay_${mOrder.id}`)
    await new Promise(r => setTimeout(r, 1000))
    const { data: mCheck } = await supabase.from('orders').select('status').eq('id', mOrder.id).single()
    console.log(`Result: Status is ${mCheck?.status}`)
  }

  // TEST 5: Duplicate Webhook Prevention
  if (kOrder) {
    console.log(`\n[TEST 6] Duplicate Webhook Attempt (Order: ${kOrder.id})`)
    const statusDup = await triggerWebhook(`mockpay_${kOrder.id}`)
    console.log(`Webhook HTTP Status returned: ${statusDup} (Check console logs for 'já processado')`)
  }

  console.log('\n--- TESTS COMPLETED ---')
  process.exit(0)
}
runTests()
