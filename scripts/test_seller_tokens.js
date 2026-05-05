require('dotenv').config({ path: 'apps/site/.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: cols, error } = await supabase.rpc('get_table_columns', { table_name: 'profiles' })
  // If rpc fails, we just query one row
  const { data: profile } = await supabase.from('profiles').select('*').limit(1)
  console.log(profile ? Object.keys(profile[0] || {}) : 'no profiles')
}
run()
