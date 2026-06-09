import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log('Fetching QA profiles...')
  const { data: profiles, error: err1 } = await supabase
    .from('profiles')
    .select('id, email')
    .ilike('email', 'qa-guest-%')
  
  if (err1) {
    console.error('Error fetching profiles', err1)
    return
  }

  if (!profiles || profiles.length === 0) {
    console.log('No QA profiles found.')
    return
  }
  
  const profileIds = profiles.map(p => p.id)
  console.log(`Found ${profileIds.length} QA profiles. Deleting their orders...`)
  
  const { data: orders, error: err2 } = await supabase
    .from('orders')
    .select('id')
    .in('user_id', profileIds)
  
  if (orders && orders.length > 0) {
    const orderIds = orders.map(o => o.id)
    console.log(`Found ${orderIds.length} QA orders. Deleting items and invoices first...`)
    
    // Batch delete in chunks if needed, but for QA tests, it should be small enough
    await supabase.from('order_items').delete().in('order_id', orderIds)
    await supabase.from('invoices').delete().in('order_id', orderIds)
    
    console.log(`Deleting orders...`)
    await supabase.from('orders').delete().in('id', orderIds)
  }

  console.log(`Deleting ${profileIds.length} QA profiles...`)
  await supabase.from('profiles').delete().in('id', profileIds)
  
  console.log('Cleanup complete.')
}
run()
