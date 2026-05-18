require('dotenv').config({ path: 'apps/site/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixOrder() {
  const { data: coupon } = await supabase
    .from('coupons')
    .select('id, usage_count')
    .eq('code', 'PIANA')
    .single();
    
  if (coupon) {
    // Desvincular do pedido 4034
    await supabase.from('orders').update({ coupon_id: null }).eq('order_number', 4034);
    
    // Vincular ao pedido 4022
    await supabase.from('orders').update({ coupon_id: coupon.id }).eq('order_number', 4022);
    
    console.log("Order 4034 unlinked, Order 4022 linked to PIANA successfully!");
  } else {
    console.log("PIANA coupon not found");
  }
}
fixOrder();
