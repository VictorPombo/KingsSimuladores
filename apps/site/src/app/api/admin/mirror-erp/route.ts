import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db'

/**
 * POST /api/admin/mirror-erp
 * 
 * Sincronização Absoluta (Clone): Olist → KingsHub
 * 1. Busca todos os produtos ativos na Olist.
 * 2. Busca todos os produtos ativos/rascunhos no KingsHub.
 * 3. Cruza os dados:
 *    - Se existe na Olist e NÃO no KingsHub -> CRIA no KingsHub (como Rascunho).
 *    - Se existe no KingsHub e NÃO na Olist -> EXCLUI no KingsHub (Apenas loja oficial).
 *    - Se existe em ambos -> Atualiza o preço no KingsHub.
 */
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // remove diacritics
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-') // replace spaces with dashes
    .replace(/[^\w\-]+/g, '') // remove non-word chars
    .replace(/\-\-+/g, '-') // replace multiple dashes with single dash
    .replace(/^-+/, '') // trim dash from start
    .replace(/-+$/, '') // trim dash from end
}

export async function POST() {
  try {
    const supabase = createAdminClient()
    const token = process.env.OLIST_API_KEY_KINGS
    
    if (!token) {
      return NextResponse.json({ error: 'Token do Tiny ERP não configurado.' }, { status: 500 })
    }

    // Buscar o ID da marca 'kings' para usar como padrão nos novos produtos
    const { data: brandData } = await supabase.from('brands').select('id').eq('name', 'kings').single()
    const defaultBrandId = brandData?.id

    // 1. Buscar TODOS os SKUs da Olist (paginado)
    const olistProducts = new Map<string, any>()
    let page = 1
    let hasMore = true

    console.log('[Mirror ERP] Iniciando busca total no Tiny ERP...')

    while (hasMore) {
      const params = new URLSearchParams()
      params.append('token', token)
      params.append('formato', 'json')
      params.append('pagina', String(page))

      const res = await fetch('https://api.tiny.com.br/api2/produtos.pesquisa.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      })

      const data = await res.json()

      if (data.retorno?.status === 'OK' && data.retorno?.produtos) {
        const prods = data.retorno.produtos
        prods.forEach((p: any) => {
          if (p.produto.codigo) {
            olistProducts.set(p.produto.codigo, {
              id_erp: p.produto.id,
              title: p.produto.nome,
              price: Number(p.produto.preco_promocional) > 0 ? Number(p.produto.preco_promocional) : Number(p.produto.preco),
              sku: p.produto.codigo
            })
          }
        })

        if (prods.length < 100) {
          hasMore = false
        } else {
          page++
          await new Promise(r => setTimeout(r, 600)) // Rate limit protection
        }
      } else {
        hasMore = false
      }
    }

    console.log(`[Mirror ERP] Concluído: ${olistProducts.size} SKUs encontrados na Olist.`)

    // 2. Buscar produtos no KingsHub
    const { data: kingsProducts, error } = await supabase
      .from('products')
      .select('id, title, sku, status, price, brand_id, brands!brand_id(name)')
      .neq('status', 'archived') // Busca ativos e rascunhos

    if (error || !kingsProducts) {
      return NextResponse.json({ error: 'Erro ao buscar produtos no banco de dados local.' }, { status: 500 })
    }

    const kingsSkuMap = new Map<string, any>()
    kingsProducts.forEach((p: any) => {
      if (p.sku) kingsSkuMap.set(p.sku, p)
    })

    const results: any[] = []
    let createdCount = 0
    let updatedCount = 0
    let deletedCount = 0
    let skippedCount = 0

    // 3. Processar Criações e Atualizações (Olist -> KingsHub)
    for (const olistProd of Array.from(olistProducts.values())) {
      const kingsProd = kingsSkuMap.get(olistProd.sku)

      if (!kingsProd) {
        // Cenário A: Criar novo (como Rascunho)
        const slug = slugify(`${olistProd.title}-${olistProd.sku}`)

        // Busca dados enriquecidos da Olist
        let richData: any = {}
        try {
          const fetchParams = new URLSearchParams()
          fetchParams.append('token', token)
          fetchParams.append('formato', 'json')
          fetchParams.append('id', olistProd.id_erp)

          // Rate limit safe guard before obtaining individual product
          await new Promise(r => setTimeout(r, 600))

          const richRes = await fetch('https://api.tiny.com.br/api2/produto.obter.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: fetchParams.toString()
          })
          const richJson = await richRes.json()
          if (richJson.retorno?.status === 'OK' && richJson.retorno?.produto) {
            richData = richJson.retorno.produto
          }
        } catch (e) {
          console.error(`Falha ao buscar dados enriquecidos para ${olistProd.sku}`, e)
        }

        // Formata imagens se existirem
        let imagesArray = []
        if (richData.anexos && Array.isArray(richData.anexos)) {
          imagesArray = richData.anexos.map((a: any) => a.anexo).filter(Boolean)
        }

        const { data: newProd, error: insertErr } = await supabase.from('products').insert({
          title: olistProd.title,
          sku: olistProd.sku,
          slug: slug,
          price: olistProd.price,
          status: 'draft',
          brand_id: defaultBrandId,
          cnpj_emitente: '', // Fallback para não dar erro de constraint
          ncm: richData.ncm || null,
          ean: (richData.gtin && richData.gtin !== 'Não especifica') ? richData.gtin : null,
          weight_kg: richData.peso_bruto ? Number(richData.peso_bruto) : null,
          description: richData.descricao_complementar || null,
          images: imagesArray,
          tray_id: olistProd.id_erp // Salva o ID original da Tiny como referência
        }).select('id').single()

        if (insertErr) {
          results.push({ sku: olistProd.sku, title: olistProd.title, status: 'error', message: `Erro ao criar: ${insertErr.message}` })
        } else {
          createdCount++
          results.push({ sku: olistProd.sku, title: olistProd.title, status: 'ok', message: 'Produto CRIADO como Rascunho.' })
          console.log(`[Mirror ERP] ➕ Criado: ${olistProd.title}`)
        }
      } else {
        // Cenário C: Atualizar preço se diferente
        if (Number(kingsProd.price) !== olistProd.price) {
          const { error: updateErr } = await supabase.from('products').update({
            price: olistProd.price
          }).eq('id', kingsProd.id)

          if (updateErr) {
            results.push({ sku: olistProd.sku, title: kingsProd.title, status: 'error', message: `Erro ao atualizar preço: ${updateErr.message}` })
          } else {
            updatedCount++
            results.push({ sku: olistProd.sku, title: kingsProd.title, status: 'updated', message: `Preço ATUALIZADO para R$ ${olistProd.price}` })
          }
        } else {
          skippedCount++
        }
      }
      
      // Delay to respect Olist API rate limits
      await new Promise(r => setTimeout(r, 600))
    }

    // 4. Processar Exclusões (KingsHub -> Olist)
    for (const kingsProd of kingsProducts) {
      if (kingsProd.sku && !olistProducts.has(kingsProd.sku)) {
        // Cenário B: Órfão
        const brandName = (kingsProd as any).brands?.name || 'kings'
        const isOfficialStore = brandName === 'Kings Simuladores' || brandName === 'kings' || brandName === 'Seven Sim Racing' || brandName === 'seven'
        
        if (isOfficialStore) {
          const { error: deleteErr } = await supabase.from('products').delete().eq('id', kingsProd.id)
          
          if (deleteErr) {
            results.push({ sku: kingsProd.sku, title: kingsProd.title, status: 'error', message: `Erro ao excluir: ${deleteErr.message}` })
          } else {
            deletedCount++
            results.push({ sku: kingsProd.sku, title: kingsProd.title, status: 'ok', message: 'Órfão EXCLUÍDO definitivamente.' })
            console.log(`[Mirror ERP] 🗑️ Excluído: ${kingsProd.title}`)
          }
        } else {
          // Mantém produtos do MSU intocados
          skippedCount++
        }
      }
      
      // Delay
      await new Promise(r => setTimeout(r, 200))
    }

    const errorCount = results.filter(r => r.status === 'error').length

    return NextResponse.json({
      total: createdCount + updatedCount + deletedCount + skippedCount + errorCount,
      success: createdCount + updatedCount + deletedCount,
      errors: errorCount,
      created: createdCount,
      updated: updatedCount,
      deleted: deletedCount,
      alreadyClean: skippedCount,
      isCloneResult: true,
      results
    })

  } catch (err: any) {
    console.error('[Mirror ERP] Erro fatal:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
