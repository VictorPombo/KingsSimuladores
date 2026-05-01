const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: 'victordeassis2010@hotmail.com'
  });
  console.log('Admin Generate Link Error:', error);
  console.log('Admin Generate Link Data:', data);
}
run();
