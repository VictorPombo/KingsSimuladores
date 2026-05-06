const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (users && users.users) {
     const lastUser = users.users.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0];
     console.log("Last User:", lastUser.email);
     console.log("Confirmed At:", lastUser.email_confirmed_at);
     console.log("Created At:", lastUser.created_at);
  } else {
     console.log(error);
  }
}
check();
