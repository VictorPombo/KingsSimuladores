/**
 * Script de Migração: Kings Simuladores (Loja Integrada) → Supabase
 * 
 * Extrai dados diretamente do site público via sitemap + scraping HTML.
 * NÃO altera absolutamente nada na loja original.
 * Apenas LÊ as páginas públicas e insere no nosso banco Supabase.
 * 
 * COMO USAR:
 * npx dotenv -e .env.local -- npx tsx scripts/migrate-from-site.ts
 */

import { createClient } from '@supabase/supabase-js'

const STORE_URL = 'https://www.kingssimuladores.com.br'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas.')
  console.error('   Use: npx dotenv -e .env.local -- npx tsx scripts/migrate-from-site.ts')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// ── PASSO 1: Extrair URLs dos produtos do sitemap ──
async function getProductUrls(): Promise<string[]> {
  console.log('🗺️  Lendo sitemap de produtos...')
  const res = await fetch(`${STORE_URL}/sitemap/product-1.xml`)
  const xml = await res.text()
  
  const urls: string[] = []
  const matches = xml.matchAll(/<loc>([^<]+)<\/loc>/g)
  for (const match of matches) {
    const url = match[1]
    if (url !== STORE_URL && !url.includes('/sitemap/')) {
      urls.push(url)
    }
  }
  
  console.log(`   ✅ ${urls.length} URLs de produtos encontradas.`)
  return urls
}

// ── PASSO 2: Extrair dados de cada produto via HTML ──
async function scrapeProduct(url: string): Promise<any | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const html = await res.text()

    // Nome do produto
    const nameMatch = html.match(/itemprop="name">(.*?)<\/h1>/s)
      || html.match(/<h1[^>]*class="nome-produto[^"]*"[^>]*itemprop="name">(.*?)<\/h1>/s)
    const name = nameMatch ? nameMatch[1].trim().replace(/<[^>]*>/g, '') : ''

    // Preço
    const priceMatch = html.match(/var produto_preco = ([0-9.]+);/)
    const price = priceMatch ? parseFloat(priceMatch[1]) : 0

    // Preço promocional
    const promoPriceMatch = html.match(/var produto_preco_venda = ([0-9.]+);/)
    const promoPrice = promoPriceMatch ? parseFloat(promoPriceMatch[1]) : 0

    // SKU
    const skuMatch = html.match(/itemprop="sku">([^<]*)</)
    const sku = skuMatch ? skuMatch[1].trim() : ''

    // Imagem principal
    const imgMatch = html.match(/id="imagemProduto"[^>]*src="([^"]*)"/)
      || html.match(/src="(https:\/\/cdn\.awsli\.com\.br\/600x1000\/[^"]*)"/)
    const imageUrl = imgMatch ? imgMatch[1] : ''

    // Descrição
    const descMatch = html.match(/class="descricao-produto"[^>]*>([\s\S]*?)<\/div>/i)
      || html.match(/itemprop="description"[^>]*>([\s\S]*?)<\/[^>]*>/i)
    const description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim().slice(0, 2000) : ''

    // Marca
    const brandMatch = html.match(/itemprop="name" content="([^"]*)"/)
    const brand = brandMatch ? brandMatch[1].trim() : 'Kings Simuladores'

    // Disponibilidade (verificar se está esgotado)
    const soldOut = html.includes('Esgotado') || html.includes('esgotado') || html.includes('Indisponível')

    // Gerar slug a partir da URL
    const urlSlug = url.replace(STORE_URL + '/', '').replace(/\/$/, '')

    if (!name) return null

    return {
      title: name,
      price: promoPrice > 0 && promoPrice < price ? promoPrice : price,
      comparePrice: promoPrice > 0 && promoPrice < price ? price : null,
      sku,
      imageUrl,
      description,
      brand,
      slug: urlSlug || slugify(name),
      isActive: !soldOut && price > 0,
      originalUrl: url,
    }
  } catch (err: any) {
    console.error(`   ⚠️ Erro ao ler ${url}: ${err.message}`)
    return null
  }
}

// ── PASSO 3: Inserir no Supabase ──
async function main() {
  console.log('═══════════════════════════════════════════')
  console.log('  MIGRAÇÃO: kingssimuladores.com.br → Supabase')
  console.log('  ⚠️  SOMENTE LEITURA no site antigo')
  console.log('  ⚠️  Nenhuma alteração na loja original')
  console.log('═══════════════════════════════════════════\n')

  // 1. Buscar brand_id
  const { data: kingsBrand } = await supabase
    .from('brands')
    .select('id')
    .eq('name', 'kings')
    .single()

  if (!kingsBrand) {
    console.error('❌ Brand "kings" não encontrada. Rode as migrations primeiro.')
    process.exit(1)
  }

  // 2. Extrair URLs do sitemap
  const urls = await getProductUrls()

  // 3. Scrape cada produto
  let imported = 0, skipped = 0, errors = 0

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    console.log(`[${i + 1}/${urls.length}] ${url.split('/').pop()}...`)

    const product = await scrapeProduct(url)
    if (!product || !product.title || product.price <= 0) {
      skipped++
      continue
    }

    // 4. Upsert no Supabase
    const { error } = await supabase.from('products').upsert({
      brand_id: kingsBrand.id,
      title: product.title,
      description: product.description,
      slug: product.slug,
      price: product.price,
      price_compare: product.comparePrice,
      stock: product.isActive ? 10 : 0, // Estoque padrão (ajustar manualmente depois)
      sku: product.sku || product.slug,
      cnpj_emitente: '',
      status: product.isActive ? 'active' : 'draft',
      images: product.imageUrl ? [product.imageUrl] : [],
      attributes: {
        brand: product.brand,
        source: 'loja_integrada',
        original_url: product.originalUrl,
      },
    }, { onConflict: 'slug' })

    if (error) {
      console.error(`   ❌ ${product.title}: ${error.message}`)
      errors++
    } else {
      imported++
    }

    // Rate limiting — 500ms entre requests para não pesar no site
    await new Promise(r => setTimeout(r, 500))
  }

  console.log('\n═══════════════════════════════════════════')
  console.log(`  ✅ Importados: ${imported}`)
  console.log(`  ⏭️  Pulados: ${skipped}`)
  console.log(`  ❌ Erros: ${errors}`)
  console.log(`  📊 Total: ${urls.length}`)
  console.log('═══════════════════════════════════════════')
  console.log('\n📋 Verifique: Supabase Dashboard → Table Editor → products')
  console.log('⚠️  Ajuste o campo "stock" manualmente para os valores reais de estoque.')
}

main()
