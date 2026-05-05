require('dotenv').config({ path: 'apps/site/.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: cols, error } = await supabase.rpc('get_table_columns', { table_name: 'marketplace_orders' })
  if (error) {
    const { data } = await supabase.from('marketplace_orders').select('*').limit(1)
    console.log(data ? Object.keys(data[0] || {}) : 'no orders')
  } else {
    console.log(cols)
  }
}
run()
