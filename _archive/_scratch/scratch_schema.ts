import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspect() {
  const { data: coupons } = await supabase.from('coupons').select('*').limit(1)
  console.log('Coupons:', coupons)

  const { data: orders } = await supabase.from('orders').select('*').limit(1)
  console.log('Orders:', orders)
}

inspect()
