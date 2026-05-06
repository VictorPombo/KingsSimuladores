const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: orders } = await supabase.from('orders').select('id, preference_id, status').eq('status', 'pending').order('created_at', { ascending: false }).limit(5);
  console.log("Orders found:", orders.length);
  for (const order of orders) {
    if (order.preference_id) {
       const res = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=${order.id}`, {
         headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
       });
       const data = await res.json();
       console.log(`Order ${order.id}:`, data.results ? data.results.map(r => r.status) : "No results");
    } else {
       console.log(`Order ${order.id}: no preference_id`);
    }
  }
}
check();
