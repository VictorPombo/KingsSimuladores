require('dotenv').config({ path: 'apps/site/.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function run() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const { error } = await supabase.from('marketplace_orders').insert({id: 'test'}).select('*')
  console.log(error)
}
run()
