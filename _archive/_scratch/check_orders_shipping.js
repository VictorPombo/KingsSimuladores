const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // Check orders with tracking info
  const { data } = await supabase
    .from('orders')
    .select('id, order_number, status, tracking_code, shipping_cost, payment_method')
    .not('tracking_code', 'is', null)
    .order('created_at', { ascending: false })
    .limit(5);
  console.log("Orders with tracking:");
  console.log(JSON.stringify(data, null, 2));
  
  // Check full schema for order
  const { data: all } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  console.log("\nFull order columns:", Object.keys(all));
}
run();
