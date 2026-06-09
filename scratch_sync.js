const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const order_id = '61089bda-f93d-45f7-b6f3-c946a2e170b0';

async function run() {
  console.log('Buscando pedido no banco...');
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(quantity, unit_price, total_price, product:product_id(sku, title, ncm, ean)), profiles!customer_id(full_name, email, phone, cpf_cnpj)')
    .eq('id', order_id)
    .single();

  if (error) {
    console.error('Erro ao buscar:', error);
    return;
  }

  const profile = order.profiles;
  const items = order.order_items || [];
  const addr = order.shipping_address || {};
  const uf = (addr.state || addr.estado || (addr.cidade && addr.cidade.split('/')[1]) || 'SP').trim().toUpperCase();

  const olistPayload = {
    id: order.id,
    total: Number(order.total),
    customer: {
      name: profile?.full_name || 'Cliente',
      full_name: profile?.full_name || 'Cliente',
      email: profile?.email || '',
      cpf_cnpj: profile?.cpf_cnpj || undefined,
      phone: profile?.phone || undefined,
    },
    shipping: {
      street: addr.street || addr.logradouro || '',
      number: addr.number || addr.numero || 'S/N',
      complement: addr.complement || addr.complemento,
      neighborhood: addr.neighborhood || addr.bairro || '',
      zip: addr.cep || '',
      city: addr.city || addr.cidade || '',
      state: uf,
    },
    shipping_cost: Number(order.shipping_cost) || 0,
    items: items.map(item => ({
      product_id: item.product?.sku || 'SEM-SKU',
      title: item.product?.title || 'Item',
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
      ncm: item.product?.ncm || '',
      gtin: item.product?.ean || 'SEM GTIN',
      origem: '0',
      cfop: uf === 'SP' ? '5102' : '6102',
    })),
  };

  console.log('Payload montado. Enviando para Tiny ERP...');
  
  const token = process.env.OLIST_API_KEY_KINGS || process.env.OLIST_ACCESS_TOKEN;
  
  const tinyPedido = {
    pedido: {
      data_pedido: new Date().toLocaleDateString('pt-BR'),
      cliente: {
        nome: olistPayload.customer.full_name || 'Cliente Avulso',
        cpf_cnpj: (olistPayload.customer.cpf_cnpj || '').replace(/\D/g, ''),
        email: olistPayload.customer.email || '',
        fone: olistPayload.customer.phone || '',
        endereco: olistPayload.shipping.street,
        numero: olistPayload.shipping.number,
        complemento: olistPayload.shipping.complement || '',
        bairro: olistPayload.shipping.neighborhood,
        cep: (olistPayload.shipping.zip || '').replace(/\D/g, ''),
        cidade: olistPayload.shipping.city,
        uf: olistPayload.shipping.state
      },
      endereco_entrega: {
        nome_destinatario: olistPayload.customer.full_name || 'Cliente Avulso',
        cpf_cnpj: (olistPayload.customer.cpf_cnpj || '').replace(/\D/g, ''),
        endereco: olistPayload.shipping.street,
        numero: olistPayload.shipping.number,
        complemento: olistPayload.shipping.complement || '',
        bairro: olistPayload.shipping.neighborhood,
        cep: (olistPayload.shipping.zip || '').replace(/\D/g, ''),
        cidade: olistPayload.shipping.city,
        uf: olistPayload.shipping.state
      },
      itens: olistPayload.items.map(item => ({
        item: {
          codigo: item.product_id,
          descricao: item.title,
          quantidade: item.quantity,
          valor_unitario: item.unit_price,
          ncm: (item.ncm || '').replace(/\D/g, ''),
          origem: item.origem || '0',
          gtin: item.gtin || 'SEM GTIN',
          cfop: item.cfop || ''
        }
      })),
      valor_frete: olistPayload.shipping_cost || 0,
      valor_desconto: 0,
      forma_pagamento: 'Pix',
      situacao: 'Aprovado',
      numero_pedido_ecommerce: order_id
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

  const text = await res.text();
  console.log('Resposta do Tiny:', text);

  // Parse result to get the ERP ID
  try {
    const json = JSON.parse(text);
    if (json.retorno && json.retorno.status === 'OK') {
      const erp_id = json.retorno.registros[0].registro.id;
      console.log('Pedido criado no ERP com ID:', erp_id);
      
      await supabase.from('orders').update({ erp_id }).eq('id', order_id);
      console.log('Order atualizada com erp_id no banco.');
      
      const { data: orderStore } = await supabase.from('orders').select('brand_origin').eq('id', order_id).single();
      const store = orderStore?.brand_origin || 'kings';

      await supabase.from('invoices').upsert({
        order_id,
        store_origin: store,
        erp_id,
        cnpj_emitente: '29.688.089/0001-02',
        nfe_number: '',
        nfe_key: '',
        status: 'pending',
        xml_url: '',
        pdf_url: '',
      }, { onConflict: 'order_id' });

      await supabase.from('order_jobs').insert({
        order_id,
        job_type: 'emit_nfe',
        status: 'pending',
        retry_count: 0,
        payload: { erp_id, order_id, store },
      });
      console.log('Invoice upserted and order_job created.');
    } else {
        console.error('Erro retornado pela API Tiny:', json.retorno.erros);
    }
  } catch (err) {
    console.error('Failed to parse and update database', err);
  }

}
run();
