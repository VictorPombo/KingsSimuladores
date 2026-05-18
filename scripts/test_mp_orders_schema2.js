require('dotenv').config({ path: 'apps/site/.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Direct REST API for PostgREST to query a single row, or just intentionally fail an insert to see fields
  const { data, error } = await supabase.from('marketplace_orders').insert({id: 'test'}).select('*')
  console.log(error)
}
run()
