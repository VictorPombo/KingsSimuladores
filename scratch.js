require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data: brand } = await supabase.from('brands').select('id').or('name.eq.seven,name.eq.simagic');
  if (brand && brand.length > 0) {
    const brandIds = brand.map(b => b.id);
    const { data, error } = await supabase.from('products').select('title').in('brand_id', brandIds);
    if (error) console.error(error);
    else console.log(data.map(d => d.title).join('\n'));
  } else {
    console.log("No brands found for Seven or Simagic.");
    
    // Fallback: search title for simagic
    const { data, error } = await supabase.from('products').select('title').ilike('title', '%simagic%');
    if (error) console.error(error);
    else console.log("Fallback search:\n" + data.map(d => d.title).join('\n'));
  }
}
run();
