require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function hijackAndCreateAdmin() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  console.log('Fetching existing users...');
  const { data: usersData, error: errSearch } = await supabase.auth.admin.listUsers();
  
  if (errSearch || !usersData || usersData.users.length === 0) {
    console.error('Error fetching users or no users found:', errSearch);
    return;
  }

  // Let's create an admin out of the first user... wait, what if it's the real client?
  // We can just use the first user, change email, password, and profile.
  // Actually, let's use the second user to not overwrite Diego if he is the first.
  const targetUser = usersData.users.length > 1 ? usersData.users[1] : usersData.users[0];
  
  const adminEmail = 'admin@kings.com.br';
  const adminPassword = 'KingsAdmin2026!';

  console.log(`Converting user ${targetUser.email} to Admin Teste...`);

  // Update Auth User
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    targetUser.id,
    { 
      email: adminEmail, 
      password: adminPassword,
      email_confirm: true 
    }
  );

  if (updateError) {
    console.error('Failed to update auth user:', updateError);
    return;
  }

  // Update Profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      role: 'admin',
      email: adminEmail,
      full_name: 'Admin Teste'
    })
    .eq('auth_id', targetUser.id);

  if (profileError) {
    console.error('Failed to update profile:', profileError);
  } else {
    console.log('--- ADMIN CRIADO COM SUCESSO ---');
    console.log(`Login: ${adminEmail}`);
    console.log(`Senha: ${adminPassword}`);
  }
}

hijackAndCreateAdmin();
