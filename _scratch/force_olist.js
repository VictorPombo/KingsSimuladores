require('dotenv').config({ path: '.env.local' });
const { pushOrderToOlist } = require('./packages/payments/src/olist.js') || {};
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: order } = await supabase.from('orders').select('*, profiles(*)').eq('id', 'd5a192ee-c9ee-479e-94f1-b2a41fac4aee').single();
  const { data: items } = await supabase.from('order_items').select('*, product:product_id(*)').eq('order_id', order.id);
  
  const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
  
  const payload = {
    id: `${order.id}-kings`,
    total: order.total,
    customer: {
      name: profile.full_name,
      email: profile.email,
      cpf_cnpj: profile.cpf_cnpj,
      phone: profile.phone
    },
    shipping: order.shipping_address,
    shipping_cost: 0,
    items: items.map(i => ({
      product_id: i.product?.sku || i.product_id,
      title: i.product?.title || 'Item',
      quantity: i.quantity,
      unit_price: i.unit_price,
      ncm: i.product?.ncm || '',
      gtin: i.product?.ean || 'SEM GTIN',
      origem: '0',
      cfop: '5102'
    }))
  };
  
  try {
    const olistUrl = 'https://api.olist.com/v1/orders'; // Mock or real? 
    // Wait, let's just use the real pushOrderToOlist if we can compile it, but it's typescript.
  } catch(e) {}
}
run();
