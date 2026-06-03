import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
    email: 'temp_admin_test_123@kings.com.br',
    password: 'password123',
    email_confirm: true
  });
  
  if (error) {
    console.error(error);
    return;
  }
  
  await supabaseAdmin.from('profiles').insert({ id: user.user.id, email: 'temp_admin_test_123@kings.com.br', full_name: 'Temp Admin', role: 'admin' });
  
  const { data: session } = await supabaseAdmin.auth.signInWithPassword({
    email: 'temp_admin_test_123@kings.com.br',
    password: 'password123'
  });
  
  const token = session.session.access_token;
  
  const res = await fetch('https://kingssimuladores.com.br/api/invoices/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `sb-access-token=${token}` // Try to simulate Next.js cookies if they use that?
    },
    body: JSON.stringify({ orderId: 'd5a192ee-c9ee-479e-94f1-b2a41fac4aee' })
  });
  
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
  
  await supabaseAdmin.auth.admin.deleteUser(user.user.id);
  await supabaseAdmin.from('profiles').delete().eq('id', user.user.id);
}
run();
