import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function run() {
  const token = process.env.MP_ACCESS_TOKEN
  const res = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Idempotency-Key': Date.now().toString(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      transaction_amount: 10,
      payment_method_id: 'pix',
      payer: { email: 'qa@kings.com.br' },
      external_reference: 'KINGS-TEST-ORDER-123'
    })
  })
  const data = await res.json()
  console.log('Payment ID:', data.id)
  console.log('Status:', data.status)
}
run()
