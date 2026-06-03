require('dotenv').config({ path: 'apps/site/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      profiles:customer_id ( full_name )
    `)
    .eq('id', '80f9f8ab-35e7-4665-864f-2d30b8cea15a');

  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}
main();
