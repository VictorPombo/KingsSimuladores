import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase.from('coupons').select('*').limit(5);
  if (error) { console.error(error.message); return; }
  if (data && data.length > 0) {
    console.log('Colunas disponíveis:', Object.keys(data[0]));
    console.table(data.map(c => ({ code: c.code, is_active: c.is_active, ...c })));
  } else {
    console.log('Nenhum cupom cadastrado.');
  }
}
run();
