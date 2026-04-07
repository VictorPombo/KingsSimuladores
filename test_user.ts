import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function test() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'test_db_error_3@example.com',
    password: 'password123A1!',
    email_confirm: true,
  });
  console.log('User Data:', data);
  if (error) console.error('Error Details:', JSON.stringify(error, null, 2));
}
test();
