import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const coupons = [
    { code: 'PIANA', type: 'shipping', value: 100, is_active: true, brand_scope: null, expires_at: null, usage_limit: null },
    { code: 'POKIZ', type: 'shipping', value: 100, is_active: true, brand_scope: null, expires_at: null, usage_limit: null },
    { code: 'CONRAS', type: 'shipping', value: 100, is_active: true, brand_scope: null, expires_at: null, usage_limit: null },
  ];

  const { data, error } = await supabase.from('coupons').insert(coupons).select('code, type, is_active');

  if (error) {
    console.error('Erro ao criar cupons:', error.message);
    return;
  }

  console.log('Cupons criados com sucesso:');
  console.table(data);
}
run();
