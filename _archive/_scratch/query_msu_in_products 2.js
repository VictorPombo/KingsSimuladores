const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data } = await supabase.from('products').select('id, title, brand_id').eq('brand_id', 'e38dc95a-a1a8-43b5-811d-5cf3d459ab16');
  console.log('MSU products in products table:', data);
}
run();
