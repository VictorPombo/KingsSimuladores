require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: orders, error } = await supabase.from('orders').select('*');
  console.log("ORDERS:", orders?.length || 0, error || "");
  const { data: mOrders } = await supabase.from('marketplace_orders').select('*');
  console.log("MARKETPLACE ORDERS:", mOrders?.length || 0);
}
run();
