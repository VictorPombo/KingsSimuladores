const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/site/.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const orderId = 'df8179b3-0c84-419c-a8f6-011e64458fc4';

  const { data: order } = await supabase
    .from('orders')
    .select('id, customer_id, brand_origin, total, shipping_address, profiles(full_name, email, phone, cpf_cnpj)')
    .eq('id', orderId)
    .single();

  const { data: items } = await supabase
    .from('order_items')
    .select('product_id, quantity, unit_price, total_price, store_origin, product:product_id(title, stock, sku)')
    .eq('order_id', orderId);

  if (!order || !items) return console.error("Order or items not found");

  const profilesData = order.profiles;
  const profile = Array.isArray(profilesData) ? profilesData[0] : profilesData;

  const storeGroups = {};
  items.forEach(item => {
    const origin = item.store_origin || order.brand_origin || 'kings';
    if (!storeGroups[origin]) storeGroups[origin] = [];
    storeGroups[origin].push(item);
  });

  for (const store of Object.keys(storeGroups)) {
    const storeItems = storeGroups[store];
    const storeSubtotal = storeItems.reduce((acc, curr) => acc + (curr.total_price || (curr.unit_price * curr.quantity) || 0), 0);
    const shippingVal = store === order.brand_origin ? order.shipping_cost : 0;

    const orderPayload = {
      id: `${order.id}-${store}`,
      total: storeSubtotal + (shippingVal || 0),
      customer: {
        name: profile?.full_name,
        email: profile?.email,
        cpf_cnpj: profile?.cpf_cnpj,
        phone: profile?.phone
      },
      shipping: order.shipping_address,
      shipping_cost: shippingVal,
      items: storeItems.map(i => ({
         product_id: i.product?.sku || i.product_id,
         title: i.product?.title || 'Item',
         quantity: i.quantity,
         unit_price: i.unit_price
      }))
    };

    console.log("Pushing to Olist for store", store, ":", JSON.stringify(orderPayload, null, 2));

    const token = store === 'seven' ? process.env.OLIST_API_KEY_SEVEN : (process.env.OLIST_API_KEY_KINGS || process.env.OLIST_ACCESS_TOKEN);
    const tinyPedido = {
      pedido: {
        data_pedido: new Date().toLocaleDateString('pt-BR'),
        cliente: {
          nome: orderPayload.customer.name || 'Cliente Avulso',
          cpf_cnpj: orderPayload.customer.cpf_cnpj || '00000000000',
          email: orderPayload.customer.email || '',
          fone: orderPayload.customer.phone || '',
          endereco: orderPayload.shipping.street || orderPayload.shipping.logradouro || '',
          numero: orderPayload.shipping.number || orderPayload.shipping.numero || '',
          complemento: orderPayload.shipping.complement || orderPayload.shipping.complemento || '',
          bairro: orderPayload.shipping.neighborhood || orderPayload.shipping.bairro || '',
          cep: (orderPayload.shipping.zip || orderPayload.shipping.cep || '00000000').replace(/\D/g, ''),
          cidade: orderPayload.shipping.city || '',
          uf: orderPayload.shipping.state || ''
        },
        endereco_entrega: {
          endereco: orderPayload.shipping.street || orderPayload.shipping.logradouro || '',
          numero: orderPayload.shipping.number || orderPayload.shipping.numero || '',
          complemento: orderPayload.shipping.complement || orderPayload.shipping.complemento || '',
          bairro: orderPayload.shipping.neighborhood || orderPayload.shipping.bairro || '',
          cep: (orderPayload.shipping.zip || orderPayload.shipping.cep || '00000000').replace(/\D/g, ''),
          cidade: orderPayload.shipping.city || '',
          uf: orderPayload.shipping.state || ''
        },
        itens: (orderPayload.items || []).map(item => ({
          item: {
            codigo: item.product_id,
            descricao: item.title,
            quantidade: item.quantity,
            valor_unitario: item.unit_price
          }
        })),
        valor_frete: orderPayload.shipping_cost || 0,
        valor_desconto: 0,
        forma_pagamento: 'Pix',
        situacao: 'Aprovado'
      }
    };

    const params = new URLSearchParams();
    params.append('token', token);
    params.append('formato', 'json');
    params.append('pedido', JSON.stringify(tinyPedido));

    const res = await fetch('https://api.tiny.com.br/api2/pedido.incluir.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (res.ok) {
      const data = await res.json();
      console.log("Tiny ERP response:", JSON.stringify(data, null, 2));
      
      if (data.retorno && data.retorno.status === 'OK') {
        const registroObj = Array.isArray(data.retorno.registros) ? data.retorno.registros[0]?.registro : data.retorno.registros?.registro;
        
        await supabase.from('invoices').insert({
          order_id: order.id,
          store_origin: store,
          erp_id: registroObj?.id || '',
          cnpj_emitente: '',
          nfe_number: '',
          nfe_key: '',
          status: 'issued',
          xml_url: '',
          pdf_url: ''
        });
        console.log("Invoice created in DB!");
      } else {
        console.log("Failed to insert invoice. Tiny ERP returned an error.", data.retorno?.erros);
      }
    }
  }
}
run();
