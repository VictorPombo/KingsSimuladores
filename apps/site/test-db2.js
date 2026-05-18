const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('listing_messages')
  .select(`
    *,
    sender:profiles!sender_id(full_name),
    receiver:profiles!receiver_id(full_name),
    listing:marketplace_listings(title, images)
  `).then(res => console.log(JSON.stringify(res, null, 2)));
