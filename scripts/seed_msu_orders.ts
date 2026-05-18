import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: 'apps/site/.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function run() {
  const { data: users } = await supabase.from('profiles').select('id, full_name').limit(5)
  const buyer = users![0]
  const seller = users![1]

  const { data: listing } = await supabase.from('marketplace_listings').insert({
    seller_id: seller.id, title: 'Volante Simagic FX Pro (Teste MSU)', price: 3500, status: 'active', condition: 'good'
  }).select('id').single()
  
  const prefId = 'pref_mock_' + Date.now()

  // Directly insert into marketplace_orders
  await supabase.from('marketplace_orders').insert({
    order_id: null, buyer_id: buyer.id, seller_id: seller.id, listing_id: listing!.id, total_price: 3500, commission_rate: 15, kings_fee: 525, seller_net: 2975, status: 'completed', mp_preference_id: prefId
  })
  console.log('Created Marketplace Order 1 (Completed).')

  const prefId2 = 'pref_mock_2_' + Date.now()
  await supabase.from('marketplace_orders').insert({
    order_id: null, buyer_id: buyer.id, seller_id: seller.id, listing_id: listing!.id, total_price: 1200, commission_rate: 15, kings_fee: 180, seller_net: 1020, status: 'paid', mp_preference_id: prefId2
  })
  console.log('Created Marketplace Order 2 (Paid).')
}
run().catch(console.error)
