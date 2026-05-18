require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testRLH() {
  // Use anon key instead of service role to test RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
    email: 'admin@kings.com.br',
    password: 'KingsAdmin2026!'
  });

  if (signInErr) {
    console.error('Sign in failed:', signInErr);
    return;
  }

  // Now query profiles using authenticated session, to replicate middleware
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_id', signInData.user.id)
    .single();

  if (profileErr) {
    console.error('🚨 Error querying profile via REST:', profileErr);
  } else {
    console.log('✅ Profile queried successfully:', profile);
  }
}

testRLH();
