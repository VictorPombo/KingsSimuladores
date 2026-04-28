import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, brand_origin')
    .limit(5)

  if (ordersError || !orders || orders.length === 0) {
    console.error('Error fetching orders:', ordersError || 'No orders found')
    process.exit(1)
  }

  console.log(`Found ${orders.length} orders. Generating invoices...`)

  const invoices = orders.map((order, i) => {
    return {
      nfe_number: `0000${8900 + i}`,
      nfe_key: `352604000000000000005500100000${8900 + i}100000${8900 + i}0`,
      status: ['issued', 'pending', 'issued', 'cancelled', 'issued'][i % 5],
      xml_url: `https://kings-s3.example.com/xml/${order.id}.xml`,
      pdf_url: `https://kings-s3.example.com/pdf/${order.id}.pdf`,
      issued_at: new Date().toISOString(),
      cnpj_emitente: '12.345.678/0001-90',
      order_id: order.id,
    }
  })

  // clear existing invoices for freshness
  await supabase.from('invoices').delete().neq('id', 'uuid-non-existent')

  const { error: insertError } = await supabase
    .from('invoices')
    .insert(invoices)

  if (insertError) {
    console.error('Error inserting invoices:', insertError)
  } else {
    console.log('Successfully generated test invoices.')
  }
}

run()
