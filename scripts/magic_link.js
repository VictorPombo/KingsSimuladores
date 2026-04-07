require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function getLink() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const email = 'diegorb88@gmail.com';

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: email
  });

  if (error) {
    console.error('Error generating link:', error);
  } else {
    console.log('--- MAGIC LINK FOR ADMIN ---');
    console.log(data.properties.action_link);
  }
}

getLink();
