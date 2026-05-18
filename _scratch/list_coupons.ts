import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase.from('coupons').select('code, discount_type, discount_value, is_active, expires_at, usage_count, usage_limit, brand_scope').order('created_at', { ascending: false });
  if (error) { console.error(error.message); return; }
  console.table(data);
}
run();
