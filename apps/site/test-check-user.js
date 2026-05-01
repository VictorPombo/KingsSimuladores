const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.auth.admin.getUserById('c8857e63-50cc-4984-b8a3-bb5a6895ea08');
  console.log('User:', data.user.email_confirmed_at);
}
run();
