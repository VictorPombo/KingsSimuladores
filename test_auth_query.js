const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: 'auth' }
});

async function check() {
  const { data, error } = await supabase.from('users').select('id, email').eq('email', 'victorpombo20@gmail.com');
  console.log("Data:", data, "Error:", error);
}
check();
