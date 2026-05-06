const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '/Users/hadi/Documents/KingsSimuladores/.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const targetEmail = 'admin@kings.com.br';
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  const existingUser = users.find(u => u.email === targetEmail);
  if (existingUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, { password: 'kingspassword123' });
    if (error) console.error('Error updating:', error);
    else console.log('Admin password updated successfully! admin@kings.com.br / kingspassword123');
  }
}
run();
