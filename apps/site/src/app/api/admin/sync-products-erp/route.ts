import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db'

/**
 * POST /api/admin/sync-products-erp
 * 
 * Sincroniza produtos do KingsHub → Tiny ERP (Olist).
 * Envia os dados de todos os produtos selecionados para o cadastro do Tiny.
 * 
 * Body: { productIds: string[] } — IDs dos produtos a sincronizar (ou vazio para todos ativos)
 */
export async function POST(req: Request) {
  try {
    const { productIds } = await req.json()
    
    const supabase = createAdminClient()
    const token = process.env.OLIST_API_KEY_KINGS
    
    if (!token) {
      return NextResponse.json({ error: 'Token do Tiny ERP não configurado.' }, { status: 500 })
    }

    // Buscar produtos
    let query = supabase
      .from('products')
      .select('id, title, sku, price, stock, ncm, ean, weight_kg, dimensions_cm, description, status, brand_id, brands!brand_id(name)')
    
    if (productIds && productIds.length > 0) {
      query = query.in('id', productIds)
    } else {
      query = query.eq('status', 'active')
    }

    const { data: products, error } = await query

    if (error || !products || products.length === 0) {
      return NextResponse.json({ error: 'Nenhum produto encontrado para sincronizar.' }, { status: 404 })
    }

    const results: any[] = []
    let successCount = 0
    let errorCount = 0

    for (const product of products) {
      try {
        const ncm = (product.ncm || '').replace(/\D/g, '')
        const dim = product.dimensions_cm as any || {}
        const brandName = (product as any).brands?.name || 'kings'
        
        // Determinar qual token usar baseado na marca
        const storeToken = brandName === 'seven' || brandName === 'Seven Sim Racing' 
          ? (process.env.OLIST_API_KEY_SEVEN || token)
          : token

        const tinyProduto = {
          produto: {
            codigo: product.sku || product.id,
            nome: product.title,
            preco: product.price,
            preco_custo: 0,
            estoque: product.stock || 0,
            ncm: ncm,
            gtin: product.ean || 'SEM GTIN',
            peso_bruto: product.weight_kg || 0,
            peso_liquido: product.weight_kg || 0,
            largura: dim.width || 0,
            altura: dim.height || 0,
            comprimento: dim.length || 0,
            unidade: 'UN',
            origem: '0', // Nacional
            situacao: product.status === 'active' ? 'A' : 'I',
            tipo: 'P', // Produto
            classe_ipi: '',
            observacoes: product.description ? product.description.substring(0, 500) : '',
          }
        }

        const params = new URLSearchParams()
        params.append('token', storeToken)
        params.append('formato', 'json')
        params.append('produto', JSON.stringify(tinyProduto))

        const res = await fetch('https://api.tiny.com.br/api2/produto.incluir.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        })

        const data = await res.json()

        if (data.retorno?.status === 'OK') {
          const reg = Array.isArray(data.retorno.registros) 
            ? data.retorno.registros[0]?.registro 
            : data.retorno.registros?.registro

          successCount++
          results.push({ 
            id: product.id, 
            title: product.title, 
            sku: product.sku,
            status: 'ok', 
            erp_id: reg?.id,
            message: `Produto sincronizado com Tiny (ID: ${reg?.id})`
          })
          
          console.log(`[Sync ERP] ✅ ${product.title} → Tiny ID: ${reg?.id}`)
        } else if (data.retorno?.status === 'Erro') {
          const erros = data.retorno?.registros?.registro?.erros || data.retorno?.erros || []
          const errorMsg = Array.isArray(erros) 
            ? erros.map((e: any) => e.erro || e).join('; ') 
            : JSON.stringify(erros)

          // If duplicate, try to update instead
          if (errorMsg.includes('duplicidade')) {
            // Search for existing product by SKU
            const searchParams = new URLSearchParams()
            searchParams.append('token', storeToken)
            searchParams.append('formato', 'json')
            searchParams.append('pesquisa', product.sku || product.id)

            const searchRes = await fetch('https://api.tiny.com.br/api2/produtos.pesquisa.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: searchParams.toString()
            })
            const searchData = await searchRes.json()
            const existingId = searchData.retorno?.produtos?.[0]?.produto?.id

            if (existingId) {
              // Update existing product
              const updateParams = new URLSearchParams()
              updateParams.append('token', storeToken)
              updateParams.append('formato', 'json')
              updateParams.append('produto', JSON.stringify({
                produto: {
                  id: existingId,
                  ...tinyProduto.produto
                }
              }))

              const updateRes = await fetch('https://api.tiny.com.br/api2/produto.alterar.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: updateParams.toString()
              })
              const updateData = await updateRes.json()

              if (updateData.retorno?.status === 'OK') {
                successCount++
                results.push({ 
                  id: product.id, 
                  title: product.title,
                  sku: product.sku,
                  status: 'updated', 
                  erp_id: existingId,
                  message: `Produto atualizado no Tiny (ID: ${existingId})`
                })
                console.log(`[Sync ERP] 🔄 ${product.title} atualizado no Tiny (ID: ${existingId})`)
                continue
              }
            }
          }

          errorCount++
          results.push({ 
            id: product.id, 
            title: product.title,
            sku: product.sku,
            status: 'error', 
            message: errorMsg 
          })
          console.error(`[Sync ERP] ❌ ${product.title}: ${errorMsg}`)
        }

        // Rate limit: Tiny API allows ~30 requests/minute
        await new Promise(r => setTimeout(r, 2100))

      } catch (err: any) {
        errorCount++
        results.push({ 
          id: product.id, 
          title: product.title,
          sku: product.sku,
          status: 'error', 
          message: err.message 
        })
      }
    }

    return NextResponse.json({
      total: products.length,
      success: successCount,
      errors: errorCount,
      results
    })

  } catch (err: any) {
    console.error('[Sync ERP] Erro fatal:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
