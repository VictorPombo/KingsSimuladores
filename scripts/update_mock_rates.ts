import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: 'apps/site/.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function run() {
  // Find the mocked orders
  const { data: orders } = await supabase.from('marketplace_orders').select('*').in('total_price', [3500, 1200]).order('created_at', { ascending: false }).limit(2)
  
  if (orders) {
    for (const order of orders) {
      const rate = 13;
      const total = order.total_price;
      const fee = (total * rate) / 100;
      const net = total - fee;
      
      await supabase.from('marketplace_orders').update({
        commission_rate: rate,
        kings_fee: fee,
        seller_net: net
      }).eq('id', order.id)
      console.log(`Updated Order ${order.id}: Total ${total}, Rate ${rate}%, Fee ${fee}, Net ${net}`)
    }
  }
}

run().catch(console.error)
