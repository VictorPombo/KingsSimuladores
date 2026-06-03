const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAdmin() {
  const email = 'admin@kings.com.br';
  const password = 'KingsAdmin2026!';
  
  console.log(`Checking user: ${email}...`);
  
  // 1. Get all users to see if admin exists
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("Error listing users:", listError);
    process.exit(1);
  }
  
  let adminUser = usersData.users.find(u => u.email === email);
  
  if (!adminUser) {
    console.log("User not found. Creating...");
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { role: 'admin', name: 'Administrador Kings' }
    });
    
    if (createError) {
      console.error("Error creating user:", createError);
      process.exit(1);
    }
    adminUser = createData.user;
    console.log("User created successfully!");
  } else {
    console.log("User exists. Updating password and confirming email...");
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { password: password, email_confirm: true, user_metadata: { role: 'admin', name: 'Administrador Kings' } }
    );
    
    if (updateError) {
      console.error("Error updating user:", updateError);
      process.exit(1);
    }
    console.log("User updated successfully!");
  }
  
  // Also check if there's a profiles/users table that needs updating
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', adminUser.id)
    .single();
    
  if (profileError && profileError.code !== 'PGRST116') {
    console.error("Error checking profile:", profileError);
  } else if (profileError && profileError.code === 'PGRST116') {
    console.log("Profile not found in 'users' table. Attempting to insert...");
    await supabase.from('users').insert({
      id: adminUser.id,
      email: email,
      role: 'admin',
      name: 'Administrador Kings'
    });
    console.log("Profile inserted.");
  } else {
    console.log("Profile found in 'users' table. Ensuring role is admin...");
    await supabase.from('users').update({ role: 'admin' }).eq('id', adminUser.id);
    console.log("Profile updated.");
  }
  
  console.log("Done!");
}

fixAdmin();
