import { NextRequest, NextResponse } from 'next/server'

/**
 * Payload Interno Mapeado da KingsHub
 */
interface KingsProductPayload {
  kings_id: string
  title: string
  sku: string | null
  price: number
  price_compare: number | null
  stock: number
  ncm: string
  ean: string
  weight_kg: number
  dimensions: {
    width: number
    height: number
    length: number
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload: KingsProductPayload = await req.json()

    // Validações Rígidas de Autenticação Olist (Sandbox mode)
    const OLIST_TOKEN = process.env.OLIST_ACCESS_TOKEN || 'SANDBOX_MODE_ACTIVE'
    
    console.log('[Olist Sync] Iniciando empacotamento do produto:', payload.title)

    // Olist API v1 Standard Payload Mapper
    const olistPayload = {
      sku: payload.sku || `KINGS-${payload.kings_id.slice(0, 8).toUpperCase()}`,
      gtin: payload.ean,
      title: payload.title,
      price: payload.price,
      stock: payload.stock,
      ncm: payload.ncm,
      weight: payload.weight_kg,
      dimensions: {
        width: payload.dimensions.width,
        height: payload.dimensions.height,
        length: payload.dimensions.length,
      },
      // Promotional price se existir
      ...(payload.price_compare && {
        promotional_price: payload.price
      })
    }

    // Se estivermos em produção sem a chave, bloqueia. Se tiver chave ou Sandbox, prossegue.
    if (!process.env.OLIST_ACCESS_TOKEN && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Configuração Incompleta: OLIST_ACCESS_TOKEN ausente.' }, { status: 500 })
    }

    console.log('[Olist Sync] Payload Convertido e Homologado:', JSON.stringify(olistPayload, null, 2))

    let olistResponseId = `sandbox_${Date.now()}`
    
    if (!process.env.OLIST_ACCESS_TOKEN || process.env.OLIST_ACCESS_TOKEN === 'SANDBOX_MODE_ACTIVE') {
      console.log('[Olist Sync] Sandbox mode: simulando integração com sucesso sem disparar API real.')
      await new Promise((resolve) => setTimeout(resolve, 800))
    } else {
      console.log('[Olist Sync] Disparando requisição real para api.olist.com...')
      const response = await fetch('https://api.olist.com/v1/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OLIST_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(olistPayload)
      })
      
      const resData = await response.json().catch(() => ({}))
      
      if (!response.ok) {
        console.error('[Olist Sync] Olist API rejeitou o payload:', resData)
        throw new Error(`Olist API Error: ${response.status} - ${JSON.stringify(resData)}`)
      }
      
      olistResponseId = resData.id || `erp_sync_${Date.now()}`
      console.log('[Olist Sync] Sucesso! ID Olist:', olistResponseId)
    }

    return NextResponse.json({
      success: true,
      message: 'Produto sincronizado com sucesso nos Marketplaces via Hub ERP Olist.',
      api_response_id: olistResponseId
    }, { status: 200 })

  } catch (err: any) {
    console.error('[Olist Sync] Erro Fatal:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 400 })
  }
}
