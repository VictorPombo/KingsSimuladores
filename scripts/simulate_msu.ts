import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  // 1. Get a buyer and a seller
  const { data: users } = await supabase.from('profiles').select('id, email').limit(2)
  if (!users || users.length < 2) throw new Error('Not enough users')
  const buyer = users[0]
  const seller = users[1]

  // 2. Create a fake marketplace listing
  const { data: listing, error: lErr } = await supabase.from('marketplace_listings').insert({
    seller_id: seller.id,
    title: 'Simulador Teste Webhook',
    price: 1000,
    status: 'active',
    condition: 'used',
    category_id: null
  }).select('id').single()
  
  if (lErr) throw lErr
  console.log('Created Listing:', listing.id)

  const prefId = 'pref_mock_' + Date.now()

  // 3. Create a fake order
  const { data: order, error: oErr } = await supabase.from('orders').insert({
    user_id: buyer.id,
    total_amount: 1000,
    status: 'pending',
    payment_method: 'mercadopago',
    preference_id: prefId,
    brand_origin: 'msu'
  }).select('id').single()

  if (oErr) throw oErr
  console.log('Created Order:', order.id)

  // 4. Create order_items
  await supabase.from('order_items').insert({
    order_id: order.id,
    product_id: listing.id,
    quantity: 1,
    price: 1000,
    store_origin: 'msu'
  })

  // 5. Create marketplace_orders
  await supabase.from('marketplace_orders').insert({
    order_id: order.id,
    buyer_id: buyer.id,
    seller_id: seller.id,
    listing_id: listing.id,
    total_price: 1000,
    commission_rate: 15,
    kings_fee: 150,
    seller_net: 850,
    status: 'awaiting_payment',
    mp_preference_id: prefId
  })
  console.log('Created Marketplace Order')

  // 6. Call the Webhook!
  const url = 'http://localhost:3000/api/webhooks/mercadopago'
  const payload = {
    action: "payment.updated",
    type: "payment",
    data: { id: "mock_payment_" + Date.now() }
  }
  
  // We need to mock Mercado Pago API response as well, because the webhook will fetch the payment from MP API.
  // Wait! The webhook does:
  // const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`...
  // This will fail because the payment ID is fake!
  console.log('Preference ID:', prefId)
}

run().catch(console.error)
