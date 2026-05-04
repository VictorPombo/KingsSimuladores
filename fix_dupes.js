const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: cats } = await supabase.from('categories').select('*').eq('brand_scope', 'kings');
  
  const keep = {};
  const toDelete = [];
  
  for (const c of cats) {
    if (!keep[c.slug]) {
      keep[c.slug] = c.id;
    } else {
      toDelete.push(c.id);
      
      // Update any products that use the duplicate ID to use the kept ID
      await supabase.from('products').update({ category_id: keep[c.slug] }).eq('category_id', c.id);
    }
  }
  
  if (toDelete.length > 0) {
    const { error } = await supabase.from('categories').delete().in('id', toDelete);
    console.log("Deleted duplicates:", toDelete, error);
  } else {
    console.log("No duplicates found to delete.");
  }
  
  const { data: finalCats } = await supabase.from('categories').select('id, name, slug').eq('brand_scope', 'kings');
  console.log("Final categories:", finalCats);
}
run();
