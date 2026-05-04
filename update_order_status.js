const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/site/.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('orders')
    .update({ status: 'paid' })
    .eq('id', 'df8179b3-0c84-419c-a8f6-011e64458fc4');
  console.log("Updated:", error ? error : "Success");
}
run();
