const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
  const { data, error } = await supabase
    .from('orders')
    .update({ 
      status: 'paid', 
      payment_id: '157250578225', 
      payment_method: 'visa' 
    })
    .eq('id', '329502c7-7e29-4031-a208-fcf78419e2a4')
    .select('id, status, payment_id');
  
  console.log("Updated:", data, "Error:", error);
}
fix();
