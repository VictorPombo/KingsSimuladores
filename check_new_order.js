const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase
    .from('orders')
    .select('id, status, payment_id, payment_method, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(3);
  
  console.log("Últimos 3 pedidos:");
  for (const o of data) {
    console.log(`  #${o.id.split('-')[0]} | Status: ${o.status} | PaymentID: ${o.payment_id || 'null'} | Método: ${o.payment_method || 'null'} | Criado: ${o.created_at} | Atualizado: ${o.updated_at}`);
  }
}
check();
