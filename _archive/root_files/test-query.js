const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const envVars = env.split('\n').reduce((acc, line) => {
  const [key, val] = line.split('=');
  if (key && val) acc[key.trim()] = val.trim().replace(/^['"]|['"]$/g, '');
  return acc;
}, {});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(envVars['NEXT_PUBLIC_SUPABASE_URL'], envVars['SUPABASE_SERVICE_ROLE_KEY']);

async function test() {
  const { data, error } = await supabase
    .from('order_items')
    .select('id, quantity, unit_price, total_price, store_origin, product:product_id(title, sku, images, dimensions_cm, weight_kg)')
    .limit(1);
  console.log("Error:", error);
}
test();
