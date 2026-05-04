const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('products')
    .select('id, title, slug, sku, price, price_compare, stock, status, weight_kg, images, created_at, brand_id, category_id, brands!brand_id(name), categories!category_id(name)')
    .order('created_at', { ascending: false })
    .limit(1);

  console.log("Result:", data, error);
}
run();
