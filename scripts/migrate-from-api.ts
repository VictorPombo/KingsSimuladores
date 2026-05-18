/**
 * Script de Migração via API: Loja Integrada → Supabase
 * 
 * Puxa TODOS os produtos diretamente da API da Loja Integrada
 * e insere no nosso Supabase. NÃO altera nada na loja original.
 * 
 * COMO USAR:
 * 1. Preencher LOJA_INTEGRADA_API_KEY abaixo
 * 2. Rodar: npx dotenv -e .env.local -- npx tsx scripts/migrate-from-api.ts
 */

import { createClient } from '@supabase/supabase-js'

// ═══════════════════════════════════════════════════
// CONFIGURAÇÃO — Preencher antes de rodar
// ═══════════════════════════════════════════════════
const LOJA_INTEGRADA_API_KEY = process.env.LOJA_INTEGRADA_API_KEY || 'PREENCHER_AQUI'
const API_BASE = 'https://api.lojaintegrada.com.br/v1'

// Supabase (puxado do .env.local automaticamente)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas.')
  console.error('   Use: npx dotenv -e .env.local -- npx tsx scripts/migrate-from-api.ts')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ── Helpers ──
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function fetchFromLojaIntegrada(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${API_BASE}${endpoint}`)
  url.searchParams.set('chave_api', LOJA_INTEGRADA_API_KEY)
  url.searchParams.set('formato', 'json')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), {
    headers: {
      'Authorization': `chave_api ${LOJA_INTEGRADA_API_KEY}`,
      'Content-Type': 'application/json',
    }
  })

  if (!res.ok) {
    throw new Error(`API Error ${res.status}: ${await res.text()}`)
  }

  return res.json()
}

// ── Buscar todos os produtos paginados ──
async function fetchAllProducts() {
  const allProducts: any[] = []
  let offset = 0
  const limit = 50
  let hasMore = true

  console.log('📦 Buscando produtos da Loja Integrada...')

  while (hasMore) {
    try {
      const data = await fetchFromLojaIntegrada('/produto', {
        limit: String(limit),
        offset: String(offset),
      })

      const products = data.objects || data || []
      
      if (Array.isArray(products) && products.length > 0) {
        allProducts.push(...products)
        console.log(`   Página ${Math.floor(offset / limit) + 1}: ${products.length} produtos (total: ${allProducts.length})`)
        offset += limit
        
        // Se veio menos que o limite, não tem mais páginas
        if (products.length < limit) {
          hasMore = false
        }
      } else {
        hasMore = false
      }
    } catch (err: any) {
      console.error(`   ⚠️ Erro na página ${Math.floor(offset / limit) + 1}:`, err.message)
      hasMore = false
    }

    // Rate limiting — esperar 500ms entre requests
    await new Promise(r => setTimeout(r, 500))
  }

  return allProducts
}

// ── Buscar detalhes de um produto (fotos, descrição completa) ──
async function fetchProductDetail(productId: string | number) {
  try {
    return await fetchFromLojaIntegrada(`/produto/${productId}`)
  } catch {
    return null
  }
}

// ── Main ──
async function main() {
  console.log('═══════════════════════════════════════')
  console.log('  MIGRAÇÃO: Loja Integrada → Supabase')
  console.log('  ⚠️  Apenas LENDO da loja antiga')
  console.log('  ⚠️  Nada será alterado na loja anterior')
  console.log('═══════════════════════════════════════\n')

  // 1. Buscar brand_id da Kings
  const { data: kingsBrand } = await supabase
    .from('brands')
    .select('id')
    .eq('name', 'kings')
    .single()

  if (!kingsBrand) {
    console.error('❌ Brand "kings" não encontrada. Rode as migrations do Supabase primeiro.')
    process.exit(1)
  }

  // 2. Puxar todos os produtos
  const products = await fetchAllProducts()
  console.log(`\n✅ ${products.length} produtos encontrados na Loja Integrada.\n`)

  let imported = 0
  let skipped = 0
  let errors = 0

  for (const product of products) {
    try {
      // Buscar detalhes completos (fotos etc)
      const detail = await fetchProductDetail(product.id) || product

      const title = detail.nome || product.nome || ''
      const description = detail.descricao_completa || detail.descricao || product.descricao || ''
      const price = parseFloat(detail.preco_cheio || detail.preco || product.preco || '0')
      const salePrice = parseFloat(detail.preco_promocional || product.preco_promocional || '0')
      const stock = parseInt(detail.estoque || product.estoque || '0')
      const sku = detail.sku || product.sku || ''
      const isActive = detail.ativo !== false && product.ativo !== false

      // Imagens
      const images: string[] = []
      if (detail.imagens && Array.isArray(detail.imagens)) {
        for (const img of detail.imagens) {
          if (img.grande || img.url || img.media) {
            images.push(img.grande || img.url || img.media)
          }
        }
      } else if (detail.imagem_principal) {
        images.push(typeof detail.imagem_principal === 'string' ? detail.imagem_principal : detail.imagem_principal.grande || '')
      }

      // Categoria
      const categoryName = detail.categorias?.[0]?.nome || detail.categoria || ''

      if (!title || title === 'Sem nome') {
        skipped++
        continue
      }

      const slug = slugify(title)

      const { error } = await supabase.from('products').upsert({
        brand_id: kingsBrand.id,
        title,
        description: description.replace(/<[^>]*>/g, ''), // Limpar HTML
        slug,
        price: salePrice > 0 && salePrice < price ? salePrice : price,
        price_compare: salePrice > 0 && salePrice < price ? price : null,
        stock,
        sku: sku || slug,
        cnpj_emitente: '', // Preencher depois
        status: isActive && stock > 0 ? 'active' : 'draft',
        images: images.filter(Boolean),
        attributes: {
          category: categoryName,
          source: 'loja_integrada',
          original_id: product.id,
        },
      }, { onConflict: 'slug' })

      if (error) {
        console.error(`   ⚠️ Erro "${title}":`, error.message)
        errors++
      } else {
        imported++
        if (imported % 10 === 0) {
          console.log(`   ✅ ${imported} produtos importados...`)
        }
      }

      // Rate limiting
      await new Promise(r => setTimeout(r, 300))

    } catch (err: any) {
      console.error(`   ❌ Erro fatal:`, err.message)
      errors++
    }
  }

  console.log('\n═══════════════════════════════════════')
  console.log(`✅ Importados com sucesso: ${imported}`)
  console.log(`⏭️  Pulados (sem nome/inválido): ${skipped}`)
  console.log(`❌ Erros: ${errors}`)
  console.log(`📊 Total processado: ${products.length}`)
  console.log('═══════════════════════════════════════')
  console.log('\n📋 Próximo passo: Verifique os produtos no Supabase Dashboard → Table Editor → products')
}

main()
