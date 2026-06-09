import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data: orders } = await supabase
    .from('orders')
    .select('id, customer_id, profiles!inner(full_name, email)')
    .like('profiles.email', 'qa-guest%')
  
  if (!orders || orders.length === 0) {
    console.log('No QA orders found.')
    return
  }

  const orderIds = orders.map(o => o.id)
  const profileIds = [...new Set(orders.map(o => o.customer_id))].filter(Boolean)

  console.log(`Found ${orderIds.length} QA orders to delete.`)
  console.log(`Found ${profileIds.length} QA profiles to delete.`)

  // Chunk deletion
  const chunkSize = 50
  for (let i = 0; i < orderIds.length; i += chunkSize) {
    const chunk = orderIds.slice(i, i + chunkSize)
    await supabase.from('order_items').delete().in('order_id', chunk)
    await supabase.from('invoices').delete().in('order_id', chunk)
    await supabase.from('orders').delete().in('id', chunk)
  }

  for (let i = 0; i < profileIds.length; i += chunkSize) {
    const chunk = profileIds.slice(i, i + chunkSize)
    await supabase.from('profiles').delete().in('id', chunk)
  }

  console.log('Successfully wiped QA data.')
}
run()
