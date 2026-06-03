import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = 'marciotmaz@gmail.com';
  
  // Find profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .single();

  if (!profile) {
    console.log('Profile not found.');
    return;
  }

  // Find order
  const { data: orders } = await supabase
    .from('orders')
    .select('id, shipping_address, status')
    .eq('customer_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (!orders || orders.length === 0) {
    console.log('No orders found for this profile.');
    return;
  }

  console.log('Order ID:', orders[0].id);
  console.log('Shipping Address:', JSON.stringify(orders[0].shipping_address, null, 2));
}

run();
