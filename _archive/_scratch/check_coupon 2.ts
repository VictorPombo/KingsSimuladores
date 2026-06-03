import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .ilike('code', 'PIANA');

  if (error) { console.error('Erro:', error.message); return; }
  if (!data || data.length === 0) { console.log('Cupom PIANA NÃO encontrado no banco!'); return; }
  
  console.log('Cupom encontrado:');
  console.log(JSON.stringify(data[0], null, 2));
}
run();
