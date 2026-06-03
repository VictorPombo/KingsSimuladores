const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data } = await supabase.from('orders').select('*').eq('id', '329502c7-7e29-4031-a208-fcf78419e2a4').single();
  console.log(data);
}
check();
