import { config } from 'dotenv';
config({ path: '.env.local' });
import { pushOrderToOlist } from './packages/payments/src/olist';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const orderId = 'd5a192ee-c9ee-479e-94f1-b2a41fac4aee';
  const { data: order } = await supabase.from('orders').select('*, profiles(*)').eq('id', orderId).single();
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
    items: items!.map((i: any) => ({
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
  
  console.log("Pushing to Olist...", payload);
  try {
    const res = await pushOrderToOlist(payload, 'kings', process.env.OLIST_API_KEY_KINGS);
    console.log("Olist Response:", res);
    
    if (res && res.status !== 'error') {
      await supabase.from('invoices').insert({
        order_id: order.id,
        store_origin: 'kings',
        erp_id: res.tiny_id || res.id || '',
        cnpj_emitente: '',
        nfe_number: '',
        nfe_key: '',
        status: 'pending',
        xml_url: '',
        pdf_url: ''
      });
      console.log("Invoice inserted!");
      await supabase.from('orders').update({ status: 'paid' }).eq('id', order.id);
    }
  } catch(e) {
    console.error(e);
  }
}
run();
