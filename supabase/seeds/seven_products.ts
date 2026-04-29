import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas.')
  console.error('   Rode com: npx dotenv -e .env.local -- bun supabase/seeds/seven_products.ts')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const sevenProductsData = [
  {"tray_id":"159853","nome":"Simagic Alpha EVO Sport 9 Nm Base Direct Drive","preco":"5450","estoque":8,"disponivel":true,"categoria":"Base","marca":"Simagic","peso":"8","imagem":"https://images.tcdn.com.br/img/img_prod/1433338/simagic_alpha_evo_sport_9_nm_base_direct_drive_159853_1_d52e42dde9e59f2046df8b53efaa0bef.jpg"},
  {"tray_id":"160994","nome":"Aro Simagic P-325C (Couro)","preco":"1320","estoque":2,"disponivel":true,"categoria":"Volante","marca":"Simagic","peso":"1"},
  {"tray_id":"160996","nome":"Aro Simagic P-330R (Couro)","preco":"1320","estoque":0,"disponivel":true,"categoria":"Volante","marca":"Simagic","peso":"1"},
  {"tray_id":"161003","nome":"Câmbio Sequencial Simagic Q1S","preco":"2750","estoque":5,"disponivel":true,"categoria":"Acessórios e Periféricos","marca":"Simagic","peso":"2"},
  {"tray_id":"161004","nome":"Câmbio Simagic DS-8X: Dual Mode (Padrão H e sequencial)","preco":"4730","estoque":2,"disponivel":false,"categoria":"Acessórios e Periféricos","marca":"Simagic","peso":"3"},
  {"tray_id":"161006","nome":"Embreagem Simagic C-P1000 - (Série P1000)","preco":"1650","estoque":7,"disponivel":true,"categoria":"Pedal","marca":"Simagic","peso":"0.5"},
  {"tray_id":"161007","nome":"Embreagem Simagic C-P500","preco":"1010.9","estoque":6,"disponivel":true,"categoria":"Pedal","marca":"Simagic","peso":"0.5"},
  {"tray_id":"161008","nome":"Reator de pedal Tátil linear Simagic P-HPR GT","preco":"726","estoque":1,"disponivel":true,"categoria":"Acessórios e Periféricos","marca":"Simagic","peso":"0.3"},
  {"tray_id":"161009","nome":"Freio de Mão Simagic TB-1","preco":"2249","estoque":1,"disponivel":true,"categoria":"Acessórios e Periféricos","marca":"Simagic","peso":"1.5"},
  {"tray_id":"161010","nome":"Kit de Borrachas e Molas Simagic P-ORP","preco":"392","estoque":2,"disponivel":true,"categoria":"Acessórios e Periféricos","marca":"Simagic","peso":"0.2"},
  {"tray_id":"161011","nome":"Kit de Borrachas e Molas Simagic P-ORP(H) HIDRAULICO","preco":"462","estoque":8,"disponivel":true,"categoria":"Acessórios e Periféricos","marca":"Simagic","peso":"0.2"},
  {"tray_id":"161012","nome":"Kit de Inversão Simagic P1000","preco":"2200","estoque":0,"disponivel":true,"categoria":"Acessórios e Periféricos","marca":"Simagic","peso":"1"},
  {"tray_id":"161013","nome":"Paddle Shifter Kit Simagic UP+ (NEo X / Gt Neo)","preco":"600","estoque":1,"disponivel":true,"categoria":"Acessórios e Periféricos","marca":"Simagic","peso":"0.3"},
  {"tray_id":"161016","nome":"Pedal Simagic P1000-FRS Hidráulico","preco":"6600","estoque":1,"disponivel":true,"categoria":"Pedal","marca":"Simagic","peso":"5"},
  {"tray_id":"161017","nome":"Pedal Simagic (DUPLO) P2000-S200RF","preco":"7700","estoque":1,"disponivel":true,"categoria":"Pedal","marca":"Simagic","peso":"8"},
  {"tray_id":"161018","nome":"Pedal Simagic P500 Dual Pedal","preco":"2600","estoque":3,"disponivel":true,"categoria":"Pedal","marca":"Simagic","peso":"3"},
  {"tray_id":"161019","nome":"Placa de Acelerador Longa Simagic P-L100","preco":"295.9","estoque":14,"disponivel":true,"categoria":"Acessórios e Periféricos","marca":"Simagic","peso":"0.2"},
  {"tray_id":"161020","nome":"Quick Release Simagic QR50 (50 mm)","preco":"660","estoque":9,"disponivel":true,"categoria":"Acessórios e Periféricos","marca":"Simagic","peso":"0.3"},
  {"tray_id":"161021","nome":"Quick Release Simagic QR70 (70mm)","preco":"660","estoque":23,"disponivel":true,"categoria":"Acessórios e Periféricos","marca":"Simagic","peso":"0.3"},
  {"tray_id":"161022","nome":"Simagic MagLink Adaptador (Para Bases não Simagic)","preco":"440","estoque":14,"disponivel":true,"categoria":"Acessórios e Periféricos","marca":"Simagic","peso":"0.2"},
  {"tray_id":"161023","nome":"Simagic NEO X Hub","preco":"2300","estoque":0,"disponivel":true,"categoria":"Acessórios e Periféricos","marca":"Simagic","peso":"0.5"},
  {"tray_id":"161024","nome":"Suporte de Montagem Frontal Simagic Alpha Evo","preco":"420","estoque":10,"disponivel":true,"categoria":"Acessórios e Periféricos","marca":"Simagic","peso":"0.5"},
  {"tray_id":"161027","nome":"Volante Simagic FX-C","preco":"5499","estoque":2,"disponivel":true,"categoria":"Volante","marca":"Simagic","peso":"2"},
  {"tray_id":"161029","nome":"Volante Simagic NEO X 330T - GT","preco":"4399.9","estoque":4,"disponivel":true,"categoria":"Volante","marca":"Simagic","peso":"2"},
  {"tray_id":"161030","nome":"Suporte de Montagem Lateral para Alpha EVO Simagic","preco":"300","estoque":3,"disponivel":true,"categoria":"Acessórios e Periféricos","marca":"Simagic","peso":"0.5"},
  {"tray_id":"161031","nome":"Volante Simagic NEO X 310G","preco":"4329.9","estoque":4,"disponivel":true,"categoria":"Volante","marca":"Simagic","peso":"2"},
  {"tray_id":"161034","nome":"Aro Simagic P-330R(K) (Couro)","preco":"1320","estoque":0,"disponivel":true,"categoria":"Volante","marca":"Simagic","peso":"1"},
  {"tray_id":"161038","nome":"Suporte para monitor Thermaltake GR300 até 50 Pol (Preto)","preco":"1149.9","estoque":5,"disponivel":true,"categoria":"Simuladores/Cockpits","marca":"Thermaltake","peso":"5"},
  {"tray_id":"161039","nome":"Suporte para monitor Thermaltake GR300 até 50 Pol (Branco)","preco":"1149.9","estoque":4,"disponivel":true,"categoria":"Simuladores/Cockpits","marca":"Thermaltake","peso":"5"},
  {"tray_id":"161040","nome":"Tapete de chão para simulador Thermaltake","preco":"549.9","estoque":8,"disponivel":true,"categoria":"Simuladores/Cockpits","marca":"Thermaltake","peso":"2"},
  {"tray_id":"161041","nome":"Cockpit Thermaltake GR300 Racing - Seven Racing","preco":"4649","estoque":8,"disponivel":true,"categoria":"Simuladores/Cockpits","marca":"Thermaltake","peso":"30"},
  {"tray_id":"161042","nome":"Embreagem para Pedal (P2000) - C-P2000","preco":"3000","estoque":3,"disponivel":true,"categoria":"Pedal","marca":"Simagic","peso":"0.5"},
  {"tray_id":"161043","nome":"SISTEMA HIDRAULICO P-HYS (P1000)","preco":"1700","estoque":6,"disponivel":true,"categoria":"Acessórios e Periféricos","marca":"Simagic","peso":"1"},
  {"tray_id":"161044","nome":"SUPORTE DE MESA - SIMAGIC - T-LOC","preco":"649","estoque":10,"disponivel":true,"categoria":"Acessórios e Periféricos","marca":"Simagic","peso":"1"},
  {"tray_id":"161045","nome":"Fonte de Alimentação Pedais (P-HPR, P-SRB E S-RH) - UNIVERSAL","preco":"250","estoque":2,"disponivel":true,"categoria":"Acessórios e Periféricos","marca":"Simagic","peso":"0.5"}
]

