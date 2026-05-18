/**
 * supabase/seeds/add_missing_six.ts
 *
 * Adiciona os 6 produtos da Tray que não estavam no JSON original do seed.
 * Produto com preço confirmado (Alpha EVO Pro 18nm) entra como 'active'.
 * Os 5 restantes entram como 'draft' até o Felipe confirmar os preços.
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const MISSING_PRODUCTS = [
  {
    tray_id: '37',
    nome: 'Base Simagic Alpha EVO Pro 18nm - Base Direct Drive',
    preco: 8500,
    estoque: 2,
    categoria: 'Base',
    marca: 'Simagic',
    peso: '12',
    status: 'active',
    imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/base_simagic_alpha_evo_pro_18nm_base_direct_drive_37_1_5870523884ddc8bb2d4ad500645d73a4.jpg'
  },
  {
    tray_id: '91',
    nome: 'Volante Simagic FX Pro',
    preco: 0,
    estoque: 0,
    categoria: 'Volante',
    marca: 'Simagic',
    peso: '2',
    status: 'draft',
    imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/volante_simagic_fx_pro_91_1_bc59ef4c63dfff7fc6cf1eeff62b7b03.jpg'
  },
  {
    tray_id: '95',
    nome: 'Volante Simagic GT NEO',
    preco: 0,
    estoque: 0,
    categoria: 'Volante',
    marca: 'Simagic',
    peso: '2',
    status: 'draft',
    imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/volante_simagic_gt_neo_95_1_9e79c10e599f8325049cec2dd44663e9.jpg'
  },
  {
    tray_id: '103',
    nome: 'Base Simagic Alpha EVO 12nm - Base Direct Drive',
    preco: 0,
    estoque: 0,
    categoria: 'Base',
    marca: 'Simagic',
    peso: '10',
    status: 'draft',
    imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/base_simagic_alpha_evo_12nm_base_direct_drive_103_1_3056e355bb65b4cc96c4586f8f0f358b.jpg'
  },
  {
    tray_id: '109',
    nome: 'Pedais Simagic P1000 (3 pedais) com Célula de Carga',
    preco: 0,
    estoque: 0,
    categoria: 'Pedal',
    marca: 'Simagic',
    peso: '5',
    status: 'draft',
    imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/pedais_simagic_p1000_3_pedais_com_celula_de_carga_109_1_9f8df9acaa4121e6f6d864101a84754b.jpg'
  },
  {
    tray_id: '115',
    nome: 'Fonte de Alimentação para Pedais (P-HPR, P-SRB E S-RH)',
    preco: 0,
    estoque: 0,
    categoria: 'Acessórios e Periféricos',
    marca: 'Simagic',
    peso: '0.5',
    status: 'draft',
    imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/fonte_de_alimentacao_para_pedais_p_hpr_p_srb_e_s_rh_115_1_c7d7f5c89622ebecd68eeec5a3261db4.jpg'
  }
]

async function main() {
  console.log('📦 Adicionando os 6 produtos faltantes da Seven...\n')

  // 1. Brand ID
  const { data: brand } = await supabase
    .from('brands')
    .select('id')
    .eq('name', 'seven')
    .single()

  if (!brand) throw new Error("Brand 'seven' não encontrada")

  let inserted = 0
  let skipped = 0

  for (const p of MISSING_PRODUCTS) {
    // Verificar se já existe
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('tray_id', p.tray_id)
      .eq('brand_id', brand.id)
      .single()

    if (existing) {
      console.log(`  ⏭️  Já existe: "${p.nome}"`)
      skipped++
      continue
    }

    // Buscar categoria
    const catSlug = slugify(p.categoria)
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', catSlug)
      .eq('brand_scope', 'seven')
      .single()

    const slug = slugify(p.nome) + '-' + p.tray_id

    const { error } = await supabase.from('products').insert({
      brand_id: brand.id,
      category_id: cat?.id || null,
      title: p.nome,
      description: `Produto importado da Tray: ${p.nome}`,
      slug,
      price: p.preco,
      stock: p.estoque,
      sku: `SEVEN-${p.tray_id}`,
      cnpj_emitente: '00.000.000/0003-00',
      status: p.status,
      images: [p.imagem],
      attributes: { marca: p.marca },
      tray_id: p.tray_id,
      weight_kg: parseFloat(p.peso)
    })

    if (error) {
      console.log(`  ❌ Erro: "${p.nome}" → ${error.message}`)
    } else {
      const tag = p.status === 'draft' ? '(DRAFT - preço pendente)' : '(ATIVO ✅)'
      console.log(`  ✔  "${p.nome}" ${tag}`)
      inserted++
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ Inseridos : ${inserted}`)
  console.log(`⏭️  Já existiam: ${skipped}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`\n💡 Os 5 produtos com preço pendente estão como DRAFT.`)
  console.log(`   Quando o Felipe confirmar os preços, altere-os em /admin/produtos e mude o status para "active".`)
}

main().catch(err => {
  console.error('💥 Falhou:', err)
  process.exit(1)
})
