require('dotenv').config({ path: 'apps/site/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      total,
      status,
      profiles!customer_id ( full_name )
    `)
    .in('status', ['paid', 'shipped', 'delivered'])
    .order('created_at', { ascending: false })
    .limit(2);

  console.log("Data:", JSON.stringify(data, null, 2));
}
main();
