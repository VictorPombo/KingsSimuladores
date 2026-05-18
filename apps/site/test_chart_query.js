const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  const isoStart = sevenDaysAgo.toISOString()
  
  let query = supabase
    .from('orders')
    .select('total, created_at')
    .eq('status', 'paid')
    .gte('created_at', isoStart)
    .eq('brand_origin', 'kings')
    
  const { data, error } = await query;
  console.log("Chart query result:", data, error);
}
run();
