const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: brand } = await supabase.from('brands').select('id').eq('name', 'kings').single();
  if (!brand) {
    console.log("Brand 'kings' not found");
    return;
  }
  console.log("Kings brand ID:", brand.id);

  const { data, error } = await supabase
    .from('products')
    .update({ ncm: '9504.50.00' })
    .eq('brand_id', brand.id)
    .or('ncm.is.null,ncm.eq.,ncm.eq.null');
    
  console.log("Update result:", { data, error });
  
  // also check how many were updated
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('brand_id', brand.id).eq('ncm', '9504.50.00');
  console.log("Total Kings products with NCM 9504.50.00:", count);
}
run();
