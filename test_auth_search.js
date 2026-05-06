const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  // Try passing an object with 'search' parameter, or maybe 'filter'
  // Let's see if we can find the exact user
  // The SDK might not support it, let's try calling the REST API directly
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  });
  // Does the REST API support filtering? e.g. /users?email=eq.victorpombo20@gmail.com
  // Wait, I can just fetch all 465 users if needed, but let's try the REST API
}
check();
