require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function test() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Just querying the exact same thing the route does
  const { data, error } = await supabase
      .from('invoices')
      .select('*, order:orders(customer_id)')
      .eq('order_id', 'd5a192ee-c9ee-479e-94f1-b2a41fac4aee')
      .single()
  console.log("DB Test:", { data: !!data, error });
}
test();
