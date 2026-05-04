const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/site/.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // Try to find the order by matching the short ID in either 'id' or a possible 'order_number'/'short_id' column
  const { data: cols } = await supabase.rpc('get_table_columns', { table_name: 'orders' }); // Just to see columns if needed, but let's just fetch all orders first
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (error) {
    console.error("Error fetching orders:", error);
    return;
  }
  
  const order = data.find(o => o.id.toUpperCase().includes('E07AF39B') || (o.display_id && o.display_id.toUpperCase().includes('E07AF39B')));
  
  if (order) {
    console.log("Found order:", order.id, "Current status:", order.status);
    const { error: updateErr } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', order.id);
      
    if (updateErr) {
      console.error("Failed to update:", updateErr);
    } else {
      console.log("Order updated to paid!");
    }
  } else {
    console.log("Order not found in recent 10. Let's try text search.");
    // try direct query if it's the start of UUID
    const { data: searchData } = await supabase.from('orders').select('id, status').ilike('id', '%E07AF39B%');
    console.log("Search result:", searchData);
    if (searchData && searchData.length > 0) {
      const { error: updateErr } = await supabase.from('orders').update({ status: 'paid' }).eq('id', searchData[0].id);
      console.log("Update result:", updateErr ? updateErr : "Success");
    }
  }
}
run();
