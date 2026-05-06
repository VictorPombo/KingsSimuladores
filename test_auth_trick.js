const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function check() {
  const existingEmail = "victorpombo20@gmail.com";
  const newEmail = "nonexistent9999@kings.com.br";
  
  const res1 = await supabase.auth.signUp({ email: existingEmail, password: '1' });
  console.log("Existing Email:", res1.error ? res1.error.message : "Success");
  
  const res2 = await supabase.auth.signUp({ email: newEmail, password: '1' });
  console.log("New Email:", res2.error ? res2.error.message : "Success");
}
check();
