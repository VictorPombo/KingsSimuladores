/**
 * Script de Migração: Loja Integrada → Supabase
 * 
 * COMO USAR:
 * 1. Exportar CSV de produtos da Loja Integrada (Produtos → Exportar)
 * 2. Salvar o arquivo como "produtos_loja_integrada.csv" nesta mesma pasta
 * 3. Rodar: npx tsx scripts/migrate-products.ts
 * 
 * SEGURANÇA:
 * - Este script NÃO afeta a loja antiga de nenhuma forma
 * - Ele apenas LEIA o CSV e INSERE no Supabase (nossa base nova)
 * - Pode ser rodado múltiplas vezes (ele faz upsert por SKU/slug)
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Carrega variáveis de ambiente do .env.local
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não encontradas.')
  console.error('   Rode com: npx dotenv -e ../../.env.local -- tsx scripts/migrate-products.ts')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ── Parser básico de CSV ──
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  // Detecta separador (Loja Integrada usa ; ou ,)
  const separator = lines[0].includes(';') ? ';' : ','
  const headers = lines[0].split(separator).map(h => h.trim().replace(/^"|"$/g, ''))

  return lines.slice(1).map(line => {
    const values = line.split(separator).map(v => v.trim().replace(/^"|"$/g, ''))
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = values[i] || '' })
    return obj
  })
}

// ── Gerar slug único a partir do nome ──
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function main() {
  const csvPath = path.join(__dirname, 'produtos_loja_integrada.csv')

  if (!fs.existsSync(csvPath)) {
    console.error('❌ Arquivo "produtos_loja_integrada.csv" não encontrado nesta pasta.')
    console.error('   Exporte da Loja Integrada e salve aqui: ' + csvPath)
    process.exit(1)
  }

  console.log('📦 Lendo CSV de produtos...')
  const content = fs.readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(content)
  console.log(`   Encontrados ${rows.length} produtos no CSV.`)

  // Buscar o brand_id da Kings
  const { data: kingsBrand } = await supabase
    .from('brands')
    .select('id')
    .eq('name', 'kings')
    .single()

  if (!kingsBrand) {
    console.error('❌ Brand "kings" não encontrada no Supabase. Rode as migrations primeiro.')
    process.exit(1)
  }

  let imported = 0
  let skipped = 0
  let errors = 0

  for (const row of rows) {
    try {
      // Mapear colunas do CSV da Loja Integrada para nossa tabela
      // Os nomes exatos das colunas serão ajustados quando virmos o CSV real
      const title = row['Nome'] || row['nome'] || row['Produto'] || row['title'] || ''
      const price = parseFloat((row['Preço'] || row['preco'] || row['Preço Venda'] || row['price'] || '0').replace(',', '.'))
      const comparePrice = parseFloat((row['Preço Comparativo'] || row['Preço De'] || row['compare_at_price'] || '0').replace(',', '.'))
      const stock = parseInt(row['Estoque'] || row['estoque'] || row['Quantidade'] || '0')
      const description = row['Descrição'] || row['descricao'] || row['Descrição Curta'] || ''
      const sku = row['SKU'] || row['sku'] || row['Código'] || ''
      const imageUrl = row['Imagem'] || row['imagem'] || row['URL Imagem'] || ''
      const category = row['Categoria'] || row['categoria'] || ''

      if (!title || price <= 0) {
        skipped++
        continue
      }

      const slug = slugify(title)

      const { error } = await supabase.from('products').upsert({
        brand_id: kingsBrand.id,
        title,
        description,
        slug,
        price,
        price_compare: comparePrice > 0 ? comparePrice : null,
        stock,
        sku: sku || slug,
        cnpj_emitente: '', // Será preenchido depois
        status: stock > 0 ? 'active' : 'draft',
        images: imageUrl ? [imageUrl] : [],
        attributes: { category, source: 'loja_integrada' },
      }, { onConflict: 'slug' })

      if (error) {
        console.error(`   ⚠️ Erro no produto "${title}":`, error.message)
        errors++
      } else {
        imported++
      }
    } catch (err: any) {
      console.error(`   ❌ Erro fatal:`, err.message)
      errors++
    }
  }

  console.log('\n═══════════════════════════════════════')
  console.log(`✅ Importados: ${imported}`)
  console.log(`⏭️  Pulados (sem nome/preço): ${skipped}`)
  console.log(`❌ Erros: ${errors}`)
  console.log(`📊 Total processado: ${rows.length}`)
  console.log('═══════════════════════════════════════')
}

main()
