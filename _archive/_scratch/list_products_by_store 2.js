const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: products, error } = await supabase
    .from('products')
    .select('title, attributes, brands!inner(name, display_name)')
    .order('brands(name)', { ascending: true })
    .order('title', { ascending: true });

  if (error) {
    console.error('Erro:', error);
    return;
  }

  const grouped = { kings: [], seven: [], msu: [] };
  
  products.forEach(p => {
    const store = p.brands?.name || 'desconhecida';
    const brandAttr = p.attributes?.brand || 'Não informada';
    
    if (!grouped[store]) grouped[store] = [];
    grouped[store].push(`${p.title} | ${p.brands?.display_name || store} | ${brandAttr}`);
  });

  console.log('--- PRODUTOS KINGS SIMULADORES ---');
  grouped.kings.forEach(line => console.log(line));
  
  console.log('\n--- PRODUTOS SEVEN SIM RACING ---');
  grouped.seven?.forEach(line => console.log(line));
  
  console.log('\n--- PRODUTOS MEU SIMULADOR USADO (MSU - Tabela Products) ---');
  grouped.msu?.forEach(line => console.log(line));
}

run();
