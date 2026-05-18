const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data } = await supabase.from('profiles').select('*').in('id', ['d60b9ba4-3b9b-445e-aef6-6d18d2b23e97', 'c8857e63-50cc-4984-b8a3-bb5a6895ea08']);
  console.log('Profiles:', data);
}
run();
