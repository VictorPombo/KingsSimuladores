import { NextResponse } from 'next/server'
import { calculateShipping } from '@kings/shipping'
import { createServerSupabaseClient } from '@kings/db/server'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { toPostalCode, items, dimensions: rawDimensions } = await request.json()

    if (!toPostalCode) {
      return NextResponse.json({ error: 'CEP ausente.' }, { status: 400 })
    }
    if ((!items || items.length === 0) && (!rawDimensions || rawDimensions.length === 0)) {
      return NextResponse.json({ error: 'Itens ou dimensões ausentes.' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // 1. Puxa Dados Verdadeiros do Banco
    const productIds = items.map((i: any) => i.id)
    const { data: dbProducts } = await supabase
      .from('products')
      .select('id, weight_kg, dimensions_cm, price')
      .in('id', productIds)

    // Se for MSU, puxamos do marketplace_listings (caso não venham em products)
    const missingIds = productIds.filter((id: string) => !dbProducts?.some((p: any) => p.id === id) && !id.startsWith('mock-'))
    let dbListings: any[] | null = null
    if (missingIds.length > 0) {
       const { data } = await supabase
         .from('marketplace_listings')
         .select('id, price') // Simuladores usados podem não ter dimensões guardadas separadamente dependendo do setup, usaremos callback base.
         .in('id', missingIds)
       dbListings = data
    }

    // 2. Mapeamento Cego (Ignorando tudo que veio do Front exceto a Quantity)
    let dimensions = rawDimensions || []
    
    if (items && items.length > 0) {
      dimensions = items.map((clientItem: any) => {
         const dbProd = dbProducts?.find((p: any) => p.id === clientItem.id)
         const dbList = dbListings?.find((p: any) => p.id === clientItem.id)
         
         const w = Number(dbProd?.weight_kg || 15) // simulador pesado padrão
         const dims = dbProd?.dimensions_cm || { width: 50, height: 50, length: 50 }
         const price = Number(dbProd?.price || dbList?.price || 1)
         
         return {
           weight: w,
           width: dims.width || 50,
           height: dims.height || 50,
           length: dims.length || 50,
           quantity: clientItem.quantity || 1,
           insurance_value: price * (clientItem.quantity || 1)
         }
      })
    }

    // O CEP de origem padrão da KingsHub: 01001-000 (Sé, São Paulo)
    const fromPostalCode = process.env.ORIGIN_CEP || '01001000'

    const options = await calculateShipping(fromPostalCode, toPostalCode, dimensions)
    
    return NextResponse.json({ options })
  } catch (error) {
    console.error('[API Shipping Error]', error)
    return NextResponse.json({ error: 'Erro ao calcular frete' }, { status: 500 })
  }
}
