require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function seedReviews() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // 1. Buscar profiles
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, role');
  const seller = profiles.find(p => p.role === 'seller') || profiles[0];
  const reviewers = profiles.filter(p => p.id !== seller.id).slice(0, 3);
  
  console.log(`Seller: ${seller.full_name}`);
  console.log(`Reviewers: ${reviewers.map(r => r.full_name).join(', ')}`);

  // 2. Criar 3 orders reais com o schema correto
  const orderIds = [];
  for (let i = 0; i < 3; i++) {
    const { data: order, error: orderErr } = await supabase.from('orders').insert({
      customer_id: reviewers[i]?.id || reviewers[0].id,
      brand_origin: 'msu',
      order_type: 'marketplace',
      status: 'delivered',
      subtotal: 1000 + (i * 500),
      total: 1000 + (i * 500),
      shipping_cost: 0,
      discount: 0,
      shipping_address: { street: 'Rua Teste', city: 'São Paulo', state: 'SP', zip: '01000-000' },
    }).select('id').single();

    if (orderErr) {
      console.log(`✗ Erro order ${i+1}: ${orderErr.message}`);
    } else {
      orderIds.push(order.id);
      console.log(`✓ Order ${i+1} criada: ${order.id}`);
    }
  }

  if (orderIds.length === 0) {
    console.log('Não consegui criar nenhuma order. Abortando.');
    return;
  }

  // 3. Inserir reviews vinculadas às orders
  const reviewData = [
    { rating: 5, comment: 'Excelente vendedor! Produto chegou perfeito e bem embalado. Recomendo demais!' },
    { rating: 4, comment: 'Bom atendimento, envio rápido. Voltaria a comprar com certeza.' },
    { rating: 5, comment: 'Simulador top de linha, vendedor muito atencioso e respondeu todas dúvidas.' },
  ];

  for (let i = 0; i < Math.min(orderIds.length, reviewData.length); i++) {
    const rev = {
      seller_id: seller.id,
      reviewer_id: reviewers[i]?.id || reviewers[0].id,
      order_id: orderIds[i],
      rating: reviewData[i].rating,
      comment: reviewData[i].comment,
    };
    const { error } = await supabase.from('seller_reviews').insert(rev);
    console.log(error ? `✗ Review ${i+1}: ${error.message}` : `✓ Review ${i+1}: ${rev.rating}★ — "${rev.comment.substring(0, 40)}..."`);
  }

  // 4. Verificar
  const { data: total } = await supabase.from('seller_reviews').select('id, rating, comment');
  console.log(`\n✅ Total de avaliações no banco: ${total?.length || 0}`);
  if (total) total.forEach(r => console.log(`   ${r.rating}★ — ${r.comment?.substring(0, 50)}...`));
}

seedReviews();
