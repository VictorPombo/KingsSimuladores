const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { sql: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders';" });
  if (error) {
    console.error("RPC Error (exec_sql might not exist):", error);
  } else {
    console.log(data);
  }
}
run();
