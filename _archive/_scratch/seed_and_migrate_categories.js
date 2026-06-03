const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const KINGS_CATEGORIES = [
  { name: 'Cockpits', slug: 'cockpit' },
  { name: 'Volantes', slug: 'volantes' },
  { name: 'Bases', slug: 'base' },
  { name: 'Pedais', slug: 'pedais' },
  { name: 'Computadores', slug: 'pc' },
  { name: 'Kits Completos', slug: 'kit-completo' },
  { name: 'Acessórios', slug: 'acessorios' }
];

async function run() {
  console.log("1. Criando Categorias da Kings...");
  const categoryIds = {};
  
  for (const cat of KINGS_CATEGORIES) {
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', cat.slug)
      .eq('brand_scope', 'kings')
      .single();
      
    if (existing) {
      categoryIds[cat.slug] = existing.id;
      console.log(`[OK] Categoria '${cat.name}' já existia.`);
    } else {
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
  }

  console.log("\n2. Migrando produtos da Kings...");
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
    if (titleLower.includes('cockpit')) targetSlug = 'cockpit';
    else if (titleLower.includes('kit') || titleLower.includes('bundle') || titleLower.includes('conjunto')) targetSlug = 'kit-completo';
    else if (titleLower.includes('base') || titleLower.includes('motor')) targetSlug = 'base';
    else if (titleLower.includes('volante') || titleLower.includes('arco') || titleLower.includes('wheel')) targetSlug = 'volantes';
    else if (titleLower.includes('pedal') || titleLower.includes('pedais') || titleLower.includes('embreagem')) targetSlug = 'pedais';
    else if (titleLower.includes('pc') || titleLower.includes('computador')) targetSlug = 'pc';
    else targetSlug = 'acessorios'; // Fallback for things like suportes, tapetes, luvas, etc.
    
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
