require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function listAdmins() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: usersData, error: errSearch } = await supabase.auth.admin.listUsers();
  
  if (errSearch) {
    console.error('Error fetching users:', errSearch);
    return;
  }

  const { data: profiles } = await supabase.from('profiles').select('*').eq('role', 'admin');

  console.log('--- ADMIN PROFILES ---');
  console.log(profiles);

  if (profiles && profiles.length > 0) {
    const adminAuthId = profiles[0].auth_id;
    const user = usersData.users.find(u => u.id === adminAuthId);
    console.log('--- SYSTEM ADMIN EMAIL ---');
    console.log(user?.email || 'No email found for this profile');
  } else {
    console.log('No profiles with role=admin found.');
    // Let's create one directly in 'profiles' by taking an existing user
    if (usersData.users.length > 0) {
      console.log('Taking existing user and forcing admin role:', usersData.users[0].email);
      await supabase.from('profiles').update({ role: 'admin' }).eq('auth_id', usersData.users[0].id);
      console.log('DONE. Please login with:', usersData.users[0].email);
    } else {
      console.log('No existing users to promote to admin either.');
    }
  }
}

listAdmins();
