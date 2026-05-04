const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const KINGS_CATEGORIES = [
  { name: 'Cockpits', slug: 'kings-cockpits' },
  { name: 'Volantes', slug: 'kings-volantes' },
  { name: 'Bases', slug: 'kings-bases' },
  { name: 'Pedais', slug: 'kings-pedais' },
  { name: 'Computadores', slug: 'kings-computadores' },
  { name: 'Kits Completos', slug: 'kings-kits-completos' },
  { name: 'Acessórios', slug: 'kings-acessorios' }
];

async function run() {
  console.log("1. Limpando categorias defeituosas da Kings...");
  await supabase.from('categories').delete().eq('brand_scope', 'kings');

  console.log("2. Criando Categorias da Kings com slug unico...");
  const categoryIds = {};
  
  for (const cat of KINGS_CATEGORIES) {
    const { data: inserted, error } = await supabase
      .from('categories')
      .insert({
        name: cat.name,
        slug: cat.slug,
        brand_scope: 'kings',
        sort_order: 0
      })
      .select()
      .single();
      
    if (error) console.error("Erro ao criar categoria", cat.name, error);
    else {
      categoryIds[cat.slug] = inserted.id;
      console.log(`[CRIADA] Categoria '${cat.name}'.`);
    }
  }

  console.log("\n3. Migrando produtos da Kings...");
  const { data: products } = await supabase
    .from('products')
    .select('id, title, category_id, brands!inner(name)')
    .eq('brands.name', 'kings');
    
  let countMigrated = 0;
  let countUncategorized = 0;
  
  for (const prod of products) {
    const titleLower = prod.title.toLowerCase();
    let targetSlug = null;
    
    // Regras de inferência baseadas no código anterior
    if (titleLower.includes('cockpit')) targetSlug = 'kings-cockpits';
    else if (titleLower.includes('kit') || titleLower.includes('bundle') || titleLower.includes('conjunto')) targetSlug = 'kings-kits-completos';
    else if (titleLower.includes('base') || titleLower.includes('motor')) targetSlug = 'kings-bases';
    else if (titleLower.includes('volante') || titleLower.includes('arco') || titleLower.includes('wheel')) targetSlug = 'kings-volantes';
    else if (titleLower.includes('pedal') || titleLower.includes('pedais') || titleLower.includes('embreagem')) targetSlug = 'kings-pedais';
    else if (titleLower.includes('pc') || titleLower.includes('computador')) targetSlug = 'kings-computadores';
    else targetSlug = 'kings-acessorios'; // Fallback
    
    if (targetSlug && categoryIds[targetSlug]) {
      const { error } = await supabase
        .from('products')
        .update({ category_id: categoryIds[targetSlug] })
        .eq('id', prod.id);
        
      if (!error) {
        countMigrated++;
      } else {
        console.error(`Erro ao atualizar produto ${prod.title}:`, error);
      }
    } else {
      countUncategorized++;
    }
  }
  
  console.log("\n--- RESUMO ---");
  console.log(`✅ Produtos atualizados com sucesso: ${countMigrated}`);
  console.log(`⚠️ Produtos sem categoria (ignorados): ${countUncategorized}`);
  console.log(`Total avaliado: ${products.length}`);
}

run();
