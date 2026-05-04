const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/site/.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: cols } = await supabase.rpc('get_table_columns', { table_name: 'profiles' });
  if (cols) {
     console.log("Profile columns:", cols.map(c => c.column_name).join(', '));
  } else {
     // fallback
     const { data } = await supabase.from('profiles').select('*').limit(1);
     if (data && data.length > 0) {
        console.log("Profile keys:", Object.keys(data[0]));
     }
  }
}
run();
