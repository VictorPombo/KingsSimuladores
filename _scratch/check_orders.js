require('dotenv').config({ path: 'apps/site/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, coupon_id, created_at, discount')
    .order('created_at', { ascending: false })
    .limit(5);
  console.log("Latest orders:", JSON.stringify(orders, null, 2));

  const { data: coupons } = await supabase
    .from('coupons')
    .select('id, code, usage_count');
  console.log("Coupons:", JSON.stringify(coupons, null, 2));
}
main();
