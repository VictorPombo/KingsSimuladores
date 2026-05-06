const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function check() {
  const { data } = await supabase.rpc('get_policies_for_table', { table_name: 'orders' });
  // If rpc doesn't exist, we can query pg_policies
  const { data: policies, error } = await supabase.from('pg_policies').select('*').eq('tablename', 'orders');
  if (error) {
     // pg_policies is usually blocked from API.
     console.log("Error fetching from pg_policies, probably blocked. Using raw SQL if possible.");
  } else {
     console.log(policies);
  }
}
check();
