import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data: orders } = await supabase
    .from('orders')
    .select('id, profiles!inner(full_name)')
    .like('profiles.full_name', 'QA Guest%')
  
  console.log(`Found ${orders?.length || 0} lingering QA orders via profile join.`)

  const { data: orders2 } = await supabase
    .from('orders')
    .select('id, profiles!inner(email)')
    .like('profiles.email', 'qa-guest%')
  
  console.log(`Found ${orders2?.length || 0} lingering QA orders via email join.`)
}
run()
