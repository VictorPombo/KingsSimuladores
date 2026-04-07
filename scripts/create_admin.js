require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function createAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Key.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const email = 'victor.pombo@kingssimuladores.com.br';
  const password = 'AdminPassword123!';

  console.log(`Creating user ${email}...`);

  // 1. Create a user via Admin API
  const { data: userResp, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // auto-confirm email
    user_metadata: {
      full_name: 'Victor Pombo (Admin)',
    }
  });

  if (userError) {
    if (userError.message.includes('already registered')) {
        console.log('User already exists. Skipping creation.');
    } else {
        console.error('Error creating user:', userError);
        return;
    }
  }

  // Get user ID
  const { data: usersData, error: errSearch } = await supabase.auth.admin.listUsers();
  const targetUser = usersData.users.find(u => u.email === email);
  
  if (!targetUser) {
    console.error('Could not find user after creation.');
    return;
  }

  console.log(`Setting role to 'admin' for profile: ${targetUser.id}`);

  // 2. Update their profile role to 'admin'
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('auth_id', targetUser.id);

  if (profileError) {
    console.error('Error updating profile role:', profileError);
  } else {
    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  }
}

createAdmin();
