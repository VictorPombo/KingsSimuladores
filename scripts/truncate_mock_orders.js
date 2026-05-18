require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Cleaning up all relational data...");
  await supabase.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('shipping_labels').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  const { data: d1, error: e1 } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Orders deleted", e1 || "");
  
  const { data: d2, error: e2 } = await supabase.from('marketplace_orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Marketplace Orders deleted", e2 || "");
}
run();
