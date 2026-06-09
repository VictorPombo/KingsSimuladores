const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data } = await supabase.from('products').select('title, slug, brand_id, brands(name)').eq('slug', 'pedal-moza-sr-p-sem-embreagem').single();
  console.log(data);
}
run();
