const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function check() {
  const { data: orders } = await supabase.from('orders').select('id').eq('status', 'pending').order('created_at', { ascending: false }).limit(2);
  for (const order of orders) {
    const { count } = await supabase.from('order_items').select('*', { count: 'exact', head: true }).eq('order_id', order.id);
    console.log(`Order ${order.id}: items=${count}`);
  }
}
check();
