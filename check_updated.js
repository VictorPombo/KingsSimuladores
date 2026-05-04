const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/site/.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data } = await supabase.from('products')
    .select('title, sku, stock, price, images, dimensions_cm, weight_kg, ncm')
    .eq('brand_id', '15c7f799-a994-4ea7-a38a-0fcc0c35b372')
    .limit(3);
  console.log(JSON.stringify(data, null, 2));
}
run();
