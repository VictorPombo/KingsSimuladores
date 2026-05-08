const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data } = await supabase.from('orders')
    .select('id, status, erp_id, payment_id')
    .eq('id', 'd2f1c3c7-b941-4033-bdba-db9b6603af5b')
    .single();
  console.log(data);
}
check();
