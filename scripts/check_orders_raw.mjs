import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .limit(1)
  
  if (error) console.error(error)
  else console.log(Object.keys(orders[0] || {}))
}
run()
