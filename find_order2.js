const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/site/.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('orders')
    .select('id, status, total, customer_id')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (error) {
    console.error(error);
  } else {
    const order = data.find(o => o.id.toLowerCase().startsWith('df8179b3'));
    console.log(order || "Not found");
  }
}
run();
