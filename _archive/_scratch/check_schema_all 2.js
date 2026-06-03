const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('products').insert({
    title: "Teste API Schema",
    sku: "TESTE_SCHEMA_123",
    slug: "teste-api-schema",
    price: 100,
    status: 'draft',
    brand_id: '8523885d-0d9b-4877-8eae-c8419d6969d3',
    cnpj_emitente: '48.882.162/0001-38' // Example CNPJ
  }).select().single();
  
  if(error) console.error("Error inserting:", error);
  else {
    console.log("Success! Deleting test product...", data);
    await supabase.from('products').delete().eq('id', data.id);
  }
}
check();
