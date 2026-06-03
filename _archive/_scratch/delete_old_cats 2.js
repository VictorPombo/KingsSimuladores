const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: cats } = await supabase.from('categories').select('*').eq('brand_scope', 'kings');
  
  const toDelete = cats.filter(c => !c.slug.startsWith('kings-')).map(c => c.id);
  
  if (toDelete.length > 0) {
    const { error } = await supabase.from('categories').delete().in('id', toDelete);
    console.log("Deleted old non-prefixed categories:", toDelete, error);
  }
  
  const { data: finalCats } = await supabase.from('categories').select('id, name, slug').eq('brand_scope', 'kings');
  console.log("Final categories:", finalCats);
}
run();
