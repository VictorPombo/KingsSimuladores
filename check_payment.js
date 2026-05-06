const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const paymentId = '157250578225';
const orderId = '329502c7-7e29-4031-a208-fcf7b8419e2a4';

async function check() {
  // 1. Check MP payment status
  const token = process.env.MP_ACCESS_TOKEN_KINGS || process.env.MP_ACCESS_TOKEN;
  console.log("Using token ending in:", token?.slice(-6));
  
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!res.ok) {
    console.log("MP Error:", res.status, await res.text());
    return;
  }
  
  const data = await res.json();
  console.log("\n=== MERCADO PAGO ===");
  console.log("Status:", data.status);
  console.log("External Reference:", data.external_reference);
  console.log("Payment Method:", data.payment_method_id);
  console.log("Date Approved:", data.date_approved);
  console.log("Notification URL:", data.notification_url);
  
  // 2. Check order in database
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, status, payment_id, preference_id, tracking_code')
    .eq('id', data.external_reference)
    .single();
    
  console.log("\n=== DATABASE ORDER ===");
  console.log("Order:", order);
  console.log("Error:", error);
}
check();
