const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data } = await supabase.from('profiles').select('*').eq('id', 'd1fdae8f-818a-4fa2-93a9-a077aee4e111').single();
  console.log(data);
}
check();
