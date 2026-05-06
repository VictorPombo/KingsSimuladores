require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data } = await supabase.from('products').select('id, title, ncm, ean, sku').limit(10);
  for (const p of (data || [])) {
    console.log(`${p.title} | NCM: "${p.ncm}" | EAN: "${p.ean}" | SKU: "${p.sku}"`);
  }
}
check();
