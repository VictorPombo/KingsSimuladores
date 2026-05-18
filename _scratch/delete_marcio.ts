import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = 'marciotmaz@gmail.com';
  
  // 1. Get profile to find auth_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('auth_id, id')
    .eq('email', email)
    .single();

  if (profileError) {
    console.log('Profile not found for this email, checking auth directly...');
  }
  
  let authId = profile?.auth_id;
  
  // 2. If no authId, list users to find it
  if (!authId) {
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (users) {
      const u = users.find(u => u.email === email);
      if (u) authId = u.id;
    }
  }

  if (!authId) {
    console.log('Could not find user auth_id to delete.');
    return;
  }
  
  console.log(`Found auth_id: ${authId}, deleting...`);
  
  const { error } = await supabase.auth.admin.deleteUser(authId);
  if (error) {
    console.error('Error deleting user:', error.message);
  } else {
    console.log('User deleted successfully!');
  }
}

run();
