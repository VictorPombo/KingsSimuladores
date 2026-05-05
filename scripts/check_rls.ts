import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: 'apps/site/.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function check() {
  const { data } = await supabase.rpc('get_policies_for_table', { p_table_name: 'marketplace_orders' }).catch(async () => {
    // If rpc doesn't exist, we can use raw query via the postgres function but supabase js doesn't allow direct query execution.
    // I will write a simpler postgres query via psql, oh wait I don't have psql.
    return { data: 'rpc failed' }
  })
  console.log(data)
}
check()
