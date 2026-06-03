import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function run() {
  // Check coupons columns
  const { data: c } = await supabase.from('coupons').select('*').limit(1);
  if (c && c[0]) console.log('Coupons columns:', Object.keys(c[0]));
  // Check orders with coupon_id
  const { data: o } = await supabase.from('orders').select('id, total, coupon_id, status, created_at').not('coupon_id', 'is', null).limit(3);
  console.log('Orders with coupons:', o);
}
run();