async function main() {
  console.log('📦 Iniciando importação da Seven Sim Racing...')

  // 1. Obter Brand ID
  const { data: brand } = await supabase
    .from('brands')
    .select('id')
    .eq('name', 'seven')
    .single()

  if (!brand) {
    console.error('❌ Brand "seven" não encontrada. Execute as migrations primeiro.')
    process.exit(1)
  }

  // 2. Extrair categorias únicas e criá-las
  const categoryNames = Array.from(new Set(sevenProductsData.map(p => p.categoria)))
  let createdCategories = 0

  for (const catName of categoryNames) {
    const slug = slugify(catName)
    const { data: existingCat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .eq('brand_scope', 'seven')
      .single()

    if (!existingCat) {
      const { error } = await supabase.from('categories').insert({
        name: catName,
        slug: slug,
        brand_scope: 'seven'
      })
      if (!error) createdCategories++
    }
  }

  console.log(`✅ Categorias criadas/verificadas: ${categoryNames.length} (Novas: ${createdCategories})`)

  // 3. Importar produtos
  let imported = 0
  let errors = 0

  for (const p of sevenProductsData) {
    const slug = slugify(p.nome) + '-' + p.tray_id
    
    // Obter ID da categoria recém criada/verificada
    const catSlug = slugify(p.categoria)
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', catSlug)
      .eq('brand_scope', 'seven')
      .single()

    const productPayload = {
      brand_id: brand.id,
      category_id: catData?.id || null,
      title: p.nome,
      description: `Produto importado da Tray: ${p.nome}`,
      slug: slug,
      price: parseFloat(p.preco),
      stock: parseInt(p.estoque.toString()),
      sku: `SEVEN-${p.tray_id}`,
      cnpj_emitente: '00.000.000/0003-00', // Update later
      status: p.disponivel ? 'active' : 'draft',
      images: p.imagem ? [p.imagem] : [],
      attributes: { marca: p.marca },
      tray_id: p.tray_id,
      weight_kg: parseFloat(p.peso)
    }

    const { data: existingProd } = await supabase
      .from('products')
      .select('id')
      .eq('tray_id', p.tray_id)
      .eq('brand_id', brand.id)
      .single()

    let error;
    if (existingProd) {
      const { error: updErr } = await supabase
        .from('products')
        .update(productPayload)
        .eq('id', existingProd.id)
      error = updErr
    } else {
      const { error: insErr } = await supabase
        .from('products')
        .insert(productPayload)
      error = insErr
    }

    if (error) {
      console.error(`❌ Erro ao importar ${p.nome}:`, error.message)
      errors++
    } else {
      imported++
    }
  }

  console.log('\n═══════════════════════════════════════')
  console.log(`✅ Importados com sucesso : ${imported}`)
  console.log(`❌ Falhas                  : ${errors}`)
  console.log(`✅ Categorias criadas     : ${categoryNames.length}`)
  console.log('═══════════════════════════════════════\n')
}

main().catch(console.error)
