const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/site/.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('orders')
    .select('id, status, total')
    .ilike('id', 'df8179b3%');
    
  if (error) {
    console.error(error);
  } else {
    console.log(data);
  }
}
run();
