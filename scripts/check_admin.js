require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function check() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: userData } = await supabase.auth.admin.listUsers();
  const adminAuth = userData.users.find(u => u.email === 'admin@kings.com.br');

  console.log('Auth user found:', adminAuth?.id);

  if (adminAuth) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('auth_id', adminAuth.id);
    console.log('Profile found:', profile);
    
    // Also try eq('id', ...) just in case
    const { data: profile2 } = await supabase.from('profiles').select('*').eq('id', adminAuth.id);
    console.log('Profile by ID instead of auth_id:', profile2);
  }
}
check();
